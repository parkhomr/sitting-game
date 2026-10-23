import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ITEMS,HEROES,createWorld,spawnEnemy,command,step,hit,maxHP,damage,baseDamage,attackSpeed,hpRegen,hasItem,stealThreshold,restoreWorld,startTeamfight,startRoshan,teamfightHP} from '../dist/engine.js';
import {wireWorld,deltaFrame,applyNetFrame} from '../dist/netcode.js';
function arena(id='drow'){
 const w=createWorld();w.started=true;w.seed=1;w.spawnTimer=1e6;
 for(const p of Object.values(w.players)){p.x=p.moveX=65;p.y=p.moveY=900;}
 const p=w.players[id];p.x=p.moveX=700;p.y=p.moveY=500;return {w,p};
}
function enemy(w,x=1000,y=500,data={}){const e=spawnEnemy(w);Object.assign(e,{x,y,hp:10000,maxHP:10000,damage:0,speed:0,attackTimer:1e6,abilityTimer:1e6},data);return e;}
function advance(w,seconds){for(let t=0;t<seconds-.00001;t+=.05)step(w,.05);}
function hazard(w,p,data={}){w.hazards.push({id:w.nextId++,owner:0,x:p.x,y:p.y,radius:10,delay:.01,damage:100,kind:'test',...data});step(w,.05);}
function buyAll(w,p){p.gold=20000;for(const item of ITEMS)assert.equal(command(w,p.id,{type:'buy',item:item.id}).ok,true);}
test('shop spends gold once, rejects duplicates/invalid items and buffs current HP only by added maximum',()=>{
 for(const h of HEROES){const {w,p}=arena(h.id),base=maxHP(p),attack=damage(p),speed=attackSpeed(p);p.hp-=100;
  const saved=p.hp;assert.equal(command(w,p.id,{type:'buy',item:'heart'}).ok,false);buyAll(w,p);
  assert.equal(p.inventory,15);assert.equal(p.gold,10000);assert.equal(p.goldSpent,10000);assert.equal(p.hp,saved+maxHP(p)-base);assert.ok(damage(p)>attack);assert.ok(attackSpeed(p)>speed);
  const gold=p.gold;for(const item of ITEMS)assert.equal(command(w,p.id,{type:'buy',item:item.id}).ok,false);assert.equal(p.gold,gold);assert.equal(command(w,p.id,{type:'buy',item:'constructor'}).ok,false);
 }
});
test('BKB blocks spell control and reduces magic damage, while basic attacks remain dangerous',()=>{
 const {w,p}=arena();p.gold=2200;command(w,p.id,{type:'buy',item:'bkb'});const mana=p.mana;
 assert.equal(command(w,p.id,{type:'item',item:'bkb'}).ok,true);assert.equal(p.bkbLeft,6);assert.equal(p.bkbCooldown,35);assert.equal(p.mana,mana);
 hazard(w,p,{damage:400,stun:2,slow:3,manaBurn:100});assert.equal(p.damageTaken,100);assert.equal(p.stun,0);assert.equal(p.slow,0);assert.equal(p.mana,mana);
 assert.equal(command(w,p.id,{type:'item',item:'bkb'}).ok,false);
 const foe=enemy(w,1000,500,{damage:100,ranged:true,attackTimer:0});advance(w,.7);assert.equal(p.damageTaken,200);foe.attackTimer=1e6;
 advance(w,6);hazard(w,p,{damage:100,stun:2});assert.equal(p.damageTaken,300);assert.ok(p.stun>0);
});
test('Tarrasque regeneration accelerates after four seconds without damage and never exceeds max HP',()=>{
 const {w,p}=arena();p.gold=2800;command(w,p.id,{type:'buy',item:'heart'});hazard(w,p,{damage:500});
 const combat=hpRegen(w,p);advance(w,4.1);assert.ok(hpRegen(w,p)>combat*2);advance(w,20);assert.equal(p.hp,maxHP(p));
});
test('Daedalus crits only actual ordinary hits, without multiplying spell damage',()=>{
 const {w,p}=arena();p.gold=2600;command(w,p.id,{type:'buy',item:'daedalus'});const e=enemy(w);
 hit(w,{hero:p.id,skill:p.id,damage:100,ability:false},e);assert.ok(Math.abs((e.maxHP-e.hp)-220)<1e-6);
 const hp=e.hp;hit(w,{hero:p.id,skill:p.id,damage:100,ability:true},e);assert.equal(hp-e.hp,100);assert.equal(p.spellDamage,100);
});
test('Mjollnir chains only after a hit, damages at most three nearby enemies and cannot recursively proc',()=>{
 const {w,p}=arena();p.gold=2400;command(w,p.id,{type:'buy',item:'mjollnir'});const foes=[enemy(w,1000),enemy(w,1100),enemy(w,1200),enemy(w,1300),enemy(w,1700)];
 hit(w,{hero:p.id,skill:p.id,damage:100,ability:false},foes[0]);assert.equal(p.itemDamage,3*67);assert.equal(p.spellDamage,3*67);assert.equal(p.damageDealt,100+3*67);assert.equal(foes[3].hp,foes[3].maxHP);assert.equal(foes[4].hp,foes[4].maxHP);assert.equal(w.events.filter(e=>e.type==='lightning').length,1);
 hit(w,{hero:p.id,skill:p.id,damage:100,ability:false},foes[0]);assert.equal(w.events.filter(e=>e.type==='lightning').length,1);
});
test('Mjollnir static shield retaliates against an attacker, has cooldown and costs no mana',()=>{
 const {w,p}=arena();p.gold=2400;command(w,p.id,{type:'buy',item:'mjollnir'});const e=enemy(w,1000,500,{damage:50,ranged:true,attackTimer:0}),mana=p.mana;
 assert.equal(command(w,p.id,{type:'item',item:'mjollnir'}).ok,true);assert.equal(p.staticLeft,8);assert.equal(p.mjollnirCooldown,24);assert.equal(p.mana,mana);advance(w,.7);assert.ok(p.itemDamage>0);assert.ok(e.hp<e.maxHP);assert.equal(command(w,p.id,{type:'item',item:'mjollnir'}).ok,false);
});
test('Sniper items preserve the no-creep-last-hit rule and Daedalus grants a capped steal bonus',()=>{
 const {w,p}=arena('sniper'),e=enemy(w,1000,500,{hp:20});const threshold=stealThreshold(p,true);buyAll(w,p);assert.ok(Math.abs(stealThreshold(p,true)-threshold-.03)<1e-9);
 for(const kind of ['lightning','static','shrapnel']){hit(w,{hero:p.id,kind,damage:1000,ability:true},e);assert.equal(e.hp,1);}
 assert.equal(p.kills,0);hit(w,{hero:p.id,damage:1e8,ability:false},e);assert.equal(e.hp,1);
 const hero=enemy(w,1100,500,{hero:true,kit:'lina',hp:500,maxHP:1000});hit(w,{hero:p.id,kind:'lightning',damage:10,ability:true},hero);assert.equal(hero.hp,490,'item damage cannot execute high-HP heroes');
 p.skillPower=p.skillHaste=p.skillTalent=20;assert.equal(stealThreshold(p,true),.6);assert.equal(stealThreshold(p,true,true),.25);
});
test('five deaths consume exactly five lives; the fifth death never revives on later waves or bosses',()=>{
 const {w,p}=arena();enemy(w);for(let i=1;i<=5;i++){p.spawnShield=0;hazard(w,p,{damage:1e9});assert.equal(p.deaths,i);assert.equal(p.lives,5-i);hazard(w,p,{damage:1e9});assert.equal(p.deaths,i);if(i<5){advance(w,8.1);assert.ok(p.hp>0);assert.ok(p.spawnShield>0);}}
 advance(w,20);assert.equal(p.hp,0);assert.equal(command(w,p.id,{type:'attack'}).ok,false);assert.equal(command(w,p.id,{type:'buy',item:'heart'}).ok,false);
 w.wave=3;startTeamfight(w);assert.equal(p.lives,0);assert.equal(p.hp,0);w.wave=30;startRoshan(w);assert.equal(p.hp,0);assert.equal(p.lives,0);
});
test('respawn protection prevents immediate loss of a second life, including stuns and mana burn',()=>{
 const {w,p}=arena();hazard(w,p,{damage:1e9});advance(w,8.1);const lives=p.lives,hp=p.hp,mana=p.mana;
 hazard(w,p,{damage:1e9,stun:5,manaBurn:100});assert.equal(p.lives,lives);assert.equal(p.hp,hp);assert.equal(p.stun,0);assert.equal(p.mana,mana);
});
test('stuns have diminishing control: another spell cannot extend a stun-lock through the protection window',()=>{
 const {w,p}=arena();hazard(w,p,{damage:0,stun:5});assert.equal(p.stun,1.6);advance(w,1.7);assert.equal(p.stun,0);hazard(w,p,{damage:0,stun:5,hex:5});assert.equal(p.stun,0);assert.equal(p.hex,0);advance(w,2.6);hazard(w,p,{damage:0,stun:5});assert.equal(p.stun,1.6);
});
test('all eliminated ends the run and freezes combat; reload preserves lives and inventory',()=>{
 const {w,p}=arena();buyAll(w,p);for(const q of Object.values(w.players)){q.lives=0;q.hp=0;q.respawn=999999;}step(w,.05);assert.equal(w.gameOver,true);const seconds=w.seconds;step(w,.1);assert.equal(w.seconds,seconds);assert.equal(command(w,p.id,{type:'start'}).ok,false);
 const restored=restoreWorld(JSON.parse(JSON.stringify(w)));assert.equal(restored.gameOver,true);assert.equal(restored.players.drow.inventory,15);assert.equal(restored.players.drow.lives,0);assert.equal(restored.players.drow.hp,0);
 const old=restoreWorld({version:2,players:{drow:{deaths:100,gold:500}}});assert.equal(old.players.drow.lives,5,'old saves receive the new life budget');assert.equal(old.players.drow.gold,500);
});
test('level rewards cannot revive an eliminated hero and item purchases never refill lives',()=>{
 const {w,p}=arena();p.lives=1;buyAll(w,p);assert.equal(p.lives,1);p.lives=0;p.hp=0;p.respawn=999999;p.xp=99;const e=enemy(w,1000,500,{hp:1});hit(w,{hero:'sf',damage:1000},e);assert.ok(p.level>1);assert.equal(p.lives,0);assert.equal(p.hp,0);
});
test('manual fire and auto fire share one attack cooldown, so clicking cannot bypass attack speed',()=>{
 const {w,p}=arena();p.auto=true;assert.equal(command(w,p.id,{type:'attack',x:1200,y:465}).ok,true);step(w,.05);assert.equal(w.events.filter(e=>e.type==='shot'&&e.hero===p.id).length,1);assert.equal(command(w,p.id,{type:'attack'}).ok,false);advance(w,1);assert.ok(w.events.filter(e=>e.type==='shot'&&e.hero===p.id).length<=2);
});
test('buying more damage or HP does not secretly increase encounter HP or Roshan damage',()=>{
 const base=arena(),rich=arena();buyAll(rich.w,rich.p);for(const w of [base.w,rich.w]){w.seed=42;w.wave=12;startTeamfight(w);}assert.deepEqual(base.w.enemies.map(e=>e.maxHP),rich.w.enemies.map(e=>e.maxHP));assert.equal(base.w.enemies[0].maxHP,teamfightHP(12)*(base.w.enemies[0].kit==='axe'?1.3:1)|0);
 startRoshan(base.w);startRoshan(rich.w);assert.equal(base.w.enemies[0].maxHP,rich.w.enemies[0].maxHP);assert.equal(base.w.enemies[0].damage,rich.w.enemies[0].damage);
});
test('items, cooldowns, lives and end-of-run state survive compact network deltas',()=>{
 const {w,p}=arena();let before=wireWorld(w),view=applyNetFrame(null,{full:before});buyAll(w,p);command(w,p.id,{type:'item',item:'bkb'});command(w,p.id,{type:'item',item:'mjollnir'});
 function sync(){const next=wireWorld(w);view=applyNetFrame(view,JSON.parse(JSON.stringify(deltaFrame(before,next,w.events))));assert.deepEqual({...view,events:[]},next);before=next;}
 sync();assert.equal(view.players.drow.inventory,15);assert.equal(view.players.drow.bkbLeft,6);assert.equal(view.players.drow.staticLeft,8);p.spawnShield=0;hazard(w,p,{damage:1e9});sync();assert.equal(view.players.drow.lives,4);
 for(const q of Object.values(w.players)){q.lives=0;q.respawn=999999;q.hp=0;}step(w,.05);sync();assert.equal(view.gameOver,true);
});

test('a lethal hit still consumes the last life when static retaliation earns a level-up on that same hit',()=>{
 const {w,p}=arena();p.gold=2400;command(w,p.id,{type:'buy',item:'mjollnir'});command(w,p.id,{type:'item',item:'mjollnir'});p.lives=1;p.xp=99;const e=enemy(w,800,500,{hp:1});hazard(w,p,{damage:1e9,owner:e.id});assert.ok(p.level>1);assert.equal(e.hp,0);assert.equal(p.lives,0);assert.equal(p.hp,0);assert.equal(p.deaths,1);
});
