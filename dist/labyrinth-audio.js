// Procedural, local sound effects. A user gesture unlocks Web Audio on browsers.
// Hero attack and cast sounds are original oscillator/noise one-shots (no
// samples, nothing copied). Each recipe's layers are pre-mixed by a per-shot
// gain (~.1/pk ≈ −20 dBFS peak, roughly twice the ambient mob cue) and go
// straight to the destination — the same proven path as every built-in sound,
// with no shared processing bus. Recordings you own can be dropped into
// sounds/heroes/<hero>.mp3|ogg|wav (served mode) to override a hero's attack
// synth. unlock() plays one soft confirmation tick the first time audio is
// truly running.
// Layer fields: k tone|noise, f freq, e end freq (tone), l length s, v mix vol,
// w waveform, at offset s, a attack s (default 1.5 ms), r shaped release s.
export const LAB_ATTACK_SOUNDS={
 drow:{pk:1.15,layers:[{k:'tone',f:1150,e:640,l:.09,v:.5},{k:'tone',at:.02,f:1720,e:1400,l:.13,v:.22},{k:'noise',l:.11,v:.18,f:5200},{k:'tone',f:220,e:185,l:.06,v:.25}]},
 timber:{pk:1.2,layers:[{k:'tone',f:190,e:330,l:.16,v:.45,w:'sawtooth',r:.03},{k:'tone',at:.05,f:210,e:170,l:.12,v:.3,w:'sawtooth'},{k:'noise',l:.09,v:.15,f:2400},{k:'tone',f:160,e:135,l:.07,v:.3}]},
 sf:{pk:1.2,layers:[{k:'tone',f:340,e:130,l:.22,v:.5},{k:'tone',f:680,e:260,l:.18,v:.22,w:'triangle'},{k:'noise',l:.15,v:.2,f:900},{k:'tone',f:190,e:150,l:.07,v:.28}]},
 rubick:{pk:1.15,layers:[{k:'tone',f:620,e:980,l:.1,v:.45,w:'triangle'},{k:'tone',at:.03,f:1240,e:1660,l:.12,v:.25},{k:'tone',f:440,e:330,l:.08,v:.2},{k:'tone',f:245,e:210,l:.06,v:.25}]},
 sniper:{pk:1.3,layers:[{k:'noise',l:.05,v:.55,f:6000},{k:'tone',f:2100,e:170,l:.04,v:.45,w:'square'},{k:'tone',f:190,e:120,l:.1,v:.3}]},
 cm:{pk:1.05,layers:[{k:'tone',f:1560,e:2100,l:.12,v:.4},{k:'tone',at:.04,f:2090,e:2620,l:.16,v:.28},{k:'tone',f:780,e:720,l:.2,v:.12},{k:'tone',f:260,e:230,l:.06,v:.22}]},
 jugger:{pk:.85,layers:[{k:'noise',l:.14,v:.5,f:2800},{k:'tone',at:.09,f:3200,e:2600,l:.05,v:.2},{k:'tone',f:160,e:100,l:.1,v:.32}]},
 mars:{pk:1.15,layers:[{k:'tone',f:220,e:95,l:.16,v:.42},{k:'noise',l:.18,v:.45,f:1400},{k:'tone',f:170,e:140,l:.07,v:.25}]},
 witch:{pk:.95,layers:[{k:'tone',f:500,e:760,l:.08,v:.4,w:'triangle'},{k:'tone',at:.07,f:760,e:430,l:.12,v:.38,w:'triangle'},{k:'tone',at:.05,f:1250,e:900,l:.06,v:.15},{k:'tone',f:230,e:195,l:.06,v:.22}]},
 magnus:{pk:1.1,layers:[{k:'tone',f:130,e:98,l:.22,v:.42,w:'square',r:.04},{k:'tone',f:260,e:196,l:.18,v:.2,w:'square',r:.04},{k:'noise',l:.14,v:.18,f:700},{k:'tone',f:180,e:150,l:.08,v:.28}]}
};
// Per-spell cast sounds, keyed 'hero:slot' — one original one-shot per castable
// ability (passives stay silent). Procs (headshot/bladedance/bulwark/reactive)
// are keyed by kind and layered as accents over the attack or block they ride.
export const LAB_SPELL_SOUNDS={
 'sniper:0':{pk:1.2,layers:[{k:'noise',l:.06,v:.5,f:1800},{k:'tone',f:320,e:90,l:.07,v:.4,w:'square'},{k:'noise',at:.05,l:.16,v:.14,f:5000},{k:'tone',f:180,e:140,l:.06,v:.28}]},
 'sniper:2':{pk:.63,layers:[{k:'tone',f:880,e:1180,l:.09,v:.3},{k:'tone',at:.03,f:1320,e:1260,l:.07,v:.18},{k:'tone',f:240,e:220,l:.05,v:.15}]},
 'sniper:3':{pk:1.6,layers:[{k:'tone',f:700,e:2400,l:.09,v:.32},{k:'noise',at:.09,l:.15,v:.45,f:700},{k:'tone',at:.09,f:130,e:70,l:.16,v:.4},{k:'noise',at:.09,l:.1,v:.25,f:3500},{k:'tone',at:.09,f:170,e:120,l:.08,v:.25}]},
 'drow:0':{pk:.83,layers:[{k:'tone',f:2600,e:3200,l:.07,v:.35},{k:'noise',l:.09,v:.28,f:6500},{k:'tone',f:1900,e:1600,l:.06,v:.2}]},
 'drow:1':{pk:.9,layers:[{k:'noise',l:.2,v:.5,f:1400,a:.04},{k:'noise',at:.02,l:.16,v:.28,f:4000},{k:'tone',f:900,e:500,l:.12,v:.12}]},
 'drow:2':{pk:.65,layers:[{k:'tone',f:2100,e:2600,l:.04,v:.4},{k:'tone',at:.07,f:2100,e:2600,l:.04,v:.4},{k:'tone',at:.14,f:2100,e:2600,l:.04,v:.4},{k:'noise',l:.05,v:.25,f:6000},{k:'noise',at:.07,l:.05,v:.25,f:6000},{k:'noise',at:.14,l:.05,v:.25,f:6000}]},
 'drow:3':{pk:.95,layers:[{k:'tone',f:1200,e:1800,l:.18,v:.38},{k:'tone',at:.06,f:1800,e:2400,l:.14,v:.22},{k:'noise',l:.15,v:.15,f:5000},{k:'tone',f:200,e:170,l:.07,v:.2}]},
 'sf:0':{pk:1.4,layers:[{k:'tone',f:150,e:85,l:.18,v:.5},{k:'noise',l:.14,v:.4,f:900},{k:'tone',f:300,e:120,l:.16,v:.25,w:'triangle'},{k:'tone',f:190,e:150,l:.06,v:.25}]},
 'sf:3':{pk:1.55,layers:[{k:'tone',f:90,e:55,l:.22,v:.5},{k:'tone',f:500,e:180,l:.2,v:.35,w:'triangle'},{k:'noise',l:.2,v:.4,f:1600},{k:'noise',at:.04,l:.16,v:.3,f:400},{k:'tone',f:160,e:110,l:.09,v:.3}]},
 'rubick:0':{pk:.78,layers:[{k:'tone',f:520,e:880,l:.14,v:.4},{k:'noise',l:.1,v:.18,f:3200},{k:'tone',f:230,e:200,l:.06,v:.2}]},
 'rubick:1':{pk:.8,layers:[{k:'tone',f:1500,e:1150,l:.08,v:.45,w:'triangle'},{k:'noise',l:.05,v:.2,f:5200},{k:'tone',f:250,e:215,l:.05,v:.15}]},
 'rubick:3':{pk:.76,layers:[{k:'tone',f:400,e:900,l:.16,v:.4,w:'triangle'},{k:'tone',at:.16,f:1500,e:1800,l:.03,v:.3},{k:'noise',l:.14,v:.18,f:2400},{k:'tone',f:220,e:190,l:.06,v:.18}]},
 'jugger:0':{pk:1.17,layers:[{k:'noise',l:.2,v:.5,f:2600},{k:'tone',f:1300,e:900,l:.18,v:.2,w:'triangle'},{k:'noise',at:.07,l:.1,v:.25,f:4000},{k:'tone',f:170,e:140,l:.08,v:.22}]},
 'jugger:1':{pk:.63,layers:[{k:'tone',f:520,e:560,l:.18,v:.32},{k:'tone',at:.04,f:780,e:740,l:.12,v:.16},{k:'tone',f:260,e:230,l:.07,v:.15}]},
 'jugger:3':{pk:.95,layers:[{k:'noise',l:.05,v:.5,f:3400},{k:'noise',at:.08,l:.05,v:.5,f:3400},{k:'noise',at:.16,l:.05,v:.5,f:3400},{k:'tone',f:2200,e:800,l:.045,v:.35,w:'square'},{k:'tone',at:.08,f:2200,e:800,l:.045,v:.35,w:'square'},{k:'tone',at:.16,f:2200,e:800,l:.045,v:.35,w:'square'},{k:'tone',f:180,e:140,l:.05,v:.2},{k:'tone',at:.08,f:180,e:140,l:.05,v:.2},{k:'tone',at:.16,f:180,e:140,l:.05,v:.2}]},
 'mars:0':{pk:1.13,layers:[{k:'noise',l:.14,v:.45,f:1200},{k:'tone',f:220,e:95,l:.12,v:.4},{k:'tone',f:165,e:135,l:.07,v:.28}]},
 'mars:1':{pk:1.35,layers:[{k:'noise',l:.16,v:.5,f:1000},{k:'noise',at:.02,l:.12,v:.3,f:2800},{k:'tone',f:180,e:80,l:.14,v:.3,w:'square'},{k:'tone',f:155,e:125,l:.08,v:.25}]},
 'mars:3':{pk:1.33,layers:[{k:'tone',f:110,e:60,l:.2,v:.5},{k:'noise',l:.16,v:.35,f:500},{k:'tone',f:220,e:90,l:.14,v:.2,w:'triangle'},{k:'tone',f:150,e:120,l:.08,v:.28}]},
 'witch:0':{pk:.88,layers:[{k:'tone',f:380,e:300,l:.07,v:.45,w:'triangle'},{k:'tone',at:.08,f:320,e:260,l:.07,v:.35,w:'triangle'},{k:'tone',f:210,e:180,l:.05,v:.28},{k:'noise',l:.04,v:.15,f:1200}]},
 'witch:1':{pk:.61,layers:[{k:'tone',f:440,e:470,l:.16,v:.32},{k:'tone',at:.05,f:660,e:640,l:.1,v:.15},{k:'tone',f:240,e:215,l:.07,v:.14}]},
 'witch:2':{pk:.72,layers:[{k:'tone',f:260,e:230,l:.2,v:.4},{k:'tone',at:.04,f:390,e:360,l:.14,v:.2,w:'triangle'},{k:'noise',l:.14,v:.12,f:700}]},
 'witch:3':{pk:.75,layers:[{k:'tone',f:1400,e:900,l:.04,v:.4,w:'square'},{k:'tone',at:.05,f:1400,e:900,l:.04,v:.4,w:'square'},{k:'tone',at:.1,f:1400,e:900,l:.04,v:.4,w:'square'},{k:'tone',at:.15,f:1400,e:900,l:.04,v:.4,w:'square'},{k:'noise',l:.03,v:.2,f:4500},{k:'noise',at:.05,l:.03,v:.2,f:4500},{k:'noise',at:.1,l:.03,v:.2,f:4500},{k:'noise',at:.15,l:.03,v:.2,f:4500},{k:'tone',f:200,e:170,l:.04,v:.15},{k:'tone',at:.15,f:200,e:170,l:.04,v:.15}]},
 'magnus:0':{pk:1.23,layers:[{k:'tone',f:220,e:110,l:.2,v:.42,w:'sawtooth'},{k:'noise',l:.18,v:.35,f:800},{k:'tone',f:440,e:220,l:.12,v:.18,w:'square'},{k:'tone',f:160,e:130,l:.08,v:.28}]},
 'magnus:1':{pk:.71,layers:[{k:'tone',f:700,e:1050,l:.12,v:.35},{k:'tone',at:.04,f:1400,e:2100,l:.1,v:.18},{k:'tone',f:235,e:205,l:.06,v:.18}]},
 'magnus:2':{pk:1.4,layers:[{k:'noise',l:.18,v:.5,f:1500},{k:'tone',f:180,e:260,l:.16,v:.3,w:'sawtooth'},{k:'tone',at:.16,f:120,e:70,l:.08,v:.35,w:'square'},{k:'tone',at:.16,f:150,e:120,l:.06,v:.25}]},
 'magnus:3':{pk:1.15,layers:[{k:'tone',f:300,e:90,l:.14,v:.42,w:'sawtooth'},{k:'noise',l:.12,v:.3,f:600},{k:'noise',at:.14,l:.1,v:.45,f:1400},{k:'tone',at:.14,f:95,e:55,l:.11,v:.45},{k:'tone',at:.14,f:165,e:135,l:.06,v:.25}]},
 'timber:0':{pk:1.15,layers:[{k:'noise',l:.2,v:.5,f:2100},{k:'tone',f:900,e:700,l:.18,v:.25,w:'sawtooth'},{k:'noise',at:.08,l:.1,v:.2,f:3300},{k:'tone',f:175,e:150,l:.07,v:.2}]},
 'timber:1':{pk:.99,layers:[{k:'tone',f:1100,e:800,l:.04,v:.45,w:'square'},{k:'noise',l:.05,v:.3,f:2600},{k:'noise',at:.05,l:.12,v:.4,f:1400},{k:'tone',at:.05,f:185,e:155,l:.06,v:.22}]},
 'timber:3':{pk:1.12,layers:[{k:'noise',l:.2,v:.5,f:2800},{k:'tone',f:1100,e:850,l:.2,v:.22,w:'sawtooth'},{k:'noise',at:.09,l:.1,v:.2,f:1900},{k:'tone',f:170,e:145,l:.07,v:.2}]},
 'cm:0':{pk:1.18,layers:[{k:'noise',l:.05,v:.4,f:5500},{k:'tone',f:1900,e:2600,l:.09,v:.35},{k:'noise',at:.05,l:.15,v:.25,f:3000},{k:'tone',f:230,e:200,l:.06,v:.18}]},
 'cm:1':{pk:.84,layers:[{k:'tone',f:2300,e:1900,l:.12,v:.35},{k:'tone',at:.04,f:3100,e:2900,l:.1,v:.2},{k:'noise',l:.14,v:.15,f:4800},{k:'tone',f:245,e:215,l:.06,v:.14}]},
 'cm:3':{pk:1.15,layers:[{k:'noise',l:.2,v:.4,f:3600},{k:'tone',f:1700,e:2200,l:.08,v:.3},{k:'tone',at:.09,f:1700,e:2200,l:.08,v:.3},{k:'tone',at:.18,f:1700,e:2200,l:.08,v:.3},{k:'tone',at:.02,f:300,e:200,l:.16,v:.25},{k:'tone',f:185,e:155,l:.08,v:.2}]}
};
export const LAB_PROC_SOUNDS={
 headshot:{pk:1.05,layers:[{k:'noise',l:.03,v:.5,f:7000},{k:'tone',f:2600,e:900,l:.035,v:.4,w:'square'},{k:'tone',f:300,e:240,l:.04,v:.15}]},
 bladedance:{pk:.82,layers:[{k:'tone',f:3600,e:3000,l:.06,v:.4},{k:'noise',l:.04,v:.3,f:5000},{k:'tone',f:250,e:210,l:.04,v:.12}]},
 bulwark:{pk:.95,layers:[{k:'tone',f:900,e:700,l:.06,v:.4,w:'square'},{k:'tone',f:1800,e:1400,l:.05,v:.25},{k:'noise',l:.04,v:.3,f:2200}]},
 reactive:{pk:.52,layers:[{k:'tone',f:2400,e:2000,l:.04,v:.32},{k:'tone',f:1600,e:1300,l:.03,v:.2,w:'square'}]}
};
export function createLabAudio(){
 let context=null,muted=false,lastMob=0,samples={},samplesTried=false,noiseBuf=null,lastOne={},unlocked=false;
 function unlock(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!context){context=new C();noiseBuf=context.createBuffer(1,context.sampleRate,context.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;loadSamples()}const tick=()=>{if(!unlocked&&!muted){unlocked=true;try{tone(880,0,.09,.05,'sine',660)}catch{}}};if(context.state==='running')tick();else context.resume().then(tick).catch(()=>{})}catch{}}
 function loadSamples(){if(samplesTried)return;samplesTried=true;let proto='';try{proto=location.protocol}catch{}if(!/^https?:/.test(proto))return;fetch('sounds/heroes/manifest.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(files=>{for(const id of Object.keys(files))loadSample(id,files[id])}).catch(()=>{})}
 function loadSample(id,ext){if(!ext)return;fetch(`sounds/heroes/${id}.${ext}`).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(b=>context.decodeAudioData(b)).then(buf=>{samples[id]=buf}).catch(()=>{})}
 function tone(freq,start,length,volume,type='sine',end=freq,dest){if(!context)return;const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime+start;osc.type=type;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(1,end),t+length);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+length);osc.connect(gain);gain.connect(dest||context.destination);osc.start(t);osc.stop(t+length+.02)}
 function toneL(s,dest){if(!context)return;const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime+(s.at||0),a=s.a!==undefined?s.a:.0015;osc.type=s.w||'sine';osc.frequency.setValueAtTime(s.f,t);osc.frequency.exponentialRampToValueAtTime(Math.max(1,s.e!==undefined?s.e:s.f),t+s.l);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(s.v,t+a);if(s.r>0){gain.gain.exponentialRampToValueAtTime(s.v*.5,t+Math.max(a+.001,s.l-s.r));gain.gain.exponentialRampToValueAtTime(.0001,t+s.l)}else gain.gain.exponentialRampToValueAtTime(.0001,t+s.l);osc.connect(gain);gain.connect(dest);osc.start(t);osc.stop(t+s.l+.02)}
 function noise(start,length,volume,freq,dest){if(!context||!noiseBuf)return;const src=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),t=context.currentTime+start;src.buffer=noiseBuf;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.8;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+length);src.connect(filter);filter.connect(gain);gain.connect(dest||context.destination);src.start(t);src.stop(t+length+.02)}
 function noiseL(s,dest){if(!context||!noiseBuf)return;const src=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),t=context.currentTime+(s.at||0);src.buffer=noiseBuf;filter.type='bandpass';filter.frequency.value=s.f;filter.Q.value=.8;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(s.v,t+(s.a!==undefined?s.a:.0015));gain.gain.exponentialRampToValueAtTime(.0001,t+s.l);src.connect(filter);filter.connect(gain);gain.connect(dest);src.start(t);src.stop(t+s.l+.02)}
 function play(kind){if(!context||muted||context.state!=='running')return;const now=context.currentTime;if(kind==='mob'){if(now-lastMob<.07)return;lastMob=now;tone(570,0,.12,.045,'sine',350)}
 else if(kind==='elite'){tone(590,0,.25,.055,'sine',480);tone(880,.035,.24,.025,'sine',720)}
 else if(kind==='boss'){[523,659,784,1046].forEach((f,i)=>{tone(f,i*.12,1.0,.045,'sine',f*.98);tone(f*2,i*.12,.55,.008,'sine')})}
 else if(kind==='shop'){[220,330,392,494,587,440].forEach((f,i)=>tone(f,i*.4,.95,.035,'sine',f*.99));tone(110,0,2.9,.014,'triangle',123)}
 else if(kind==='fog'){tone(83,0,2.95,.028,'sine',70);tone(128,.1,2.7,.018,'triangle',119);[311,294,247].forEach((f,i)=>tone(f,.22+i*.72,1.05,.024,'sine',f*.97))}}
 function oneShot(recipe,key){const now=context.currentTime,prev=lastOne[key];if(prev!==undefined&&now-prev<.06)return;lastOne[key]=now;const g=context.createGain();g.gain.value=.1/recipe.pk;g.connect(context.destination);for(const s of recipe.layers){if(s.k==='noise')noiseL(s,g);else toneL(s,g)}}
 function playAttack(heroId){if(!context||muted||context.state!=='running')return;const id=String(heroId||''),now=context.currentTime,prev=lastOne[id];if(prev!==undefined&&now-prev<.06)return;lastOne[id]=now;const buf=samples[id];if(buf){const src=context.createBufferSource(),gain=context.createGain();src.buffer=buf;gain.gain.value=.5;src.connect(gain);gain.connect(context.destination);src.start();return}const recipe=LAB_ATTACK_SOUNDS[id];if(!recipe)return;const g=context.createGain();g.gain.value=.1/recipe.pk;g.connect(context.destination);for(const s of recipe.layers){if(s.k==='noise')noiseL(s,g);else toneL(s,g)}}
 function playCast(heroId,slot){if(!context||muted||context.state!=='running')return;const key=String(heroId||'')+':'+(Number.isInteger(slot)?slot:0);const recipe=LAB_SPELL_SOUNDS[key];if(!recipe)return;oneShot(recipe,key)}
 function playProc(heroId,kind){if(!context||muted||context.state!=='running')return;const recipe=LAB_PROC_SOUNDS[String(kind||'')];if(!recipe)return;oneShot(recipe,'proc:'+String(kind))}
 return {unlock,play,playAttack,playCast,playProc,setMuted(v){muted=!!v}};
}
