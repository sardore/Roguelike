
/* R58 startup commit: begin animation only after every canonical subsystem above initialized. */
if(typeof globalThis.__MANRU_ACTOR_ART__?.drawWorld!=='function')throw new ReferenceError('canonical actor renderer is not initialized');
if(!globalThis.__MANRU_RUNTIME_START57__?.ready?.())throw new ReferenceError('canonical runtime entrypoints are not initialized');
globalThis.__MANRU_RUNTIME_START57__.start();
globalThis.__MANRU_INIT_COMPLETE__=Object.freeze({build:RELEASE_INFO.build,actor:true,runtime:true,loopStarted:globalThis.__MANRU_RUNTIME_START57__.started()});
