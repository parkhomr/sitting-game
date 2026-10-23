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
  const ownHero=await post(route+'/sync',{token:friends[0].token,commands:[{seq:2,type:'upgrade',hero:'sf',upgrade:'damage'}]});assert.equal(ownHero.data.world.players.drow.damage,1);assert.equal(ownHero.data.world.players.sf.damage,0);
  const started=await post(route+'/sync',{token,commands:[{seq:3,type:'start'}]});assert.equal(started.data.world.started,true);
  await new Promise(resolve=>setTimeout(resolve,250));const next=await post(route+'/sync',{token,commands:[]});assert.ok(next.data.world.seconds>0);
  const left=await post(route+'/leave',{token:friends[0].token});assert.equal(left.status,200);const newFriend=await post(route+'/join',{hero:'drow'});assert.equal(newFriend.status,200);
  const notPublic=await fetch(base+'/.git/config');assert.equal(notPublic.status,404);
  const source=await fetch(base+'/engine.js');assert.equal(source.status,200);
  const blocked=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://not-this-game.example'},body:JSON.stringify({hero:'host'})});assert.equal(blocked.status,403);
});
