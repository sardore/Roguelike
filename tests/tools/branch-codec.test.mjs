import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
const source=fs.readFileSync(new URL('../../src/game/branches.js',import.meta.url),'utf8');
const names=new Set(['BRANCH_DECODE_CACHE','branchEncodePage','branchDecodePage']);
const nodes=parse(source,{ecmaVersion:'latest'}).body.filter(n=>names.has(n.id?.name)||n.declarations?.some(d=>names.has(d.id.name)));
const context=vm.createContext({TextEncoder,TextDecoder});
vm.runInContext(nodes.map(n=>source.slice(n.start,n.end)).join('\n')+'\nglobalThis.codec={encode:branchEncodePage,decode:branchDecodePage};',context);
const {encode,decode}=context.codec;
const plain=x=>JSON.parse(JSON.stringify(x));
test('encoded unicode worlds round-trip and reuse the immutable snapshot decode',()=>{
 const page={branchContext105:{id:'palace',level:1},monsters:[{name:'어미거미',summonContract105:'book-family',hp:40}],decor:Array.from({length:100},(_,i)=>({name:'진주·산호',x:i,y:i%10}))};
 const raw=encode(page),before=JSON.stringify(raw),decoded=decode(raw);
 assert.deepEqual(plain(decoded),page);assert.strictEqual(decode(raw),decoded);assert.equal(JSON.stringify(raw),before);
 assert.deepEqual(plain(decode(structuredClone(raw))),page);
});
test('a new encoded page and an edited payload cannot return a previous decode',()=>{
 const first=encode({monsters:[{name:'독거미',hp:12}]}),second=encode({monsters:[]});
 assert.equal(decode(first).monsters.length,1);assert.equal(decode(second).monsters.length,0);
 Object.assign(first,second);assert.equal(decode(first).monsters.length,0);
});
test('a warm cache does not bypass invalid encoding checks',()=>{
 const raw=encode({monsters:[{name:'객잔 쥐'}]});decode(raw);
 raw.bytes105++;assert.throws(()=>decode(raw),/Truncated branch page/);
 raw.pageCodec105=2;assert.throws(()=>decode(raw),/Invalid branch page encoding/);
});
test('unencoded legacy pages keep their existing identity',()=>{
 const page={monsters:[]};assert.strictEqual(decode(page),page);assert.equal(decode(null),null);
});
test('already normalized summon books skip construction of the species catalog',()=>{
 const monsters=fs.readFileSync(new URL('../../src/game/monsters.js',import.meta.url),'utf8');
 const fn=parse(monsters,{ecmaVersion:'latest'}).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='normalizeSummonSpeciesItem105');
 let calls=0;const scope=vm.createContext({summonDefinitions(){calls++;throw Error('unnecessary species catalog construction');}});
 vm.runInContext(monsters.slice(fn.start,fn.end)+'\nnormalizeSummonSpeciesItem105({summonItem105:"book",summonSpeciesVersion105:1});',scope);
 assert.equal(calls,0);
});
test('compact summon saves retain book state, custom portraits and legacy aliases',()=>{
 const save=fs.readFileSync(new URL('../../src/game/save.js',import.meta.url),'utf8');
 const catalog=fs.readFileSync(new URL('../../src/game/catalog.js',import.meta.url),'utf8');
 const pick=(s,name)=>parse(s,{ecmaVersion:'latest'}).body.find(n=>n.id?.name===name||n.declarations?.some(d=>d.id.name===name));
 const fn=pick(save,'compactSummonSave'),defs=pick(catalog,'MONSTERS');
 const scope=vm.createContext();
 vm.runInContext(catalog.slice(defs.start,defs.end)+'\nfunction summonDefinitions(){return MONSTERS}\n'+save.slice(fn.start,fn.end)+'\nglobalThis.compact=compactSummonSave;globalThis.defs=MONSTERS;',scope);
 const monster=plain(scope.defs.find(def=>def.name==='이무기'));
 const book={summonItem105:'book',summonSpeciesVersion105:1,summonBookId105:'book-4',summonElement105:'water',upgrade:2,summonRecoveryUntil105:2072,summonKillCounts105:{이무기:5},summonPictures105:{이무기:{count:3,portrait:monster},문하생:{count:1,portrait:{name:'문하생',martialActor105:true}}}};
 const picture={summonItem105:'picture',summonSpeciesVersion105:1,summonSpecies105:'이무기',summonPortrait105:monster};
 const summoning={speciesVersion105:1,prototypes:[...plain(scope.defs).map(def=>({name:def.name,def})),{name:'문하생',actor:{martialActor105:true}}],contracts:{active:{bookId105:'book-4'}}};
 const source={player:{inventory:[book,picture],summoning105:summoning},items:[picture],artifactReturn46:{outer:{items:[picture]}}};
 const packed=structuredClone(source);scope.compact(packed);
 const [savedBook,savedPicture]=packed.player.inventory;
 assert.deepEqual(plain(savedBook),{...book,summonPictures105:{이무기:{count:3},문하생:book.summonPictures105.문하생}});
 assert.equal(savedPicture.summonPortrait105,undefined);
 assert.equal(packed.artifactReturn46.outer.items[0].summonPortrait105,undefined);
 assert.deepEqual(plain(packed.player.summoning105),{...summoning,prototypes:summoning.prototypes.slice(-1)});
 assert.ok(JSON.stringify(packed).length<JSON.stringify(source).length*.2);
 assert.ok(book.summonPictures105.이무기.portrait);
 const old={player:{inventory:[{...book,summonSpeciesVersion105:undefined}],summoning105:{...summoning,speciesVersion105:undefined}}};
 const before=JSON.stringify(old);scope.compact(old);assert.equal(JSON.stringify(old),before);
});
