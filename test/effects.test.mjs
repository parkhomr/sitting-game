import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BattleEffects,drawProjectile} from '../dist/effects.js';
test('effects handle clock discontinuities and all hero kits without invalid canvas radii',()=>{
  const c=new Proxy({ellipse(x,y,rx,ry){assert.ok(rx>=0&&ry>=0);}}, {get(target,key){return key in target?target[key]:()=>{};},set(target,key,value){target[key]=value;return true;}});
  const effects=new BattleEffects(),points=[{x:600,y:350},{x:700,y:320}];
  for(const skill of ['sf','timber','rubick','drow','sniper']){effects.cast({hero:skill,skill,ability:true,x:150,y:300,points});effects.impact({hero:skill,skill,x:600,y:330});drawProjectile(c,{hero:skill,skill,x:300,y:300},points[0],1);}
  for(const kit of ['axe','lina','cm','pudge','pa','tide','sven','lion','wd','invoker','jugger','dazzle'])effects.enemy({kit,x:600,y:300,points});
  effects.enemy({kit:'roshan',skill:'Bash',x:750,y:300,points});effects.enemy({kit:'roshan',skill:'Thunder Clap',x:750,y:300,points});effects.requiem({x:500,y:500,radius:400});effects.hazard({kind:'manaBurn',x:500,y:500,radius:100});effects.hazard({kind:'shockwave',fromX:100,fromY:100,toX:900,toY:600});effects.neutral({kit:'banisher',x:900,y:600,points});effects.sun({points});effects.draw(c,-2,1);for(let i=0;i<50;i++)effects.draw(c,.05,i*.05);assert.equal(effects.items.length,0);
});
