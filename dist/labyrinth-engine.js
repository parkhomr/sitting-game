import {LAB_WIDTH,LAB_HEIGHT,PORTAL_DURATION,SPAWN_GRACE,HEROES,SKILLS,ENEMIES,ROOMS,ELITES,SHARDS,LEGENDARY,ITEMS,SCHEDULE,BOSS,TRAPS} from './labyrinth-data.js';
export const LAB_SLOTS=Array.from({length:6},(_,i)=>'s'+(i+1));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), getHero=id=>HEROES.find(x=>x.id===id), count=(p,id)=>p.shards.filter(x=>x===id).length, has=(p,id)=>p.items.includes(id), leg=(p,n)=>p.legendary.includes(n);
const living=w=>Object.values(w.players).filter(p=>p.active&&p.hp>0), all=w=>Object.values(w.players).filter(p=>p.active), random=w=>(w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0)/4294967296;
const choice=(w,items)=>items[Math.floor(random(w)*items.length)], shuffle=(w,items)=>{let a=[...items];for(let i=a.length-1;i>0;i--){let j=Math.floor(random(w)*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// Rank, not hero level, determines ability strength. Rank zero means unlearned.
const rank=(p,i)=>p.skillRanks?.[i]||0;
const basicPower=(p,i)=>[0,.85,1.1,1.35,1.6][rank(p,i)]||0;
const ultimatePower=p=>[0,.9,1.25,1.6][rank(p,3)]||0;
export function labyrinthSkillUpgradeReason(p,slot){
 if(!p?.active||!Number.isInteger(slot)||slot<0||slot>3)return 'Invalid skill';
 const r=rank(p,slot),max=slot===3?3:4;
 if(r>=max)return 'Maximum rank';
 if(slot===3&&p.level<[6,12,18][r])return 'Requires hero level '+[6,12,18][r];
 if(!(p.skillPoints>0))return 'No skill points';
 return '';
}
function levelForClears(n){return 1+Math.floor(n*1.5)}
function grantLevels(w,clears){for(const p of all(w)){let lvl=levelForClears(clears);if(lvl>p.level){const prev=hpmax(p),mp=mpmax(p),delta=lvl-p.level;p.level=lvl;p.skillPoints+=delta;if(p.hp>0)p.hp+=hpmax(p)-prev;p.mana+=mpmax(p)-mp}}}

const hpmax=p=>Math.round((getHero(p.hero).hp*(1+.01*(p.blessings?.fortitude||0))+(p.level-1)*25+180*count(p,'hp')+(has(p,'bracer')?180:0)+(has(p,'mek')?150:0)+(has(p,'bkb')?200:0)+(has(p,'heart')?500:0))*(p.bargain?.9:1));
const mpmax=p=>getHero(p.hero).mana*(1+.01*(p.blessings?.arcane||0))+(p.level-1)*7+120*count(p,'mana')+(has(p,'null')?100:0)+(has(p,'lens')?200:0)+(has(p,'octarine')?150:0);
export const labyrinthMaxHP=p=>hpmax(p),labyrinthMaxMana=p=>mpmax(p);
const armor=(p,w)=>((w?.zones||[]).some(z=>z.kind==='ring'&&dist(z,p)<=z.radius&&leg(w.players[z.owner]||{legendary:[]},'Unbreakable Arena'))?4:0)+getHero(p.hero).armor+(p.level-1)*.18+3*count(p,'armor')+(has(p,'blade')?3:0)+(has(p,'shiva')?6:0)+(p.reactive||0)*.5;
const spellamp=(p,w)=>1+(w&&living(w).some(a=>a.hero==='cm'&&rank(a,2)>0&&leg(a,'Brilliant Aura'))?.08:0)+(p.bargain?.12:0)+.01*(p.blessings?.spellcraft||0)+(w&&living(w).some(a=>a.id!==p.id&&a.hero==='rubick'&&rank(a,2)>0&&leg(a,'Shared Supremacy')&&dist(a,p)<=500)?.06:0)+count(p,'spell')*.12+(has(p,'null')?.06:0)+(has(p,'octarine')?.1:0)+(p.hero==='rubick'?.03*rank(p,2):0)+(p.hero==='sf'&&rank(p,1)>0&&leg(p,'Soul Furnace')?(p.souls||0)*.005:0);
const partyhp=n=>1+(n-1)*.5, damageParty=n=>n===1?.85:n<=3?.95:1, diffhp=w=>1+.15*w.difficulty, diffdamage=w=>1+.1*w.difficulty;
const physical=a=>a>=0?1/(1+.06*Math.min(40,a)):2-1/(1-.06*Math.max(-10,a));
const uid=w=>++w.nextId;
function event(w,type,data={}){w.events.push({id:uid(w),type,...data});if(w.events.length>80)w.events.shift()}
function heroPlayer(id,index){return {id,seat:index,unlocked:0,name:'Player '+(index+1),hero:null,active:false,x:250+index*45,y:500,hp:0,mana:0,level:1,skillRanks:[0,0,0,0],skillPoints:1,gold:200,items:[],potions:{healing:0,mana_potion:0,clarity:0},shards:[],legendary:[],blessings:{fortitude:0,arcane:0,training:0,spellcraft:0,preparation:0,recovery:0},offer:[],rerolls:1,cd:[0,0,0,0],itemCD:{},attackCD:0,walkX:0,walkY:0,walkUntil:0,aimX:800,aimY:500,stats:{damage:0,healing:0,deaths:0},shield:0,shieldTime:0,invuln:0,revived:false,reviveTarget:null,reviveProgress:0,status:{},attackCount:0,souls:0,reactive:0,lastHit:999,fragments:0,tokens:0,vote:null}}
export function createLabyrinthWorld(options={}){const w={version:5,completedRooms:0,roomCounted:false,roomSerial:0,fogAfter:null,mode:'labyrinth',runId:Math.floor(Math.random()*2147483646)+1,seed:Number.isInteger(options.seed)?options.seed>>>0:Math.floor(Math.random()*2147483646)+1,nextId:0,seconds:0,started:false,gameOver:false,winner:null,phase:'lobby',phaseTime:0,room:0,players:{},enemies:[],projectiles:[],zones:[],events:[],queue:[],difficulty:0,partySize:0,roomName:'Lobby',route:[],choices:[],voteTime:0,offerTime:0};w.initialSeed=w.seed;LAB_SLOTS.forEach((id,i)=>w.players[id]=heroPlayer(id,i));return w}
// Validate only the structural compatibility needed by the local game, not anti-cheat.
export function validateLabyrinthSave(w){
 if(!w||w.mode!=='labyrinth'||![1,2,3,4,5].includes(w.version))return {ok:false,message:'This save is invalid or from an unsupported game version.'};
 if(!w.started||w.gameOver||!Number.isInteger(w.room)||w.room<1||w.room>18||!['prep','combat','shop','event','offer','vote'].includes(w.phase)||!w.players||!Number.isFinite(w.seconds)||!Number.isInteger(w.seed)||!['enemies','queue','projectiles','zones','events','route','obstacles','hazards','choices'].every(k=>Array.isArray(w[k])))return {ok:false,message:'This save is incomplete or no longer active.'};
 let ps=Object.values(w.players).filter(p=>p?.active);if(!ps.length||!ps.some(p=>p.id==='s1')||ps.some(p=>!LAB_SLOTS.includes(p.id)||!getHero(p.hero)||!['x','y','hp','mana','level','gold'].every(k=>Number.isFinite(p[k]))||!['items','shards','legendary','offer','cd'].every(k=>Array.isArray(p[k]))||!p.status||!p.itemCD||!p.stats))return {ok:false,message:'This save is incomplete or has invalid player data.'};
 if(w.version>=3&&ps.some(p=>!Array.isArray(p.skillRanks)||p.skillRanks.length!==4||p.skillRanks.some((r,i)=>!Number.isInteger(r)||r<0||r>(i===3?3:4))||!Number.isInteger(p.skillPoints)||p.skillPoints<0||!Number.isInteger(p.level)||p.level<1||p.skillPoints+p.skillRanks.reduce((a,b)=>a+b,0)!==p.level||p.skillRanks[3]>Math.min(3,Math.floor(p.level/6))))return {ok:false,message:'This save has invalid skill progression.'};
 if(w.version>=5&&(!Number.isInteger(w.completedRooms)||w.completedRooms<0||w.completedRooms>20||typeof w.roomCounted!=='boolean'||ps.some(p=>!p.potions||typeof p.potions!=='object'||['healing','mana_potion','clarity'].some(k=>!Number.isInteger(p.potions[k])||p.potions[k]<0||p.potions[k]>99))))return {ok:false,message:'This save has invalid progression or potion data.'};
 return {ok:true,legacy:w.version<5};
}
// Legacy saves have no allocated ranks: preserve the run, rebuild the point budget,
// and let the player choose every skill rather than inventing an allocation.
export function migrateLabyrinthSave(w){
 const check=validateLabyrinthSave(w);if(!check.ok)return check;
 if(w.version<3){for(const p of all(w)){p.level=levelForClears(['vote','offer'].includes(w.phase)?w.room:w.room-1);p.skillRanks=[0,0,0,0];p.skillPoints=p.level;p.hp=Math.min(p.hp,hpmax(p));p.mana=Math.min(p.mana,mpmax(p));p.stolen=null;p.channel=null;p.status={};p.reactive=0;p.souls=0}w.projectiles=w.projectiles.filter(q=>!q.owner);w.zones=w.zones.filter(z=>!z.owner);for(const e of w.enemies)delete e.maledict;w.version=3;}
 if(w.version===3){
  // Preserve allocated skills and live run state while moving old coordinates into the larger arena.
  const move=o=>{if(!o)return;for(const k of ['x','y','aimX','aimY','exitX','exitY'])if(Number.isFinite(o[k]))o[k]*=1.5};
  for(const p of Object.values(w.players))move(p);
  for(const e of w.enemies){move(e);if(Number.isFinite(e.speed))e.speed*=.85;delete e.nav}
  for(const list of [w.projectiles,w.zones,w.obstacles,w.hazards])for(const obj of list)move(obj);
  move(w.trap);for(const v of w.trap?.switches||[])move(v);move(w.lastStealable);
  w.version=4;
 }
 if(w.version===4){
  w.completedRooms=w.room-1+(['vote','offer'].includes(w.phase)?1:0);w.roomCounted=['vote','offer'].includes(w.phase);w.fogAfter=null;w.roomSerial=1;
  if(w.phase==='vote'&&[6,9].includes(w.room))w.fogAfterVote=true;
  for(const p of Object.values(w.players)){let counts={healing:0,mana_potion:0,clarity:0};if(p.consumable in counts)counts[p.consumable]=Math.max(0,Math.min(99,Number(p.potions)||0));p.potions=counts;delete p.consumable}
  w.version=5;
 }
 return {ok:true,legacy:check.legacy};
}
export function labyrinthPartyUnlock(w,ids=LAB_SLOTS){return Math.max(w.debugUnlock||0,...ids.map(id=>{let p=w.players[id];return p?.hero&&Number.isInteger(p.unlocked)?clamp(p.unlocked,0,4):0}))}
export function startLabyrinth(w,ids,hostSeat=ids?.[0]){if(w.started||w.gameOver)return {ok:false,message:'Run already started'};if(!Array.isArray(ids)||!ids.length||ids.length>6||new Set(ids).size!==ids.length||ids.some(id=>!LAB_SLOTS.includes(id)||!w.players[id]))return {ok:false,message:'Invalid player seats'};const party=ids.map(id=>w.players[id]);if(w.difficulty>labyrinthPartyUnlock(w,ids))return {ok:false,message:'Selected difficulty is no longer available to the party'};if(!party.length)return {ok:false,message:'At least one player is needed'};if(party.some(p=>!p.hero))return {ok:false,message:'All players must select a hero'};if(new Set(party.map(p=>p.hero)).size!==party.length)return {ok:false,message:'Duplicate heroes are disabled'};w.partySize=party.length;w.hostSeat=hostSeat;for(const p of party){p.active=true;p.level=1;p.skillRanks=[0,0,0,0];p.skillPoints=1;p.hp=hpmax(p);p.mana=mpmax(p);p.gold+=25*(p.blessings?.preparation||0)}w.started=true;enterRoom(w,1);return {ok:true}}

function makeMap(w,n,index){
 const pattern=Math.abs(index??n);
 const sets=[[],[{x:650,y:200,w:110,h:110},{x:970,y:690,w:110,h:110}], [{x:650,y:620,w:90,h:160},{x:980,y:200,w:90,h:160}], [{x:700,y:100,w:140,h:80},{x:700,y:820,w:140,h:80},{x:1150,y:460,w:100,h:100}],
 [{x:620,y:100,w:100,h:250},{x:620,y:650,w:100,h:250},{x:1120,y:390,w:100,h:220}],
 [{x:650,y:280,w:200,h:80},{x:650,y:640,w:200,h:80},{x:1120,y:440,w:120,h:120}],
 [{x:750,y:140,w:110,h:200},{x:980,y:420,w:110,h:160},{x:750,y:660,w:110,h:200}],
 [{x:650,y:220,w:100,h:130},{x:650,y:650,w:100,h:130},{x:1100,y:220,w:100,h:130},{x:1100,y:650,w:100,h:130}]];
 w.obstacles=(n===5||n===12||n===18)?[{x:400,y:130,w:100,h:100},{x:400,y:770,w:100,h:100},{x:1300,y:130,w:100,h:100},{x:1300,y:770,w:100,h:100}]:sets[pattern%sets.length].map(x=>({...x}));w.obstacles=w.obstacles.map(o=>({...o,x:o.x*1.5,y:o.y*1.5}));w.hazards=[];
}
function blocked(w,x,y,r=20){return (w.obstacles||[]).some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h)}
// Deterministic visibility graph around the expanded rectangular collision boxes.
// Returns waypoints including the destination, or null if no safe route exists.
export function labyrinthPath(w,start,end,r=20){
 const obs=w.obstacles||[],valid=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=r&&p.x<=LAB_WIDTH-r&&p.y>=r&&p.y<=LAB_HEIGHT-r&&!blocked(w,p.x,p.y,r);
 if(!valid(start)||!valid(end))return null;
 const clear=(a,b)=>!obs.some(o=>wallHit(a.x,a.y,b.x-a.x,b.y-a.y,o,r)<=1);
 if(clear(start,end))return [{x:end.x,y:end.y}];
 let nodes=[{x:start.x,y:start.y},{x:end.x,y:end.y}];
 for(const o of obs)for(const x of [o.x-r-4,o.x+o.w+r+4])for(const y of [o.y-r-4,o.y+o.h+r+4]){let p={x,y};if(valid(p))nodes.push(p)}
 const scores=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),seen=nodes.map(()=>false);scores[0]=0;
 for(let k=0;k<nodes.length;k++){let i=-1;for(let j=0;j<nodes.length;j++)if(!seen[j]&&(i<0||scores[j]<scores[i]))i=j;if(i<0||!Number.isFinite(scores[i]))break;if(i===1)break;seen[i]=true;for(let j=1;j<nodes.length;j++)if(!seen[j]&&clear(nodes[i],nodes[j])){let cost=scores[i]+dist(nodes[i],nodes[j]);if(cost<scores[j]){scores[j]=cost;prev[j]=i}}}
 if(!Number.isFinite(scores[1]))return null;let out=[],i=1;while(i>0){out.push(nodes[i]);i=prev[i]}return out.reverse();
}
function enemyWaypoint(w,e,target,dt){
 if(!w.obstacles?.length)return target;
 let n=e.nav;if(!n||n.ttl<=0||dist(n.goal,target)>80){n={goal:{x:target.x,y:target.y},ttl:.7,path:labyrinthPath(w,e,target,e.boss?48:(e.radius||20))||[]};e.nav=n}else n.ttl-=dt;
 while(n.path.length>1&&dist(e,n.path[0])<10)n.path.shift();return n.path[0]||target;
}
function moveUnit(w,u,dx,dy){let r=u.boss?48:(u.radius||20);let nx=clamp(u.x+dx,r,LAB_WIDTH-r),ny=clamp(u.y+dy,r,LAB_HEIGHT-r);if(!blocked(w,nx,u.y,r))u.x=nx;if(!blocked(w,u.x,ny,r))u.y=ny}
function dash(w,p,q){let dx=q.x-p.x,dy=q.y-p.y,steps=Math.ceil(Math.hypot(dx,dy)/15);for(let i=0;i<steps;i++)moveUnit(w,p,dx/steps,dy/steps)}

function spawn(w,id,elite=false){const d=ENEMIES[id];if(!d)return;const hp=d.hp*partyhp(w.partySize)*(1+.1*(w.room-1))*diffhp(w)*(elite?2:1)*((w.difficulty>=4&&[5,12,18].includes(w.room))?1.25:1);let ps=living(w),pos=null;const valid=(x,y,spacing)=>!blocked(w,x,y,35)&&ps.every(p=>dist(p,{x,y})>=spacing)&&ps.some(p=>[{x:p.x,y:p.y},{x:p.x+70,y:p.y},{x:p.x-70,y:p.y},{x:p.x,y:p.y+70},{x:p.x,y:p.y-70}].some(goal=>labyrinthPath(w,{x,y},goal,35)));
 for(let i=0;i<30&&!pos;i++){let x=1200+random(w)*780,y=150+random(w)*1200;if(valid(x,y,250))pos={x,y}}
 // Fall back to a deterministic open, connected grid rather than spawning in a wall.
 for(const spacing of [250,0]){if(pos)break;for(let y=70;y<=LAB_HEIGHT-70&&!pos;y+=80)for(let x=70;x<=LAB_WIDTH-70&&!pos;x+=80)if(valid(x,y,spacing))pos={x,y}}
 if(!pos)return false;let {x,y}=pos;const e={id:uid(w),kind:id,name:d.name,x,y,hp,maxHP:hp,attack:d.attack,interval:d.interval,speed:d.speed*.85,range:d.range,armor:d.armor||0,resist:d.resist||0,magic:!!d.magic,color:d.color,radius:elite?30:22,elite,modifiers:elite?shuffle(w,ELITES).slice(0,w.difficulty>=1?2:1):[],attackCD:1+random(w)*2,abilityCD:5+random(w)*5,status:{},portalUntil:w.seconds+PORTAL_DURATION,activeAt:w.seconds+PORTAL_DURATION+SPAWN_GRACE,lastAttacker:null};if(e.modifiers.includes('Armored'))e.armor+=8;if(e.modifiers.includes('Arcane'))e.resist+=.35;if(e.modifiers.includes('Swift')){e.speed*=1.25;e.interval/=1.25}w.enemies.push(e);return true}
function spawnBoss(w){const b=BOSS[w.room],hp=b.hp*partyhp(w.partySize)*diffhp(w);w.enemies.push({id:uid(w),kind:'boss',name:b.name,x:1575,y:750,hp,maxHP:hp,attack:b.attack,armor:b.armor,resist:b.resist,range:w.room===5?70:650,speed:(w.room===5?180:160)*.85,interval:1.5,attackCD:3,abilityCD:5,phase:1,radius:60,magic:w.room!==5,boss:true,status:{},color:w.room===5?'#d78f58':w.room===12?'#9f8cff':'#f6c65b',lastAttacker:null})}
export function labyrinthWaveQueue(room){
 const groups=[...(room.elite?[{id:room.elite,elite:true,num:1}]:[]),...room.groups.map(([id,num])=>({id,elite:false,num}))];
 const total=groups.reduce((n,g)=>n+g.num,0), target=Math.round(total*1.3);
 const counts=groups.map(g=>Math.floor(g.num*1.3));
 const order=groups.map((g,i)=>({i,remainder:g.num*1.3-counts[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
 const remaining=target-counts.reduce((a,b)=>a+b,0);for(let i=0;i<remaining;i++)counts[order[i].i]++;
 return groups.flatMap((g,i)=>Array.from({length:counts[i]},()=>({id:g.id,elite:g.elite})));
}
function roomOptions(w,n){const isElite=SCHEDULE[n-1]?.startsWith('elite');let list=isElite?ROOMS.filter(x=>!!x.elite):n<=4?ROOMS.slice(0,4):n<=10?ROOMS.slice(2,8):ROOMS.slice(4,10);let opts=shuffle(w,list).slice(0,2).map(r=>({name:r.name,type:isElite?'Elite combat':'Combat',index:ROOMS.indexOf(r),reward:SCHEDULE[n-1].includes('Shard')||SCHEDULE[n-1]==='shard'?'Shard':'Gold'}));if(n===8){opts[1]={name:'Mystery Event',type:'Event',index:-100,reward:'Event reward (replaces shard)'}}else if([3,10,16].includes(n)){let i=Math.floor(random(w)*TRAPS.length),t=TRAPS[i];opts[1]={name:t.name,type:'Trap',index:-i-1,reward:t.reward}}return opts}
function enterRoom(w,n,roomIndex,fog=false){w.room=n;w.fogAfter=fog?n:null;w.roomCounted=false;w.roomSerial=(w.roomSerial||0)+1;w.phase='prep';w.phaseTime=3;w.enemies=[];w.projectiles=[];w.zones=[];w.queue=[];w.hitGroups={};w.roomElapsed=0;w.spawnTimer=0;w.lastWaveAt=0;w.choiceIndex=roomIndex;w.lastStealable=null;let type=fog?'fog':SCHEDULE[n-1];w.roomType=type;w.trap=null;makeMap(w,n,roomIndex);for(const p of all(w)){p.x=300+p.seat*45;p.y=630+(p.seat%2)*70;p.walkX=p.walkY=0;p.status={};p.prison=0;p.revived=false;p.lastStandUsed=false;p.shield=0;p.reviveTarget=null;p.reviveProgress=0;p.invuln=3}
 if(roomIndex===-100)type='event';
 if(Number.isInteger(roomIndex)&&roomIndex<0&&roomIndex!==-100){let t=TRAPS[-roomIndex-1];w.roomType='trap';w.roomName=t.name;w.trap={kind:t.pattern,elapsed:0,timer:.5,exitX:2205,exitY:750,switches:t.pattern==='rocks'?[{x:675,y:375,progress:0},{x:1200,y:1110,progress:0},{x:1755,y:450,progress:0}]:[]};w.obstacles=[];w.route.push(t.name);return}
 if(type==='shop'){w.phase='shop';w.phaseTime=45;w.roomName='Rest & Shop';for(const p of all(w)){p.hp=hpmax(p)*(w.difficulty>=2?.8:1);p.mana=mpmax(p)*(w.difficulty>=2?.8:1);p.cd=[0,0,0,0];p.itemCD={}}return}
 if(type==='event'){let eventType=choice(w,['bargain','chest','flock']);w.eventType=eventType;w.roomName=eventType==='bargain'?'Aghanim’s Bargain':eventType==='chest'?'Mystery Chest':'Golden Flock';w.route.push(w.roomName);for(const p of all(w))p.eventChosen=false;if(eventType==='flock'){w.phase='prep';w.roomType='flock';w.flockTime=20;w.obstacles=[];for(let i=0;i<6;i++){spawn(w,'courier');let e=w.enemies.at(-1);e.maxHP=e.hp=150*partyhp(w.partySize);e.speed*=1.25;e.attackCD=999;e.x=1125+i*157.5;e.y=300+(i%3)*330;e.goldReward=40}return}w.phase='event';w.phaseTime=30;return}w.eventType=null;
 if(type==='boss'||type==='final'){w.roomName=BOSS[n].name;spawnBoss(w);w.route.push(w.roomName);return}
 let pool=ROOMS.filter(r=>!!r.elite===type.startsWith('elite')),r=ROOMS[roomIndex]||(n===1?ROOMS[0]:choice(w,pool));w.roomName=fog?'Fog · '+r.name:r.name;w.choiceIndex=ROOMS.indexOf(r);makeMap(w,n,w.choiceIndex);w.route.push(w.roomName);if(r.name==='Venom Garden')w.hazards=[{x:855,y:390,w:100,h:100,active:true},{x:1650,y:1005,w:100,h:100,active:true}];w.queue=shuffle(w,labyrinthWaveQueue(r));}
// Called only by the solo client or by the authenticated online host through the server.
export function labyrinthAdminCommand(w,a){
 if(!a||typeof a!=='object')return {ok:false,message:'Invalid testing command'};
 if(a.action==='unlock'){
  if(w.started||w.gameOver)return {ok:false,message:'Use unlock in the lobby before starting a run'};
  if(!Number.isInteger(a.value)||a.value<0||a.value>4)return {ok:false,message:'Unlock requires an integer from 0 to 4'};
  w.debugUnlock=Math.max(w.debugUnlock||0,a.value);w.debugRun=true;return {ok:true,message:'Testing: unlocked difficulty '+a.value+' for this run; permanent rewards disabled'};
 }
 if(!w.started)return {ok:false,message:'Start a run first'};
 if(a.action==='clear'){
  if(Object.hasOwn(a,'value'))return {ok:false,message:'Use clear without a value'};
  if(w.gameOver||!living(w).length)return {ok:false,message:'No active room to complete'};
  if(!['prep','combat','shop','event'].includes(w.phase))return {ok:false,message:'Choose the pending reward or route first'};
  w.debugRun=true;
  if(w.phase==='shop'){for(const p of all(w))p.ready=false;advance(w)}
  else if(w.phase==='event'){for(const p of all(w))if(!p.eventChosen)chooseEvent(w,p,w.eventType==='chest'?'chest':'gold');advance(w)}
  else{w.phase='combat';w.queue=[];clearRoom(w)}
  return {ok:true,message:'Testing: room completed; resolve any reward or route choice'};
 }
 if(a.action==='level'){
  if(!Number.isInteger(a.value)||a.value<1||a.value>18)return {ok:false,message:'Level must be an integer from 1 to 18'};
  w.debugRun=true;w.gameOver=false;w.winner=null;w.choices=[];w.route=[];w.completedRooms=a.value-1;w.fogAfterVote=false;w.pendingAfterFog=null;
  for(const p of all(w)){
   p.level=levelForClears(a.value-1);p.skillRanks=[0,0,0,0];p.skillPoints=p.level;p.reactive=0;p.souls=0;
   p.hp=hpmax(p);p.mana=mpmax(p);p.cd=[0,0,0,0];p.itemCD={};p.attackCD=0;p.channel=null;p.offer=[];p.vote=null;p.ready=false;p.eventChosen=false;p.stolen=null;p.walkUntil=0;
  }
  enterRoom(w,a.value);return {ok:true,message:'Testing: entered room '+a.value};
 }
 if(a.action==='damage'){
  if(typeof a.value!=='number'||!Number.isFinite(a.value)||a.value<1||a.value>1000)return {ok:false,message:'Damage multiplier must be between 1 and 1000'};
  w.debugRun=true;w.debugDamageMultiplier=a.value;return {ok:true,message:'Testing: damage ×'+a.value};
 }
 return {ok:false,message:'Unknown testing command'};
}
function offer(w,p,legend){let pool=legend?(LEGENDARY[p.hero]||[]).filter(([name])=>!p.legendary.includes(name)).map(([name,desc])=>({id:name,name,desc,legend:true})):SHARDS.filter(s=>count(p,s.id)<(s.unique?1:2));p.offer=shuffle(w,pool).slice(0,3).map(x=>({...x}));p.offerLegend=legend}
function applyOffer(p,opt){let old=hpmax(p),oldm=mpmax(p);if(opt.legend)p.legendary.push(opt.id);else p.shards.push(opt.id);p.hp+=hpmax(p)-old;p.mana+=mpmax(p)-oldm;p.offer=[]}
function clearRoom(w){if(w.phase!=='combat'||!living(w).length)return;w.enemies=[];w.projectiles=[];w.zones=[];for(const p of all(w)){if(p.hp<=0){p.hp=hpmax(p)*.5;p.mana=mpmax(p)*.5}else{p.hp=Math.min(hpmax(p),p.hp+hpmax(p)*.15);p.mana=Math.min(mpmax(p),p.mana+mpmax(p)*.2)}p.fragments+=(w.roomType==='fog'?25:(w.room===5||w.room===12?50:20));let gold=w.roomType==='fog'?225:w.room===5?350:w.room===12?500:w.roomType==='flock'?0:w.roomType==='trap'?(w.trap?.kind==='laser'?250:w.trap?.kind==='rocks'?0:200):w.roomType.startsWith('elite')?250:150;p.gold+=gold;if(w.trap?.kind==='rocks')p.tokens=Math.min(2,p.tokens+1);if(w.trap?.kind==='poison')heal(p,hpmax(p)*.2,p);if(w.room===9&&w.roomType!=='fog')p.tokens=Math.min(2,p.tokens+1)}
 completeProgress(w);
 if(w.room===18){w.phase='victory';w.gameOver=true;w.winner='party';for(const p of all(w))p.fragments+=100;return}
 const legendary=w.room===5||w.room===12,basic=['shard','eliteShard','choiceShard'].includes(w.roomType);if(legendary||basic){w.phase='offer';w.phaseTime=30;for(const p of all(w))offer(w,p,legendary)}else advance(w)}
function completeProgress(w){if(!w.roomCounted){w.completedRooms=(w.completedRooms||0)+1;w.roomCounted=true;grantLevels(w,w.completedRooms)}}
function advance(w){completeProgress(w);if(w.fogAfter){if(w.pendingAfterFog!=null){let index=w.pendingAfterFog;w.pendingAfterFog=null;enterRoom(w,w.room+1,index);return}}else if([6,9].includes(w.room)){enterRoom(w,w.room,undefined,true);return}let next=w.room+1;if(next>18)return;let nextType=SCHEDULE[next-1];if(['choice','choiceShard','elite','eliteShard','shard','combat'].includes(nextType)&&next!==1){w.phase='vote';w.phaseTime=20;w.choices=roomOptions(w,next);for(const p of all(w))p.vote=null}else enterRoom(w,next)}
function resolveVote(w){let counts=w.choices.map((_,i)=>all(w).filter(p=>p.vote===i).length);let hostVote=w.players[w.hostSeat]?.vote;let chosen=counts[1]>counts[0]?1:counts[0]>counts[1]?0:hostVote===1?1:0;if(w.fogAfterVote){let index=w.choices[chosen].index;w.fogAfterVote=false;w.pendingAfterFog=index;enterRoom(w,w.room,undefined,true)}else enterRoom(w,w.room+1,w.choices[chosen].index)}
const materialized=(w,e)=>w.seconds+1e-9>=(e.portalUntil||0);
function deal(w,source,target,raw,type='magic'){if(!target||!materialized(w,target)||target.hp<=0||raw<=0||target.invuln>0)return 0;let p=source&&w.players[source],a=raw;if(p){a*=w.debugDamageMultiplier||1;a*=type==='magic'||type==='pure'?spellamp(p,w):1;if(count(p,'execution')&&target.hp/target.maxHP<.3)a*=1+.12*count(p,'execution');if((target.boss||target.elite)&&count(p,'giant'))a*=1+.1*count(p,'giant')}if(target.boss&&target.transition>0)return 0;if(type==='physical'){let aura=living(w).find(x=>x.hero==='sf'&&rank(x,2)>0&&dist(x,target)<=350);let reduction=aura?(.5+.5*rank(aura,2)+(leg(aura,'Dread Presence')?3:0)):0;a*=physical((target.armor||0)-reduction)}if(type==='magic')a*=1-clamp(target.resist||0,0,.75);a=Math.max(0,a);let absorbed=Math.min(target.shield||0,a);target.shield=Math.max(0,(target.shield||0)-absorbed);a-=absorbed;target.hp=Math.max(0,target.hp-a);if(target.maledict)target.maledict.record+=a;if(p){p.stats.damage+=a+absorbed;target.lastAttacker=p.id}if(target.hp<=0&&ENEMIES[target.kind]&&target.kind!=='courier')for(const sf of living(w))if(sf.hero==='sf'&&rank(sf,1)>0&&dist(sf,target)<=600)sf.souls=Math.min(5*rank(sf,1)+(leg(sf,'Soul Furnace')?10:0),sf.souls+(target.elite?3:1));return a+absorbed}
function hurt(w,p,raw,type='physical',src){if(p.hp<=0||p.invuln>0)return;let d=raw*damageParty(w.partySize)*diffdamage(w)*(1+.035*(w.room-1)*(src?.boss?0:1));if(type==='physical')d*=physical(armor(p,w));else d*=1-clamp(.1*count(p,'resist')+(p.status.bkb>0?.35:0)+(p.status.restoreBuff>0?.15:0)+(p.hero==='timber'&&leg(p,'Living Armor')?.01*p.reactive:0),0,.75);if(p.hero==='mars'&&rank(p,2)>0&&src&&Math.cos(Math.atan2(src.y-p.y,src.x-p.x)-Math.atan2(p.aimY-p.y,p.aimX-p.x))>Math.cos(Math.PI/3)&&(type==='physical'||leg(p,'Shield Wall')))d*=1-(.06+.04*rank(p,2));if(p.shield>0){let q=Math.min(p.shield,d);p.shield-=q;d-=q}p.hp=Math.max(0,p.hp-d);p.lastHit=0;if(p.hero==='timber'&&rank(p,2)>0){p.reactive=Math.min(2*rank(p,2)+(leg(p,'Living Armor')?4:0),p.reactive+1);p.reactiveTTL=5};if(src?.modifiers?.includes('Vampiric'))src.hp=Math.min(src.maxHP,src.hp+d*.2);if(p.status.blade>0&&src)deal(w,p.id,src,d*.3,'magic');if(p.hp<=0){p.stats.deaths++;p.walkX=p.walkY=0;p.reviveTarget=null;p.reviveProgress=0;event(w,'death',{player:p.id})}else if(!p.lastStandUsed&&count(p,'last')&&p.hp/hpmax(p)<.3){p.lastStandUsed=true;p.shield+=180*(1+.2*count(p,'healing'));p.shieldTime=4}}
function heal(p,amount,from){if(p.hp<=0)return;let h=Math.min(hpmax(p)-p.hp,amount*(from?1+.2*count(from,'healing'):1));p.hp+=h;if(from)from.stats.healing+=h}
// Aimed casts and projectiles share this capped, additive prototype range bonus.
function rangeMult(p,spell=true){return 1+Math.min(.35,.12*count(p,'reach')+(has(p,'lens')?.15:0)+(spell&&p.hero==='rubick'?.0375*rank(p,2):0))}
function point(p,x,y,range){range*=rangeMult(p);x=Number.isFinite(x)?x:p.aimX;y=Number.isFinite(y)?y:p.aimY;let dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,range/d);return {x:clamp(p.x+dx*k,25,LAB_WIDTH-25),y:clamp(p.y+dy*k,25,LAB_HEIGHT-25)}}
function circle(w,p,x,y,r,damage,type='magic',opts={}){let hits=0;for(const e of w.enemies)if(e.hp>0&&materialized(w,e)&&dist(e,{x,y})<=r+e.radius){deal(w,p.id,e,damage,type);hits++;if(opts.slow)e.status.slow=Math.max(e.status.slow||0,opts.slow);if(opts.silence)e.status.silence=Math.max(e.status.silence||0,opts.silence);if(opts.stun){if(!e.boss)e.status.stun=Math.max(e.status.stun||0,opts.stun);else if(!(e.interruptCD>0)){e.status.stun=.5;e.interruptCD=8}}}return hits}
function projectile(w,p,damage,range,type='physical',angle=0,extra={}){let d=Math.atan2(p.aimY-p.y,p.aimX-p.x)+angle;w.projectiles.push({id:uid(w),owner:p.id,x:p.x,y:p.y,vx:Math.cos(d)*850,vy:Math.sin(d)*850,left:range*rangeMult(p,!extra.basic),damage,type,radius:8,...extra})}
function zone(w,p,x,y,r,duration,damage,kind='damage',extra={}){w.zones.push({id:uid(w),owner:p?.id,x,y,radius:r,left:duration,tick:0,damage,kind,...extra})}
function targets(w,p,range=700){let pt=point(p,p.aimX,p.aimY,range);return w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&dist(e,p)<=range*rangeMult(p)&&dist(e,pt)<90+e.radius).sort((a,b)=>dist(a,pt)-dist(b,pt))}
function cleaveAttack(w,p,first,damage,ratio=.25){for(const e of w.enemies)if(e!==first&&e.hp>0&&dist(e,first)<=180)deal(w,p.id,e,damage*ratio,'physical')}
function chainLightning(w,p,first){let targets=w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&e!==first&&dist(e,first)<=250).sort((a,b)=>dist(a,first)-dist(b,first)).slice(0,3);for(let e of [first,...targets])deal(w,p.id,e,80,'magic')}
function attack(w,p){if(p.attackCD>0)return;const h=getHero(p.hero),base=h.attack+(p.level-1)*1.8+(has(p,'wraith')?12:0)+(has(p,'maelstrom')?15:0)+(has(p,'daedalus')?30:0)+(p.hero==='sf'&&rank(p,1)>0?p.souls*2:0);p.attackCount++;let damage=base*(1+.01*(p.blessings?.training||0)+.15*count(p,'attack')+(p.status.empower>0?(p.empowerBonus||0):0));if(has(p,'daedalus')&&p.attackCount%4===0)damage*=1.7;if(p.hero==='sniper'&&rank(p,1)>0&&p.attackCount%4===0)damage+=75*(leg(p,'Concussive Headshot')?1.5:1)*basicPower(p,1);if(p.hero==='jugger'&&rank(p,2)>0&&p.attackCount%(leg(p,'Flurry')?3:4)===0)damage+=75*basicPower(p,2);if(p.hero==='drow'&&p.status.marksmanship>0&&p.attackCount%(leg(p,'Ranger’s Precision')?2:3)===0)damage+=100*ultimatePower(p);p.attackCD=1/(1+.15*count(p,'speed')+(has(p,'wraith')?.1:0)+(p.status.marksmanship>0?.35:0)+(p.status.takeAim>0?(p.takeAimSpeed||0):0));let range=h.range+(p.status.takeAim>0?(p.takeAimRange||0):0);if(h.range<=200){range*=.5;let angle=Math.atan2(p.aimY-p.y,p.aimX-p.x);w.projectiles.push({id:uid(w),kind:'melee_wave',owner:p.id,x:p.x,y:p.y,angle,reach:0,range,left:range,damage,hitIds:[],cleave:p.status.empower>0,cleaveRatio:p.empowerCleave||.25,lightning:has(p,'maelstrom')&&p.attackCount%4===0})}else projectile(w,p,damage,range,'physical',0,{basic:true,frost:p.status.frost>0?18*basicPower(p,0):0,lightning:has(p,'maelstrom')&&p.attackCount%4===0,cleave:p.status.empower>0,cleaveRatio:p.empowerCleave||.25});if(p.hero==='drow'&&p.status.frost>0)p.frostShots=Math.max(0,(p.frostShots||0)-1);if(!p.frostShots)p.status.frost=0}
// Used by both the combat engine and skill bar so cost modifiers cannot drift.
export function labyrinthManaCost(w,p,slot){const s=SKILLS[p?.hero]?.[slot];if(!s||s.passive)return null;if(p.hero==='rubick'&&slot===3&&p.stolen&&p.stolen.expires>w.seconds)return 0;return Math.ceil(s.mana*Math.max(.5,1-.12*count(p,'mana_cost')))}
function cast(w,p,slot){if(!Number.isInteger(slot)||slot<0||slot>3||!rank(p,slot))return {ok:false,message:'Learn this ability first'};if(w.phase==='combat'&&p.hp>0&&p.hero==='rubick'&&slot===3&&p.stolen&&p.stolen.expires>w.seconds){let q=point(p,p.aimX,p.aimY,650),kind=p.stolen.kind;if(kind==='hellbear')circle(w,p,q.x,q.y,240,70*ultimatePower(p),'magic',{slow:2});if(kind==='satyr')circle(w,p,q.x,q.y,90,55*ultimatePower(p));if(kind==='adept'){circle(w,p,q.x,q.y,220,28*ultimatePower(p));for(const e of w.enemies)if(materialized(w,e)&&!e.boss&&dist(e,q)<220)moveUnit(w,e,(q.x-e.x)*.5,(q.y-e.y)*.5)}if(kind==='pudge')projectile(w,p,80*ultimatePower(p),650,'physical',0,{slow:1});if(--p.stolen.charges<=0)p.stolen=null;return {ok:true}}if(p.hero==='rubick'&&slot===3&&(!w.lastStealable||w.seconds-w.lastStealable.at>30||dist(p,w.lastStealable)>700*rangeMult(p)))return {ok:false,message:'No eligible enemy spell within range'};const s=SKILLS[p.hero]?.[slot];if(!s||s.passive||p.hp<=0||w.phase!=='combat'||(p.cd[slot]>0&&!(p.hero==='sniper'&&slot===0&&leg(p,'Shrapnel Storm')&&(p.shrapnelCharges??2)>0)))return {ok:false,message:'Ability unavailable'};if((p.hero==='rubick'||p.hero==='cm')&&slot===1&&!targets(w,p).length)return {ok:false,message:'No valid target in range'};let cost=labyrinthManaCost(w,p,slot);if(p.mana<cost)return {ok:false,message:'Not enough mana'};p.mana-=cost;let cd=s.cd*(1-Math.min(.35,.1*count(p,'cooldown')+(has(p,'octarine')?.15:0)));if(p.hero==='timber'&&slot===1&&leg(p,'Steel Momentum'))cd-=4;if(p.hero==='magnus'&&slot===2&&leg(p,'Skewer Mastery'))cd-=4;p.cd[slot]=Math.max(1,cd);let power=slot===3?ultimatePower(p):basicPower(p,slot),pt=point(p,p.aimX,p.aimY,650),near=targets(w,p),hit=near[0];
 switch(p.hero){
 case 'drow':
  if(slot===0){p.status.frost=6;p.frostShots=5;if(leg(p,'Winter’s Embrace')){let ally=living(w).filter(a=>dist(a,p)<500).sort((a,b)=>a.hp/hpmax(a)-b.hp/hpmax(b))[0];if(ally){ally.shield+=100*(1+.2*count(p,'healing'));ally.shieldTime=4}}}
  if(slot===1)circle(w,p,pt.x,pt.y,leg(p,'Silencing Gale')?300:200,90*power,'magic',{slow:2,silence:leg(p,'Silencing Gale')?3.5:2});
  if(slot===2)for(let i=-1;i<=1;i++)for(let j=0;j<3;j++)projectile(w,p,45*power,700,'physical',i*.17,{delay:j*.3,slow:leg(p,'Glacial Volley')?2:0,frost:leg(p,'Glacial Volley')?15*power:0});
  if(slot===3)p.status.marksmanship=8;break;
 case 'timber':
  if(slot===0){let hits=circle(w,p,p.x,p.y,260,120*power,'pure');if(leg(p,'Whirling Harvest'))heal(p,Math.min(100,hits*20),p)}
  if(slot===1){let q=point(p,p.aimX,p.aimY,650);dash(w,p,q);circle(w,p,p.x,p.y,140,100*power)}
  if(slot===3){zone(w,p,pt.x,pt.y,220,4,70*power,'damage',{initial:80*power});circle(w,p,pt.x,pt.y,220,80*power);if(leg(p,'Twin Saws'))zone(w,p,clamp(pt.x+180,25,LAB_WIDTH-25),pt.y,220,4,49*power)}break;
 case 'sf':
  if(slot===0){let angle=Math.atan2(p.aimY-p.y,p.aimX-p.x),ds=leg(p,'Triple Raze')?[250,450,650]:[350];for(let d of ds)circle(w,p,p.x+Math.cos(angle)*d,p.y+Math.sin(angle)*d,200,150*power*(ds.length>1?.65:1))}
  if(slot===3){p.castSerial=(p.castSerial||0)+1;let g=p.id+'-requiem-'+p.castSerial;for(let i=0;i<12;i++)projectile(w,p,130*power,700,'magic',i*Math.PI/6,{pierce:true,hitIds:[],hitGroup:g,maxGroupHits:2,decay:1});if(leg(p,'Echoing Requiem'))for(let i=0;i<12;i++)projectile(w,p,65*power,700,'magic',i*Math.PI/6,{pierce:true,hitIds:[],delay:1,hitGroup:g+'-echo',maxGroupHits:2,decay:1})}break;
 case 'rubick':
  if(slot===0){let list=w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&dist(e,pt)<300).sort((a,b)=>dist(a,pt)-dist(b,pt)).slice(0,leg(p,'Forked Bolt')?6:4);list.forEach((e,i)=>deal(w,p.id,e,120*power*(leg(p,'Forked Bolt')?1:Math.pow(.85,i))))}
  if(slot===1&&hit){circle(w,p,hit.x,hit.y,leg(p,'Grand Lift')?280:180,110*power*(leg(p,'Grand Lift')?1.75:1),'magic',{stun:1.5,slow:2})}
  if(slot===3)p.stolen={kind:w.lastStealable.kind,expires:w.seconds+15,charges:leg(p,'Arcane Theft')?2:1};break;
 case 'sniper':
  if(slot===0){zone(w,p,pt.x,pt.y,230,5,35*power,'damage',{slow:1});if(leg(p,'Shrapnel Storm')){p.shrapnelCharges=(p.shrapnelCharges??2)-1;p.shrapnelRecharge=p.shrapnelRecharge||16}}
  if(slot===2){p.status.takeAim=5;p.takeAimRange=55*rank(p,2);p.takeAimSpeed=.05*rank(p,2)};
  if(slot===3)projectile(w,p,430*power,1200,'magic',0,{pierce:leg(p,'Perfect Shot'),hitIds:[]});break;
 case 'cm':
  if(slot===0){circle(w,p,pt.x,pt.y,240,130*power,'magic',{slow:3});if(leg(p,'Frozen Ground'))zone(w,p,pt.x,pt.y,240,4,30*power)}
  if(slot===1&&hit){deal(w,p.id,hit,125*power);hit.status.stun=hit.boss?0:2;hit.status.slow=2;if(leg(p,'Chain Frostbite')){let e=w.enemies.find(e=>e!==hit&&e.hp>0&&dist(e,hit)<250);if(e){deal(w,p.id,e,70*power);if(!e.boss)e.status.stun=2;e.status.slow=2}}}
  if(slot===3){p.channel={kind:'blizzard',left:5,tick:0,damage:90*power};p.shield+=180*(1+.2*count(p,'healing'));p.shieldTime=5}break;
 case 'jugger':
  if(slot===0){p.status.spin=leg(p,'Blade Storm')?6:4;p.spinPower=75*power}
  if(slot===1)zone(w,p,pt.x,pt.y,280,6,30*power*(leg(p,'Wandering Ward')?1.25:1),'heal',{follow:leg(p,'Wandering Ward')});
  if(slot===3){p.invuln=2;let list=w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&dist(e,pt)<300);for(let i=0;i<(leg(p,'Long Omnislash')?9:6)&&list.length;i++)deal(w,p.id,list[i%list.length],85*power,'physical')}break;
 case 'mars':
  if(slot===0){projectile(w,p,175*power,750,'physical',leg(p,'Twin Spears')?-.1:0,{slow:1});if(leg(p,'Twin Spears'))projectile(w,p,131.25*power,750,'physical',.1,{slow:1})}
  if(slot===1){let n=circle(w,p,pt.x,pt.y,220,170*power,'physical');if(leg(p,'Rebuke Recovery'))heal(p,Math.min(125,n*25),p)}
  if(slot===3)zone(w,p,p.x,p.y,430,leg(p,'Unbreakable Arena')?9:6,120*power,'ring');break;
 case 'witch':
  if(slot===0){let list=w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&dist(e,pt)<450).slice(0,leg(p,'Bouncing Madness')?8:5);list.forEach(e=>{deal(w,p.id,e,80*power);if(!e.boss)e.status.stun=.6})}
  if(slot===1){p.status.restore=5;p.restorePower=35*power}
  if(slot===2){circle(w,p,pt.x,pt.y,200,40*power);for(const e of w.enemies)if(e.hp>0&&materialized(w,e)&&dist(e,pt)<=200+e.radius)e.maledict={owner:p.id,left:4,record:0,cap:350*power*(leg(p,'Deep Curse')?1.5:1),ratio:leg(p,'Deep Curse')?.3:.2}}
  if(slot===3)p.channel={kind:'ward',left:5,tick:0,damage:95*power};break;
 case 'magnus':
  if(slot===0){projectile(w,p,140*power,750,'magic',0,{pierce:true,hitIds:[]});if(leg(p,'Double Wave')){let a=Math.atan2(p.aimY-p.y,p.aimX-p.x),r=750*rangeMult(p);w.projectiles.push({id:uid(w),owner:p.id,x:clamp(p.x+Math.cos(a)*r,25,LAB_WIDTH-25),y:clamp(p.y+Math.sin(a)*r,25,LAB_HEIGHT-25),vx:-Math.cos(a)*850,vy:-Math.sin(a)*850,left:r,damage:84*power,type:'magic',radius:8,pierce:true,hitIds:[],delay:.8})}}
  if(slot===1){let allies=leg(p,'Battle Horn')?living(w).filter(a=>dist(a,p)<350):[living(w).filter(a=>dist(a,pt)<100&&dist(a,p)<500)[0]||p];for(let a of allies){a.status.empower=leg(p,'Battle Horn')?6:8;a.empowerBonus=.0625*rank(p,1);a.empowerCleave=.0625*rank(p,1)}}
  if(slot===2){let q=point(p,p.aimX,p.aimY,leg(p,'Skewer Mastery')?700:500);dash(w,p,q);circle(w,p,p.x,p.y,150,135*power,'physical',{slow:2})}
  if(slot===3)circle(w,p,p.x,p.y,leg(p,'Polar Collapse')?450:350,180*power*(leg(p,'Polar Collapse')?1.5:1),'magic',{stun:2,slow:1});break;
 }
 event(w,'cast',{player:p.id,slot});return {ok:true};}
