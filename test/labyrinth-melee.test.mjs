import test from 'node:test';
import assert from 'node:assert/strict';
import {HEROES} from '../dist/labyrinth-data.js';
import {createLabyrinthWorld,startLabyrinth,stepLabyrinth,labyrinthCommand} from '../dist/labyrinth-engine.js';
function game(hero){const w=createLabyrinthWorld({seed:9});labyrinthCommand(w,'s1',{type:'hero',hero});startLabyrinth(w,['s1']);w.phase='combat';w.obstacles=[];w.hazards=[];w.queue=[{id:'scout'}];w.spawnTimer=99;w.enemies=[];const p=w.players.s1;p.x=400;p.y=500;p.invuln=0;return w;}
function enemy(id,x,y){return {id,kind:'scout',x,y,hp:1000,maxHP:1000,radius:10,attack:0,range:100,interval:1,speed:0,attackCD:999,abilityCD:999,status:{},modifiers:[]}}
const tick=(w,n=6)=>{for(let i=0;i<n;i++)stepLabyrinth(w,.05)};
for(const hero of ['timber','jugger','mars','magnus'])test(`${hero} basic attack emits a forward semicircle and hits multiple targets once`,()=>{
 const w=game(hero),front=enemy(10,470,470),front2=enemy(11,475,530),back=enemy(12,300,500),out=enemy(13,700,500);w.enemies=[front,front2,back,out];
 assert.equal(labyrinthCommand(w,'s1',{type:'attack',x:800,y:500}).ok,true);
 assert.ok(w.projectiles.some(q=>q.kind==='melee_wave'));assert.equal(front.hp,1000);
 tick(w);assert.ok(front.hp<1000);assert.ok(front2.hp<1000);assert.equal(back.hp,1000);assert.equal(out.hp,1000);
 const dealt=1000-front.hp;assert.ok(dealt>0&&dealt<100);const hp=front.hp;tick(w);assert.equal(front.hp,hp);
});
test('melee waves respect walls, aim, and finite range',()=>{
 const w=game('mars'),target=enemy(10,480,500),side=enemy(11,400,580);w.enemies=[target,side];w.obstacles=[{x:455,y:450,w:20,h:100}];
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});tick(w);assert.equal(target.hp,1000);assert.ok(side.hp<1000);
});
test('ranged basic attacks remain ordinary projectiles',()=>{
 const w=game('drow');w.enemies=[enemy(10,500,500)];labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.ok(w.projectiles.some(q=>q.owner==='s1'&&q.kind!=='melee_wave'));tick(w);assert.ok(w.enemies[0].hp<1000);
});
test('in-flight melee waves survive a JSON roundtrip',()=>{
 const a=game('mars');a.enemies=[enemy(10,550,500)];labyrinthCommand(a,'s1',{type:'attack',x:800,y:500});stepLabyrinth(a,.05);
 const b=JSON.parse(JSON.stringify(a));tick(a);tick(b);assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
});
test('Empower cleave and Maelstrom proc once on the first wave contact',()=>{
 const w=game('mars'),p=w.players.s1,first=enemy(10,470,500),second=enemy(11,485,500);w.enemies=[first,second];
 p.items=['maelstrom'];p.attackCount=3;p.status.empower=5;p.empowerBonus=.25;p.empowerCleave=.25;
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});tick(w);
 const basic=(48+15)*1.25;
 assert.ok(Math.abs(first.hp-(1000-basic-80))<1e-7);
 assert.ok(Math.abs(second.hp-(1000-basic*.25-80-basic))<1e-7);
});

for(const hero of ['timber','jugger','mars','magnus'])test(`${hero} wave has half the original radius`,()=>{
 const w=game(hero),range=HEROES.find(h=>h.id===hero).range/2;
 const inside=enemy(21,400+range+9,500),outside=enemy(22,400+range+11,500);w.enemies=[inside,outside];
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});assert.equal(w.projectiles[0].range,range);tick(w);assert.ok(inside.hp<1000);assert.equal(outside.hp,1000);
});
