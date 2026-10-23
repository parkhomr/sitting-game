import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGameServer} from '../server.mjs';
import {HEROES} from '../dist/engine.js';
test('six slots, authoritative shared state, host permissions and retry-safe actions',async t=>{
  const server=createGameServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();server.close();});
  const base='http://127.0.0.1:'+server.address().port;
  async function post(route,data){const response=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:response.status,data:await response.json()};}
  const created=await post('/api/rooms',{hero:'host'});assert.equal(created.status,201);assert.equal(created.data.host,true);assert.equal(created.data.hero,'host');assert.equal(created.data.roster.length,6);
  const {code,token}=created.data,route='/api/rooms/'+code;
  const friends=[];for(const h of HEROES){const r=await post(route+'/join',{hero:h.id,host:true});assert.equal(r.status,200);assert.equal(r.data.host,false);friends.push(r.data);}
  const duplicate=await post(route+'/join',{hero:'drow'});assert.equal(duplicate.status,409);
  const hostSpoof=await post(route+'/join',{hero:'host',host:true});assert.equal(hostSpoof.status,400);
  const denied=await post(route+'/sync',{token:friends[0].token,commands:[{seq:1,type:'host',prank:'goldRain'}]});assert.equal(denied.data.ack[0].ok,false);assert.equal(denied.data.world.players.drow.gold,0);
  const prank=await post(route+'/sync',{token,commands:[{seq:1,type:'host',prank:'goldRain'},{seq:2,type:'host',prank:'swapSkills',target:'drow',other:'rubick'}]});assert.equal(prank.data.world.players.drow.gold,300);assert.equal(prank.data.world.players.drow.skill,'rubick');
  const repeat=await post(route+'/sync',{token,commands:[{seq:1,type:'host',prank:'goldRain'},{seq:2,type:'host',prank:'swapSkills',target:'drow',other:'rubick'}]});assert.equal(repeat.data.world.players.drow.gold,300);assert.equal(repeat.data.world.players.drow.skill,'rubick');
  const seen=await post(route+'/sync',{token:friends[1].token,commands:[]});assert.equal(seen.data.world.players.drow.skill,'rubick');assert.equal(seen.data.roster.filter(r=>r.human).length,6);
  const fake=await post(route+'/sync',{token:'wrong',commands:[]});assert.equal(fake.status,401);
  const reclaimed=await post(route+'/join',{token,hero:'sf'});assert.equal(reclaimed.data.host,true);assert.equal(reclaimed.data.hero,'host');assert.equal(reclaimed.data.lastSeq,2);
  const ownHero=await post(route+'/sync',{token:friends[0].token,commands:[{seq:2,type:'upgrade',hero:'sf',upgrade:'skillPower'}]});assert.equal(ownHero.data.world.players.drow.skillPower,1);assert.equal(ownHero.data.world.players.sf.skillPower,0);
  const started=await post(route+'/sync',{token,commands:[{seq:3,type:'start'}]});assert.equal(started.data.world.started,true);
  await new Promise(resolve=>setTimeout(resolve,250));const next=await post(route+'/sync',{token,commands:[]});assert.ok(next.data.world.seconds>0);
  const left=await post(route+'/leave',{token:friends[0].token});assert.equal(left.status,200);const newFriend=await post(route+'/join',{hero:'drow'});assert.equal(newFriend.status,200);
  const notPublic=await fetch(base+'/.git/config');assert.equal(notPublic.status,404);
  const source=await fetch(base+'/engine.js');assert.equal(source.status,200);
  const blocked=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://not-this-game.example'},body:JSON.stringify({hero:'host'})});assert.equal(blocked.status,403);
});

test('shop actions are personal and retry-safe; exhausted heroes stay exhausted on reconnect',async t=>{
 const {createWorld}=await import('../dist/engine.js');
 const server=createGameServer({worldFactory:()=>{const w=createWorld();for(const p of Object.values(w.players))p.gold=20000;w.players.rubick.lives=0;w.players.rubick.hp=0;w.players.rubick.respawn=999999;return w;}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();server.close();});
 const base='http://127.0.0.1:'+server.address().port;
 async function post(route,data){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(r.ok,true);return r.json();}
 const host=await post('/api/rooms',{hero:'drow'}),route='/api/rooms/'+host.code;
 const friend=await post(route+'/join',{hero:'sf'});
 const actions=[{seq:1,type:'buy',item:'heart',hero:'sf'},{seq:2,type:'buy',item:'bkb'},{seq:3,type:'start'},{seq:4,type:'item',item:'bkb'}];
 const bought=await post(route+'/sync',{token:host.token,commands:actions});assert.equal(bought.world.players.drow.inventory,3);assert.equal(bought.world.players.sf.inventory,0);assert.equal(bought.world.players.drow.gold,15000);assert.equal(bought.world.players.drow.bkbLeft,6);
 const retried=await post(route+'/sync',{token:host.token,commands:actions});assert.equal(retried.world.players.drow.gold,15000);assert.ok(retried.world.players.drow.bkbCooldown>34);
 const observer=await post(route+'/join',{hero:'rubick'});assert.equal(observer.world.players.rubick.lives,0);assert.equal(observer.world.players.rubick.hp,0);
 const revived=await post(route+'/sync',{token:observer.token,commands:[{seq:1,type:'start'},{seq:2,type:'attack'},{seq:3,type:'buy',item:'heart'}]});assert.equal(revived.world.players.rubick.lives,0);assert.equal(revived.ack.at(-1).ok,false);
 const denied=await post(route+'/sync',{token:friend.token,commands:[{seq:1,type:'restart'}]});assert.equal(denied.ack.at(-1).ok,false);
});

test('only host can restart a finished run; room and player slots survive with fresh five-life budgets',async t=>{
 const {createWorld}=await import('../dist/engine.js');let made=0;
 const server=createGameServer({worldFactory:()=>{const w=createWorld();if(!made++){w.started=true;w.gameOver=true;for(const p of Object.values(w.players)){p.lives=0;p.hp=0;p.respawn=999999;p.inventory=15;}}return w;}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();server.close();});
 const base='http://127.0.0.1:'+server.address().port;
 async function post(route,data){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(r.ok,true);return r.json();}
 const host=await post('/api/rooms',{hero:'host'}),route='/api/rooms/'+host.code,friend=await post(route+'/join',{hero:'sf'});
 const denied=await post(route+'/sync',{token:friend.token,commands:[{seq:1,type:'restart'}]});assert.equal(denied.world.gameOver,true);assert.equal(denied.ack.at(-1).ok,false);
 const fresh=await post(route+'/sync',{token:host.token,commands:[{seq:1,type:'restart'}]});assert.equal(fresh.world.gameOver,false);assert.notEqual(fresh.world.runId,host.world.runId);assert.equal(fresh.world.wave,1);assert.equal(fresh.world.started,false);assert.equal(fresh.roster.filter(r=>r.human).length,2);
 for(const p of Object.values(fresh.world.players)){assert.equal(p.lives,5);assert.equal(p.inventory,0);}
 const repeated=await post(route+'/sync',{token:host.token,commands:[{seq:1,type:'restart'}]});assert.equal(repeated.world.runId,fresh.world.runId);
 const seen=await post(route+'/sync',{token:friend.token,commands:[{seq:2,type:'start'}]});assert.equal(seen.world.started,true);assert.equal(seen.world.players.sf.lives,5);
});