function buy(w,p,id){if(w.phase!=='shop')return {ok:false,message:'Shop opens in rest rooms'};let item=ITEMS.find(i=>i.id===id);if(!item)return {ok:false,message:'Unknown item'};if(!item.consumable&&(p.items.includes(id)||p.items.length>=6))return {ok:false,message:'Already owned or inventory full'};if(item.consumable&&(p.potions[id]||0)>=99)return {ok:false,message:'Potion stack is full'};let cost=Math.max(0,item.cost-(p.tokens>0&&!item.consumable?300:0));if(p.gold<cost)return {ok:false,message:'Not enough gold'};p.gold-=cost;if(p.tokens>0&&!item.consumable)p.tokens--;let old=hpmax(p),oldm=mpmax(p);if(item.consumable){p.potions[id]=(p.potions[id]||0)+1}else p.items.push(id);p.hp+=hpmax(p)-old;p.mana+=mpmax(p)-oldm;return {ok:true}}
function itemUse(w,p,id){if(p.hp<=0||w.phase!=='combat')return {ok:false,message:'Only while alive in combat'};if(['healing','mana_potion','clarity'].includes(id)){if(!(p.potions[id]>0))return {ok:false,message:'No potion of this type'};p.potions[id]--;if(id==='healing')heal(p,hpmax(p)*.4);else if(id==='mana_potion')p.mana=Math.min(mpmax(p),p.mana+mpmax(p)*.4);else {heal(p,120,p);p.mana=Math.min(mpmax(p),p.mana+100)}return {ok:true}}if(!has(p,id)||(p.itemCD[id]||0)>0)return {ok:false,message:'Item unavailable'};switch(id){case 'blade':p.status.blade=3;p.itemCD[id]=25;break;case 'blink':if(p.lastHit<3)return {ok:false,message:'Blink disabled after damage'};{let q=point(p,p.aimX,p.aimY,500);dash(w,p,q);p.itemCD[id]=16}break;case 'force':{let ally=living(w).find(a=>a.id!==p.id&&dist(a,p)<=500&&Math.hypot(a.x-p.aimX,a.y-p.aimY)<80)||p;let q=point(ally,p.aimX,p.aimY,300);dash(w,ally,q);p.itemCD[id]=18}break;case 'mek':for(const a of living(w))if(dist(a,p)<350)heal(a,180,p);p.itemCD[id]=30;break;case 'bkb':p.status.bkb=5;p.itemCD[id]=40;break;case 'shiva':circle(w,p,p.x,p.y,350,150,'magic',{slow:3});p.itemCD[id]=30;break;default:return {ok:false,message:'Passive item'}}return {ok:true}}
function chooseEvent(w,p,option){if(w.eventType==='chest'&&option==='chest'){let r=random(w);if(r<.5)p.gold+=200;else if(r<.8){if(p.potions.healing<99){p.potions.healing++}else p.gold+=150}else if(p.tokens<2)p.tokens++;else p.gold+=150}else if(w.eventType==='bargain'&&option==='gold')p.gold+=150;else if(w.eventType==='bargain'&&option==='heal'){heal(p,hpmax(p)*.5,p);p.mana=Math.min(mpmax(p),p.mana+mpmax(p)*.5)}else if(w.eventType==='bargain'&&option==='power'&&!p.bargain){p.bargain=true;p.hp=Math.min(p.hp,hpmax(p))}else return {ok:false,message:'Invalid event choice'};p.eventChosen=true;return {ok:true}}
export function labyrinthCommand(w,id,a){const p=w.players[id];if(!p||!a||typeof a!=='object')return {ok:false,message:'Unknown player'};if(a.type==='name'){p.name=String(a.name||'Player').trim().slice(0,24)||'Player';return {ok:true}}if(a.type==='blessings'&&!w.started){const limits={fortitude:5,arcane:5,training:5,spellcraft:5,preparation:3,recovery:3};if(!a.ranks||Object.entries(limits).some(([k,v])=>!Number.isInteger(a.ranks[k])||a.ranks[k]<0||a.ranks[k]>v))return {ok:false,message:'Invalid blessing ranks'};p.blessings=Object.fromEntries(Object.keys(limits).map(k=>[k,a.ranks[k]]));return {ok:true}}if(a.type==='hero'&&!w.started){if(!getHero(a.hero))return {ok:false,message:'Unknown hero'};if(Object.values(w.players).some(q=>q!==p&&q.hero===a.hero))return {ok:false,message:'Hero already selected'};p.hero=a.hero;return {ok:true}}if(a.type==='profile_unlock'&&!w.started){if(!Number.isInteger(a.value)||a.value<0||a.value>4)return {ok:false,message:'Invalid unlocked difficulty'};p.unlocked=a.value;return {ok:true}}
 if(a.type==='difficulty'&&!w.started){if(!Number.isInteger(a.value)||a.value<0||a.value>4)return {ok:false,message:'Invalid difficulty'};if(a.value>labyrinthPartyUnlock(w))return {ok:false,message:'Difficulty is not unlocked by this party'};w.difficulty=a.value;return {ok:true}}if(w.gameOver)return {ok:false,message:'Run finished'};if(!p.active)return {ok:false,message:'Not in this run'};
 if(a.type==='skill_up'){const reason=labyrinthSkillUpgradeReason(p,a.slot);if(reason)return {ok:false,message:reason};p.skillRanks[a.slot]++;p.skillPoints--;return {ok:true}}
 if(a.type==='walk'){if(!Number.isFinite(a.dx)||!Number.isFinite(a.dy))return {ok:false,message:'Invalid direction'};let d=Math.max(1,Math.hypot(a.dx,a.dy));p.walkX=a.dx/d;p.walkY=a.dy/d;p.walkUntil=w.seconds+.35;return {ok:true}}
 if(a.type==='aim'||a.type==='attack'||a.type==='cast'||a.type==='item'){if(Number.isFinite(a.x)&&Number.isFinite(a.y)){p.aimX=clamp(a.x,0,LAB_WIDTH);p.aimY=clamp(a.y,0,LAB_HEIGHT)}}
 if(a.type==='aim')return {ok:true};if(a.type==='attack'){if(w.phase==='combat'&&p.hp>0)attack(w,p);return {ok:true}}if(a.type==='cast')return cast(w,p,Number(a.slot));if(a.type==='item')return itemUse(w,p,a.item);if(a.type==='buy')return buy(w,p,a.item);
 if(a.type==='sell'&&w.phase==='shop'){let i=p.items.indexOf(a.item),it=ITEMS.find(x=>x.id===a.item);if(i<0||!it)return {ok:false,message:'Item not owned'};p.items.splice(i,1);p.gold+=Math.floor(it.cost*.5);p.hp=Math.min(p.hp,hpmax(p));p.mana=Math.min(p.mana,mpmax(p));return {ok:true}}
 if(a.type==='offer'&&w.phase==='offer'){let opt=p.offer.find(o=>o.id===a.id);if(!opt)return {ok:false,message:'Invalid shard'};applyOffer(p,opt);if(all(w).every(q=>!q.offer.length))advance(w);return {ok:true}}
 if(a.type==='reroll'&&w.phase==='offer'&&p.rerolls&&p.offer.length){p.rerolls--;let old=p.offer.map(o=>o.id);offer(w,p,p.offerLegend);let pool=(p.offerLegend?LEGENDARY[p.hero].filter(([name])=>!p.legendary.includes(name)).map(([name,desc])=>({id:name,name,desc,legend:true})):SHARDS.filter(s=>count(p,s.id)<(s.unique?1:2))).filter(x=>!old.includes(x.id));if(pool.length>=3)p.offer=shuffle(w,pool).slice(0,3);return {ok:true}}
 if(a.type==='vote'&&w.phase==='vote'&&(a.index===0||a.index===1)){p.vote=a.index;if(all(w).every(q=>q.vote!==null))resolveVote(w);return {ok:true}}
 if(a.type==='ready'&&w.phase==='shop'){p.ready=true;if(all(w).every(q=>q.ready)){for(const q of all(w))q.ready=false;advance(w)}return {ok:true}}
 if(a.type==='event'&&w.phase==='event'&&!p.eventChosen){let result=chooseEvent(w,p,a.option);if(result.ok&&all(w).every(q=>q.eventChosen))advance(w);return result}
 if(a.type==='revive'){let t=w.players[a.target];if(w.phase!=='combat'||!t||t.id===p.id||!t.active||t.hp>0||t.revived||p.hp<=0||dist(p,t)>100)return {ok:false,message:'Move close to a dead ally'};p.reviveTarget=t.id;p.reviveProgress=0;return {ok:true}}
 return {ok:false,message:'Action not available'};}
