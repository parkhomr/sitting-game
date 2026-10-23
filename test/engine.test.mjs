import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HEROES,ENEMY_HEROES,createWorld,waveRules,command,hostCommand,step,spawnEnemy as spawnFarEnemy,startTeamfight,enemyAbility,hit,maxHP,restoreWorld,startRoshan,allowedTarget} from '../dist/engine.js';
const allBots=HEROES.map(h=>h.id);
function spawnEnemy(w){const e=spawnFarEnemy(w);e.x=550;e.y=550;return e;}
test('spell swaps carry the new visual kit while normal attacks keep the hero identity',()=>{
  const w=createWorld();w.started=true;const target=spawnEnemy(w);target.hp=target.maxHP=10000;
  hostCommand(w,{prank:'swapSkills',target:'sf',other:'rubick'});
  command(w,'sf',{type:'ability',seq:77});const spell=w.events.at(-1);
  assert.equal(spell.skill,'rubick');assert.equal(spell.hero,'sf');assert.equal(spell.inputSeq,77);assert.ok(spell.points.length>0);
  command(w,'sf',{type:'attack',seq:78});assert.equal(w.events.at(-1).skill,'sf');
});
test('waves add stronger, faster, more frequent creeps',()=>{
  for(let wave=1;wave<25;wave++){const a=waveRules(wave),b=waveRules(wave+1);assert.ok(b.count>a.count);assert.ok(b.hp>a.hp);assert.ok(b.damage>a.damage);assert.ok(b.speed>a.speed);assert.ok(b.interval<=a.interval);}
});
test('four regular heroes have different abilities, Sniper waits for heroes',()=>{
  for(const [id,count] of [['drow',5],['timber',8],['sf',6],['rubick',6]]){const w=createWorld();w.started=true;spawnEnemy(w);assert.equal(command(w,id,{type:'ability'}).ok,true);assert.equal(w.projectiles.length,count);assert.ok(w.players[id].cooldown>0);}
  const w=createWorld();w.started=true;const e=spawnEnemy(w);e.hp=1;
  assert.equal(command(w,'sniper',{type:'ability'}).ok,false);assert.equal(command(w,'sniper',{type:'attack'}).ok,false);
  hit(w,{hero:'sniper',damage:1e9,execute:true,threshold:1},e);assert.equal(e.hp,1);assert.equal(w.players.sniper.kills,0);
});
test('Emir executes low enemy heroes and receives last-hit reward exactly once',()=>{
  const w=createWorld();w.started=true;w.wave=3;startTeamfight(w);const e=w.enemies[0];e.x=550;e.y=550;e.hp=e.maxHP*.25;
  assert.equal(command(w,'sniper',{type:'attack'}).ok,false);assert.equal(command(w,'sniper',{type:'ability'}).ok,true);
  const shot=w.projectiles[0];hit(w,shot,e);const gold=w.players.sniper.gold;
  assert.equal(e.hp,0);assert.equal(w.players.sniper.heroKills,1);assert.ok(gold>100);hit(w,shot,e);assert.equal(w.players.sniper.gold,gold);
});
test('swapping spells never removes Emir’s creep restriction',()=>{
  const w=createWorld();w.started=true;spawnEnemy(w);
  assert.equal(hostCommand(w,{prank:'swapSkills',target:'sniper',other:'timber'}).ok,true);
  assert.equal(w.players.sniper.skill,'timber');assert.equal(command(w,'sniper',{type:'ability'}).ok,false);
  assert.equal(command(w,'timber',{type:'ability'}).ok,false);
  hostCommand(w,{prank:'resetSkills'});assert.equal(w.players.sniper.skill,'sniper');
});
test('every third wave enters a random five-hero fight',()=>{
  const compositions=new Set();for(let i=1;i<12;i++){const w=createWorld();w.seed=i;w.started=true;w.wave=3;w.spawned=waveRules(3).count;step(w,.05);assert.equal(w.phase,'teamfight');assert.equal(w.enemies.length,5);assert.equal(new Set(w.enemyTeam).size,5);compositions.add(w.enemyTeam.join(','));}assert.ok(compositions.size>5);
});
test('all twelve enemy kits change combat state and announce their actual skill',()=>{
  for(const kit of ENEMY_HEROES){
    const w=createWorld();w.started=true;w.wave=3;startTeamfight(w);const e=w.enemies[0];e.kit=kit.id;e.x=550;e.y=550;e.hp=e.maxHP*.5;
    for(const other of w.enemies)other.hp=other.maxHP*.5;
    const before=JSON.stringify([w.players,w.enemies,w.pendingStrike]);enemyAbility(w,e);
    assert.notEqual(JSON.stringify([w.players,w.enemies,w.pendingStrike]),before,kit.id);
    assert.equal(w.events.at(-1).skill,kit.skill);
  }
});
test('stuns suppress attacks and fallen heroes revive without ending the game',()=>{
  const w=createWorld();w.started=true;const p=w.players.drow;p.stun=2;spawnEnemy(w);
  step(w,.1);assert.equal(w.projectiles.some(s=>s.hero==='drow'),false);p.hp=0;p.respawn=1;
  for(let i=0;i<11;i++)step(w,.1);assert.equal(p.respawn,0);assert.ok(p.hp>0);assert.equal(w.started,true);
});
test('team wipe loses ten percent gold, then resumes endless farming',()=>{
  const w=createWorld();w.started=true;w.wave=3;startTeamfight(w);
  for(const p of Object.values(w.players)){p.gold=100;p.hp=0;p.respawn=8;}
  step(w,.05);assert.equal(w.losses,1);assert.equal(w.wave,4);assert.equal(w.phase,'farm');assert.equal(w.players.drow.gold,90);assert.equal(w.started,true);
});
test('teamfight victory advances the wave and keeps score',()=>{
  const w=createWorld();w.started=true;w.wave=3;startTeamfight(w);
  for(let i=0;i<30;i++)for(const e of w.enemies)hit(w,{hero:'drow',damage:1e8},e);
  step(w,.05);assert.equal(w.wins,1);assert.equal(w.heroKills,5);assert.equal(w.wave,4);
});
test('host pranks swap spells, expire, and preserve identity',()=>{
  const w=createWorld();w.started=true;hostCommand(w,{prank:'swapSkills',target:'drow',other:'sf'});assert.equal(w.players.drow.id,'drow');assert.equal(w.players.drow.skill,'sf');
  hostCommand(w,{prank:'goldRain'});assert.equal(w.players.sniper.gold,300);
  hostCommand(w,{prank:'bonk',target:'rubick'});hostCommand(w,{prank:'haste'});hostCommand(w,{prank:'bigHeads'});
  for(let i=0;i<161;i++)step(w,.1);
  assert.equal(w.players.rubick.stun,0);assert.equal(w.players.rubick.haste,0);assert.ok(w.seconds>w.bigHeadsUntil);
});
test('long run reaches multiple fights with no end state or invalid numbers',()=>{
  const w=createWorld();w.started=true;for(let i=0;i<18000;i++)step(w,.05,allBots);
  assert.ok(w.wave>9);assert.ok(w.wins+w.losses>=3);assert.equal(w.started,true);assert.ok(w.enemies.length<=80);
  for(const p of Object.values(w.players)){assert.ok(Number.isFinite(p.hp));assert.ok(p.gold>=0);assert.ok(p.level>3);assert.ok(p.hp<=maxHP(p));}
  const restored=restoreWorld(w);assert.equal(restored.wave,w.wave);assert.equal(restored.players.sniper.gold,w.players.sniper.gold);assert.equal(restored.started,false);
});

