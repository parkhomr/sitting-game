import test from 'node:test';
import assert from 'node:assert/strict';
import {HEROES,SKILLS} from '../dist/labyrinth-data.js';
import {createLabyrinthWorld,startLabyrinth,stepLabyrinth,labyrinthCommand} from '../dist/labyrinth-engine.js';
import {LAB_ATTACK_SOUNDS,LAB_SPELL_SOUNDS,LAB_PROC_SOUNDS,createLabAudio} from '../dist/labyrinth-audio.js';

function game(hero){const w=createLabyrinthWorld({seed:9});labyrinthCommand(w,'s1',{type:'hero',hero});startLabyrinth(w,['s1']);w.phase='combat';const p=w.players.s1;p.x=400;p.y=500;p.invuln=0;return w;}
const attackEvents=w=>w.events.filter(e=>e.type==='attack');
const procs=(w,kind)=>w.events.filter(e=>e.type==='proc'&&e.kind===kind);

for(const hero of HEROES.map(h=>h.id))test(`${hero} basic attack emits exactly one attack sound event`,()=>{
 const w=game(hero);
 assert.equal(labyrinthCommand(w,'s1',{type:'attack',x:800,y:500}).ok,true);
 const events=attackEvents(w);
 assert.equal(events.length,1);
 assert.equal(events[0].player,'s1');
 assert.equal(events[0].hero,hero);
 assert.ok(Number.isInteger(events[0].id));
 // While the attack is on cooldown nothing new is emitted.
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.equal(attackEvents(w).length,1);
 // The event survives the multiplayer full-state roundtrip unchanged.
 assert.deepEqual(JSON.parse(JSON.stringify(events[0])),events[0]);
});

test('no attack sound event outside combat or when dead',()=>{
 const w=game('drow');w.phase='prep';
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.equal(attackEvents(w).length,0);
 w.phase='combat';w.players.s1.hp=0;
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.equal(attackEvents(w).length,0);
});

function checkRecipe(id,recipe,maxLen){
 assert.ok(recipe&&Array.isArray(recipe.layers)&&recipe.layers.length>0,`${id} has layers`);
 assert.ok(Number.isFinite(recipe.pk)&&recipe.pk>=.4&&recipe.pk<=1.7,`${id} peak mix`);
 for(const s of recipe.layers){
  assert.ok(s.k==='tone'||s.k==='noise',`${id} step kind`);
  assert.ok(Number.isFinite(s.l)&&s.l>0&&s.l<=maxLen,`${id} step length`);
  assert.ok(Number.isFinite(s.v)&&s.v>0&&s.v<=.6,`${id} step volume`);
  assert.ok(Number.isFinite(s.f)&&s.f>0&&s.f<=8000,`${id} step frequency`);
  if(s.e!==undefined)assert.ok(Number.isFinite(s.e)&&s.e>0&&s.e<=9000,`${id} step end frequency`);
  if(s.at!==undefined)assert.ok(Number.isFinite(s.at)&&s.at>=0&&s.at<.25,`${id} step offset`);
  if(s.a!==undefined)assert.ok(s.a>=.0005&&s.a<=.05,`${id} fade-in`);
  if(s.r!==undefined)assert.ok(s.r>=.02&&s.r<=.06,`${id} fade-out`);
 }
}

test('every hero has a spec-compliant attack recipe and nothing else does',()=>{
 assert.deepEqual(Object.keys(LAB_ATTACK_SOUNDS).sort(),HEROES.map(h=>h.id).sort());
 for(const h of HEROES){
  checkRecipe(h.id,LAB_ATTACK_SOUNDS[h.id],.25); // one-shot ≤ 250 ms
  // Every attack recipe carries a 150–400 Hz body layer for weight.
  assert.ok(LAB_ATTACK_SOUNDS[h.id].layers.some(s=>s.k==='tone'&&s.f>=150&&s.f<=400&&s.l<=.12),`${h.id} body layer`);
 }
});