function hazard(w,x,y,r,damage,delay=1,extra={}){zone(w,null,x,y,r,delay,damage,'warning',extra)}
function bossBolt(w,e,angle,damage=90){w.projectiles.push({id:uid(w),enemy:e.id,x:e.x,y:e.y,vx:Math.cos(angle)*400,vy:Math.sin(angle)*400,left:1600,damage,type:'magic',radius:11})}
function bossWarning(w,e,x,y,r,damage,delay=1.2,extra={}){zone(w,null,x,y,r,delay,damage,'warning',{enemy:e.id,...extra})}
function bossThink(w,e,dt){
 const ratio=e.hp/e.maxHP,phase=w.room===5?(ratio<=.5?2:1):w.room===12?(ratio<=.3?3:ratio<=.6?2:1):(ratio<=.35?3:ratio<=.7?2:1);
 if(phase>e.phase){e.phase=phase;e.transition=2;e.abilityCD=Math.max(e.abilityCD,2);event(w,'bossPhase',{phase})}e.transition=Math.max(0,(e.transition||0)-dt);e.abilityCD-=dt;if(e.abilityCD>0||e.transition>0)return;
 let ps=living(w);if(!ps.length)return;let target=choice(w,ps);e.castCount=(e.castCount||0)+1;let enrage=1+.1*Math.max(0,Math.floor((w.roomElapsed-240)/30)+1),k=e.castCount;
 if(w.room===5){e.abilityCD=phase>1?8:10;let type=k%4;if(type===0){for(let i=0;i<3;i++)bossWarning(w,e,clamp(target.x+(random(w)-.5)*280,80,LAB_WIDTH-80),clamp(target.y+(random(w)-.5)*280,80,LAB_HEIGHT-80),120,100*enrage,1)}else if(type===1){let a=Math.atan2(target.y-e.y,target.x-e.x);for(let i=1;i<=5;i++)bossWarning(w,e,clamp(e.x+Math.cos(a)*i*150,50,LAB_WIDTH-50),clamp(e.y+Math.sin(a)*i*150,50,LAB_HEIGHT-50),105,140*enrage,1.2)}else if(type===2)bossWarning(w,e,e.x,e.y,300,120*enrage,1.2);else for(let i=0;i<3;i++)bossWarning(w,e,target.x+(i-1)*130,target.y,120,100*enrage,1)}
 else if(w.room===12){e.abilityCD=8;let type=k%4;if(type===0){for(let i=0;i<2&&w.enemies.filter(x=>x.kind==='construct').length<4;i++)spawn(w,'construct')}else if(type===1){for(let i=0;i<3;i++)bossWarning(w,e,clamp(target.x+(i-1)*220,70,LAB_WIDTH-70),clamp(target.y+(i-1)*100,70,LAB_HEIGHT-70),150,120*enrage,1.2)}else if(type===2){bossWarning(w,e,target.x,target.y,300,120*enrage,1.2);if(phase>=2)zone(w,null,target.x,target.y,200,4,30*enrage,'enemyField',{enemy:e.id})}else{let a=Math.atan2(target.y-e.y,target.x-e.x);for(let i=1;i<=6;i++)bossWarning(w,e,clamp(e.x+Math.cos(a)*i*140,50,LAB_WIDTH-50),clamp(e.y+Math.sin(a)*i*140,50,LAB_HEIGHT-50),75,150*enrage,1);if(phase===3)for(let i=1;i<=6;i++)bossWarning(w,e,clamp(e.x+Math.cos(a+.4)*i*140,50,LAB_WIDTH-50),clamp(e.y+Math.sin(a+.4)*i*140,50,LAB_HEIGHT-50),75,150*enrage,2.5)}}
 else{e.abilityCD=phase===3?7:9;let type=k%5;if(type===0){for(let i=0;i<8;i++)bossBolt(w,e,i*Math.PI/4,90*enrage)}else if(type===1){for(let i=0;i<4;i++)bossWarning(w,e,clamp(target.x+(random(w)-.5)*500,70,LAB_WIDTH-70),clamp(target.y+(random(w)-.5)*500,70,LAB_HEIGHT-70),160,140*enrage,1.2)}else if(type===2&&phase>=2){for(let i=0;i<2&&w.enemies.filter(x=>x.kind==='construct').length<4;i++)spawn(w,'construct');for(const p of ps.slice(0,2))zone(w,null,p.x,p.y,80,1,0,'prisonWarning',{target:p.id,enemy:e.id})}else if(type===3){let a=Math.atan2(target.y-e.y,target.x-e.x);for(let i=1;i<=7;i++)bossWarning(w,e,clamp(e.x+Math.cos(a)*i*140,40,LAB_WIDTH-40),clamp(e.y+Math.sin(a)*i*140,40,LAB_HEIGHT-40),80,100*enrage,1.2)}else{for(let p of ps.slice(0,2))bossWarning(w,e,p.x,p.y,170,120*enrage,1);if(phase===3)for(let i=0;i<3;i++)bossWarning(w,e,525+i*675,750,190,90*enrage,1.5)}}
}
function mobSkill(w,e,target){e.abilityCD=12;const tele=w.difficulty>=3?.85:1;if(['satyr','hellbear','adept','pudge'].includes(e.kind))w.lastStealable={kind:e.kind,x:e.x,y:e.y,at:w.seconds};
 if(e.kind==='scout'){e.status.rush=2;hazard(w,target.x,target.y,90,35,.7,{enemy:e.id})}
 else if(e.kind==='satyr')hazard(w,target.x,target.y,80,55,tele,{enemy:e.id,manaBurn:30});
 else if(e.kind==='hellbear')hazard(w,e.x,e.y,240,70,tele,{enemy:e.id,slow:2});
 else if(e.kind==='ogre')hazard(w,target.x,target.y,160,100,tele,{enemy:e.id});
 else if(e.kind==='adept')hazard(w,target.x,target.y,220,0,tele,{enemy:e.id,pull:true});
 else if(e.kind==='construct')hazard(w,target.x,target.y,100,80,tele,{enemy:e.id});
 else if(e.kind==='ghost')e.status.rush=2;
 else if(e.kind==='pudge'){let a=Math.atan2(target.y-e.y,target.x-e.x);w.projectiles.push({id:uid(w),enemy:e.id,x:e.x,y:e.y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,left:650,damage:80,type:'physical',radius:12,hook:true,delay:.9})}
 else if(e.kind==='archer'){let a=Math.atan2(target.y-e.y,target.x-e.x);for(let i=-1;i<=1;i++)w.projectiles.push({id:uid(w),enemy:e.id,x:e.x,y:e.y,vx:Math.cos(a+i*.25)*500,vy:Math.sin(a+i*.25)*500,left:650,damage:30,type:'physical',radius:8})}
 if(e.modifiers?.includes('Summoner')&&w.enemies.length<20)spawn(w,'scout');if(e.modifiers?.includes('Shielded')){e.shield=e.maxHP*.15;e.shieldTime=4}}
