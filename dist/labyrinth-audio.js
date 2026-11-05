// Procedural, local sound effects. A user gesture unlocks Web Audio on browsers.
export function createLabAudio(){
 let context=null,muted=false,lastMob=0;
 function unlock(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!context)context=new C();if(context.state==='suspended')context.resume().catch(()=>{})}catch{}}
 function tone(freq,start,length,volume,type='sine',end=freq){if(!context)return;const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime+start;osc.type=type;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(1,end),t+length);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+length);osc.connect(gain);gain.connect(context.destination);osc.start(t);osc.stop(t+length+.02)}
 function play(kind){if(!context||muted||context.state!=='running')return;const now=context.currentTime;if(kind==='mob'){if(now-lastMob<.07)return;lastMob=now;tone(570,0,.12,.045,'sine',350)}
 else if(kind==='elite'){tone(590,0,.25,.055,'sine',480);tone(880,.035,.24,.025,'sine',720)}
 else if(kind==='boss'){[523,659,784,1046].forEach((f,i)=>{tone(f,i*.12,1.0,.045,'sine',f*.98);tone(f*2,i*.12,.55,.008,'sine')})}
 else if(kind==='shop'){[220,330,392,494,587,440].forEach((f,i)=>tone(f,i*.4,.95,.035,'sine',f*.99));tone(110,0,2.9,.014,'triangle',123)}
 else if(kind==='fog'){tone(83,0,2.95,.028,'sine',70);tone(128,.1,2.7,.018,'triangle',119);[311,294,247].forEach((f,i)=>tone(f,.22+i*.72,1.05,.024,'sine',f*.97))}}
 return {unlock,play,setMuted(v){muted=!!v}};
}
