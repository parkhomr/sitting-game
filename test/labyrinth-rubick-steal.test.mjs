import test from 'node:test';import assert from 'node:assert/strict';
import {createLabyrinthWorld,startLabyrinth,stepLabyrinth,labyrinthCommand as cmd,labyrinthAdminCommand} from '../dist/labyrinth-engine.js';
function game(hero='rubick'){const w=createLabyrinthWorld({seed:3});cmd(w,'s1',{type:'hero',hero});startLabyrinth(w,['s1']);w.phase='combat';w.obstacles=[];w.queue=[];const p=w.players.s1;p.level=18;p.skillRanks=[4,4,4,3];p.mana=9999;p.cd=[0,0,0,0];p.x=800;p.y=500;return {w,p}}
const mob=(id,kind,x=1100,y=500,extra={})=>({id,kind,x,y,hp:99999,maxHP:99999,radius:22,attack:0,range:150,interval:1,speed:0,attackCD:999,abilityCD:0,status:{},modifiers:[],...extra});

test('elite casts feed Spell Steal; the copy is permanent and swappable',()=>{
 const {w,p}=game();
 // Nothing recorded yet: the steal fails without spending anything.
 const mana0=p.mana;assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1100,y:500}).ok,false);assert.equal(p.mana,mana0);
 // An elite ogre using its slam records the ability.
 w.enemies=[mob(1,'ogre',1100,500,{elite:true,name:'Ogre'})];stepLabyrinth(w,.05);
 assert.ok(w.lastStealable&&w.lastStealable.kind==='ogre'&&w.lastStealable.label==='Ogre');
 // Steal, then use the held spell: it persists past the cast.
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1100,y:500}).ok,true);
 assert.equal(p.stolen.kind,'ogre');
 const manaBefore=p.mana;
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1100,y:500}).ok,true);
 assert.equal(p.stolen.kind,'ogre');assert.equal(manaBefore-p.mana,100);
 assert.ok(p.stolen.readyAt>w.seconds,'held recast uses its own short cooldown');
 // The held spell cannot be spammed: while it recharges, recasting is blocked.
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1100,y:500}).ok,false);
 // While the held spell recharges, a fresh different ability replaces it.
 w.lastStealable={kind:'hellbear',label:'Elite Hellbear',x:900,y:500,at:w.seconds+1};
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:900,y:500}).ok,true);
 assert.equal(p.stolen.kind,'hellbear');
 // With the held spell READY, a fresh ability does not replace it: R casts the held copy.
 p.stolen.readyAt=0;w.lastStealable={kind:'ogre',label:'Ogre',x:1100,y:500,at:w.seconds+2};
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1100,y:500}).ok,true);
 assert.equal(p.stolen.kind,'hellbear');
 // Regular (non-elite) casts never feed the steal window.
 p.stolen=null;w.lastStealable=null;w.enemies=[mob(2,'ogre')];
 stepLabyrinth(w,.05);
 assert.equal(w.lastStealable,null);
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1100,y:500}).ok,false);
});

test('boss casts are stealable and carry the room signature',()=>{
 const {w,p}=game();w.room=5;w.roomType='boss';p.x=1200;p.y=600;
 w.enemies=[mob(3,'boss',1575,750,{boss:true,name:'Primal Beast',radius:60,armor:0,resist:0,interval:1.5,attackCD:999,phase:1})];
 stepLabyrinth(w,.05);
 assert.ok(w.lastStealable&&w.lastStealable.kind==='boss'&&w.lastStealable.room===5);
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1575,y:750}).ok,true);
 assert.equal(p.stolen.kind,'boss');
 assert.equal(cmd(w,'s1',{type:'cast',slot:3,x:1575,y:750}).ok,true,'held boss spell casts');
});

test('cheat commands: gamespeed scales the game, speed scales heroes, refresh clears cooldowns',()=>{
 const {w,p}=game('drow');
 assert.equal(labyrinthAdminCommand(w,{action:'gamespeed',value:10}).ok,false);
 assert.equal(labyrinthAdminCommand(w,{action:'gamespeed',value:.2}).ok,false);
 assert.equal(labyrinthAdminCommand(w,{action:'speed',value:10}).ok,false);
 w.enemies=[mob(9,'scout',1400,700)];
 assert.equal(labyrinthAdminCommand(w,{action:'gamespeed',value:2}).ok,true);
 let before=w.seconds;stepLabyrinth(w,.04);assert.ok(Math.abs(w.seconds-before-.08)<1e-9);
 assert.equal(labyrinthAdminCommand(w,{action:'gamespeed',value:1}).ok,true);
 before=w.seconds;stepLabyrinth(w,.04);assert.ok(Math.abs(w.seconds-before-.04)<1e-9);
 // Hero movement multiplier: speed 2 doubles walk distance per tick, enemies untouched.
 assert.equal(labyrinthAdminCommand(w,{action:'speed',value:2}).ok,true);
 cmd(w,'s1',{type:'walk',dx:1,dy:0});const x0=p.x;stepLabyrinth(w,.04);const fast=p.x-x0;
 assert.equal(labyrinthAdminCommand(w,{action:'speed',value:1}).ok,true);
 stepLabyrinth(w,.04);const normal=p.x-x0-fast;
 assert.ok(fast>normal*1.9&&fast<normal*2.1,'hero speed doubles movement');
 // Cooldown refresh covers abilities and items.
 p.cd=[3,3,3,3];p.itemCD={blade:7};
 assert.equal(labyrinthAdminCommand(w,{action:'refresh'}).ok,true);
 assert.deepEqual(p.cd,[0,0,0,0]);assert.deepEqual(p.itemCD,{});
 assert.equal(w.debugRun,true);
});
