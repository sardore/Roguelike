import type { GameState } from './types';
import { deriveSeed } from './rng';
export interface StorageLike { getItem(key:string):string|null; setItem(key:string,value:string):void; removeItem(key:string):void; }
interface SaveEnvelope { version:5; runId:string; sessionNonce:string; sequence:number; dirty:boolean; checksum:number; state:GameState; }
interface SaveLedger { version:5; runId:string; claimedThrough:number; lastSequence:number; }
export type LoadResult={ok:true;state:GameState;sessionNonce:string}|{ok:false;reason:'missing'|'dirty'|'replayed'|'corrupt'|'incompatible'};
const SAVE_KEY='abyssal-roguelike:save:v5', LEDGER_KEY='abyssal-roguelike:ledger:v5';
const LEGACY_SAVE_KEYS=['abyssal-roguelike:save:v4','abyssal-roguelike:save:v3','abyssal-roguelike:save:v2','abyssal-roguelike:save:v1'];
function canonicalPayload(e:Omit<SaveEnvelope,'checksum'>):string{return JSON.stringify(e);}
function checksumFor(e:Omit<SaveEnvelope,'checksum'>):number{return deriveSeed(canonicalPayload(e));}
function withChecksum(e:Omit<SaveEnvelope,'checksum'>):SaveEnvelope{return {...e,checksum:checksumFor(e)};}
function nonce():string{const c=globalThis.crypto;if(c?.randomUUID)return c.randomUUID();return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;}
export class RunSaveStore {
  constructor(private readonly storage:StorageLike){}
  private readEnvelope():SaveEnvelope|null{const raw=this.storage.getItem(SAVE_KEY);if(!raw)return null;try{return JSON.parse(raw) as SaveEnvelope}catch{return null}}
  private readLedger():SaveLedger|null{const raw=this.storage.getItem(LEDGER_KEY);if(!raw)return null;try{return JSON.parse(raw) as SaveLedger}catch{return null}}
  private writeEnvelope(e:SaveEnvelope):void{this.storage.setItem(SAVE_KEY,JSON.stringify(e));}
  private writeLedger(l:SaveLedger):void{this.storage.setItem(LEDGER_KEY,JSON.stringify(l));}
  private isValid(e:SaveEnvelope):boolean{if(e.version!==5||e.state.schemaVersion!==5)return false;const {checksum,...payload}=e;return checksum===checksumFor(payload);}
  beginNewRun(state:GameState):string{const sessionNonce=nonce();this.writeEnvelope(withChecksum({version:5,runId:state.runId,sessionNonce,sequence:1,dirty:true,state}));this.writeLedger({version:5,runId:state.runId,claimedThrough:0,lastSequence:1});return sessionNonce;}
  checkpointDirty(state:GameState,sessionNonce:string):void{const current=this.readEnvelope();if(!current||current.runId!==state.runId||current.sessionNonce!==sessionNonce||!current.dirty||!this.isValid(current))return;const sequence=current.sequence+1;this.writeEnvelope(withChecksum({version:5,runId:state.runId,sessionNonce,sequence,dirty:true,state}));const ledger=this.readLedger();this.writeLedger({version:5,runId:state.runId,claimedThrough:ledger?.claimedThrough??0,lastSequence:sequence});}
  saveAndQuitClean(state:GameState,sessionNonce:string):boolean{const current=this.readEnvelope();if(!current||current.runId!==state.runId||current.sessionNonce!==sessionNonce||!current.dirty||!this.isValid(current))return false;const sequence=current.sequence+1;this.writeEnvelope(withChecksum({version:5,runId:state.runId,sessionNonce,sequence,dirty:false,state}));const ledger=this.readLedger();this.writeLedger({version:5,runId:state.runId,claimedThrough:ledger?.claimedThrough??0,lastSequence:sequence});return true;}
  claimCleanSave():LoadResult{const envelope=this.readEnvelope();if(!envelope){return LEGACY_SAVE_KEYS.some((key)=>this.storage.getItem(key)!==null)?{ok:false,reason:'incompatible'}:{ok:false,reason:'missing'};}if(envelope.version!==5||envelope.state.schemaVersion!==5)return{ok:false,reason:'incompatible'};if(!this.isValid(envelope))return{ok:false,reason:'corrupt'};if(envelope.dirty)return{ok:false,reason:'dirty'};const ledger=this.readLedger();if(ledger&&ledger.runId===envelope.runId&&envelope.sequence<=ledger.claimedThrough)return{ok:false,reason:'replayed'};const newSessionNonce=nonce(),claimedSequence=envelope.sequence;const dirtyEnvelope=withChecksum({version:5,runId:envelope.runId,sessionNonce:newSessionNonce,sequence:envelope.sequence+1,dirty:true,state:envelope.state});this.writeLedger({version:5,runId:envelope.runId,claimedThrough:claimedSequence,lastSequence:dirtyEnvelope.sequence});this.writeEnvelope(dirtyEnvelope);return{ok:true,state:envelope.state,sessionNonce:newSessionNonce};}
  invalidateRun():void{this.storage.removeItem(SAVE_KEY);}
  hasSave():boolean{return this.storage.getItem(SAVE_KEY)!==null||LEGACY_SAVE_KEYS.some((key)=>this.storage.getItem(key)!==null);}
}
