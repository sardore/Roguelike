// IIFE patch sections inside the runtime's outer closure.
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
export function outerBody(ast) {
  const e = ast.body[0]?.expression;
  if (e?.type === 'CallExpression' && isFn(e.callee)) return e.callee.body;
  return null;
}
export function sectionCall(stmt) {
  if (stmt.type !== 'ExpressionStatement') return null;
  let e = stmt.expression;
  if (e.type === 'UnaryExpression') e = e.argument;
  if (e.type === 'CallExpression' && isFn(e.callee) && e.arguments.length === 0 && !e.callee.async && !e.callee.generator && e.callee.body.type === 'BlockStatement') return e.callee;
  return null;
}
