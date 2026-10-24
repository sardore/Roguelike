// Rewrites a built runtime (dist-*/scripts/10-runtime.js) for load-time measurements of the game closure:
// - probe: every read of the named top-level bindings goes through globalThis.__MANRU_LOAD_PROBE__, which counts the
//   reads made while the closure loads (globalThis.__MANRU_LOAD_HITS__: ok = after the declaration ran, tdz = before);
//   undef counts the reads that found `undefined` (a `let` read before its assignment);
//   allSites also counts the reads per call site (the innermost stack frame), for "who reads this while loading";
// - snapshot: when the closure has finished loading, the named top-level values (or all of them) are serialised into
//   globalThis.__MANRU_SNAPSHOT__ (functions by name, DOM nodes by tag/id/src, cycles cut).
// Used by tools/refactor/load-reads.mjs and the `values` test scenario.
import * as acorn from 'acorn';
import { analyze } from './scope.mjs';

const SERIALIZE = `(v)=>{const seen=new Map();const go=(x,d)=>{if(x===null||typeof x!=='object'&&typeof x!=='function')return typeof x==='number'&&!Number.isFinite(x)?String(x):x===undefined?'<undefined>':x;if(typeof x==='function')return'<fn '+(x.name||'?')+'>';if(typeof Node!=='undefined'&&x instanceof Node)return'<'+(x.nodeName||'node')+(x.id?'#'+x.id:'')+(x.getAttribute?.('src')?' '+x.getAttribute('src').length+':'+x.getAttribute('src').slice(-40):'')+'>';if(seen.has(x))return'<cycle '+seen.get(x)+'>';seen.set(x,d);if(d>6)return'<deep>';if(x instanceof Map)return{'<Map>':[...x].map(([k,w])=>[go(k,d+1),go(w,d+1)])};if(x instanceof Set)return{'<Set>':[...x].map((w)=>go(w,d+1))};if(Array.isArray(x))return x.map((w)=>go(w,d+1));const o={};for(const k of Object.keys(x))o[k]=go(x[k],d+1);return o};return go(v,0)}`;

const PRELUDE = (allSites) => `globalThis.__MANRU_LOADING__=true;globalThis.__MANRU_LOAD_HITS__={};
globalThis.__MANRU_LOAD_PROBE__=(n,f)=>{if(!globalThis.__MANRU_LOADING__)return f();const h=(globalThis.__MANRU_LOAD_HITS__[n]||={ok:0,tdz:0,undef:0,okSite:null,tdzSite:null,sites:{}});const site=()=>String(new Error().stack).split('\\n').slice(2,12).map((l)=>l.trim()).join(' < ');try{const v=f();h.ok++;if(v===undefined)h.undef++;h.okSite||=site();${allSites ? "const k=String(new Error().stack).split('\\n')[2].trim();h.sites[k]=(h.sites[k]||0)+1;" : ''}return v}catch(e){if(e instanceof ReferenceError){h.tdz++;h.tdzSite||=site()}throw e}};
`;

// probe: Set of names (or null); snapshot: Set of names, 'all' (every top-level const/let/class) or null;
// globals: Set of property names of globalThis whose value is also serialised when the closure has finished loading
// (recorded as `globalThis.<name>`: what the game published for other files and for the tests)
export function instrumentRuntime(text, { probe = null, snapshot = null, globals = null, allSites = false } = {}) {
  const ast = acorn.parse(text, { ecmaVersion: 'latest', sourceType: 'script' });
  const closure = ast.body.find((s) => s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && /Function/.test(s.expression.callee.type));
  if (!closure) throw new Error('game closure not found');
  const body = closure.expression.callee.body;
  const A = analyze(ast);
  const top = A.bindings.filter((b) => b.scope === body);
  const found = new Set();
  const edits = [];
  for (const b of top) {
    if (!probe || !probe.has(b.name)) continue;
    found.add(b.name);
    for (const r of b.refs) {
      const p = r.parent;
      if (p.type === 'UpdateExpression') continue;
      // a write target (also inside a destructuring pattern or a for-in/of head) is not a read
      const anc = [...r.ancestors, r.node];
      if (anc.some((a, i) => i + 1 < anc.length && ((a.type === 'AssignmentExpression' && a.left === anc[i + 1]) || (/^For(In|Of)Statement$/.test(a.type) && a.left === anc[i + 1])))) continue;
      const call = `__MANRU_LOAD_PROBE__(${JSON.stringify(b.name)},()=>${b.name})`;
      if (p.type === 'Property' && p.shorthand) edits.push({ start: p.start, end: p.end, text: `${b.name}:${call}` });
      else edits.push({ start: r.node.start, end: r.node.end, text: call });
    }
  }
  const seen = new Set();
  const unique = edits.filter((e) => (seen.has(e.start) ? false : seen.add(e.start))).sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of unique) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  const values = top.filter((b) => ['const', 'let', 'class'].includes(b.kind)).map((b) => b.name);
  const snapNames = snapshot === 'all' ? values : snapshot ? values.filter((n) => snapshot.has(n)) : [];
  // the closure finishes loading at its last statement: mark the end there (before a final return, if any)
  const last = body.body[body.body.length - 1];
  const globalNames = globals ? [...globals] : [];
  const endMark = 'globalThis.__MANRU_LOADING__=false;' + (snapNames.length || globalNames.length ? `{const __s=${SERIALIZE};globalThis.__MANRU_SNAPSHOT__={${[...snapNames.map((n) => `${JSON.stringify(n)}:(()=>{try{return __s(${n})}catch(e){return '<error '+e.message+'>'}})()`), ...globalNames.map((n) => `${JSON.stringify('globalThis.' + n)}:(()=>{try{return __s(globalThis[${JSON.stringify(n)}])}catch(e){return '<error '+e.message+'>'}})()`)].join(',')}}}` : '');
  const at = last.type === 'ReturnStatement' ? last.start : last.end;
  const shift = unique.filter((e) => e.start < at).reduce((d, e) => d + e.text.length - (e.end - e.start), 0);
  out = out.slice(0, at + shift) + '\n' + endMark + '\n' + out.slice(at + shift);
  return { text: PRELUDE(allSites) + out, found, sites: unique.length, snapNames };
}
