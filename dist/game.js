import {HEROES,ENEMY_HEROES,ROSHAN,NEUTRALS,ARENA,SEATS,maxMana,manaRegen,manaCost,moveSpeed,attackRange,heroInfo,createWorld,restoreWorld,requiredXP,damage,attackSpeed,upgradeCost,maxHP,waveRules,command,hostCommand,step,allowedTarget} from './engine.js';
import {applyNetFrame,MotionBuffer} from './netcode.js';
import {BattleEffects,drawProjectile} from './effects.js';
(() => {
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),W=ARENA.width,H=ARENA.height;
  const HOST={id:'host',name:'Ведущий',hero:'Наблюдатель',color:'#e6d59a',icon:'♛'};
  const PICKS=[...HEROES,HOST];
  const SAVE_KEY='oscar-farm-club-v2';
  let chosen='drow',world=createWorld(),soloWorld=world,online=null,soloPaused=false,sound=false,audio=null;
  let lastTime=0,elapsed=0,uiTimer=0,saveTimer=0,lastEvent=0,toastTimer;
  const effects=new BattleEffects(),motion=new MotionBuffer();

  let fps=0,fpsFrames=0,fpsStart=0,enemyTeamKey='';
  let particles=[],floating=[],saveAvailable=true;
  const held=new Set();let walkSent=0,lastWalk='',localMotion=null,moveMarker=null;
  function setTheme(theme){document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#101613':'#f4f2e9';$('themeButton').textContent=theme==='dark'?'☀ Светлая тема':'☾ Тёмная тема';$('themeButton').setAttribute('aria-pressed',String(theme==='dark'));try{localStorage.setItem('oscar-theme',theme);}catch{}}
  try {
    chosen=PICKS.some(h=>h.id===localStorage.getItem('oscar-hero'))?localStorage.getItem('oscar-hero'):'drow';
    sound=localStorage.getItem('oscar-sound')==='true';
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(saved)world=restoreWorld(saved);
    else {
      const old=JSON.parse(localStorage.getItem('oscar-farm-club-v1'));
      if(old){for(const p of Object.values(world.players))for(const k of ['level','xp','gold','damage','speed','wisdom'])if(Number.isFinite(old[k])&&old[k]>=0)p[k]=old[k];world.wave=Math.max(1,old.wave||1);world.seconds=old.seconds||0;world.kills=old.kills||0;world=restoreWorld(world);}
    }
    soloWorld=world;
  } catch { /* Local play also works with restricted storage. */ }
  const number=n=>Math.floor(n).toLocaleString('ru-RU');
  const me=()=>world.players[chosen]||world.players.drow;
  function save(){if(online)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,players:world.players,wave:world.wave,kills:world.kills,heroKills:world.heroKills,bossKills:world.bossKills,wins:world.wins,losses:world.losses,seconds:world.seconds}));localStorage.setItem('oscar-hero',chosen);localStorage.setItem('oscar-sound',String(sound));saveAvailable=true;}catch{saveAvailable=false;}}
  function tone(f=440,d=.06,type='sine'){
    if(!sound)return;try{audio||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{}
  }
  function toast(text){$('levelToast').textContent=text;$('levelToast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('levelToast').classList.remove('visible'),2600);}
  function processEvents(){
    for(const event of world.events){if(event.id<=lastEvent)continue;
      if(event.type==='level'&&event.hero===chosen){toast('✳ '+heroInfo(chosen).name+' · УРОВЕНЬ '+event.level);tone(880,.15);}
      if(event.type==='prank')toast(event.message);
      if(event.type==='wave')toast('ВОЛНА '+event.wave+' · КРИПОВ ЕЩЁ БОЛЬШЕ');
      if(event.type==='fightStart')toast('ТИМФАЙТ 5 НА 5. СОБРАЛИСЬ!');
      if(event.type==='fightEnd')toast(event.won?'ПОБЕДА! ДАЛЬШЕ ФАРМИМ.':'ПЕРЕГРУППИРОВКА · −10% ЗОЛОТА');
      if(event.type==='bossStart')toast('30-Я ВОЛНА · РОШАН ВЫШЕЛ ИЗ ЛОГОВА!');
      if(event.type==='bossEnrage')toast('РОШАН В ЯРОСТИ! УДАРЫ СТАЛИ СИЛЬНЕЕ.');
      if(event.type==='bossEnd')toast(event.won?'РОШАН ПОВЕРЖЕН! СИДИ КАЧАЙСЯ ДАЛЬШЕ.':'РОШАН ПОБЕДИЛ · −10% ЗОЛОТА · ПОВТОР ЧЕРЕЗ 5 СЕК');
      if(event.type==='bossAbility'){effects.enemy(event);floating.push({x:event.x,y:180,text:'РОШАН: '+event.skill,color:'#f5a36e',life:1.5});}
      if(event.type==='bossKill')tone(130,.45,'sawtooth');
      if(event.type==='enemyAbility')floating.push({x:750,y:165+(event.id%4)*17,text:ENEMY_HEROES.find(h=>h.id===event.kit).name+': '+event.skill,color:'#e9bca6',life:1.8});
      if(event.type==='heroKill'){toast(heroInfo(event.hero).name+' '+(event.hero==='sniper'?'УКРАЛ ФРАГ: ':'ДОБИЛ: ')+event.name);tone(220,.18,'triangle');}
      if(event.type==='down'&&event.hero===chosen)toast('Передышка 8 секунд. Потом снова фарм.');
      if(event.type==='shot'){const predicted=event.hero===chosen&&event.inputSeq&&online?.predicted.delete(event.inputSeq);if(!predicted){effects.cast(event);if(event.hero===chosen)tone(event.ability?900:550,.04,'triangle');}}
      if(event.type==='impact')effects.impact(event);
      if(event.type==='requiem')effects.requiem(event);
      if(event.type==='hazardHit')effects.hazard(event);
      if(event.type==='neutralSpell'||event.type==='enemyAttack')effects.neutral(event);
      if(event.type==='channelCancel'&&event.hero===chosen)toast('Requiem прерван оглушением!');
      if(event.type==='enemyAbility')effects.enemy(event);
      if(event.type==='sunStrike')effects.sun(event);
      if(event.type==='kill'||event.type==='heroKill'||event.type==='bossKill'){
        floating.push({x:event.x,y:event.y-65,text:'+'+event.gold+' G',color:'#e6d199',life:1.3});
        for(let i=0;i<8;i++)particles.push({x:event.x,y:event.y-25,vx:(Math.random()-.5)*90,vy:-Math.random()*80,life:.7,color:heroInfo(event.hero).color});
      }
    }
    if(particles.length>240)particles.splice(0,particles.length-240);if(floating.length>30)floating.splice(0,floating.length-30);
    lastEvent=world.eventId;
  }
  function action(type,extra={}){
    if(['move','walk'].includes(type))startLocalMotion(type,extra);
    if(online){if(!online.up){toast('Восстанавливаем связь с сервером…');return;}if(online.queue.length>=12)return;const seq=++online.nextSeq;online.queue.push({type,...extra,seq});predictCast(type,seq);flushCommands();return;}
    if(chosen==='host'&&['attack','ability','auto','upgrade','move','walk','target','eul','ultimate'].includes(type))return;
    if(!world.started&&['attack','ability'].includes(type))command(world,chosen,{type:'start'});
    if(soloPaused&&['attack','ability'].includes(type))return;
    const result=type==='host'&&chosen==='host'?hostCommand(world,extra):command(world,chosen==='host'?'drow':chosen,{type,...extra});if(!result.ok&&['ability','eul','ultimate'].includes(type))toast(result.message);processEvents();updateUI();save();
  }
  function choose(id){if(online)return;held.clear();localMotion=null;chosen=id;save();updateUI();renderPortraits();}
  function togglePause(){if(!world.started||online&&chosen==='host')return;if(online)action('pause',{value:!me().paused});else{soloPaused=!soloPaused;updateUI();save();}}
  async function request(path,body){
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(6000)});
    let data;try{data=await response.json();}catch{throw Error('Сервер игры не запущен. Используй npm run online.');}
    if(!response.ok){const error=Error(data.error||'Ошибка подключения');error.status=response.status;throw error;}return data;
  }
  function credentials(){try{return JSON.parse(sessionStorage.getItem('oscar-room-'+$('roomCodeInput').value.trim().toUpperCase()));}catch{return null;}}
  async function connect(create){
    if(online)return;
    if(!/^https?:$/.test(location.protocol)){$('onlineDialog').showModal();return;}
    const code=$('roomCodeInput').value.trim().toUpperCase();
    if(!create&&!/^[A-F0-9]{6}$/.test(code)){toast('Введи код комнаты: 6 символов');return;}
    $('createRoomButton').disabled=true;$('joinRoomButton').disabled=true;
    try{
      const prior=credentials();
      const data=await request(create?'/api/rooms':'/api/rooms/'+code+'/join',{hero:chosen,...(!create&&prior?{token:prior.token}:{})});
      save();soloWorld=world;chosen=data.hero;world=data.world;lastEvent=world.eventId;soloPaused=false;
      online={host:data.host,code:data.code,token:data.token,nextSeq:data.lastSeq||0,queue:[],up:false,roster:data.roster,ping:0,pings:[],lastAt:performance.now(),failures:0,predicted:new Set(),received:0,inviteBase:data.inviteBase||location.origin};effects.clear();motion.clear();
      try{sessionStorage.setItem('oscar-room-'+data.code,JSON.stringify({token:data.token}));}catch{}
      location.hash='room='+data.code;$('roomCodeInput').value=data.code;renderPortraits();updateUI();openLive(online);toast(chosen==='host'?'Ты ведущий. Пульт готов.':'В отряде: '+heroInfo(chosen).name);
    }catch(error){toast(error.message);}finally{$('createRoomButton').disabled=false;$('joinRoomButton').disabled=false;}
  }
  function flushCommands(){const current=online;if(current?.socket?.readyState===WebSocket.OPEN&&current.up&&current.queue.length)current.socket.send(JSON.stringify({type:'commands',commands:current.queue}));}
  function acknowledge(current,data){
    const sent=current.queue;current.queue=current.queue.filter(a=>a.seq>data.lastSeq);current.nextSeq=Math.max(current.nextSeq,data.lastSeq||0);
    for(const ack of data.ack||[])if(current.lastAck===undefined||ack.seq>current.lastAck){const input=sent.find(a=>a.seq===ack.seq);if(!ack.ok){if(!['attack','move','walk'].includes(input?.type))toast(ack.message);if(input?.type==='ability')current.predictedAbilityUntil=0;}current.lastAck=ack.seq;}
  }
  function openLive(current){
    if(online!==current)return;
    clearTimeout(current.retryTimer);clearInterval(current.pingTimer);
    const url=new URL('/live',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';
    const socket=new WebSocket(url);current.socket=socket;current.up=false;
    const timeout=setTimeout(()=>{if(!current.up)socket.close();},8000);
    socket.onopen=()=>{if(online!==current||current.socket!==socket)return;socket.send(JSON.stringify({type:'auth',code:current.code,token:current.token}));};
    socket.onmessage=event=>{
      if(online!==current||current.socket!==socket)return;
      let data;try{data=JSON.parse(event.data);}catch{return;}
      if(data.type==='pong'){
        const rtt=performance.now()-data.echo;if(rtt>=0&&rtt<30000){current.ping=Math.round(rtt);current.pings.push(rtt);if(current.pings.length>12)current.pings.shift();}return;
      }
      if(data.type==='error'){toast(data.message);if(data.fatal)leaveRoom(false);return;}
      if(data.type==='ack'){acknowledge(current,data);return;}
      if(data.type!=='state')return;
      if(!data.full&&data.seq!==current.frameSeq+1){if(!current.resync){current.resync=true;socket.send(JSON.stringify({type:'resync'}));}return;}
      try{current.rawWorld=applyNetFrame(current.rawWorld,data);}catch{if(!current.resync){current.resync=true;socket.send(JSON.stringify({type:'resync'}));}return;}
      world=current.rawWorld;current.frameSeq=data.seq;current.lastAt=performance.now();current.up=true;current.failures=0;
      if(data.full){localMotion=null;motion.clear();current.resync=false;lastEvent=world.eventId;if(Number.isSafeInteger(data.lastSeq))acknowledge(current,data);}
      if(data.roster)current.roster=data.roster;if(data.inviteBase)current.inviteBase=data.inviteBase;
      motion.push(world,current.lastAt);current.received++;
      if(me().cooldown>0)current.predictedAbilityUntil=0;
      processEvents();clearTimeout(timeout);
      if(!current.pingTimer){const ping=()=>{if(performance.now()-current.lastAt>5000){socket.close();return;}if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'ping',time:performance.now()}));};ping();current.pingTimer=setInterval(ping,2000);flushCommands();}
    };
    socket.onerror=()=>{};
    socket.onclose=event=>{
      clearTimeout(timeout);if(online!==current||current.socket!==socket)return;clearInterval(current.pingTimer);current.pingTimer=null;current.up=false;
      if(event.code===4001||event.code===4003){toast(event.code===4001?'Сессия открыта в другой вкладке.':'Сессия потеряна. Войди в комнату заново.');leaveRoom(false);return;}
      current.failures++;current.retryTimer=setTimeout(()=>openLive(current),Math.min(3000,250*current.failures));updateUI();
    };
  }
  function predictCast(type,seq){
    if(chosen==='host'||!['attack','ability'].includes(type))return;
    const p=me(),now=performance.now(),ability=type==='ability';
    if(!world.started||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0||ability&&p.mana<manaCost(p)||ability&&(p.cooldown>0||online.predictedAbilityUntil>now))return;
    if(!ability&&now<(online.nextLocalShot||0))return;
    const targets=world.enemies.filter(e=>allowedTarget(p,e,ability)&&Math.hypot(e.x-p.x,e.y-p.y)<=attackRange(p)+(ability?100:0)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));if(!targets.length)return;
    const skill=ability?p.skill:p.id,index=HEROES.findIndex(h=>h.id===chosen),seat={x:p.x-30,y:p.y+15};
    const count=ability?({drow:5,timber:8,sf:6,rubick:6,sniper:1}[skill]):1;
    effects.cast({hero:chosen,skill,ability,x:seat.x+50,y:seat.y-60,points:targets.slice(0,count).map(e=>({x:e.x,y:e.y-15}))});
    online.predicted.add(seq);if(online.predicted.size>32)online.predicted.delete(online.predicted.values().next().value);
    online.localPoseUntil=now+220;online.nextLocalShot=now+250;if(ability)online.predictedAbilityUntil=now+heroInfo(skill).cooldown*1000;tone(ability?900:550,.04,'triangle');
  }
  function leaveRoom(notify=true){
    const old=online;if(!old)return;if(notify)request('/api/rooms/'+old.code+'/leave',{token:old.token}).catch(()=>{});
    online=null;localMotion=null;held.clear();old.socket?.close(4000,'Left room');clearTimeout(old.retryTimer);clearInterval(old.pingTimer);motion.clear();effects.clear();world=soloWorld;lastEvent=world.eventId;location.hash='';soloPaused=false;updateUI();renderPortraits();
  }
  function updateUI(){
    const p=me(),h=chosen==='host'?HOST:heroInfo(chosen),skill=heroInfo(p.skill),rules=waveRules(world.wave),personalPause=online?p.paused:soloPaused;
    $('level').innerHTML=number(p.level)+'<span class="level-star">✳</span>';$('kills').textContent=number(world.kills);
    $('gold').innerHTML=number(p.gold)+'<span class="gold-unit">G</span>';$('xp').textContent=number(p.xp);$('xpNeeded').textContent=number(requiredXP(p));
    const percent=p.xp/requiredXP(p)*100;$('xpFill').style.width=percent+'%';$('xpBar').setAttribute('aria-valuenow',String(Math.floor(percent)));
    $('wave').textContent=String(world.wave).padStart(2,'0');$('waveDescription').textContent=world.phase==='boss'?'ФИНАЛЬНЫЙ БОСС · РОШАН':world.phase==='teamfight'?'ТИМФАЙТ 5 × 5':world.spawned+'/'+rules.count+' · '+(rules.boss?'РОШАН ПОСЛЕ ВОЛНЫ':rules.teamfight?'БОЙ ПОСЛЕ ВОЛНЫ':'КРИПЫ');
    $('damageStat').textContent='Урон: '+number(damage(p));$('speedStat').textContent='Атака: '+attackSpeed(p).toFixed(1)+'/сек';
    $('saveStatus').textContent=online?'Комната '+online.code:saveAvailable?'Прогресс сохранён':'Сохранение недоступно';
    $('sessionTime').textContent=String(Math.floor(world.seconds/60)).padStart(2,'0')+':'+String(Math.floor(world.seconds%60)).padStart(2,'0');
    $('heroName').textContent=h.name.toUpperCase();$('heroClass').textContent=h.hero.toUpperCase();
    $('heroStatus').textContent=chosen==='host'?'Следит за отрядом':p.respawn>0?'Встанет через '+Math.ceil(p.respawn)+' сек':personalPause?'На перекуре':chosen==='sniper'?(world.phase==='boss'?'Рошан: авто ≤4% · Q ≤8% HP':'Не трогает крипов. Стилит героев.'):p.channel>0?'Готовит Requiem of Souls':p.moving?'Меняет позицию':p.auto?'Фармит. Следит за маной.':'Ручной фарм';
    $('sceneStatus').textContent=online?(online.up?'WS · '+online.ping+' MS · '+fps+' FPS':'ПЕРЕПОДКЛЮЧЕНИЕ…'):world.started?'ОТРЯД ФАРМИТ':'ОТРЯД ЖДЁТ';
    $('autoButton').disabled=chosen==='host';$('autoButton').setAttribute('aria-pressed',String(p.auto));$('soundButton').setAttribute('aria-pressed',String(sound));
    $('soundButton').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');$('soundButton').querySelector('use').setAttribute('href',sound?'#sound':'#mute');
    $('pauseButton').disabled=!!online&&chosen==='host';$('pauseButton').setAttribute('aria-pressed',String(personalPause));$('pauseButton').setAttribute('aria-label',personalPause?'Продолжить':'Пауза');$('pauseButton').querySelector('use').setAttribute('href',personalPause?'#play':'#pause');
    $('pausedOverlay').hidden=online||!soloPaused;$('startOverlay').hidden=world.started;
    $('startButtonText').textContent=world.seconds>0?'ПРОДОЛЖИТЬ ФАРМ':'СЕСТЬ И КАЧАТЬСЯ';
    const cooldown=Math.max(p.cooldown,online?.predictedAbilityUntil?(online.predictedAbilityUntil-performance.now())/1000:0);$('abilityName').textContent=skill.skill;$('multiStatus').textContent=cooldown>0?'Ещё '+Math.ceil(cooldown)+' сек':skill.hint;$('manaCost').textContent=manaCost(p)+' MP';
    $('multiButton').title=skill.skill+' (Q)';$('multiButton').disabled=chosen==='host'||cooldown>0||p.mana<manaCost(p)||p.channel>0||p.stun>0||p.hex>0||personalPause||p.respawn>0||!!(online&&!online.up);
    $('attackButton').disabled=chosen==='host'||personalPause||p.respawn>0||!!(online&&!online.up);
    $('heroHealth').textContent=number(p.hp)+' / '+number(maxHP(p))+' HP · Фрагов: '+p.heroKills;
    $('manaText').textContent=number(p.mana)+' / '+number(maxMana(p))+' MP · +'+manaRegen(p).toFixed(1)+'/сек';$('manaFill').style.width=(100*p.mana/maxMana(p))+'%';
    $('sfAbilities').hidden=chosen!=='sf';
    for(const [key,button,label,cost] of [['eulCooldown','eulButton','Eul',75],['ultCooldown','ultButton','Requiem',175]]){
      $(button).disabled=chosen!=='sf'||p[key]>0||p.mana<cost||p.channel>0||p.stun>0||p.hex>0||p.respawn>0||personalPause||!!(online&&!online.up);
      $(button+'Status').textContent=p[key]>0?Math.ceil(p[key])+' сек':cost+' MP';
    }
    $('channelStatus').textContent=p.channel>0?'REQUIEM: '+p.channel.toFixed(1)+' сек · не двигайся':p.slow>0?'ЗАМЕДЛЕНИЕ · '+Math.ceil(p.slow)+' сек':'WASD / стрелки · клик по земле — идти · клик по врагу — выбрать цель';
    const selected=world.enemies.find(e=>e.id===p.target&&e.hp>0);$('targetStatus').textContent=selected?(selected.heroName||selected.name||'Крип')+' · '+number(selected.hp)+' HP':'Автоматический выбор ближайшей цели';
    $('waveDetails').textContent=world.phase==='boss'?'РОШАН · −35% входящего урона · регенерация · лимит 180 сек':world.phase==='teamfight'?'Враги: усиленное HP · −28% входящего урона · быстрые способности':rules.count+' крипов · '+rules.hp+' HP · '+rules.damage+' урона · '+rules.speed+' скорость';
    for(const type of ['damage','speed','wisdom']){$(type+'Price').textContent=number(upgradeCost(p,type))+' G';$(type+'Rank').textContent=p[type]?'УР. '+p[type]:'I';document.querySelector('[data-upgrade="'+type+'"]').disabled=chosen==='host'||p.gold<upgradeCost(p,type)||!!(online&&!online.up);}
    $('hostPanelButton').hidden=!(online?.host||!online&&chosen==='host');
    $('roomLobby').hidden=!!online;$('roomConnected').hidden=!online;
    if(online){$('roomCode').textContent=online.code;$('connectionStatus').textContent=online.up?'WebSocket · '+online.ping+' мс · '+fps+' FPS':'Связь потеряна. Переподключаемся…';}
    $('resetButton').disabled=!!online;$('resetButton').title=online?'Сброс доступен только в одиночной игре':'Сбросить одиночную игру';
    for(const hero of PICKS){const card=$('pick-'+hero.id),player=world.players[hero.id]||world.players.drow;card.classList.toggle('selected',chosen===hero.id);card.setAttribute('aria-pressed',String(chosen===hero.id));card.disabled=!!online;const human=online?.roster.find(r=>r.id===hero.id)?.human;$('status-'+hero.id).textContent=hero.id==='host'?(chosen==='host'?'ТЫ · ВЕДУЩИЙ':human?'ВЕДУЩИЙ ОНЛАЙН':'НАБЛЮДАТЕЛЬ'):hero.id===chosen?'ТЫ · УР. '+player.level:human?'ИГРОК · УР. '+player.level:'БОТ · УР. '+player.level;$('hp-'+hero.id).style.width=(100*player.hp/maxHP(player))+'%';}
    const boss=world.phase==='boss',fighting=boss||world.phase==='teamfight';$('fightPanel').hidden=!fighting;$('enemyLineup').hidden=!fighting;
    $('fightTitle').textContent=boss?'ФИНАЛЬНЫЙ БОСС · РОШАН':'ТИМФАЙТ 5 × 5';
    $('fightScore').textContent='Тимфайты: '+world.wins+' побед · '+world.losses+' поражений'+(world.bossKills?' · Рошан убит':'' );
    if(fighting){
      const roshan=world.enemies.find(e=>e.boss);
      $('fightAlive').textContent=boss&&roshan?number(roshan.hp)+' / '+number(roshan.maxHP)+' HP · '+Math.max(0,Math.ceil(180-world.fightTime))+' СЕК':Object.values(world.players).filter(p=>p.respawn<=0).length+' НАШИХ / '+world.enemies.length+' ВРАГОВ';
      $('fightHint').textContent=boss?(world.breakTime>0?'НОВАЯ ПОПЫТКА ЧЕРЕЗ '+Math.ceil(world.breakTime)+' СЕК':roshan?.enraged?'ЯРОСТЬ! ЭМИР ЖДЁТ 8% HP':'BASH · THUNDER CLAP · ЭМИР ЖДЁТ 8% HP'):world.enemies.some(e=>e.hero&&e.hp/e.maxHP<=.3)?'ЭМИР, ТВОЙ ВЫХОД!':'ЭМИР ЖДЁТ 30% HP';
      const teamKey=world.phase+':'+world.wave+':'+world.enemyTeam.join(',');
      if(enemyTeamKey!==teamKey){enemyTeamKey=teamKey;$('enemyLineup').innerHTML=world.enemyTeam.map(id=>{const h=id==='roshan'?ROSHAN:ENEMY_HEROES.find(h=>h.id===id);return '<div id="enemy-card-'+id+'" class="enemy-card"><strong>'+h.name+'</strong><span>'+h.skill+'</span><small>'+h.description+'</small><div class="enemy-hp"><i id="enemy-hp-'+id+'"></i></div></div>';}).join('');}
      for(const id of world.enemyTeam){const e=world.enemies.find(e=>e.kit===id&&e.hp>0);$('enemy-card-'+id).classList.toggle('defeated',!e);$('enemy-hp-'+id).style.width=(e?e.hp/e.maxHP*100:0)+'%';}
    }
  }
  // Pixel art is drawn locally: no image downloads or spritesheet dependencies.
  let seed = 2026;
  function rand() {seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296;}
  const bg = document.createElement('canvas'); bg.width=W; bg.height=H;
  const b = bg.getContext('2d'); b.imageSmoothingEnabled=false;
  function rect(c,x,y,w,h,color) {c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function polygon(c,points,color) {c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  function tree(c,x,y,s=1,dark=false) {
    const p=(a,v,w,h,col)=>rect(c,x+a*s,y+v*s,w*s,h*s,col);
    const trunk=dark?'#233d31':'#49604a', shadow=dark?'#193b30':'#28533c', mid=dark?'#244b38':'#39694a', lit=dark?'#31543b':'#527b4f';
    p(-9,0,18,115,trunk);p(-4,20,5,88,dark?'#304c37':'#647052');p(-20,107,40,8,trunk);p(-28,112,54,5,shadow);
    p(-44,-18,86,40,shadow);p(-60,-44,112,39,shadow);p(-47,-69,92,42,mid);p(-32,-85,64,29,mid);p(-13,-95,35,22,mid);
    p(-48,-43,26,13,lit);p(-29,-70,36,13,lit);p(-9,-85,28,10,lit);p(13,-53,27,9,lit);p(28,-24,20,8,mid);p(-24,-5,33,9,mid);
    for(let i=0;i<20;i++)p(-45+rand()*85,-70+rand()*80,4+rand()*9,3+rand()*5,rand()>.4?mid:lit);
  }
  function stone(c,x,y,s=1) {polygon(c,[[x-14*s,y],[x-20*s,y-9*s],[x-11*s,y-21*s],[x+8*s,y-23*s],[x+20*s,y-10*s],[x+15*s,y]],'#637568');polygon(c,[[x-20*s,y-9*s],[x-11*s,y-21*s],[x+8*s,y-23*s],[x+3*s,y-12*s]],'#8c9a7b');rect(c,x-9*s,y-8*s,17*s,5*s,'#526657');}
  function grass(c,x,y,s=1,color='#75945b') {rect(c,x,y,3*s,9*s,color);rect(c,x-5*s,y+3*s,3*s,7*s,color);rect(c,x+5*s,y-3*s,3*s,13*s,color);}
  function buildForest() {
    rect(b,0,0,W,H,'#18372d');
    for(let i=0;i<2300;i++)rect(b,rand()*W,rand()*H,5+rand()*24,3+rand()*6,['#1e4031','#244936','#2b5039','#31543b'][i%4]);
    polygon(b,[[40,580],[450,400],[850,440],[1300,250],[1780,340],[1780,460],[1350,380],[920,570],[470,540],[40,710]],'#3b4d38');
    polygon(b,[[720,90],[880,90],[1020,320],[940,570],[1150,960],[1010,1000],[800,620],[870,340]],'#183e41');
    for(let i=0;i<70;i++){const x=820+Math.sin(i*.2)*100,y=120+i*13;rect(b,x,y,25+rand()*50,3,'#2a5550');}
    for(let i=0;i<29;i++)tree(b,i*68-25,45+(i%3)*16,.85,true);
    for(let i=0;i<21;i++){tree(b,-40,170+i*44,1,true);tree(b,W+35,160+i*45,1,true);}
    for(let i=0;i<29;i++)tree(b,i*68,1030+(i%3)*10,.9,true);
    for(let i=0;i<100;i++){const x=95+rand()*(W-190),y=160+rand()*(H-260);if(i%4===0)stone(b,x,y,.5);else grass(b,x,y,.65,'#4b6842');}
    // The camp and Roshan pit are landmarks, not collision obstacles.
    b.strokeStyle='#68835a55';b.lineWidth=3;b.beginPath();b.ellipse(360,580,210,240,0,0,Math.PI*2);b.stroke();
    for(let i=0;i<9;i++){const a=i*Math.PI/8;stone(b,1500+Math.cos(a)*170,490+Math.sin(a)*190,1);}
    b.fillStyle='#9bb179';b.font='16px monospace';b.fillText('ЛАГЕРЬ ОТРЯДА',200,200);b.fillStyle='#a8896d';b.fillText('ЛОГОВО РОШАНА',1410,200);
    const vignette=b.createRadialGradient(W/2,H/2,200,W/2,H/2,1100);vignette.addColorStop(0,'#071b1300');vignette.addColorStop(1,'#06150e88');b.fillStyle=vignette;b.fillRect(0,0,W,H);
  }
  buildForest();

  function drow(c,x,y,scale=2,pose=0,portrait=false) {
    const p=(a,v,w,h,col)=>rect(c,x+a*scale,y+v*scale,w*scale,h*scale,col);
    if(!portrait){c.fillStyle='#172c2250';c.beginPath();c.ellipse(x+12*scale,y+41*scale,23*scale,5*scale,0,0,Math.PI*2);c.fill();}
    // Dark blue hood, pale hair and blue elven face.
    p(2,2,20,5,'#152a3c');p(-1,7,26,18,'#1a3449');p(2,5,20,15,'#294b62');p(6,7,16,4,'#c1d4d7');
    p(5,10,5,15,'#d1dee0');p(9,11,12,13,'#7daebc');p(18,12,6,8,'#92bac5');p(10,12,10,5,'#a8cbd0');
    p(16,15,4,2,'#e9faf2');p(20,16,3,1,'#192e41');p(20,20,2,2,'#4c768a');p(2,14,4,16,'#8bafb9');
    p(-4,23,16,19,'#223b54');p(-6,29,10,19,'#1a3146');p(-7,43,13,5,'#192d40');p(1,25,18,14,'#385b73');
    p(3,26,6,10,'#7fabb8');p(13,26,8,5,'#4c7c91');p(3,36,20,5,'#152d42');p(6,38,17,5,'#416277');
    if(portrait)return;
    // Bent knees and boots: she stays seated on her stump.
    p(11,40,18,6,'#567889');p(25,42,7,13,'#2b455b');p(26,53,13,4,'#192c3d');p(2,42,17,5,'#355368');p(14,46,8,12,'#233b50');p(13,55,13,4,'#172d3e');
    const arm = pose>0?2:0;
    p(18,29-arm,15,5,'#78a7b7');p(30,28-arm,7,5,'#a0c2cc');p(8,28,7,6,'#476d83');p(13,30,15,4,'#7da7b8');
    // Frost bow and silver arrow.
    p(35,18-arm,3,6,'#7fb1bf');p(38,23-arm,3,9,'#a1d0d6');p(39,31-arm,3,7,'#badfe1');p(36,38-arm,3,7,'#7fb1bf');p(33,44-arm,3,5,'#6b9dad');
    c.strokeStyle='#9dc8d0';c.lineWidth=1;c.beginPath();c.moveTo(x+36*scale,y+(19-arm)*scale);c.lineTo(x+(pose>0?25:34)*scale,y+32*scale);c.lineTo(x+34*scale,y+(48-arm)*scale);c.stroke();
    if(pose>0){p(25,31,24,1,'#d6f5ec');p(47,30,3,3,'#c0eff0');}
  }


  function creep(e) {
    const s=e.ranged?1.2:1.3,x=e.x,y=e.y,walk=Math.sin(elapsed*7+e.id)*2;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    if(e.hit>0)ctx.globalAlpha=.6+.4*Math.sin(e.hit*60);
    const p=(a,v,w,h,col)=>rect(ctx,a*s,(v+walk)*s,w*s,h*s,col);
    ctx.fillStyle='#19372455';ctx.beginPath();ctx.ellipse(0,5,23,6,0,0,Math.PI*2);ctx.fill();
    const skin=e.ranged?'#9e9471':'#a79474', armor=e.ranged?'#54665a':'#9c5641';
    p(-8,-34,16,11,skin);p(-11,-32,5,6,skin);p(6,-32,7,5,skin);p(-7,-38,13,5,'#5b5143');p(-10,-38,4,7,'#c5ad83');p(5,-38,4,7,'#c5ad83');
    p(-8,-27,3,2,'#e9d8a5');p(2,-27,3,2,'#e9d8a5');p(-4,-23,8,3,'#5b5143');
    p(-10,-21,20,16,armor);p(-14,-20,8,8,'#b0805b');p(7,-20,8,8,'#b0805b');p(-7,-19,3,12,'#bca078');p(5,-18,3,11,'#794734');
    p(-9,-7,18,4,'#4b4335');p(-8,-3,6,9,'#675f46');p(2,-3,6,9,'#675f46');p(-11,4+(Math.sin(elapsed*7+e.id)>0?1:-1),9,4,'#3c4436');p(2,4,9,4,'#3c4436');
    if(e.ranged){p(-18,-38,3,41,'#766a4e');p(-21,-42,9,8,'#bdc08a');p(-19,-41,5,5,'#d9dfaa');}
    else{p(-18,-17,4,21,'#645f49');p(-21,-18,10,5,'#8e9b8c');p(-19,-30,6,14,'#c0c6a7');p(-19,-31,3,10,'#dbe0c6');}
    ctx.restore();
    if(world.started){rect(ctx,e.x-20,e.y-73,40,4,'#203a29');rect(ctx,e.x-20,e.y-73,40*Math.max(0,e.hp/e.maxHP),4,e.ranged?'#b1b876':'#bf875c');}
  }
  function otherHero(c,id,x,y,s=1.6,pose=0,portrait=false){
    if(id==='drow'){drow(c,x,y,s,pose,portrait);return;}
    const p=(a,v,w,h,col)=>rect(c,x+a*s,y+v*s,w*s,h*s,col);
    if(id==='timber'){
      p(-4,24,39,22,'#594e40');p(-7,27,43,10,'#bd8a45');p(-2,28,32,6,'#dda85b');p(1,37,27,8,'#64736a');
      p(7,8,17,16,'#a89a66');p(4,4,22,8,'#d8bc75');p(7,9,6,6,'#2f443d');p(17,9,6,6,'#2f443d');p(10,20,12,5,'#674b37');
      p(-11,41,11,15,'#494e47');p(29,41,11,15,'#494e47');p(-13,53,15,6,'#8b8e77');p(27,53,16,6,'#8b8e77');
      p(33,27,13,5,'#8caa9b');p(42,17,6,26,'#a6b6a5');p(35,23,20,13,'#ced4b5');p(41,19,9,22,'#d9d8b8');p(42,27,7,6,'#776343');
    }else if(id==='sf'){
      p(0,16,30,34,'#2b232b');p(5,20,21,23,'#6c3534');p(12,26,7,12,'#ef9661');p(14,27,3,8,'#f4d17b');
      p(4,4,22,17,'#282730');p(-2,-5,6,17,'#683932');p(26,-5,6,17,'#683932');p(0,-8,4,9,'#ab5a42');p(28,-8,4,9,'#ab5a42');
      p(6,11,6,3,'#f7a05b');p(19,11,6,3,'#f7a05b');p(12,17,9,4,'#cc6c45');
      p(-9,23,10,24,'#4c2e34');p(29,23,10,24,'#4c2e34');p(-12,44,12,6,'#d17a50');p(34,44,12,6,'#d17a50');p(4,46,9,13,'#2c2930');p(20,46,9,13,'#2c2930');
    }else if(id==='rubick'){
      p(1,17,25,34,'#294c3b');p(-3,44,34,11,'#1d3f34');p(5,22,17,24,'#53845a');p(13,22,4,25,'#c5b56b');
      p(2,1,24,17,'#213d35');p(5,-4,18,9,'#669b5b');p(7,9,15,10,'#1b302d');p(10,11,4,3,'#c8f296');p(18,11,4,3,'#c8f296');p(7,0,4,8,'#94bc74');
      p(26,25,11,6,'#7caa76');p(36,0,3,53,'#a6a577');p(30,-7,15,12,'#b8dc88');p(34,-10,8,18,'#76b85f');p(35,-5,6,7,'#e0f4b2');
    }else{
      p(4,17,23,27,'#6d7955');p(7,24,18,15,'#99865a');p(6,4,22,15,'#bca47a');p(2,0,28,8,'#75835c');p(-2,6,35,4,'#485c48');
      p(21,12,4,3,'#e6eac5');p(4,16,20,15,'#e5dfc7');p(8,21,14,14,'#d4d1b6');p(8,33,8,6,'#d4d1b6');
      p(21,28,31,7,'#524d40');p(43,28,17,4,'#b1b5a0');p(29,22,9,7,'#66786e');p(30,21,7,2,'#b0c09c');p(19,32,11,5,'#b79b73');p(4,42,8,15,'#3d5142');p(20,42,8,15,'#3d5142');p(0,54,13,5,'#454940');p(18,54,15,5,'#454940');
    }
    if(pose>0){p(48,27,7,7,heroInfo(id).color);p(54,29,8,3,'#f6edbb');}
  }
  function renderPortraits(){
    for(const h of PICKS){const c=$('portrait-'+h.id).getContext('2d');c.clearRect(0,0,64,64);rect(c,0,0,64,64,'#263c30');if(h.id==='host'){c.font='32px serif';c.fillStyle='#e6d59a';c.fillText('♛',16,44);}else otherHero(c,h.id,13,10,1.1,0,true);}
    const c=$('portrait').getContext('2d');c.clearRect(0,0,56,56);rect(c,0,0,56,56,'#2d4437');if(chosen==='host'){c.font='32px serif';c.fillStyle='#e6d59a';c.fillText('♛',13,39);}else otherHero(c,chosen,11,4,1.05,0,true);
  }
  function neutralDraw(e){
    const kit=NEUTRALS.find(h=>h.id===e.neutral),x=e.x,y=e.y,s=e.neutral==='centaur'?1.55:1.4,p=(a,v,w,h,col)=>rect(ctx,x+a*s,y+v*s,w*s,h*s,col),color=e.hit>0?'#efd4b5':kit.color;
    ctx.fillStyle='#071b1580';ctx.beginPath();ctx.ellipse(x,y+4,28,8,0,0,Math.PI*2);ctx.fill();
    if(e.neutral==='centaur'){
      p(-23,-24,46,20,color);for(const a of [-20,-9,10,19])p(a,-8,6,14,'#70553e');p(-14,-53,25,31,color);p(-9,-66,20,17,'#cfae7d');p(-12,-70,6,11,'#e1d0a6');p(8,-70,6,11,'#e1d0a6');p(17,-56,4,44,'#9c8d6f');p(12,-62,16,12,'#d0c3a0');
    }else if(e.neutral==='hellbear'){
      p(-23,-49,46,44,color);p(-18,-69,36,26,color);p(-21,-73,9,12,'#784736');p(12,-73,9,12,'#784736');p(-10,-52,21,14,'#d5aa7b');p(-4,-54,8,5,'#402d29');p(-26,-40,9,37,color);p(17,-40,9,37,color);p(-17,-7,12,13,'#613f33');p(5,-7,12,13,'#613f33');
    }else{
      p(-14,-40,28,32,color);p(-12,-62,24,23,color);p(-18,-73,6,24,'#cfc09c');p(12,-73,6,24,'#cfc09c');p(-23,-78,11,7,'#e3d4af');p(12,-78,11,7,'#e3d4af');p(-20,-37,7,25,color);p(13,-37,7,25,color);p(-12,-8,8,15,'#50434b');p(4,-8,8,15,'#50434b');
      p(22,-66,3,64,'#9c8b66');p(17,-72,14,12,e.neutral==='mindstealer'?'#7baef2':e.neutral==='banisher'?'#b5d28c':'#e6a673');
    }
    p(-8,-56,5,3,'#f4e1a2');p(4,-56,5,3,'#f4e1a2');
    ctx.textAlign='center';ctx.font='10px monospace';ctx.fillStyle='#d5c6ad';ctx.fillText(kit.name,x,y-115);
    rect(ctx,x-30,y-105,60,4,'#15251f');rect(ctx,x-30,y-105,60*e.hp/e.maxHP,4,'#b58d65');
    rect(ctx,x-30,y-98,60*e.mana/e.maxMana,2,'#7da6df');
  }
  function drawHazards(){
    for(const h of world.hazards||[]){
      const color=h.kind==='manaBurn'?'#8caff0':'#ee9b64';ctx.save();ctx.strokeStyle=color;ctx.fillStyle=h.kind==='manaBurn'?'#6f89c42b':'#d06b3a2b';ctx.lineWidth=3;ctx.setLineDash([12,8]);
      if(h.kind==='shockwave'){ctx.lineWidth=h.radius*2;ctx.strokeStyle='#db87593b';ctx.beginPath();ctx.moveTo(h.fromX,h.fromY);ctx.lineTo(h.toX,h.toY);ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(h.fromX,h.fromY);ctx.lineTo(h.toX,h.toY);ctx.stroke();}
      else{ctx.beginPath();ctx.ellipse(h.x,h.y,h.radius,h.radius,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
      ctx.setLineDash([]);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 15px monospace';ctx.fillText(h.delay.toFixed(1)+' с',h.x,h.y);ctx.restore();
    }
  }
  function roshanDraw(e){
    const x=e.x,y=e.y,s=1.65,bob=Math.sin(elapsed*3)*2,p=(a,v,w,h,col)=>rect(ctx,x+a*s,y+v*s+bob,w*s,h*s,col);
    ctx.fillStyle='#16251ebb';ctx.beginPath();ctx.ellipse(x,y+7,88,18,0,0,Math.PI*2);ctx.fill();
    const hide=e.hit>0?'#dfb08a':e.enraged?'#a34e3b':'#855f4c',plate=e.enraged?'#69382f':'#4f4a41';
    // Horns, stone shell, broad wings and huge fists form a distinct boss silhouette.
    polygon(ctx,[[x-45,y-130],[x-115,y-182],[x-98,y-66],[x-65,y-94]],plate);
    polygon(ctx,[[x+45,y-130],[x+115,y-182],[x+98,y-66],[x+65,y-94]],plate);
    p(-29,-58,58,44,plate);p(-23,-52,46,40,hide);p(-15,-45,30,31,'#bb8c66');
    for(let i=0;i<4;i++){p(-25+i*14,-63-(i%2)*4,9,15,'#b4a17d');p(-17+i*10,-40,7,5,plate);}
    p(-38,-42,15,30,hide);p(23,-42,15,30,hide);p(-43,-19,21,14,plate);p(22,-19,21,14,plate);
    p(-22,-16,17,19,hide);p(5,-16,17,19,hide);p(-26,-3,23,8,plate);p(3,-3,23,8,plate);
    p(-17,-76,34,26,hide);p(-20,-81,10,15,plate);p(10,-81,10,15,plate);
    p(-22,-89,7,16,'#bfa780');p(15,-89,7,16,'#bfa780');p(-27,-94,10,7,'#d5bf93');p(17,-94,10,7,'#d5bf93');
    p(-13,-68,9,4,e.enraged?'#ff663d':'#f3cb78');p(4,-68,9,4,e.enraged?'#ff663d':'#f3cb78');p(-12,-58,24,7,'#302a27');
    p(-10,-58,4,9,'#e1cfac');p(6,-58,4,9,'#e1cfac');
    if(e.enraged){ctx.strokeStyle='#ef764d';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+8,94+Math.sin(elapsed*8)*4,22,0,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#f4d7ab';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(e.enraged?'РОШАН · ЯРОСТЬ':'РОШАН',x,y-246);
    rect(ctx,x-90,y-235,180,8,'#302b28');rect(ctx,x-90,y-235,180*e.hp/e.maxHP,8,e.enraged?'#f0784c':'#bc8b5b');
    ctx.font='10px monospace';ctx.fillText(number(e.hp)+' / '+number(e.maxHP)+' HP',x,y-215);
  }
  function enemyHeroDraw(e){
    const x=e.x,y=e.y,s=1.25,p=(a,v,w,h,col)=>rect(ctx,x+a*s,y+v*s,w*s,h*s,col),color=e.color;
    ctx.fillStyle='#172c2255';ctx.beginPath();ctx.ellipse(x,y+5,30,7,0,0,Math.PI*2);ctx.fill();
    p(-13,-37,26,29,color);p(-17,-32,8,20,color);p(10,-32,8,20,color);p(-9,-10,7,15,'#34423b');p(4,-10,7,15,'#34423b');
    p(-10,-54,21,19,'#c6ad83');p(-7,-46,4,3,'#fff0bf');p(4,-46,4,3,'#fff0bf');
    if(e.kit==='axe'){
      p(-13,-53,26,17,'#b26a51');p(-8,-58,18,6,'#3f3631');p(-8,-32,16,9,'#593b31');p(-23,-53,4,57,'#776448');p(-33,-53,23,18,'#bac5aa');p(-28,-49,14,10,'#80938a');
    }else if(e.kit==='lina'){
      p(-14,-61,28,9,'#c26e40');p(-15,-55,7,29,'#dd8c49');p(10,-56,7,30,'#dd8c49');p(-8,-27,17,18,'#db945a');p(18,-38,9,15,'#eaa354');p(20,-43,5,13,'#f5d17c');
    }else if(e.kit==='cm'){
      p(-14,-58,29,10,'#75a3bb');p(-15,-51,7,21,'#bdd8dc');p(11,-51,7,21,'#bdd8dc');p(-6,-33,13,25,'#e1e7d7');p(-24,-62,3,62,'#849fa6');p(-29,-67,13,12,'#bfe9ed');p(-25,-71,5,20,'#e4ffff');
    }else if(e.kit==='pudge'){
      p(-22,-34,44,30,'#b4b58a');p(-16,-50,31,19,'#a6a87c');p(-15,-25,31,3,'#5e6e53');p(-4,-31,3,22,'#776f52');p(-22,-29,7,4,'#e3d8b2');p(23,-34,5,37,'#756448');p(19,-36,15,16,'#c6c9ad');
    }else if(e.kit==='pa'){
      p(-14,-59,28,11,'#284d50');p(-14,-51,7,20,'#376869');p(11,-51,7,20,'#376869');p(-8,-48,18,11,'#365354');p(-8,-46,5,2,'#bfe7e2');p(4,-46,5,2,'#bfe7e2');p(-26,-39,4,39,'#b9d7cc');p(23,-37,4,34,'#b9d7cc');
    }else if(e.kit==='tide'){
      p(-23,-39,46,34,'#719875');p(-18,-58,35,28,'#80aa7f');p(-9,-63,16,6,'#aac28b');p(-15,-43,27,4,'#d3dcac');p(-25,-20,8,21,'#528669');p(20,-49,4,49,'#808f78');p(12,-7,24,5,'#b4c0a0');p(11,-16,5,13,'#b4c0a0');p(31,-16,5,13,'#b4c0a0');
    }else if(e.kit==='sven'){
      p(-14,-57,27,22,'#5c81ac');p(-3,-56,4,20,'#b6c6c4');p(-11,-48,22,4,'#202f3d');p(11,-38,10,34,'#a15b4f');p(-26,-67,7,57,'#c8d4d2');p(-31,-16,18,5,'#a3b8aa');
    }else if(e.kit==='lion'){
      p(-12,-53,26,17,'#9e6d87');p(-17,-64,6,18,'#c4b185');p(12,-64,6,18,'#c4b185');p(-13,-68,5,10,'#d7c5a6');p(9,-68,5,10,'#d7c5a6');p(16,-30,17,17,'#b86f8f');p(22,-34,6,6,'#d7a48f');
    }else if(e.kit==='wd'){
      p(-13,-57,27,26,'#8c7462');p(-9,-54,19,6,'#d3cc9b');p(-9,-44,19,9,'#d4c198');p(-5,-43,4,6,'#3b3f37');p(4,-43,4,6,'#3b3f37');p(-5,-68,4,12,'#b7bb8e');p(4,-71,4,15,'#8fbd83');p(-24,-64,3,63,'#796c53');p(-28,-69,11,11,'#d6d8b4');
    }else if(e.kit==='invoker'){
      p(-13,-60,27,10,'#e4d5a0');p(-17,-31,33,9,'#d8be88');p(-6,-32,13,28,'#b59cc3');p(-23,-28,8,8,'#e4a16a');p(19,-34,8,8,'#a8d1ed');p(0,-72,8,8,'#d9a9e5');
    }else if(e.kit==='jugger'){
      p(-11,-58,24,24,'#e3dbbe');p(-5,-59,5,24,'#af5e4a');p(-12,-48,25,4,'#a75343');p(-3,-42,9,5,'#3d4239');p(-14,-24,29,8,'#a8664d');p(-27,-66,4,61,'#c1d4c4');p(-29,-12,10,4,'#d0ac69');
    }else{
      p(-12,-51,26,16,'#b590b9');p(-4,-69,8,18,'#ce82b0');p(-12,-61,24,9,'#e0acd3');p(-7,-47,5,3,'#e4f1ac');p(5,-47,5,3,'#e4f1ac');p(-24,-61,3,60,'#8f708e');p(-30,-66,15,12,'#dab9d6');p(-26,-69,7,18,'#b7d7a2');
    }
    ctx.fillStyle='#eed6bc';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(e.heroName,x,y-116);
    rect(ctx,x-28,y-108,56,4,'#25372b');rect(ctx,x-28,y-108,56*e.hp/e.maxHP,4,e.grave>0?'#dfa5e2':'#d99179');
    if(e.armor>0||e.spin>0||e.grave>0){ctx.strokeStyle=e.grave>0?'#e7a5e5':e.spin>0?'#edb17c':'#bfc3a4';ctx.beginPath();ctx.ellipse(x,y-40,41,57,0,0,Math.PI*2);ctx.stroke();}
  }
  function draw(dt){
    ctx.imageSmoothingEnabled=false;ctx.drawImage(bg,0,0);
    for(let i=0;i<16;i++){ctx.globalAlpha=.2+Math.sin(elapsed+i)*.15;rect(ctx,(i*73+Math.sin(elapsed*.3+i)*28)%W,130+(i*39)%220+Math.sin(elapsed*.65+i)*12,2,2,'#e4e8a9');}ctx.globalAlpha=1;
    const sample=online?motion.sample(performance.now()):null;
    const units=world.started?(sample?.enemies||world.enemies):[{id:0,x:1250,y:460,step:elapsed,hp:100,maxHP:100,ranged:false},{id:1,x:1450,y:660,step:elapsed,hp:100,maxHP:100,ranged:true}];
    drawHazards();
    for(const original of [...units].sort((a,b)=>a.y-b.y)){
      const e=original.cyclone>0?{...original,y:original.y-60-Math.sin(elapsed*8)*12}:original;
      if(e.boss)roshanDraw(e);else if(e.hero)enemyHeroDraw(e);else if(e.neutral)neutralDraw(e);else creep(e);
      if(original.cyclone>0){ctx.strokeStyle='#d8ede1';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(e.x,e.y+i*15,15+i*6,5,elapsed*5,0,Math.PI*2);ctx.stroke();}}
      if(original.fear>0){ctx.fillStyle='#e5b3e2';ctx.font='14px monospace';ctx.fillText('СТРАХ',e.x,e.y-130);}
    }
    const displayedPlayers=sample?.players||world.players;
    for(const h of [...HEROES].sort((a,b)=>displayedPlayers[a.id].y-displayedPlayers[b.id].y)){
      const p=world.players[h.id],view=h.id===chosen&&online&&localMotion?localMotion:displayedPlayers[h.id],x=view.x,y=view.y,walking=p.moving||h.id===chosen&&localMotion?.moving;
      const pose=h.id===chosen&&online?.localPoseUntil>performance.now()?.3:p.pose;
      ctx.globalAlpha=p.respawn>0?.35:1;
      const bob=walking?Math.sin(elapsed*13)*2:0;
      ctx.fillStyle='#071c1677';ctx.beginPath();ctx.ellipse(x,y+4,26,7,0,0,Math.PI*2);ctx.fill();
      if(p.hex>0){rect(ctx,x-18,y-22,36,20,'#7d9f58');rect(ctx,x-14,y-28,7,7,'#b5ce77');rect(ctx,x+9,y-28,7,7,'#b5ce77');}
      else{
        if(!walking){rect(ctx,x-15,y-12,36,15,'#514e39');rect(ctx,x-17,y-16,40,6,'#82784f');}
        otherHero(ctx,h.id,x-15,y-66+bob,1.12,pose);
        if(walking){const stride=Math.sin(elapsed*13)*5;rect(ctx,x-8,y-14+stride,8,13,'#273b31');rect(ctx,x+6,y-14-stride,8,13,'#273b31');rect(ctx,x-10,y-3+stride,12,4,'#17271f');rect(ctx,x+5,y-3-stride,12,4,'#17271f');}
      }
      if(world.bigHeadsUntil>world.seconds){const face=$('portrait-'+h.id);ctx.drawImage(face,7,0,42,29,x-22,y-90,58,40);}
      ctx.textAlign='center';ctx.font='bold 12px monospace';ctx.fillStyle=h.id===chosen?'#e7f5b6':h.color;ctx.fillText(h.name.toUpperCase(),x,y-94);
      rect(ctx,x-25,y-86,50,4,'#11251d');rect(ctx,x-25,y-86,50*p.hp/maxHP(p),4,h.color);rect(ctx,x-25,y-79,50*p.mana/maxMana(p),3,'#76a7df');
      if(p.stun>0){ctx.fillStyle='#e7db86';ctx.font='20px monospace';ctx.fillText('✦',x,y-105);}
      if(p.channel>0){ctx.strokeStyle='#ff684e';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,Math.max(0,60+Math.sin(elapsed*8)*10),30,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffbca0';ctx.fillText('REQUIEM '+p.channel.toFixed(1),x,y-112);}
      if(p.respawn>0){ctx.font='bold 16px monospace';ctx.fillStyle='#efdeb7';ctx.fillText(Math.ceil(p.respawn)+'с',x,y-40);}ctx.globalAlpha=1;
      if(h.id===chosen){ctx.strokeStyle='#d6e9a5';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+8,30,9,0,0,Math.PI*2);ctx.stroke();}
    }
    const selected=world.enemies.find(e=>e.id===me().target&&e.hp>0);
    if(selected){ctx.strokeStyle='#f4c681';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(selected.x,selected.y+5,35,12,0,0,Math.PI*2);ctx.stroke();}
    if(moveMarker&&elapsed-moveMarker.at<1){ctx.strokeStyle='#c2e58b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(moveMarker.x,moveMarker.y,12+(elapsed-moveMarker.at)*15,6+(elapsed-moveMarker.at)*8,0,0,Math.PI*2);ctx.stroke();}
    const visibleShots=sample?.projectiles||world.projectiles,visibleEnemies=new Map(units.map(e=>[e.id,e]));
    for(const shot of visibleShots)if(shot.delay<=0)drawProjectile(ctx,shot,visibleEnemies.get(shot.target),elapsed);
    effects.draw(ctx,dt,elapsed);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt;ctx.globalAlpha=Math.min(1,p.life*2);rect(ctx,p.x,p.y,3,3,p.color);}particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;
    ctx.font='bold 11px monospace';ctx.textAlign='center';for(const f of floating){f.y-=22*dt;f.life-=dt;ctx.globalAlpha=Math.min(1,f.life*2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}floating=floating.filter(f=>f.life>0);ctx.globalAlpha=1;
  }
  function startLocalMotion(type,data){
    if(!online||!online.up||chosen==='host'||!world.started||me().paused||me().respawn>0)return;
    localMotion||={x:me().x,y:me().y,moving:false};
    if(type==='walk'){localMotion.dx=data.dx;localMotion.dy=data.dy;localMotion.destination=null;}
    else{localMotion.dx=0;localMotion.dy=0;localMotion.destination={x:Math.max(ARENA.minX,Math.min(ARENA.maxX,data.x)),y:Math.max(ARENA.minY,Math.min(ARENA.maxY,data.y))};}
  }
  function sendWalk(){
    if(chosen==='host'||!world.started||soloPaused||document.hidden||document.querySelector('dialog[open]'))return;
    const dx=Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft')),dy=Number(held.has('KeyS')||held.has('ArrowDown'))-Number(held.has('KeyW')||held.has('ArrowUp'));
    const key=dx+':'+dy;if(key===lastWalk&&performance.now()-walkSent<100)return;
    if(key==='0:0'&&lastWalk===key)return;lastWalk=key;walkSent=performance.now();action('walk',{dx,dy});
  }
  function updateMovement(dt,time){
    if(document.querySelector('dialog[open]')){if(held.size||lastWalk!=='0:0'){held.clear();lastWalk='0:0';if(chosen!=='host'&&world.started)action('walk',{dx:0,dy:0});}if(localMotion){localMotion.dx=0;localMotion.dy=0;localMotion.destination=null;}}
    if(held.size)sendWalk();
    if(!online||!localMotion)return;
    const p=me();if(!online.up||p.respawn>0||p.paused){localMotion=null;return;}
    let dx=localMotion.destination?localMotion.destination.x-localMotion.x:localMotion.dx||0,dy=localMotion.destination?localMotion.destination.y-localMotion.y:localMotion.dy||0;
    const len=Math.hypot(dx,dy),amount=moveSpeed(p)*dt*(localMotion.destination?Math.min(1,len/(moveSpeed(p)*dt||1)):1);
    localMotion.moving=len>1e-4&&p.stun<=0&&p.hex<=0&&p.channel<=0;
    if(localMotion.moving){localMotion.x=Math.max(ARENA.minX,Math.min(ARENA.maxX,localMotion.x+dx/len*amount));localMotion.y=Math.max(ARENA.minY,Math.min(ARENA.maxY,localMotion.y+dy/len*amount));}
    const age=Math.min(.2,(performance.now()-online.lastAt)/1000),authoritativeX=p.x+(p.moving&&len?dx/len*moveSpeed(p)*age:0),authoritativeY=p.y+(p.moving&&len?dy/len*moveSpeed(p)*age:0);
    const error=Math.hypot(p.x-localMotion.x,p.y-localMotion.y);if(error>300){localMotion.x=p.x;localMotion.y=p.y;}else{const blend=Math.min(1,dt*8);localMotion.x+=(authoritativeX-localMotion.x)*blend;localMotion.y+=(authoritativeY-localMotion.y)*blend;}
  }
  function frame(time){const dt=Math.max(0,Math.min((time-lastTime)/1000||0,.05));lastTime=time;fpsFrames++;if(time-fpsStart>=1000){fps=Math.round(fpsFrames*1000/(time-fpsStart));fpsFrames=0;fpsStart=time;}if(!document.hidden){updateMovement(dt,time);elapsed+=dt;if(!online&&!soloPaused){step(world,dt,HEROES.filter(h=>h.id!==chosen).map(h=>h.id));processEvents();}draw(dt);uiTimer+=dt;saveTimer+=dt;if(uiTimer>.15){updateUI();uiTimer=0;}if(saveTimer>3){save();saveTimer=0;}}requestAnimationFrame(frame);}
  $('heroPicker').innerHTML=PICKS.map(h=>'<button class="hero-pick" id="pick-'+h.id+'" aria-pressed="false"><canvas id="portrait-'+h.id+'" width="64" height="64" aria-hidden="true"></canvas><span class="pick-info"><strong>'+h.name+'</strong><span>'+h.hero+'</span><small id="status-'+h.id+'"></small><span class="pick-health"><i id="hp-'+h.id+'"></i></span></span><span class="pick-trait">'+h.icon+'</span></button>').join('');
  for(const h of PICKS)$('pick-'+h.id).addEventListener('click',()=>choose(h.id));
  $('startButton').addEventListener('click',()=>action('start'));
  $('attackButton').addEventListener('click',()=>action('attack'));
  canvas.addEventListener('contextmenu',event=>event.preventDefault());
  canvas.addEventListener('pointerdown',event=>{
    if(chosen==='host'||!world.started)return;event.preventDefault();canvas.focus({preventScroll:true});
    const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*W/bounds.width,y=(event.clientY-bounds.top)*H/bounds.height;
    const enemy=world.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-x,e.y-35-y)<(e.boss?110:65)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    if(event.button!==2&&enemy){action('target',{enemy:enemy.id});return;}
    action('move',{x,y});moveMarker={x,y,at:elapsed};
  });
  $('multiButton').addEventListener('click',()=>action('ability'));
  $('eulButton').addEventListener('click',()=>action('eul'));$('ultButton').addEventListener('click',()=>action('ultimate'));
  $('themeButton').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
  $('fullscreenButton').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else $('game-frame').requestFullscreen?.().catch(()=>toast('Полный экран недоступен в этом браузере'));});
  $('autoButton').addEventListener('click',()=>action('auto',{value:!me().auto}));
  $('soundButton').addEventListener('click',()=>{sound=!sound;tone(520,.1);save();updateUI();});
  $('pauseButton').addEventListener('click',togglePause);$('resumeButton').addEventListener('click',togglePause);
  for(const button of document.querySelectorAll('[data-upgrade]'))button.addEventListener('click',()=>action('upgrade',{upgrade:button.dataset.upgrade}));
  document.addEventListener('keydown',event=>{
    if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||document.querySelector('dialog[open]')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)){event.preventDefault();held.add(event.code);sendWalk();return;}
    if(event.code==='KeyE'){event.preventDefault();action('eul');}if(event.code==='KeyR'){event.preventDefault();action('ultimate');}
    if(event.code==='Space'&&document.activeElement?.tagName==='BUTTON')return;
    if(event.code==='Space'){event.preventDefault();action('attack');}
    if(event.code==='KeyQ'){event.preventDefault();action('ability');}if(event.code==='KeyP'){event.preventDefault();togglePause();}
  });
  document.addEventListener('keyup',event=>{if(held.delete(event.code)){event.preventDefault();sendWalk();}});
  window.addEventListener('blur',()=>{held.clear();sendWalk();});
  for(const button of document.querySelectorAll('[data-walk]')){
    const key=button.dataset.walk;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);held.add(key);sendWalk();});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{if(held.delete(key))sendWalk();});
  }
  $('helpButton').addEventListener('click',()=>{if(!online&&world.started&&!soloPaused)togglePause();$('helpDialog').showModal();});
  $('resetButton').addEventListener('click',()=>{if(online)return;if(world.started&&!soloPaused)togglePause();$('resetDialog').showModal();});
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('confirmReset').addEventListener('click',()=>{if(online)return;world=createWorld();soloWorld=world;soloPaused=false;lastEvent=0;particles=[];floating=[];effects.clear();motion.clear();$('resetDialog').close();save();updateUI();});
  $('createRoomButton').addEventListener('click',()=>connect(true));$('joinRoomButton').addEventListener('click',()=>connect(false));
  $('hostPanelButton').addEventListener('click',()=>{if(online?.host||!online&&chosen==='host')$('hostDialog').showModal();});
  document.querySelectorAll('[data-prank]').forEach(button=>button.addEventListener('click',()=>action('host',{prank:button.dataset.prank,target:$('prankTarget').value,other:$('prankOther').value})));
  for(const id of ['prankTarget','prankOther'])$(id).innerHTML=HEROES.map(h=>'<option value="'+h.id+'">'+h.name+' · '+h.hero+'</option>').join('');$('prankOther').value='sf';
  $('leaveRoomButton').addEventListener('click',()=>leaveRoom());
  $('copyRoomButton').addEventListener('click',async()=>{if(!online)return;if(['localhost','127.0.0.1'].includes(location.hostname)&&online.inviteBase===location.origin){toast('Запусти npm run online и дождись внешней ссылки в терминале.');return;}const url=(online.inviteBase||location.origin)+'/#room='+online.code;try{await navigator.clipboard.writeText(url);toast('Ссылка скопирована. Отправь друзьям!');}catch{$('shareLink').value=url;$('shareDialog').showModal();$('shareLink').select();}});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();if(document.hidden){held.clear();localMotion=null;lastWalk='0:0';if(chosen!=='host'&&world.started)action('walk',{dx:0,dy:0});save();}});window.addEventListener('pagehide',save);
  const invited=location.hash.match(/room=([A-F0-9]{6})/i);if(invited){$('roomCodeInput').value=invited[1].toUpperCase();$('roomHint').textContent='Тебя пригласили! Выбери свободного героя и нажми «Войти».';}
  setTheme(document.documentElement.dataset.theme||'dark');renderPortraits();updateUI();draw(0);requestAnimationFrame(frame);
  if(invited&&/^https?:$/.test(location.protocol)&&credentials())connect(false);
})();
