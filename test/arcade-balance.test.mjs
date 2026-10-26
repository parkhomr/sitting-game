import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditArcade} from '../balance/arcade-audit.mjs';
for(const seed of [40,58])test(`Chaos campaign reaches late waves, resolves duels and ends with exactly one surviving build (seed ${seed})`,()=>{const r=auditArcade('chaos',seed,3000);assert.equal(r.finished,true);assert.ok(r.wave>=25&&r.wave<=50);assert.ok(r.livesAt15.filter(n=>n>0).length>=7);assert.ok(r.duels>=10);assert.equal(r.lives.filter(n=>n>0).length,1);assert.ok(r.peakProjectiles<=300);assert.ok(r.peakSummons<=100);assert.ok(r.builds.every(p=>p.skills.length>=4));});
test('Pudge bots finish all thirty one-hit rounds without an external score override',()=>{const r=auditArcade('pudge',41,2200);assert.equal(r.finished,true);assert.equal(r.roundsPlayed,30);assert.equal(r.round,30);assert.ok(r.score.every(n=>n<=30));assert.ok(r.lives.every(n=>n===5));assert.ok(r.seconds<2000);});
