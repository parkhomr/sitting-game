// Small reproducible diagnostic matrix, not a balance certification.
import {simulate} from './simulate.mjs';
import {HEROES} from '../dist/labyrinth-data.js';
const seconds=Number(process.argv[2]||300);
const results=[];
for(let difficulty=0;difficulty<=4;difficulty++)for(let size=1;size<=6;size++)for(let seed=1;seed<=2;seed++){
 const roster=Array.from({length:size},(_,i)=>HEROES[(i+size+seed-2)%HEROES.length].id);
 const r=simulate({seed,heroes:roster,difficulty,maxSeconds:seconds});
 results.push(r);
}
console.log(JSON.stringify({description:'Diagnostic bots; 2 seeds, 1-6 players, difficulties 0-4; not a human balance study',maxSeconds:seconds,results},null,2));
