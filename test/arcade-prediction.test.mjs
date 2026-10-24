import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createArcadeWorld,startArcade} from '../dist/arcade-engine.js';
import {ArcadePrediction} from '../dist/arcade-prediction.js';
test('display prediction responds before a network snapshot, stays on its river bank and never mutates server state',()=>{const w=createArcadeWorld('pudge');startArcade(w);const p=w.players.s1,m=new ArcadePrediction(),x=p.x;m.input({type:'walk',dx:1,dy:0});const shown=m.sample(w,p,.05,200);assert.ok(shown.x>x);assert.equal(p.x,x);for(let i=0;i<100;i++)m.sample(w,p,.05,200);assert.ok(m.position.x<=800);p.pullBy=1;assert.equal(m.sample(w,p,.05,200),p);assert.equal(m.position,null);});
test('prediction stops during stuns or channels and resets across a duel teleport',()=>{const w=createArcadeWorld('chaos');startArcade(w);const p=w.players.s1,m=new ArcadePrediction();m.input({type:'walk',dx:0,dy:1});m.sample(w,p,.05);p.statuses.stun=1;assert.equal(m.sample(w,p,.05),p);p.statuses.stun=0;p.x=4200;p.y=500;w.phase='duel';w.duel={ids:['s1','s2']};const next=m.sample(w,p,.05);assert.ok(Math.abs(next.x-4200)<1);assert.ok(Math.abs(next.y-500)<20);});
