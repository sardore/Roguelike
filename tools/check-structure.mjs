#!/usr/bin/env node
// Structure guard for the MANRU source. AST based (acorn) for JS, a small tokenizer for CSS.
//
//   node tools/check-structure.mjs                    fail if any ratchet metric grew
//   node tools/check-structure.mjs --update-baseline  lower the stored baseline (never raises it)
//   node tools/check-structure.mjs --report           print every violation site
//
// Rules (AGENTS.md section "구조 규칙"):
//   1 rebinding a declared function / a function-valued global or object property
//   2 aliasing a function into a variable and then rebinding the original (wrapper chain)
//   3 the same top-level function name declared in two files
//   4 CSS injected from JS (<style> elements, CSS text written from script)
//   5 one CSS selector defined in more than one rule block (media variants of one block allowed)
//   6 ratchet: !important, version-suffixed functions, empty catch, duplicate selectors, timers
//   7 functions whose normalised bodies are identical (same job under different names)
// Every metric is ratcheted against tools/structure-baseline.json: it may only go down.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const srcDir = path.join(repo, 'src');
const baselineFile = path.join(here, 'structure-baseline.json');
const args = process.argv.slice(2);

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return listFiles(p, ext);
    return p.endsWith(ext) ? [p] : [];
  }).sort();
}

const rel = (f) => path.relative(repo, f);
const violations = {};
function report(metric, file, line, detail) {
  (violations[metric] ||= []).push(`${file}:${line} ${detail}`);
}

// ---------------------------------------------------------------- sources
const jsSources = listFiles(path.join(srcDir, 'scripts'), '.js').map((f) => ({ file: rel(f), text: fs.readFileSync(f, 'utf8') }));
const cssSources = listFiles(path.join(srcDir, 'styles'), '.css').map((f) => ({ file: rel(f), text: fs.readFileSync(f, 'utf8') }));
const indexFile = path.join(srcDir, 'index.html');
if (fs.existsSync(indexFile)) {
  const html = fs.readFileSync(indexFile, 'utf8');
  const lineAt = (i) => html.slice(0, i).split('\n').length;
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    jsSources.push({ file: `src/index.html@${lineAt(m.index)}`, text: m[1], lineOffset: lineAt(m.index) - 1 });
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    cssSources.push({ file: `src/index.html@${lineAt(m.index)}`, text: m[1] });
  }
  for (const m of html.matchAll(/\sstyle="[^"]*!important/g)) report('important', 'src/index.html', lineAt(m.index), 'inline style !important');
}

// ---------------------------------------------------------------- JS
const SUFFIX = /(?:[a-z_]\d{2,}[a-z]?|[A-Za-z][Rr]\d+|[a-z][Vv]\d+)$/;
const TIMER = new Set(['setTimeout', 'requestAnimationFrame', 'setInterval', 'queueMicrotask']);
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
const topLevelNames = new Map();
const bodyIndex = new Map();

