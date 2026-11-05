import test from 'node:test';import assert from 'node:assert/strict';
import {createLabyrinthWorld,startLabyrinth,labyrinthCommand,labyrinthManaCost} from '../dist/labyrinth-engine.js';
function game(hero){const w=createLabyrinthWorld({seed:1});labyrinthCommand(w,'s1',{type:'hero',hero});startLabyrinth(w,['s1']);w.phase='combat';w.players.s1.skillRanks=[1,1,1,1];return w;}
test('skill mana display uses actual rounded, capped shard cost',()=>{
 const w=game('drow'),p=w.players.s1;p.shards=['mana_cost','mana_cost'];
 assert.equal(labyrinthManaCost(w,p,0),35);const before=p.mana;
 assert.equal(labyrinthCommand(w,p.id,{type:'cast',slot:0,x:800,y:500}).ok,true);assert.equal(before-p.mana,35);
 p.shards=Array(10).fill('mana_cost');assert.equal(labyrinthManaCost(w,p,0),23);
});
test('passive slots have no mana cost and Rubick stolen casts cost zero',()=>{
 const w=game('rubick'),p=w.players.s1;assert.equal(labyrinthManaCost(w,p,2),null);assert.equal(labyrinthManaCost(w,p,3),100);
 p.stolen={kind:'hellbear',expires:w.seconds+10,charges:1};assert.equal(labyrinthManaCost(w,p,3),0);
});
test('HUD maximums include shard and item bonuses',async()=>{
 const {labyrinthMaxHP,labyrinthMaxMana}=await import('../dist/labyrinth-engine.js');
 const w=game('drow'),p=w.players.s1;p.shards=['hp','mana'];p.items=['bracer','null'];
 assert.equal(labyrinthMaxHP(p),720+180+180);assert.equal(labyrinthMaxMana(p),360+120+100);
});
test('Rubick stolen recast really spends zero mana',()=>{
 const w=game('rubick'),p=w.players.s1;p.level=4;p.stolen={kind:'hellbear',expires:w.seconds+10,charges:1};const before=p.mana;
 assert.equal(labyrinthCommand(w,p.id,{type:'cast',slot:3,x:800,y:500}).ok,true);assert.equal(p.mana,before);assert.equal(p.stolen,null);
});
