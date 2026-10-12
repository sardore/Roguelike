#!/usr/bin/env node
// Measurement tool (read-only): the registration calls and direct writes of the spine-owned stage tables.
//   node tools/refactor/stage-report.mjs [--json]
// For every table it lists, in source order (= the order they run at load, which is the order the table holds):
//   file:line, id, phase, how the stage reaches the table (register call or direct push) and what the stage function
//   captures. A capture is a free variable of the stage function that is declared in an enclosing function or block
//   (not at the top level of the game closure): such a stage cannot move to the table's owner file without the variable.
// It also reports duplicate ids per table and the nesting each registration sits in.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';
import { assembleGame, locate } from '../lib/game.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const json = process.argv.includes('--json');

// register function -> { table, idArg, phaseArg, fnArg }; direct tables are written by `<table>.push(fn)`
export const REGISTERS = {
  registerMovePreR8: { table: 'MOVE_HOOKS_R8', phase: 'pre', fnArg: 0 },
  registerMovePostR8: { table: 'MOVE_HOOKS_R8', phase: 'post', fnArg: 0 },
  registerPlayerStatStage55: { table: 'PLAYER_STAT_STAGES55', idArg: 0, fnArg: 1 },
  registerAttackCostStage55: { table: 'ATTACK_COST_STAGES55', idArg: 0, fnArg: 1 },
  registerMoveCostStage55: { table: 'MOVE_COST_STAGES55', idArg: 0, fnArg: 1 },
  registerBossRewardStage55: { table: 'BOSS_REWARD_STAGES', idArg: 0, phaseArg: 1, fnArg: 2 },
  registerPickupStageR25: { table: 'MANRU_PICKUP_PIPELINE_R25', idArg: 0, fnArg: 1 },
  registerInventoryRenderR34: { table: 'INVENTORY_RENDER_R34', idArg: 0, phaseArg: 1, fnArg: 2 },
  registerPanelHook54: { table: 'PANEL_HOOKS54', idArg: 0, fnArg: 1 },
};
export const DIRECT_TABLES = ['RUN_END_EFFECTS53', 'DESCEND_EFFECTS53'];

const { text, parts } = assembleGame(path.join(repo, 'src'));
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const closure = ast.body[0].expression.callee.body;
const A = analyze(ast);
const where = (node) => { const l = locate(parts, node.loc.start.line); return `${l.file.replace('src/game/', '')}:${l.line}`; };
const lit = (n) => (n && n.type === 'Literal' ? String(n.value) : n ? `<${text.slice(n.start, Math.min(n.end, n.start + 40))}>` : null);

const inside = (node, range) => node.start >= range.start && node.end <= range.end;
// free variables of a function node that are declared in an enclosing non-top-level scope
function captures(fnNode) {
  const out = new Map();
  for (const r of A.refs) {
    if (!r.binding || !inside(r.node, fnNode)) continue;
    const b = r.binding;
    if (inside(b.idNode, fnNode)) continue; // declared inside the stage itself
    if (b.scope === closure || b.scope === ast) continue; // top-level of the closure (or global)
    out.set(b.name, (out.get(b.name) || 0) + 1);
  }
  return [...out.keys()];
}
// the stage function a call passes: an inline function, or the top-level function it names
function stageOf(node) {
  if (!node) return { kind: 'none', caps: [] };
  if (/Function/.test(node.type)) {
    // an arrow function keeps the `this`/`arguments` of its surroundings; a function declaration has its own
    const lexical = node.type === 'ArrowFunctionExpression' && /\b(this|arguments)\b/.test(text.slice(node.start, node.end));
    return { kind: node.id ? `named ${node.id.name}` : 'inline', caps: captures(node), lexical };
  }
  if (node.type === 'Identifier') {
    const b = A.refs.find((r) => r.node === node)?.binding;
    if (b && b.scope === closure) return { kind: `top-level ${node.name}`, caps: [] };
    return { kind: `local ${node.name}`, caps: [node.name] };
  }
  if (node.type === 'ObjectExpression') { // pickup stages: { pre, post }
    const caps = new Set(); const kinds = [];
    for (const p of node.properties) { const s = stageOf(p.value); s.caps.forEach((c) => caps.add(c)); kinds.push(`${p.key.name}:${s.kind}`); }
    return { kind: `{${kinds.join(',')}}`, caps: [...caps] };
  }
  return { kind: 'expr', caps: captures(node) };
}
// nesting: the enclosing function/block chain between the call and the closure top level
function nestingOf(anc) {
  const chain = [];
  for (const a of anc) {
    if (a === closure || a === ast || a.type === 'Program' || a === ast.body[0] || a.type === 'ExpressionStatement' && a === ast.body[0]) continue;
    if (a.type === 'BlockStatement' && a === closure) continue;
    if (/Function/.test(a.type) && a !== ast.body[0].expression.callee) chain.push(a.id ? `fn ${a.id.name}` : a.type === 'ArrowFunctionExpression' ? 'arrow' : 'function');
    else if (a.type === 'BlockStatement' && a !== ast.body[0].expression.callee.body) chain.push('block');
  }
  return chain;
}