for (const src of jsSources) {
  const off = src.lineOffset || 0;
  let ast;
  try {
    ast = acorn.parse(src.text, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowHashBang: true });
  } catch (e) {
    report('parse', src.file, (e.loc?.line || 0) + off, e.message);
    continue;
  }
  const line = (n) => n.loc.start.line + off;
  const text = (n) => src.text.slice(n.start, n.end);

  // Scope model: each function / block / program owns the names declared in it.
  const scopes = new Map();
  const scopeOf = (node) => {
    if (!scopes.has(node)) scopes.set(node, new Map());
    return scopes.get(node);
  };
  const declare = (scopeNode, name, kind, init) => scopeOf(scopeNode).set(name, { kind, init });
  const patternNames = (p, out = []) => {
    if (!p) return out;
    if (p.type === 'Identifier') out.push(p.name);
    else if (p.type === 'ObjectPattern') p.properties.forEach((q) => patternNames(q.type === 'RestElement' ? q.argument : q.value, out));
    else if (p.type === 'ArrayPattern') p.elements.forEach((q) => patternNames(q, out));
    else if (p.type === 'RestElement') patternNames(p.argument, out);
    else if (p.type === 'AssignmentPattern') patternNames(p.left, out);
    return out;
  };
  const fnScope = (ancestors) => {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const a = ancestors[i];
      if (a.type === 'Program' || a.type.includes('Function')) return a.type.includes('Function') ? a.body : a;
    }
    return ast;
  };
  const blockScope = (ancestors) => {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const a = ancestors[i];
      if (a.type === 'BlockStatement' || a.type === 'Program' || a.type === 'SwitchStatement' || a.type === 'StaticBlock') return a;
      if (a.type === 'ForStatement' || a.type === 'ForInStatement' || a.type === 'ForOfStatement') return a;
    }
    return ast;
  };
  walk.ancestor(ast, {
    FunctionDeclaration(n, _s, anc) { declare(blockScope(anc.slice(0, -1)), n.id.name, 'function', n); },
    VariableDeclaration(n, _s, anc) {
      const scope = n.kind === 'var' ? fnScope(anc.slice(0, -1)) : blockScope(anc.slice(0, -1));
      for (const d of n.declarations) for (const name of patternNames(d.id)) declare(scope, name, n.kind, d.id.type === 'Identifier' ? d.init : null);
    },
    Function(n) {
      const body = n.body.type === 'BlockStatement' ? n.body : n;
      for (const p of n.params) for (const name of patternNames(p)) declare(body, name, 'param', null);
      if (n.type === 'FunctionExpression' && n.id) declare(body, n.id.name, 'fname', n);
    },
    CatchClause(n) { for (const name of patternNames(n.param)) declare(n.body, name, 'param', null); },
    ClassDeclaration(n, _s, anc) { declare(blockScope(anc.slice(0, -1)), n.id.name, 'class', n); },
  });
  const resolve = (name, ancestors) => {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const a = ancestors[i];
      const s = scopes.get(a);
      if (s?.has(name)) return s.get(name);
    }
    return null;
  };
  const isFunctionBinding = (b) => b && (b.kind === 'function' || (isFn(b.init) && b.kind !== 'param'));

  // Rule 3: top-level functions per file (Program body or the outer IIFE body).
  const outer = ast.body.length === 1 && ast.body[0].type === 'ExpressionStatement' && ast.body[0].expression.type === 'CallExpression' && isFn(ast.body[0].expression.callee) ? ast.body[0].expression.callee.body.body : ast.body;
  for (const n of outer || []) if (n.type === 'FunctionDeclaration') {
    const list = topLevelNames.get(n.id.name) || [];
    if (!list.includes(src.file)) list.push(src.file);
    topLevelNames.set(n.id.name, list);
  }

  const memberPaths = new Map();
  walk.ancestor(ast, {
    AssignmentExpression(n, _s, anc) {
      if (n.operator !== '=') return;
      if (n.left.type === 'Identifier') {
        const b = resolve(n.left.name, anc);
        if (isFunctionBinding(b)) report('rebind', src.file, line(n), `function ${n.left.name} reassigned`);
        else if (b && (b.kind === 'let' || b.kind === 'var') && isFn(n.right) && b.init && !isFn(b.init) && b.init.type === 'Identifier') {
          report('rebind', src.file, line(n), `${n.left.name} reassigned to a function`);
        }
      } else if (n.left.type === 'MemberExpression' && !n.left.computed) {
        const p = text(n.left);
        let root = n.left;
        while (root.type === 'MemberExpression') root = root.object;
        if (root.type !== 'Identifier' && root.type !== 'ThisExpression') return;
        const binding = root.type === 'Identifier' ? resolve(root.name, anc) : null;
        if (root.type === 'ThisExpression' || (binding && binding.kind === 'param')) return;
        if (/^(window|globalThis|self)\./.test(p) || isFn(n.right)) {
          // Key by the root binding so same-named locals in different scopes stay apart.
          let paths = memberPaths.get(binding || 'global');
          if (!paths) memberPaths.set(binding || 'global', (paths = new Map()));
          const prev = paths.get(p);
          if (prev && (isFn(n.right) || prev.fn)) report('rebind', src.file, line(n), `${p} assigned again (first at ${prev.line})`);
          if (!prev) paths.set(p, { line: line(n), fn: isFn(n.right) });
        }
      }
    },
    VariableDeclarator(n, _s, anc) {
      if (n.id.type !== 'Identifier' || n.init?.type !== 'Identifier') return;
      const b = resolve(n.init.name, anc.slice(0, -1));
      if (isFunctionBinding(b)) report('alias', src.file, line(n), `${n.id.name} = ${n.init.name}`);
    },
    CatchClause(n) {
      if (n.body.body.length === 0) report('emptyCatch', src.file, line(n), 'empty catch');
    },
    CallExpression(n) {
      const callee = text(n.callee);
      const last = callee.split('.').pop();
      if (TIMER.has(last) && /^(window\.|globalThis\.|self\.)?\w+$/.test(callee)) report('timer', src.file, line(n), callee);
      if (/createElement$/.test(callee) && n.arguments[0]?.type === 'Literal' && String(n.arguments[0].value).toLowerCase() === 'style') report('styleInject', src.file, line(n), "createElement('style')");
      if (/insertAdjacentHTML$|\.write$/.test(callee) && n.arguments.some((a) => /<style/i.test(text(a)))) report('styleInject', src.file, line(n), '<style> markup');
      if (/insertRule$|replaceSync$|replace$/.test(callee) && /sheet|CSSStyleSheet/i.test(callee)) report('styleInject', src.file, line(n), callee);
      if (callee === 'Object.defineProperty' || callee === 'Object.defineProperties') report('defineProperty', src.file, line(n), callee);
    },
    NewExpression(n) {
      if (n.callee.type === 'Identifier' && n.callee.name === 'MutationObserver') report('mutationObserver', src.file, line(n), 'new MutationObserver');
    },
    Function(n, _s, anc) {
      const name = n.id?.name || (anc.at(-2)?.type === 'VariableDeclarator' && anc.at(-2).id.name) || null;
      if (n.type === 'FunctionDeclaration' && SUFFIX.test(n.id.name)) report('suffixFunction', src.file, line(n), n.id.name);
      if (!name || n.body.type !== 'BlockStatement') return;
      const params = n.params.map((p) => text(p)).join(',');
      let body = text(n.body).replace(/\s+/g, '');
      body = body.split(name).join('§');
      if (body.length < 30) return;
      const key = params + '|' + body;
      const list = bodyIndex.get(key) || [];
      list.push({ name, where: `${src.file}:${line(n)}` });
      bodyIndex.set(key, list);
    },
  });
  for (const m of src.text.matchAll(/!important/g)) report('important', src.file, src.text.slice(0, m.index).split('\n').length + off, 'in script');
  // CSS text written into <style> elements from script still counts as CSS for the
  // selector and !important metrics, so moving it into styles/ is neutral for the ratchet.
  walk.simple(ast, {
    AssignmentExpression(n) {
      if (n.left.type !== 'MemberExpression' || !/^(textContent|innerHTML)$/.test(n.left.property.name || '')) return;
      if (n.left.object.type !== 'Identifier') return;
      const init = (() => { for (const [, sc] of scopes) { const b = sc.get(n.left.object.name); if (b?.init) return b.init; } return null; })();
      const isStyle = init?.type === 'CallExpression' && /createElement$/.test(text(init.callee)) && String(init.arguments[0]?.value).toLowerCase() === 'style';
      if (!isStyle) return;
      const r = n.right;
      const cssText = r.type === 'Literal' ? String(r.value) : r.type === 'TemplateLiteral' ? r.quasis.map((q) => q.value.cooked).join('x') : null;
      if (cssText) cssSources.push({ file: `${src.file}@${line(n)}`, text: cssText, scripted: true });
    },
  });
}

