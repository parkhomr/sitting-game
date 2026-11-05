// Deterministic diagnostic bots; no state edits or forced room clears.
import {pathToFileURL} from 'node:url';
import {LAB_WIDTH,LAB_HEIGHT,HEROES,SKILLS} from '../dist/labyrinth-data.js';
import {createLabyrinthWorld,startLabyrinth,stepLabyrinth,labyrinthCommand,labyrinthPath,labyrinthMaxHP,labyrinthMaxMana} from '../dist/labyrinth-engine.js';

// Lightweight warning avoidance and bounded visibility-graph pathing, not human AI.
export function botSteer(w,p,target,desired=0){
 const danger=(w.zones||[]).filter(z=>['warning','prisonWarning','enemyField'].includes(z.kind)&&Math.hypot(p.x-z.x,p.y-z.y)<z.radius+65).sort((a,b)=>(Math.hypot(p.x-a.x,p.y-a.y)-a.radius)-(Math.hypot(p.x-b.x,p.y-b.y)-b.radius))[0];
 let goal;
 if(danger){let dx=p.x-danger.x,dy=p.y-danger.y,d=Math.hypot(dx,dy);if(d<1){let a=(p.seat||0)*Math.PI/3;dx=Math.cos(a);dy=Math.sin(a);d=1}let push=danger.radius+110;goal={x:Math.max(25,Math.min(LAB_WIDTH-25,danger.x+dx/d*push)),y:Math.max(25,Math.min(LAB_HEIGHT-25,danger.y+dy/d*push))}}
 else if(target){let dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;if(desired&&Math.abs(d-desired)<55)return [0,0];goal={x:Math.max(25,Math.min(LAB_WIDTH-25,target.x-dx/d*desired)),y:Math.max(25,Math.min(LAB_HEIGHT-25,target.y-dy/d*desired))}}
 else return [0,0];
 let path=labyrinthPath(w,p,goal,20),next=path?.[0]||goal;return [next.x-p.x,next.y-p.y];
}

