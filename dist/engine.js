// The exact same rules run offline and on the authoritative multiplayer server.
export const HEROES = [
  {id:'drow',name:'Оскар',hero:'Drow Ranger',color:'#9cdce6',icon:'❄',skill:'Мультивыстрел',hint:'Пять ледяных стрел',cooldown:10,power:1,speed:1.15},
  {id:'timber',name:'Ержан',hero:'Timbersaw',color:'#efb76b',icon:'⚙',skill:'Вихрь пил',hint:'Веер пробивающих пил · броня',cooldown:9,power:1.25,speed:.85},
  {id:'sf',name:'Артур',hero:'Shadow Fiend',color:'#ee8872',icon:'♨',skill:'Shadowraze',hint:'Z / X / C · 200 / 450 / 700',cooldown:8,power:1.2,speed:1},
  {id:'rubick',name:'Санжар',hero:'Rubick',color:'#b9ed86',icon:'✧',skill:'Fade Bolt',hint:'Шесть прямых пробивающих импульсов',cooldown:8,power:.95,speed:1.1},
  {id:'sniper',name:'Эмир',hero:'Sniper',color:'#e9cc85',icon:'⌖',skill:'Украсть фраг',hint:'Стил при ≤32% HP · E: Шрапнель',cooldown:12,power:1,speed:.9}
];
export const ENEMY_HEROES=[
  {id:'axe',name:'Axe',color:'#d7886b',skill:'Berserker’s Call',description:'Зона замедления и броня',cooldown:7},
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
// Fan-game item values are tuned to this game's shared gold economy.
export const ITEMS=[
  {id:'bkb',bit:1,name:'Black King Bar',short:'BKB',cost:2200,hint:'+200 HP, +8% атаки. F: 6 сек защиты от контроля и −75% магического урона. КД 35 сек.'},
  {id:'heart',bit:2,name:'Heart of Tarrasque',short:'Тараска',cost:2800,hint:'+800 HP и +15% базового HP. Регенерация: +0.5% HP/сек в бою, +2% после 4 сек без урона.'},
  {id:'daedalus',bit:4,name:'Daedalus',short:'Даедалус',cost:2600,hint:'+35% атаки. Шанс 25% на крит ×2.2 обычной атаки. Эмиру: вместо критов +3 п.п. к стилу (до лимита).'},
  {id:'mjollnir',bit:8,name:'Mjollnir',short:'Мьёллнир',cost:2400,hint:'+18% атаки, +35% скорости. Попадания: 30% на молнию по 3 врагам. G: электрический щит на 8 сек, КД 24 сек.'}
];
export const hasItem=(p,id)=>!!((p.inventory||0)&(ITEMS.find(item=>item.id===id)?.bit||0));
export const alive=p=>p.lives>0&&p.respawn<=0;
export const baseDamage=p=>Math.floor((34+p.damage*12+(p.level-1)*8)*heroInfo(p.id).power*(p.id==='sf'?1+Math.min(p.kills,100)*(.005+(p.skillTalent||0)*.00025):1));
export const spellDamage=p=>baseDamage(p)*skillMultiplier(p);
export const hpRegen=(w,p)=>maxHP(p)*(.004+(hasItem(p,'heart')?(w.seconds-(p.lastHurt??-100)>4?.02:.005):0));
export function shoppingPlan(p){
  const rank=Math.min(...SKILL_UPGRADES.map(key=>p[key]||0));
  const branch=SKILL_UPGRADES.filter(key=>Number.isFinite(upgradeCost(p,key))).sort((a,b)=>(p[a]||0)-(p[b]||0))[0];
  const orders={timber:['heart','mjollnir','bkb','daedalus'],sf:['heart','bkb','mjollnir','daedalus']};
  const order=orders[p.id]||['mjollnir','heart','bkb','daedalus'];
  const owned=order.filter(id=>hasItem(p,id)).length,item=order.find(id=>!hasItem(p,id));
  if(item&&rank>=2+Math.floor(owned/2))return {type:'buy',item,cost:ITEMS.find(i=>i.id===item).cost};
  return branch?{type:'upgrade',upgrade:branch,cost:upgradeCost(p,branch)}:item?{type:'buy',item,cost:ITEMS.find(i=>i.id===item).cost}:null;
}
function buyItem(w,p,id){
  const item=ITEMS.find(i=>i.id===id);if(!item)return {ok:false,message:'Нет такого предмета'};
  if(w.gameOver||p.lives<=0)return {ok:false,message:'Этот забег закончен для героя'};
  if(hasItem(p,id))return {ok:false,message:'Предмет уже куплен'};
  if(p.gold<item.cost)return {ok:false,message:'Не хватает золота'};
  const before=maxHP(p);p.gold-=item.cost;p.goldSpent+=item.cost;p.inventory|=item.bit;
  if(p.respawn<=0)p.hp+=maxHP(p)-before;
  emit(w,'purchase',{hero:p.id,item:id});return {ok:true};
}
function activateItem(w,p,id){
  if(!hasItem(p,id)||!['bkb','mjollnir'].includes(id))return {ok:false,message:'Сначала купи активный предмет'};
  if(!w.started||w.gameOver||w.breakTime>0||!alive(p)||p.paused||p.stun>0||p.hex>0)return {ok:false,message:'Сейчас нельзя использовать предмет'};
  const key=id==='bkb'?'bkbCooldown':'mjollnirCooldown';if(p[key]>0)return {ok:false,message:'Предмет перезаряжается'};
  if(id==='bkb'){p.bkbLeft=6;p.bkbCooldown=35;p.slow=0;p.stun=0;p.hex=0;}
  else{p.staticLeft=8;p.mjollnirCooldown=24;}
  emit(w,'itemActive',{hero:p.id,item:id,x:p.x,y:p.y});return {ok:true};
}
function regroup(p){
  if(p.lives<=0)return;
  const seat=SEATS[HEROES.findIndex(h=>h.id===p.id)];p.x=p.moveX=seat.x;p.y=p.moveY=seat.y;p.walkUntil=0;p.walkX=0;p.walkY=0;p.moving=false;
}
function recover(p){
  if(p.lives<=0)return;
  regroup(p);p.hp=maxHP(p);p.mana=maxMana(p);p.respawn=0;p.spawnShield=2.5;p.stun=0;p.hex=0;p.slow=0;p.channel=0;
}
function control(p,data){
  if(!alive(p)||p.bkbLeft>0||p.spawnShield>0)return;
  if(p.controlGuard<=0&&(data.stun>0||data.hex>0)){
    p.stun=Math.max(p.stun,Math.min(1.6,data.stun||0));p.hex=Math.max(p.hex,Math.min(1.8,data.hex||0));
    p.controlGuard=Math.max(p.stun,p.hex)+2.5;
  }
  p.slow=Math.max(p.slow,Math.min(3,data.slow||0));if(data.purge)p.haste=0;
}
export const manaCost=p=>Math.ceil(({drow:75,timber:85,sf:60,rubick:90,sniper:100}[p.skill])*Math.max(.7,1-(p.skillHaste||0)*.015));
export const maxMana=p=>(p.id==='rubick'?460:360)+(p.level-1)*22;
export const manaRegen=p=>.8+maxMana(p)*.003;
export const moveSpeed=p=>(p.id==='timber'?225:245)*(p.slow>0?.78:1)*(p.haste>0?1.25:1);
export const attackRange=p=>({drow:620,timber:520,sf:560,rubick:580,sniper:1000}[p.id]);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const playerPoints=w=>Object.values(w.players).filter(p=>p.respawn<=0).map(p=>({x:p.x,y:p.y-30}));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const requiredXP = p => Math.floor(100*Math.pow(p.level,1.25));
export const damage = p => Math.floor(baseDamage(p)*(1+(hasItem(p,'bkb')?.08:0)+(hasItem(p,'daedalus')?.35:0)+(hasItem(p,'mjollnir')?.18:0)));
export const attackSpeed = p => Math.min(6,(1+p.speed*.12+(p.level-1)*.03)*heroInfo(p.id).speed*(hasItem(p,'mjollnir')?1.35:1)*(p.haste>0?1.5:1));
export const SKILL_UPGRADES=['skillPower','skillHaste','skillTalent'];
export const MAX_SKILL_RANK=20;
export const skillMultiplier=p=>1+(p.skillPower||0)*.18;
export const cooldownFor=(p,base)=>base*Math.max(.4,1-(p.skillHaste||0)*.045);
export const abilityCooldown=p=>cooldownFor(p,heroInfo(p.skill).cooldown);
export const upgradeCost=(p,type)=>!SKILL_UPGRADES.includes(type)||(p[type]||0)>=MAX_SKILL_RANK?Infinity:Math.ceil(({skillPower:160,skillHaste:220,skillTalent:280}[type])*(p.id==='sniper'?3:1)*Math.pow(1.35,p[type]||0));
export function stealThreshold(p,ability=false,boss=false){
  const ranks=p.id==='sniper'?SKILL_UPGRADES.reduce((sum,key)=>sum+(p[key]||0),0):0;
  return Math.min(boss?(ability?.25:.20):(ability?.60:.45),(boss?(ability?.08:.04):(ability?.32:.20))+ranks*.01+(p.id==='sniper'&&hasItem(p,'daedalus')?.03:0));
}
export function upgradeInfo(p,type){
  const q=heroInfo(p.skill).skill;
  const talent={drow:['Ледяные наконечники','Больше ледяных стрел, замедление атак; с ранга 3 обычная стрела пробивает ещё 2 цели (больше на рангах 8/16)'],timber:['Реактивная броня','Q даёт броню; больше пробивающих пил'],sf:['Некромастерия','Сильнее души, шире койлы и Requiem'],rubick:['Чародейская цепь','Больше прямых импульсов; Fade Bolt ослабляет врагов'],sniper:['Плотный обстрел','Шрапнель шире и длится дольше']}[p.id];
  const info=type==='skillPower'?{name:p.id==='sniper'?'Калибр шрапнели':q+' · мощь',hint:p.id==='sniper'?'+18% урона шрапнели':'+18% урона умений'}:type==='skillHaste'?{name:'Мастерство заклинаний',hint:'−4.5% базового КД умений · дешевле магия'}:{name:talent[0],hint:talent[1]};
  if(p.id==='sniper')info.hint+=' · +1 п.п. к стилу (до лимита)';
  return info;
}
export const maxHP = p => Math.floor(((p.id==='timber'?850:650)+(p.level-1)*100)*(hasItem(p,'heart')?1.15:1)+(hasItem(p,'heart')?800:0)+(hasItem(p,'bkb')?200:0));
export const waveRules = wave => {
  const stage=Math.min(30,wave),endless=Math.max(0,wave-30);
  return {count:8+wave*3,activeCap:Math.min(20,12+Math.floor(wave*.25)),interval:Math.max(.2,1.3*Math.pow(.95,wave-1)),hp:Math.floor((62+stage*17)*(1+stage*.025)*3.6*Math.pow(1+endless*.045,.9)),speed:Math.min(255,48+stage*3.7+endless*.6),damage:Math.floor((6+stage*1.25)*Math.pow(1+endless*.025,.65)),teamfight:wave%3===0&&wave!==30,boss:wave===30};
};
// Encounter HP is tied to the wave, never to the players' purchases or DPS.
export const teamfightHP=wave=>Math.floor(waveRules(wave).hp*(6.1+Math.min(6,wave*.2)));
export const roshanHP=()=>240000;

export function createWorld() {
  const world={version:2,runId:Math.floor(Math.random()*2147483646)+1,gameOver:false,started:false,wave:1,phase:'farm',seconds:0,kills:0,heroKills:0,bossKills:0,wins:0,losses:0,fightTime:0,pendingStrike:0,seed:Math.floor(Math.random()*2147483646)+1,enemyTeam:[],spawned:0,spawnTimer:.2,breakTime:0,nextId:1,eventId:0,events:[],enemies:[],projectiles:[],hazards:[],zones:[],casts:[],players:{}};
  for(const [index,h] of HEROES.entries()){const p={lives:5,inventory:0,bkbLeft:0,bkbCooldown:0,staticLeft:0,mjollnirCooldown:0,lightningTimer:0,staticTimer:0,spawnShield:0,controlGuard:0,lastHurt:-100,itemDamage:0,goldEarned:0,goldSpent:0,shopTimer:0,aimX:SEATS[index].x+500,aimY:SEATS[index].y-35,razeNearCooldown:0,razeMidCooldown:0,razeFarCooldown:0,skillPower:0,skillHaste:0,skillTalent:0,shrapnelCooldown:0,guard:0,deaths:0,assists:0,bossKills:0,damageDealt:0,heroDamage:0,creepDamage:0,bossDamage:0,spellDamage:0,damageTaken:0,dps:0,recentHits:[],x:SEATS[index].x,y:SEATS[index].y,moveX:SEATS[index].x,moveY:SEATS[index].y,walkX:0,walkY:0,walkUntil:0,moving:false,mana:0,eulCooldown:0,ultCooldown:0,channel:0,slow:0,target:0,id:h.id,skill:h.id,level:1,xp:0,gold:0,kills:0,heroKills:0,damage:0,speed:0,wisdom:0,auto:false,paused:false,hp:0,respawn:0,stun:0,hex:0,haste:0,attackTimer:0,manualTimer:0,cooldown:0,pose:0};p.hp=maxHP(p);p.mana=maxMana(p);world.players[h.id]=p;}
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
  if(p.id==='sniper'||(ability&&p.skill==='sniper'))return (e.hero||e.boss)&&e.hp/e.maxHP<=stealThreshold(p,ability,!!e.boss)&&!(e.grave>0);
  return true;
}
export const RAZES=[
  {id:'near',key:'Z',distance:200,cooldown:'razeNearCooldown',name:'Ближний койл'},
  {id:'mid',key:'X',distance:450,cooldown:'razeMidCooldown',name:'Средний койл'},
  {id:'far',key:'C',distance:700,cooldown:'razeFarCooldown',name:'Дальний койл'}
];
export const razeRules=(p,id)=>{const slot=RAZES.find(r=>r.id===id);return slot?{...slot,radius:135+Math.min(40,(p.skillTalent||0)*2),cost:manaCost({...p,skill:'sf'}),cd:cooldownFor(p,8),windup:.4}:null;};
function setAim(p,action={}){
  if(action.x!==undefined||action.y!==undefined){if(!Number.isFinite(action.x)||!Number.isFinite(action.y))return false;p.aimX=clamp(action.x,-200,ARENA.width+200);p.aimY=clamp(action.y,-200,ARENA.height+200);}
  return true;
}
export function aimDirection(p){const dx=p.aimX-p.x,dy=p.aimY-(p.y-35),len=Math.hypot(dx,dy);return len>.01?{x:dx/len,y:dy/len}:{x:1,y:0};}
function shotAt(w,p,angle,data={}){
  if(w.projectiles.length>=400)return;
  const speed=data.speed||720;
  w.projectiles.push({id:w.nextId++,hero:p.id,skill:p.id,ability:false,x:p.x,y:p.y-35,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,speed,rangeLeft:attackRange(p)+120,radius:9,pierce:0,hitIds:[],delay:0,damage:damage(p),...data});
}
function fire(w,p,ability=false,inputSeq,action={}) {
  if(!w.started||w.breakTime>0||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return {ok:false,message:'Герой отдыхает или оглушён'};
  if(ability&&p.skill==='sf')return {ok:false,message:'Койлы: Z — ближний, X — средний, C — дальний'};
  if(!setAim(p,action))return {ok:false,message:'Некорректный прицел'};
  if(ability&&p.mana<manaCost(p))return {ok:false,message:'Не хватает маны'};
  const dir=aimDirection(p),angle=Math.atan2(dir.y,dir.x),skill=ability?p.skill:p.id,count=ability?abilityCount(p):1,points=[];
  for(let i=0;i<count;i++){
    const spread=ability?(skill==='drow'?.075:skill==='timber'?.065:0):0,a=angle+(i-(count-1)/2)*spread;
    const multiplier=ability?({drow:1.8,timber:1.8,rubick:2.2,sniper:1}[skill]||1)*skillMultiplier(p):1;
    const speed=skill==='sniper'?1050:skill==='timber'?560:720;
    shotAt(w,p,a,{skill,ability,inputSeq,damage:(ability?baseDamage(p):damage(p))*multiplier*(skill==='rubick'?Math.pow(.93,i):1),speed,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,rangeLeft:attackRange(p)+(ability?180:120),radius:skill==='timber'?(ability?20:12):skill==='rubick'?14:9,pierce:ability&&['drow','timber','rubick'].includes(skill)?2+Math.floor((p.skillTalent||0)/5):!ability&&p.id==='drow'&&p.skillTalent>=3?2+Math.floor(p.skillTalent/8):0,delay:ability?i*.045:0,execute:p.id==='sniper'||ability&&skill==='sniper',threshold:stealThreshold(p,ability,false),bossThreshold:stealThreshold(p,ability,true)});
    points.push({x:p.x+Math.cos(a)*120,y:p.y-35+Math.sin(a)*120});
  }
  if(ability){p.mana-=manaCost(p);p.cooldown=abilityCooldown(p);if(skill==='timber')p.guard=3+(p.skillTalent||0)*.25;}
  p.pose=.3;emit(w,'shot',{hero:p.id,skill,ability,inputSeq,x:p.x,y:p.y-35,points});return {ok:true};
}
function castRaze(w,p,action){
  if(p.skill!=='sf')return {ok:false,message:'Койлы доступны владельцу Shadowraze'};
  const rules=razeRules(p,action.raze);
  if(!rules)return {ok:false,message:'Выбери койл Z, X или C'};
  if(!w.started||w.breakTime>0||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return {ok:false,message:'Сейчас нельзя применить койл'};
  if(p[rules.cooldown]>0)return {ok:false,message:rules.name+' перезаряжается'};
  if(p.mana<rules.cost)return {ok:false,message:'Не хватает маны'};
  if(!setAim(p,action))return {ok:false,message:'Некорректный прицел'};
  const dir=aimDirection(p),x=p.x+dir.x*rules.distance,y=p.y+dir.y*rules.distance;
  p.mana-=rules.cost;p[rules.cooldown]=rules.cd;p.pose=.4;
  w.casts.push({id:w.nextId++,hero:p.id,skill:'sf',raze:rules.id,x,y,radius:rules.radius,left:rules.windup,damage:spellDamage(p)*5.8});
  emit(w,'razeCharge',{hero:p.id,raze:rules.id,x,y,radius:rules.radius});return {ok:true};
}
function resolveCasts(w,dt){
  for(const cast of w.casts){cast.left-=dt;if(cast.left>0)continue;
    for(const e of w.enemies)if(e.hp>0&&!(e.cyclone>0)&&distance(cast,e)<=cast.radius)hit(w,{hero:cast.hero,skill:'sf',ability:true,damage:cast.damage},e);
    emit(w,'raze',{hero:cast.hero,raze:cast.raze,x:cast.x,y:cast.y,radius:cast.radius});
  }
  w.casts=w.casts.filter(cast=>cast.left>0);
}
export function command(w,id,action) {
  const p=w.players[id];if(!p||!action||typeof action!=='object')return {ok:false,message:'Неизвестный герой'};
  if(action.type==='start'){if(w.gameOver)return {ok:false,message:'Начни новый забег'};w.started=true;return {ok:true};}
  if(action.type==='buy')return buyItem(w,p,action.item);
  if(action.type==='item')return activateItem(w,p,action.item);
  if(w.gameOver)return {ok:false,message:'Забег завершён'};
  if(p.lives<=0)return {ok:false,message:'У героя закончились жизни'};
  if(action.type==='aim')return setAim(p,action)?{ok:true}:{ok:false,message:'Некорректный прицел'};
  if(action.type==='raze')return castRaze(w,p,action);
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
  if(action.type==='shrapnel')return castShrapnel(w,p,action);
  if(action.type==='eul'||action.type==='ultimate')return sfSpell(w,p,action);
  if(action.type==='upgrade'){
    if(!SKILL_UPGRADES.includes(action.upgrade))return {ok:false,message:'Нет такого улучшения'};
    const cost=upgradeCost(p,action.upgrade);if(!Number.isFinite(cost))return {ok:false,message:'Достигнут максимум улучшения'};if(p.gold<cost)return {ok:false,message:'Не хватает золота'};
    p.gold-=cost;p.goldSpent+=cost;p[action.upgrade]++;return {ok:true};
  }
  if(action.type==='attack'){
    if(p.attackTimer>0)return {ok:false,message:'Перезарядка выстрела'};
    const result=fire(w,p,false,action.seq,action);if(result.ok)p.attackTimer=1/attackSpeed(p);return result;
  }
  if(action.type==='ability'){
    if(p.cooldown>0)return {ok:false,message:'Способность перезаряжается'};
    return fire(w,p,true,action.seq,action);
  }
  return {ok:false,message:'Неизвестная команда'};
}
export const abilityCount=p=>({drow:5+Math.min(5,Math.floor((p.skillTalent||0)/2)),timber:8+Math.min(6,p.skillTalent||0),sf:6,rubick:6+Math.min(6,p.skillTalent||0),sniper:1}[p.skill]);
export const requiemRadius=p=>400+Math.min(150,(p.skillTalent||0)*12);
export const shrapnelRules=p=>({cost:80,cooldown:cooldownFor(p,16),radius:175+Math.min(120,(p.skillTalent||0)*8),duration:5+Math.min(5,(p.skillTalent||0)*.35),damage:Math.max(5,spellDamage(p)*.22)});
function castShrapnel(w,p,action){
  if(p.id!=='sniper')return {ok:false,message:'Шрапнель доступна Эмиру'};
  if(!w.started||w.breakTime>0||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return {ok:false,message:'Сейчас нельзя применить способность'};
  const rules=shrapnelRules(p);
  if(p.shrapnelCooldown>0)return {ok:false,message:'Шрапнель перезаряжается'};
  if(p.mana<rules.cost)return {ok:false,message:'Не хватает маны'};
  if(!setAim(p,action))return {ok:false,message:'Некорректная точка'};
  let x=p.aimX,y=p.aimY;
  if(Math.hypot(x-p.x,y-p.y)>1100)return {ok:false,message:'Шрапнель: цель слишком далеко'};
  x=clamp(x,ARENA.minX,ARENA.maxX);y=clamp(y,ARENA.minY,ARENA.maxY);
  p.mana-=rules.cost;p.shrapnelCooldown=rules.cooldown;
  w.zones.push({id:w.nextId++,hero:p.id,x,y,radius:rules.radius,left:rules.duration,tickTimer:0,damage:rules.damage});
  if(w.zones.length>10)w.zones.shift();
  emit(w,'shrapnel',{hero:p.id,x,y,radius:rules.radius});return {ok:true};
}
function stepZones(w,dt){
  for(const zone of w.zones){
    zone.left=Math.max(0,zone.left-dt);zone.tickTimer-=dt;
    if(zone.tickTimer>0)continue;zone.tickTimer=.5;
    for(const e of w.enemies){if(e.hp<=0||e.cyclone>0||distance(zone,e)>zone.radius)continue;e.slow=Math.max(e.slow,.9);hit(w,{hero:zone.hero,skill:'sniper',kind:'shrapnel',ability:true,damage:zone.damage},e);}
  }
  w.zones=w.zones.filter(zone=>zone.left>0);
}
function sfSpell(w,p,action){
  if(p.id!=='sf')return {ok:false,message:'Eul и Requiem доступны Артуру'};
  if(!w.started||w.breakTime>0||p.paused||p.respawn>0||p.stun>0||p.hex>0||p.channel>0)return {ok:false,message:'Сейчас нельзя применить способность'};
  const eul=action.type==='eul',cost=eul?75:175,key=eul?'eulCooldown':'ultCooldown';
  if(p[key]>0)return {ok:false,message:'Способность перезаряжается'};
  if(p.mana<cost)return {ok:false,message:'Не хватает маны'};
  if(eul){
    if(!setAim(p,action))return {ok:false,message:'Некорректный прицел'};
    const target=w.enemies.filter(e=>!e.boss&&e.hp>0&&e.cyclone<=0&&distance(p,e)<=560&&Math.hypot(e.x-p.aimX,e.y-35-p.aimY)<65).sort((a,b)=>Math.hypot(a.x-p.aimX,a.y-35-p.aimY)-Math.hypot(b.x-p.aimX,b.y-35-p.aimY))[0];if(!target)return {ok:false,message:'Наведи курсор на цель Eul в радиусе 560; Рошан невосприимчив'};
    target.cyclone=2.5+Math.min(.5,(p.skillTalent||0)*.05);(target.contributors||={})[p.id]=w.seconds;p.comboTarget=target.id;emit(w,'eul',{hero:p.id,enemy:target.id,x:target.x,y:target.y});
  }else{
    const combo=w.enemies.find(e=>e.id===p.comboTarget&&distance(p,e)<=requiemRadius(p));
    p.channel=Math.max(1.67,(combo?.cyclone||0)+.08);p.moveX=p.x;p.moveY=p.y;p.walkUntil=0;
    emit(w,'requiemCharge',{hero:p.id,x:p.x,y:p.y,duration:p.channel});
  }
  p.mana-=cost;p[key]=cooldownFor(p,eul?23:65);return {ok:true};
}
function releaseRequiem(w,p){
  const count=Math.min(28,16+Math.floor(p.kills/12));
  for(let i=0;i<count;i++)shotAt(w,p,i*Math.PI*2/count,{skill:'sf',kind:'soul',ability:true,speed:560,vx:Math.cos(i*Math.PI*2/count)*560,vy:Math.sin(i*Math.PI*2/count)*560,rangeLeft:requiemRadius(p),radius:18,pierce:4,fear:2+(p.skillTalent||0)*.1,damage:baseDamage(p)*(2.4+Math.min(p.kills,100)*.018)*skillMultiplier(p)});
  emit(w,'requiem',{hero:p.id,x:p.x,y:p.y-35,radius:requiemRadius(p),souls:count,points:[]});
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
  const available=w.enemies.filter(e=>e.hp>0&&!(e.cyclone>0)).sort((a,b)=>distance(p,a)-distance(p,b)),foe=available[0];
  if(!foe)return;
  const d=distance(p,foe),range=attackRange(p)*.78,dx=(p.x-foe.x)/(d||1),dy=(p.y-foe.y)/(d||1);
  p.moveX=p.x;p.moveY=p.y;
  if(d>range+30){p.moveX=clamp(foe.x+dx*range,ARENA.minX,ARENA.maxX);p.moveY=clamp(foe.y+dy*range,ARENA.minY,ARENA.maxY);}
  else if(d<range*.7){p.moveX=clamp(p.x+dx*140,ARENA.minX,ARENA.maxX);p.moveY=clamp(p.y+dy*140,ARENA.minY,ARENA.maxY);}
  const danger=w.hazards.find(h=>{
    if(h.kind!=='shockwave')return distance(p,h)<h.radius+35;
    const dx=h.toX-h.fromX,dy=h.toY-h.fromY,t=clamp(((p.x-h.fromX)*dx+(p.y-h.fromY)*dy)/(dx*dx+dy*dy),0,1);
    return Math.hypot(p.x-h.fromX-dx*t,p.y-h.fromY-dy*t)<h.radius+35;
  });
  if(danger){
    let ex=p.x-danger.x,ey=p.y-danger.y;if(danger.kind==='shockwave'){ex=-(danger.toY-danger.fromY);ey=danger.toX-danger.fromX;}
    const length=Math.hypot(ex,ey)||1;if(length===1){ex=0;ey=1;}
    const candidates=[1,-1].map(sign=>({x:clamp(p.x+ex/length*(danger.radius+100)*sign,ARENA.minX,ARENA.maxX),y:clamp(p.y+ey/length*(danger.radius+100)*sign,ARENA.minY,ARENA.maxY)}));
    candidates.sort((a,b)=>(distance(b,danger)+distance(b,foe)*.3)-(distance(a,danger)+distance(a,foe)*.3));p.moveX=candidates[0].x;p.moveY=candidates[0].y;
  }
}
function botAim(w,p,ability=false){
  const enemies=w.enemies.filter(e=>e.hp>0&&!(e.cyclone>0)&&(!(p.id==='sniper'||ability&&p.skill==='sniper')||allowedTarget(p,e,ability))).sort((a,b)=>distance(p,a)-distance(p,b));
  const target=enemies[0];if(!target||distance(p,target)>attackRange(p)+(p.skill==='sf'?250:150))return null;
  const lead=Math.min(.55,distance(p,target)/720),x=target.x+(target.moveVX||0)*lead,y=target.y-35+(target.moveVY||0)*lead;
  setAim(p,{x,y});return target;
}
function botCast(w,p){
  const target=botAim(w,p,true);if(!target)return;
  if(p.skill==='sf'){
    const d=distance(p,target),slots=RAZES.filter(r=>p[r.cooldown]<=0&&Math.abs(r.distance-d)<razeRules(p,r.id).radius*.9).sort((a,b)=>Math.abs(a.distance-d)-Math.abs(b.distance-d));
    if(slots.length)castRaze(w,p,{raze:slots[0].id});
  }else if(p.cooldown<=0)fire(w,p,true);
}
// Segment-vs-circle sweep: fast projectiles cannot tunnel through a unit between ticks.
export function sweepHit(ax,ay,bx,by,cx,cy,r){
  const dx=bx-ax,dy=by-ay,ox=ax-cx,oy=ay-cy,a=dx*dx+dy*dy,c=ox*ox+oy*oy-r*r;
  if(c<=0)return 0;if(a<1e-12)return null;const b=2*(ox*dx+oy*dy),d=b*b-4*a*c;if(d<0)return null;const t=(-b-Math.sqrt(d))/(2*a);return t>=0&&t<=1?t:null;
}
function unitRadius(u){return u.boss?65:u.neutral==='centaur'||u.neutral==='hellbear'?31:23;}
function flightHit(s,unit,x,y){
  const offset=unit.boss?80:35;
  return sweepHit(s.x-(unit.prevX??unit.x),s.y-((unit.prevY??unit.y)-offset),x-unit.x,y-(unit.y-offset),0,0,(s.radius||9)+unitRadius(unit));
}
function stepProjectiles(w,dt){
  for(const shot of w.projectiles){
    if(shot.delay>0){shot.delay-=dt;continue;}
    const speed=Math.hypot(shot.vx,shot.vy),travel=Math.min(shot.rangeLeft,speed*dt),x=shot.x+shot.vx/speed*travel,y=shot.y+shot.vy/speed*travel;
    const pool=shot.hostile?Object.values(w.players).filter(p=>p.respawn<=0&&!(p.id===shot.targetPlayer&&p.deaths!==shot.targetLife)):w.enemies.filter(e=>e.hp>0&&!(e.cyclone>0)&&!shot.hitIds.includes(e.id));
    const hits=pool.map(unit=>({unit,t:flightHit(shot,unit,x,y)})).filter(h=>h.t!==null).sort((a,b)=>a.t-b.t);
    for(const {unit} of hits){
      if(shot.hostile){
        hurt(w,unit,shot.damage,!!shot.ability,shot.source);control(unit,shot);
        const owner=w.enemies.find(e=>e.id===shot.source&&e.hp>0);if(owner&&shot.leech)owner.hp=Math.min(owner.maxHP,owner.hp+owner.maxHP*shot.leech);
        emit(w,'enemyImpact',{skill:shot.skill,x:unit.x,y:unit.y-35});shot.done=true;break;
      }
      hit(w,shot,unit);shot.hitIds.push(unit.id);if(shot.fear&&unit.hp>0&&!unit.boss)unit.fear=Math.max(unit.fear||0,shot.fear);
      if(shot.pierce--<=0){shot.done=true;break;}
    }
    shot.x=x;shot.y=y;shot.rangeLeft-=travel;
    if(shot.rangeLeft<=0||!Number.isFinite(x)||x< -100||x>ARENA.width+100||y< -100||y>ARENA.height+100)shot.done=true;
  }
  w.projectiles=w.projectiles.filter(s=>!s.done);
}
function reward(w,e,killer) {
  if(e.boss)w.bossKills++;else if(e.hero)w.heroKills++;else w.kills++;
  const last=w.players[killer];if(e.boss)last.bossKills++;else if(e.hero){last.heroKills++;for(const [id,at] of Object.entries(e.contributors||{}))if(id!==killer&&w.players[id]&&w.seconds-at<=12)w.players[id].assists++;}else last.kills++;
  for(const p of Object.values(w.players)){
    const xp=Math.floor((e.boss?1800:e.hero?110:e.ranged?27:21)*(1+p.wisdom*.2));
    p.xp+=xp;const gold=(e.boss?1500:e.hero?95:16)+Math.floor(Math.min(w.wave,60)*.65)+(p.id===killer?(e.boss?500:e.hero?100:5):0);p.gold+=gold;p.goldEarned+=gold;
    while(p.xp>=requiredXP(p)){p.xp-=requiredXP(p);p.level++;if(alive(p))p.hp=Math.min(maxHP(p),p.hp+150);emit(w,'level',{hero:p.id,level:p.level});}
  }
  emit(w,e.boss?'bossKill':e.hero?'heroKill':'kill',{hero:killer,enemy:e.id,name:e.heroName,x:e.x,y:e.y,gold:e.boss?2000:e.hero?210:21});
}
function recordDamage(w,p,e,amount,spell){
  if(!(amount>0))return;
  p.damageDealt+=amount;p[e.boss?'bossDamage':e.hero?'heroDamage':'creepDamage']+=amount;
  if(spell)p.spellDamage+=amount;
  (e.contributors||={})[p.id]=w.seconds;
  p.recentHits.push({at:w.seconds,amount});
  if(p.recentHits.length>300)p.recentHits.shift();
}
export function hit(w,shot,e) {
  const p=w.players[shot.hero];if(!p||!e||e.hp<=0||e.cyclone>0)return;
  const shrapnel=shot.kind==='shrapnel',sniperChip=p.id==='sniper'&&['shrapnel','lightning','static'].includes(shot.kind);
  let before=e.hp;
  if((p.id==='sniper'&&!sniperChip)||shot.execute){
    if(!e.hero&&!e.boss||e.grave>0)return;
    const ability=shot.ability??(shot.threshold>.20),threshold=Math.min(stealThreshold(p,ability,!!e.boss),(e.boss?shot.bossThreshold:shot.threshold)??1);
    if(e.hp/e.maxHP>threshold)return;
    e.hp=0;
  }else{
    if(e.hero&&e.kit==='pa'&&random(w)<.12&&!shot.ability)return;
    before=e.hp;
    const crit=!shot.ability&&!shot.kind&&hasItem(p,'daedalus')&&random(w)<.25;
    if(crit)emit(w,'crit',{hero:p.id,x:e.x,y:e.y,damage:Math.round(shot.damage*2.2)});
    const amount=shot.damage*(crit?2.2:1)*(e.resistance??1)*(e.spin>0?.35:e.armor>0?.45:1);
    const floor=e.grave>0||(shrapnel||sniperChip)&&!e.hero&&!e.boss?Math.min(e.hp,1):0;
    e.hp=Math.max(floor,e.hp-amount);
    if(shot.skill==='drow'&&(shot.ability||p.skillTalent>0))e.slow=Math.max(e.slow,shot.ability?2+(p.skillTalent||0)*.25:1);
    if(shot.ability&&shot.skill==='rubick')e.weaken=Math.max(e.weaken||0,3+(p.skillTalent||0)*.4);
  }
  const effective=Math.max(0,before-e.hp);recordDamage(w,p,e,effective,!!shot.ability);
  e.hit=.18;
  if(!shrapnel)emit(w,'impact',{hero:p.id,skill:shot.skill||p.id,ability:!!shot.ability,x:e.x,y:e.y-28});
  if(e.hp===0)reward(w,e,p.id);
  if(shot.kind==='lightning'||shot.kind==='static')p.itemDamage+=effective;
  if(effective>0&&!shot.ability&&!shot.kind&&hasItem(p,'mjollnir')&&p.lightningTimer<=0&&random(w)<.3){p.lightningTimer=.3;chainLightning(w,p,e,false);}
}
function chainLightning(w,p,first,reactive){
  const visited=new Set(),points=[];let source=first;
  for(let i=0;i<3&&source;i++){
    visited.add(source.id);points.push({x:source.x,y:source.y-35});
    hit(w,{hero:p.id,skill:'mjollnir',kind:reactive?'static':'lightning',ability:true,damage:(60+p.level*7)*(reactive?.8:1)},source);
    source=w.enemies.filter(e=>e.hp>0&&!(e.cyclone>0)&&!visited.has(e.id)&&distance(e,source)<380).sort((a,b)=>distance(a,source)-distance(b,source))[0];
  }
  emit(w,'lightning',{hero:p.id,x:p.x,y:p.y-35,points});
}
function hurt(w,p,amount,magic=false,source){
  if(!alive(p)||p.spawnShield>0)return;
  const before=p.hp;
  p.hp=Math.max(0,p.hp-amount*(p.id==='timber'?.6:1)*(p.guard>0?.8:1)*(magic&&p.bkbLeft>0?.25:1));
  const actual=Math.max(0,before-p.hp),lethal=p.hp<=0;p.damageTaken+=actual;if(actual>0)p.lastHurt=w.seconds;
  if(actual>0&&hasItem(p,'mjollnir')&&p.staticLeft>0&&p.staticTimer<=0){
    const first=w.enemies.find(e=>e.id===source&&e.hp>0&&distance(p,e)<600);
    if(first){p.staticTimer=.75;chainLightning(w,p,first,true);}
  }
  if(lethal){p.hp=0;p.deaths++;p.lives=Math.max(0,p.lives-1);p.respawn=p.lives>0?8:999999;p.pose=0;p.channel=0;p.bkbLeft=0;p.staticLeft=0;emit(w,'down',{hero:p.id,lives:p.lives,kind:magic?'magic':'attack',source,damage:Math.round(actual)});}
}
function launchEnemyShot(w,e,target,data={}){
  if(w.projectiles.length>=400)return;
  const speed=data.speed|| (e.boss?440:e.hero?620:520),originY=e.y-(e.boss?80:35),dx=target.x-e.x||-.001,dy=target.y-35-originY,len=Math.hypot(dx,dy);
  w.projectiles.push({id:w.nextId++,hostile:true,source:e.id,targetPlayer:target.id,targetLife:target.deaths,skill:e.kit||e.neutral||(e.ranged?'creepRanged':'creepMelee'),x:e.x,y:originY,vx:dx/len*speed,vy:dy/len*speed,rangeLeft:Math.max(650,len+250),radius:12,damage:e.damage*(e.enraged?1.6:e.buff>0?2:1)*(e.weaken>0?.8:1),speed,delay:0,...data});
}

function random(w){w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;}
export function startTeamfight(w){
  const rules=waveRules(w.wave),pool=[...ENEMY_HEROES];
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random(w)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  w.phase='teamfight';w.fightTime=0;w.enemies=[];w.projectiles=[];w.hazards=[];w.zones=[];w.casts=[];w.enemyTeam=pool.slice(0,5).map(h=>h.id);
  for(const [i,h] of pool.slice(0,5).entries()){
    const hp=Math.floor(teamfightHP(w.wave)*(h.id==='axe'?1.3:1));
    w.enemies.push({id:w.nextId++,hero:true,kit:h.id,heroName:h.name,color:h.color,x:1390+(i%2)*170,y:260+i*135,hp,maxHP:hp,resistance:.72,mana:420,maxMana:420,cyclone:0,fear:0,slow:0,speed:Math.min(225,rules.speed+35),damage:rules.damage*1.15,attackTimer:.7+i*.12,abilityTimer:.8+i*.35,step:0,hit:0,armor:0,spin:0,buff:0,grave:0});
  }
  for(const p of Object.values(w.players)){recover(p);p.cooldown=Math.min(2,p.cooldown);}
  emit(w,'fightStart',{team:w.enemyTeam});
}
export function startRoshan(w){
  const hp=roshanHP();
  w.phase='boss';w.fightTime=0;w.pendingStrike=0;w.enemyTeam=['roshan'];w.projectiles=[];w.hazards=[];w.zones=[];w.casts=[];
  w.enemies=[{id:w.nextId++,boss:true,hero:false,kit:'roshan',heroName:ROSHAN.name,color:ROSHAN.color,x:1390,y:560,hp,maxHP:hp,resistance:.65,mana:900,maxMana:900,cyclone:0,fear:0,slow:0,speed:135,damage:150,attackTimer:1,abilityTimer:4,clapTimer:8,enraged:false,step:0,hit:0}];
  for(const p of Object.values(w.players)){recover(p);p.cooldown=0;}
  emit(w,'bossStart');
}
function finishRoshan(w,won){
  for(const p of Object.values(w.players)){recover(p);if(!won)p.gold=Math.floor(p.gold*.9);}
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
    addHazard(w,e,{x:target.x,y:target.y,radius:90,delay:.6,damage:e.damage*(e.enraged?3.8:2.8),stun:1.8,kind:'bash'});e.abilityTimer=e.enraged?3.5:5;
    const seat={x:target.x-23,y:target.y+40};
    emit(w,'bossAbility',{kit:'roshan',skill:'Bash',x:e.x,y:e.y-80,points:[{x:seat.x+23,y:seat.y-40}]});
  }
  if(e.clapTimer<=0&&e.mana>=80){
    e.mana-=80;addHazard(w,e,{x:e.x,y:e.y,radius:360,delay:.9,damage:e.damage*(e.enraged?2.3:1.6),stun:.7,kind:'roshanClap'});
    e.clapTimer=e.enraged?6:9;
    emit(w,'bossAbility',{kit:'roshan',skill:'Thunder Clap',x:e.x,y:e.y-30,points:playerPoints(w)});
  }
}
function nextWave(w,won){
  if(w.phase==='teamfight'){
    if(won)w.wins++;else{w.losses++;for(const p of Object.values(w.players))p.gold=Math.floor(p.gold*.9);}
    emit(w,'fightEnd',{won});
    for(const p of Object.values(w.players))recover(p);
  }
  w.phase='farm';w.wave++;w.spawned=0;w.spawnTimer=.1;w.breakTime=4;for(const p of Object.values(w.players))if(alive(p)){regroup(p);p.hp=Math.min(maxHP(p),p.hp+maxHP(p)*.2);p.mana=Math.min(maxMana(p),p.mana+maxMana(p)*.2);}w.enemies=[];w.projectiles=[];w.hazards=[];w.zones=[];w.casts=[];w.pendingStrike=0;emit(w,'wave',{wave:w.wave});
}
export function enemyAbility(w,e){
  const living=Object.values(w.players).filter(p=>p.respawn<=0&&distance(p,e)<700);if(!living.length||e.mana<50)return false;e.mana-=50;
  const target=living[Math.floor(random(w)*living.length)],power=e.damage;
  switch(e.kit){
    case 'axe':e.armor=3;addHazard(w,e,{x:e.x,y:e.y,radius:250,delay:.45,damage:power*.8,kind:'call'});break;
    case 'lina':launchEnemyShot(w,e,target,{damage:power*4.5,speed:680,radius:18,ability:true});break;
    case 'cm':launchEnemyShot(w,e,target,{damage:power*1.7,speed:500,stun:2.4,radius:20,ability:true});break;
    case 'pudge':launchEnemyShot(w,e,target,{damage:power*2.5,speed:560,stun:1.8,leech:.12,radius:23,ability:true});break;
    case 'pa':launchEnemyShot(w,e,target,{damage:power*3,speed:700,radius:12,ability:true});break;
    case 'tide':addHazard(w,e,{x:e.x,y:e.y,radius:500,delay:.8,damage:power*1.5,stun:1.6,kind:'ravage'});break;
    case 'sven':e.buff=4;break;
    case 'lion':launchEnemyShot(w,e,target,{damage:power*.5,speed:520,hex:3,radius:20,ability:true});break;
    case 'wd':for(const foe of w.enemies)if(foe.hp>0)foe.hp=Math.min(foe.maxHP,foe.hp+foe.maxHP*.10);break;
    case 'invoker':for(const p of living)addHazard(w,e,{x:p.x,y:p.y,radius:105,delay:1.5,damage:power*3.8,kind:'sun'});break;
    case 'jugger':e.spin=3;addHazard(w,e,{x:e.x,y:e.y,radius:260,delay:.55,damage:power*1.8,kind:'fury'});break;
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
    const d=Math.max(1,distance(e,target));addHazard(w,e,{x:target.x,y:target.y,fromX:e.x,fromY:e.y,toX:e.x+(target.x-e.x)/d*750,toY:e.y+(target.y-e.y)/d*750,radius:55,delay:1,damage:e.damage*2.1,kind:'shockwave'});
  }else if(e.neutral==='mindstealer')addHazard(w,e,{x:target.x,y:target.y,radius:100,delay:.9,damage:e.damage*1.5,manaBurn:55,kind:'manaBurn'});
  else if(e.neutral==='banisher'){launchEnemyShot(w,e,target,{damage:0,speed:500,slow:2.2,purge:true,ability:true});}
  else addHazard(w,e,{x:e.x,y:e.y,radius:e.neutral==='centaur'?185:215,delay:1,damage:e.damage*1.8,stun:e.neutral==='centaur'?1.5:0,slow:e.neutral==='hellbear'?3:0,kind:e.neutral==='centaur'?'stomp':'clap'});
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
      hurt(w,p,h.damage,true,h.owner);control(p,h);if(p.bkbLeft<=0&&p.spawnShield<=0)p.mana=Math.max(0,p.mana-(h.manaBurn||0));
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
      HEROES.forEach((h,i)=>{w.players[h.id].skill=pool[i];w.players[h.id].cooldown=Math.min(3,w.players[h.id].cooldown);});emit(w,'prank',{message:'Способности перемешались. Проверяйте умения!'});break;
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
  if(!w.started||w.gameOver)return;
  dt=Math.max(0,Math.min(.1,dt));w.seconds+=dt;
  const rules=waveRules(w.wave);
  for(const p of Object.values(w.players)){
    p.prevX=p.x;p.prevY=p.y;
    for(const key of ['eulCooldown','ultCooldown','shrapnelCooldown','slow','guard','razeNearCooldown','razeMidCooldown','razeFarCooldown','bkbLeft','bkbCooldown','staticLeft','mjollnirCooldown','lightningTimer','staticTimer','spawnShield','controlGuard','shopTimer'])p[key]=Math.max(0,p[key]-dt);
    p.recentHits=p.recentHits.filter(h=>w.seconds-h.at<5);p.dps=p.recentHits.reduce((sum,h)=>sum+h.amount,0)/Math.max(.1,Math.min(5,w.seconds));
    p.mana=Math.min(maxMana(p),p.mana+manaRegen(p)*dt);
    if(p.channel>0){if(p.stun>0||p.hex>0||p.respawn>0){p.channel=0;emit(w,'channelCancel',{hero:p.id});}else{p.channel=Math.max(0,p.channel-dt);if(p.channel===0)releaseRequiem(w,p);}}
    p.cooldown=Math.max(0,p.cooldown-dt);p.attackTimer-=dt;p.manualTimer=Math.max(0,p.manualTimer-dt);p.pose=Math.max(0,p.pose-dt);p.stun=Math.max(0,p.stun-dt);p.hex=Math.max(0,p.hex-dt);p.haste=Math.max(0,p.haste-dt);
    if(p.lives<=0)continue;
    if(p.respawn>0){
      p.respawn=Math.max(0,p.respawn-dt);
      if(p.respawn===0){const seat=SEATS[HEROES.findIndex(h=>h.id===p.id)];recover(p);p.x=p.moveX=seat.x;p.y=p.moveY=seat.y;p.walkUntil=0;p.moving=false;}
      continue;
    }
    p.hp=Math.min(maxHP(p),p.hp+hpRegen(w,p)*dt);
    if(bots.includes(p.id))botMove(w,p);
    movePlayer(w,p,dt);
    if(p.paused||p.stun>0||p.hex>0||p.channel>0)continue;
    if((p.auto||bots.includes(p.id))&&p.attackTimer<=0){if(!bots.includes(p.id)||botAim(w,p))fire(w,p);p.attackTimer=1/attackSpeed(p);}
    if(bots.includes(p.id)&&w.enemies.length)botCast(w,p);
    if(bots.includes(p.id)&&p.id==='sf'&&w.enemies.some(e=>distance(p,e)<320)&&p.mana>175&&p.ultCooldown<=0)sfSpell(w,p,{type:'ultimate'});
    if(bots.includes(p.id)&&p.id==='sniper'&&p.shrapnelCooldown<=0&&w.enemies.some(e=>distance(p,e)<1000)){const e=w.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(e)castShrapnel(w,p,{x:e.x,y:e.y});}
    if(bots.includes(p.id)&&p.shopTimer<=0){p.shopTimer=.5;const purchase=shoppingPlan(p);if(purchase&&p.gold>=purchase.cost)command(w,p.id,purchase);}
    if(bots.includes(p.id)&&w.enemies.some(e=>distance(p,e)<600)){if(p.hp<maxHP(p)*.7||w.hazards.some(h=>distance(h,p)<h.radius+30))activateItem(w,p,'bkb');activateItem(w,p,'mjollnir');}
  }
  if(w.breakTime>0){w.breakTime-=dt;return;}
  if(w.phase==='farm'){
    w.spawnTimer-=dt;
    if(w.spawned<rules.count && w.spawnTimer<=0 && w.enemies.length<rules.activeCap){spawnEnemy(w);w.spawned++;w.spawnTimer=rules.interval;}
  }else{
    w.fightTime+=dt;
    if(w.pendingStrike>0){w.pendingStrike-=dt;if(w.pendingStrike<=0){for(const p of Object.values(w.players))hurt(w,p,rules.damage*3.8);emit(w,'sunStrike',{points:playerPoints(w)});}}
  }
  for(const e of w.enemies){
    if(e.hp<=0)continue;
    e.prevX=e.x;e.prevY=e.y;
    e.step+=dt;e.hit=Math.max(0,e.hit-dt);e.mana=Math.min(e.maxMana||0,(e.mana||0)+(e.boss?4.5:2)*dt);
    for(const key of ['cyclone','fear','slow','weaken'])e[key]=Math.max(0,(e[key]||0)-dt);
    if(e.cyclone>0)continue;
    if(e.neutral&&e.fear<=0){e.abilityTimer-=dt;if(e.abilityTimer<=0)neutralAbility(w,e);}
    if(e.boss)roshanStep(w,e,dt);
    else if(e.hero){for(const key of ['armor','spin','buff','grave'])e[key]=Math.max(0,(e[key]||0)-dt);e.abilityTimer-=dt;if(e.abilityTimer<=0&&e.fear<=0){if(enemyAbility(w,e))e.abilityTimer=ENEMY_HEROES.find(h=>h.id===e.kit).cooldown*.82;}}
    const living=Object.values(w.players).filter(p=>p.respawn<=0),target=living.sort((a,b)=>distance(a,e)-distance(b,e))[0];
    if(!target)continue;
    const range=e.boss?110:e.ranged||e.neutral==='satyr'||e.neutral==='mindstealer'||e.neutral==='banisher'||['lina','cm','lion','wd','invoker','dazzle'].includes(e.kit)?390:80;
    const d=distance(target,e),dx=target.x-e.x,dy=target.y-e.y;
    if(e.fear>0||d>range){const amount=Math.min(e.speed*(e.slow>0?.55:1)*dt,Math.max(0,e.fear>0?10000:d-range));if(d>0){e.x=clamp(e.x+dx/d*amount*(e.fear>0?-1:1),ARENA.minX,ARENA.maxX);e.y=clamp(e.y+dy/d*amount*(e.fear>0?-1:1),ARENA.minY,ARENA.maxY);}}
    e.moveVX=(e.x-e.prevX)/dt||0;e.moveVY=(e.y-e.prevY)/dt||0;
    e.attackTimer-=dt;
    if(e.fear<=0&&d<=range+8&&e.attackTimer<=0){
      launchEnemyShot(w,e,target);
      e.attackTimer=e.boss?(e.enraged?.65:.95):e.hero?1.15:1.3;
    }
  }
  resolveHazards(w,dt);resolveCasts(w,dt);stepZones(w,dt);stepProjectiles(w,dt);
  w.enemies=w.enemies.filter(e=>e.hp>0);
  if(Object.values(w.players).every(p=>p.lives<=0)){w.gameOver=true;emit(w,'gameOver',{wave:w.wave});return;}
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
    for(const key of ['level','xp','gold','kills','heroKills','damage','speed','wisdom','deaths','assists','bossKills'])if(Number.isFinite(old[key])&&old[key]>=0)p[key]=Math.min(1e9,Math.floor(old[key]));
    for(const key of ['damageDealt','heroDamage','creepDamage','bossDamage','spellDamage','damageTaken'])if(Number.isFinite(old[key])&&old[key]>=0)p[key]=Math.min(1e15,old[key]);
    for(const key of SKILL_UPGRADES)if(Number.isFinite(old[key])&&old[key]>=0)p[key]=Math.min(MAX_SKILL_RANK,Math.floor(old[key]));
    p.level=Math.max(1,p.level);p.xp=Math.min(requiredXP(p)-1,p.xp);p.hp=maxHP(p);p.mana=maxMana(p);if(typeof old.auto==='boolean')p.auto=old.auto;
    if(Number.isInteger(old.inventory)&&old.inventory>=0)p.inventory=old.inventory&15;
    if(Number.isInteger(old.lives))p.lives=clamp(old.lives,0,5);
    for(const [key,limit] of [['bkbCooldown',35],['mjollnirCooldown',24],['cooldown',12],['eulCooldown',23],['ultCooldown',65],['shrapnelCooldown',16],['razeNearCooldown',8],['razeMidCooldown',8],['razeFarCooldown',8]])if(Number.isFinite(old[key]))p[key]=clamp(old[key],0,limit);
    for(const key of ['goldEarned','goldSpent','itemDamage'])if(Number.isFinite(old[key])&&old[key]>=0)p[key]=Math.min(1e15,old[key]);
    p.hp=p.lives>0?maxHP(p):0;p.respawn=p.lives>0?0:999999;
  }
  for(const key of ['wave','kills','heroKills','bossKills','wins','losses','seconds'])if(Number.isFinite(saved[key])&&saved[key]>=0)w[key]=Math.min(1e9,Math.floor(saved[key]));
  w.wave=Math.max(1,w.wave);w.gameOver=Object.values(w.players).every(p=>p.lives<=0);return w;
}
