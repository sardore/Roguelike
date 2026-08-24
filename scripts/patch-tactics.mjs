import fs from 'node:fs';

const path = 'src/core/game.ts';
let source = fs.readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) throw new Error(`patch anchor not found: ${label}`);
  source = source.replace(oldText, newText);
}

replaceOnce(
`function executeMonsterAbility(state: GameState, monster: MonsterEntity, rng: DeterministicRng): boolean {
  const def = monsterById(monster.defId), effect = def.abilities[0];
  if (!effect || monster.abilityCooldown > 0) return false;
  if (!hasLineOfSight(state, monster, state.player) && effect.op !== 'summon' && effect.op !== 'teleport') return false;
  if (effect.op === 'teleport' || effect.op === 'summon') applyEffect(state, effect, monster, monster, rng);
  else applyEffect(state, effect, monster, 'player', rng);
  monster.abilityCooldown = 3 + (def.ai === 'caster' ? 0 : 1);
  pushMessage(state, \`${'${def.name}'} invokes ${'${effect.op.replaceAll(\'-\', \' \')}'} .\`.replace(' .','.') );
  return true;
}`,
`function executeMonsterAbility(state: GameState, monster: MonsterEntity, rng: DeterministicRng): boolean {
  const def = monsterById(monster.defId), effect = def.abilities[0];
  if (!effect) return false;
  const charging = monster.statuses.find((status) => status.id === 'charging');
  if (charging) {
    monster.statuses = monster.statuses.filter((status) => status !== charging);
    const [targetX, targetY] = (charging.sourceId ?? '').split(',').map(Number);
    const targetStillThere = state.player.x === targetX && state.player.y === targetY;
    if (effect.op === 'teleport' || effect.op === 'summon') applyEffect(state, effect, monster, monster, rng);
    else if (targetStillThere && hasLineOfSight(state, monster, state.player)) applyEffect(state, effect, monster, 'player', rng);
    else pushMessage(state, \`${'${def.name}'}\'s ${'${effect.op.replaceAll(\'-\', \' \')}'} misses.\`);
    monster.abilityCooldown = 3 + (def.ai === 'caster' ? 0 : 1);
    return true;
  }
  if (monster.abilityCooldown > 0) return false;
  if (effect.op === 'teleport' || effect.op === 'summon') {
    applyEffect(state, effect, monster, monster, rng);
    monster.abilityCooldown = 3 + (def.ai === 'caster' ? 0 : 1);
    pushMessage(state, \`${'${def.name}'} invokes ${'${effect.op.replaceAll(\'-\', \' \')}'} .\`.replace(' .','.'));
    return true;
  }
  if (!hasLineOfSight(state, monster, state.player)) return false;
  monster.statuses.push({ id: 'charging', duration: 2, magnitude: 1, sourceId: \`${'${state.player.x}'},${'${state.player.y}'}\` });
  pushMessage(state, \`${'${def.name}'} telegraphs ${'${effect.op.replaceAll(\'-\', \' \')}'}!\`);
  return true;
}`,
'ability telegraph');

replaceOnce(
`  const def = monsterById(monster.defId), distance = manhattan(monster, state.player);
  if (distance === 1) { meleePlayer(state, monster, rng); return; }`,
`  const def = monsterById(monster.defId), distance = manhattan(monster, state.player);
  const winding = monster.statuses.find((status) => status.id === 'winding');
  if (winding) {
    monster.statuses = monster.statuses.filter((status) => status !== winding);
    const [targetX, targetY] = (winding.sourceId ?? '').split(',').map(Number);
    if (state.player.x === targetX && state.player.y === targetY && manhattan(monster, state.player) === 1) {
      const damage = Math.max(1, Math.round(monsterAttack(monster) * 1.5) + rng.int(-1, 1) - playerDefense(state));
      damagePlayer(state, damage, \`${'${def.name}'} lands a heavy blow for ${'${damage}'}.\`);
    } else pushMessage(state, \`${'${def.name}'}\'s heavy blow misses.\`);
    return;
  }
  if (distance === 1) {
    if (def.ai === 'brute') {
      monster.statuses.push({ id: 'winding', duration: 2, magnitude: 1, sourceId: \`${'${state.player.x}'},${'${state.player.y}'}\` });
      pushMessage(state, \`${'${def.name}'} winds up a heavy blow!\`);
      return;
    }
    meleePlayer(state, monster, rng); return;
  }`,
'brute windup');

replaceOnce(
`    const monster = monsterAt(state, target.x, target.y);
    if (monster) attackMonster(state, monster, rng);
    else {
      state.player.x = target.x; state.player.y = target.y;
      const item = itemAt(state, target.x, target.y);
      if (item) {
        state.player.inventory.push({ id: item.id, defId: item.defId });
        state.items = state.items.filter((entry) => entry.id !== item.id);
        pushMessage(state, \`You pick up ${'${itemById(item.defId).name}'}.\`);
      }
      pendingExit = exitAt(state.floor, state.player.x, state.player.y);
    }
    accepted = true;
  } else if (action.type === 'wait') accepted = true;`,
`    const monster = monsterAt(state, target.x, target.y);
    if (monster) attackMonster(state, monster, rng);
    else {
      const weapon = equippedWeapon(state);
      const reachTarget = weapon?.tags.includes('polearm') ? monsterAt(state, target.x + dx, target.y + dy) : undefined;
      if (reachTarget) {
        attackMonster(state, reachTarget, rng);
        pushMessage(state, \`${'${weapon!.name}'} strikes from reach.\`);
      } else {
        state.player.x = target.x; state.player.y = target.y;
        const item = itemAt(state, target.x, target.y);
        if (item) {
          state.player.inventory.push({ id: item.id, defId: item.defId });
          state.items = state.items.filter((entry) => entry.id !== item.id);
          pushMessage(state, \`You pick up ${'${itemById(item.defId).name}'}.\`);
        }
        pendingExit = exitAt(state.floor, state.player.x, state.player.y);
      }
    }
    accepted = true;
  } else if (action.type === 'wait') {
    addStatus(state.player.statuses, { op: 'status', id: 'guarding', duration: 1, magnitude: 1 }, state.player.id);
    pushMessage(state, 'You brace for the next attack.');
    accepted = true;
  }`,
'guard and reach');

fs.writeFileSync(path, source);
