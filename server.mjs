import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { HEROES, createWorld, command, hostCommand, step } from './dist/engine.js';
import WebSocket,{WebSocketServer} from './vendor/ws/wrapper.mjs';
import {wireWorld,deltaFrame} from './dist/netcode.js';
import {ARCADE_MODES,arcadeSlots,createArcadeWorld,arcadeCommand,startArcade,stepArcade} from './dist/arcade-engine.js';
import {arcadeWireWorld,arcadeDelta} from './dist/arcade-wire.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const files=new Map(['index.html','style.css','game.js','engine.js','netcode.js','effects.js','arcade.html','arcade.css','arcade-client.js','arcade-engine.js','arcade-wire.js','arcade-art.js','arcade-prediction.js','chaos-data.js'].map(name=>['/'+(name==='index.html'?'':name),{data:readFileSync(path.join(root,'dist',name)),type:name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'}]));
const token=()=>randomBytes(24).toString('base64url');
export function createGameServer({worldFactory=createWorld,arcadeFactory=createArcadeWorld}={}){
  const rooms=new Map(),limits=new Map();
  const instanceId=randomBytes(12).toString('hex');
  let publicOrigin='';
  function json(req,res,status,data){
    let bytes=Buffer.from(JSON.stringify(data));const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    if(bytes.length>1400 && /\bgzip\b/.test(req.headers['accept-encoding']||'')){bytes=gzipSync(bytes);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding';}
    res.writeHead(status,headers);res.end(bytes);
  }
  async function body(req){
    let text='';for await(const chunk of req){text+=chunk;if(text.length>12000)throw Object.assign(Error('Слишком большой запрос'),{status:413});}
    try {return JSON.parse(text||'{}');}catch{throw Object.assign(Error('Некорректный JSON'),{status:400});}
  }
  function seats(room){return room.mode==='farm'?HEROES.map(h=>h.id):arcadeSlots(room.mode);}
  function roomWire(room){return room.mode==='farm'?wireWorld(room.world):arcadeWireWorld(room.world);}
  function roster(room){const now=Date.now();return [...seats(room),'host'].map(id=>({id,human:[...room.sessions.values()].some(s=>s.hero===id&&now-s.seen<15000),reserved:[...room.sessions.values()].some(s=>s.hero===id&&now-s.seen<90000)}));}
  function snapshot(room,session,ack=[]){return {mode:room.mode,world:room.mode==='farm'?room.world:roomWire(room),roster:roster(room),hero:session.hero,host:!!session.host,ack,lastSeq:session.seq,serverTime:Date.now(),inviteBase:publicOrigin};}
  function limited(key,capacity,period){const now=Date.now(),v=limits.get(key)||{start:now,count:0};if(now-v.start>=period){v.start=now;v.count=0;}v.count++;limits.set(key,v);return v.count>capacity;}
  function applyActions(room,session,commands){
    for(const item of Array.isArray(commands)?commands.slice(0,12):[]){
      if(!item||typeof item!=='object'||!Number.isSafeInteger(item.seq)||item.seq<=session.seq)continue;
      if(item.seq!==session.seq+1)break;
      let result;
      if(item.type==='take_seat'&&room.mode!=='farm'){
        const target=item.seat;
        if(!session.host)result={ok:false,message:'Only the host can change seats'};
        else if(target!=='host'&&!seats(room).includes(target))result={ok:false,message:'Unknown seat'};
        else if([...room.sessions.values()].some(s=>s!==session&&s.hero===target&&Date.now()-s.seen<90000))result={ok:false,message:'That seat is reserved by another player'};
        else{session.hero=target;session.socket&&(session.socket.needsFull=true);result={ok:true};}
      }else if(item.type==='restart'){
        if(!session.host||!room.world.gameOver)result={ok:false,message:'Only the host can restart a finished match'};
        else{const names=Object.fromEntries(Object.entries(room.world.players).map(([id,p])=>[id,p.name]));room.world=room.mode==='farm'?worldFactory():arcadeFactory(room.mode,{targetScore:room.world.targetScore});if(room.mode!=='farm')for(const [id,p] of Object.entries(room.world.players))if(names[id])p.name=names[id];room.wirePrevious=null;result={ok:true};}
      }else if(room.mode!=='farm'){
        if(item.type==='start')result=session.host?startArcade(room.world,[...room.sessions.values()].filter(s=>Date.now()-s.seen<15000&&s.hero!=='host').map(s=>s.hero)):{ok:false,message:'Only the host can start this mode'};
        else if(['mode','set_mode','host','change_mode'].includes(item.type))result={ok:false,message:'The room mode is locked'};
        else result=arcadeCommand(room.world,session.hero,item);
      }else result=item.type==='host'?(session.host?hostCommand(room.world,item):{ok:false,message:'Только ведущий может это делать'}):item.type==='start'?command(room.world,'drow',item):command(room.world,session.hero,item);
      session.seq=item.seq;session.ack.push({seq:item.seq,...result});if(session.ack.length>24)session.ack.shift();
    }
  }
  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/health'){json(req,res,200,{ok:true,version:8,transport:'websocket',snapshotHz:20,publicOrigin,instanceId});return;}
      const info=url.pathname.match(/^\/api\/rooms\/([A-F0-9]{6})\/info$/);
      if(info&&req.method==='GET'){const room=rooms.get(info[1]);json(req,res,room?200:404,room?{code:room.code,mode:room.mode,started:room.world.started,roster:roster(room),targetScore:room.world.targetScore}:{error:'Room not found. The host may have restarted the server.'});return;}
      if(url.pathname.startsWith('/api/')){
        if(req.method!=='POST'){json(req,res,405,{error:'Используй POST'});return;}
        const origin=req.headers.origin;
        if(origin && origin!=='null' && new URL(origin).host!==req.headers.host){json(req,res,403,{error:'Запрос с другого сайта отклонён'});return;}
        if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){json(req,res,415,{error:'Ожидается JSON'});return;}
        const input=await body(req),now=Date.now();
        if(!input||typeof input!=='object'||Array.isArray(input)){json(req,res,400,{error:'Ожидается объект JSON'});return;}
        if(url.pathname==='/api/rooms'){
          const ip=req.socket.remoteAddress||'unknown';
          if(limited('create:'+ip,10,60000)||rooms.size>=100){json(req,res,429,{error:'Слишком много комнат. Попробуй позже.'});return;}
          const mode=input.mode||'farm';if(mode!=='farm'&&!ARCADE_MODES.includes(mode)){json(req,res,400,{error:'Unknown game mode'});return;}
          if(input.hero!=='host'&&!(mode==='farm'?HEROES.map(h=>h.id):arcadeSlots(mode)).includes(input.hero)){json(req,res,400,{error:'Выбери героя'});return;}
          let code;do{code=randomBytes(4).toString('hex').slice(0,6).toUpperCase();}while(rooms.has(code));
          const session={hero:input.hero,host:true,seen:now,seq:0,ack:[],token:token()};
          const room={code,mode,world:mode==='farm'?worldFactory():arcadeFactory(mode,{targetScore:input.targetScore}),sessions:new Map([[session.token,session]]),sockets:new Set(),frameSeq:0,lastActive:now};rooms.set(code,room);
          json(req,res,201,{code,token:session.token,...snapshot(room,session)});return;
        }
        const match=url.pathname.match(/^\/api\/rooms\/([A-F0-9]{6})\/(join|sync|leave)$/);
        const room=match&&rooms.get(match[1]);if(!room){json(req,res,404,{error:'Комната не найдена. Ведущий мог перезапустить сервер.'});return;}
        room.lastActive=now;
        if(match[2]==='join'){
          if(input.mode&&input.mode!==room.mode){json(req,res,409,{error:'This invite belongs to '+room.mode+'. The room mode cannot be changed.',mode:room.mode});return;}
          let session=typeof input.token==='string'&&room.sessions.get(input.token);
          if(!session){
            if(!seats(room).includes(input.hero)){json(req,res,400,{error:'Выбери героя'});return;}
            if([...room.sessions.values()].some(s=>s.hero===input.hero&&now-s.seen<90000)){json(req,res,409,{error:'Этот герой уже занят. Выбери другого.'});return;}
            for(const [key,s] of room.sessions)if(!s.host&&(s.hero===input.hero||now-s.seen>90000))room.sessions.delete(key);
            session={hero:input.hero,host:false,seen:now,seq:0,ack:[],token:token()};room.sessions.set(session.token,session);
          }
          session.seen=now;if(room.world.players[session.hero])room.world.players[session.hero].paused=false;
          json(req,res,200,{code:room.code,token:session.token,...snapshot(room,session)});return;
        }
        const session=typeof input.token==='string'&&room.sessions.get(input.token);
        if(!session){json(req,res,401,{error:'Место в комнате потеряно. Войди заново.'});return;}
        if(match[2]==='leave'){if(session.host&&session.hero==='host')session.seen=0;else room.sessions.delete(session.token);session.socket?.close(4000,'Left room');const p=room.world.players[session.hero];if(p){p.paused=false;p.auto=true;}json(req,res,200,{ok:true});return;}
        if(limited('sync:'+session.token,30,1000)){json(req,res,429,{error:'Слишком много команд'});return;}
        session.seen=now;
        applyActions(room,session,input.commands);
        json(req,res,200,{...snapshot(room,session,session.ack),lastSeq:session.seq});return;
      }
      if(!['GET','HEAD'].includes(req.method)){json(req,res,405,{error:'Метод не поддерживается'});return;}
      const asset=files.get(url.pathname==='/index.html'?'/':url.pathname);
      if(!asset){json(req,res,404,{error:'Файл не найден'});return;}
      res.writeHead(200,{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(req.method==='HEAD'?undefined:asset.data);
    }catch(error){if(!res.headersSent)json(req,res,error.status||500,{error:error.status?error.message:'Ошибка сервера'});else res.end();}
  });
  const wss=new WebSocketServer({noServer:true,maxPayload:16384,perMessageDeflate:false});
  function fullFrame(room,session){room.wirePrevious ||= roomWire(room);return {type:'state',seq:room.frameSeq,full:roomWire(room),mode:room.mode,roster:roster(room),hero:session.hero,host:!!session.host,lastSeq:session.seq,ack:session.ack,inviteBase:publicOrigin};}
  function send(socket,data){if(socket.readyState===WebSocket.OPEN)socket.send(typeof data==='string'?data:JSON.stringify(data));}
  server.on('upgrade',(req,socket,head)=>{
    let valid=false;try{valid=new URL(req.url,'http://localhost').pathname==='/live'&&(!req.headers.origin||new URL(req.headers.origin).host===req.headers.host);}catch{}
    if(!valid||wss.clients.size>=200||limited('ws:'+req.socket.remoteAddress,60,60000)){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
    socket.setNoDelay(true);wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
  });
  wss.on('connection',socket=>{
    let room,session;const deadline=setTimeout(()=>{if(!session)socket.close(4003,'Authentication required');},5000);deadline.unref();
    socket.on('error',()=>{});
    socket.on('pong',()=>{if(session){session.seen=Date.now();room.lastActive=session.seen;}});
    socket.on('message',(bytes,isBinary)=>{
      let input;try{input=JSON.parse(bytes.toString());}catch{socket.close(4002,'Invalid JSON');return;}
      if(isBinary||!input||typeof input!=='object'){socket.close(4002,'Invalid message');return;}
      if(!session){
        room=rooms.get(input.code);session=room?.sessions.get(input.token);
        if(input.type!=='auth'||!session){send(socket,{type:'error',fatal:true,message:'Место в комнате потеряно. Войди заново.'});socket.close(4003,'Invalid session');session=undefined;return;}
        clearTimeout(deadline);session.socket?.close(4001,'Session opened in another tab');session.socket=socket;session.seen=Date.now();room.lastActive=session.seen;room.sockets.add(socket);socket.room=room;socket.session=session;socket.needsFull=false;
        send(socket,fullFrame(room,session));return;
      }
      if(room.sessions.get(session.token)!==session){socket.close(4003,'Session expired');return;}
      session.seen=Date.now();room.lastActive=session.seen;
      if(limited('messages:'+session.token,60,1000)){socket.close(4008,'Too many messages');return;}
      if(input.type==='ping'){send(socket,{type:'pong',echo:input.time});return;}
      if(input.type==='resync'){send(socket,fullFrame(room,session));socket.needsFull=false;return;}
      if(input.type==='commands'){
        applyActions(room,session,input.commands);send(socket,{type:'ack',lastSeq:session.seq,ack:session.ack});
      }
    });
    socket.on('close',()=>{clearTimeout(deadline);room?.sockets.delete(socket);if(session?.socket===socket)session.socket=null;});
  });
  function broadcast(room){
    if(!room.sockets.size)return;
    const current=roomWire(room),frame=room.wirePrevious?(room.mode==='farm'?deltaFrame:arcadeDelta)(room.wirePrevious,current,room.world.events):{type:'state',mode:room.mode,full:current};
    frame.seq=++room.frameSeq;
    if(room.inviteBase!==publicOrigin){frame.inviteBase=publicOrigin;room.inviteBase=publicOrigin;}
    const rosterValue=roster(room),key=JSON.stringify(rosterValue);if(key!==room.rosterKey){frame.roster=rosterValue;room.rosterKey=key;}
    const bytes=JSON.stringify(frame);
    for(const socket of room.sockets){
      if(socket.readyState!==WebSocket.OPEN)continue;
      if(socket.bufferedAmount>1024*1024){socket.terminate();continue;}
      if(socket.bufferedAmount>64*1024){socket.needsFull=true;continue;}
      if(socket.needsFull){send(socket,fullFrame(room,socket.session));socket.needsFull=false;}else send(socket,bytes);
    }
    room.wirePrevious=current;
  }
  let previous=performance.now();
  const timer=setInterval(()=>{
    const now=Date.now(),clock=performance.now(),dt=Math.min(.1,(clock-previous)/1000);previous=clock;
    for(const [code,room] of rooms){
      if(now-room.lastActive>3600000){for(const socket of room.sockets)socket.close(4003,'Room expired');rooms.delete(code);continue;}
      const active=[...room.sessions.values()].filter(s=>now-s.seen<15000);
      if(!active.length)continue;
      const bots=seats(room).filter(id=>!active.some(s=>s.hero===id));
      for(const id of bots){room.world.players[id].paused=false;room.world.players[id].auto=true;}
      (room.mode==='farm'?step:stepArcade)(room.world,dt,bots);
      broadcast(room);
    }
    if(limits.size>10000)for(const [key,v] of limits)if(now-v.start>60000)limits.delete(key);
  },50);timer.unref();server.on('close',()=>clearInterval(timer));
  const heartbeat=setInterval(()=>{for(const socket of wss.clients)if(socket.readyState===WebSocket.OPEN)socket.ping();},5000);heartbeat.unref();
  server.closeLiveConnections=()=>{for(const socket of wss.clients)socket.terminate();wss.close();clearInterval(heartbeat);};
  server.on('close',server.closeLiveConnections);
  server.setPublicOrigin=origin=>{const parsed=new URL(origin);if(parsed.protocol!=='https:')throw Error('Public link needs HTTPS');publicOrigin=parsed.origin;};
  server.instanceId=instanceId;
  server.requestTimeout=10000;server.headersTimeout=10000;
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const port=Number(process.env.PORT)||8787;
  const server=createGameServer();server.on('error',error=>{console.error('Сервер не запустился:',error.message);process.exitCode=1;});
  server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`СИДИ КАЧАЙСЯ: http://localhost:${port}\nДля друзей из других стран: npm run online`));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.closeLiveConnections();server.close(()=>process.exit(0));});
}