for (const [name, files] of topLevelNames) if (files.length > 1) report('crossFileDuplicate', files.join(','), 0, name);
for (const list of bodyIndex.values()) {
  const names = [...new Set(list.map((x) => x.name))];
  if (names.length > 1) report('sameBody', list[0].where, 0, list.map((x) => `${x.name}@${x.where}`).join(' = '));
}

// ---------------------------------------------------------------- CSS
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}
function cssRules(css) {
  // Returns [{selector, context, line}] for every style rule, tracking @media/@supports nesting.
  const out = [];
  const s = stripComments(css);
  const stack = [];
  let i = 0, start = 0;
  const lineAt = (k) => s.slice(0, k).split('\n').length;
  while (i < s.length) {
    const c = s[i];
    if (c === '"' || c === "'") { const q = c; i++; while (i < s.length && s[i] !== q) { if (s[i] === '\\') i++; i++; } i++; continue; }
    if (c === '{') {
      const head = s.slice(start, i).trim();
      if (head.startsWith('@')) stack.push({ at: true, head: head.replace(/\s+/g, ' ') });
      else {
        stack.push({ at: false, head });
        const ctx = stack.filter((x) => x.at).map((x) => x.head).join(' ');
        if (!/^@(keyframes|-webkit-keyframes|font-face|page)/.test(ctx) && !stack.slice(0, -1).some((x) => !x.at)) {
          out.push({ selector: head, context: ctx, line: lineAt(start + (s.slice(start, i).length - s.slice(start, i).trimStart().length)) });
        }
      }
      start = i + 1;
    } else if (c === '}') { stack.pop(); start = i + 1; }
    else if (c === ';' && (stack.length === 0 || stack.at(-1).at)) start = i + 1;
    i++;
  }
  return out;
}
const selectorUses = new Map();
for (const src of cssSources) {
  if (!src.scripted) for (const m of src.text.matchAll(/!important/g)) report('important', src.file, src.text.slice(0, m.index).split('\n').length, 'in css');
  for (const r of cssRules(src.text)) {
    for (const sel of r.selector.split(/,(?![^(]*\))/).map((x) => x.trim().replace(/\s+/g, ' ')).filter(Boolean)) {
      const list = selectorUses.get(sel) || [];
      list.push({ file: src.file, context: r.context, line: r.line });
      selectorUses.set(sel, list);
    }
  }
}
for (const [sel, uses] of selectorUses) {
  if (uses.length < 2) continue;
  // Allowed: one block per media context, all in the same file.
  const sameFile = uses.every((u) => u.file === uses[0].file);
  const contexts = new Set(uses.map((u) => u.context));
  if (sameFile && contexts.size === uses.length) continue;
  report('duplicateSelector', uses[0].file, uses[0].line, `${sel} ×${uses.length} (${uses.map((u) => `${u.file}:${u.line}${u.context ? ' ' + u.context : ''}`).join(', ')})`);
}