function stepEnemies(w,dt){let ps=living(w);for(const e of w.enemies){if(e.hp<=0||w.seconds+1e-9<(e.activeAt||0))continue;e.interruptCD=Math.max(0,(e.interruptCD||0)-dt);for(const k in e.status)e.status[k]=Math.max(0,e.status[k]-dt);if(e.shieldTime>0&&(e.shieldTime-=dt)<=0)e.shield=0;if(ps.some(p=>p.hero==='sf'&&rank(p,2)>0&&leg(p,'Dread Presence')&&dist(p,e)<=350))e.status.slow=Math.max(e.status.slow||0,.2);if(e.maledict&&(e.maledict.left-=dt)<=0){let m=e.maledict;e.maledict=null;deal(w,m.owner,e,Math.min(m.cap,m.record*m.ratio))}if(e.kind==='crystal'){let p=w.players[e.victim];e.left-=dt;if(!p||p.hp<=0||e.left<=0){if(p)p.prison=0;e.hp=0}continue}if(e.kind==='courier'){let a=(w.seconds+e.id)*1.4;moveUnit(w,e,Math.cos(a)*e.speed*dt,Math.sin(a)*e.speed*dt);continue}if(e.boss)bossThink(w,e,dt);if(e.transition>0||e.status.stun>0||!ps.length)continue;let target=ps.slice().sort((a,b)=>dist(a,e)-dist(b,e))[0],d=dist(e,target),slow=e.status.slow>0?(e.boss?.8:.7):1;e.attackCD-=dt;if(d>e.range*.9&&e.speed>0){let waypoint=enemyWaypoint(w,e,target,dt),wd=dist(e,waypoint),travel=Math.min(d-e.range*.85,wd,e.speed*slow*(e.status.rush>0?1.4:1)*dt),k=travel/Math.max(1,wd);let ox=e.x,oy=e.y;moveUnit(w,e,(waypoint.x-e.x)*k,(waypoint.y-e.y)*k);if(Math.hypot(e.x-ox,e.y-oy)<.1){let sign=(e.id%2?1:-1);moveUnit(w,e,-(target.y-e.y)/d*e.speed*dt*sign,(target.x-e.x)/d*e.speed*dt*sign)}}else if(e.attackCD<=0){e.attackCD=e.interval;if(e.range<100)hurt(w,target,e.attack*(1+.1*(e.avengerStacks||0)),e.magic?'magic':'physical',e);else{let a=Math.atan2(target.y-e.y,target.x-e.x);w.projectiles.push({id:uid(w),enemy:e.id,x:e.x,y:e.y,vx:Math.cos(a)*500,vy:Math.sin(a)*500,left:e.range+150,damage:e.attack*(1+.1*(e.avengerStacks||0)),type:e.magic?'magic':'physical',radius:8})}}if(e.kind==='warrior'&&!e.guardUsed&&e.hp<e.maxHP*.5){e.guardUsed=true;e.guardTime=4;e.armor+=4}if(e.guardTime>0&&(e.guardTime-=dt)<=0)e.armor-=4;if(!e.boss)e.abilityCD=(e.abilityCD??8)-dt;if(!e.boss&&e.abilityCD<=0&&!e.status.silence)mobSkill(w,e,target)}
 for(const e of w.enemies.filter(x=>x.hp<=0)){if(e.kind!=='crystal')event(w,'enemy_death',{boss:!!e.boss,elite:!!e.elite,x:e.x,y:e.y});if(ENEMIES[e.kind]&&e.kind!=='courier')for(const a of w.enemies)if(a!==e&&a.hp>0&&a.modifiers?.includes('Avenger')&&dist(a,e)<=500)a.avengerStacks=Math.min(5,(a.avengerStacks||0)+1);if(e.goldReward)for(const p of all(w))p.gold+=e.goldReward;if(e.kind==='crystal'&&w.players[e.victim])w.players[e.victim].prison=0;if(e.modifiers?.includes('Explosive'))hazard(w,e.x,e.y,180,100,1.2)}w.enemies=w.enemies.filter(e=>e.hp>0)}
