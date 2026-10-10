// Minimal lexical scope model over an acorn AST: bindings per scope node and resolution of
// every identifier reference. Shared by the structure checker and the refactor tools.
import * as walk from 'acorn-walk';

const FN = /Function/;

export function patternNames(p, out = []) {
  if (!p) return out;
  if (p.type === 'Identifier') out.push(p);
  else if (p.type === 'ObjectPattern') p.properties.forEach((q) => patternNames(q.type === 'RestElement' ? q.argument : q.value, out));
  else if (p.type === 'ArrayPattern') p.elements.forEach((q) => patternNames(q, out));
  else if (p.type === 'RestElement') patternNames(p.argument, out);
  else if (p.type === 'AssignmentPattern') patternNames(p.left, out);
  return out;
}

export function analyze(ast) {
  const scopes = new Map(); // scope node -> Map(name -> binding)
  let nextId = 0;
  const scopeOf = (n) => {
    let s = scopes.get(n);
    if (!s) scopes.set(n, (s = new Map()));
    return s;
  };
  const fnScope = (anc) => {
    for (let i = anc.length - 1; i >= 0; i--) {
      const a = anc[i];
      if (FN.test(a.type)) return a.body.type === 'BlockStatement' ? a.body : a;
      if (a.type === 'Program') return a;
    }
    return ast;
  };
  const blockScope = (anc) => {
    for (let i = anc.length - 1; i >= 0; i--) {
      const a = anc[i];
      if (/^(BlockStatement|Program|SwitchStatement|ForStatement|ForInStatement|ForOfStatement|StaticBlock)$/.test(a.type)) {
        // A function body block is the function scope itself.
        return a;
      }
    }
    return ast;
  };
  const bindings = [];
  const declare = (scopeNode, idNode, kind, decl) => {
    const b = { id: ++nextId, name: idNode.name, kind, decl, idNode, scope: scopeNode, refs: [] };
    scopeOf(scopeNode).set(idNode.name, b);
    bindings.push(b);
    return b;
  };
  walk.ancestor(ast, {
    FunctionDeclaration(n, _s, anc) {
      // Function declarations bind in the enclosing block (sloppy/strict both treat top-level of a function body as its scope).
      declare(blockScope(anc.slice(0, -1)), n.id, 'function', n);
    },
    VariableDeclaration(n, _s, anc) {
      const scope = n.kind === 'var' ? fnScope(anc.slice(0, -1)) : blockScope(anc.slice(0, -1));
      for (const d of n.declarations) for (const id of patternNames(d.id)) declare(scope, id, n.kind, d);
    },
    Function(n) {
      const body = n.body.type === 'BlockStatement' ? n.body : n;
      for (const p of n.params) for (const id of patternNames(p)) declare(body, id, 'param', n);
      if (n.type === 'FunctionExpression' && n.id) declare(body, n.id, 'fname', n);
    },
    CatchClause(n) {
      for (const id of patternNames(n.param)) declare(n.body, id, 'param', n);
    },
    ClassDeclaration(n, _s, anc) {
      declare(blockScope(anc.slice(0, -1)), n.id, 'class', n);
    },
    ClassExpression(n) {
      if (n.id) declare(n, n.id, 'class', n);
    },
  });

  const resolveFrom = (name, anc) => {
    for (let i = anc.length - 1; i >= 0; i--) {
      const a = anc[i];
      const s = scopes.get(a);
      if (s && s.has(name)) return s.get(name);
      // Parameter default expressions see the parameters, which live on the body scope.
      if (FN.test(a.type) && a.body?.type === 'BlockStatement' && i + 1 < anc.length && anc[i + 1] !== a.body) {
        const b = scopes.get(a.body);
        if (b && b.has(name) && b.get(name).kind === 'param') return b.get(name);
      }
    }
    return null;
  };

  // Every identifier occurrence that is a variable reference (not a property key/label/decl id).
  const refs = [];
  const declIds = new Set(bindings.map((b) => b.idNode));
  walk.fullAncestor(ast, (n, _s, anc) => {
    if (n.type !== 'Identifier' || declIds.has(n)) return;
    const parent = anc[anc.length - 2];
    if (!parent) return;
    if (parent.type === 'MemberExpression' && parent.property === n && !parent.computed) return;
    if ((parent.type === 'Property' || parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition') && parent.key === n && !parent.computed) {
      if (!(parent.type === 'Property' && parent.shorthand && parent.value === n)) return;
    }
    if (/^(LabeledStatement|BreakStatement|ContinueStatement)$/.test(parent.type)) return;
    if (parent.type === 'MetaProperty') return;
    const binding = resolveFrom(n.name, anc.slice(0, -1));
    const ref = { node: n, parent, binding, ancestors: anc.slice(0, -1) };
    refs.push(ref);
    if (binding) binding.refs.push(ref);
  });
  return { scopes, bindings, refs, resolveFrom };
}
