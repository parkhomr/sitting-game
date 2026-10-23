import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,HEROES,step,startRoshan,hit} from '../dist/engine.js';
import {wireWorld,deltaFrame,applyNetFrame,MotionBuffer} from '../dist/netcode.js';
test('compact deltas reconstruct changing battles, hero skills and entity removals',()=>{
  const w=createWorld();w.started=true;let previous=wireWorld(w),view=applyNetFrame(null,{full:previous}),bytes=0,fullBytes=0;
  for(let i=0;i<2400;i++){
    step(w,.05,HEROES.map(h=>h.id));const current=wireWorld(w),packet=deltaFrame(previous,current,w.events);
    view=applyNetFrame(view,JSON.parse(JSON.stringify(packet)));
    assert.deepEqual({...view,events:[]},current);
    bytes+=JSON.stringify(packet).length;fullBytes+=JSON.stringify(w).length;previous=current;
  }
  assert.ok(bytes<fullBytes*.45,`wire size ${bytes}/${fullBytes}`);
  console.log(`Delta payload: ${Math.round(bytes/2400)} bytes/frame, ${Math.round((1-bytes/fullBytes)*100)}% less than old full snapshots`);
});
test('motion interpolation advances projectiles between network frames without mutating combat',()=>{
  const buffer=new MotionBuffer(),w=createWorld();w.enemies=[{id:1,x:1000,y:350}];w.projectiles=[{id:2,x:100,y:200,target:1}];
  buffer.push(structuredClone(w),0);w.projectiles[0].x=150;buffer.push(structuredClone(w),50);w.projectiles[0].x=200;buffer.push(structuredClone(w),100);
  const a=buffer.sample(150),b=buffer.sample(160);assert.equal(a.projectiles[0].x,175);assert.equal(b.projectiles[0].x,185);assert.equal(w.projectiles[0].x,200);
  assert.ok(buffer.sample(5000).projectiles[0].x<500,'extrapolation is bounded');
  buffer.clear();assert.equal(buffer.sample(0),null);
});

test('Roshan flags, rage, death and the reward reach clients through compact deltas',()=>{
  const w=createWorld();w.started=true;w.wave=30;let previous=wireWorld(w),view=applyNetFrame(null,{full:previous});
  function sync(){const next=wireWorld(w);view=applyNetFrame(view,JSON.parse(JSON.stringify(deltaFrame(previous,next,w.events))));assert.deepEqual({...view,events:[]},next);previous=next;}
  startRoshan(w);sync();assert.equal(view.enemies[0].boss,true);assert.equal(view.phase,'boss');
  w.enemies[0].hp=w.enemies[0].maxHP*.3;step(w,.05);sync();assert.equal(view.enemies[0].enraged,true);
  hit(w,{hero:'drow',damage:1e9},w.enemies[0]);step(w,.05);sync();assert.equal(view.bossKills,1);assert.equal(view.wave,31);assert.equal(view.enemies.length,0);
});
