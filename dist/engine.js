// The exact same rules run offline and on the authoritative multiplayer server.
export const HEROES = [
  {id:'drow',name:'Оскар',hero:'Drow Ranger',color:'#9cdce6',icon:'❄',skill:'Мультивыстрел',hint:'Пять ледяных стрел',cooldown:10,power:1,speed:1.15},
  {id:'timber',name:'Ержан',hero:'Timbersaw',color:'#efb76b',icon:'⚙',skill:'Вихрь пил',hint:'Пилы по восьми целям · броня',cooldown:9,power:1.25,speed:.85},
  {id:'sf',name:'Артур',hero:'Shadow Fiend',color:'#ee8872',icon:'♨',skill:'Shadowraze',hint:'Взрыв по шести целям · души',cooldown:11,power:1.2,speed:1},
  {id:'rubick',name:'Санжар',hero:'Rubick',color:'#b9ed86',icon:'✧',skill:'Fade Bolt',hint:'Цепная молния · шесть целей',cooldown:8,power:.95,speed:1.1},
  {id:'sniper',name:'Эмир',hero:'Sniper',color:'#e9cc85',icon:'⌖',skill:'Украсть фраг',hint:'Только добивание героя при ≤30% HP',cooldown:12,power:1,speed:.9}
];
export const ENEMY_HEROES=[
  {id:'axe',name:'Axe',color:'#d7886b',skill:'Berserker’s Call',description:'Провокация и броня',cooldown:7},
  {id:'lina',name:'Lina',color:'#f0a46a',skill:'Laguna Blade',description:'Мощный удар молнией',cooldown:8},
  {id:'cm',name:'Crystal Maiden',color:'#a9dbed',skill:'Frostbite',description:'Замораживает одного героя',cooldown:7},
  {id:'pudge',name:'Pudge',color:'#b4b47f',skill:'Dismember',description:'Оглушение и вампиризм',cooldown:8},
  {id:'pa',name:'Phantom Assassin',color:'#83b9b4',skill:'Coup de Grace',description:'Критический удар и уклонение',cooldown:6},
  {id:'tide',name:'Tidehunter',color:'#8bb687',skill:'Ravage',description:'Оглушает весь отряд',cooldown:10},
  {id:'sven',name:'Sven',color:'#8ba6d0',skill:'God’s Strength',description:'Двойной урон на 4 секунды',cooldown:8},
  {id:'lion',name:'Lion',color:'#c5a0d0',skill:'Hex',description:'Превращает цель в лягушку',cooldown:8},
  {id:'wd',name:'Witch Doctor',color:'#c4abd3',skill:'Voodoo Restoration',description:'Лечит вражескую команду',cooldown:7},
  {id:'invoker',name:'Invoker',color:'#e9c8ee',skill:'Sun Strike',description:'Урон по всем с задержкой',cooldown:9},
  {id:'jugger',name:'Juggernaut',color:'#dfb4a0',skill:'Blade Fury',description:'Массовый урон и сопротивление',cooldown:8},
  {id:'dazzle',name:'Dazzle',color:'#d7a1d8',skill:'Shallow Grave',description:'Спасает самого слабого союзника',cooldown:9}
];
export const ROSHAN={id:'roshan',name:'Рошан',color:'#ba8060',skill:'Bash · Thunder Clap',description:'Броня · регенерация · ярость при 35% HP'};
export const heroInfo = id => HEROES.find(h=>h.id===id) || HEROES[0];
export const ARENA={width:1800,height:1000,minX:65,maxX:1735,minY:150,maxY:920};
export const SEATS=[{x:350,y:420},{x:460,y:560},{x:330,y:670},{x:490,y:760},{x:230,y:550}];
export const NEUTRALS=[
  {id:'satyr',name:'Сатир-мучитель',skill:'Shockwave',hint:'Волна по линии — уйди в сторону',cooldown:8,mana:45,hp:1.8,color:'#bb817c'},
  {id:'mindstealer',name:'Сатир-душекрад',skill:'Mana Burn',hint:'Выжигает ману в отмеченной области',cooldown:10,mana:50,hp:1.25,color:'#7792c3'},
  {id:'banisher',name:'Сатир-изгонятель',skill:'Purge',hint:'Снимает ускорение и замедляет',cooldown:9,mana:35,hp:1.15,color:'#a5a07d'},
  {id:'centaur',name:'Кентавр-завоеватель',skill:'War Stomp',hint:'Оглушение вокруг кентавра',cooldown:10,mana:50,hp:2.3,color:'#b99169'},
  {id:'hellbear',name:'Медведь-крушитель',skill:'Thunder Clap',hint:'Урон и замедление вокруг медведя',cooldown:9,mana:45,hp:2,color:'#b16e4f'}
];
export const manaCost=p=>({drow:75,timber:85,sf:95,rubick:90,sniper:100}[p.skill]);
export const maxMana=p=>(p.id==='rubick'?460:360)+(p.level-1)*22;
export const manaRegen=p=>3+maxMana(p)*.012;
export const moveSpeed=p=>(p.id==='timber'?205:245)*(p.slow>0?.55:1)*(p.haste>0?1.25:1);
export const attackRange=p=>({drow:620,timber:400,sf:560,rubick:580,sniper:1000}[p.id]);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const playerPoints=w=>Object.values(w.players).filter(p=>p.respawn<=0).map(p=>({x:p.x,y:p.y-30}));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const requiredXP = p => Math.floor(100*Math.pow(p.level,1.25));
export const damage = p => Math.floor((28+p.damage*14+(p.level-1)*7)*heroInfo(p.id).power*(p.id==='sf'?1+Math.min(p.kills,200)*.012:1));
export const attackSpeed = p => Math.min(12,(1+p.speed*.15+(p.level-1)*.025)*heroInfo(p.id).speed*(p.haste>0?1.8:1));
export const upgradeCost = (p,type) => Math.ceil(({damage:60,speed:90,wisdom:120}[type]??Infinity)*Math.pow(1.38,p[type]||0));
export const maxHP = p => (p.id==='timber'?650:450)+(p.level-1)*75;
export const waveRules = wave => ({count:8+wave*3,interval:Math.max(.16,1.3*Math.pow(.93,wave-1)),hp:Math.floor((62+wave*17)*(1+wave*.045)*4.2),speed:Math.min(290,51+wave*7),damage:Math.floor((7+wave*2.4)*1.3),teamfight:wave%3===0&&wave!==30,boss:wave===30});
// Include multi-hit Q damage: late-game SF souls must not erase an entire fight on arrival.
function partyDPS(w){return HEROES.filter(h=>h.id!=='sniper').reduce((sum,h)=>{const p=w.players[h.id],burst={drow:6.5,timber:20.8,sf:20.4,rubick:15.1,sniper:0}[p.skill];return sum+damage(p)*(attackSpeed(p)+burst/heroInfo(p.skill).cooldown);},0);}

