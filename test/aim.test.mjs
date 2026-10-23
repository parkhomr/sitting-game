import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HEROES,RAZES,razeRules,createWorld,spawnEnemy,command,step,sweepHit,hit,enemyAbility,hostCommand} from '../dist/engine.js';
import {wireWorld,deltaFrame,applyNetFrame} from '../dist/netcode.js';
function arena(id='drow'){
 const w=createWorld();w.started=true;w.spawnTimer=1e6;
 for(const p of Object.values(w.players)){p.x=p.moveX=65;p.y=p.moveY=900;}
 const p=w.players[id];p.x=p.moveX=500;p.y=p.moveY=500;p.aimX=1100;p.aimY=465;
 return {w,p};
}
function enemy(w,x=800,y=500,data={}){const e=spawnEnemy(w);Object.assign(e,{x,y,hp:10000,maxHP:10000,speed:0,damage:100,attackTimer:1e6,abilityTimer:1e6},data);return e;}
function advance(w,seconds){for(let t=0;t<seconds-.00001;t+=.05)step(w,.05);}
test('Z/X/C have fixed distinct ranges, independent cooldowns and one mana payment each',()=>{
 const {w,p}=arena('sf'),foes=RAZES.map(r=>enemy(w,p.x+r.distance,p.y));
 for(const r of RAZES){const mana=p.mana;assert.equal(command(w,p.id,{type:'raze',raze:r.id,x:1200,y:465}).ok,true);assert.equal(p.mana,mana-60);assert.equal(p[r.cooldown],8);assert.equal(command(w,p.id,{type:'raze',raze:r.id}).ok,false);}
 assert.deepEqual(w.casts.map(c=>c.x),[700,950,1200]);assert.equal(p.mana,180);advance(w,.35);assert.ok(foes.every(e=>e.hp===e.maxHP));advance(w,.1);assert.ok(foes.every(e=>e.hp<e.maxHP));assert.equal(w.casts.length,0);assert.equal(command(w,p.id,{type:'ability'}).ok,false);
});
test('raze stays at its cast point when caster or aim moves; a target can leave the warning',()=>{
 const {w,p}=arena('sf'),e=enemy(w,700,500);command(w,p.id,{type:'raze',raze:'near',x:1000,y:465});
 const cast={...w.casts[0]};command(w,p.id,{type:'aim',x:0,y:100});p.x=p.moveX=300;e.y=750;advance(w,.5);
 assert.equal(e.hp,e.maxHP);const blast=w.events.find(e=>e.type==='raze');assert.equal(blast.x,cast.x);assert.equal(blast.y,cast.y);
 const mana=p.mana;assert.equal(command(w,p.id,{type:'raze',raze:'far',x:NaN,y:500}).ok,false);assert.equal(p.mana,mana);assert.equal(p.razeFarCooldown,0);
});
test('raze direction follows the mouse to either side and upgrades affect all three slots',()=>{
 const {w,p}=arena('sf');p.gold=100000;for(const upgrade of ['skillPower','skillHaste','skillTalent'])command(w,p.id,{type:'upgrade',upgrade});command(w,p.id,{type:'upgrade',upgrade:'skillHaste'});
 for(const r of RAZES){const rules=razeRules(p,r.id);assert.ok(rules.radius>135);assert.ok(rules.cd<8);assert.ok(rules.cost<60);assert.equal(command(w,p.id,{type:'raze',raze:r.id,x:0,y:465}).ok,true);assert.equal(w.casts.at(-1).x,p.x-r.distance);assert.equal(w.casts.at(-1).y,p.y);}
});
test('every hero fires toward the chosen point, with no lock or rotation after launch',()=>{
 for(const h of HEROES){const {w,p}=arena(h.id),e=enemy(w,800,500);assert.equal(command(w,p.id,{type:'attack',x:1200,y:465}).ok,true);
  const s=w.projectiles[0],vx=s.vx,vy=s.vy;assert.ok(vx>0);assert.equal(vy,0);assert.equal(s.target,undefined);
  e.y=750;command(w,p.id,{type:'aim',x:0,y:100});advance(w,.3);assert.equal(s.vx,vx);assert.equal(s.vy,vy);assert.equal(s.y,465);advance(w,2);assert.equal(e.hp,e.maxHP);assert.equal(w.projectiles.length,0);
 }
});
test('non-SF Qs shoot physical projectiles into empty space without auto-selecting a nearby enemy',()=>{
 for(const id of ['drow','timber','rubick','sniper']){const {w,p}=arena(id),e=enemy(w,800,750,{hero:id==='sniper',kit:id==='sniper'?'lina':undefined,hp:100});
  assert.equal(command(w,id,{type:'ability',x:1200,y:465}).ok,true);assert.ok(w.projectiles.length>0);for(const s of w.projectiles){assert.ok(s.vx>0);assert.equal(s.target,undefined);}
  advance(w,2);assert.equal(e.hp,100,id);
 }
});
test('friendly projectiles hit the first body on their path; Axe cannot redirect the damage',()=>{
 const {w,p}=arena(),far=enemy(w,900),near=enemy(w,680),axe=enemy(w,1400,800,{hero:true,kit:'axe',armor:4});
 command(w,p.id,{type:'attack',x:1200,y:465});advance(w,.7);
 assert.ok(near.hp<near.maxHP);assert.equal(far.hp,far.maxHP);assert.equal(axe.hp,axe.maxHP);
});
test('swept collisions catch fast shots and crossing moving bodies without false distant hits',()=>{
 assert.equal(sweepHit(0,0,1000,0,500,0,20),.48);assert.equal(sweepHit(0,0,1000,0,500,21,20),null);
 assert.ok(sweepHit(-100,100,100,-100,0,0,10)!==null);
 const {w,p}=arena(),e=enemy(w,700);command(w,p.id,{type:'attack',x:1200,y:465});const s=w.projectiles[0];s.vx=8000;s.rangeLeft=1000;step(w,.1);assert.ok(e.hp<e.maxHP);assert.equal(w.projectiles.length,0);
});
test('players can dodge hostile attacks by walking sideways; bullets retain launch velocity',()=>{
 for(const dodge of [false,true]){const {w,p}=arena(),e=enemy(w,800,500,{ranged:true,attackTimer:0});step(w,.05);e.attackTimer=1e6;
  const s=w.projectiles.find(s=>s.hostile);assert.ok(s);const velocity=[s.vx,s.vy];assert.equal(p.damageTaken,0);
  if(dodge)command(w,p.id,{type:'move',x:500,y:850});advance(w,.8);assert.deepEqual([s.vx,s.vy],velocity);assert.equal(p.damageTaken,dodge?0:100);
 }
});
test('enemy spell missiles and ground warnings allow evasion before applying control',()=>{
 const {w,p}=arena();const e=enemy(w,850,500,{hero:true,kit:'cm',mana:420,maxMana:420});assert.equal(enemyAbility(w,e),true);assert.equal(p.stun,0);assert.ok(w.projectiles.some(s=>s.stun>0));
 command(w,p.id,{type:'move',x:500,y:850});advance(w,1);assert.equal(p.damageTaken,0);assert.equal(p.stun,0);
});
test('Eul requires pointing at a unit and shrapnel uses the chosen point without nearest fallback',()=>{
 const {w,p}=arena('sf'),e=enemy(w,700);const mp=p.mana;assert.equal(command(w,p.id,{type:'eul',x:1100,y:465}).ok,false);assert.equal(p.mana,mp);assert.equal(command(w,p.id,{type:'eul',x:e.x,y:e.y-35}).ok,true);
 const other=arena('sniper'),foe=enemy(other.w,700);command(other.w,'sniper',{type:'shrapnel',x:1100,y:700});assert.equal(other.w.zones[0].x,1100);advance(other.w,2);assert.equal(foe.hp,foe.maxHP);
});
test('Requiem releases actual straight souls and deals no instant radius damage',()=>{
 const {w,p}=arena('sf'),e=enemy(w,800);command(w,p.id,{type:'ultimate'});advance(w,1.7);
 assert.equal(e.hp,e.maxHP);const souls=w.projectiles.filter(s=>s.kind==='soul');assert.equal(souls.length,16);assert.ok(souls.every(s=>s.target===undefined&&Number.isFinite(s.vx)));
 advance(w,.6);assert.ok(e.hp<e.maxHP);assert.ok(e.fear>0);
});
test('swapping Shadowraze transfers Z/X/C and preserves the Sniper creep restriction',()=>{
 const {w}=arena('sniper'),e=enemy(w,700);hostCommand(w,{prank:'swapSkills',target:'sniper',other:'sf'});
 assert.equal(command(w,'sf',{type:'raze',raze:'near'}).ok,false);assert.equal(command(w,'sniper',{type:'raze',raze:'near',x:1200,y:465}).ok,true);advance(w,.5);assert.equal(e.hp,e.maxHP);
});
test('aim, raze warnings/cooldowns and ballistic velocities reach multiplayer clients via deltas',()=>{
 const {w,p}=arena('sf');enemy(w,1300);let before=wireWorld(w),view=applyNetFrame(null,{full:before});
 command(w,p.id,{type:'raze',raze:'mid',x:1200,y:465});command(w,p.id,{type:'attack',x:1200,y:465});
 for(let i=0;i<15;i++){step(w,.05);const next=wireWorld(w);view=applyNetFrame(view,JSON.parse(JSON.stringify(deltaFrame(before,next,w.events))));assert.deepEqual({...view,events:[]},next);if(i===0){assert.equal(view.casts.length,1);assert.ok(view.players.sf.razeMidCooldown>0);assert.equal(view.players.sf.razeNearCooldown,0);assert.ok(view.projectiles[0].vx>0);assert.equal(view.projectiles[0].vy,0);}before=next;}
});