// First intersection along a segment, using the same expanded rectangular wall
// collision shape as movement. A result of Infinity means no collision.
function wallHit(x,y,dx,dy,o,r){
 let lo=0,hi=1;
 for(const [p,d,min,max] of [[x,dx,o.x-r,o.x+o.w+r],[y,dy,o.y-r,o.y+o.h+r]]){
  if(Math.abs(d)<1e-12){if(p<min||p>max)return Infinity;continue}
  let a=(min-p)/d,b=(max-p)/d;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return Infinity;
 }
 return lo;
}
function unitHit(x,y,dx,dy,t,r){
 const ox=x-t.x,oy=y-t.y,rr=(t.radius||20)+r,a=dx*dx+dy*dy,c=ox*ox+oy*oy-rr*rr;
 if(c<=0)return 0;if(!a)return Infinity;
 const b=2*(ox*dx+oy*dy),disc=b*b-4*a*c;if(disc<0)return Infinity;
 const k=(-b-Math.sqrt(disc))/(2*a);return k>=0&&k<=1?k:Infinity;
}
// Outward-moving half-disc: each target can be hit once; walls block its ray.
// On-hit procs are consumed by the first successful contact, as for a projectile.
function stepMeleeWave(w,q,dt){
 q.reach=Math.min(q.range,q.reach+q.range*dt/.22);q.left=Math.max(0,q.range-q.reach);
 const fx=Math.cos(q.angle),fy=Math.sin(q.angle);
 const targets=w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&!q.hitIds.includes(e.id)).sort((a,b)=>dist(a,q)-dist(b,q));
 for(const e of targets){
  const dx=e.x-q.x,dy=e.y-q.y,r=e.radius||20,d=Math.hypot(dx,dy);
  if(d>q.reach+r||dx*fx+dy*fy < -r)continue;
  if((w.obstacles||[]).some(o=>wallHit(q.x,q.y,dx,dy,o,0)<1))continue;
  q.hitIds.push(e.id);deal(w,q.owner,e,q.damage,'physical');
  const owner=w.players[q.owner];
  if(q.cleave){if(owner)cleaveAttack(w,owner,e,q.damage,q.cleaveRatio);q.cleave=false}
  if(q.lightning){if(owner)chainLightning(w,owner,e);q.lightning=false}
 }
}
function stepProjectiles(w,dt){
 for(const q of w.projectiles){
  if(q.kind==='melee_wave'){stepMeleeWave(w,q,dt);continue}
  if(q.delay>0){q.delay-=dt;continue}
  const distance=Math.hypot(q.vx,q.vy)*dt,scale=distance?Math.min(1,Math.max(0,q.left)/distance):0;
  const x=q.x,y=q.y,dx=q.vx*dt*scale,dy=q.vy*dt*scale,r=q.radius||0;
  let wall=Infinity;for(const o of w.obstacles||[])wall=Math.min(wall,wallHit(x,y,dx,dy,o,r));
  const pool=q.enemy?living(w):w.enemies.filter(e=>e.hp>0&&materialized(w,e));
  const hits=pool.map(t=>({t,at:unitHit(x,y,dx,dy,t,r)})).filter(h=>h.at<wall&&h.at<=1).sort((a,b)=>a.at-b.at);
  q.x=x+dx*Math.min(1,wall);q.y=y+dy*Math.min(1,wall);q.left-=distance*scale;
  for(const {t} of hits){
   if(q.hitIds?.includes(t.id))continue;
   if(q.hitGroup){w.hitGroups ||= {};let key=q.hitGroup+':'+t.id;if((w.hitGroups[key]||0)>=(q.maxGroupHits||1)){(q.hitIds ||= []).push(t.id);continue}w.hitGroups[key]=(w.hitGroups[key]||0)+1}
   if(q.enemy){let src=w.enemies.find(e=>e.id===q.enemy);hurt(w,t,q.damage,q.type,src);if(src?.kind==='ward')t.status.poison=3;if(q.hook&&src&&!(t.status.bkb>0)){let d=dist(src,t)||1;moveUnit(w,t,(src.x-t.x)/d*250,(src.y-t.y)/d*250)}}
   else{deal(w,q.owner,t,q.damage,q.type);if(q.frost){deal(w,q.owner,t,q.frost,'magic');t.status.slow=2}if(q.cleave){let owner=w.players[q.owner];if(owner)cleaveAttack(w,owner,t,q.damage,q.cleaveRatio);q.cleave=false}if(q.lightning){let owner=w.players[q.owner];if(owner)chainLightning(w,owner,t);q.lightning=false}if(q.slow)t.status.slow=q.slow}
   if(q.pierce){(q.hitIds ||= []).push(t.id);q.damage*=q.decay??.7}else{q.left=0;break}
  }
  if(wall<=1)q.left=0;
 }
 w.projectiles=w.projectiles.filter(q=>q.left>0&&q.x>-50&&q.x<LAB_WIDTH+50&&q.y>-50&&q.y<LAB_HEIGHT+50);
}
function stepZones(w,dt){for(const z of w.zones){z.left-=dt;z.tick-=dt;let p=w.players[z.owner];if(z.follow&&p){z.x=p.x;z.y=p.y}if(z.kind==='prisonWarning'&&z.left<=0){let victim=w.players[z.target];if(victim&&victim.hp>0&&dist(victim,z)<z.radius+20){victim.prison=3;w.enemies.push({id:uid(w),kind:'crystal',name:'Crystal Prison',x:victim.x,y:victim.y,hp:300,maxHP:300,attack:0,armor:0,resist:0,radius:28,interval:999,attackCD:999,speed:0,range:0,status:{},victim:victim.id,left:3,color:'#99dbfa'})}}else if(z.kind==='warning'&&z.left<=0){for(const a of living(w))if(dist(a,z)<z.radius+20){hurt(w,a,z.damage,'magic',w.enemies.find(e=>e.id===z.enemy)||null);if(z.manaBurn)a.mana=Math.max(0,a.mana-z.manaBurn);if(z.slow&&!(a.status.bkb>0))a.status.slow=z.slow;if(z.pull&&!(a.status.bkb>0)){let d=dist(a,z)||1;moveUnit(w,a,(z.x-a.x)/d*180,(z.y-a.y)/d*180)}}}else if(z.tick<=0&&z.kind!=='warning'){z.tick=1;if(z.kind==='enemyField'){for(const a of living(w))if(dist(a,z)<=z.radius)hurt(w,a,z.damage,'magic',w.enemies.find(e=>e.id===z.enemy)||null)}else if(z.kind==='heal'&&p){for(const a of living(w))if(dist(a,z)<=z.radius)heal(a,z.damage,p)}else if(z.kind==='curse'&&p){circle(w,p,z.x,z.y,z.radius,z.damage);if(z.left<=1)circle(w,p,z.x,z.y,z.radius,(leg(p,'Deep Curse')?220:140)*basicPower(p,2))}else if(p){if(z.kind==='ring'){for(const e of w.enemies)if(e.hp>0&&materialized(w,e)&&Math.abs(dist(e,z)-z.radius)<40)deal(w,p.id,e,z.damage)}else circle(w,p,z.x,z.y,z.radius,z.damage,'magic',{slow:z.slow||0})}}}w.zones=w.zones.filter(z=>z.left>0)}
function stepPlayers(w,dt){for(const p of all(w)){for(let i=0;i<4;i++)p.cd[i]=Math.max(0,p.cd[i]-dt);for(const k in p.itemCD)p.itemCD[k]=Math.max(0,p.itemCD[k]-dt);p.attackCD=Math.max(0,p.attackCD-dt);p.invuln=Math.max(0,p.invuln-dt);p.lastHit+=dt;if(p.shrapnelRecharge>0){p.shrapnelRecharge-=dt;if(p.shrapnelRecharge<=0){p.shrapnelCharges=Math.min(2,(p.shrapnelCharges||0)+1);p.shrapnelRecharge=p.shrapnelCharges<2?16:0}}if(p.reactiveTTL>0){p.reactiveTTL-=dt;if(p.reactiveTTL<=0)p.reactive=0}p.shieldTime-=dt;if(p.shieldTime<=0)p.shield=0;if(p.hp<=0)continue;p.prison=Math.max(0,(p.prison||0)-dt);let moving=Math.hypot(p.walkX,p.walkY)>0&&p.walkUntil>w.seconds&&p.prison<=0;let move=getHero(p.hero).speed*(1+.08*count(p,'move')+(has(p,'boots')?.12:0)+(p.status.takeAim>0&&!leg(p,'Mobile Marksman')?-.15:0)+(p.status.takeAim>0&&leg(p,'Mobile Marksman')?.15:0))*(p.status.slow>0?.75:1);if(moving){if(p.channel&&!((p.channel.kind==='blizzard'&&leg(p,'Walking Blizzard'))||(p.channel.kind==='ward'&&leg(p,'Mobile Ward'))))p.channel=null;if(p.channel)move*=.5;moveUnit(w,p,p.walkX*move*dt,p.walkY*move*dt);p.reviveTarget=null;p.reviveProgress=0}
 let regen=2+.5*(p.blessings?.recovery||0)+(p.hero==='timber'&&rank(p,2)>0?p.reactive:0)+3*count(p,'regen')+(has(p,'bracer')?2:0)+(has(p,'heart')?5:0)+(has(p,'heart')&&p.lastHit>5?hpmax(p)*.01:0);heal(p,regen*dt);p.mana=Math.min(mpmax(p),p.mana+(3+count(p,'regen')+Math.max(0,...living(w).filter(a=>a.hero==='cm'&&rank(a,2)>0).map(a=>.4*rank(a,2)*(leg(a,'Brilliant Aura')?1.5:1)))+(p.hero==='cm'?.25*rank(p,2):0))*dt);if(p.status.poison>0)hurt(w,p,10*dt,'magic',null);if(p.status.healingPotion>0)heal(p,60*dt);if(p.status.manaPotion>0)p.mana=Math.min(mpmax(p),p.mana+40*dt);
 if(p.status.spin>0)circle(w,p,p.x,p.y,leg(p,'Blade Storm')?250:180,p.spinPower*dt);if(p.status.restore>0)for(const a of living(w))if(dist(a,p)<300){heal(a,p.restorePower*dt,p);if(leg(p,'Restorative Ritual'))a.status.restoreBuff=.2}if(p.channel){p.channel.left-=dt;p.channel.tick-=dt;if(p.channel.tick<=0){p.channel.tick=1;if(p.channel.kind==='blizzard')circle(w,p,p.x,p.y,400,p.channel.damage,'magic',{slow:1});else{let e=w.enemies.filter(e=>e.hp>0&&materialized(w,e)&&dist(e,p)<600).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(e)deal(w,p.id,e,p.channel.damage*2,'physical')}}if(p.channel.left<=0)p.channel=null}for(const k in p.status)p.status[k]=Math.max(0,p.status[k]-dt);
 if(p.reviveTarget){let t=w.players[p.reviveTarget];if(!t||t.hp>0||t.revived||dist(t,p)>100){p.reviveTarget=null;p.reviveProgress=0}else if((p.reviveProgress+=dt)>=4){t.revived=true;t.hp=hpmax(t)*.3;t.mana=mpmax(t)*.3;t.invuln=2;p.reviveTarget=null;p.reviveProgress=0}}}}