export function createWorld() {
  const world={version:2,started:false,wave:1,phase:'farm',seconds:0,kills:0,heroKills:0,bossKills:0,wins:0,losses:0,fightTime:0,pendingStrike:0,seed:Math.floor(Math.random()*2147483646)+1,enemyTeam:[],spawned:0,spawnTimer:.2,breakTime:0,nextId:1,eventId:0,events:[],enemies:[],projectiles:[],hazards:[],players:{}};
  for(const [index,h] of HEROES.entries()){const p={x:SEATS[index].x,y:SEATS[index].y,moveX:SEATS[index].x,moveY:SEATS[index].y,walkX:0,walkY:0,walkUntil:0,moving:false,mana:0,eulCooldown:0,ultCooldown:0,channel:0,slow:0,target:0,id:h.id,skill:h.id,level:1,xp:0,gold:0,kills:0,heroKills:0,damage:0,speed:0,wisdom:0,auto:true,paused:false,hp:0,respawn:0,stun:0,hex:0,haste:0,attackTimer:0,manualTimer:0,cooldown:0,pose:0};p.hp=maxHP(p);p.mana=maxMana(p);world.players[h.id]=p;}
  return world;
}
export function emit(w,type,data={}) {w.events.push({id:++w.eventId,type,...data});if(w.events.length>60)w.events.splice(0,w.events.length-60);}
export function spawnEnemy(w) {
  const rules=waveRules(w.wave),ranged=w.spawned%6===1;
  const slot=w.spawned%7,neutral=slot>=2?NEUTRALS[(slot-2)%NEUTRALS.length]:null;
  const hp=Math.floor(rules.hp*(neutral?.hp??(ranged?.85:1)));
  const enemy={id:w.nextId++,x:1650+(w.spawned%3)*25,y:210+(w.spawned*131)%660,hp,maxHP:hp,hero:false,ranged,neutral:neutral?.id,name:neutral?.name,color:neutral?.color,speed:rules.speed,damage:rules.damage*(neutral?1.3:1),attackTimer:1+(w.nextId%5)*.17,abilityTimer:2+(w.spawned%3),mana:neutral?180:0,maxMana:neutral?180:0,step:0,hit:0,cyclone:0,fear:0,slow:0};
  w.enemies.push(enemy);return enemy;
}
export function allowedTarget(p,e,ability=false) {
  if(e.hp<=0||e.cyclone>0)return false;
  if(e.boss&&(p.id==='sniper'||(ability&&p.skill==='sniper')))return e.hp/e.maxHP<=(ability?.08:.04);
  return !(p.id==='sniper'||(ability&&p.skill==='sniper')) || (e.hero && e.hp/e.maxHP <= (ability?.30:.18) && !e.grave);
}
function targets(w,p,ability=false) {return w.enemies.filter(e=>allowedTarget(p,e,ability)&&distance(p,e)<=attackRange(p)+(ability?100:0)).sort((a,b)=>(a.id===p.target?-1:b.id===p.target?1:p.id==='sniper'?a.hp-b.hp:distance(p,a)-distance(p,b)));}
function fire(w,p,ability=false,inputSeq) {
  if(!w.started||w.breakTime>0||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return {ok:false,message:'Герой отдыхает или оглушён'};
  if(ability&&p.mana<manaCost(p))return {ok:false,message:"Не хватает маны"};
  const available=targets(w,p,ability);
    if(!available.length)return {ok:false,message:p.id==='sniper'?(w.phase==='boss'?'Рошан защищён от добивания: нужно ≤'+(ability?8:4)+'% HP':'Эмир ждёт: у вражеского героя должно остаться не больше '+(ability?30:18)+'% HP'):'Целей пока нет'};
  let count=1,multiplier=1;const skill=ability?p.skill:p.id;
  if(ability){count={drow:5,timber:8,sf:6,rubick:6,sniper:1}[skill];multiplier={drow:1.3,timber:2.6,sf:3.4,rubick:3,sniper:1}[skill];}
  const seat={x:p.x-30,y:p.y+15};
  const points=[];
  for(let i=0;i<count;i++){
    const e=available[i%available.length];
    const ground=ability&&(skill==='sf'||skill==='rubick');
    w.projectiles.push({id:w.nextId++,hero:p.id,skill,ability,target:e.id,x:ground?e.x:seat.x+50,y:ground?e.y-35:seat.y-60,damage:damage(p)*multiplier*(skill==='rubick'?Math.pow(.93,i):1),delay:i*.06+(ground?.12:0),execute:p.id==='sniper'||(ability&&skill==='sniper'),threshold:ability?.30:.18});
    if(!points.some(point=>point.id===e.id))points.push({id:e.id,x:e.x,y:e.y-15});
  }
  if(ability){p.mana-=manaCost(p);p.cooldown=heroInfo(p.skill).cooldown;}
  p.pose=.3;emit(w,'shot',{hero:p.id,skill,ability,inputSeq,x:seat.x+50,y:seat.y-60,points});return {ok:true};
}
export function command(w,id,action) {
  const p=w.players[id];if(!p||!action||typeof action!=='object')return {ok:false,message:'Неизвестный герой'};
  if(action.type==='start'){w.started=true;return {ok:true};}
  if(action.type==='auto'){p.auto=typeof action.value==='boolean'?action.value:!p.auto;return {ok:true};}
  if(action.type==='pause'){p.paused=!!action.value;return {ok:true};}
  if(action.type==='move'||action.type==='walk'){
    if(!w.started||p.paused||p.respawn>0)return {ok:false,message:'Герой пока не может идти'};
    if(action.type==='walk'){
      if(!Number.isFinite(action.dx)||!Number.isFinite(action.dy))return {ok:false,message:'Некорректное направление'};
      const len=Math.max(1,Math.hypot(action.dx,action.dy));p.walkX=action.dx/len;p.walkY=action.dy/len;p.walkUntil=w.seconds+.4;
      p.moveX=p.x;p.moveY=p.y;
    }else{
      if(!Number.isFinite(action.x)||!Number.isFinite(action.y))return {ok:false,message:'Некорректная точка'};
      p.moveX=clamp(action.x,ARENA.minX,ARENA.maxX);p.moveY=clamp(action.y,ARENA.minY,ARENA.maxY);p.walkUntil=0;
    }
    return {ok:true};
  }
  if(action.type==='target'){
    const enemy=w.enemies.find(e=>e.id===action.enemy&&e.hp>0);if(!enemy)return {ok:false,message:'Цель исчезла'};
    p.target=enemy.id;return {ok:true};
  }
  if(action.type==='eul'||action.type==='ultimate')return sfSpell(w,p,action);
  if(action.type==='upgrade'){
    if(!['damage','speed','wisdom'].includes(action.upgrade))return {ok:false,message:'Нет такого улучшения'};
    const cost=upgradeCost(p,action.upgrade);if(p.gold<cost)return {ok:false,message:'Не хватает золота'};
    p.gold-=cost;p[action.upgrade]++;return {ok:true};
  }
  if(action.type==='attack'){
    if(p.manualTimer>0)return {ok:false,message:'Перезарядка выстрела'};
    const result=fire(w,p,false,action.seq);if(result.ok)p.manualTimer=.25;return result;
  }
  if(action.type==='ability'){
    if(p.cooldown>0)return {ok:false,message:'Способность перезаряжается'};
    return fire(w,p,true,action.seq);
  }
  return {ok:false,message:'Неизвестная команда'};
}
function sfSpell(w,p,action){
  if(p.id!=='sf')return {ok:false,message:'Eul и Requiem доступны Артуру'};
  if(!w.started||w.breakTime>0||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return {ok:false,message:'Сейчас нельзя применить способность'};
  const eul=action.type==='eul',cost=eul?75:175,key=eul?'eulCooldown':'ultCooldown';
  if(p[key]>0)return {ok:false,message:'Способность перезаряжается'};
  if(p.mana<cost)return {ok:false,message:'Не хватает маны'};
  if(eul){
    const target=targets(w,p).find(e=>!e.boss);if(!target)return {ok:false,message:'Для Eul нужна цель в радиусе 560; Рошан невосприимчив'};
    target.cyclone=2.5;p.comboTarget=target.id;emit(w,'eul',{hero:p.id,enemy:target.id,x:target.x,y:target.y});
  }else{
    const combo=w.enemies.find(e=>e.id===p.comboTarget&&distance(p,e)<=400);
    p.channel=Math.max(1.67,(combo?.cyclone||0)+.08);p.moveX=p.x;p.moveY=p.y;p.walkUntil=0;
    emit(w,'requiemCharge',{hero:p.id,x:p.x,y:p.y,duration:p.channel});
  }
  p.mana-=cost;p[key]=eul?23:65;return {ok:true};
}
function releaseRequiem(w,p){
  const points=[];
  for(const e of w.enemies){
    const d=distance(p,e);if(d>400||e.hp<=0||e.cyclone>0)continue;
    hit(w,{hero:p.id,skill:'sf',ability:true,damage:damage(p)*(5+Math.min(p.kills,100)*.035)*(1+2*(1-d/400))},e);
    if(e.hp>0&&!e.boss)e.fear=2;
    points.push({x:e.x,y:e.y-25});
  }
  emit(w,'requiem',{hero:p.id,x:p.x,y:p.y-25,radius:400,points});
}
function movePlayer(w,p,dt){
  p.moving=false;if(p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return;
  let dx=p.moveX-p.x,dy=p.moveY-p.y;
  if(w.seconds<p.walkUntil){dx=p.walkX*1000;dy=p.walkY*1000;}
  const len=Math.hypot(dx,dy),amount=Math.min(len,moveSpeed(p)*dt);
  if(len>1){p.x=clamp(p.x+dx/len*amount,ARENA.minX,ARENA.maxX);p.y=clamp(p.y+dy/len*amount,ARENA.minY,ARENA.maxY);p.moving=true;}
  if(w.seconds<p.walkUntil){p.moveX=p.x;p.moveY=p.y;}
}
function botMove(w,p){
  const available=w.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(p,a)-distance(p,b)),foe=available[0];
  if(!foe)return;
  const d=distance(p,foe),range=attackRange(p)*.78;
  if(d>range){p.moveX=clamp(foe.x-range*.8,ARENA.minX,ARENA.maxX);p.moveY=clamp(foe.y+(HEROES.findIndex(h=>h.id===p.id)-2)*65,ARENA.minY,ARENA.maxY);}
  else{p.moveX=p.x;p.moveY=p.y;}
  const danger=w.hazards.find(h=>Math.hypot(p.x-h.x,p.y-h.y)<h.radius+45);
  if(danger){p.moveY=clamp(p.y+(p.y<danger.y?-1:1)*(danger.radius+100),ARENA.minY,ARENA.maxY);}
}
function reward(w,e,killer) {
  if(e.boss)w.bossKills++;else if(e.hero)w.heroKills++;else w.kills++;
  const last=w.players[killer];if(e.hero)last.heroKills++;else if(!e.boss)last.kills++;
  for(const p of Object.values(w.players)){
    const xp=Math.floor((e.boss?1800:e.hero?110:e.ranged?27:21)*(1+p.wisdom*.2));
    p.xp+=xp;p.gold+=(e.boss?1500:e.hero?80:14)+Math.floor(w.wave*.6)+(p.id===killer?(e.boss?500:e.hero?130:7):0);
    while(p.xp>=requiredXP(p)){p.xp-=requiredXP(p);p.level++;p.hp=Math.min(maxHP(p),p.hp+110);emit(w,'level',{hero:p.id,level:p.level});}
  }
  emit(w,e.boss?'bossKill':e.hero?'heroKill':'kill',{hero:killer,enemy:e.id,name:e.heroName,x:e.x,y:e.y,gold:e.boss?2000:e.hero?210:21});
}
export function hit(w,shot,e) {
  const p=w.players[shot.hero];if(!p||!e||e.hp<=0||e.cyclone>0)return;
  if(p.id==='sniper'||shot.execute){
    // Enforced at impact too: no ability, retarget or stale projectile can kill a creep.
    if(e.boss){if(e.hp/e.maxHP>(shot.threshold>.18?.08:.04))return;}
    else if(!e.hero||e.hp/e.maxHP>shot.threshold||e.grave>0)return;
    e.hp=0;
  } else {
    // Axe forces attacks into himself; PA evades, Juggernaut resists, Dazzle prevents death.
    if(e.hero&&e.kit==='pa'&&random(w)<.2)return;
    const taunter=w.enemies.find(other=>other.hero&&other.kit==='axe'&&other.armor>0&&other.hp>0&&!(other.cyclone>0));
    if(taunter&&taunter.id!==e.id)e=taunter;
    const amount=shot.damage*(e.resistance??1)*(e.spin>0?.35:e.armor>0?.45:1);
    e.hp=Math.max(e.grave>0?1:0,e.hp-amount);
  }
  e.hit=.18;
  emit(w,'impact',{hero:p.id,skill:shot.skill||p.id,ability:!!shot.ability,x:e.x,y:e.y-28});
  if(e.hp===0)reward(w,e,p.id);
}
function hurt(w,p,amount) {
  if(p.respawn>0)return;
  p.hp=Math.max(0,p.hp-amount*(p.id==='timber'?.5:1));
  if(p.hp<=0){p.respawn=8;p.pose=0;emit(w,'down',{hero:p.id});}
}
function random(w){w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;}
export function startTeamfight(w){
  const rules=waveRules(w.wave),pool=[...ENEMY_HEROES],dps=partyDPS(w);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random(w)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  w.phase='teamfight';w.fightTime=0;w.enemies=[];w.projectiles=[];w.hazards=[];w.enemyTeam=pool.slice(0,5).map(h=>h.id);
  for(const [i,h] of pool.slice(0,5).entries()){
    const hp=Math.floor(Math.max(rules.hp*8,dps*4.8)*(h.id==='axe'?1.3:1));
    w.enemies.push({id:w.nextId++,hero:true,kit:h.id,heroName:h.name,color:h.color,x:1390+(i%2)*170,y:260+i*135,hp,maxHP:hp,resistance:.72,mana:420,maxMana:420,cyclone:0,fear:0,slow:0,speed:Math.min(225,rules.speed+35),damage:rules.damage*1.45,attackTimer:.7+i*.12,abilityTimer:.8+i*.35,step:0,hit:0,armor:0,spin:0,buff:0,grave:0});
  }
  for(const p of Object.values(w.players)){p.hp=maxHP(p);p.mana=maxMana(p);p.respawn=0;p.stun=0;p.hex=0;p.slow=0;p.channel=0;p.cooldown=Math.min(2,p.cooldown);}
  emit(w,'fightStart',{team:w.enemyTeam});
}
export function startRoshan(w){
  const hp=Math.floor(Math.max(60000,partyDPS(w)*32));
  w.phase='boss';w.fightTime=0;w.pendingStrike=0;w.enemyTeam=['roshan'];w.projectiles=[];w.hazards=[];
  w.enemies=[{id:w.nextId++,boss:true,hero:false,kit:'roshan',heroName:ROSHAN.name,color:ROSHAN.color,x:1390,y:560,hp,maxHP:hp,resistance:.65,mana:900,maxMana:900,cyclone:0,fear:0,slow:0,speed:135,damage:Math.max(170,Object.values(w.players).reduce((sum,p)=>sum+maxHP(p),0)/5*.07),attackTimer:1,abilityTimer:4,clapTimer:8,enraged:false,step:0,hit:0}];
  for(const p of Object.values(w.players)){p.hp=maxHP(p);p.mana=maxMana(p);p.respawn=0;p.stun=0;p.hex=0;p.slow=0;p.channel=0;p.cooldown=0;}
  emit(w,'bossStart');
}
function finishRoshan(w,won){
  for(const p of Object.values(w.players)){p.hp=maxHP(p);p.mana=maxMana(p);p.respawn=0;p.stun=0;p.hex=0;p.slow=0;p.channel=0;if(!won)p.gold=Math.floor(p.gold*.9);}
  if(won)nextWave(w,true);
  else{startRoshan(w);w.breakTime=5;}
  emit(w,'bossEnd',{won});
}
function roshanStep(w,e,dt){
  if(!e.enraged&&e.hp<=e.maxHP*.35){e.enraged=true;emit(w,'bossEnrage');}
  e.hp=Math.min(e.maxHP,e.hp+e.maxHP*.0015*dt);
  const living=Object.values(w.players).filter(p=>p.respawn<=0);
  if(!living.length)return;
  e.abilityTimer-=dt;e.clapTimer-=dt;
  if(e.abilityTimer<=0&&e.mana>=45&&living.some(p=>distance(p,e)<340)){
    e.mana-=45;const target=living.filter(p=>distance(p,e)<340).sort((a,b)=>damage(b)*attackSpeed(b)-damage(a)*attackSpeed(a))[0];
    hurt(w,target,e.damage*(e.enraged?3.8:2.8));target.stun=Math.max(target.stun,1.8);e.abilityTimer=e.enraged?3.5:5;
    const seat={x:target.x-23,y:target.y+40};
    emit(w,'bossAbility',{kit:'roshan',skill:'Bash',x:e.x,y:e.y-80,points:[{x:seat.x+23,y:seat.y-40}]});
  }
  if(e.clapTimer<=0&&e.mana>=80){
    e.mana-=80;for(const p of living.filter(p=>distance(p,e)<360)){hurt(w,p,e.damage*(e.enraged?2.3:1.6));p.stun=Math.max(p.stun,.7);}
    e.clapTimer=e.enraged?6:9;
    emit(w,'bossAbility',{kit:'roshan',skill:'Thunder Clap',x:e.x,y:e.y-30,points:playerPoints(w)});
  }
}
function nextWave(w,won){
  if(w.phase==='teamfight'){
    if(won)w.wins++;else{w.losses++;for(const p of Object.values(w.players))p.gold=Math.floor(p.gold*.9);}
    emit(w,'fightEnd',{won});
    for(const p of Object.values(w.players)){p.hp=maxHP(p);p.mana=maxMana(p);p.respawn=0;p.stun=0;p.hex=0;p.slow=0;p.channel=0;}
  }
  w.phase='farm';w.wave++;w.spawned=0;w.spawnTimer=.1;w.breakTime=2;w.enemies=[];w.projectiles=[];w.hazards=[];w.pendingStrike=0;emit(w,'wave',{wave:w.wave});
}
export function enemyAbility(w,e){
  const living=Object.values(w.players).filter(p=>p.respawn<=0&&distance(p,e)<700);if(!living.length||e.mana<50)return false;e.mana-=50;
  const target=living[Math.floor(random(w)*living.length)],power=e.damage;
  switch(e.kit){
    case 'axe':e.armor=3;for(const p of living)hurt(w,p,power*.8);break;
    case 'lina':hurt(w,target,power*6);break;
    case 'cm':target.stun=Math.max(target.stun,2.4);hurt(w,target,power*1.7);break;
    case 'pudge':target.stun=Math.max(target.stun,1.8);hurt(w,target,power*2.5);e.hp=Math.min(e.maxHP,e.hp+e.maxHP*.12);break;
    case 'pa':hurt(w,target,power*4.5);break;
    case 'tide':for(const p of living.filter(p=>distance(p,e)<500)){hurt(w,p,power*1.5);p.stun=Math.max(p.stun,1.6);}break;
    case 'sven':e.buff=4;break;
    case 'lion':target.hex=3;break;
    case 'wd':for(const foe of w.enemies)if(foe.hp>0)foe.hp=Math.min(foe.maxHP,foe.hp+foe.maxHP*.10);break;
    case 'invoker':for(const p of living)addHazard(w,e,{x:p.x,y:p.y,radius:105,delay:1.5,damage:power*3.8,kind:'sun'});break;
    case 'jugger':e.spin=3;for(const p of living.filter(p=>distance(p,e)<260))hurt(w,p,power*1.8);break;
    case 'dazzle':{const low=w.enemies.filter(foe=>foe.hp>0).sort((a,b)=>a.hp/a.maxHP-b.hp/b.maxHP)[0];if(low)low.grave=3;break;}
  }
  const seat={x:target.x-23,y:target.y+40};
  const points=['tide','invoker','jugger'].includes(e.kit)?playerPoints(w):e.kit==='wd'?w.enemies.map(foe=>({x:foe.x,y:foe.y-35})):e.kit==='dazzle'?w.enemies.filter(foe=>foe.grave>0).map(foe=>({x:foe.x,y:foe.y-40})):[{x:seat.x+23,y:seat.y-45}];
  emit(w,'enemyAbility',{enemy:e.id,kit:e.kit,skill:ENEMY_HEROES.find(h=>h.id===e.kit).skill,target:target.id,x:e.x,y:e.y-45,points});return true;
}
function addHazard(w,e,data){
  if(w.hazards.length>=35)return;
  const h={id:w.nextId++,owner:e.id,...data};w.hazards.push(h);
  emit(w,'danger',{kind:h.kind,x:h.x,y:h.y,radius:h.radius,delay:h.delay});
}
export function neutralAbility(w,e){
  const kit=NEUTRALS.find(h=>h.id===e.neutral),living=Object.values(w.players).filter(p=>p.respawn<=0&&distance(p,e)<650).sort((a,b)=>distance(a,e)-distance(b,e));
  if(!kit||!living.length||e.mana<kit.mana)return false;
  const target=living[0];
  if((e.neutral==='centaur'||e.neutral==='hellbear')&&distance(target,e)>220)return false;
  e.mana-=kit.mana;e.abilityTimer=kit.cooldown;
  if(e.neutral==='satyr'){
    const d=Math.max(1,distance(e,target));addHazard(w,e,{x:target.x,y:target.y,fromX:e.x,fromY:e.y,toX:e.x+(target.x-e.x)/d*750,toY:e.y+(target.y-e.y)/d*750,radius:55,delay:1,damage:e.damage*3.5,kind:'shockwave'});
  }else if(e.neutral==='mindstealer')addHazard(w,e,{x:target.x,y:target.y,radius:100,delay:.9,damage:e.damage*1.5,manaBurn:85,kind:'manaBurn'});
  else if(e.neutral==='banisher'){target.haste=0;target.slow=3.5;emit(w,'neutralSpell',{kit:e.neutral,skill:kit.skill,x:e.x,y:e.y,points:[{x:target.x,y:target.y-30}]});}
  else addHazard(w,e,{x:e.x,y:e.y,radius:e.neutral==='centaur'?185:215,delay:1,damage:e.damage*2.6,stun:e.neutral==='centaur'?1.5:0,slow:e.neutral==='hellbear'?3:0,kind:e.neutral==='centaur'?'stomp':'clap'});
  return true;
}
function resolveHazards(w,dt){
  for(const h of w.hazards){
    h.delay-=dt;if(h.delay>0)continue;
    for(const p of Object.values(w.players)){
      if(p.respawn>0)continue;
      let d=Math.hypot(p.x-h.x,p.y-h.y);
      if(h.kind==='shockwave'){
        const dx=h.toX-h.fromX,dy=h.toY-h.fromY,t=clamp(((p.x-h.fromX)*dx+(p.y-h.fromY)*dy)/(dx*dx+dy*dy),0,1);
        d=Math.hypot(p.x-h.fromX-dx*t,p.y-h.fromY-dy*t);
      }
      if(d>h.radius)continue;
      hurt(w,p,h.damage);p.stun=Math.max(p.stun,h.stun||0);p.slow=Math.max(p.slow,h.slow||0);p.mana=Math.max(0,p.mana-(h.manaBurn||0));
    }
    emit(w,'hazardHit',{kind:h.kind,x:h.x,y:h.y,fromX:h.fromX,fromY:h.fromY,toX:h.toX,toY:h.toY,radius:h.radius});
  }
  w.hazards=w.hazards.filter(h=>h.delay>0);
}
export function hostCommand(w,action){
  const target=w.players[action.target];
  switch(action.prank){
    case 'swapSkills':{
      const other=w.players[action.other];if(!target||!other||target===other)return {ok:false,message:'Выбери двух разных героев'};
      [target.skill,other.skill]=[other.skill,target.skill];target.cooldown=Math.min(3,target.cooldown);other.cooldown=Math.min(3,other.cooldown);
      emit(w,'prank',{message:'Кто-то перепутал способности '+heroInfo(target.id).name+' и '+heroInfo(other.id).name+'!'});break;
    }
    case 'shuffle':{
      const pool=HEROES.map(h=>h.id);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random(w)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      HEROES.forEach((h,i)=>{w.players[h.id].skill=pool[i];w.players[h.id].cooldown=Math.min(3,w.players[h.id].cooldown);});emit(w,'prank',{message:'Способности перемешались. Проверяйте Q!'});break;
    }
    case 'resetSkills':for(const p of Object.values(w.players))p.skill=p.id;emit(w,'prank',{message:'Способности вернулись к владельцам.'});break;
    case 'goldRain':for(const p of Object.values(w.players))p.gold+=300;emit(w,'prank',{message:'Золотой дождь! Всем +300 G.'});break;
    case 'bonk':if(!target)return {ok:false,message:'Выбери героя'};target.stun=2;emit(w,'prank',{message:heroInfo(target.id).name+' задумался на 2 секунды.'});break;
    case 'haste':for(const p of Object.values(w.players))p.haste=10;emit(w,'prank',{message:'Кофе для всех! Скорость атаки ×1.8 на 10 секунд.'});break;
    case 'bigHeads':w.bigHeadsUntil=w.seconds+15;emit(w,'prank',{message:'Мысли стали слишком большими. На 15 секунд.'});break;
    default:return {ok:false,message:'Нет такой шутки'};
  }
  return {ok:true};
}
export function step(w,dt,bots=[]) {
  if(!w.started)return;
  dt=Math.max(0,Math.min(.1,dt));w.seconds+=dt;
  const rules=waveRules(w.wave);
  for(const p of Object.values(w.players)){
    for(const key of ['eulCooldown','ultCooldown','slow'])p[key]=Math.max(0,p[key]-dt);
    p.mana=Math.min(maxMana(p),p.mana+manaRegen(p)*dt);
    if(p.channel>0){if(p.stun>0||p.hex>0||p.respawn>0){p.channel=0;emit(w,'channelCancel',{hero:p.id});}else{p.channel=Math.max(0,p.channel-dt);if(p.channel===0)releaseRequiem(w,p);}}
    p.cooldown=Math.max(0,p.cooldown-dt);p.attackTimer-=dt;p.manualTimer=Math.max(0,p.manualTimer-dt);p.pose=Math.max(0,p.pose-dt);p.stun=Math.max(0,p.stun-dt);p.hex=Math.max(0,p.hex-dt);p.haste=Math.max(0,p.haste-dt);
    if(p.respawn>0){
      p.respawn=Math.max(0,p.respawn-dt);
      if(p.respawn===0){const seat=SEATS[HEROES.findIndex(h=>h.id===p.id)];p.hp=maxHP(p);p.mana=maxMana(p);p.x=p.moveX=seat.x;p.y=p.moveY=seat.y;p.walkUntil=0;p.moving=false;}
      continue;
    }
    p.hp=Math.min(maxHP(p),p.hp+maxHP(p)*.006*dt);
    if(bots.includes(p.id))botMove(w,p);
    movePlayer(w,p,dt);
    if(p.paused||p.stun>0||p.hex>0||p.channel>0)continue;
    if(p.auto&&p.attackTimer<=0){fire(w,p);p.attackTimer=1/attackSpeed(p);}
    if(bots.includes(p.id)&&p.cooldown<=0&&w.enemies.length)fire(w,p,true);
    if(bots.includes(p.id)&&p.id==='sf'&&w.enemies.some(e=>distance(p,e)<320)&&p.mana>175&&p.ultCooldown<=0)sfSpell(w,p,{type:'ultimate'});
    if(bots.includes(p.id)){const item=['damage','speed','wisdom'][Math.floor(p.level+p.damage+p.speed+p.wisdom)%3];if(p.gold>=upgradeCost(p,item))command(w,p.id,{type:'upgrade',upgrade:item});}
  }
  if(w.breakTime>0){w.breakTime-=dt;return;}
  if(w.phase==='farm'){
    w.spawnTimer-=dt;
    if(w.spawned<rules.count && w.spawnTimer<=0 && w.enemies.length<80){spawnEnemy(w);w.spawned++;w.spawnTimer=rules.interval;}
  }else{
    w.fightTime+=dt;
    if(w.pendingStrike>0){w.pendingStrike-=dt;if(w.pendingStrike<=0){for(const p of Object.values(w.players))hurt(w,p,rules.damage*3.8);emit(w,'sunStrike',{points:playerPoints(w)});}}
  }
  for(const e of w.enemies){
    if(e.hp<=0)continue;
    e.step+=dt;e.hit=Math.max(0,e.hit-dt);e.mana=Math.min(e.maxMana||0,(e.mana||0)+(e.boss?14:7)*dt);
    for(const key of ['cyclone','fear','slow'])e[key]=Math.max(0,(e[key]||0)-dt);
    if(e.cyclone>0)continue;
    if(e.neutral&&e.fear<=0){e.abilityTimer-=dt;if(e.abilityTimer<=0)neutralAbility(w,e);}
    if(e.boss)roshanStep(w,e,dt);
    else if(e.hero){for(const key of ['armor','spin','buff','grave'])e[key]=Math.max(0,(e[key]||0)-dt);e.abilityTimer-=dt;if(e.abilityTimer<=0&&e.fear<=0){if(enemyAbility(w,e))e.abilityTimer=ENEMY_HEROES.find(h=>h.id===e.kit).cooldown*.82;}}
    const living=Object.values(w.players).filter(p=>p.respawn<=0),target=living.sort((a,b)=>distance(a,e)-distance(b,e))[0];
    if(!target)continue;
    const range=e.boss?110:e.ranged||e.neutral==='satyr'||e.neutral==='mindstealer'||e.neutral==='banisher'||['lina','cm','lion','wd','invoker','dazzle'].includes(e.kit)?390:80;
    const d=distance(target,e),dx=target.x-e.x,dy=target.y-e.y;
    if(e.fear>0||d>range){const amount=Math.min(e.speed*(e.slow>0?.55:1)*dt,Math.max(0,e.fear>0?10000:d-range));if(d>0){e.x=clamp(e.x+dx/d*amount*(e.fear>0?-1:1),ARENA.minX,ARENA.maxX);e.y=clamp(e.y+dy/d*amount*(e.fear>0?-1:1),ARENA.minY,ARENA.maxY);}}
    e.attackTimer-=dt;
    if(e.fear<=0&&d<=range+8&&e.attackTimer<=0){
      hurt(w,target,e.damage*(e.enraged?1.6:e.buff>0?2:1));
      e.attackTimer=e.boss?(e.enraged?.65:.95):e.hero?.85:.9;
      emit(w,'enemyAttack',{x:e.x,y:e.y-30,points:[{x:target.x,y:target.y-30}],ranged:range>150});
    }
  }
  resolveHazards(w,dt);
  for(const shot of w.projectiles){
    if(shot.delay>0){shot.delay-=dt;continue;}
    let e=w.enemies.find(e=>e.id===shot.target&&e.hp>0);
    if(!e){e=targets(w,w.players[shot.hero],shot.execute&&shot.threshold>.18)[0];if(!e){shot.done=true;continue;}shot.target=e.id;}
    const dx=e.x-shot.x,dy=e.y-35-shot.y,length=Math.hypot(dx,dy),move=(shot.execute?1100:700)*dt;
    if(length<=move){if(e.cyclone>0){shot.done=true;continue;}hit(w,shot,e);shot.done=true;}else{shot.x+=dx/length*move;shot.y+=dy/length*move;}
  }
  w.projectiles=w.projectiles.filter(s=>!s.done);w.enemies=w.enemies.filter(e=>e.hp>0);
  if(w.phase==='boss'){
    if(!w.enemies.length)finishRoshan(w,true);
    else if(Object.values(w.players).every(p=>p.respawn>0)||w.fightTime>=180)finishRoshan(w,false);
  }else if(w.phase==='teamfight'){
    if(!w.enemies.length)nextWave(w,true);
    else if(Object.values(w.players).every(p=>p.respawn>0)||w.fightTime>=150)nextWave(w,false);
  }else if(w.spawned>=rules.count && !w.enemies.length){if(rules.boss)startRoshan(w);else if(rules.teamfight)startTeamfight(w);else nextWave(w,true);}
}

export function restoreWorld(saved) {
  const w=createWorld();
  if(!saved||saved.version!==2)return w;
  // Save only bounded, typed progression; discard transient combat on reload.
  for(const h of HEROES){const p=w.players[h.id],old=saved.players?.[h.id];if(!old)continue;
    for(const key of ['level','xp','gold','kills','heroKills','damage','speed','wisdom'])if(Number.isFinite(old[key])&&old[key]>=0)p[key]=Math.min(1e9,Math.floor(old[key]));
    p.level=Math.max(1,p.level);p.xp=Math.min(requiredXP(p)-1,p.xp);p.hp=maxHP(p);p.mana=maxMana(p);if(typeof old.auto==='boolean')p.auto=old.auto;
  }
  for(const key of ['wave','kills','heroKills','bossKills','wins','losses','seconds'])if(Number.isFinite(saved[key])&&saved[key]>=0)w[key]=Math.min(1e9,Math.floor(saved[key]));
  w.wave=Math.max(1,w.wave);return w;
}
