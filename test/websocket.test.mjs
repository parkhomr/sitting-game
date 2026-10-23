import {test} from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import WebSocket from '../vendor/ws/wrapper.mjs';
import {createGameServer} from '../server.mjs';
import {applyNetFrame} from '../dist/netcode.js';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function live(url,code,token){
  const socket=new WebSocket(url),packets=[],frames=[];let view,lastFrame;
  socket.on('message',data=>{const p=JSON.parse(data);packets.push(p);if(p.type==='state'){assert.ok(p.full||p.seq===lastFrame+1);lastFrame=p.seq;view=applyNetFrame(view,p);frames.push({at:performance.now(),size:data.length,view});}});
  await new Promise((resolve,reject)=>{socket.once('open',resolve);socket.once('error',reject);});
  socket.send(JSON.stringify({type:'auth',code,token}));
  const wait=async predicate=>{for(let i=0;i<120;i++){const result=packets.find(predicate);if(result)return result;await sleep(20);}throw Error('Missing websocket response');};
  await wait(p=>p.type==='state'&&p.full);
  return {socket,packets,frames,get view(){return view;},wait,send:data=>socket.send(JSON.stringify(data))};
}
test('six WebSocket clients get continuous compact frames, immediate commands and host checks',async t=>{
  const server=createGameServer();server.setPublicOrigin('https://friends.example');await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port,base='http://127.0.0.1:'+port,clients=[];
  t.after(()=>{for(const c of clients)c.socket.terminate();server.closeLiveConnections();server.closeAllConnections();server.close();});
  async function post(route,data){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(r.ok,true);return r.json();}
  const host=await post('/api/rooms',{hero:'host'}),route='/api/rooms/'+host.code;
  assert.equal(host.inviteBase,'https://friends.example','local host shares the external origin');
  const identities=[host];for(const hero of ['drow','timber','sf','rubick','sniper'])identities.push(await post(route+'/join',{hero}));
  for(const identity of identities)clients.push(await live('ws://127.0.0.1:'+port+'/live',host.code,identity.token));
  clients[0].send({type:'commands',commands:[{seq:1,type:'start'},{seq:2,type:'host',prank:'swapSkills',target:'timber',other:'sf'}]});
  const ack=await clients[0].wait(p=>p.type==='ack'&&p.lastSeq===2);assert.equal(ack.ack.at(-1).ok,true);
  clients[2].send({type:'commands',commands:[{seq:1,type:'aim',x:1360,y:525},...['near','mid','far'].map((raze,i)=>({seq:i+2,type:'raze',raze,x:1360,y:525}))]});
  const razeAck=await clients[2].wait(p=>p.type==='ack'&&p.lastSeq===4);assert.ok(razeAck.ack.every(a=>a.ok));
  const warning=await clients[1].wait(p=>p.type==='state'&&p.state?.casts?.length===3);assert.deepEqual(warning.state.casts.map(c=>c.x),[660,910,1160]);
  clients[3].send({type:'commands',commands:[{seq:1,type:'attack',x:1200,y:635}]});await clients[3].wait(p=>p.type==='ack'&&p.lastSeq===1);
  const ballistic=await clients[1].wait(p=>p.type==='state'&&p.projectiles?.add?.some(s=>s.hero==='sf'));
  const shot=ballistic.projectiles.add.find(s=>s.hero==='sf');assert.ok(shot.vx>0);assert.equal(shot.vy,0);assert.equal(shot.target,undefined);
  clients[1].send({type:'commands',commands:[{seq:1,type:'host',prank:'goldRain'}]});const rejected=await clients[1].wait(p=>p.type==='ack');assert.equal(rejected.ack.at(-1).ok,false);
  clients[1].send({type:'commands',commands:[{seq:2,type:'walk',dx:1,dy:0}]});await clients[1].wait(p=>p.type==='ack'&&p.lastSeq===2);
  const start=performance.now();clients[0].send({type:'ping',time:start});const pong=await clients[0].wait(p=>p.type==='pong');assert.equal(pong.echo,start);
  await sleep(1100);
  for(const c of clients){assert.ok(c.frames.length>=16,`streaming updates: ${c.frames.length}`);assert.equal(c.view.players.timber.skill,'sf');assert.ok(c.view.players.timber.razeNearCooldown>0);assert.ok(c.view.players.timber.razeMidCooldown>0);assert.ok(c.view.players.timber.razeFarCooldown>0);assert.ok(c.view.players.drow.x>350,'movement is shared with every client');assert.ok(c.view.players.drow.mana>0);}
  const last=clients[2].view.seconds;clients[2].send({type:'resync'});await clients[2].wait(p=>p.type==='state'&&p.full&&p.full.seconds>=last);
  console.log(`Six clients: ${clients[0].frames.length} frames in ~1.1s; mean ${Math.round(clients[0].frames.reduce((n,f)=>n+f.size,0)/clients[0].frames.length)} bytes/frame`);
});
test('200 ms round-trip latency does not reduce the stream to HTTP polling speed',async t=>{
  const server=createGameServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
  const pipes=new Set(),timers=new Set();
  const proxy=net.createServer(client=>{const upstream=net.connect(port,'127.0.0.1');pipes.add(client);pipes.add(upstream);client.setNoDelay(true);upstream.setNoDelay(true);
    function delay(from,to){from.on('data',chunk=>{const timer=setTimeout(()=>{timers.delete(timer);if(!to.destroyed)to.write(chunk);},100);timers.add(timer);});from.on('error',()=>{});from.on('close',()=>{to.destroy();pipes.delete(from);});}
    delay(client,upstream);delay(upstream,client);
  });await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));let client;
  t.after(()=>{client?.socket.terminate();for(const timer of timers)clearTimeout(timer);for(const pipe of pipes)pipe.destroy();proxy.close();server.closeLiveConnections();server.closeAllConnections();server.close();});
  const identity=await(await fetch('http://127.0.0.1:'+port+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hero:'host'})})).json();
  client=await live('ws://127.0.0.1:'+proxy.address().port+'/live',identity.code,identity.token);
  const initial=client.frames.length,start=performance.now();client.send({type:'ping',time:start});await client.wait(p=>p.type==='pong');const rtt=performance.now()-start;
  await sleep(1000);const hz=(client.frames.length-initial)/((performance.now()-start)/1000);
  assert.ok(rtt>=180,'the test actually includes network latency');assert.ok(hz>=14,`stream frequency ${hz}`);
  console.log(`With artificial 200 ms RTT: ${Math.round(rtt)} ms measured, ${hz.toFixed(1)} updates/s (old polling: about 2.4/s)`);
});