export function simulate({seed=1,heroes=['drow'],difficulty=0,maxSeconds=900,trace=false}={}) {
  if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('seed must be a uint32');
  if(!Array.isArray(heroes)||!heroes.length||heroes.length>6||new Set(heroes).size!==heroes.length||heroes.some(id=>!HEROES.some(h=>h.id===id)))throw Error('choose 1–6 distinct valid heroes');
  if(!Number.isInteger(difficulty)||difficulty<0||difficulty>4)throw Error('difficulty must be 0–4');
  if(!Number.isFinite(maxSeconds)||maxSeconds<=0||maxSeconds>3600)throw Error('maxSeconds must be in (0, 3600]');
  const w=createLabyrinthWorld({seed}), ids=heroes.map((_,i)=>`s${i+1}`), actions=[];
  let tick=0;
  function cmd(id,action){const result=labyrinthCommand(w,id,action);if(trace)actions.push([tick,id,action]);return result;}
  heroes.forEach((hero,i)=>cmd(ids[i],{type:'hero',hero}));
  cmd(ids[0],{type:'profile_unlock',value:difficulty});
  cmd(ids[0],{type:'difficulty',value:difficulty});
  if(!startLabyrinth(w,ids).ok)throw Error('could not start');
  const visits=[];let lastRoom=0;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(tick=0;tick<Math.ceil(maxSeconds*10)&&!w.gameOver;tick++){
    // Simple repeatable allocation; not an optimized build or human balance test.
    for(const id of ids){const p=w.players[id];while(p.skillPoints>0){const order=[3,0,1,2];const slot=order.find(i=>i===3?p.skillRanks[3]<3&&p.level>=[6,12,18][p.skillRanks[3]]:p.skillRanks[i]<4);if(slot===undefined)break;if(!cmd(id,{type:'skill_up',slot}).ok)break}}

    if(w.room!==lastRoom){visits.push({room:w.room,name:w.roomName,entered:Math.round(w.seconds*10)/10});lastRoom=w.room;}
    if(w.phase==='offer'){
      for(const id of ids){const p=w.players[id];if(p.offer.length)cmd(id,{type:'offer',id:p.offer[0].id});}
    }else if(w.phase==='vote'){
      const index=Math.max(0,w.choices.findIndex(x=>x.type!=='Trap'&&x.type!=='Event'));
      for(const id of ids)if(w.phase==='vote')cmd(id,{type:'vote',index});
    }else if(w.phase==='event'){
      for(const id of ids)if(w.phase==='event')cmd(id,{type:'event',option:w.eventType==='chest'?'chest':'gold'});
    }else if(w.phase==='shop'){
      for(const id of ids)if(w.phase==='shop'){
        for(const item of ['boots','bracer','wraith','healing'])cmd(id,{type:'buy',item});
        cmd(id,{type:'ready'});
      }
    }else if(w.phase==='combat'&&tick%2===0){
      for(const id of ids){const p=w.players[id];if(p.hp<=0)continue;
        const ally=ids.map(x=>w.players[x]).find(a=>a.id!==id&&a.hp<=0&&!a.revived&&distance(a,p)<95);
        if(ally){if(!p.reviveTarget)cmd(id,{type:'revive',target:ally.id});cmd(id,{type:'walk',dx:0,dy:0});continue;}
        if(w.trap){const target=(w.trap.switches||[]).find(s=>s.progress<2)||{x:w.trap.exitX,y:w.trap.exitY};const [dx,dy]=botSteer(w,p,target);cmd(id,{type:'walk',dx,dy});continue;}
        const target=w.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(a,p)-distance(b,p))[0];
        if(!target){const [dx,dy]=botSteer(w,p,null);cmd(id,{type:'walk',dx,dy});continue;}
        const d=distance(p,target),h=HEROES.find(x=>x.id===p.hero),desired=h.range<=200?Math.min(65,h.range*.35):Math.min(400,h.range*.7);
        // Keep range while prioritizing visible danger and routing around static walls.
        const [dx,dy]=botSteer(w,p,target,desired);
        cmd(id,{type:'walk',dx,dy});
        if(d<=(h.range<=200?h.range*.5:h.range)+target.radius){cmd(id,{type:'attack',x:target.x,y:target.y});
          for(let slot=0;slot<4;slot++)if(!SKILLS[p.hero][slot].passive&&p.cd[slot]<=0)cmd(id,{type:'cast',slot,x:target.x,y:target.y});
        }
        if(p.potions?.healing&&p.hp<labyrinthMaxHP(p)*.4)cmd(id,{type:'item',item:'healing'});if(p.potions?.mana_potion&&p.mana<labyrinthMaxMana(p)*.3)cmd(id,{type:'item',item:'mana_potion'});
      }
    }
    stepLabyrinth(w,.1);
  }
  const result={seed,heroes,difficulty,maxSeconds,outcome:w.gameOver?w.phase:'timeout',room:w.room,roomName:w.roomName,phase:w.phase,seconds:Math.round(w.seconds*10)/10,visits,players:ids.map(id=>{const p=w.players[id];return {hero:p.hero,hp:Math.round(p.hp),mana:Math.round(p.mana),gold:p.gold,level:p.level,items:p.items,shards:p.shards,legendary:p.legendary,stats:p.stats};})};
  if(trace)result.trace={tickSeconds:.1,actions};return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);const option=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1]};
  if(args.includes('--help')){console.log('node labyrinth/simulate.mjs --heroes drow,timber --seed 1 --difficulty 0 --seconds 900 [--trace]');process.exit(0)}
  try{console.log(JSON.stringify(simulate({seed:Number(option('--seed','1')),heroes:option('--heroes','drow').split(','),difficulty:Number(option('--difficulty','0')),maxSeconds:Number(option('--seconds','900')),trace:args.includes('--trace')}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
