import {CHAOS_HEROES,CHAOS_ABILITIES,CHAOS_SKILL_BY_ID,CHAOS_HERO_BY_ID,CHAOS_NATIVE_WEIGHT,CHAOS_INVOKES,ARCADE_ITEMS,PUDGE_UPGRADES} from './chaos-data.js';
export const ARCADE_MODES=['pudge','chaos'];
export const PW_ARENA={x:0,y:0,w:1800,h:1000,riverLeft:820,riverRight:980};
export const CHAOS_DUEL_ARENA={x:3800,y:100,w:1200,h:1000};
export const ARCADE_PW_ITEMS=[
 {id:'boots',name:'Boots of Speed',cost:350,hint:'+15% movement speed.'},
 {id:'heart',name:'Heart',cost:1200,hint:'+350 HP and regeneration.'},
 {id:'shield',name:'Hook Guard',cost:900,hint:'B: absorb one incoming hook for 4 seconds; 22s cooldown.'},
 {id:'blink',name:'Blink Dagger',cost:1000,hint:'E: blink toward the cursor on your current bank; 14s cooldown.'},
 {id:'thunder',name:'Thunder Chain',cost:1400,hint:'Hooks splash lightning onto nearby enemies.'}
];
const acClamp=(n,a,b)=>Math.max(a,Math.min(b,n)),acDist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function arcadeRandom(w){w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;}
function acPick(w,list){return list[Math.floor(arcadeRandom(w)*list.length)];}
function acShuffle(w,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(arcadeRandom(w)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function arcadeEmit(w,type,data={}){w.events.push({id:++w.eventId,type,at:w.seconds,...data});if(w.events.length>80)w.events.splice(0,w.events.length-80);}
export function arcadePen(index){return {x:(index%4)*900,y:Math.floor(index/4)*900,w:900,h:900};}
export function arcadeBounds(w,p){if(w.mode==='pudge')return PW_ARENA;if(w.duel&&['duel','duel_prep'].includes(w.phase)&&w.duel.ids.includes(p.id))return CHAOS_DUEL_ARENA;return arcadePen(p.seat);}
export function arcadeSlots(mode){return Array.from({length:mode==='pudge'?10:8},(_,i)=>'s'+(i+1));}
export function createArcadeWorld(mode='chaos',options={}){
 if(!ARCADE_MODES.includes(mode))throw Error('Unknown arcade mode');
 const w={version:1,mode,runId:Math.floor(Math.random()*2147483646)+1,seed:Number.isInteger(options.seed)?options.seed>>>0:Math.floor(Math.random()*2147483646)+1,seconds:0,started:false,gameOver:false,winner:null,phase:'lobby',phaseTime:0,wave:0,score:[0,0],targetScore:[25,50,75,100].includes(options.targetScore)?options.targetScore:50,players:{},enemies:[],projectiles:[],zones:[],summons:[],hooks:[],runes:[],pending:[],duel:null,duelHistory:[],bets:{},nextId:1,eventId:0,events:[],runeTimer:5,settings:{lives:5,nativeWeight:CHAOS_NATIVE_WEIGHT},bans:{heroes:[],abilities:[]},lastSurvivor:null};
 for(const [seat,id] of arcadeSlots(mode).entries()){
  const pen=arcadePen(seat),p={id,seat,name:['Oscar','Ержан','Артур','Санжар','Эмир','Игрок 6','Игрок 7','Игрок 8','Игрок 9','Игрок 10'][seat],team:seat<5?0:1,hero:mode==='pudge'?'pudge':null,heroOptions:[],heroRerolled:false,abilities:[],offer:[],offerSlot:-1,offerRank:1,skillSlots:5,picks:0,points:0,items:[],itemCD:{},cd:{},statuses:{},stacks:{},orbs:[],invoked:[],stolen:null,level:1,xp:0,gold:mode==='chaos'?600:250,earned:0,spent:0,creepKills:0,kills:0,deaths:0,assists:0,damageDealt:0,damageTaken:0,healing:0,clearedWaves:0,duelWins:0,duelLosses:0,duels:0,lives:5,eliminated:false,failedRound:false,cleared:false,clearTime:0,roundElapsed:0,x:mode==='pudge'?(seat<5?340:1460):pen.x+240,y:mode==='pudge'?220+(seat%5)*140:pen.y+460,moveX:0,moveY:0,walkX:0,walkY:0,walkUntil:0,aimX:0,aimY:0,hp:0,mana:0,attackCD:0,respawn:0,spawnShield:0,controlGuard:0,shield:0,channel:null,channelLeft:0,lastHurt:-100,regenClock:0,botClock:0,shoppingClock:0,recentDamage:[],contributors:{},hookDamage:0,hookRange:0,hookSpeed:0,hookRadius:0,hookPoints:1,hookCD:0,hookHits:0,hooksThrown:0,pullBy:0};
  p.moveX=p.x;p.moveY=p.y;p.aimX=p.x+(p.team===0?600:-600);p.aimY=p.y;
  if(mode==='chaos')p.heroOptions=acShuffle(w,CHAOS_HEROES).slice(0,4).map(h=>h.id);
  p.hp=arcadeMaxHP(w,p);p.mana=arcadeMaxMana(w,p);w.players[id]=p;
 }
 return w;
}
export const arcadeHas=(p,id)=>p.items.includes(id);
export function arcadeRank(p,id){const found=p.abilities.find(s=>s.id===id);if(found)return found.rank;if(p.stolen?.id===id&&p.stolen.left>0)return p.stolen.rank;if(p.invoked.some(s=>s.id===id))return Math.max(1,p.abilities.find(s=>s.id==='invoke')?.rank||1);return 0;}
function acEffRank(p,id){return arcadeRank(p,id)+(arcadeHas(p,'scepter')?1:0);}
export function arcadeMaxHP(w,p){if(w.mode==='pudge')return 850+(p.level-1)*35+(arcadeHas(p,'heart')?350:0);const h=CHAOS_HERO_BY_ID[p.hero]||CHAOS_HEROES[0],base=h.hp+(p.level-1)*90+(p.stacks.flesh||0)*(10+arcadeRank(p,'flesh')*3)+(p.stacks.decay||0)*12;return Math.floor(base*(arcadeHas(p,'heart')?1.1:1)*(p.statuses.golem>0?1.3:1)+(arcadeHas(p,'heart')?650:0)+(arcadeHas(p,'bkb')?250:0)+(arcadeHas(p,'bloodstone')?200:0)+(arcadeHas(p,'scepter')?150:0));}
export function arcadeMaxMana(w,p){if(w.mode==='pudge')return 100;return (CHAOS_HERO_BY_ID[p.hero]?.mana||400)+(p.level-1)*24+(arcadeHas(p,'octarine')?250:0)+(arcadeHas(p,'bloodstone')?200:0)+(arcadeHas(p,'scepter')?150:0);}
export function arcadeAttack(w,p){if(w.mode==='pudge')return 0;let d=(CHAOS_HERO_BY_ID[p.hero]?.damage||40)+(p.level-1)*7+(p.stacks.souls||0)*(1+arcadeRank(p,'necromastery'))+arcadeRank(p,'exort')*7;
 d*=1+(arcadeHas(p,'maelstrom')?.16:0)+(arcadeHas(p,'mjollnir')?.2:0)+(arcadeHas(p,'daedalus')?.3:0)+(p.statuses.metamorphosis>0?.6:0)+(p.statuses.empower>0?.3:0)+(p.statuses.alacrity>0?.3:0)+(p.statuses.golem>0?.25:0);return d*(p.statuses.weaken>0?.8:1);}
export function arcadeAttackRate(w,p){let rate=1+(p.level-1)*.027+(arcadeHas(p,'boots')?.16:0)+(arcadeHas(p,'assault')?.2:0)+(arcadeHas(p,'mjollnir')?.3:0)+(p.statuses.bloodlust>0?.35:0)+(p.statuses.overcharge>0?.4:0)+(p.statuses.alacrity>0?.4:0)+(p.statuses.phantomStrike>0?.65:0)+(p.stacks.fiery||0)*.08+arcadeRank(p,'wex')*.07;return Math.min(5,rate);}
export function arcadeMoveSpeed(w,p){if(w.mode==='pudge')return 250*(arcadeHas(p,'boots')?1.15:1)*(p.statuses.haste>0?1.3:1);let speed=CHAOS_HERO_BY_ID[p.hero]?.move||225;speed*=1+(arcadeHas(p,'boots')?.12:0)+arcadeRank(p,'wex')*.025+(p.statuses.bloodlust>0?.12:0)+(p.statuses.ghost_walk>0?.2:0);return speed*(p.statuses.slow>0?.65:1)*(p.statuses.metamorphosis>0?.9:1);}
export function arcadeRange(w,p){return w.mode==='pudge'?850+p.hookRange*70:(p.statuses.metamorphosis>0?620:CHAOS_HERO_BY_ID[p.hero]?.range||500)+arcadeRank(p,'take_aim')*35;}
function acSpellAmp(p){return 1+arcadeRank(p,'supremacy')*.1+(arcadeHas(p,'bloodstone')?.18:0)+(arcadeHas(p,'scepter')?.15:0)+(arcadeHas(p,'shard')?.12:0);}
export function arcadeSpellStats(w,p,id){const s=CHAOS_SKILL_BY_ID[id];if(!s)return null;const rank=Math.max(1,acEffRank(p,id)),level=1+(p.level-1)*.085;return {...s,rank,mana:Math.ceil(s.mana*(arcadeHas(p,'octarine')?.9:1)),cd:Math.max(.15,s.cd*(arcadeHas(p,'octarine')?.8:1)*Math.max(.7,1-(rank-1)*.045)),power:s.power*(s.power<1?1+(rank-1)*.2:1+(rank-1)*.45)*level*acSpellAmp(p),range:s.range*(1+arcadeRank(p,'supremacy')*.035),duration:s.duration*(1+(rank-1)*.07)};}
export function chaosOffer(w,p,slot=-1,rank=1){
 const known=new Set(p.abilities.map(s=>s.id)),pool=CHAOS_ABILITIES.filter(s=>!known.has(s.id)&&!w.bans.abilities.includes(s.id));const offer=[];
 while(offer.length<16&&pool.length){const total=pool.reduce((n,s)=>n+(s.owner===p.hero?CHAOS_NATIVE_WEIGHT:1),0);let roll=arcadeRandom(w)*total,index=0;for(;index<pool.length-1;index++){roll-=pool[index].owner===p.hero?CHAOS_NATIVE_WEIGHT:1;if(roll<0)break;}offer.push(pool.splice(index,1)[0].id);}
 p.offer=offer;p.offerSlot=slot;p.offerRank=rank;return offer;
}
function acAlive(p){return p.hp>0&&p.respawn<=0&&!p.eliminated&&!p.failedRound;}
function acUnit(w,id){return w.players[id]||w.enemies.find(e=>e.id===id)||w.summons.find(e=>e.id===id);}
function acOwner(w,u){return w.players[u.owner||u.id];}
function acEnemies(w,p){if(w.mode==='pudge')return Object.values(w.players).filter(e=>e.team!==p.team&&acAlive(e));if(w.phase==='duel'&&w.duel?.ids.includes(p.id)){const other=w.duel.ids.find(id=>id!==p.id);return [...(acAlive(w.players[other])?[w.players[other]]:[]),...w.summons.filter(s=>s.hp>0&&s.owner===other)];}return [...w.enemies.filter(e=>e.hp>0&&e.owner===p.id),...w.summons.filter(s=>s.hp>0&&s.enemyTo===p.id)];}
function acAllies(w,p){return [p,...w.summons.filter(s=>s.hp>0&&s.owner===p.id&&!s.enemyTo)];}
function acAim(p,a={}){if(a.x===undefined&&a.y===undefined)return true;if(!Number.isFinite(a.x)||!Number.isFinite(a.y))return false;p.aimX=acClamp(a.x,-100,5200);p.aimY=acClamp(a.y,-100,2000);return true;}
function acDirection(p){const dx=p.aimX-p.x,dy=p.aimY-p.y,len=Math.hypot(dx,dy);return len>.001?{x:dx/len,y:dy/len}:{x:1,y:0};}
function acPoint(w,p,range=700){const b=arcadeBounds(w,p),dx=p.aimX-p.x,dy=p.aimY-p.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,range/d);return {x:acClamp(p.x+dx*k,b.x+28,b.x+b.w-28),y:acClamp(p.y+dy*k,b.y+28,b.y+b.h-28)};}
function acTarget(w,p,range=700,friendly=false){return (friendly?acAllies(w,p):acEnemies(w,p)).filter(e=>e.hp>0&&!(e.statuses.ghost_walk>0)&&acDist(p,e)<=range&&Math.hypot(e.x-p.aimX,e.y-p.aimY)<(e.boss?90:65)).sort((a,b)=>acDist(a,{x:p.aimX,y:p.aimY})-acDist(b,{x:p.aimX,y:p.aimY}))[0];}
function acCanAct(w,p){return w.started&&!w.gameOver&&acAlive(p)&&!p.paused&&!(p.statuses.stun>0||p.statuses.hex>0||p.statuses.lift>0||p.statuses.fear>0||p.frozen)&&!p.pullBy;}
function acMoveTo(w,p,x,y){const b=arcadeBounds(w,p);if(w.mode==='pudge'){const left=p.x<PW_ARENA.riverLeft,right=p.x>PW_ARENA.riverRight;p.moveX=acClamp(x,left?35:right?PW_ARENA.riverRight+20:35,left?PW_ARENA.riverLeft-20:right?1765:1765);p.moveY=acClamp(y,45,955);}else{p.moveX=acClamp(x,b.x+35,b.x+b.w-35);p.moveY=acClamp(y,b.y+35,b.y+b.h-35);}}
function acControl(w,target,data,source){if(target.hp<=0||target.spawnShield>0||target.statuses.invulnerable>0)return;const immune=target.statuses.bkb>0||target.statuses.rage>0||target.statuses.spin>0;if(immune&&!data.pierces)return;
 for(const key of ['slow','root','silence','disarm','blind','fear'])if(data[key]>0)target.statuses[key]=Math.max(target.statuses[key]||0,Math.min(key==='slow'?5:4,data[key]));
 if((data.stun>0||data.hex>0)&&!(target.controlGuard>0)){const duration=Math.min(1.8,data.stun||data.hex);target.statuses[data.hex>0?'hex':'stun']=duration;target.controlGuard=duration+1.2;}
 if(data.fear>0)target.fearSource=source;
 if(data.coldSnap){target.statuses.coldSnap=data.coldSnap;target.coldSource=source;}if(data.wounds){target.statuses.wounds=data.wounds;target.woundsSource=source;}
}
function acHeal(w,p,amount){if(!p||p.hp<=0||p.eliminated)return;const max=p.owner?p.maxHP:arcadeMaxHP(w,p),actual=Math.max(0,Math.min(max-p.hp,amount));p.hp+=actual;const owner=acOwner(w,p);if(owner)owner.healing+=actual;
 if(p.id&&p.tetherTarget&&p.statuses.tether>0){const ally=acUnit(w,p.tetherTarget);if(ally?.hp>0&&acDist(p,ally)<600)ally.hp=Math.min(ally.maxHP,ally.hp+actual*.65);}}
function acLevel(w,p,xp){if(!p)return;p.xp+=xp;while(p.xp>=100*Math.pow(p.level,.85)){p.xp-=Math.floor(100*Math.pow(p.level,.85));p.level++;p.points++;p.hookPoints++;if(p.hp>0)p.hp=Math.min(arcadeMaxHP(w,p),p.hp+90);arcadeEmit(w,'level',{player:p.id,level:p.level});}}
function acGold(p,amount){p.gold+=Math.round(amount);p.earned+=Math.round(amount);}
function acDeath(w,u,killer){
 const p=w.players[u.id],owner=w.players[killer];u.hp=0;
 if(!p){if(u.isCreep&&owner){acGold(owner,18+Math.floor(w.wave*.7));acLevel(w,owner,18+Math.floor(w.wave*.3));owner.creepKills++;if(arcadeRank(owner,'necromastery'))owner.stacks.souls=Math.min(30,1+(owner.stacks.souls||0));if(arcadeRank(owner,'flesh'))owner.stacks.flesh=Math.min(30,1+(owner.stacks.flesh||0));}arcadeEmit(w,'unit_death',{x:u.x,y:u.y,owner:killer,kind:u.kind});return;}
 p.deaths++;p.channel=null;p.channelLeft=0;p.pullBy=0;p.statuses={};p.shield=0;
 if(w.mode==='pudge'){
  p.respawn=4;p.hookCD=0;if(owner&&owner.team!==p.team){owner.kills++;w.score[owner.team]++;acGold(owner,140);acLevel(w,owner,140);for(const ally of Object.values(w.players))if(ally.team===owner.team&&ally.id!==owner.id)acGold(ally,25);for(const [id,at] of Object.entries(p.contributors))if(id!==owner.id&&w.seconds-at<10&&w.players[id]?.team===owner.team)w.players[id].assists++;}
  arcadeEmit(w,'kill',{killer,player:p.id,score:[...w.score],x:p.x,y:p.y});if(w.score.some(n=>n>=w.targetScore)){w.gameOver=true;w.phase='finished';w.winner=owner?.team??(w.score[0]>w.score[1]?0:1);arcadeEmit(w,'match_end',{winner:w.winner});}
 }else if(w.phase==='duel'&&w.duel?.ids.includes(p.id)){if(owner&&owner.id!==p.id)owner.kills++;w.duel.finished=true;w.duel.winner=w.duel.ids.find(id=>id!==p.id);arcadeEmit(w,'duel_hit',{killer,player:p.id});}
 else{
  p.lives=Math.max(0,p.lives-1);p.failedRound=true;p.cleared=true;p.eliminated=p.lives===0;w.enemies=w.enemies.filter(e=>e.owner!==p.id);w.summons=w.summons.filter(e=>e.owner!==p.id);arcadeEmit(w,'wave_failed',{player:p.id,lives:p.lives,wave:w.wave});if(p.eliminated){const alive=Object.values(w.players).filter(q=>!q.eliminated);if(alive.length===1){w.gameOver=true;w.phase='finished';w.winner=alive[0].id;arcadeEmit(w,'match_end',{winner:w.winner});}}
 }
}
export function arcadeDeal(w,source,target,amount,type='magic',options={}){
 if(w.gameOver||!target||target.hp<=0||target.invulnerable||target.spawnShield>0||target.statuses?.invulnerable>0||!Number.isFinite(amount)||amount<=0)return 0;
 const p=w.players[source],victim=w.players[target.id];target.statuses||={};
 if(type==='physical'){
  if(p?.statuses.blind>0&&arcadeRandom(w)<.75)return 0;
  const evasion=victim?Math.min(.4,arcadeRank(victim,'blur')*.06+(victim.statuses.blur>0?.15:0)):0;if(!(p?.statuses.take_aim>0)&&!options.ignoreArmor&&arcadeRandom(w)<evasion)return 0;
  let armor=target.armor||0;if(victim)armor+=arcadeHas(victim,'assault')?8:0;armor+=(target.stacks?.reactive||0)*.7;if(p&&arcadeRank(p,'presence')&&acDist(p,target)<600)armor-=2+arcadeRank(p,'presence')*1.5;if(!options.ignoreArmor)amount/=1+Math.max(-.3,armor*.04);
 }else if(type==='magic')amount*=target.magicResist??.8;
 if(type==='magic'&&(target.statuses.bkb>0||target.statuses.rage>0||target.statuses.spin>0))amount*=.3;
 if(victim&&arcadeRank(victim,'flesh')&&victim.hp<arcadeMaxHP(w,victim)*.4)amount=Math.max(1,amount-(4+arcadeRank(victim,'flesh')*3));
 if(target.statuses.golemDebuff>0)amount*=1.15;
 if(target.shield>0){const blocked=Math.min(target.shield,amount);target.shield-=blocked;amount-=blocked;}
 amount*=target.incomingMultiplier||1;
 const actual=Math.min(target.hp,Math.max(0,amount));if(!actual)return 0;target.hp-=actual;target.lastHurt=w.seconds;(target.contributors||={})[source]=w.seconds;
 if(p){p.damageDealt+=actual;if(options.spell){const leech=(arcadeHas(p,'octarine')?.1:0)+(arcadeHas(p,'bloodstone')?.12:0);if(leech)acHeal(w,p,actual*leech);}}
 if(victim){victim.damageTaken+=actual;victim.recentDamage.push({at:w.seconds,amount:actual});if(victim.recentDamage.length>120)victim.recentDamage.shift();if(arcadeRank(victim,'reactive')){victim.stacks.reactive=Math.min(12,(victim.stacks.reactive||0)+1);victim.statuses.reactive=8;}}
 const lethal=target.hp<=0;
 if(!lethal&&target.statuses.wounds>0&&p)acHeal(w,p,actual*.18);
 if(!lethal&&target.statuses.coldSnap>0&&!(target.coldTimer>0)&&!options.proc){target.coldTimer=.7;acControl(w,target,{stun:.25},target.coldSource);arcadeDeal(w,target.coldSource,target,25,'magic',{spell:true,proc:true});}
 if(!lethal&&victim&&victim.statuses.static>0&&!(victim.staticCD>0)&&p){victim.staticCD=.8;acLightning(w,victim,target===p?target:p,55+victim.level*6);}
 if(lethal){target.hp=0;acDeath(w,target,source);}else arcadeEmit(w,'damage',{source,target:target.id,x:target.x,y:target.y,amount:Math.round(actual),kind:options.kind||type});return actual;
}
function acLightning(w,p,first,power){let next=first;const used=new Set(),points=[];for(let i=0;i<3&&next;i++){used.add(next.id);points.push({x:next.x,y:next.y});arcadeDeal(w,p.id,next,power,'magic',{spell:true,proc:true,kind:'lightning'});next=acEnemies(w,p).filter(e=>!used.has(e.id)&&acDist(e,next)<350).sort((a,b)=>acDist(a,next)-acDist(b,next))[0];}arcadeEmit(w,'lightning',{player:p.id,x:p.x,y:p.y,points});}
function acAttackHit(w,p,target,scale=1){
 let power=arcadeAttack(w,p)*scale,crit=arcadeHas(p,'daedalus')?2:1;
 for(const s of p.abilities){const d=CHAOS_SKILL_BY_ID[s.id];if(d.kind==='crit'&&arcadeRandom(w)<(d.chance||.2))crit=Math.max(crit,1+d.power+s.rank*.25);}
 if(arcadeHas(p,'daedalus')&&arcadeRandom(w)>=.25&&crit===2)crit=1;power*=crit;
 const marksman=arcadeRank(p,'marksmanship')&&acDist(p,target)>230&&arcadeRandom(w)<.3;if(marksman)power*=1.15+arcadeRank(p,'marksmanship')*.1;
 if(p.statuses.frost>0&&p.mana>=5){p.mana-=5;power*=1.2;acControl(w,target,{slow:2},p.id);}
 const dealt=arcadeDeal(w,p.id,target,power,'physical',{kind:crit>1?'crit':'attack',ignoreArmor:!!marksman});if(!dealt)return;
 const feast=arcadeRank(p,'feast');if(feast){const extra=Math.min(target.maxHP||1000,arcadeMaxHP(w,p))*.004*feast;arcadeDeal(w,p.id,target,extra,'physical',{proc:true});acHeal(w,p,Math.min(power*.5,extra+dealt*.08));}
 if(arcadeRank(p,'headshot')&&arcadeRandom(w)<(p.statuses.take_aim>0?.6:.25)){arcadeDeal(w,p.id,target,40+arcadeRank(p,'headshot')*20,'physical',{proc:true});acControl(w,target,{slow:.6},p.id);const d=acDist(p,target)||1;target.x+=(target.x-p.x)/d*18;target.y+=(target.y-p.y)/d*18;}
 if(arcadeRank(p,'time_lock')&&!(p.bashCD>0)&&arcadeRandom(w)<.2){p.bashCD=1.7;arcadeDeal(w,p.id,target,35+arcadeRank(p,'time_lock')*18,'magic',{proc:true});acControl(w,target,{stun:.45},p.id);}
 if(p.statuses.empower>0)for(const other of acEnemies(w,p))if(other.id!==target.id&&acDist(other,target)<130)arcadeDeal(w,p.id,other,power*.35,'physical',{proc:true});
 if((arcadeHas(p,'maelstrom')||arcadeHas(p,'mjollnir'))&&!(p.lightningCD>0)&&arcadeRandom(w)<.25){p.lightningCD=.4;acLightning(w,p,target,(arcadeHas(p,'mjollnir')?95:65)+p.level*5);}
 if(p.statuses.golem>0)target.statuses.golemDebuff=4;
 if(target.statuses.tazer>0)acControl(w,p,{disarm:1.5},target.id);
 if(crit>1)arcadeEmit(w,'crit',{player:p.id,x:target.x,y:target.y,power:Math.round(dealt)});
}
function acProjectile(w,p,data={}){if(w.projectiles.length>=300)return;const dir=acDirection(p),speed=data.speed||650,range=data.range||arcadeRange(w,p)+80;w.projectiles.push({id:w.nextId++,owner:p.id,x:p.x,y:p.y,vx:dir.x*speed,vy:dir.y*speed,rangeLeft:range,radius:10,kind:'attack',damage:arcadeAttack(w,p),type:'physical',pierce:0,hitIds:[],...data});}
export function arcadeSweep(ax,ay,bx,by,cx,cy,r){const dx=bx-ax,dy=by-ay,ox=ax-cx,oy=ay-cy,a=dx*dx+dy*dy,c=ox*ox+oy*oy-r*r;if(c<=0)return 0;if(a<1e-10)return null;const b=2*(ox*dx+oy*dy),d=b*b-4*a*c;if(d<0)return null;const t=(-b-Math.sqrt(d))/(2*a);return t>=0&&t<=1?t:null;}
function acZone(w,p,kind,point,data={}){if(w.zones.length>=100)return;w.zones.push({id:w.nextId++,owner:p.id,kind,x:point.x,y:point.y,radius:180,left:3,delay:0,tick:0,...data});}
function acSummon(w,p,kind,data={}){if(w.summons.filter(s=>s.owner===p.id&&s.hp>0).length>=10||w.summons.length>=100)return null;const angle=arcadeRandom(w)*Math.PI*2,b=arcadeBounds(w,p),hp=200+p.level*30;const s={id:w.nextId++,owner:p.id,kind,x:acClamp(p.x+Math.cos(angle)*65,b.x+30,b.x+b.w-30),y:acClamp(p.y+Math.sin(angle)*65,b.y+30,b.y+b.h-30),hp,maxHP:hp,damage:arcadeAttack(w,p)*.35,life:15,attackCD:.3,move:180,range:150,statuses:{},stacks:{},controlGuard:0,contributors:{},...data};w.summons.push(s);return s;}
function acArea(w,p,point,radius,power,type='magic',control={}){for(const e of acEnemies(w,p))if(acDist(e,point)<=radius){arcadeDeal(w,p.id,e,power,type,{spell:true,kind:control.kind});acControl(w,e,control,p.id);}}
function acChannel(w,p,kind,s,extra={}){p.channel={kind,skill:s.id,power:s.power,range:s.range,radius:s.radius,...extra};p.channelLeft=s.duration;p.moveX=p.x;p.moveY=p.y;p.walkUntil=0;}
function acCast(w,p,id,action={},repeated=false){
 const s=arcadeSpellStats(w,p,id);if(!s||!arcadeRank(p,id))return {ok:false,message:'This spell is not learned'};
 if(s.passive)return {ok:false,message:'This is a passive ability'};
 if(!acCanAct(w,p)||p.statuses.silence>0||p.channel||!['wave','duel'].includes(w.phase))return {ok:false,message:'Cannot cast right now'};
 if(!repeated&&(p.cd[id]||0)>0)return {ok:false,message:'Spell is on cooldown'};
 if(!acAim(p,action))return {ok:false,message:'Invalid aim'};
 const mana=s.kind==='unrefined'?Math.ceil(p.mana*.35):s.mana;if(!repeated&&p.mana<mana)return {ok:false,message:'Not enough mana'};
 const point=acPoint(w,p,s.range),dir=acDirection(p),enemies=acEnemies(w,p);let target=acTarget(w,p,s.range);
 const needsTarget=['beam','ignite','unrefined','lift','chain','root','hex','mana_drain','finger','laguna','phantom_strike','sunder','dismember','wounds','malefice','cold_snap','shackles','omnislash','steal','snipe'];
 if(needsTarget.includes(s.kind)&&!target)return {ok:false,message:'Aim directly at an enemy in range'};
 if(s.kind==='steal'&&!CHAOS_SKILL_BY_ID[target.lastSpell])return {ok:false,message:'The target has not cast a stealable spell'};
 if(s.kind==='invoke'&&(p.orbs.length<3||!CHAOS_INVOKES[[...p.orbs].sort().join('')]))return {ok:false,message:'Cast three learned Quas / Wex / Exort orbs first'};
 if(s.kind==='tether'){target=acTarget(w,p,600,true);if(!target||target.id===p.id)return {ok:false,message:'Tether needs a friendly summon under the cursor'};}
 if(s.kind==='infest'){target=acAllies(w,p).find(u=>u.id!==p.id&&acDist(p,u)<500);if(!target)return {ok:false,message:'Infest requires your own nearby summon'};}
 if(!repeated){p.mana-=mana;p.cd[id]=s.cd;}if(s.kind!=='ghost_walk')p.statuses.ghost_walk=0;p.lastSpell=id;p.lastSpellAt=w.seconds;
 const power=s.power;
 switch(s.kind){
  case 'beam':arcadeDeal(w,p.id,target,power,'pure',{spell:true});acControl(w,target,{blind:2},p.id);break;
  case 'bolt':case 'missile':case 'dagger':case 'fire_wave':case 'spikes':case 'shockwave':case 'tornado':case 'deafening':case 'fan':{
   const count=s.kind==='fan'?Math.min(11,s.count+Math.floor(s.rank/2)):1,angle=Math.atan2(dir.y,dir.x);
   for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*.075,speed=s.speed||600;acProjectile(w,p,{kind:s.kind,skill:id,type:s.kind==='dagger'?'physical':'magic',damage:power,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,rangeLeft:s.range,radius:s.radius<100?s.radius:12,pierce:s.pierce||0,spell:true,stun:s.stun||0,slow:s.slow||(['shockwave','fan','tornado'].includes(s.kind)?2:0),disarm:s.kind==='deafening'?2:0,knock:s.kind==='deafening'?80:s.kind==='shockwave'?-30:0});}break;
  }
  case 'robots':case 'shrapnel':case 'ice_wall':case 'midnight':case 'meteor':acZone(w,p,s.kind,point,{radius:s.radius,left:s.duration,power,skill:id,dirX:dir.x,dirY:dir.y});break;
  case 'shield':{const ally=acTarget(w,p,s.range,true)||p;ally.shield=Math.max(ally.shield,power);ally.statuses.shield=s.duration;break;}
  case 'rearm':acChannel(w,p,'rearm',s);break;
  case 'turret':acSummon(w,p,'turret',{...point,damage:power,range:560,move:0,life:s.duration});break;
  case 'ignite':acZone(w,p,'ignite',{x:target.x,y:target.y},{target:target.id,radius:40,left:s.duration,power,skill:id});acControl(w,target,{slow:3},p.id);break;
  case 'bloodlust':for(const ally of acAllies(w,p))if(acDist(p,ally)<500)ally.statuses.bloodlust=s.duration;break;
  case 'unrefined':arcadeDeal(w,p.id,target,power*(.5+mana/100),'magic',{spell:true});acControl(w,target,{stun:1.1},p.id);break;
  case 'reflection':for(const e of enemies.filter(e=>acDist(e,point)<250).slice(0,4)){acSummon(w,p,'reflection',{x:e.x+30,y:e.y,forcedTarget:e.id,damage:arcadeAttack(w,p)*Math.min(.6,.2+s.rank*.08),life:s.duration,invulnerable:true,range:150});acControl(w,e,{slow:s.duration},p.id);}break;
  case 'illusion':acSummon(w,p,'illusion',{damage:arcadeAttack(w,p)*Math.min(.6,.25+s.rank*.07),life:s.duration,hero:p.hero,range:arcadeRange(w,p),hp:arcadeMaxHP(w,p)*.4,maxHP:arcadeMaxHP(w,p)*.4,incomingMultiplier:2});break;
  case 'metamorphosis':p.statuses.metamorphosis=s.duration;for(const ally of acAllies(w,p))if(ally.kind==='illusion')ally.statuses.metamorphosis=s.duration;break;
  case 'sunder':{const th=target.maxHP||arcadeMaxHP(w,target),ph=arcadeMaxHP(w,p),a=p.hp/ph,b=target.hp/th;if(target.boss){const transfer=Math.min(th*.08,Math.max(0,(b-a)*ph));arcadeDeal(w,p.id,target,transfer,'pure',{spell:true});acHeal(w,p,transfer);}else{const old=target.hp;target.hp=Math.max(th*.18,Math.min(th,th*a));p.hp=Math.max(ph*.18,Math.min(ph,ph*b));if(old>target.hp)p.damageDealt+=old-target.hp;}break;}
  case 'hook':acLaunchHook(w,p,{damage:power,range:s.range,speed:s.speed,radius:20,chaos:true});break;
  case 'rot':p.statuses.rot=p.statuses.rot>0?0:1e6;break;
  case 'dismember':case 'shackles':case 'mana_drain':acChannel(w,p,s.kind,s,{target:target.id,tick:0});break;
  case 'raze':acZone(w,p,'burst',{x:p.x+dir.x*s.range,y:p.y+dir.y*s.range},{radius:s.radius,left:1,delay:.4,power,skill:id,oneShot:true});break;
  case 'requiem':acChannel(w,p,'requiem',s);break;
  case 'lift':target.statuses.lift=1.1;acZone(w,p,'burst',{x:target.x,y:target.y},{target:target.id,left:1.5,delay:1.1,power,radius:160,stun:.6,skill:id,oneShot:true});break;
  case 'chain':case 'wrath':case 'ether':{
   let next=target||enemies.filter(e=>acDist(p,e)<s.range).sort((a,b)=>acDist(a,point)-acDist(b,point))[0];const used=new Set(),points=[];
   for(let i=0;i<(s.count||4)&&next;i++){used.add(next.id);points.push({x:next.x,y:next.y});arcadeDeal(w,p.id,next,power*(s.kind==='wrath'?1+i*.12:Math.pow(.9,i)),'magic',{spell:true});if(s.kind==='chain')next.statuses.weaken=4;next=enemies.filter(e=>e.hp>0&&!used.has(e.id)&&acDist(e,next)<(s.kind==='wrath'?1200:350)).sort((a,b)=>acDist(a,next)-acDist(b,next))[0];}arcadeEmit(w,'lightning',{player:p.id,x:p.x,y:p.y,points});break;
  }
  case 'steal':p.stolen={id:target.lastSpell,rank:Math.min(s.rank,CHAOS_SKILL_BY_ID[target.lastSpell].maxRank),left:60};break;
  case 'whirling':acArea(w,p,p,s.radius,power,'pure',{kind:'saw'});for(const e of enemies)if(acDist(p,e)<s.radius)e.statuses.weaken=4;break;
  case 'chain_dash':case 'skewer':{
   const from={x:p.x,y:p.y};p.x=point.x;p.y=point.y;acMoveTo(w,p,p.x,p.y);
   for(const e of enemies)if(arcadeSweep(from.x,from.y,point.x,point.y,e.x,e.y,65)!==null){arcadeDeal(w,p.id,e,power,'pure',{spell:true});if(s.kind==='skewer'){e.x=point.x+dir.x*40;e.y=point.y+dir.y*40;acControl(w,e,{slow:2},p.id);}}
   arcadeEmit(w,'dash',{player:p.id,from,to:point,skill:id});break;
  }
  case 'chakram':acProjectile(w,p,{kind:'chakram',skill:id,damage:power,spell:true,type:'pure',rangeLeft:acDist(p,point),destination:point,radius:22,zoneDuration:s.duration,zoneRadius:s.radius,pierce:8});break;
  case 'frost':p.statuses.frost=p.statuses.frost>0?0:1e6;break;
  case 'gust':for(const e of enemies){const ex=e.x-p.x,ey=e.y-p.y,d=Math.hypot(ex,ey)||1;if(d<s.range&&(ex*dir.x+ey*dir.y)/d>.7){arcadeDeal(w,p.id,e,power,'magic',{spell:true});acControl(w,e,{silence:s.duration},p.id);e.x+=dir.x*90;e.y+=dir.y*90;}}break;
  case 'take_aim':p.statuses.take_aim=s.duration;break;
  case 'snipe':acChannel(w,p,'snipe',s,{aimX:p.aimX,aimY:p.aimY});break;
  case 'nova':acArea(w,p,point,s.radius,power,'magic',{slow:3,kind:'frost'});break;
  case 'root':acControl(w,target,{root:s.duration},p.id);acZone(w,p,'ignite',target,{target:target.id,radius:35,left:s.duration,power,skill:id});break;
  case 'freezing':acChannel(w,p,'freezing',s,{tick:0});break;
  case 'hex':acControl(w,target,{hex:s.duration},p.id);break;
  case 'finger':arcadeDeal(w,p.id,target,power+Math.min(15,p.stacks.finger||0)*25,'magic',{spell:true});if(target.hp<=0&&w.players[target.id])p.stacks.finger=(p.stacks.finger||0)+1;break;
  case 'laguna':arcadeDeal(w,p.id,target,power,'magic',{spell:true});break;
  case 'stun_area':case 'sticky':case 'sun_strike':case 'emp':acZone(w,p,'burst',point,{radius:s.radius,left:s.delay+1,delay:s.delay,power,skill:id,oneShot:true,stun:s.stun||0,manaBurn:s.kind==='emp',pure:s.kind==='sun_strike',slow:s.kind==='sticky'?2:0});break;
  case 'spin':p.statuses.spin=s.duration;p.spinPower=power;p.spinTick=0;break;
  case 'healing_ward':acSummon(w,p,'healing_ward',{...point,hp:60,maxHP:60,life:s.duration,move:0,range:0,damage:0,heal:.015+s.rank*.003});break;
  case 'omnislash':p.statuses.invulnerable=Math.min(3,1.2+s.rank*.3);p.omniTarget=target.id;for(let i=0;i<Math.min(10,6+s.rank);i++)w.pending.push({at:w.seconds+i*.22,kind:'slash',owner:p.id,target:target.id,power:arcadeAttack(w,p)*1.15});break;
  case 'phantom_strike':{const b=arcadeBounds(w,p);p.x=acClamp(target.x-dir.x*70,b.x+35,b.x+b.w-35);p.y=acClamp(target.y-dir.y*70,b.y+35,b.y+b.h-35);acMoveTo(w,p,p.x,p.y);p.statuses.phantomStrike=s.duration;break;}
  case 'blur':p.statuses.blur=s.duration;break;
  case 'time_walk':{const heal=p.recentDamage.filter(h=>w.seconds-h.at<=2).reduce((n,h)=>n+h.amount,0);p.x=point.x;p.y=point.y;acMoveTo(w,p,p.x,p.y);acHeal(w,p,heal);p.recentDamage=[];break;}
  case 'dilation':for(const e of enemies)if(acDist(p,e)<s.radius){acControl(w,e,{slow:s.duration},p.id);if(w.players[e.id])for(const key of Object.keys(e.cd))if(e.cd[key]>0)e.cd[key]=Math.min(60,e.cd[key]+2+s.rank);}break;
  case 'chrono':acZone(w,p,'chrono',point,{radius:s.radius,left:s.duration+.45,delay:.45,skill:id});break;
  case 'malefice':for(let i=0;i<3;i++)w.pending.push({at:w.seconds+i*1.25,kind:'malefice',owner:p.id,target:target.id,power});break;
  case 'eidolons':case 'treants':case 'forge':{
   for(let i=0;i<Math.min(4,(s.count||2)+Math.floor(s.rank/3));i++)acSummon(w,p,s.kind,{damage:arcadeAttack(w,p)*Math.min(.7,.3+s.rank*.05)*(arcadeHas(p,'assault')?1.2:1)*(arcadeHas(p,'shard')?1.12:1),life:s.duration,range:s.kind==='treants'?140:420,attacks:0});break;
  }
  case 'black_hole':acChannel(w,p,'black_hole',s,{x:point.x,y:point.y,tick:0});break;
  case 'sprout':acZone(w,p,'sprout',point,{radius:s.radius,left:s.duration,power,skill:id});break;
  case 'teleport':acChannel(w,p,'teleport',s,{x:point.x,y:point.y});break;
  case 'rage':p.statuses.rage=s.duration;break;
  case 'wounds':acControl(w,target,{slow:s.duration,wounds:s.duration},p.id);break;
  case 'infest':acChannel(w,p,'infest',s,{target:target.id});p.statuses.invulnerable=s.duration;break;
  case 'decay':{let count=0;for(const e of enemies)if(acDist(e,point)<s.radius){count++;arcadeDeal(w,p.id,e,power,'magic',{spell:true});e.statuses.weaken=8;}const old=arcadeMaxHP(w,p);p.stacks.decay=Math.min(20,(p.stacks.decay||0)+count);p.statuses.decay=s.duration;p.hp+=arcadeMaxHP(w,p)-old;break;}
  case 'soul_rip':{const n=Math.min(10,acAllies(w,p).length+enemies.filter(e=>acDist(p,e)<450).length);if(target)arcadeDeal(w,p.id,target,power*Math.max(2,n),'magic',{spell:true});else acHeal(w,p,power*Math.max(2,n));break;}
  case 'tombstone':acSummon(w,p,'tombstone',{...point,hp:320+p.level*12,maxHP:320+p.level*12,damage:0,move:0,life:s.duration,zombieCD:0});break;
  case 'golem':{const old=arcadeMaxHP(w,p);p.statuses.golem=s.duration;p.hp+=arcadeMaxHP(w,p)-old;break;}
  case 'tazer':p.statuses.tazer=s.duration;p.tazerPower=power;break;
  case 'blast_off':p.hp=Math.max(1,p.hp-arcadeMaxHP(w,p)*.12);p.x=point.x;p.y=point.y;acMoveTo(w,p,p.x,p.y);acArea(w,p,point,s.radius,power,'magic',{silence:2.5,kind:'bomb'});break;
  case 'mines':{const mines=w.summons.filter(u=>u.owner===p.id&&u.kind==='mine'&&u.hp>0);if(mines.length>=4)mines[0].hp=0;acSummon(w,p,'mine',{...point,hp:100,maxHP:100,damage:power,move:0,life:30,arm:1.5,range:0,radius:s.radius});break;}
  case 'tether':p.tetherTarget=target.id;p.statuses.tether=s.duration;break;
  case 'spirits':p.statuses.spirits=s.duration;p.spiritPower=power;p.spirits=Math.min(7,4+s.rank);p.spiritCD=0;break;
  case 'overcharge':p.statuses.overcharge=s.duration;{const ally=acUnit(w,p.tetherTarget);if(ally?.hp>0&&p.statuses.tether>0)ally.statuses.overcharge=s.duration;}break;
  case 'relocate':p.relocateFrom={x:p.x,y:p.y};p.statuses.relocate=s.duration;p.x=point.x;p.y=point.y;acMoveTo(w,p,p.x,p.y);{const ally=acUnit(w,p.tetherTarget);if(ally?.hp>0&&p.statuses.tether>0){ally.x=p.x+25;ally.y=p.y;}}break;
  case 'empower':for(const ally of acAllies(w,p))ally.statuses.empower=s.duration;break;
  case 'rp':for(const e of enemies)if(acDist(p,e)<s.radius){arcadeDeal(w,p.id,e,power,'magic',{spell:true});e.x=p.x+dir.x*60;e.y=p.y+dir.y*60;acControl(w,e,{stun:Math.min(1.8,1.2+s.rank*.2)},p.id);}break;
  case 'wards':for(let i=0;i<Math.min(7,4+s.rank);i++)acSummon(w,p,'ward',{x:point.x+Math.cos(i*1.26)*70,y:point.y+Math.sin(i*1.26)*70,hp:100,maxHP:100,damage:power,move:0,range:470,life:s.duration});break;
  case 'quas':case 'wex':case 'exort':p.orbs.push(s.kind==='quas'?'q':s.kind==='wex'?'w':'e');if(p.orbs.length>3)p.orbs.shift();break;
  case 'invoke':{const invoked=CHAOS_INVOKES[[...p.orbs].sort().join('')];p.invoked=[{id:invoked},...p.invoked.filter(x=>x.id!==invoked)].slice(0,2);break;}
  case 'cold_snap':acControl(w,target,{coldSnap:s.duration},p.id);break;
  case 'ghost_walk':p.statuses.ghost_walk=s.duration;break;
  case 'alacrity':p.statuses.alacrity=s.duration;break;
  default:throw Error('Unimplemented active spell: '+s.kind);
 }
 if(arcadeRank(p,'fiery_soul')&&!['quas','wex','exort','invoke'].includes(s.kind)){p.stacks.fiery=Math.min(5,(p.stacks.fiery||0)+1);p.statuses.fiery=8;}
 arcadeEmit(w,'cast',{player:p.id,skill:id,x:p.x,y:p.y,toX:point.x,toY:point.y,target:target?.id,power:Math.round(power),repeat:repeated});
 const multi=arcadeRank(p,'multicast'),excluded=['rearm','invoke','quas','wex','exort','sunder','rot','frost','metamorphosis','infest','relocate','spirits','tether'];
 if(!repeated&&multi&&!s.ultimate&&!excluded.includes(s.kind)&&arcadeRandom(w)<.15+multi*.1){const count=arcadeRandom(w)<.15?4:arcadeRandom(w)<.35?3:2;for(let i=1;i<count;i++)w.pending.push({at:w.seconds+i*.22,kind:'multicast',owner:p.id,skill:id,x:p.aimX,y:p.aimY});arcadeEmit(w,'multicast',{player:p.id,count,x:p.x,y:p.y});}
 return {ok:true};
}
function acLaunchHook(w,p,data={}){
 if(w.hooks.some(h=>h.owner===p.id))return false;const dir=acDirection(p),speed=data.speed||800+p.hookSpeed*65;
 w.hooks.push({id:w.nextId++,owner:p.id,x:p.x,y:p.y,vx:dir.x*speed,vy:dir.y*speed,speed,range:data.range||850+p.hookRange*70,radius:data.radius||20+p.hookRadius*3,damage:data.damage||245+p.hookDamage*32,travel:0,returning:false,target:null,...data});p.hooksThrown++;return true;
}
function acChooseHero(w,p,hero){if(p.hero)return {ok:false,message:'Hero is already locked'};if(!p.heroOptions.includes(hero)||w.bans.heroes.includes(hero))return {ok:false,message:'Choose one of your four offered heroes'};p.hero=hero;p.hp=arcadeMaxHP(w,p);p.mana=arcadeMaxMana(w,p);p.points=1;chaosOffer(w,p);arcadeEmit(w,'hero_pick',{player:p.id,hero});return {ok:true};}
function acLearn(w,p,id){if(!p.offer.includes(id)||!CHAOS_SKILL_BY_ID[id]||p.abilities.some(s=>s.id===id))return {ok:false,message:'Choose a spell from your current offer'};const rank=Math.min(p.offerRank||1,CHAOS_SKILL_BY_ID[id].maxRank),slot=p.offerSlot;
 if(slot>=0){if(!p.abilities[slot])return {ok:false,message:'Replacement slot is no longer available'};delete p.cd[p.abilities[slot].id];p.abilities[slot]={id,rank};}
 else{if(p.abilities.length>=p.skillSlots)return {ok:false,message:'All skill slots are occupied'};p.abilities.push({id,rank});p.picks++;}
 p.offer=[];p.offerSlot=-1;p.offerRank=1;arcadeEmit(w,'learn',{player:p.id,skill:id,rank});return {ok:true};}
