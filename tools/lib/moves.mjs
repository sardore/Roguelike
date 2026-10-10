// Safety check for moving a function's text to another place in the same file: every
// identifier inside it that resolves to a binding declared outside the function must still
// resolve to that same binding from the destination, i.e. the binding's scope must enclose
// the destination. Returns a list of problems (empty when the move is safe).
export function moveProblems(A, fnNode, destAncestors) {
  const enclosing = new Set(destAncestors);
  const problems = [];
  for (const r of A.refs) {
    if (r.node.start < fnNode.start || r.node.end > fnNode.end || !r.binding) continue;
    const s = r.binding.scope;
    if (s.start >= fnNode.start && s.end <= fnNode.end) continue; // declared inside the moved function
    if (!enclosing.has(s)) problems.push(`${r.node.name}@${r.node.loc.start.line}`);
  }
  return [...new Set(problems)];
}

// ancestors (outermost first) of the node located at [start,end)
export function ancestorsOf(ast, target) {
  const path = [];
  const visit = (n, trail) => {
    if (!n || typeof n.type !== 'string' || n.start > target.start || n.end < target.end) return false;
    trail.push(n);
    if (n === target) { path.push(...trail); return true; }
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (Array.isArray(v)) { for (const c of v) if (visit(c, trail)) return true; }
      else if (v && typeof v.type === 'string' && visit(v, trail)) return true;
    }
    trail.pop();
    return false;
  };
  visit(ast, []);
  return path;
}
