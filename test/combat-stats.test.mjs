import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,spawnEnemy,command,step,hit,enemyAbility,restoreWorld,SKILL_UPGRADES,MAX_SKILL_RANK,upgradeCost,upgradeInfo,skillMultiplier,abilityCooldown,abilityCount,shrapnelRules,stealThreshold,manaRegen,maxMana} from '../dist/engine.js';
function world(){const w=createWorld();w.started=true;w.seed=42;w.spawnTimer=1e6;for(const p of Object.values(w.players))p.auto=false;return w;}
function enemy(w,data={}){const e=spawnEnemy(w);Object.assign(e,{x:600,y:600,hp:1000,maxHP:1000,speed:0,damage:0,abilityTimer:1e6,attackTimer:1e6},data);return e;}
function advance(w,seconds){for(let t=0;t<seconds-.00001;t+=.05)step(w,.05);}
test('damage statistics count actual post-mitigation damage, ignore overkill and partition targets',()=>{
 const w=world(),p=w.players.sf,e=enemy(w,{hero:true,kit:'lina',resistance:.5});
 hit(w,{hero:'sf',skill:'sf',ability:true,damage:200},e);assert.equal(p.damageDealt,100);assert.equal(p.heroDamage,100);assert.equal(p.spellDamage,100);
 hit(w,{hero:'sf',damage:1e9},e);assert.equal(p.damageDealt,1000);assert.equal(p.heroDamage,1000);assert.equal(p.spellDamage,100);assert.equal(p.heroKills,1);
 hit(w,{hero:'sf',damage:1e9},e);assert.equal(p.heroKills,1);assert.equal(p.damageDealt,1000);
 const creep=enemy(w,{hp:50,maxHP:50});hit(w,{hero:'sf',damage:200},creep);assert.equal(p.creepDamage,50);assert.equal(p.kills,1);
 const boss=enemy(w,{boss:true,hp:75,maxHP:75});hit(w,{hero:'sf',damage:200},boss);assert.equal(p.bossDamage,75);assert.equal(p.bossKills,1);assert.equal(p.heroKills,1);
 assert.equal(p.damageDealt,p.heroDamage+p.creepDamage+p.bossDamage);step(w,.05);assert.ok(p.dps>0);advance(w,5.2);assert.equal(p.dps,0);
});
test('hero assists require recent effective damage or cyclone and are awarded once',()=>{
 const w=world(),e=enemy(w,{hero:true,kit:'lina'});
 hit(w,{hero:'drow',damage:10},e);hit(w,{hero:'sf',damage:20},e);e.hp=100;
 hit(w,{hero:'sniper',ability:true,execute:true,threshold:.32,damage:1e9},e);
 assert.equal(w.players.sniper.heroKills,1);assert.equal(w.players.drow.assists,1);assert.equal(w.players.sf.assists,1);assert.equal(w.players.rubick.assists,0);
 hit(w,{hero:'sniper',ability:true,execute:true,threshold:.32,damage:1e9},e);assert.equal(w.players.drow.assists,1);
 const old=enemy(w,{hero:true,kit:'lina'});hit(w,{hero:'drow',damage:10},old);w.seconds+=13;hit(w,{hero:'sf',damage:1e9},old);assert.equal(w.players.drow.assists,1);
 const controlled=enemy(w,{hero:true,kit:'lina'});command(w,'sf',{type:'aim',x:controlled.x,y:controlled.y-35});assert.equal(command(w,'sf',{type:'eul'}).ok,true);controlled.cyclone=0;hit(w,{hero:'timber',damage:1e9},controlled);assert.equal(w.players.sf.assists,2);
});
test('enemy basic attacks create flying projectiles and deal damage only on arrival',()=>{
 const w=world(),p=w.players.drow;for(const other of Object.values(w.players)){other.x=100;other.y=850;}p.x=800;p.y=500;p.moveX=p.x;p.moveY=p.y;
 const e=enemy(w,{x:1100,y:500,ranged:true,damage:100,attackTimer:0});
 step(w,.05);assert.equal(p.hp,650);assert.equal(p.damageTaken,0);const shot=w.projectiles.find(s=>s.hostile);assert.ok(shot);assert.equal(shot.targetPlayer,'drow');assert.ok(shot.x<1100&&shot.x>p.x);
 advance(w,.7);assert.ok(p.hp<650);assert.equal(p.damageTaken,100);assert.ok(w.events.some(e=>e.type==='enemyImpact'));
});
test('death is counted once and projectiles from a previous life cannot hit a respawned hero',()=>{
 const w=world(),p=w.players.drow;for(const other of Object.values(w.players)){other.x=100;other.y=900;}p.x=800;p.y=500;p.moveX=p.x;p.moveY=p.y;
 enemy(w,{x:1100,y:500,ranged:true,damage:100000,attackTimer:0});step(w,.05);const shot=w.projectiles.find(s=>s.hostile);assert.ok(shot);
 advance(w,.7);assert.equal(p.deaths,1);assert.ok(p.respawn>0);assert.equal(p.damageTaken,650);
 w.projectiles.push({...shot,id:w.nextId++,done:false,x:800,y:465,life:3});p.respawn=0;p.hp=650;step(w,.05);assert.equal(p.hp,650);assert.equal(p.deaths,1);
});
test('every hero buys three skill-specific branches, capped upgrades cannot charge gold',()=>{
 for(const id of ['drow','timber','sf','rubick','sniper']){
  const w=world(),p=w.players[id];p.gold=1000000;
  const before=skillMultiplier(p),cd=abilityCooldown(p),count=abilityCount(p),shrapnel=shrapnelRules(p);
  for(const type of SKILL_UPGRADES){const cost=upgradeCost(p,type),gold=p.gold;assert.equal(command(w,id,{type:'upgrade',upgrade:type}).ok,true,id);assert.equal(p.gold,gold-cost);assert.equal(p[type],1);assert.ok(upgradeInfo(p,type).name);}
  assert.ok(skillMultiplier(p)>before);assert.ok(abilityCooldown(p)<cd);assert.ok(abilityCount(p)>=count);
  if(id==='sniper'){assert.ok(shrapnelRules(p).radius>shrapnel.radius);assert.ok(shrapnelRules(p).damage>shrapnel.damage);assert.ok(shrapnelRules(p).duration>shrapnel.duration);}
  p.skillPower=MAX_SKILL_RANK;const gold=p.gold;assert.equal(command(w,id,{type:'upgrade',upgrade:'skillPower'}).ok,false);assert.equal(p.gold,gold);
  assert.equal(command(w,id,{type:'upgrade',upgrade:'damage'}).ok,false,'generic upgrades were retired');
 }
});
test('Emir upgrades are expensive and each adds exactly one percentage point to steals',()=>{
 const w=world(),p=w.players.sniper;assert.ok(upgradeCost(p,'skillPower')>=3*upgradeCost(w.players.drow,'skillPower'));p.gold=100000;
 for(const type of SKILL_UPGRADES){const before=stealThreshold(p,true),boss=stealThreshold(p,true,true);command(w,p.id,{type:'upgrade',upgrade:type});assert.ok(Math.abs(stealThreshold(p,true)-before-.01)<1e-10);assert.ok(Math.abs(stealThreshold(p,true,true)-boss-.01)<1e-10);}
 const e=enemy(w,{hero:true,kit:'lina',hp:340,maxHP:1000});assert.equal(command(w,'sniper',{type:'ability'}).ok,true);hit(w,w.projectiles[0],e);assert.equal(e.hp,0);
 p.skillPower=p.skillHaste=p.skillTalent=MAX_SKILL_RANK;assert.equal(stealThreshold(p,true),.60);assert.equal(stealThreshold(p,true,true),.25);
});
test('a replacement bot continues buying other branches after one skill reaches its cap',()=>{
 const w=world(),p=w.players.drow;p.gold=10000;p.skillPower=MAX_SKILL_RANK;
 step(w,.05,['drow']);for(let i=0;i<11;i++)step(w,.05,['drow']);assert.equal(p.skillPower,MAX_SKILL_RANK);assert.equal(p.skillHaste,1);assert.equal(p.skillTalent,1);
});
test('shrapnel deals repeated area damage, slows, leaves creeps alive and respects mana/cooldown',()=>{
 const w=world(),p=w.players.sniper,e=enemy(w,{hp:20,maxHP:1000}),out=enemy(w,{x:1400,y:900});
 const mp=p.mana;assert.equal(command(w,p.id,{type:'shrapnel',x:e.x,y:e.y}).ok,true);assert.equal(p.mana,mp-80);assert.equal(command(w,p.id,{type:'shrapnel'}).ok,false);
 advance(w,2);assert.ok(e.slow>0);assert.ok(e.hp<20);assert.equal(out.hp,1000);assert.ok(p.creepDamage>0);advance(w,4);assert.equal(e.hp,1);assert.equal(p.kills,0);assert.equal(w.zones.length,0);assert.equal(p.creepDamage,19);
 const fractional=enemy(w,{hp:.5});hit(w,{hero:'sniper',kind:'shrapnel',ability:true,damage:100},fractional);assert.equal(fractional.hp,.5,'shrapnel never heals an enemy up to one HP');
 const hero=enemy(w,{hero:true,kit:'lina',hp:300});p.shrapnelCooldown=0;p.mana=360;command(w,p.id,{type:'shrapnel',x:hero.x,y:hero.y});advance(w,.1);hit(w,{hero:'sf',damage:1e9},hero);assert.equal(p.assists,1);
 p.shrapnelCooldown=0;p.mana=79;assert.equal(command(w,p.id,{type:'shrapnel'}).ok,false);assert.equal(command(w,'drow',{type:'shrapnel'}).ok,false);
});
test('mana regeneration is roughly one quarter of the old rate and statistics survive restore',()=>{
 const w=world(),p=w.players.sf;for(const level of [1,15,40]){p.level=level;const old=3+maxMana(p)*.012;assert.ok(manaRegen(p)<old*.28);assert.ok(manaRegen(p)>old*.24);}
 p.skillPower=4;p.skillHaste=2;p.skillTalent=3;p.deaths=2;p.assists=5;p.damageDealt=12345.75;p.heroDamage=10000.5;p.creepDamage=2345.25;
 const restored=restoreWorld(JSON.parse(JSON.stringify(w))).players.sf;assert.equal(restored.skillPower,4);assert.equal(restored.deaths,2);assert.equal(restored.assists,5);assert.equal(restored.damageDealt,12345.75);assert.equal(restored.dps,0);
});