test('every castable spell has a sound; passive abilities stay silent',()=>{
 const expected=[];
 for(const h of HEROES)for(let slot=0;slot<4;slot++)if(!SKILLS[h.id][slot].passive)expected.push(h.id+':'+slot);
 assert.deepEqual(Object.keys(LAB_SPELL_SOUNDS).sort(),expected.sort());
 for(const [key,recipe] of Object.entries(LAB_SPELL_SOUNDS))checkRecipe(key,recipe,.25);
});

test('exactly the four proc sounds exist',()=>{
 assert.deepEqual(Object.keys(LAB_PROC_SOUNDS).sort(),['bladedance','bulwark','headshot','reactive']);
 for(const [kind,recipe] of Object.entries(LAB_PROC_SOUNDS))checkRecipe(kind,recipe,.08);
});

test('sniper headshot procs exactly on every fourth attack',()=>{
 const w=game('sniper'),p=w.players.s1;
 p.skillRanks[1]=1;p.attackCount=3;
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.equal(procs(w,'headshot').length,1);
 assert.equal(procs(w,'headshot')[0].player,'s1');
 // Not the 5th consecutive attack (count 4 → 5 is not a multiple of 4).
 p.attackCD=0;
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.equal(procs(w,'headshot').length,1);
});

test('jugger blade dance procs with the empowered attack',()=>{
 const w=game('jugger'),p=w.players.s1;
 p.skillRanks[2]=1;p.attackCount=3;
 labyrinthCommand(w,'s1',{type:'attack',x:800,y:500});
 assert.equal(procs(w,'bladedance').length,1);
});

function meleeEnemy(){return {id:999,kind:'scout',x:430,y:500,hp:1000,maxHP:1000,radius:10,attack:40,range:50,interval:99,speed:0,attackCD:0,abilityCD:999,status:{},modifiers:[]}}
test('mars bulwark procs when a frontal hit is blocked',()=>{
 const w=game('mars'),p=w.players.s1;
 p.skillRanks[2]=1;w.queue=[];w.spawnTimer=99;w.enemies=[meleeEnemy()];
 const before=w.events.length;
 stepLabyrinth(w,.05);
 assert.ok(w.events.slice(before).some(e=>e.type==='proc'&&e.kind==='bulwark'&&e.player==='s1'));
});

test('timber reactive armor procs when struck',()=>{
 const w=game('timber'),p=w.players.s1;
 p.skillRanks[2]=1;w.queue=[];w.spawnTimer=99;w.enemies=[meleeEnemy()];
 const before=w.events.length;
 stepLabyrinth(w,.05);
 assert.ok(w.events.slice(before).some(e=>e.type==='proc'&&e.kind==='reactive'));
});

// Recording Web Audio stub so the module can be exercised without a browser.
function fakeAudioContext(){
 const counts={osc:0,bufSrc:0,waveshaper:0,filter:0,gain:0};
 const mkNode=()=>({connect(){},disconnect(){}});
 const ctx={state:'running',currentTime:0,sampleRate:44100,destination:mkNode(),resume(){return Promise.resolve()},
  createGain(){counts.gain++;return {...mkNode(),gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}}}},
  createOscillator(){counts.osc++;return {...mkNode(),type:'',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},start(){},stop(){}}},
  createBiquadFilter(){counts.filter++;return {...mkNode(),type:'',frequency:{value:0},Q:{value:0},gain:{value:0}}},
  createWaveShaper(){counts.waveshaper++;return {...mkNode(),curve:null}},
  createBuffer(ch,len){return {getChannelData:()=>new Float32Array(len)}},
  createBufferSource(){counts.bufSrc++;return {...mkNode(),buffer:null,start(){},stop(){}}},
  decodeAudioData(){return Promise.resolve({duration:1})}};
 return {ctx,counts};
}
function audioWithFake(){const fake=fakeAudioContext();globalThis.window={AudioContext:function(){return fake.ctx}};return {audio:createLabAudio(),fake}}

test('playAttack schedules the hero recipe once the context is unlocked',()=>{
 const {audio,fake}=audioWithFake();
 audio.unlock();
 assert.equal(fake.counts.waveshaper,0); // no shared processing bus: one-shots go direct
 assert.equal(fake.counts.filter,0);
 const before=fake.counts.osc;
 audio.playAttack('sniper');
 assert.ok(fake.counts.osc>before); // tone layers
 assert.ok(fake.counts.bufSrc>=1); // noise burst layer
 delete globalThis.window;
});

