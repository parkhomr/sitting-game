import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,command,step,spawnEnemy,HEROES,NEUTRALS,ARENA,moveSpeed,maxMana,manaCost,neutralAbility,hit,waveRules,restoreWorld} from '../dist/engine.js';
function arena(){const w=createWorld();w.started=true;w.spawnTimer=1e6;for(const p of Object.values(w.players))p.auto=false;return w;}
function foe(w,near=w.players.sf){const e=spawnEnemy(w);e.x=near.x+150;e.y=near.y;e.hp=e.maxHP=100000;e.speed=0;e.damage=0;return e;}
function advance(w,seconds){for(let t=0;t<seconds-.00001;t+=.05)step(w,.05);}
test('movement has bounded speed, normalized diagonals, map limits and a dead-man timeout',()=>{
 const w=arena(),p=w.players.drow,start={x:p.x,y:p.y};
 assert.equal(command(w,'drow',{type:'walk',dx:1,dy:1}).ok,true);step(w,.1);
 assert.ok(Math.abs(Math.hypot(p.x-start.x,p.y-start.y)-moveSpeed(p)*.1)<1e-6);
 advance(w,.5);const stopped={x:p.x,y:p.y};advance(w,.5);assert.equal(p.x,stopped.x);assert.equal(p.y,stopped.y);
 command(w,'drow',{type:'move',x:-1e10,y:1e10});advance(w,5);assert.equal(p.x,ARENA.minX);assert.equal(p.y,ARENA.maxY);
 assert.equal(command(w,'drow',{type:'move',x:NaN,y:0}).ok,false);
 p.stun=1;command(w,'drow',{type:'move',x:1200,y:300});const x=p.x;step(w,.1);assert.equal(p.x,x);
});
test('an attack needs range and its projectile originates at the moving hero',()=>{
 const w=arena(),p=w.players.drow,e=foe(w,p);e.x=1500;
 assert.equal(command(w,p.id,{type:'attack'}).ok,false);
 p.x=1250;p.y=e.y;assert.equal(command(w,p.id,{type:'attack'}).ok,true);
 assert.equal(w.projectiles[0].x,p.x+20);assert.equal(w.projectiles[0].y,p.y-45);
});
test('every Q consumes mana once, respects cooldown, recovers mana and keeps autos free',()=>{
 for(const id of ['drow','timber','sf','rubick','sniper']){
  const w=arena(),p=w.players[id],e=foe(w,p);if(id==='sniper'){e.hero=true;e.hp=e.maxHP*.2;}
  const before=p.mana,cost=manaCost(p);assert.equal(command(w,id,{type:'ability'}).ok,true,id);assert.equal(p.mana,before-cost);
  assert.equal(command(w,id,{type:'ability'}).ok,false);assert.equal(p.mana,before-cost);
  p.cooldown=0;p.mana=cost-1;assert.equal(command(w,id,{type:'ability'}).ok,false);assert.equal(p.cooldown,0);
  if(id==='sniper')e.hp=e.maxHP*.1;
  const mana=p.mana;assert.equal(command(w,id,{type:'attack'}).ok,true);assert.equal(p.mana,mana);
  advance(w,2);assert.ok(p.mana>mana);assert.ok(p.mana<=maxMana(p));
 }
});
test('SF can Eul then Requiem the landing target; cyclone is invulnerable and spells have separate costs',()=>{
 const w=arena(),p=w.players.sf,e=foe(w);command(w,'sf',{type:'target',enemy:e.id});
 assert.equal(command(w,'sf',{type:'eul'}).ok,true);assert.equal(p.mana,maxMana(p)-75);assert.equal(e.cyclone,2.5);
 const hp=e.hp;hit(w,{hero:'drow',damage:1000},e);assert.equal(e.hp,hp);
 assert.equal(command(w,'sf',{type:'eul'}).ok,false);
 assert.equal(command(w,'sf',{type:'ultimate'}).ok,true);assert.equal(p.mana,maxMana(p)-250);
 assert.equal(command(w,'sf',{type:'ability'}).ok,false);advance(w,3);
 assert.equal(p.channel,0);assert.ok(e.hp<hp);assert.ok(e.fear>0);assert.ok(w.events.some(e=>e.type==='requiem'));
 assert.ok(p.eulCooldown>0);assert.ok(p.ultCooldown>0);assert.equal(command(w,'drow',{type:'ultimate'}).ok,false);
});
test('Requiem rewards close positioning and stuns interrupt its preparation',()=>{
 const w=arena(),p=w.players.sf,near=foe(w);near.x=p.x+40;const far=foe(w);far.x=p.x+360;
 command(w,'sf',{type:'ultimate'});advance(w,1.8);assert.ok(near.maxHP-near.hp>far.maxHP-far.hp);
 const other=arena();foe(other);command(other,'sf',{type:'ultimate'});other.players.sf.stun=1;step(other,.05);assert.equal(other.players.sf.channel,0);assert.ok(other.events.some(e=>e.type==='channelCancel'));assert.equal(other.events.some(e=>e.type==='requiem'),false);
});
test('five neutral species spawn with extra HP, mana and real spell effects',()=>{
 const w=arena(),p=w.players.drow,types=new Set();
 for(let i=0;i<7;i++){w.spawned=i;const e=spawnEnemy(w);if(e.neutral){types.add(e.neutral);assert.ok(e.maxHP>waveRules(1).hp);assert.ok(e.mana>0);}}
 assert.deepEqual(types,new Set(NEUTRALS.map(h=>h.id)));
 for(const kit of NEUTRALS){
  const test=arena(),target=test.players.drow;for(const p of Object.values(test.players)){p.x=1700;p.y=900;}
  target.x=800;target.y=500;target.moveX=target.x;target.moveY=target.y;target.haste=5;
  const e=foe(test,target);e.neutral=kit.id;e.x=target.x+100;e.y=target.y;e.mana=e.maxMana=180;e.damage=30;
  const mana=e.mana;assert.equal(neutralAbility(test,e),true);assert.equal(e.mana,mana-kit.mana);assert.ok(e.abilityTimer>0);
  if(kit.id==='banisher'){assert.equal(target.haste,0);assert.ok(target.slow>0);}
  else{const mp=target.mana;advance(test,1.1);assert.ok(target.hp<450,kit.id);if(kit.id==='mindstealer')assert.ok(target.mana<mp-60);if(kit.id==='centaur')assert.ok(target.stun>0);if(kit.id==='hellbear')assert.ok(target.slow>0);}
 }
});
test('telegraphed Shockwave can be dodged by walking perpendicular to its path',()=>{
 const w=arena(),p=w.players.drow;for(const other of Object.values(w.players)){other.x=1700;other.y=900;}
 p.x=800;p.y=500;p.moveX=p.x;p.moveY=p.y;const e=foe(w,p);e.neutral='satyr';e.x=1000;e.mana=e.maxMana=180;e.damage=30;
 assert.equal(neutralAbility(w,e),true);command(w,p.id,{type:'move',x:800,y:800});advance(w,1.1);assert.equal(p.hp,450);assert.equal(w.hazards.length,0);
});
test('old saves preserve progress and initialize valid mana and positions',()=>{
 const old={version:2,wave:20,players:{sf:{level:25,gold:8000,kills:200,damage:12}}},w=restoreWorld(old),p=w.players.sf;
 assert.equal(w.wave,20);assert.equal(p.gold,8000);assert.equal(p.mana,maxMana(p));assert.ok(p.x>=ARENA.minX&&p.x<=ARENA.maxX);assert.ok(p.y>=ARENA.minY&&p.y<=ARENA.maxY);
});
