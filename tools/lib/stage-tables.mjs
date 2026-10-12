// The spine-owned stage tables and how their stages used to be registered. Shared by the measurement tool
// (tools/refactor/stage-report.mjs) and the converter (tools/refactor/stage-table.mjs).
//   shape: how a stage is stored in its table
//     bare      the function itself
//     run       { id, run }
//     fn        { id, fn }
//     pickup    { id, pre, post }  (the stage argument is an object literal with optional pre/post functions)
export const REGISTERS = {
  registerMovePreR8: { table: 'MOVE_HOOKS_R8', phase: 'pre', fnArg: 0, shape: 'bare' },
  registerMovePostR8: { table: 'MOVE_HOOKS_R8', phase: 'post', fnArg: 0, shape: 'bare' },
  registerPlayerStatStage55: { table: 'PLAYER_STAT_STAGES55', idArg: 0, fnArg: 1, shape: 'run' },
  registerAttackCostStage55: { table: 'ATTACK_COST_STAGES55', idArg: 0, fnArg: 1, shape: 'run' },
  registerMoveCostStage55: { table: 'MOVE_COST_STAGES55', idArg: 0, fnArg: 1, shape: 'run' },
  registerBossRewardStage55: { table: 'BOSS_REWARD_STAGES', idArg: 0, phaseArg: 1, fnArg: 2, shape: 'run' },
  registerPickupStageR25: { table: 'MANRU_PICKUP_PIPELINE_R25', idArg: 0, fnArg: 1, shape: 'pickup' },
  registerInventoryRenderR34: { table: 'INVENTORY_RENDER_R34', idArg: 0, phaseArg: 1, fnArg: 2, shape: 'fn' },
  registerPanelHook54: { table: 'PANEL_HOOKS54', idArg: 0, fnArg: 1, shape: 'run' },
};
export const DIRECT_TABLES = ['RUN_END_EFFECTS53', 'DESCEND_EFFECTS53'];