function acAutoDraft(w,p){if(!p.hero)acChooseHero(w,p,acPick(w,p.heroOptions));if(p.offer.length){const scored=p.offer.map(id=>{const s=CHAOS_SKILL_BY_ID[id];return {id,score:(!s.passive&&!['quas','wex','exort','invoke','tether','relocate','teleport','mana_drain','infest'].includes(s.kind)?2:0)+(s.owner===p.hero?1.1:0)+(['fan','robots','shrapnel','spin','reactive','mana_aura','eidolons','treants','decay','malefice','mines'].includes(s.kind)?2:0)+arcadeRandom(w)};}).sort((a,b)=>b.score-a.score);acLearn(w,p,scored[0].id);}}
export function startArcade(w,humanIds=[]){
 if(w.gameOver)return {ok:false,message:'Start a new match'};if(w.started)return {ok:false,message:'The match has already started'};
 if(w.mode==='chaos'){
  const unfinished=humanIds.map(id=>w.players[id]).filter(p=>p&&(!p.hero||!p.abilities.length));if(unfinished.length)return {ok:false,message:'Players are still choosing a hero / first ability: '+unfinished.map(p=>p.name).join(', ')};
  for(const p of Object.values(w.players))if(!humanIds.includes(p.id))acAutoDraft(w,p);
  w.started=true;if(w.resumeDuel){w.duel={ids:w.resumeDuel,round:w.wave,finished:false,winner:null,backup:{},pools:{}};delete w.resumeDuel;w.phase='duel_prep';w.phaseTime=15;return {ok:true};}if(w.resumeWave){w.wave=Math.max(0,w.wave-1);delete w.resumeWave;}acBeginWave(w);
 }else{w.started=true;w.phase='combat';w.phaseTime=0;for(const p of Object.values(w.players))p.spawnShield=2;arcadeEmit(w,'pudge_start',{target:w.targetScore});}
 return {ok:true};
}
export function arcadeItemCost(w,p,id){const catalog=w.mode==='pudge'?ARCADE_PW_ITEMS:ARCADE_ITEMS,item=catalog.find(i=>i.id===id);if(!item)return Infinity;return id==='mjollnir'&&arcadeHas(p,'maelstrom')?item.cost-1700:item.cost;}
function acBuy(w,p,id,slot){
 const catalog=w.mode==='pudge'?ARCADE_PW_ITEMS:ARCADE_ITEMS,item=catalog.find(i=>i.id===id);if(!item)return {ok:false,message:'Unknown item'};
 if(w.gameOver||p.eliminated)return {ok:false,message:'You are spectating'};if(w.phase==='duel'&&w.duel.ids.includes(p.id))return {ok:false,message:'Duelists cannot shop during the fight'};
 if(p.offer.length&&item.kind==='token')return {ok:false,message:'Finish the current skill choice first'};
 if(item.kind!=='token'&&arcadeHas(p,id))return {ok:false,message:'Item already owned'};
 const cost=arcadeItemCost(w,p,id);if(p.gold<cost)return {ok:false,message:'Not enough gold'};
 if(item.kind==='token'){
  if(id==='sixth_slot'){if(p.skillSlots>=6)return {ok:false,message:'Six slots are already unlocked'};if(p.abilities.length<5)return {ok:false,message:'Finish your five normal picks first'};p.skillSlots=6;chaosOffer(w,p);}
  else{if(!p.abilities.length)return {ok:false,message:'No skill to replace'};const index=id==='random_token'?Math.floor(arcadeRandom(w)*p.abilities.length):Number(slot);if(!Number.isInteger(index)||!p.abilities[index])return {ok:false,message:'Choose a learned skill to replace'};chaosOffer(w,p,index,p.abilities[index].rank);}
 }else{
  if(p.items.length>=6&&!(id==='mjollnir'&&arcadeHas(p,'maelstrom')))return {ok:false,message:'Inventory has six equipment slots'};
  const max=arcadeMaxHP(w,p);if(id==='mjollnir')p.items=p.items.filter(i=>i!=='maelstrom');p.items.push(id);if(p.hp>0)p.hp+=arcadeMaxHP(w,p)-max;
 }
 p.gold-=cost;p.spent+=cost;arcadeEmit(w,'buy',{player:p.id,item:id});return {ok:true};
}
function acItem(w,p,id,a){
 if(!arcadeHas(p,id)||!acCanAct(w,p))return {ok:false,message:'Item cannot be used now'};if((p.itemCD[id]||0)>0)return {ok:false,message:'Item is on cooldown'};
 if(w.mode==='pudge'){
  if(id==='shield'){p.statuses.hookShield=4;p.itemCD[id]=22;}
  else if(id==='blink'){if(!acAim(p,a))return {ok:false,message:'Invalid aim'};const pt=acPoint(w,p,260);acMoveTo(w,p,pt.x,pt.y);p.x=p.moveX;p.y=p.moveY;p.itemCD[id]=14;}
  else return {ok:false,message:'Passive item'};
 }else{
  if(!['wave','duel'].includes(w.phase))return {ok:false,message:'Wait for combat'};
  if(id==='bkb'){p.statuses.bkb=5;p.statuses.slow=0;p.statuses.root=0;p.itemCD[id]=35;}
  else if(id==='mjollnir'){p.statuses.static=8;p.itemCD[id]=24;}
  else return {ok:false,message:'Passive item'};
 }
 arcadeEmit(w,'item',{player:p.id,item:id,x:p.x,y:p.y});return {ok:true};
}
export function arcadeCommand(w,id,a){
 const p=w.players[id];if(!p||!a||typeof a!=='object')return {ok:false,message:'Unknown player'};
 if(a.type==='name'){if(typeof a.name!=='string')return {ok:false,message:'Invalid name'};p.name=a.name.trim().slice(0,24)||p.name;return {ok:true};}
 if(w.gameOver)return {ok:false,message:'The match is finished'};
 if(a.type==='choose_hero'&&w.mode==='chaos'&&!w.started)return acChooseHero(w,p,a.hero);
 if(a.type==='reroll_heroes'&&w.mode==='chaos'&&!w.started){if(p.hero||p.heroRerolled)return {ok:false,message:'Hero reroll already used or hero locked'};const keep=p.heroOptions[0],rest=acShuffle(w,CHAOS_HEROES.filter(h=>!p.heroOptions.includes(h.id)&&!w.bans.heroes.includes(h.id))).slice(0,3).map(h=>h.id);p.heroOptions=[keep,...rest];p.heroRerolled=true;return {ok:true};}
 if(p.eliminated)return {ok:false,message:'You are out of PVE lives'};
 if(a.type==='learn'&&w.mode==='chaos')return acLearn(w,p,a.skill);
 if(a.type==='buy')return acBuy(w,p,a.item,a.slot);
 if(a.type==='upgrade_skill'&&w.mode==='chaos'){
  const s=p.abilities.find(s=>s.id===a.skill),def=CHAOS_SKILL_BY_ID[a.skill];if(!s||!def||p.points<=0||s.rank>=def.maxRank)return {ok:false,message:'No skill point or maximum rank'};
  if(w.phase==='duel'&&w.duel.ids.includes(p.id))return {ok:false,message:'Upgrade before the duel begins'};
  if(def.ultimate&&p.level<(s.rank===1?6:12))return {ok:false,message:'Ultimate ranks 2/3 require level 6/12'};s.rank++;p.points--;return {ok:true};
 }
 if(a.type==='upgrade_hook'&&w.mode==='pudge'){
  const up=PUDGE_UPGRADES.find(u=>u.id===a.upgrade);if(!up||p[up.id]>=up.max)return {ok:false,message:'Maximum or unknown upgrade'};
  const cost=Math.ceil(up.base*Math.pow(1.3,p[up.id]));if(p.hookPoints>0)p.hookPoints--;else if(p.gold>=cost){p.gold-=cost;p.spent+=cost;}else return {ok:false,message:'Need an upgrade point or gold'};p[up.id]++;return {ok:true};
 }
 if(a.type==='bet'&&w.mode==='chaos'){
  if(w.phase!=='duel_prep'||!w.duel||w.duel.ids.includes(p.id)||w.bets[p.id])return {ok:false,message:'Spectators can place one bet during the 15-second countdown'};
  if(!w.duel.ids.includes(a.target)||!Number.isSafeInteger(a.amount)||a.amount<1||a.amount>Math.floor(p.gold/2))return {ok:false,message:'Bet up to half your current gold on a duelist'};
  p.gold-=a.amount;w.bets[p.id]={target:a.target,amount:a.amount};return {ok:true};
 }
 if(a.type==='pause'){p.paused=!!a.value;return {ok:true};}
 if(a.type==='aim')return acAim(p,a)?{ok:true}:{ok:false,message:'Invalid aim'};
 if(a.type==='item')return acItem(w,p,a.item,a);
 if(a.type==='cast'&&w.mode==='chaos')return acCast(w,p,a.skill,a);
 if(a.type==='move'||a.type==='walk'){
  if(!acCanAct(w,p)||w.mode==='chaos'&&!['wave','duel'].includes(w.phase))return {ok:false,message:'Cannot move now'};
  if(a.type==='walk'&&(!Number.isFinite(a.dx)||!Number.isFinite(a.dy)))return {ok:false,message:'Invalid direction'};
  if(a.type==='move'&&(!Number.isFinite(a.x)||!Number.isFinite(a.y)))return {ok:false,message:'Invalid point'};
  if(p.channel&&(a.type==='move'||a.dx||a.dy)){p.channel=null;p.channelLeft=0;arcadeEmit(w,'interrupted',{player:p.id});}
  if(a.type==='walk'){if(!Number.isFinite(a.dx)||!Number.isFinite(a.dy))return {ok:false,message:'Invalid direction'};const d=Math.max(1,Math.hypot(a.dx,a.dy));p.walkX=a.dx/d;p.walkY=a.dy/d;p.walkUntil=w.seconds+.4;acMoveTo(w,p,p.x,p.y);}
  else{if(!Number.isFinite(a.x)||!Number.isFinite(a.y))return {ok:false,message:'Invalid point'};acMoveTo(w,p,a.x,a.y);p.walkUntil=0;}return {ok:true};
 }
 if(a.type==='hook'&&w.mode==='pudge'){
  if(!acCanAct(w,p)||p.hookCD>0)return {ok:false,message:'Hook is not ready'};if(!acAim(p,a))return {ok:false,message:'Invalid aim'};if(!acLaunchHook(w,p))return {ok:false,message:'Your hook is still returning'};p.hookCD=1.9;arcadeEmit(w,'hook',{player:p.id,x:p.x,y:p.y});return {ok:true};
 }
 if(a.type==='attack'&&w.mode==='chaos'){
  if(!acCanAct(w,p)||!['wave','duel'].includes(w.phase)||p.attackCD>0||p.statuses.disarm>0||p.channel)return {ok:false,message:'Attack is not ready'};
  if(!acAim(p,a))return {ok:false,message:'Invalid aim'};p.statuses.ghost_walk=0;p.attackCD=1/arcadeAttackRate(w,p);acProjectile(w,p);return {ok:true};
 }
 return {ok:false,message:'Unknown action for this locked mode'};
}
export function chaosWaveRules(round){return {count:4+Math.min(10,Math.floor(round*.65)),hp:Math.floor(105*Math.pow(1+round*.2,1.4)*Math.pow(1.065,Math.max(0,round-15))),damage:Math.floor((9+round*2.1)*Math.pow(1.045,Math.max(0,round-15))),speed:Math.min(145,70+round*1.8),duration:Math.min(90,45+round*.7),boss:round%10===0};}
function acBeginWave(w){
 w.wave++;w.phase='wave';w.phaseTime=0;w.enemies=[];w.projectiles=[];w.zones=[];w.hooks=[];w.summons=[];w.pending=[];const rules=chaosWaveRules(w.wave);
 for(const p of Object.values(w.players)){
  if(p.eliminated)continue;p.failedRound=false;p.cleared=false;p.clearTime=0;p.roundElapsed=0;p.respawn=0;const b=arcadePen(p.seat);p.x=p.moveX=b.x+210;p.y=p.moveY=b.y+450;p.walkUntil=0;p.statuses={};p.shield=0;p.channel=null;p.hp=Math.min(arcadeMaxHP(w,p),Math.max(p.hp,arcadeMaxHP(w,p)*.35)+arcadeMaxHP(w,p)*.45);p.mana=Math.min(arcadeMaxMana(w,p),p.mana+arcadeMaxMana(w,p)*.5);p.spawnShield=1.5;
  const count=rules.boss?3:rules.count;
  for(let i=0;i<count;i++){
   const boss=rules.boss&&i===0,kind=boss?'ancient':['melee','ranged','wolf','satyr','golem','shaman'][(w.wave+i)%6],hp=Math.floor(rules.hp*(boss?7:kind==='golem'?1.8:kind==='wolf'?.7:1)),magicResist=w.wave%4===0?.6:.8,armor=w.wave%4===2?5:1;
   w.enemies.push({id:w.nextId++,owner:p.id,isCreep:true,boss,kind,x:b.x+650+(i%3)*55,y:b.y+190+(i*119)%510,hp,maxHP:hp,damage:rules.damage*(boss?2.2:kind==='wolf'?.8:1),speed:rules.speed*(kind==='wolf'?1.2:1),range:['ranged','satyr','shaman'].includes(kind)?330:80,mana:['satyr','shaman','golem'].includes(kind)?160:0,maxMana:160,attackCD:.8+i*.08,castCD:3+i*.3,magicResist,armor,statuses:{},stacks:{},controlGuard:0,contributors:{},lastSpell:null});
  }
 }
 arcadeEmit(w,'wave',{wave:w.wave,kind:w.wave%4===0?'magic_resist':w.wave%4===2?'armored':rules.boss?'boss':'mixed'});
}
function acRoundEnd(w){
 const survivors=Object.values(w.players).filter(p=>!p.eliminated);if(survivors.length<=1){w.gameOver=true;w.phase='finished';w.winner=survivors[0]?.id||w.lastSurvivor||Object.values(w.players).sort((a,b)=>b.clearedWaves-a.clearedWaves||b.damageDealt-a.damageDealt)[0].id;arcadeEmit(w,'match_end',{winner:w.winner});return;}
 w.lastSurvivor=survivors[0].id;
 for(const p of survivors){
  const gates=[0,1,3,5,8],unlocked=gates.filter(n=>w.wave>=n).length;
  if(!p.offer.length&&p.picks<Math.min(unlocked,p.skillSlots))chaosOffer(w,p);
  if(w.wave%10===0){const net=p.gold+p.spent,average=survivors.reduce((n,q)=>n+q.gold+q.spent,0)/survivors.length;if(net<average*.8&&!p.offer.length&&p.abilities.length){const weakest=p.abilities.reduce((a,s,i,arr)=>s.rank<arr[a].rank?i:a,0);chaosOffer(w,p,weakest,p.abilities[weakest].rank);arcadeEmit(w,'catchup',{player:p.id});}}
 }
 if(w.wave%2===0){
  const sorted=acShuffle(w,survivors).sort((a,b)=>a.duels-b.duels);let a=sorted[0],b=sorted.find(p=>p.id!==a.id&&!w.duelHistory.slice(-5).includes([p.id,a.id].sort().join(':')))||sorted[1];
  w.duel={ids:[a.id,b.id],round:w.wave,finished:false,winner:null,backup:{},pools:{}};w.bets={};w.phase='duel_prep';w.phaseTime=15;
  arcadeEmit(w,'duel_announced',{players:w.duel.ids,seconds:15});
 }else{w.phase='prep';w.phaseTime=8;arcadeEmit(w,'prep',{seconds:8});}
 w.enemies=[];w.projectiles=[];w.zones=[];w.summons=[];w.hooks=[];w.pending=[];
}
function acStartDuel(w){
 w.phase='duel';w.phaseTime=0;w.summons=[];w.projectiles=[];w.zones=[];w.pending=[];
 for(const [index,id] of w.duel.ids.entries()){
  const p=w.players[id];w.duel.backup[id]={x:p.x,y:p.y,hp:p.hp,mana:p.mana};p.failedRound=false;p.respawn=0;p.hp=arcadeMaxHP(w,p);p.mana=arcadeMaxMana(w,p);p.statuses={};p.shield=0;p.channel=null;p.spawnShield=.8;p.x=p.moveX=CHAOS_DUEL_ARENA.x+(index===0?280:920);p.y=p.moveY=CHAOS_DUEL_ARENA.y+500;p.aimX=CHAOS_DUEL_ARENA.x+(index===0?920:280);p.aimY=p.y;p.walkUntil=0;p.duels++;
 }
 arcadeEmit(w,'duel_start',{players:w.duel.ids});
}
function acEndDuel(w){
 const d=w.duel;if(!d)return;let winner=d.winner;
 if(!winner){const a=w.players[d.ids[0]],b=w.players[d.ids[1]],ap=a.hp/arcadeMaxHP(w,a),bp=b.hp/arcadeMaxHP(w,b);winner=Math.abs(ap-bp)<.02?null:ap>bp?a.id:b.id;}
 if(winner){const loser=d.ids.find(id=>id!==winner);w.players[winner].duelWins++;w.players[loser].duelLosses++;acGold(w.players[winner],220+w.wave*22);}
 const bets=Object.entries(w.bets),pot=bets.reduce((n,[,b])=>n+b.amount,0),winning=bets.filter(([,b])=>b.target===winner),winningSum=winning.reduce((n,[,b])=>n+b.amount,0);
 for(const [id,bet] of bets){const p=w.players[id];if(!winner)p.gold+=bet.amount;else if(bet.target===winner)acGold(p,Math.floor(pot*bet.amount/Math.max(1,winningSum)));}
 for(const id of d.ids){const p=w.players[id],back=d.backup[id];p.statuses={};p.channel=null;p.respawn=0;p.hp=Math.max(1,back.hp);p.mana=back.mana;p.x=p.moveX=back.x;p.y=p.moveY=back.y;p.walkUntil=0;}
 w.duelHistory.push([...d.ids].sort().join(':'));if(w.duelHistory.length>30)w.duelHistory.shift();arcadeEmit(w,'duel_end',{winner,players:d.ids,pot});w.duel=null;w.bets={};w.summons=[];w.projectiles=[];w.zones=[];w.pending=[];w.phase='prep';w.phaseTime=6;
}
function acTickHooks(w,dt){
 for(const h of w.hooks){const p=w.players[h.owner];if(!p){h.done=true;continue;}
  if(h.returning){const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy),travel=h.speed*1.2*dt;if(d<=travel+12){h.x=p.x;h.y=p.y;h.done=true;}else{h.x+=dx/d*travel;h.y+=dy/d*travel;}
   const target=acUnit(w,h.target);if(target?.hp>0){target.x=h.x;target.y=h.y;if(h.done){target.pullBy=0;if(w.mode==='pudge'){target.x=acClamp(target.x,p.x<900?35:1000,p.x<900?800:1765);target.moveX=target.x;target.moveY=target.y;}}}else if(target)target.pullBy=0;continue;
  }
  const travel=Math.min(h.range-h.travel,h.speed*dt),len=Math.hypot(h.vx,h.vy)||1,x=h.x+h.vx/len*travel,y=h.y+h.vy/len*travel;
  const units=w.mode==='pudge'?Object.values(w.players).filter(e=>e.id!==p.id&&acAlive(e)&&!e.pullBy):acEnemies(w,p).filter(e=>!e.pullBy);
  const candidates=units.map(u=>({u,t:arcadeSweep(h.x,h.y,x,y,u.x,u.y,h.radius+(u.boss?40:20))}));
  if(w.mode==='pudge')for(const rune of w.runes)candidates.push({rune,t:arcadeSweep(h.x,h.y,x,y,rune.x,rune.y,h.radius+18)});
  const first=candidates.filter(c=>c.t!==null).sort((a,b)=>a.t-b.t)[0];
  h.x=x;h.y=y;h.travel+=travel;
  if(first){h.returning=true;
   if(first.rune){const rune=first.rune;w.runes=w.runes.filter(r=>r.id!==rune.id);if(rune.kind==='heal')acHeal(w,p,arcadeMaxHP(w,p)*.35);else p.statuses[rune.kind]=rune.kind==='hookShield'?12:10;arcadeEmit(w,'rune',{player:p.id,kind:rune.kind,x:rune.x,y:rune.y});}
   else{
    const u=first.u;h.x=u.x;h.y=u.y;
    if(u.statuses.hookShield>0||u.spawnShield>0){u.statuses.hookShield=0;arcadeEmit(w,'blocked_hook',{player:u.id,x:u.x,y:u.y});}
    else{
     const friendly=w.mode==='pudge'&&u.team===p.team;
     if(!friendly){arcadeDeal(w,p.id,u,h.damage*(p.statuses.double>0?1.65:1),'physical',{spell:true,kind:'hook'});p.hookHits++;if(p.statuses.thunder>0||arcadeHas(p,'thunder')){for(const other of units.filter(e=>e.team!==p.team&&e.id!==u.id&&acDist(e,u)<220).slice(0,2))arcadeDeal(w,p.id,other,70,'magic',{spell:true});arcadeEmit(w,'lightning',{player:p.id,x:u.x,y:u.y,points:units.filter(e=>e.team!==p.team&&acDist(e,u)<220).map(e=>({x:e.x,y:e.y}))});}}
     if(u.hp>0){h.target=u.id;u.pullBy=h.id;u.channel=null;u.channelLeft=0;}arcadeEmit(w,friendly?'rescue':'hook_hit',{player:p.id,target:u.id,x:u.x,y:u.y});
    }
   }
  }else if(h.travel>=h.range||x<0||x>5200||y<0||y>1900)h.returning=true;
 }
 for(const h of w.hooks)if(h.done){const target=acUnit(w,h.target);if(target?.pullBy===h.id)target.pullBy=0;}
 w.hooks=w.hooks.filter(h=>!h.done);
}
function acTickProjectiles(w,dt){
 for(const s of w.projectiles){
  const p=w.players[s.owner];if(!p){s.done=true;continue;}const speed=Math.hypot(s.vx,s.vy);if(!Number.isFinite(speed)||speed<=0){s.done=true;continue;}
  const travel=Math.min(s.rangeLeft,speed*dt),x=s.x+s.vx/speed*travel,y=s.y+s.vy/speed*travel;
  const pool=(s.hostile?acAllies(w,p):acEnemies(w,p)).filter(u=>u.hp>0&&!s.hitIds.includes(u.id)&&!(u.statuses.lift>0));
  const collisions=pool.map(u=>({u,t:arcadeSweep(s.x-(u.prevX??u.x),s.y-(u.prevY??u.y),x-u.x,y-u.y,0,0,s.radius+(u.boss?40:20))})).filter(c=>c.t!==null).sort((a,b)=>a.t-b.t);
  for(const {u} of collisions){
   if(s.kind==='attack')acAttackHit(w,p,u);else if(s.kind==='dagger'){arcadeDeal(w,p.id,u,s.damage,'physical',{spell:true});acAttackHit(w,p,u,.4);}
   else arcadeDeal(w,s.hostile?s.source:p.id,u,s.damage,s.type,{spell:!!s.spell,kind:s.kind});
   acControl(w,u,{stun:s.stun,hex:s.hex,slow:s.slow,disarm:s.disarm,silence:s.silence,fear:s.fear},s.hostile?s.source:p.id);
   if(s.knock&&u.hp>0){u.x+=s.vx/speed*s.knock;u.y+=s.vy/speed*s.knock;}
   if(s.kind==='minion'){const unit=w.summons.find(a=>a.id===s.minion);if(unit?.kind==='forge')u.armor=Math.max(-2,(u.armor||0)-.4);if(unit?.kind==='eidolons'&&++unit.attacks===6){unit.attacks=0;acSummon(w,p,'eidolons',{x:unit.x+20,y:unit.y+20,damage:unit.damage,life:unit.life,hp:unit.maxHP,maxHP:unit.maxHP,range:unit.range,attacks:0});}}
   s.hitIds.push(u.id);arcadeEmit(w,'impact',{x:u.x,y:u.y,skill:s.skill,kind:s.kind});if(s.pierce--<=0){s.done=true;break;}
  }
  s.x=x;s.y=y;s.rangeLeft-=travel;
  const box=arcadeBounds(w,p);if(s.rangeLeft<=0||x<box.x-50||x>box.x+box.w+50||y<box.y-50||y>box.y+box.h+50)s.done=true;
  if(s.done&&s.kind==='chakram')acZone(w,p,'chakram',s.destination||s,{radius:s.zoneRadius,left:s.zoneDuration,power:s.damage,skill:s.skill});
 }
 w.projectiles=w.projectiles.filter(s=>!s.done);
}
function acTickZones(w,dt){
 for(const z of w.zones){
  z.left-=dt;if(z.delay>0){z.delay-=dt;if(z.delay>0)continue;}
  const p=w.players[z.owner];if(!p){z.left=0;continue;}const target=z.target&&acUnit(w,z.target);if(target?.hp>0){z.x=target.x;z.y=target.y;}
  const pool=z.hostile?acAllies(w,p):acEnemies(w,p);
  if(z.kind==='chrono'){for(const u of pool)if(acDist(u,z)<z.radius)u.frozen=true;continue;}
  if(z.tick>0){z.tick-=dt;continue;}z.tick=.5;
  for(const e of pool){if(e.hp<=0||acDist(e,z)>z.radius)continue;let power=z.power||0;
   if(z.manaBurn){const removed=Math.min(e.mana||0,power);e.mana=Math.max(0,(e.mana||0)-removed);power=removed*.8;}
   if(z.kind==='midnight')power=(e.maxHP||arcadeMaxHP(w,e))*Math.min(e.boss?.005:.028,z.power||0)*.5;
   else if(!z.oneShot)power*=.5;
   arcadeDeal(w,z.hostile?z.source:p.id,e,power,z.pure||z.kind==='chakram'?'pure':'magic',{spell:true,kind:z.skill||z.kind});
   acControl(w,e,{stun:z.stun,slow:['shrapnel','chakram','ice_wall','sprout'].includes(z.kind)?1:z.slow,root:z.kind==='sprout'?.7:0},p.id);
  }
  if(z.kind==='meteor'){z.x+=(z.dirX||1)*22;z.y+=(z.dirY||0)*22;}
  if(z.oneShot){z.left=0;arcadeEmit(w,'burst',{x:z.x,y:z.y,radius:z.radius,skill:z.skill,kind:z.kind});}
 }
 w.zones=w.zones.filter(z=>z.left>0);
}
function acTickChannels(w,p,dt){
 if(!p.channel)return;const c=p.channel;
 if(p.hp<=0||p.statuses.stun>0||p.statuses.hex>0||p.statuses.lift>0||p.statuses.fear>0||p.statuses.silence>0||p.frozen||p.pullBy){p.channel=null;p.channelLeft=0;arcadeEmit(w,'interrupted',{player:p.id});return;}
 p.channelLeft=Math.max(0,p.channelLeft-dt);
 if(['dismember','shackles','mana_drain'].includes(c.kind)){
  const target=acUnit(w,c.target);if(!target||target.hp<=0||acDist(p,target)>c.range+80){p.channel=null;p.channelLeft=0;return;}
  if(c.kind==='mana_drain'){const drain=Math.min(target.mana||0,c.power*dt);target.mana=Math.max(0,(target.mana||0)-drain);p.mana=Math.min(arcadeMaxMana(w,p),p.mana+drain);}
  else{acControl(w,target,{root:.15,silence:.15},p.id);const actual=arcadeDeal(w,p.id,target,c.power*dt,'magic',{spell:true,kind:c.kind});if(c.kind==='dismember')acHeal(w,p,actual*.8);}
 }
 if(c.kind==='black_hole')for(const e of acEnemies(w,p))if(acDist(e,c)<c.radius){const d=acDist(e,c)||1;e.frozen=true;e.x+=(c.x-e.x)/d*Math.min(d,90*dt);e.y+=(c.y-e.y)/d*Math.min(d,90*dt);arcadeDeal(w,p.id,e,c.power*dt,'pure',{spell:true,kind:c.kind});}
 if(c.kind==='freezing')acArea(w,p,p,c.radius,c.power*dt,'magic',{slow:.25,kind:'frost'});
 if(p.channelLeft>0)return;
 p.channel=null;
 if(c.kind==='rearm'){for(const id of Object.keys(p.cd))if(id!=='rearm'&&CHAOS_SKILL_BY_ID[id]&&!CHAOS_SKILL_BY_ID[id].ultimate)p.cd[id]=0;arcadeEmit(w,'rearm',{player:p.id,x:p.x,y:p.y});}
 if(c.kind==='requiem')for(let i=0;i<16;i++){const a=i*Math.PI/8;acProjectile(w,p,{kind:'soul',skill:'requiem',type:'magic',spell:true,damage:c.power,vx:Math.cos(a)*560,vy:Math.sin(a)*560,radius:19,pierce:4,rangeLeft:c.range,fear:1.2});}
 if(c.kind==='snipe'){const dx=c.aimX-p.x,dy=c.aimY-p.y,d=Math.hypot(dx,dy)||1;acProjectile(w,p,{kind:'snipe',skill:'assassinate',type:'physical',spell:true,damage:c.power,vx:dx/d*1000,vy:dy/d*1000,rangeLeft:c.range,radius:13,pierce:0});}
 if(c.kind==='teleport'){p.x=c.x;p.y=c.y;p.prevX=p.x;p.prevY=p.y;acMoveTo(w,p,p.x,p.y);}
 if(c.kind==='infest'){const host=acUnit(w,c.target);if(host?.hp>0){p.x=host.x;p.y=host.y;}acHeal(w,p,arcadeMaxHP(w,p)*.3);acArea(w,p,p,c.radius,c.power,'magic',{kind:'bomb'});p.statuses.invulnerable=0;}
}
function acTickPending(w){
 const now=w.pending.filter(e=>e.at<=w.seconds);w.pending=w.pending.filter(e=>e.at>w.seconds);
 for(const a of now){const p=w.players[a.owner];if(!p||p.hp<=0)continue;
  if(a.kind==='multicast')acCast(w,p,a.skill,{x:a.x,y:a.y},true);
  else if(a.kind==='malefice'){const target=acUnit(w,a.target);if(target?.hp>0){arcadeDeal(w,p.id,target,a.power,'magic',{spell:true});acControl(w,target,{stun:.35},p.id);}}
  else if(a.kind==='slash'){const target=acUnit(w,a.target),next=target?.hp>0?target:acEnemies(w,p).filter(e=>acDist(p,e)<400)[0];if(next){const b=arcadeBounds(w,p);p.x=acClamp(next.x-45,b.x+35,b.x+b.w-35);p.y=acClamp(next.y,b.y+35,b.y+b.h-35);p.moveX=p.x;p.moveY=p.y;acAttackHit(w,p,next,1.15);arcadeEmit(w,'slash',{player:p.id,x:next.x,y:next.y});}}
 }
}
function acTickStatuses(w,u,dt){
 u.frozen=false;u.prevX=u.x;u.prevY=u.y;
 for(const key of Object.keys(u.statuses||{})){const previous=u.statuses[key];u.statuses[key]=Math.max(0,previous-dt);if(previous>0&&u.statuses[key]===0){if(['reactive','fiery','decay'].includes(key))u.stacks[key]=0;if(key==='tazer'&&w.players[u.id])acArea(w,u,u,220,u.tazerPower||60,'magic',{disarm:1.5,kind:'bomb'});if(key==='relocate'&&u.relocateFrom){u.x=u.relocateFrom.x;u.y=u.relocateFrom.y;u.moveX=u.x;u.moveY=u.y;u.prevX=u.x;u.prevY=u.y;}}}
 u.controlGuard=Math.max(0,(u.controlGuard||0)-dt);u.coldTimer=Math.max(0,(u.coldTimer||0)-dt);u.bashCD=Math.max(0,(u.bashCD||0)-dt);u.lightningCD=Math.max(0,(u.lightningCD||0)-dt);u.staticCD=Math.max(0,(u.staticCD||0)-dt);u.attackCD=Math.max(0,(u.attackCD||0)-dt);u.spawnShield=Math.max(0,(u.spawnShield||0)-dt);
}
function acTickPlayer(w,p,dt){
 for(const key of Object.keys(p.cd))p.cd[key]=Math.max(0,p.cd[key]-dt);for(const key of Object.keys(p.itemCD))p.itemCD[key]=Math.max(0,p.itemCD[key]-dt);p.hookCD=Math.max(0,p.hookCD-dt);
 if(p.stolen){p.stolen.left-=dt;if(p.stolen.left<=0)p.stolen=null;}
 if(p.eliminated||p.failedRound)return;
 if(p.respawn>0){p.respawn=Math.max(0,p.respawn-dt);if(p.respawn===0){p.x=p.moveX=p.team===0?330:1470;p.y=p.moveY=220+(p.seat%5)*140;p.hp=arcadeMaxHP(w,p);p.spawnShield=2.5;p.contributors={};}return;}
 if(p.hp<=0)return;
 p.mana=Math.min(arcadeMaxMana(w,p),p.mana+(2+arcadeRank(p,'brilliance')*1.5+(arcadeHas(p,'octarine')?2:0))*dt);
 const regen=w.mode==='pudge'?(arcadeHas(p,'heart')?9:3):(arcadeMaxHP(w,p)*(.0025+(arcadeHas(p,'heart')?(w.seconds-p.lastHurt>4?.013:.004):0))+(p.stacks.reactive||0)*.5+arcadeRank(p,'quas')*2);
 acHeal(w,p,regen*dt);p.hp=Math.min(p.hp,arcadeMaxHP(w,p));
 acTickChannels(w,p,dt);
 if(p.statuses.rot>0&&w.mode==='chaos'){const amount=(20+arcadeRank(p,'rot')*10)*(1+(p.level-1)*.06);acArea(w,p,p,180,amount*dt,'magic',{slow:.3,kind:'rot'});p.hp=Math.max(1,p.hp-amount*.45*dt);}
 if(p.statuses.spin>0)acArea(w,p,p,200,(p.spinPower||50)*dt,'magic',{kind:'saw'});
 if(p.statuses.spirits>0&&p.spirits>0){p.spiritCD=Math.max(0,p.spiritCD-dt);const e=acEnemies(w,p).find(e=>acDist(p,e)<235);if(e&&p.spiritCD===0){p.spirits--;p.spiritCD=.45;acArea(w,p,e,100,p.spiritPower||70,'magic',{kind:'spirit'});}}
 if(p.statuses.fear>0&&p.hp>0&&!p.pullBy&&!p.frozen&&!(p.statuses.root>0||p.statuses.stun>0||p.statuses.hex>0||p.statuses.lift>0)){const source=acUnit(w,p.fearSource);if(source){const dx=p.x-source.x,dy=p.y-source.y,d=Math.hypot(dx,dy)||1;acMoveTo(w,p,p.x+dx/d*arcadeMoveSpeed(w,p)*dt,p.y+dy/d*arcadeMoveSpeed(w,p)*dt);p.x=p.moveX;p.y=p.moveY;}return;}
 if(!acCanAct(w,p)||p.statuses.root>0||p.channel||w.mode==='chaos'&&!['wave','duel'].includes(w.phase))return;
 let dx=p.moveX-p.x,dy=p.moveY-p.y;if(p.walkUntil>w.seconds){dx=p.walkX*1000;dy=p.walkY*1000;}
 const len=Math.hypot(dx,dy),amount=Math.min(len,arcadeMoveSpeed(w,p)*dt);if(len>1){const x=p.x+dx/len*amount,y=p.y+dy/len*amount;const oldX=p.moveX,oldY=p.moveY;acMoveTo(w,p,x,y);p.x=p.moveX;p.y=p.moveY;p.moveX=oldX;p.moveY=oldY;}
 if(p.walkUntil>w.seconds){p.moveX=p.x;p.moveY=p.y;}
}
function acNPCShot(w,unit,owner,target,damage,extras={}){if(w.projectiles.length>=300)return;const dx=target.x-unit.x,dy=target.y-unit.y,d=Math.hypot(dx,dy)||1,speed=extras.speed||430;w.projectiles.push({id:w.nextId++,owner:owner.id,source:unit.id,minion:unit.id,hostile:!!unit.isCreep,x:unit.x,y:unit.y,vx:dx/d*speed,vy:dy/d*speed,rangeLeft:Math.max(500,d+200),radius:10,kind:unit.isCreep?'creep':'minion',type:'physical',damage:damage*(unit.statuses.weaken>0?.8:1),pierce:0,hitIds:[],...extras});}
function acTickEnemies(w,dt){
 for(const e of w.enemies){if(e.hp<=0||e.statuses.stun>0||e.statuses.hex>0||e.statuses.lift>0||e.frozen||e.pullBy)continue;
  const p=w.players[e.owner];if(!p||!acAlive(p)){continue;}const candidates=acAllies(w,p).filter(u=>u.hp>0&&!u.invulnerable&&!(u.statuses.ghost_walk>0)),target=candidates.sort((a,b)=>acDist(e,a)-acDist(e,b))[0];if(!target)continue;
  const d=acDist(e,target),flee=e.statuses.fear>0,rooted=e.statuses.root>0;
  if((d>e.range||flee)&&!rooted){const amount=Math.min(e.speed*(e.statuses.slow>0?.6:1)*dt,flee?e.speed*dt:Math.max(0,d-e.range+2)),len=d||1;e.x+=(target.x-e.x)/len*amount*(flee?-1:1);e.y+=(target.y-e.y)/len*amount*(flee?-1:1);const b=arcadePen(p.seat);e.x=acClamp(e.x,b.x+25,b.x+b.w-25);e.y=acClamp(e.y,b.y+25,b.y+b.h-25);}
  e.mana=Math.min(e.maxMana,e.mana+dt);e.castCD-=dt;
  if(!flee&&e.castCD<=0&&e.mana>=45&&d<550&&!(e.statuses.silence>0)){
   if(e.kind==='satyr'){const point={x:target.x,y:target.y};acZone(w,p,'burst',point,{hostile:true,source:e.id,radius:100,power:e.damage*2.1,left:1.8,delay:.8,oneShot:true,skill:'shockwave'});e.lastSpell='shockwave';}
   else if(e.kind==='shaman'){acNPCShot(w,e,p,target,e.damage*.5,{kind:'hex_bolt',type:'magic',hex:1,spell:true});e.lastSpell='shaman_hex';}
   else if(e.kind==='golem'&&d<220){acZone(w,p,'burst',e,{hostile:true,source:e.id,radius:150,power:e.damage*1.6,left:1.8,delay:.75,oneShot:true,stun:.7,skill:'light_strike'});e.lastSpell='light_strike';}
   e.mana-=45;e.castCD=9;
  }
  if(!flee&&d<=e.range+15&&e.attackCD<=0&&!(e.statuses.disarm>0)){acNPCShot(w,e,p,target,e.damage*(e.statuses.weaken>0?.75:1));e.attackCD=e.kind==='wolf'?.85:1.25;}
 }
}
function acTickSummons(w,dt){
 for(const u of w.summons){u.life-=dt;if(u.hp<=0||u.life<=0)continue;const p=w.players[u.owner];if(!p||p.eliminated){u.hp=0;continue;}
  if(u.frozen||u.statuses.stun>0||u.statuses.hex>0||u.pullBy)continue;
  const pool=acEnemies(w,p),forced=u.forcedTarget&&acUnit(w,u.forcedTarget),target=forced?.hp>0?forced:pool.filter(e=>e.hp>0).sort((a,b)=>acDist(u,a)-acDist(u,b))[0];
  if(u.kind==='healing_ward'){for(const ally of acAllies(w,p))if(acDist(u,ally)<360)acHeal(w,ally,(ally.maxHP||arcadeMaxHP(w,ally))*u.heal*dt);continue;}
  if(u.kind==='tombstone'){u.zombieCD-=dt;if(u.zombieCD<=0&&target){u.zombieCD=2.5;acSummon(w,p,'zombie',{x:target.x+35,y:target.y+35,hp:80+p.level*6,maxHP:80+p.level*6,damage:arcadeAttack(w,p)*.22,life:6,move:180,range:80});}continue;}
  if(u.kind==='mine'){u.arm=Math.max(0,u.arm-dt);if(u.arm===0&&pool.some(e=>acDist(e,u)<150)){acArea(w,p,u,u.radius,u.damage,'magic',{kind:'bomb'});u.hp=0;arcadeEmit(w,'burst',{x:u.x,y:u.y,radius:u.radius,skill:'mines'});}continue;}
  if(!target)continue;const range=u.kind==='illusion'?(u.statuses.metamorphosis>0||p.statuses.metamorphosis>0?620:u.range):u.range,d=acDist(u,target);
  if(u.move>0&&d>range&&!(u.statuses.root>0)){const amount=Math.min(u.move*dt,d-range),len=d||1;u.x+=(target.x-u.x)/len*amount;u.y+=(target.y-u.y)/len*amount;}
  if(d<=range+15&&u.attackCD<=0&&!(u.statuses.disarm>0)){acNPCShot(w,u,p,target,u.damage*(u.statuses.empower>0?1.3:1));u.attackCD=1/(u.statuses.overcharge>0||u.statuses.bloodlust>0?1.5:1);}
 }
 w.summons=w.summons.filter(u=>u.hp>0&&u.life>0);
}
function acBot(w,p,dt){
 p.botClock-=dt;p.shoppingClock-=dt;
 if(w.mode==='chaos'&&(!p.hero||p.offer.length))acAutoDraft(w,p);
 if(p.eliminated||p.failedRound||p.hp<=0)return;
 if(p.shoppingClock<=0){
  p.shoppingClock=1.2;
  if(w.mode==='pudge'){
   const branch=PUDGE_UPGRADES.filter(u=>p[u.id]<u.max).sort((a,b)=>p[a.id]-p[b.id])[0];
   if(p.hookPoints>0&&branch)arcadeCommand(w,p.id,{type:'upgrade_hook',upgrade:branch.id});
   else{const item=['boots','heart','shield','blink','thunder'].find(id=>!arcadeHas(p,id));if(item)arcadeCommand(w,p.id,{type:'buy',item});else if(branch)arcadeCommand(w,p.id,{type:'upgrade_hook',upgrade:branch.id});}
  }else{
   for(const s of p.abilities)if(p.points>0&&s.rank<CHAOS_SKILL_BY_ID[s.id].maxRank)arcadeCommand(w,p.id,{type:'upgrade_skill',skill:s.id});
   const magic=p.abilities.filter(s=>!CHAOS_SKILL_BY_ID[s.id].passive).length>=3,order=magic?['boots','octarine','heart','bloodstone','bkb','scepter']:['boots','maelstrom','heart','daedalus','bkb','assault'];
   const item=order.find(id=>!arcadeHas(p,id));if(item)arcadeCommand(w,p.id,{type:'buy',item});
   if(w.phase==='duel_prep'&&!w.duel.ids.includes(p.id)&&!w.bets[p.id]&&p.gold>200){const candidate=acPick(w,w.duel.ids);arcadeCommand(w,p.id,{type:'bet',target:candidate,amount:Math.max(1,Math.floor(p.gold*.1))});}
  }
 }
 if(p.botClock>0||!acCanAct(w,p)||p.channel)return;p.botClock=.18+arcadeRandom(w)*.18;
 const enemies=acEnemies(w,p).filter(e=>!(e.statuses.ghost_walk>0)),target=enemies.sort((a,b)=>acDist(p,a)-acDist(p,b))[0];
 if(w.mode==='pudge'){
  const bankLeft=p.x<900,minX=bankLeft?80:1020,maxX=bankLeft?780:1720;
  const incoming=w.hooks.find(h=>h.owner!==p.id&&!h.returning&&w.players[h.owner]?.team!==p.team&&acDist(h,p)<350);
  if(incoming){const len=Math.hypot(incoming.vx,incoming.vy)||1,sign=p.y<500?1:-1;acMoveTo(w,p,acClamp(p.x-incoming.vy/len*sign*180,minX,maxX),acClamp(p.y+incoming.vx/len*sign*180,65,935));}
  else if(acDist(p,{x:p.moveX,y:p.moveY})<35||arcadeRandom(w)<.07)acMoveTo(w,p,minX+arcadeRandom(w)*(maxX-minX),90+arcadeRandom(w)*820);
  if(target&&p.hookCD<=0&&!w.hooks.some(h=>h.owner===p.id)){
   const rune=w.runes.length&&arcadeRandom(w)<.13?acPick(w,w.runes):null,chosen=rune||target,lead=Math.min(.6,acDist(p,chosen)/(800+p.hookSpeed*65)),dx=(target.moveX-target.x),dy=(target.moveY-target.y),len=Math.hypot(dx,dy)||1;
   const x=chosen.x+(rune?0:dx/len*arcadeMoveSpeed(w,target)*lead*.7)+(arcadeRandom(w)-.5)*55,y=chosen.y+(rune?0:dy/len*arcadeMoveSpeed(w,target)*lead*.7)+(arcadeRandom(w)-.5)*55;arcadeCommand(w,p.id,{type:'hook',x,y});
  }
  if(incoming&&arcadeHas(p,'shield'))acItem(w,p,'shield',{});return;
 }
 if(!['wave','duel'].includes(w.phase)||!target)return;
 const d=acDist(p,target),range=arcadeRange(w,p),desired=Math.max(145,range*.77),box=arcadeBounds(w,p),dx=(p.x-target.x)/(d||1),dy=(p.y-target.y)/(d||1);
 let x=p.x,y=p.y;if(d>desired+35){x=target.x+dx*desired;y=target.y+dy*desired;}else if(d<Math.min(250,desired*.7)){x=p.x+dx*130;y=p.y+dy*130;}
 const warning=w.zones.find(z=>z.hostile&&z.owner===p.id&&z.delay>0&&acDist(p,z)<z.radius+40);
 if(warning){const ex=p.x-warning.x,ey=p.y-warning.y,len=Math.hypot(ex,ey)||1;x=p.x+ex/len*(warning.radius+100);y=p.y+ey/len*(warning.radius+100);if(Math.abs(ex)+Math.abs(ey)<1)y=p.y+(p.y-box.y<box.h/2?180:-180);}
 const candidate={x:acClamp(x,box.x+40,box.x+box.w-40),y:acClamp(y,box.y+40,box.y+box.h-40)};
 if(acDist(candidate,p)<10&&d<160){candidate.y=acClamp(p.y+(p.y-box.y<box.h/2?120:-120),box.y+40,box.y+box.h-40);}
 arcadeCommand(w,p.id,{type:'move',...candidate});
 const lead=Math.min(.3,d/650),angle=Math.atan2(target.y-p.y,target.x-p.x)+(arcadeRandom(w)-.5)*.07,aim={x:p.x+Math.cos(angle)*d,y:p.y+Math.sin(angle)*d};
 if(d<range+40)arcadeCommand(w,p.id,{type:'attack',...aim});
 if(arcadeHas(p,'bkb')&&(p.hp<arcadeMaxHP(w,p)*.6||warning))acItem(w,p,'bkb',aim);if(arcadeHas(p,'mjollnir')&&d<500)acItem(w,p,'mjollnir',aim);
 for(const learned of acShuffle(w,p.abilities)){
  const s=CHAOS_SKILL_BY_ID[learned.id];if(s.passive||p.cd[s.id]>0||p.channel||p.mana<Math.max(0,s.mana))continue;
  if(['quas','wex','exort'].includes(s.kind)){if(p.orbs.length<3)acCast(w,p,s.id,aim);continue;}
  if(s.kind==='rot'||s.kind==='frost'){if(!(p.statuses[s.kind]>0))acCast(w,p,s.id,aim);continue;}
  if(s.kind==='sunder'&&p.hp/arcadeMaxHP(w,p)>.5)continue;
  if(['teleport','relocate','ghost_walk','time_walk','matrix','healing_ward','soul_rip','tazer','blur'].includes(s.kind)&&p.hp>arcadeMaxHP(w,p)*.8)continue;
  if(s.kind==='raze'&&Math.abs(s.range-d)>130)continue;
  if(['whirling','spin','freezing','rot','rp','spirits'].includes(s.kind)&&d>250)continue;
  if(s.kind==='rearm'&&p.abilities.filter(a=>(p.cd[a.id]||0)>3&&!CHAOS_SKILL_BY_ID[a.id].ultimate).length<2)continue;
  let at=aim;if(s.kind==='tether'){const ally=acAllies(w,p).find(a=>a.id!==p.id);if(!ally)continue;at=ally;}
  if(['shield','healing_ward','teleport','relocate','time_walk','soul_rip'].includes(s.kind))at={x:p.x-dx*70,y:p.y-dy*70};
  if(d>s.range+60&&!['shield','bloodlust','metamorphosis','rage','golem','empower','overcharge','rearm'].includes(s.kind))continue;
  const result=acCast(w,p,s.id,{x:at.x,y:at.y});if(result.ok&&p.channel)break;
 }
 for(const extra of [...p.invoked,...(p.stolen?[p.stolen]:[])])if(!(p.cd[extra.id]>0)&&d<700)acCast(w,p,extra.id,aim);
}
export function stepArcade(w,dt,bots=[]){
 if(w.gameOver)return;dt=acClamp(dt,0,.1);if(!w.started)return;
 w.seconds+=dt;w.phaseTime+=['prep','duel_prep'].includes(w.phase)?-dt:dt;
 for(const u of [...Object.values(w.players),...w.enemies,...w.summons])acTickStatuses(w,u,dt);
 acTickZones(w,dt);acTickPending(w);
 for(const p of Object.values(w.players)){acTickPlayer(w,p,dt);if(bots.includes(p.id))acBot(w,p,dt);}
 if(w.mode==='pudge'){
  w.runeTimer-=dt;if(w.runeTimer<=0){w.runeTimer=8;if(w.runes.length<4)w.runes.push({id:w.nextId++,kind:acPick(w,['haste','double','hookShield','thunder','heal']),x:860+arcadeRandom(w)*80,y:100+arcadeRandom(w)*800,left:25});}
  for(const r of w.runes)r.left-=dt;w.runes=w.runes.filter(r=>r.left>0);
  for(const p of Object.values(w.players)){p.regenClock+=dt;if(p.regenClock>=5){p.regenClock-=5;acGold(p,8);}}
  acTickHooks(w,dt);return;
 }
 if(w.phase==='prep'&&w.phaseTime<=0){acBeginWave(w);return;}
 if(w.phase==='duel_prep'&&w.phaseTime<=0){acStartDuel(w);return;}
 if(w.phase==='wave'||w.phase==='duel'){
  acTickEnemies(w,dt);acTickSummons(w,dt);acTickHooks(w,dt);acTickProjectiles(w,dt);if(w.gameOver)return;w.enemies=w.enemies.filter(e=>e.hp>0);
  if(w.phase==='duel'){
   if(w.duel.finished||w.phaseTime>=50)acEndDuel(w);
  }else{
   const rules=chaosWaveRules(w.wave);
   for(const p of Object.values(w.players))if(!p.eliminated&&!p.cleared){p.roundElapsed+=dt;if(!w.enemies.some(e=>e.owner===p.id&&e.hp>0)){p.cleared=true;p.clearTime=p.roundElapsed;p.clearedWaves++;const reward=220+w.wave*20+Math.round(120*Math.max(0,1-p.clearTime/rules.duration));acGold(p,reward);acLevel(w,p,55+w.wave*10);arcadeEmit(w,'wave_clear',{player:p.id,wave:w.wave,seconds:+p.clearTime.toFixed(1),gold:reward});}else if(w.phaseTime>=rules.duration){p.hp=1;arcadeDeal(w,null,p,1e9,'pure',{kind:'timeout'});}}
   if(Object.values(w.players).every(p=>p.eliminated||p.cleared))acRoundEnd(w);
  }
 }
}
// Only typed progress is restored; a reload never replenishes PVE lives or equipment.
export function restoreArcadeWorld(saved,mode='chaos'){
 const w=createArcadeWorld(mode);if(!saved||saved.mode!==mode||saved.version!==1)return w;
 w.resumeWave=saved.started&&saved.phase==='wave';w.seed=Number.isInteger(saved.seed)?saved.seed>>>0:w.seed;w.wave=acClamp(Math.floor(saved.wave||0),0,500);w.score=Array.isArray(saved.score)?saved.score.slice(0,2).map(n=>acClamp(Math.floor(n)||0,0,1000)):[0,0];w.targetScore=[25,50,75,100].includes(saved.targetScore)?saved.targetScore:50;
 for(const [id,p] of Object.entries(w.players)){const old=saved.players?.[id];if(!old)continue;
  if(typeof old.name==='string')p.name=old.name.slice(0,24);if(mode==='chaos'&&CHAOS_HERO_BY_ID[old.hero]){p.hero=old.hero;p.heroOptions=Array.isArray(old.heroOptions)?old.heroOptions.filter(h=>CHAOS_HERO_BY_ID[h]).slice(0,4):[];p.abilities=Array.isArray(old.abilities)?old.abilities.filter(s=>CHAOS_SKILL_BY_ID[s.id]).slice(0,6).map(s=>({id:s.id,rank:acClamp(Math.floor(s.rank)||1,1,CHAOS_SKILL_BY_ID[s.id].maxRank)})):[];p.heroRerolled=!!old.heroRerolled;}
  for(const key of ['level','xp','gold','earned','spent','creepKills','kills','deaths','assists','damageDealt','damageTaken','healing','clearedWaves','duelWins','duelLosses','duels','points','picks','hookPoints','hooksThrown','hookHits'])if(Number.isFinite(old[key])&&old[key]>=0)p[key]=Math.min(1e9,Math.floor(old[key]));p.level=Math.max(1,p.level);
  p.lives=Number.isInteger(old.lives)?acClamp(old.lives,0,5):5;p.eliminated=mode==='chaos'&&p.lives===0;p.skillSlots=old.skillSlots===6?6:5;
  p.items=Array.isArray(old.items)?[...new Set(old.items)].filter(id=>(mode==='pudge'?ARCADE_PW_ITEMS:ARCADE_ITEMS).some(i=>i.id===id&&i.kind!=='token')).slice(0,6):[];
  for(const up of PUDGE_UPGRADES)if(Number.isInteger(old[up.id]))p[up.id]=acClamp(old[up.id],0,10);
  for(const key of ['souls','flesh','finger'])if(Number.isFinite(old.stacks?.[key]))p.stacks[key]=acClamp(Math.floor(old.stacks[key]),0,30);
  const owned=new Set(p.abilities.map(s=>s.id));p.offer=Array.isArray(old.offer)?[...new Set(old.offer)].filter(id=>CHAOS_SKILL_BY_ID[id]&&!owned.has(id)).slice(0,16):[];p.offerSlot=Number.isInteger(old.offerSlot)&&old.offerSlot>=0&&old.offerSlot<p.abilities.length?old.offerSlot:-1;p.offerRank=acClamp(Math.floor(old.offerRank)||1,1,4);
  if(mode==='chaos'&&p.hero&&!p.abilities.length&&!p.offer.length)chaosOffer(w,p);
  p.hp=p.eliminated?0:arcadeMaxHP(w,p);p.mana=arcadeMaxMana(w,p);
  for(const [key,value] of Object.entries(old.cd||{}))if(CHAOS_SKILL_BY_ID[key]&&Number.isFinite(value))p.cd[key]=acClamp(value,0,180);
  if(Number.isFinite(old.hookCD))p.hookCD=acClamp(old.hookCD,0,3);
  for(const [key,value] of Object.entries(old.itemCD||{}))if(ARCADE_ITEMS.some(i=>i.id===key)||ARCADE_PW_ITEMS.some(i=>i.id===key))if(Number.isFinite(value))p.itemCD[key]=acClamp(value,0,60);
 }
 if(mode==='chaos'&&['duel','duel_prep'].includes(saved.phase)&&Array.isArray(saved.duel?.ids)&&saved.duel.ids.length===2&&new Set(saved.duel.ids).size===2&&saved.duel.ids.every(id=>w.players[id]&&!w.players[id].eliminated)){w.resumeDuel=[...saved.duel.ids];for(const [id,bet] of Object.entries(saved.bets||{}))if(w.players[id]&&Number.isSafeInteger(bet.amount)&&bet.amount>0&&bet.amount<=1e9&&w.resumeDuel.includes(bet.target))w.players[id].gold+=bet.amount;}
 const remaining=Object.values(w.players).filter(p=>!p.eliminated);if(mode==='chaos'&&remaining.length<=1&&w.wave>0){w.gameOver=true;w.phase='finished';w.winner=remaining[0]?.id||saved.winner||null;}else if(mode==='pudge'&&w.score.some(n=>n>=w.targetScore)){w.gameOver=true;w.phase='finished';w.winner=w.score[0]>w.score[1]?0:1;}
 return w;
}