// Two independently chosen, distinct shapes per trap wave. Anchoring to a living hero keeps them relevant on the large map.
function spawnTrapPatterns(w,t,warning){
 const specs={rocks:[120,90],laser:[100,40],spikes:[75,80],poison:[75,45]},[base,damage]=specs[t.kind]||specs.spikes;
 const types=['line','cross','semicircle','circle'],first=Math.floor(random(w)*types.length),second=(first+1+Math.floor(random(w)*(types.length-1)))%types.length,ps=living(w);t.wave=(t.wave||0)+1;
 for(const index of [first,second]){
  const name=types[index],anchor=ps[Math.floor(random(w)*ps.length)],angle=random(w)*Math.PI*2,spacing=150,offsetAngle=random(w)*Math.PI*2;
  const cx=clamp(anchor.x+Math.cos(offsetAngle)*170,320,LAB_WIDTH-320),cy=clamp(anchor.y+Math.sin(offsetAngle)*170,320,LAB_HEIGHT-320);
  let offsets=[];
  if(name==='line')for(let i=-2;i<=2;i++)offsets.push([i*spacing,0]);
  if(name==='cross')offsets=[[0,0],[-spacing,0],[spacing,0],[0,-spacing],[0,spacing]];
  if(name==='semicircle')for(let i=0;i<5;i++){let a=Math.PI*i/4;offsets.push([Math.cos(a)*spacing,Math.sin(a)*spacing])}
  if(name==='circle')for(let i=0;i<6;i++){let a=Math.PI*2*i/6;offsets.push([Math.cos(a)*spacing,Math.sin(a)*spacing])}
  for(const [x,y] of offsets)hazard(w,cx+x*Math.cos(angle)-y*Math.sin(angle),cy+x*Math.sin(angle)+y*Math.cos(angle),base*.75,damage,warning,{trapPattern:name,trapWave:t.wave});
 }
}
function stepTrap(w,dt){const t=w.trap;t.elapsed+=dt;t.timer-=dt;for(const v of t.switches||[]){if(v.progress<2&&living(w).some(p=>Math.hypot(p.x-v.x,p.y-v.y)<90))v.progress=Math.min(2,v.progress+dt)}if(t.timer<=0){t.timer=t.kind==='rocks'?1:t.kind==='poison'?1.5:2;spawnTrapPatterns(w,t,w.difficulty>=3?.85:1)}if(t.elapsed>3&&(t.switches||[]).every(v=>v.progress>=2)&&living(w).every(p=>Math.hypot(p.x-t.exitX,p.y-t.exitY)<110))clearRoom(w)}

