(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const W = 1100, H = 452, SAVE_KEY = 'oscar-farm-club-v1';
  const fresh = () => ({level:1,xp:0,gold:0,kills:0,wave:1,waveKills:0,damage:0,speed:0,wisdom:0,seconds:0,auto:true,started:false,sound:false});
  let state = fresh(), paused = false, lastTime = 0, elapsed = 0, spawnTimer = 0, autoTimer = 0, manualTimer = 0, multiCooldown = 0, shotPose = 0, saveTimer = 0;
  let enemies = [], arrows = [], particles = [], floating = [], audio = null, toastTimer;
  let saveAvailable = true;
  const number = n => Math.floor(n).toLocaleString('ru-RU');
  const requiredXP = () => Math.floor(100 * Math.pow(state.level, 1.32));
  const damage = () => 24 + state.damage * 12 + (state.level - 1) * 4;
  const attackSpeed = () => Math.min(15, 1 + state.speed * .15 + (state.level - 1) * .025);
  const cost = type => Math.ceil(({damage:60,speed:90,wisdom:120}[type]) * Math.pow(1.48,state[type]));
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved && typeof saved === 'object') {
      for (const key of Object.keys(state)) {
        if (typeof state[key] === 'boolean' && typeof saved[key] === 'boolean') state[key] = saved[key];
        if (typeof state[key] === 'number' && Number.isFinite(saved[key]) && saved[key] >= 0) state[key] = Math.floor(Math.min(saved[key], 1e12));
      }
      state.level = Math.max(1,state.level); state.wave = Math.max(1,state.wave);
      state.damage = Math.min(state.damage,1000); state.speed = Math.min(state.speed,1000); state.wisdom = Math.min(state.wisdom,1000);
      state.xp = Math.min(state.xp, requiredXP()-1);
    }
  } catch { /* A fresh game also works when storage is unavailable. */ }
  let returning = state.started, uiTimer = 0;
  state.started = false;

  function save() {
    try {localStorage.setItem(SAVE_KEY,JSON.stringify({...state,started:state.started || returning})); saveAvailable = true;}
    catch {saveAvailable = false;}
    $('saveStatus').textContent = saveAvailable ? 'Прогресс сохранён' : 'Сохранение недоступно';
  }
  function tone(frequency=440, duration=.06, type='sine', volume=.025) {
    if (!state.sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = type; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume,audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
      osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime+duration);
    } catch { /* Sound is optional. */ }
  }
  function toast(text) {
    $('levelToast').textContent = text; $('levelToast').classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('levelToast').classList.remove('visible'),2300);
  }
  function updateUI() {
    $('level').innerHTML = number(state.level)+'<span class="level-star">✳</span>';
    $('kills').textContent = number(state.kills);
    $('gold').innerHTML = number(state.gold)+'<span class="gold-unit">G</span>';
    $('xp').textContent = number(state.xp); $('xpNeeded').textContent = number(requiredXP());
    const percent = state.xp/requiredXP()*100;
    $('xpFill').style.width = percent+'%'; $('xpBar').setAttribute('aria-valuenow',String(Math.floor(percent)));
    $('wave').textContent = String(state.wave).padStart(2,'0');
    $('waveDescription').textContent = state.wave < 4 ? 'Лёгкая разминка' : state.wave < 10 ? 'Входим во вкус' : 'Фарм — это навсегда';
    $('damageStat').textContent = 'Урон: '+number(damage()); $('speedStat').textContent = 'Атака: '+attackSpeed().toFixed(1)+'/сек';
    $('sessionTime').textContent = String(Math.floor(state.seconds/60)).padStart(2,'0')+':'+String(Math.floor(state.seconds%60)).padStart(2,'0');
    $('heroStatus').textContent = !state.started ? 'Готов сидеть' : paused ? 'На перекуре' : state.auto ? 'Сидит. Качается.' : 'Ждёт твоего выстрела';
    $('sceneStatus').textContent = !state.started ? 'ОСКАР ЖДЁТ' : paused ? 'ПАУЗА' : state.auto ? 'АВТОФАРМ АКТИВЕН' : 'РУЧНОЙ ФАРМ';
    $('autoButton').setAttribute('aria-pressed',String(state.auto));
    $('soundButton').setAttribute('aria-pressed',String(state.sound));
    $('soundButton').setAttribute('aria-label',state.sound ? 'Выключить звук' : 'Включить звук');
    $('soundButton').title = state.sound ? 'Выключить звук' : 'Включить звук';
    $('soundButton').querySelector('use').setAttribute('href',state.sound ? '#sound' : '#mute');
    $('pauseButton').setAttribute('aria-pressed',String(paused));
    $('pauseButton').setAttribute('aria-label',paused ? 'Продолжить' : 'Пауза');
    $('pauseButton').title = paused ? 'Продолжить (P)' : 'Пауза (P)';
    $('pauseButton').querySelector('use').setAttribute('href',paused ? '#play' : '#pause');
    $('multiStatus').textContent = multiCooldown > 0 ? 'Готово через '+Math.ceil(multiCooldown)+' сек' : 'Пять ледяных стрел';
    $('multiButton').disabled = multiCooldown > 0 || paused;
    $('attackButton').disabled = paused;
    for (const type of ['damage','speed','wisdom']) {
      $(type+'Price').textContent = number(cost(type))+' G';
      $(type+'Rank').textContent = state[type] ? 'УР. '+state[type] : 'I';
      document.querySelector('[data-upgrade="'+type+'"]').disabled = state.gold < cost(type);
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
    rect(b,0,0,W,H,'#284f40');
    rect(b,270,0,580,250,'#466f55');
    for(let i=0;i<30;i++){const x=i*43-30;rect(b,x,0,10+rand()*20,240,'#365a47');rect(b,x+4,0,3,240,'#3e624b');}
    for(let i=0;i<22;i++)tree(b,i*61-40,70+rand()*55,.75,true);
    rect(b,0,233,W,219,'#456849');
    for(let i=0;i<800;i++){const y=230+rand()*222;rect(b,rand()*W,y,4+rand()*22,3+rand()*4,['#4b704c','#52754d','#3d6044','#5c7b50'][i%4]);}
    polygon(b,[[0,355],[172,319],[369,327],[560,307],[825,283],[1100,287],[1100,382],[805,371],[593,381],[390,410],[199,406],[0,427]],'#7e8257');
    polygon(b,[[0,379],[195,346],[375,348],[569,328],[824,307],[1100,310],[1100,357],[809,346],[588,360],[388,387],[194,384],[0,407]],'#979467');
    for(let i=0;i<190;i++){const x=rand()*W,y=340-(x/W)*25+rand()*35;rect(b,x,y,4+rand()*15,2+rand()*3,rand()>.45?'#a39b6c':'#84865b');}
    for(let i=0;i<10;i++)tree(b,i*125-15,172+rand()*32,.9+rand()*.25,i<2||i>7);
    // A luminous opening between the forest canopy and the lane.
    b.globalAlpha=.08;polygon(b,[[550,0],[610,0],[810,320],[635,320]],'#e3e5a0');polygon(b,[[685,0],[705,0],[1000,310],[925,310]],'#f8eab5');b.globalAlpha=1;
    stone(b,455,282,1);stone(b,720,278,.6);stone(b,962,407,.8);stone(b,88,345,1.1);
    for(let i=0;i<100;i++){const x=rand()*W,y=rand()>.5?270+rand()*35:395+rand()*57;grass(b,x,y,.5+rand()*.55,['#82985e','#617f4e','#91a46b','#345b3c'][i%4]);}
    // Stump / Oscar's permanent gaming chair.
    rect(b,235,337,54,35,'#5d5940');rect(b,240,342,6,29,'#7d7552');rect(b,262,344,4,30,'#393f31');rect(b,279,342,5,27,'#8a8054');
    polygon(b,[[229,334],[239,327],[282,327],[293,335],[286,344],[238,344]],'#b1a075');rect(b,241,332,37,5,'#807b50');rect(b,250,333,21,2,'#c2b183');
    // Little mushrooms and flowers.
    for(const [x,y] of [[160,372],[782,410],[55,412],[1030,285],[350,424]]){rect(b,x,y,3,9,'#c9c4a0');rect(b,x-4,y-4,11,5,'#c08d62');rect(b,x-2,y-7,7,3,'#d6a373');rect(b,x-2,y-4,2,2,'#f0d8a9');}
    for(let i=0;i<24;i++){const x=rand()*W,y=400+rand()*50;rect(b,x,y,3,3,i%3?'#bdc793':'#d8c58b');}
    // Foreground frames the clearing.
    tree(b,-10,239,1.7,true);tree(b,1122,225,1.65,true);
    for(let i=0;i<26;i++){const x=i*47-20;rect(b,x,435+rand()*14,30+rand()*30,25,'#254c35');grass(b,x+15,433+rand()*15,1.2,'#3d6341');}
    const vignette=b.createRadialGradient(550,250,130,550,250,650);vignette.addColorStop(0,'#12251b00');vignette.addColorStop(1,'#102b2566');b.fillStyle=vignette;b.fillRect(0,0,W,H);
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
  const portrait = $('portrait').getContext('2d'); portrait.imageSmoothingEnabled=false;
  rect(portrait,0,0,56,56,'#314e43');rect(portrait,3,3,50,50,'#274338');drow(portrait,9,-3,1.6,0,true);

  function creep(e) {
    const s=e.ranged?1.45:1.6,x=e.x,y=e.y,walk=Math.sin(e.step*7)*2;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    if(e.hit>0)ctx.globalAlpha=.6+.4*Math.sin(e.hit*60);
    const p=(a,v,w,h,col)=>rect(ctx,a*s,(v+walk)*s,w*s,h*s,col);
    ctx.fillStyle='#19372455';ctx.beginPath();ctx.ellipse(0,5,23,6,0,0,Math.PI*2);ctx.fill();
    const skin=e.ranged?'#9e9471':'#a79474', armor=e.ranged?'#54665a':'#9c5641';
    p(-8,-34,16,11,skin);p(-11,-32,5,6,skin);p(6,-32,7,5,skin);p(-7,-38,13,5,'#5b5143');p(-10,-38,4,7,'#c5ad83');p(5,-38,4,7,'#c5ad83');
    p(-8,-27,3,2,'#e9d8a5');p(2,-27,3,2,'#e9d8a5');p(-4,-23,8,3,'#5b5143');
    p(-10,-21,20,16,armor);p(-14,-20,8,8,'#b0805b');p(7,-20,8,8,'#b0805b');p(-7,-19,3,12,'#bca078');p(5,-18,3,11,'#794734');
    p(-9,-7,18,4,'#4b4335');p(-8,-3,6,9,'#675f46');p(2,-3,6,9,'#675f46');p(-11,4+(Math.sin(e.step*7)>0?1:-1),9,4,'#3c4436');p(2,4,9,4,'#3c4436');
    if(e.ranged){p(-18,-38,3,41,'#766a4e');p(-21,-42,9,8,'#bdc08a');p(-19,-41,5,5,'#d9dfaa');}
    else{p(-18,-17,4,21,'#645f49');p(-21,-18,10,5,'#8e9b8c');p(-19,-30,6,14,'#c0c6a7');p(-19,-31,3,10,'#dbe0c6');}
    ctx.restore();
    if(state.started){rect(ctx,e.x-20,e.y-73,40,4,'#203a29');rect(ctx,e.x-20,e.y-73,40*Math.max(0,e.hp/e.maxHP),4,e.ranged?'#b1b876':'#bf875c');}
  }
  function spawn(x) {
    if(enemies.length>=11)return;
    const ranged = Math.random()<.28;
    const hp=Math.floor((ranged?44:58)*(1+(state.wave-1)*.12));
    enemies.push({x:x??W+45,y:345+Math.random()*26,hp,maxHP:hp,ranged,speed:19+Math.random()*13,step:Math.random()*7,hit:0,id:Math.random()});
  }
  // Idle preview creeps are part of the scene until the first shot.
  spawn(817);spawn(930);spawn(1048);
  function shoot(special=false) {
    if(paused || !state.started || !enemies.length)return false;
    const sorted = enemies.filter(e=>e.hp>0).sort((a,b)=>a.x-b.x);
    if(!sorted.length)return false;
    const count = special?5:1;
    for(let i=0;i<count;i++){
      const target=sorted[i%sorted.length];
      arrows.push({x:304,y:294,target,damage:damage()*(special?1.25:1),delay:i*.075,trail:[]});
    }
    shotPose=.2;tone(special?950:620,.07,'triangle',.018);return true;
  }
  function manualAttack() {if(!state.started)start();if(manualTimer<=0&&!paused){shoot();manualTimer=.22;}}
  function multi() {if(!state.started)start();if(multiCooldown<=0&&!paused&&enemies.length){shoot(true);multiCooldown=12;updateUI();}}
  function kill(e) {
    if(e.dead)return;e.dead=true;
    state.kills++;state.waveKills++;
    const xp=Math.floor((e.ranged?32:24)*(1+state.wisdom*.2));
    const gold=(e.ranged?22:16)+Math.floor(Math.random()*7);
    state.xp+=xp;state.gold+=gold;
    floating.push({x:e.x,y:e.y-60,text:'+'+xp+' XP',color:'#e4efb1',life:1.5});
    floating.push({x:e.x+10,y:e.y-42,text:'+'+gold+' G',color:'#efd49a',life:1.5});
    for(let i=0;i<12;i++)particles.push({x:e.x,y:e.y-25,vx:(Math.random()-.5)*80,vy:-Math.random()*80,color:i%2?'#c5d18e':'#d4be7b',life:.5+Math.random()*.4});
    while(state.xp>=requiredXP()){
      state.xp-=requiredXP();state.level++;
      toast('✳ УРОВЕНЬ '+state.level+' — ОСКАР СТАЛ СИЛЬНЕЕ');
      tone(660,.15,'sine');setTimeout(()=>tone(880,.2,'sine'),120);
      for(let i=0;i<24;i++)particles.push({x:260,y:310,vx:(Math.random()-.5)*160,vy:-Math.random()*140-20,color:'#d9eda2',life:1.2});
    }
    if(state.waveKills>=8){state.wave++;state.waveKills=0;toast('ВОЛНА '+state.wave+' · СИДИМ ДАЛЬШЕ');}
    tone(320,.08,'sine');updateUI();save();
  }
  function update(dt) {
    state.seconds+=dt;spawnTimer-=dt;autoTimer-=dt;manualTimer-=dt;multiCooldown=Math.max(0,multiCooldown-dt);shotPose=Math.max(0,shotPose-dt);
    if(spawnTimer<=0){spawn();spawnTimer=Math.max(.65,2.7-state.wave*.065);}
    if(state.auto && autoTimer<=0){shoot();autoTimer=1/attackSpeed();}
    for(const e of enemies){e.step+=dt;e.hit=Math.max(0,e.hit-dt);if(e.x>395+(e.ranged?75:0)){e.x-=e.speed*dt;}else{e.step+=dt*.5;}}
    for(const a of arrows){
      if(a.delay>0){a.delay-=dt;continue;}
      if(a.target.dead){a.target=enemies.find(e=>!e.dead);if(!a.target){a.done=true;continue;}}
      const tx=a.target.x,ty=a.target.y-35,dx=tx-a.x,dy=ty-a.y,dist=Math.hypot(dx,dy),step=620*dt;
      a.trail.push({x:a.x,y:a.y});if(a.trail.length>4)a.trail.shift();
      if(dist<=step){a.target.hp-=a.damage;a.target.hit=.2;a.done=true;floating.push({x:tx,y:ty-28,text:String(Math.floor(a.damage)),color:'#eef9e1',life:.65});if(a.target.hp<=0)kill(a.target);}
      else {a.x+=dx/dist*step;a.y+=dy/dist*step;}
    }
    arrows=arrows.filter(a=>!a.done);enemies=enemies.filter(e=>!e.dead);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;p.life-=dt;}
    particles=particles.filter(p=>p.life>0);
    for(const f of floating){f.y-=22*dt;f.life-=dt;}floating=floating.filter(f=>f.life>0);
    saveTimer+=dt;if(saveTimer>=3){save();saveTimer=0;}
    uiTimer+=dt;if(uiTimer>=.15){updateUI();uiTimer=0;}
  }
  function draw() {
    ctx.imageSmoothingEnabled=false;ctx.drawImage(bg,0,0);
    // Ambient drifting motes, always gentle, even before starting.
    for(let i=0;i<19;i++){const x=(i*73+Math.sin(elapsed*.3+i)*28)%W,y=135+(i*39)%220+Math.sin(elapsed*.65+i)*12;ctx.globalAlpha=.25+Math.sin(elapsed*1.2+i)*.2;rect(ctx,x,y,2,2,'#e4e8a9');}ctx.globalAlpha=1;
    enemies.sort((a,b)=>a.y-b.y).forEach(creep);
    drow(ctx,235,235,2.05,shotPose);
    // Oscar's floating nameplate.
    rect(ctx,234,211,63,17,'#1b3329c0');ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle='#dcebbd';ctx.fillText('OSCAR',265,223);
    if(!state.started || paused){ctx.fillStyle='#c6d9ab';ctx.font='10px monospace';ctx.fillText('z',285+Math.sin(elapsed)*2,203-Math.sin(elapsed*.7)*5);ctx.font='7px monospace';ctx.fillText('z',295,191-Math.sin(elapsed*.7)*5);}
    for(const a of arrows){if(a.delay>0)continue;for(let i=0;i<a.trail.length;i++){ctx.globalAlpha=(i+1)/a.trail.length*.35;rect(ctx,a.trail[i].x-7,a.trail[i].y,15,2,'#bfeae8');}ctx.globalAlpha=1;rect(ctx,a.x-16,a.y,21,2,'#c8f3ed');polygon(ctx,[[a.x+8,a.y+1],[a.x+1,a.y-3],[a.x+1,a.y+5]],'#ebffff');}
    for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);rect(ctx,p.x,p.y,3,3,p.color);}ctx.globalAlpha=1;
    ctx.font='bold 12px monospace';ctx.textAlign='center';for(const f of floating){ctx.globalAlpha=Math.min(1,f.life*2);ctx.fillStyle='#203f2d';ctx.fillText(f.text,f.x+1,f.y+1);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;
  }
  function frame(time) {
    const dt=Math.min((time-lastTime)/1000||0,.05);lastTime=time;
    if(!paused&&!document.hidden){elapsed+=dt;if(state.started)update(dt);}
    draw();requestAnimationFrame(frame);
  }
  function start() {
    if(state.started)return;
    state.started=true;paused=false;spawnTimer=1.3;autoTimer=.3;
    $('startOverlay').hidden=true;$('pausedOverlay').hidden=true;updateUI();save();tone(440,.1,'triangle');
  }
  function togglePause() {
    if(!state.started)return;
    paused=!paused;$('pausedOverlay').hidden=!paused;updateUI();save();
  }
  $('startButton').addEventListener('click',start);
  if(returning){$('startButton').innerHTML='<svg><use href="#arrow"/></svg> ПРОДОЛЖИТЬ ФАРМ <span>↗</span>';$('startOverlay').querySelector('.start-hint').textContent='Твой пень на месте. Уровень '+number(state.level)+' ждёт.';}
  $('attackButton').addEventListener('click',manualAttack);canvas.addEventListener('pointerdown',manualAttack);
  $('multiButton').addEventListener('click',multi);
  $('autoButton').addEventListener('click',()=>{state.auto=!state.auto;autoTimer=0;updateUI();save();});
  $('soundButton').addEventListener('click',()=>{state.sound=!state.sound;tone(520,.12);updateUI();save();});
  $('pauseButton').addEventListener('click',togglePause);$('resumeButton').addEventListener('click',togglePause);
  document.querySelectorAll('[data-upgrade]').forEach(button=>button.addEventListener('click',()=>{
    const type=button.dataset.upgrade,price=cost(type);if(state.gold<price)return;
    state.gold-=price;state[type]++;tone(740,.11,'triangle');updateUI();save();
  }));
  document.addEventListener('keydown',event=>{
    if(event.repeat || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]'))return;
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(event.code==='Space' && document.activeElement?.tagName==='BUTTON')return;
    if(event.code==='Space'){event.preventDefault();manualAttack();}
    if(event.code==='KeyQ'){event.preventDefault();multi();}
    if(event.code==='KeyP'){event.preventDefault();togglePause();}
  });
  $('helpButton').addEventListener('click',()=>{if(state.started&&!paused)togglePause();$('helpDialog').showModal();});
  $('resetButton').addEventListener('click',()=>{if(state.started&&!paused)togglePause();$('resetDialog').showModal();});
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('confirmReset').addEventListener('click',()=>{
    state=fresh();returning=false;paused=false;elapsed=0;autoTimer=0;manualTimer=0;multiCooldown=0;spawnTimer=0;shotPose=0;saveTimer=0;
    enemies=[];arrows=[];particles=[];floating=[];clearTimeout(toastTimer);$('levelToast').classList.remove('visible');
    spawn(817);spawn(930);spawn(1048);$('startOverlay').hidden=false;$('pausedOverlay').hidden=true;
    $('startButton').innerHTML='<svg><use href="#arrow"/></svg> СЕСТЬ И КАЧАТЬСЯ <span>↗</span>';
    $('startOverlay').querySelector('.start-hint').textContent='Устраивайся поудобнее. Это надолго.';
    $('resetDialog').close();updateUI();save();
  });
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();if(document.hidden)save();});
  window.addEventListener('pagehide',save);
  updateUI();draw();requestAnimationFrame(frame);
})();
