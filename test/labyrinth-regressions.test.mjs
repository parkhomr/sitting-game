import test from 'node:test';
import assert from 'node:assert/strict';
import {createLabyrinthWorld,startLabyrinth,stepLabyrinth,labyrinthCommand} from '../dist/labyrinth-engine.js';
function game(hero='drow') {
  const w=createLabyrinthWorld({seed:42});
  assert.equal(labyrinthCommand(w,'s1',{type:'hero',hero}).ok,true);
  assert.equal(startLabyrinth(w,['s1']).ok,true);
  w.phase='combat'; w.obstacles=[]; w.hazards=[]; w.queue=[{id:'scout'}];
  w.spawnTimer=100; w.enemies=[];
  const p=w.players.s1; p.x=200; p.y=500; p.invuln=0;
  return w;
}
function mob(id,x,y){return {id,kind:'scout',x,y,hp:1000,maxHP:1000,radius:10,attack:0,range:100,interval:1,speed:0,attackCD:999,abilityCD:999,status:{},modifiers:[]}}
test('a wiped party cannot complete a trap',()=>{
  const w=game(); w.roomType='trap'; w.trap={kind:'spikes',elapsed:4,timer:99,exitX:1470,exitY:500,switches:[]};
  w.players.s1.hp=0; stepLabyrinth(w,.05);
  assert.equal(w.phase,'defeat'); assert.equal(w.players.s1.hp,0);
});
test('a wiped party cannot win the flock reward on its last tick',()=>{
  const w=game(); w.roomType='flock'; w.flockTime=.01; w.players.s1.hp=0;
  stepLabyrinth(w,.05); assert.equal(w.phase,'defeat'); assert.equal(w.players.s1.hp,0);
});
for(const [id,delta,field] of [['hp',180,'hp'],['mana',120,'mana']]){
  test(`offer timeout applies ${id} max-stat increase like manual selection`,()=>{
    const a=game(),b=structuredClone(a);
    for(const w of [a,b]){w.phase='offer';w.phaseTime=.01;w.players.s1.offer=[{id}];}
    const before=a.players.s1[field];
    assert.equal(labyrinthCommand(a,'s1',{type:'offer',id}).ok,true);
    stepLabyrinth(b,.05);
    assert.equal(a.players.s1[field],before+delta+(field==='hp'?25:7));
    assert.equal(b.players.s1[field],a.players.s1[field]);
  });
}
test('Mars frontal armor behaves identically across the angle boundary',()=>{
  function damage(y){const w=game('mars'),p=w.players.s1;p.aimX=100;p.aimY=501;
    w.enemies=[mob(10,150,y)];const e=w.enemies[0];e.attack=100;e.attackCD=0;
    const hp=p.hp;stepLabyrinth(w,.05);return hp-p.hp;}
  assert.ok(Math.abs(damage(499.5)-damage(500.5))<1e-8);
});
test('fast projectiles cannot tunnel through a wall',()=>{
  const w=game();w.obstacles=[{x:450,y:450,w:10,h:100}];const e=mob(10,500,500);w.enemies=[e];
  w.projectiles=[{id:100,owner:'s1',x:400,y:500,vx:1000,vy:0,left:500,damage:100,type:'pure',radius:3}];
  stepLabyrinth(w,.1);assert.equal(e.hp,1000);assert.equal(w.projectiles.length,0);
});
test('non-piercing projectiles hit the closest target first, not array order',()=>{
  const w=game(),far=mob(10,490,500),near=mob(11,440,500);w.enemies=[far,near];
  w.projectiles=[{id:100,owner:'s1',x:400,y:500,vx:1000,vy:0,left:500,damage:100,type:'pure',radius:3}];
  stepLabyrinth(w,.1);assert.equal(far.hp,1000);assert.ok(near.hp<1000);
});
test('projectiles stop at their remaining range even during a long tick',()=>{
  const w=game(),e=mob(10,490,500);w.enemies=[e];
  w.projectiles=[{id:100,owner:'s1',x:400,y:500,vx:1000,vy:0,left:30,damage:100,type:'pure',radius:3}];
  stepLabyrinth(w,.1);assert.equal(e.hp,1000);assert.equal(w.projectiles.length,0);
});
test('piercing projectile resolves targets in travel order and stops at walls',()=>{
  const w=game(),far=mob(10,485,500),near=mob(11,430,500);w.enemies=[far,near];
  w.obstacles=[{x:460,y:450,w:10,h:100}];
  w.projectiles=[{id:100,owner:'s1',x:400,y:500,vx:1000,vy:0,left:500,damage:100,type:'pure',radius:3,pierce:true}];
  stepLabyrinth(w,.1);assert.ok(near.hp<1000);assert.equal(far.hp,1000);assert.equal(w.projectiles.length,0);
});
test('live world continues deterministically after JSON serialization',()=>{
  const a=game('drow');a.queue=[{id:'scout'},{id:'scout'}];a.spawnTimer=0;
  for(let i=0;i<40;i++)stepLabyrinth(a,.05);
  const b=JSON.parse(JSON.stringify(a));
  for(let i=0;i<120;i++){
    for(const w of [a,b]){const e=w.enemies[0];if(e)labyrinthCommand(w,'s1',{type:'attack',x:e.x,y:e.y});stepLabyrinth(w,.05);}
  }
  assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
});
test('seeded bot simulation is repeatable and exercises real combat',async()=>{
  const {simulate}=await import('../labyrinth/simulate.mjs');
  const options={seed:2,heroes:['drow','timber'],maxSeconds:20,trace:true};
  const a=simulate(options),b=simulate(options);
  assert.deepEqual(a,b);assert.equal(a.room,1);assert.ok(a.players.some(p=>p.stats.damage>0));
  assert.ok(a.trace.actions.some(([, , action])=>action.type==='attack'));
});
