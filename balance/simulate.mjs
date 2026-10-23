// Deterministic gameplay audit. The casual policy uses only public player commands:
// reaction delay, imperfect aim, missed inputs and ordinary shopping; no stat buffs.
import {HEROES,RAZES,ARENA,createWorld,command,step,attackRange,allowedTarget,shoppingPlan,damage as baseDamageForReport,maxHP,manaCost,razeRules,hasItem} from '../dist/engine.js';
const ids=HEROES.map(h=>h.id),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function simulate({seed=1,mode='casual',toWave=60,maxSeconds=7200,shopping='mixed',disabled=[]}={}){
 const skilled=mode==='skilled';
 const w=createWorld();w.seed=seed;w.started=true;let rng=seed,previousWave=1,waveAt=0,phase=w.phase,phaseAt=0,previousEvent=0;
 const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const rows=[],fights=[],bosses=[],buys=[],deaths=[],hazardsSeen=new Map(),perHero=Object.fromEntries(ids.map(id=>[id,{nextInput:0,nextMove:0,nextShop:0}]));
 let shots=0,peakEnemies=0;
 for(let i=0;i<maxSeconds/.05&&!w.gameOver&&w.wave<=toWave;i++){
  if(mode!=='bots')for(const [index,id] of ids.entries()){
   const p=w.players[id],state=perHero[id];if(disabled.includes(id)||p.lives<=0)continue;
   if(w.seconds>=state.nextShop){state.nextShop=w.seconds+.5;let buy=shoppingPlan(p);if(shopping==='skills'&&buy?.type==='buy'){const key=['skillPower','skillHaste','skillTalent'].sort((a,b)=>p[a]-p[b])[0];buy={type:'upgrade',upgrade:key};}if(shopping==='items'&&buy?.type==='upgrade'){const item=['heart','mjollnir','bkb','daedalus'].find(id=>!hasItem(p,id));if(item)buy={type:'buy',item};}if(buy)command(w,id,buy);}
   if(p.respawn>0)continue;
   const foes=w.enemies.filter(e=>e.hp>0&&!(e.cyclone>0)).sort((a,b)=>distance(p,a)-distance(p,b)),foe=foes[0];if(!foe)continue;
   if(w.seconds>=state.nextMove){
    state.nextMove=w.seconds+(skilled?.25:.65)+rand()*(skilled?.15:.35);
    const desired=Math.max(attackRange(p)*(id==='timber'?.85:.85),foe.ranged||['satyr','mindstealer','banisher'].includes(foe.neutral)||['lina','cm','lion','wd','invoker','dazzle'].includes(foe.kit)?455:0),d=distance(p,foe),dx=(p.x-foe.x)/(d||1),dy=(p.y-foe.y)/(d||1);
    let x=p.x,y=p.y;if(d>desired+60){x=foe.x+dx*desired;y=foe.y+dy*desired;}else if(d<desired*.85){x=p.x+dx*160;y=p.y+dy*160;}
    const warning=w.hazards.find(h=>w.seconds-(hazardsSeen.get(h.id)??w.seconds)>(skilled?.15:.4)&&distance(p,h)<h.radius+25);
    if(warning&&rand()>(skilled?.05:.15)){let dx=p.x-warning.x,dy=p.y-warning.y;if(Math.hypot(dx,dy)<10){dx=0;dy=index%2?1:-1;}if(warning.kind==='shockwave'){dx=-(warning.toY-warning.fromY);dy=warning.toX-warning.fromX;}
      const len=Math.hypot(dx,dy)||1;x=p.x+dx/len*(warning.radius+130);y=p.y+dy/len*(warning.radius+130);
    }
    command(w,id,{type:'move',x:clamp(x,ARENA.minX,ARENA.maxX),y:clamp(y,ARENA.minY,ARENA.maxY)});
   }
   if(w.seconds<state.nextInput)continue;state.nextInput=w.seconds+(skilled?.1:.2)+rand()*(skilled?.05:.13);
   if(hasItem(p,'bkb')&&(p.hp<maxHP(p)*.65||w.hazards.some(h=>distance(p,h)<h.radius+40)))command(w,id,{type:'item',item:'bkb'});
   if(distance(p,foe)<600)command(w,id,{type:'item',item:'mjollnir'});
   const target=foes.find(e=>allowedTarget(p,e,true))||foe,d=distance(p,target),lead=Math.min(.4,d/720),ex=target.x+(target.moveVX||0)*lead,ey=target.y-(target.boss?80:35)+(target.moveVY||0)*lead;
   const error=(rand()-.5)*(skilled?.08:.21),angle=Math.atan2(ey-(p.y-35),ex-p.x)+error,aim={x:p.x+Math.cos(angle)*Math.max(200,d),y:p.y-35+Math.sin(angle)*Math.max(200,d)};
   if(d<attackRange(p)+80&&rand()>(skilled?.04:.12)){const result=command(w,id,{type:'attack',...aim});if(result.ok)shots++;}
   if(p.skill==='sf'){
    const r=RAZES.filter(r=>p[r.cooldown]<=0&&Math.abs(d-r.distance)<razeRules(p,r.id).radius*.85).sort((a,b)=>Math.abs(a.distance-d)-Math.abs(b.distance-d))[0];
    if(r&&rand()>(skilled?.08:.22))command(w,id,{type:'raze',raze:r.id,...aim});
   }else if(d<attackRange(p)+80&&rand()>(skilled?.08:.22))command(w,id,{type:'ability',...aim});
   if(id==='sniper'&&distance(p,foe)<950&&rand()>.2)command(w,id,{type:'shrapnel',x:foe.x+(rand()-.5)*80,y:foe.y+(rand()-.5)*80});
   if(id==='sf'&&foes.some(e=>distance(p,e)<270)&&p.mana>=175&&rand()>.4)command(w,id,{type:'ultimate'});
  }
  step(w,.05,mode==='bots'?ids:[]);peakEnemies=Math.max(peakEnemies,w.enemies.length);
  for(const h of w.hazards)if(!hazardsSeen.has(h.id))hazardsSeen.set(h.id,w.seconds);
  if(hazardsSeen.size>1000){const live=new Set(w.hazards.map(h=>h.id));for(const key of hazardsSeen.keys())if(!live.has(key))hazardsSeen.delete(key);}
  for(const e of w.events)if(e.id>previousEvent){if(e.type==='purchase')buys.push({wave:w.wave,hero:e.hero,item:e.item});if(e.type==='down'){const p=w.players[e.hero];deaths.push({wave:w.wave,phase:w.phase,hero:e.hero,kind:e.kind,lives:e.lives,x:Math.round(p.x),y:Math.round(p.y),enemies:w.enemies.length,damage:e.damage,source:w.enemies.find(s=>s.id===e.source)?.neutral||w.enemies.find(s=>s.id===e.source)?.kit||'creep',maxHP:maxHP(p),inventory:p.inventory});}}previousEvent=w.eventId;
  if(w.phase!==phase){if(phase==='teamfight')fights.push({wave:previousWave,seconds:+(w.seconds-phaseAt).toFixed(1),won:w.events.some(e=>e.type==='fightEnd'&&e.won)});if(phase==='boss')bosses.push({seconds:+(w.seconds-phaseAt).toFixed(1),won:w.bossKills>0});phase=w.phase;phaseAt=w.seconds;}
  if(w.wave!==previousWave){
   rows.push({wave:previousWave,seconds:+(w.seconds-waveAt).toFixed(1),level:w.players.drow.level,lives:ids.map(id=>w.players[id].lives),gold:Math.round(w.players.drow.gold),earned:w.players.drow.goldEarned,items:w.players.drow.inventory,ranks:['skillPower','skillHaste','skillTalent'].map(k=>w.players.drow[k])});previousWave=w.wave;waveAt=w.seconds;
  }
 }
 return {seed,mode,shopping,toWave,reached:w.wave,seconds:+w.seconds.toFixed(1),gameOver:w.gameOver,bossKills:w.bossKills,wins:w.wins,losses:w.losses,lives:ids.map(id=>w.players[id].lives),peakEnemies,shots,heroes:ids.map(id=>{const p=w.players[id];return {id,lives:p.lives,level:p.level,hp:maxHP(p),attack:baseDamageForReport(p),inventory:p.inventory,ranks:[p.skillPower,p.skillHaste,p.skillTalent],gold:p.gold,earned:p.goldEarned,spent:p.goldSpent,damage:p.damageDealt,items:p.itemDamage,spells:p.spellDamage};}),buys,deaths,fights,bosses,rows};
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1]){
 const toWave=Number(process.argv.find(a=>a.startsWith('--waves='))?.split('=')[1]||60),seeds=(process.argv.find(a=>a.startsWith('--seeds='))?.split('=')[1]||'1,5,17').split(',').map(Number),mode=process.argv.find(a=>a.startsWith('--mode='))?.split('=')[1]||'casual';
 for(const seed of seeds){const result=simulate({seed,mode,toWave});console.log(JSON.stringify(result));}
}
