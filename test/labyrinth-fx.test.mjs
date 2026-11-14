import test from 'node:test';import assert from 'node:assert/strict';
import {HEROES,SKILLS} from '../dist/labyrinth-data.js';
import {createLabyrinthWorld,startLabyrinth,stepLabyrinth,labyrinthCommand as cmd} from '../dist/labyrinth-engine.js';
import {createCastFX,drawCastFX,createDeathFX,drawLabZone,drawLabProjectile,drawLabHeroAura,drawLabEnemyStatus} from '../dist/labyrinth-art.js';
// Recording stub context: every canvas call is counted, never executed.
function stubCtx(){const calls={n:0};const handler={get(t,prop){if(prop in t)return t[prop];return (...a)=>{calls.n++}}};const target={canvas:{width:2400,height:1500}};return new Proxy(target,{set(t,prop,v){t[prop]=v;return true},get(t,prop){if(prop==='__calls')return calls;if(prop in t)return t[prop];return (...a)=>{calls.n++}}})}
function game(id){let w=createLabyrinthWorld({seed:11});assert.ok(cmd(w,'s1',{type:'hero',hero:id}).ok);assert.ok(startLabyrinth(w,['s1']).ok);w.phase='combat';w.obstacles=[];w.hazards=[];w.queue=[];const e={id:9001,kind:'scout',x:800,y:500,hp:99999,maxHP:99999,radius:20,attack:0,range:100,interval:1,speed:0,attackCD:999,abilityCD:999,status:{},modifiers:[]};w.enemies=[e];const p=w.players.s1;p.x=400;p.y=500;p.level=18;p.skillRanks=[4,4,4,3];p.mana=99999;p.cd=[0,0,0,0];return {w,p,e}}
test('every active skill emits fx geometry and renders ground and air phases',()=>{for(const h of HEROES){for(let slot=0;slot<4;slot++){if(SKILLS[h.id][slot].passive)continue;const {w,p,e}=game(h.id);if(h.id==='rubick'&&slot===3){w.lastStealable={kind:'hellbear',x:e.x,y:e.y,at:w.seconds}}
 const r=cmd(w,'s1',{type:'cast',slot,x:e.x,y:e.y});assert.equal(r.ok,true,h.id+':'+slot+' cast failed: '+r.message);
 stepLabyrinth(w,.05);
 const casts=w.events.filter(ev=>ev.type==='cast'&&ev.slot===slot&&ev.player==='s1');assert.ok(casts.length>0,h.id+':'+slot+' no cast event');
 const f=createCastFX(casts[casts.length-1]);assert.ok(f,h.id+':'+slot+' produced no cast FX');assert.ok(f.dur>0&&f.dur<2);
 const c=stubCtx();drawCastFX(c,f,'ground');drawCastFX(c,f,'air');assert.ok(c.__calls.n>0,h.id+':'+slot+' drew nothing');
}}});
test('all ten heroes render a full frame of persistent visuals without errors',()=>{
 for(const h of HEROES){
  const {w,p,e}=game(h.id);
  // Learn and fire the ultimate too so its zones/projectiles exist where applicable.
  for(let slot=0;slot<4;slot++){if(SKILLS[h.id][slot].passive)continue;if(h.id==='rubick'&&slot===3)w.lastStealable={kind:'adept',x:e.x,y:e.y,at:w.seconds};cmd(w,'s1',{type:'cast',slot,x:e.x,y:e.y});stepLabyrinth(w,.05)}
  const c=stubCtx();
  for(const z of w.zones)drawLabZone(c,z,w);
  for(const q of w.projectiles)drawLabProjectile(c,q,w,h.id);
  drawLabHeroAura(c,p,w);
  for(const en of w.enemies){en.status.stun=1;en.status.slow=1;en.maledict={left:2,record:5,cap:10,ratio:.2};drawLabEnemyStatus(c,en,1)}
  assert.ok(c.__calls.n>0,h.id+' persistent visuals drew nothing');
  const deaths=w.events.filter(ev=>ev.type==='enemy_death');for(const d of deaths){const f=createDeathFX(d,w);assert.ok(f,'death fx missing');drawCastFX(c,f,'ground');drawCastFX(c,f,'air')}
 }});
test('warning zones sweep a countdown arc and prison cages render',()=>{
 const {w}=game('mars');
 w.zones.push({id:1,x:600,y:500,radius:120,left:1,dur:1,damage:10,kind:'warning',enemy:9001});
 w.zones.push({id:2,x:900,y:500,radius:80,left:2,dur:2,damage:0,kind:'prisonWarning',target:'s1',enemy:9001});
 const c=stubCtx();for(const z of w.zones)drawLabZone(c,z,w);assert.ok(c.__calls.n>20);
});
test('themed zones render for every fx tag',()=>{
 const {w}=game('mars');
 const base={id:0,x:800,y:500,radius:220,left:4,dur:4,damage:10,kind:'damage',owner:'s1'};
 for(const fx of ['chakram','shrapnel','frostfield',undefined]){const z={...base,fx};const c=stubCtx();drawLabZone(c,z,w);assert.ok(c.__calls.n>3,'zone fx '+fx+' drew nothing')}
 const ring={...base,kind:'ring',fx:'arena',radius:430};const c2=stubCtx();drawLabZone(c2,ring,w);assert.ok(c2.__calls.n>20);
 const heal={...base,kind:'heal',radius:280};const c3=stubCtx();drawLabZone(c3,heal,w);assert.ok(c3.__calls.n>6);
 const field={...base,kind:'enemyField'};const c4=stubCtx();drawLabZone(c4,field,w);assert.ok(c4.__calls.n>6);
});
test('hero projectiles render themed bodies at hitbox size',()=>{
 const {w}=game('mars');
 const mk=(hero,extra)=>({id:9,x:500,y:500,vx:600,vy:0,left:500,damage:10,type:'physical',radius:8,...extra});
 for(const h of HEROES){const c=stubCtx();drawLabProjectile(c,mk(h.id,{}),w,h.id);assert.ok(c.__calls.n>2,h.id+' projectile drew nothing')}
 const c=stubCtx();drawLabProjectile(c,mk('enemy',{enemy:9001,hook:false}),w,null);assert.ok(c.__calls.n>2);
 const c2=stubCtx();drawLabProjectile(c2,mk('hook',{enemy:9001,hook:true}),w,null);assert.ok(c2.__calls.n>4);
});
