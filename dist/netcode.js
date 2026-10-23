// Shared compact wire format. Combat stays authoritative; these values are for display.
const WORLD_KEYS=['version','runId','gameOver','started','wave','phase','seconds','kills','heroKills','bossKills','wins','losses','fightTime','pendingStrike','enemyTeam','spawned','breakTime','bigHeadsUntil','eventId','hazards','zones','casts'];
const PLAYER_KEYS=['id','skill','level','xp','gold','kills','heroKills','damage','speed','wisdom','auto','paused','hp','respawn','stun','hex','haste','cooldown','pose','x','y','moveX','moveY','moving','mana','eulCooldown','ultCooldown','channel','slow','target','skillPower','skillHaste','skillTalent','shrapnelCooldown','guard','deaths','assists','bossKills','damageDealt','heroDamage','creepDamage','bossDamage','spellDamage','damageTaken','dps','aimX','aimY','razeNearCooldown','razeMidCooldown','razeFarCooldown','lives','inventory','bkbLeft','bkbCooldown','staticLeft','mjollnirCooldown','spawnShield','itemDamage','goldEarned','goldSpent'];
const ENEMY_KEYS=['id','x','y','hp','maxHP','hero','boss','ranged','speed','hit','kit','heroName','color','armor','spin','buff','grave','enraged','neutral','name','mana','maxMana','cyclone','fear','slow'];
const SHOT_KEYS=['id','hero','skill','ability','target','x','y','delay','execute','hostile','source','targetPlayer','speed','vx','vy','kind','radius'];
const ENEMY_CHANGES=['x','y','hp','hit','armor','spin','buff','grave','enraged','mana','cyclone','fear','slow'];
const SHOT_CHANGES=['x','y','delay','target'];
function pick(source,keys){const out={};for(const key of keys)if(source[key]!==undefined)out[key]=typeof source[key]==='number'?(Math.round(source[key]*100)/100||0):(source[key]&&typeof source[key]==='object'?structuredClone(source[key]):source[key]);return out;}
export function wireWorld(w){return {...pick(w,WORLD_KEYS),players:Object.fromEntries(Object.entries(w.players).map(([id,p])=>[id,pick(p,PLAYER_KEYS)])),enemies:w.enemies.map(e=>pick(e,ENEMY_KEYS)),projectiles:w.projectiles.map(s=>pick(s,SHOT_KEYS)),events:[]};}
function diffEntities(before,after,fields){
  const old=new Map(before.map(e=>[e.id,e])),live=new Set(),add=[],update=[];
  for(const item of after){live.add(item.id);const prev=old.get(item.id);if(!prev){add.push(item);continue;}
    let mask=0;const values=[];for(let i=0;i<fields.length;i++)if(item[fields[i]]!==prev[fields[i]]){mask|=1<<i;values.push(item[fields[i]]??0);}if(mask)update.push([item.id,mask,...values]);
  }
  const remove=before.filter(e=>!live.has(e.id)).map(e=>e.id);return add.length||update.length||remove.length?{add,update,remove}:undefined;
}
export function deltaFrame(before,after,events){
  const state={},players={};
  for(const key of WORLD_KEYS)if(JSON.stringify(before[key])!==JSON.stringify(after[key]))state[key]=after[key];
  for(const [id,p] of Object.entries(after.players)){const changes={};for(const key of PLAYER_KEYS)if(p[key]!==before.players[id]?.[key])changes[key]=p[key];if(Object.keys(changes).length)players[id]=changes;}
  return {type:'state',state,players,enemies:diffEntities(before.enemies,after.enemies,ENEMY_CHANGES),projectiles:diffEntities(before.projectiles,after.projectiles,SHOT_CHANGES),events:events.filter(e=>e.id>before.eventId)};
}
function applyEntities(old,delta,fields){
  if(!delta)return old;
  const removed=new Set(delta.remove),items=new Map(old.filter(e=>!removed.has(e.id)).map(e=>[e.id,e]));
  for(const item of delta.add)items.set(item.id,item);
  for(const [id,mask,...values] of delta.update){const prev=items.get(id);if(!prev)throw Error('Snapshot needs resync');const next={...prev};let at=0;for(let i=0;i<fields.length;i++)if(mask&(1<<i))next[fields[i]]=values[at++];items.set(id,next);}
  return [...items.values()];
}
export function applyNetFrame(previous,packet){
  if(packet.full)return {...packet.full,events:[]};
  if(!previous)throw Error('Snapshot needs resync');
  const players={...previous.players};for(const [id,changes] of Object.entries(packet.players||{}))players[id]={...players[id],...changes};
  return {...previous,...packet.state,players,enemies:applyEntities(previous.enemies,packet.enemies,ENEMY_CHANGES),projectiles:applyEntities(previous.projectiles,packet.projectiles,SHOT_CHANGES),events:packet.events||[]};
}

// A short display delay absorbs packet jitter; never extrapolate indefinitely through a stall.
export class MotionBuffer {
  constructor(){this.frames=[];this.delay=75;}
  clear(){this.frames=[];}
  push(world,time){this.frames.push({time,world});if(this.frames.length>12)this.frames.shift();}
  sample(time){
    const frames=this.frames;if(!frames.length)return null;
    const target=time-this.delay;
    let a=frames[0],b=a;for(const frame of frames){if(frame.time<=target)a=frame;else{b=frame;break;}b=frame;}
    const ratio=a===b?1:Math.max(0,Math.min(1,(target-a.time)/(b.time-a.time)));
    const interpolate=(kind)=>{
      const old=new Map(a.world[kind].map(e=>[e.id,e]));
      if(a===b&&frames.length>1&&target>a.time){
        const preceding=frames[frames.length-2],oldest=new Map(preceding.world[kind].map(e=>[e.id,e])),ahead=Math.min(120,target-a.time)/Math.max(1,a.time-preceding.time);
        return b.world[kind].map(item=>{const prev=oldest.get(item.id);if(!prev)return item;let x=item.x+(item.x-prev.x)*ahead,y=item.y+(item.y-prev.y)*ahead;
          if(kind==='enemies'){x=Math.max(65,Math.min(1735,x));y=Math.max(150,Math.min(920,y));}
          return {...item,x,y};
        });
      }
      return b.world[kind].map(item=>{const prev=old.get(item.id);return prev?{...item,x:prev.x+(item.x-prev.x)*ratio,y:prev.y+(item.y-prev.y)*ratio}:item;});
    };
    const players={};for(const [id,p] of Object.entries(b.world.players)){const prev=a.world.players[id];players[id]=prev?{...p,x:prev.x+(p.x-prev.x)*ratio,y:prev.y+(p.y-prev.y)*ratio}:p;}
    return {enemies:interpolate('enemies'),projectiles:interpolate('projectiles'),players};
  }
}