// ---------------------------------------------------------------- ratchet
const METRICS = ['parse', 'rebind', 'alias', 'crossFileDuplicate', 'styleInject', 'defineProperty', 'mutationObserver', 'duplicateSelector', 'important', 'suffixFunction', 'emptyCatch', 'timer', 'sameBody'];
const counts = Object.fromEntries(METRICS.map((m) => [m, (violations[m] || []).length]));

if (args.includes('--report')) {
  const only = args[args.indexOf('--report') + 1];
  for (const m of METRICS) {
    if (only && !only.startsWith('--') && only !== m) continue;
    for (const v of violations[m] || []) console.log(`${m}\t${v}`);
  }
}

const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : null;
if (args.includes('--update-baseline') || !baseline) {
  const next = {};
  for (const m of METRICS) next[m] = baseline && m in baseline ? Math.min(baseline[m], counts[m]) : counts[m];
  fs.writeFileSync(baselineFile, JSON.stringify(next, null, 1) + '\n');
  console.log('structure baseline written');
}
const current = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
let failed = counts.parse > 0;
const rows = METRICS.map((m) => {
  const grew = counts[m] > (current[m] ?? 0);
  if (grew) failed = true;
  return `${grew ? 'FAIL' : counts[m] < current[m] ? 'down' : ' ok '}  ${m.padEnd(20)} ${String(counts[m]).padStart(6)}  (baseline ${current[m] ?? 0})`;
});
console.log(rows.join('\n'));
if (counts.parse) console.log(violations.parse.join('\n'));
if (failed) {
  console.log('\nstructure check failed: a ratcheted metric increased. Run with --report <metric> to list sites.');
  process.exit(1);
}
const lowered = METRICS.filter((m) => counts[m] < current[m]);
if (lowered.length && !args.includes('--update-baseline')) console.log(`\nmetrics went down (${lowered.join(', ')}): run with --update-baseline to lock them in.`);
