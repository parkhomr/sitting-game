import {test} from 'node:test';
import assert from 'node:assert/strict';
import {simulate} from '../balance/simulate.mjs';
for(const seed of [5,17])test(`five-life casual campaign survives wave 13 and Roshan with imperfect aim (seed ${seed})`,()=>{
 const r=simulate({seed,mode:'casual',toWave:30,maxSeconds:3600});
 assert.equal(r.reached,31);assert.equal(r.gameOver,false);assert.equal(r.bossKills,1);
 const wave13=r.rows.find(row=>row.wave===13);assert.ok(wave13.lives.every(n=>n>=4));assert.ok(wave13.seconds<100);
 assert.ok(r.lives.every(n=>n>=3),'Roshan should not exhaust a competent casual party');
 const purchases=r.buys.filter(b=>b.hero==='drow');assert.equal(purchases.length,4);assert.ok(purchases[0].wave<=10);assert.ok(purchases.at(-1).wave<=18);
 assert.ok(r.fights.every(f=>f.won&&f.seconds>=10&&f.seconds<150));assert.ok(r.bosses.every(b=>b.won&&b.seconds>=15&&b.seconds<180));
 assert.ok(r.heroes.every(h=>Number.isFinite(h.damage)&&h.gold>=0&&h.inventory===15));assert.ok(r.peakEnemies<=20);
});
test('late-game skilled campaign clears 60 waves without reviving exhausted heroes or stalling progression',()=>{
 const r=simulate({seed:23,mode:'skilled',toWave:60,maxSeconds:6000});assert.equal(r.reached,61);assert.equal(r.gameOver,false);assert.equal(r.bossKills,1);assert.ok(r.lives.filter(n=>n>0).length>=4);assert.ok(r.rows.find(row=>row.wave===60).seconds<150);assert.ok(r.heroes.every(h=>h.earned>=h.spent));
});