export function stepLabyrinth(w,dt){if(!w.started||w.gameOver)return;dt=clamp(Number(dt)||0,0,.1);w.seconds+=dt;if(['prep','shop','event','offer','vote'].includes(w.phase)){w.phaseTime-=dt;if(w.phaseTime<=0){if(w.phase==='prep')w.phase='combat';else if(w.phase==='offer'){for(const p of all(w))if(p.offer.length){applyOffer(p,p.offer[0])}advance(w)}else if(w.phase==='vote')resolveVote(w);else if(w.phase==='event'){for(const p of all(w))if(!p.eventChosen)chooseEvent(w,p,w.eventType==='chest'?'chest':'gold');advance(w)}else {if(w.phase==='shop')for(const p of all(w))p.ready=false;advance(w)}}return}
 if(w.phase!=='combat')return;w.roomElapsed+=dt;if(w.trap){stepPlayers(w,dt);stepZones(w,dt);stepTrap(w,dt);if(!living(w).length){w.gameOver=true;w.phase='defeat';w.winner='labyrinth'}return}for(const h of w.hazards||[])for(const p of living(w))if(p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h)hurt(w,p,20*dt,'magic',null);w.spawnTimer-=dt;if(w.queue.length&&(w.enemies.length<(w.room===1?1:3)||w.roomElapsed-w.lastWaveAt>=25)&&w.spawnTimer<=0){let n=Math.min(20-w.enemies.length,w.room===1?4:Math.ceil(w.queue.length/2));for(let i=0;i<n;i++){let q=w.queue.shift();if(q&&!spawn(w,q.id,q.elite)){w.queue.unshift(q);break}}w.lastWaveAt=w.roomElapsed;w.spawnTimer=1}stepPlayers(w,dt);stepEnemies(w,dt);stepProjectiles(w,dt);stepZones(w,dt);if(!living(w).length){w.gameOver=true;w.phase='defeat';w.winner='labyrinth';return}if(w.roomType==='flock'&&(w.flockTime-=dt)<=0){w.enemies=[];clearRoom(w);return}if(!w.queue.length&&!w.enemies.length)clearRoom(w)}
