import fs from 'node:fs';
const path='src/main.ts';
let s=fs.readFileSync(path,'utf8');
const old="if(fireButton){const equipped=state.player.inventory.find((entry)=>entry.id===state.player.equippedWeaponId);fireButton.disabled=!equipped||!isRangedWeapon(itemById(equipped.defId))||state.player.ammo<=0;}";
const next="if(fireButton){const equippedWeaponId=state.player.equippedWeaponId;const equipped=state.player.inventory.find((entry)=>entry.id===equippedWeaponId);fireButton.disabled=!equipped||!isRangedWeapon(itemById(equipped.defId))||state.player.ammo<=0;}";
if(!s.includes(old)&&!s.includes(next))throw new Error('missing fire narrowing anchor');
s=s.replace(old,next);
fs.writeFileSync(path,s);