const calls = [];
for (const r of A.refs) {
  const p = r.parent;
  const reg = REGISTERS[r.node.name];
  const call = [...r.ancestors, p].reverse().find((n) => n.type === 'CallExpression' && n.callee === r.node);
  if (reg && call && r.binding?.scope === closure) {
    const phase = reg.phase || (reg.phaseArg != null ? lit(call.arguments[reg.phaseArg]) : null);
    const st = stageOf(call.arguments[reg.fnArg]);
    calls.push({ lexical: st.lexical || false, table: reg.table, via: r.node.name, id: reg.idArg != null ? lit(call.arguments[reg.idArg]) : null, phase, at: where(call), pos: call.start, nesting: nestingOf(r.ancestors), stage: st.kind, captures: st.caps });
  }
  if (DIRECT_TABLES.includes(r.node.name) && r.binding?.scope === closure && p.type === 'MemberExpression' && p.object === r.node && p.property.name === 'push') {
    const callNode = r.ancestors[r.ancestors.length - 2];
    if (callNode?.type === 'CallExpression' && callNode.callee === p) {
      const st = stageOf(callNode.arguments[0]);
      calls.push({ lexical: st.lexical || false, table: r.node.name, via: 'push', id: null, phase: null, at: where(callNode), pos: callNode.start, nesting: nestingOf(r.ancestors), stage: st.kind, captures: st.caps });
    }
  }
}
calls.sort((a, b) => a.pos - b.pos);

// every other reference to a table (reads by the owner, or writes the report does not know)
const tables = [...new Set([...Object.values(REGISTERS).map((r) => r.table), ...DIRECT_TABLES])];
const other = [];
for (const t of tables) {
  const b = A.bindings.find((x) => x.name === t && x.scope === closure);
  if (!b) { other.push({ table: t, note: 'not a top-level binding' }); continue; }
  const sites = b.refs.map((r) => where(r.node));
  other.push({ table: t, declared: where(b.idNode), references: sites.length, sites });
}

const dupes = {};
for (const c of calls) {
  if (c.id == null) continue;
  const key = `${c.table}${c.phase && c.table !== 'MOVE_HOOKS_R8' ? ':' + c.phase : ''}`;
  (dupes[key] ||= {})[c.id] = (dupes[key][c.id] || 0) + 1;
}
const dupList = Object.entries(dupes).flatMap(([k, ids]) => Object.entries(ids).filter(([, n]) => n > 1).map(([id, n]) => `${k} ${id} x${n}`));

if (json) { console.log(JSON.stringify({ calls, tables: other, duplicateIds: dupList }, null, 1)); process.exit(0); }
for (const t of tables) {
  const rows = calls.filter((c) => c.table === t);
  const info = other.find((o) => o.table === t);
  console.log(`\n## ${t}  (declared ${info.declared}; ${rows.length} writes; ${info.references} references in all)`);
  for (const c of rows) console.log(`  ${c.at.padEnd(18)} ${String(c.id ?? '-').padEnd(26)} ${String(c.phase ?? '').padEnd(5)} ${c.stage}${c.nesting.length ? `  [in ${c.nesting.join(' > ')}]` : ''}${c.captures.length ? `  CAPTURES ${c.captures.join(', ')}` : ''}${c.lexical ? '  USES this/arguments' : ''}`);
}
const lifted = calls.filter((c) => !c.captures.length).length;
console.log(`\nregistrations ${calls.length}: ${lifted} capture nothing from an enclosing scope, ${calls.length - lifted} capture local variables`);
console.log(`stages that use this/arguments inside an arrow: ${calls.filter((c) => c.lexical).length}`);
console.log(`duplicate ids: ${dupList.length ? dupList.join('; ') : 'none'}`);
