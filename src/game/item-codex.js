const ItemCodex=(()=>{
 const key='manruItemCodex';
 const version=1;
 // Acquisitions that disappear before the next save still belong to the run that earned them.
 const pending=new WeakMap();
 const maxText=1000;
 let catalog, lastRaw, lastEntries;

 function identity(item){
  if(typeof item?.type!=='string'||typeof item.name!=='string'||!item.name||item.count===0)return null;
  if(item.type==='painting'||item.summonItem105==='picture')return null;
  const kind=item.artifactId46??item.mineItem105??item.foodKind??item.potionKind??item.talismanKind??item.ammoKind??item.name;
  return typeof kind==='string'&&kind.length<=160&&item.type.length<=32?item.type+':'+kind:null;
 }

 function read(raw){
  if(lastEntries&&raw===lastRaw)return lastEntries;
  const data=jsonOr(raw,null);
  const entries=new Map();
  for(const row of data?.version===version&&Array.isArray(data.entries)?data.entries:[]){
   if(!Array.isArray(row)||row.length!==2)continue;
   const [id,item]=row;
   if(typeof id!=='string'||id.length>193||typeof item?.name!=='string'||!item.name||item.name.length>160||
      typeof item.type!=='string'||item.type==='painting'||!id.startsWith(item.type+':'))continue;
   entries.set(id,{type:item.type,name:item.name,desc:typeof item.desc==='string'?item.desc.slice(0,maxText):''});
  }
  lastRaw=raw;lastEntries=entries;
  return entries;
 }

 function serialize(entries){return JSON.stringify({version,entries:[...entries]})}

 function record(run,item){
  if(!run?.player||runIsEphemeral(run)||item?.duelDrop)return;
  const id=identity(item);
  if(!id)return;
  let acquired=pending.get(run);
  if(!acquired){acquired=new Map();pending.set(run,acquired)}
  if(!acquired.has(id))acquired.set(id,{type:item.type,name:item.name.slice(0,160),desc:typeof item.desc==='string'?item.desc.slice(0,maxText):''});
 }

 function discoverOwned(run){
  const player=run?.player;
  if(!player||runIsEphemeral(run))return;
  for(const slot of GEAR_SLOT_TYPES)record(run,player[slot]);
  for(const item of player.inventory||[])record(run,item);
 }

 function change(run,raw=lsGet(key)){
  discoverOwned(run);
  const acquired=pending.get(run);
  if(!acquired?.size)return null;
  const entries=read(raw);
  const additions=[...acquired].filter(([id])=>!entries.has(id));
  return additions.length?[key,serialize(new Map([...entries,...additions]))]:null;
 }

 function save(run){
  const entry=change(run);
  if(!entry||lsSet(...entry))pending.delete(run);
  else ignoreError('item codex write failed',new Error('account storage unavailable'));
 }

 function merge(local,incoming){
  return serialize(new Map([...read(incoming),...read(local)]));
 }

 function definitions(){
  if(catalog)return catalog;
  const items=[...WEAPONS,...ARMORS,...CLOAKS,...RELICS,...TRINKETS,...CONSUMABLES,...POTIONS,...TALISMANS,...AMMO_TYPES,
   ...LEGENDS47,...FUSION_RECIPES.map(recipeItem),...Object.values(BRANCH_REWARDS),...Object.values(MOUNTAIN_REWARDS105),
   ...Object.values(MINE_ITEMS105),MOUNTAIN_BERRY,WARD_DROWN,WARD_VOID,palaceGuideItem(),...CITADEL_RELEASES.map(citadelBridgeGuide),
   summonBookItem(),makeMartialManual()];
  catalog=new Map();
  for(const item of items){
   const id=identity(item);
   if(id)catalog.set(id,item);
  }
  return catalog;
 }

 function rows(){
  const acquired=read(lsGet(key));
  const all=new Map([...acquired,...definitions()]);
  return [...all].map(([id,item])=>{
   const knownItem=definitions().get(id)||item;
   return {item,found:acquired.has(id),category:inventoryItemCategory(knownItem,true)};
  })
   .sort((a,b)=>Number(b.found)-Number(a.found)||a.item.name.localeCompare(b.item.name,'ko'));
 }

 function dialogElement(){return document.getElementById('itemCodex')}

 function bind(){
  const dialog=dialogElement();
  const category=document.getElementById('itemCodexCategory');
  const search=document.getElementById('itemCodexSearch');
  const list=document.getElementById('itemCodexList');
  const progress=document.getElementById('itemCodexProgress');
  const empty=document.getElementById('itemCodexEmpty');
  let entries=[];

  function render(){
   const query=search.value.trim().toLocaleLowerCase('ko');
   const visible=entries.filter(({item,found,category:group})=>(category.value==='all'||group===category.value)&&
    (!query||found&&item.name.toLocaleLowerCase('ko').includes(query)));
   const fragment=document.createDocumentFragment();
   for(const {item,found} of visible){
    const row=document.createElement('li');
    if(found){
     const art=document.createElement('img');
     art.alt='';
     art.loading='lazy';
     art.src=globalThis.__MANRU_ITEM_ART_R7__.dataItem(item);
     row.append(art);
    }else row.dataset.locked='true';
    const copy=document.createElement('div');
    const type=document.createElement('small');
    type.textContent=itemTypeLabel(item.type);
    const name=document.createElement('strong');
    name.textContent=found?item.name:'미발견';
    copy.append(type,name);
    if(found&&(item.desc||item.ability)){
     const desc=document.createElement('p');
     desc.textContent=item.desc||item.ability;
     copy.append(desc);
    }
    row.append(copy);
    fragment.append(row);
   }
   list.replaceChildren(fragment);
   list.scrollTop=0;
   empty.hidden=visible.length!==0;
  }

  document.getElementById('itemCodexBtn').onclick=()=>{
   if(dialog.open)return;
   entries=rows();
   category.replaceChildren(...INVENTORY_CATEGORIES.map(([id,label])=>new Option(label,id)));
   search.value='';
   progress.textContent=`${entries.filter(row=>row.found).length} / ${entries.length}종 발견`;
   render();
   dialog.showModal();
  };
  document.getElementById('itemCodexClose').onclick=()=>dialog.close();
  category.onchange=render;
  search.oninput=render;
 }

 return Object.freeze({key,record,change,save,merge,bind,isOpen:()=>dialogElement()?.open===true});
})();