test('playAttack is rate limited per hero, not globally',()=>{
 const {audio,fake}=audioWithFake();
 audio.unlock();
 audio.playAttack('drow');
 const osc=fake.counts.osc;
 audio.playAttack('drow'); // within 60 ms of the previous one
 assert.equal(fake.counts.osc,osc);
 audio.playAttack('sniper'); // a different hero is not blocked
 assert.ok(fake.counts.osc>osc);
 delete globalThis.window;
});

test('playCast schedules per-spell sounds and rate limits per spell',()=>{
 const {audio,fake}=audioWithFake();
 audio.unlock();
 const before=fake.counts.osc;
 audio.playCast('cm',0);
 assert.ok(fake.counts.osc>before);
 const after=fake.counts.osc;
 audio.playCast('cm',0); // same spell within 60 ms: silent
 assert.equal(fake.counts.osc,after);
 audio.playCast('cm',1); // another spell: allowed
 audio.playCast('cm',3);
 assert.ok(fake.counts.osc>after);
 audio.playCast('sf',1); // Necromastery: passive, no sound, must not throw
 audio.playCast('unknown-hero',0);
 delete globalThis.window;
});

test('playProc schedules proc accents and rate limits per kind',()=>{
 const {audio,fake}=audioWithFake();
 audio.unlock();
 const before=fake.counts.osc;
 audio.playProc('sniper','headshot');
 assert.ok(fake.counts.osc>before);
 const after=fake.counts.osc;
 audio.playProc('sniper','headshot'); // same proc within 60 ms: silent
 assert.equal(fake.counts.osc,after);
 audio.playProc('mars','bulwark'); // another kind: allowed
 audio.playProc('timber','reactive');
 assert.ok(fake.counts.osc>after);
 audio.playProc('x','nope'); // unknown kind: silently ignored
 delete globalThis.window;
});

test('muted state and a missing user gesture both stay silent',()=>{
 const {audio,fake}=audioWithFake();
 audio.unlock();audio.setMuted(true);
 const osc=fake.counts.osc;
 audio.playAttack('sniper');audio.playCast('drow',2);audio.playProc('mars','bulwark');
 assert.equal(fake.counts.osc,osc);
 const {audio:silent}=audioWithFake();
 silent.playAttack('sniper');silent.playCast('magnus',3);silent.playProc('jugger','bladedance'); // never unlocked: must not throw
 delete globalThis.window;
});

test('unlock plays one soft confirmation tick, then never again',()=>{
 const {audio,fake}=audioWithFake();
 audio.unlock();
 assert.equal(fake.counts.osc,1); // the tick, proving the context is live
 audio.unlock(); // idempotent: no second tick, no second context
 assert.equal(fake.counts.osc,1);
 delete globalThis.window;
});

test('a drop-in sample replaces the synth for that hero only',async()=>{
 const fake=fakeAudioContext();
 globalThis.window={AudioContext:function(){return fake.ctx}};
 globalThis.location={protocol:'https:'};
 globalThis.fetch=async url=>{
  if(url==='sounds/heroes/manifest.json')return {ok:true,json:async()=>({sniper:'mp3'})};
  return {ok:url==='sounds/heroes/sniper.mp3',arrayBuffer:async()=>new ArrayBuffer(8)};
 };
 const audio=createLabAudio();audio.unlock();
 await new Promise(r=>setImmediate(r)); // let the fetch/decode chain settle
 const osc=fake.counts.osc,bufSrc=fake.counts.bufSrc;
 audio.playAttack('sniper');
 assert.equal(fake.counts.osc,osc); // synth skipped
 assert.equal(fake.counts.bufSrc,bufSrc+1); // sample source scheduled instead
 audio.playAttack('drow'); // no file for drow: synth still plays
 assert.ok(fake.counts.osc>osc);
 delete globalThis.window;delete globalThis.location;delete globalThis.fetch;
});