test('wave 30 spawns Roshan instead of five heroes, other third waves keep teamfights',()=>{
  const w=createWorld();w.started=true;w.wave=30;w.spawned=waveRules(30).count;
  assert.equal(waveRules(30).teamfight,false);assert.equal(waveRules(30).boss,true);
  assert.equal(waveRules(33).teamfight,true);assert.equal(waveRules(33).boss,false);
  step(w,.05);assert.equal(w.phase,'boss');assert.equal(w.enemies.length,1);
  assert.equal(w.enemies[0].kit,'roshan');assert.ok(w.enemies[0].maxHP>=60000);
  assert.ok(w.events.some(e=>e.type==='bossStart'));
});
test('Roshan resists hits, regenerates, bashes, claps and enrages at low HP',()=>{
  const w=createWorld();w.started=true;w.wave=30;startRoshan(w);const e=w.enemies[0];
  for(const p of Object.values(w.players)){p.auto=false;p.x=e.x-180;p.y=e.y;p.moveX=p.x;p.moveY=p.y;}
  hit(w,{hero:'drow',damage:100},e);assert.equal(e.maxHP-e.hp,65);
  e.hp=e.maxHP*.5;const before=e.hp;step(w,.1);assert.ok(e.hp>before);
  e.abilityTimer=0;step(w,.1);assert.ok(w.players.sf.stun>0||Object.values(w.players).some(p=>p.stun>0));
  assert.ok(w.events.some(e=>e.type==='bossAbility'&&e.skill==='Bash'));
  e.clapTimer=0;step(w,.1);assert.ok(w.events.some(e=>e.type==='bossAbility'&&e.skill==='Thunder Clap'));
  assert.ok(Object.values(w.players).every(p=>p.hp<maxHP(p)));
  e.hp=e.maxHP*.34;step(w,.1);assert.equal(e.enraged,true);assert.ok(w.events.some(e=>e.type==='bossEnrage'));
});
test('Emir cannot bypass Roshan protection even with a swapped skill or stale shot',()=>{
  const w=createWorld();w.started=true;w.wave=30;startRoshan(w);const e=w.enemies[0],p=w.players.sniper;e.x=550;e.y=550;
  e.hp=e.maxHP*.25;
  assert.equal(allowedTarget(p,e,true),false);assert.equal(command(w,'sniper',{type:'ability'}).ok,false);
  hit(w,{hero:'sniper',execute:true,threshold:.3,damage:1e9},e);assert.equal(e.hp,e.maxHP*.25);
  hostCommand(w,{prank:'swapSkills',target:'sniper',other:'timber'});
  assert.equal(command(w,'sniper',{type:'ability'}).ok,false);
  e.hp=e.maxHP*.07;assert.equal(command(w,'sniper',{type:'attack'}).ok,false);
  assert.equal(command(w,'sniper',{type:'ability'}).ok,true);
  const shot=w.projectiles[0];hit(w,shot,e);const gold=p.gold;
  assert.equal(e.hp,0);assert.equal(w.bossKills,1);assert.equal(w.heroKills,0);assert.equal(w.kills,0);
  hit(w,shot,e);assert.equal(p.gold,gold);
  step(w,.05);assert.equal(w.wave,31);assert.equal(w.phase,'farm');assert.equal(w.started,true);
  assert.equal(restoreWorld(w).bossKills,1);
});
test('Roshan wipe and timeout retry wave 30 with a gold penalty and full recovery',()=>{
  for(const timeout of [false,true]){
    const w=createWorld();w.started=true;w.wave=30;startRoshan(w);
    for(const p of Object.values(w.players)){p.gold=100;if(!timeout){p.hp=0;p.respawn=8;}}
    if(timeout)w.fightTime=180;
    step(w,.05);assert.equal(w.wave,30);assert.equal(w.phase,'boss');assert.equal(w.bossKills,0);
    assert.equal(w.breakTime,5);assert.equal(w.enemies[0].hp,w.enemies[0].maxHP);
    for(const p of Object.values(w.players)){assert.equal(p.gold,90);assert.equal(p.respawn,0);assert.equal(p.hp,maxHP(p));}
    assert.equal(command(w,'drow',{type:'ability'}).ok,false);
    assert.ok(w.events.some(e=>e.type==='bossEnd'&&!e.won));
  }
});
test('a naturally upgraded party has sustained teamfights and can defeat wave-30 Roshan',()=>{
  const w=createWorld();w.started=true;w.seed=5;let phase=w.phase,start=0;const durations=[];
  for(let i=0;i<60000&&w.wave<=30;i++){
    step(w,.05,allBots);
    if(w.phase!==phase){if(w.phase==='teamfight')start=w.seconds;else if(phase==='teamfight')durations.push(w.seconds-start);phase=w.phase;}
  }
  assert.equal(w.wave,31);assert.equal(w.bossKills,1);assert.equal(w.started,true);
  assert.equal(durations.length,9);assert.ok(durations.every(s=>s>=10),'fights cannot evaporate on first volley');
  assert.ok(durations.reduce((a,b)=>a+b,0)/durations.length>=20);
});
