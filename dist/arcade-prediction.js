import {arcadeMoveSpeed,arcadeBounds,pudgeHookOutbound} from './arcade-engine.js';
// Display-only movement. The server owns collision, damage, hooks, mana and every cast.
export class ArcadePrediction {
 constructor(){this.clear();}
 clear(){this.position=null;this.lastStamp=-1;this.target=null;this.direction={x:0,y:0};this.age=0;}
 input(action){if(action.type==='hook'){this.target=null;this.direction={x:0,y:0};}if(action.type==='move'){this.target={x:action.x,y:action.y};this.direction={x:0,y:0};}if(action.type==='walk'){const len=Math.max(1,Math.hypot(action.dx,action.dy));this.direction={x:action.dx/len,y:action.dy/len};this.target=null;}}
 sample(world,player,dt,ping=0){if(pudgeHookOutbound(world,player)){this.position=null;this.target=null;this.direction={x:0,y:0};return player;}if(!player||!world.started||world.gameOver||player.hp<=0||player.active===false||player.roundDead||player.waitingNextRound||player.statuses.phaseShift>0||player.failedRound||player.eliminated||player.pullBy||player.channel||player.frozen||player.statuses.stun>0||player.statuses.hex>0||player.statuses.lift>0||player.statuses.fear>0||player.statuses.root>0||!['wave','duel','combat'].includes(world.phase)){this.position=null;return player;}
  const speed=arcadeMoveSpeed(world,player),box=arcadeBounds(world,player);let dx=this.direction.x,dy=this.direction.y;
  if(this.target){const x=this.target.x-(this.position?.x??player.x),y=this.target.y-(this.position?.y??player.y),len=Math.hypot(x,y);if(len<5)this.target=null;else{dx=x/len;dy=y/len;}}
  const bounded=p=>{let left=box.x+35,right=box.x+box.w-35;if(world.mode==='pudge'){left=player.x<820?35:1000;right=player.x<820?800:1765;}return {x:Math.max(left,Math.min(right,p.x)),y:Math.max(box.y+45,Math.min(box.y+box.h-45,p.y))};};
  if(!this.position||Math.hypot(this.position.x-player.x,this.position.y-player.y)>250)this.position={x:player.x,y:player.y};
  this.position=bounded({x:this.position.x+dx*speed*dt,y:this.position.y+dy*speed*dt});
  if(this.lastStamp!==world.seconds){this.lastStamp=world.seconds;const ahead=Math.min(.18,Math.max(0,ping/2000)),expected=bounded({x:player.x+dx*speed*ahead,y:player.y+dy*speed*ahead});this.position.x+=(expected.x-this.position.x)*.18;this.position.y+=(expected.y-this.position.y)*.18;}
  return {...player,...this.position};
 }
}
