// All effects are local Canvas animation; no particles are sent over the network.
const FX_COLORS={drow:'#a8f5ff',timber:'#f0bb64',sf:'#ff493d',rubick:'#94fb72',sniper:'#ffe3a0'};
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
function ring(c,x,y,r,color,flat=.5){r=Math.max(0,r);c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.ellipse(x,y,r,r*flat,0,0,Math.PI*2);c.stroke();}
function flame(c,x,y,size,t){
  ring(c,x,y,size,'#290f22');ring(c,x,y,size*.78,'#ff4e35');
  c.fillStyle='#391324';c.beginPath();c.ellipse(x,y,size*.7,size*.25,0,0,Math.PI*2);c.fill();
  for(let i=0;i<7;i++){const dx=(i-3)*size*.2,h=size*(.6+Math.sin(i*4+t*18)*.2);c.fillStyle=i%2?'#d52430':'#ff5d35';c.fillRect(x+dx-3,y-h,6,h);c.fillStyle='#ffb66a';c.fillRect(x+dx-1,y-h*.7,3,h*.6);}
}
function blade(c,x,y,r,angle){
  c.save();c.translate(x,y);c.rotate(angle);c.fillStyle='#343e3b';c.strokeStyle='#fff0b6';c.lineWidth=1.5;c.beginPath();
  for(let i=0;i<48;i++){const a=i*Math.PI/24,d=i%4<2?r:r*.76;c.lineTo(Math.cos(a)*d,Math.sin(a)*d);}c.closePath();c.fill();c.stroke();
  c.fillStyle='#bfc8bc';c.beginPath();c.arc(0,0,r*.65,0,Math.PI*2);c.fill();
  for(let j=0;j<3;j++){c.rotate(Math.PI*2/3);c.fillStyle='#61776c';c.beginPath();c.moveTo(3,-2);c.lineTo(r*.55,-r*.18);c.lineTo(r*.25,r*.3);c.fill();}
  c.fillStyle='#d6a458';c.fillRect(-3,-3,6,6);c.restore();
}
function soul(c,x,y,angle,size,time,color='#ff584b'){
  c.save();c.translate(x,y);c.rotate(angle);c.scale(size,size);
  c.fillStyle=color;c.beginPath();c.moveTo(8,-7);for(let i=0;i<7;i++)c.lineTo(-i*9,Math.sin(time*14+i)*4+(7-i)*2);for(let i=6;i>=0;i--)c.lineTo(-i*9,Math.sin(time*14+i)*4-(7-i)*2);c.closePath();c.fill();
  line(c,[{x:-40,y:Math.sin(time*14)*5},{x:-20,y:3},{x:-4,y:0}],'#ffd6a6',2);
  c.fillStyle='#f3d9c4';c.beginPath();[[-7,-9],[5,-11],[11,-5],[11,5],[6,8],[5,13],[-3,13],[-6,7],[-10,3],[-10,-4]].forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fill();
  c.fillStyle='#361c2b';c.fillRect(-5,-4,5,5);c.fillRect(3,-5,5,5);c.fillRect(0,3,3,3);c.fillRect(-1,9,2,4);c.fillRect(3,8,2,4);c.fillStyle='#ff6452';c.fillRect(-3,-2,2,2);c.fillRect(4,-3,2,2);
  c.fillStyle='#ffb094';c.fillRect(-17,-11,12,3);c.fillRect(-19,10,12,3);c.restore();
}
export function drawChannel(c,p,time){
  for(let i=0;i<6;i++){const a=time*2+i*Math.PI/3,r=48+Math.sin(time*4+i)*9;soul(c,p.x+Math.cos(a)*r,p.y-30+Math.sin(a)*r*.55,a+Math.PI/2,.6,time+i);}
}
export function drawZones(c,zones,time){
  for(const zone of zones||[]){
    c.save();c.fillStyle='#ba8e4220';c.beginPath();c.ellipse(zone.x,zone.y,zone.radius,zone.radius,0,0,Math.PI*2);c.fill();c.strokeStyle='#c8ab6555';c.lineWidth=1;c.setLineDash([4,12]);c.stroke();c.setLineDash([]);
    for(let i=0;i<42;i++){
      const a=i*2.399963+zone.id,r=zone.radius*Math.sqrt((i+.5)/42),phase=(time*1.6+i*.173)%1,tx=zone.x+Math.cos(a)*r,ty=zone.y+Math.sin(a)*r,x=tx-(1-phase)*55,y=ty-(1-phase)*235;
      line(c,[{x:x-5,y:y-18},{x,y}],'#c78c44',3);line(c,[{x:x-3,y:y-13},{x,y}],'#ffe4a3',1);c.fillStyle='#fff0b6';c.fillRect(x-1,y-1,3,5);
      if(phase>.78){const t=(phase-.78)/.22;c.fillStyle='#ca9b69';for(let j=0;j<4;j++)c.fillRect(tx+Math.cos(j*1.8)*t*16,ty+Math.sin(j*1.8)*t*11,3,3);c.fillStyle='#9a795a77';c.fillRect(tx-4-t*7,ty-3-t*12,7+t*9,6);}
    }
    c.restore();
  }
}
function enemyProjectile(c,s,target,time){
  const angle=Number.isFinite(s.vx)?Math.atan2(s.vy,s.vx):0,kit=s.skill;c.save();c.translate(s.x,s.y);c.rotate(angle);
  if(['axe','pa','sven','jugger','centaur','creepMelee'].includes(kit)){
    c.rotate(time*(kit==='pa'?3:13));c.fillStyle='#9a7052';c.fillRect(-13,-2,25,5);c.fillStyle='#dbe3d3';c.beginPath();c.moveTo(9,-13);c.lineTo(20,-6);c.lineTo(20,8);c.lineTo(9,13);c.lineTo(13,0);c.closePath();c.fill();c.fillStyle='#7f958a';c.fillRect(10,-5,7,9);
  }else if(kit==='roshan'||kit==='hellbear'){
    c.rotate(time*4);c.fillStyle='#665c4b';c.beginPath();for(let i=0;i<7;i++){const a=i*Math.PI*2/7;c.lineTo(Math.cos(a)*16,Math.sin(a)*13);}c.closePath();c.fill();c.fillStyle='#b6a382';c.fillRect(-9,-8,11,6);c.fillStyle='#3d4238';c.fillRect(2,0,10,6);
  }else if(['lion','wd','dazzle','pudge'].includes(kit)){
    c.restore();soul(c,s.x,s.y,angle,.75,time,kit==='lion'||kit==='dazzle'?'#b78de9':'#8ca95d');return;
  }else if(kit==='cm'||kit==='mindstealer'){
    line(c,[{x:-32,y:0},{x:0,y:0}],'#4c8aa8',4);c.fillStyle='#bae9fa';c.beginPath();c.moveTo(17,0);c.lineTo(0,-9);c.lineTo(-10,0);c.lineTo(0,9);c.closePath();c.fill();c.fillStyle='#f4ffff';c.fillRect(0,-2,10,3);
  }else if(kit==='lina'||kit==='satyr'||kit==='invoker'){
    c.fillStyle=kit==='satyr'?'#b569b0':'#d65532';c.beginPath();c.moveTo(-30,-8);c.lineTo(-9,-4);c.lineTo(-19,-13);c.lineTo(10,-8);c.lineTo(17,0);c.lineTo(9,10);c.lineTo(-25,9);c.lineTo(-12,3);c.closePath();c.fill();c.fillStyle='#ffd586';c.fillRect(-4,-5,13,10);c.fillStyle='#fff2b2';c.fillRect(4,-2,8,4);
    if(kit==='invoker'){c.fillStyle='#9bc8ef';c.fillRect(-10,-17,7,7);c.fillStyle='#e1acec';c.fillRect(-17,10,7,7);}
  }else if(kit==='tide'||kit==='banisher'){
    c.fillStyle='#518e75';c.beginPath();c.ellipse(0,0,15,10,0,0,Math.PI*2);c.fill();c.fillStyle='#bce5ae';c.fillRect(2,-5,9,5);line(c,[{x:-27,y:3},{x:-18,y:-5},{x:-8,y:2}],'#89c89b',3);
  }else{
    line(c,[{x:-28,y:0},{x:9,y:0}],'#b7b28a',3);c.fillStyle='#e3d6a9';c.beginPath();c.moveTo(16,0);c.lineTo(5,-5);c.lineTo(5,5);c.closePath();c.fill();line(c,[{x:-22,y:-5},{x:-16,y:0},{x:-22,y:5}],'#ad7760',2);
  }
  c.restore();
}
export function drawProjectile(c,s,target,time){
  if(s.hostile){enemyProjectile(c,s,target,time);return;}
  const skill=s.skill||s.hero,angle=Number.isFinite(s.vx)?Math.atan2(s.vy,s.vx):0;
  if(s.kind==='soul'){soul(c,s.x,s.y,angle,1.1,time);return;}
  c.save();c.translate(s.x,s.y);c.rotate(angle);
  if(skill==='drow'){
    line(c,[{x:-25,y:0},{x:7,y:0}],'#7ac6df',3);line(c,[{x:-18,y:0},{x:9,y:0}],'#ddfbff',1);
    c.fillStyle='#e0ffff';c.beginPath();c.moveTo(12,0);c.lineTo(4,-4);c.lineTo(4,4);c.fill();line(c,[{x:-17,y:-4},{x:-12,y:0},{x:-17,y:4}],'#c0eaf1');
  }else if(skill==='sf'){
    c.fillStyle='#62142a';c.fillRect(-28,-3,20,6);c.fillStyle='#bb2335';c.fillRect(-20,-5,20,10);c.fillStyle='#fa4b3b';c.fillRect(-7,-6,13,12);c.fillStyle='#301122';c.fillRect(-3,-3,7,6);c.fillStyle='#ffad61';c.fillRect(4,-2,5,4);
  }else if(skill==='timber'){
    blade(c,0,0,s.ability?22:12,time*17);
  }else if(skill==='rubick'){
    line(c,[{x:-23,y:2},{x:-12,y:-4},{x:-5,y:3},{x:8,y:0}],'#73d856',3);c.fillStyle='#c2ffad';c.fillRect(-3,-4,8,8);c.fillStyle='#4c9d55';c.fillRect(-14,-1,5,3);
  }else{
    line(c,[{x:-45,y:0},{x:8,y:0}],'#c79750',3);line(c,[{x:-32,y:0},{x:9,y:0}],'#fff1c8',1);c.fillStyle='#ffecad';c.fillRect(3,-2,8,4);
  }
  c.restore();
}
export class BattleEffects {
  constructor(){this.items=[];}
  add(kind,data,life){this.items.push({...data,kind,age:0,life});if(this.items.length>90)this.items.splice(0,this.items.length-90);}
  cast(event){
    const skill=event.skill||event.hero;this.add('muzzle',{...event,color:FX_COLORS[skill]||'#ffffff'},.18);
    if(!event.ability)return;
    const kind={sf:'raze',timber:'saws',rubick:'chain',sniper:'scope',drow:'frost'}[skill];
    if(kind)this.add(kind,event,skill==='timber'?1:skill==='sniper'?.65:skill==='sf'?.8:.55);
  }
  impact(event){this.add('impact',{...event,color:FX_COLORS[event.skill]||'#d9efba'},.23);}
  enemy(event){this.add('enemy',event,event.kit==='invoker'?1.5:event.kit==='cm'||event.kit==='dazzle'?1.1:.65);}
  sun(event){this.add('sun',event,.7);}
  requiem(event){this.add('requiem',event,.3);}
  raze(event){this.add('raze',{...event,points:[{x:event.x,y:event.y}]},.8);}
  hazard(event){this.add('hazard',{...event,hazardKind:event.kind},.55);}
  neutral(event){this.add('neutral',event,.35);}
  lightning(event){this.add('lightning',event,.28);}
  item(event){this.add('itemActive',event,.5);}
  enemyImpact(event){this.add('enemyImpact',event,.28);}
  clear(){this.items=[];}
  draw(c,dt,time){
    dt=Math.max(0,Math.min(.1,dt));
    this.items=this.items.filter(e=>(e.age+=dt)<e.life);
    for(const e of this.items){
      const t=e.age/e.life,alpha=Math.min(1,(1-t)*2);c.save();c.globalAlpha=alpha;
      if(e.kind==='lightning'){let from={x:e.x,y:e.y};for(const point of e.points){const pts=[from];for(let j=1;j<6;j++)pts.push({x:from.x+(point.x-from.x)*j/6,y:from.y+(point.y-from.y)*j/6+Math.sin(j*11+e.age*30)*12});pts.push(point);line(c,pts,'#528dc4',6);line(c,pts,'#dcf5ff',2);from=point;}}else if(e.kind==='itemActive'){ring(c,e.x,e.y-30,20+t*45,e.item==='bkb'?'#ffe19b':'#a1ddff',1);
      }else if(e.kind==='requiem'){
        flame(c,e.x,e.y,30*(1-t),time);
      }else if(e.kind==='enemyImpact'){
        for(let j=0;j<7;j++){const a=j*Math.PI*2/7;c.fillStyle=j%2?'#d49a76':'#f4d3a3';c.fillRect(e.x+Math.cos(a)*t*22,e.y+Math.sin(a)*t*18,4*(1-t)+1,3);}
      }else if(e.kind==='hazard'){
        const color=e.hazardKind==='manaBurn'?'#9ec2ff':'#f1ad73';
        if(e.fromX!==undefined)line(c,[{x:e.fromX,y:e.fromY},{x:e.toX,y:e.toY}],color,10*(1-t));
        else ring(c,e.x,e.y,e.radius*(.4+t*.8),color,1);
      }else if(e.kind==='neutral'){
        const color=e.kit==='banisher'?'#bfdc8d':e.ranged?'#e0a875':'#a48573';
        ring(c,e.x,e.y,8+t*14,color,1);
      }else if(e.kind==='muzzle'){
        const r=5+e.age*35;c.fillStyle=e.color;c.fillRect(e.x-r*.5,e.y-2,r,4);c.fillRect(e.x-2,e.y-r*.5,4,r);
      }else if(e.kind==='raze'){
        (e.points||[]).forEach((p,i)=>{const age=e.age-i*.035;if(age>=0)flame(c,p.x,p.y,(e.radius||60)*(.25+Math.sin(Math.min(1,age/.55)*Math.PI)*.5),time+i);});
      }else if(e.kind==='chain'){
        let from={x:e.x,y:e.y};for(const [i,p] of (e.points||[]).entries()){const chain=[];for(let j=0;j<=8;j++){const a=j/8;chain.push({x:from.x+(p.x-from.x)*a,y:from.y+(p.y-20-from.y)*a+(j===0||j===8?0:Math.sin(j*9+i*3+e.age*70)*10)});}line(c,chain,'#458743',6);line(c,chain,'#a8ff87',2);line(c,[{x:p.x-12,y:p.y-25},{x:p.x,y:p.y-40},{x:p.x+12,y:p.y-25},{x:p.x,y:p.y-10},{x:p.x-12,y:p.y-25}],'#b8ffa0',2);from={x:p.x,y:p.y-20};}
      }else if(e.kind==='saws'){
        for(let j=0;j<4;j++){const a=time*7+j*Math.PI/2,r=38+t*35;blade(c,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*.7,22,time*19+j);}

      }else if(e.kind==='scope'){
        for(const p of e.points||[]){ring(c,p.x,p.y-25,19-t*10,'#ffcf89',1);line(c,[{x:p.x-28,y:p.y-25},{x:p.x+28,y:p.y-25}],'#ffe3a2');line(c,[{x:p.x,y:p.y-54},{x:p.x,y:p.y+4}],'#ffe3a2');}
      }else if(e.kind==='frost'){
        ring(c,e.x,e.y,10+t*28,'#c4f8ff',.7);for(let j=0;j<5;j++){const a=(j-2)*.16;line(c,[{x:e.x,y:e.y},{x:e.x+Math.cos(a)*t*80,y:e.y+Math.sin(a)*t*80}],'#a6e7f6',1);}
      }else if(e.kind==='impact'){
        for(let j=0;j<5;j++){const a=j*Math.PI*.4;c.fillStyle=e.color;c.fillRect(e.x+Math.cos(a)*t*20,e.y+Math.sin(a)*t*17,3,3);}if(e.ability&&e.skill==='sf')flame(c,e.x,e.y+15,12*(1-t),time);
      }else if(e.kind==='sun'){
        for(const p of e.points||[]){flame(c,p.x,p.y,25*(1-t*.5),time);c.fillStyle='#ffd789';c.fillRect(p.x-5,p.y-120*(1-t),10,120*(1-t));}
      }else if(e.kind==='enemy'){
        const color={axe:'#f29570',lina:'#ffbe75',cm:'#b9efff',pudge:'#c8ba8b',pa:'#aad5d7',tide:'#8ee6c4',sven:'#f5c36c',lion:'#d6a1ec',wd:'#adf0a2',invoker:'#efb26b',jugger:'#f0d7b9',dazzle:'#f1b3ee',roshan:'#ed9f67'}[e.kit];
        if(e.kit==='roshan'){
          if(e.skill==='Thunder Clap'){for(let i=0;i<3;i++)ring(c,e.x,e.y+30,Math.max(0,t*520-i*35),color,.3);}
          else line(c,[{x:e.x,y:e.y},{x:e.points[0].x,y:e.points[0].y}],color,7*(1-t));
          for(const p of e.points||[]){ring(c,p.x,p.y+15,12+t*35,color);for(let j=0;j<5;j++){c.fillStyle=j%2?'#9b7150':'#e2b077';c.fillRect(p.x+(j-2)*13,p.y-10-t*(35+j*5),6,7);}}
        }
        if(['axe','tide','jugger','sven'].includes(e.kit))ring(c,e.x,e.y+35,18+t*(e.kit==='tide'?400:90),color,.4);
        for(const p of e.points||[]){
          if(e.kit==='invoker'){ring(c,p.x,p.y+10,25,color,.5);ring(c,p.x,p.y+10,12+Math.sin(time*8)*4,'#f8dca7',.5);}
          else if(e.kit==='wd'||e.kit==='dazzle'){c.fillStyle=color;c.fillRect(p.x-9,p.y-15-t*25,18,4);c.fillRect(p.x-2,p.y-22-t*25,4,18);ring(c,p.x,p.y+25,17+t*14,color);}
          else if(['lina','pudge','lion'].includes(e.kit)){c.fillStyle=color;c.fillRect(e.x-6,e.y-6,12*(1-t),12*(1-t));}
          else if(e.kit==='cm'){ring(c,p.x,p.y,18,color,1);for(let j=0;j<6;j++){const a=j*Math.PI/3;line(c,[{x:p.x,y:p.y},{x:p.x+Math.cos(a)*26,y:p.y+Math.sin(a)*26}],color);}}
          else if(e.kit==='pa'){line(c,[{x:p.x-25,y:p.y-30},{x:p.x+20,y:p.y+20}],color,4);}
        }
      }
      c.restore();
    }
  }
}

export function drawSkillIcon(c,kit){
  c.clearRect(0,0,48,48);c.save();
  if(kit==='timber')blade(c,24,24,18,.3);
  else if(kit==='sf'||kit==='requiem'){
    if(kit==='requiem'){for(let i=0;i<3;i++){const a=i*Math.PI*2/3;soul(c,24+Math.cos(a)*11,24+Math.sin(a)*11,a,.57,i);}}
    else soul(c,28,25,-.3,1,0);
  }else if(kit==='drow'){
    for(let i=0;i<3;i++){const y=12+i*11;line(c,[{x:6,y:y+8},{x:37,y:y-5}],'#ace9f6',2);c.fillStyle='#edffff';c.beginPath();c.moveTo(42,y-8);c.lineTo(31,y-7);c.lineTo(36,y);c.fill();}
  }else if(kit==='rubick'){
    line(c,[{x:6,y:12},{x:22,y:20},{x:12,y:29},{x:38,y:37}],'#59954f',7);line(c,[{x:6,y:12},{x:22,y:20},{x:12,y:29},{x:38,y:37}],'#c1ffa4',3);for(const p of [{x:7,y:10},{x:38,y:37}]){c.fillStyle='#d0ffac';c.fillRect(p.x-3,p.y-3,6,6);}
  }else if(kit==='eul'){
    for(let i=0;i<5;i++)ring(c,24,9+i*7,5+i*3,'#c7e8e7',.3);
  }else if(kit==='shrapnel'){
    for(let i=0;i<7;i++){const x=8+(i*11)%32,y=4+(i*7)%27;line(c,[{x:x-4,y},{x:x+3,y:y+13}],'#ffe2a0',3);c.fillStyle='#d29c5b';c.fillRect(x+2,y+12,3,6);}
  }else{
    ring(c,24,24,15,'#ecd59c',1);line(c,[{x:24,y:3},{x:24,y:45}],'#ecd59c',2);line(c,[{x:3,y:24},{x:45,y:24}],'#ecd59c',2);
  }
  c.restore();
}

export function drawItemIcon(c,id,size=48){
  c.clearRect(0,0,size,size);c.save();c.scale(size/48,size/48);c.fillStyle='#15201d';c.fillRect(0,0,48,48);
  if(id==='bkb'){
    c.fillStyle='#6f4f26';c.fillRect(20,6,10,36);c.fillStyle='#d69e42';c.fillRect(17,12,16,24);c.fillStyle='#ffe9a0';c.fillRect(22,13,6,20);c.fillStyle='#b57b32';c.fillRect(10,6,28,7);c.fillRect(13,37,23,6);c.fillStyle='#f7cf72';c.fillRect(10,6,28,3);c.fillRect(14,37,22,3);
  }else if(id==='heart'){
    c.fillStyle='#732a3a';polygonIcon(c,[[24,41],[5,23],[5,12],[11,6],[20,6],[24,12],[29,5],[38,7],[43,15],[41,27]]);c.fillStyle='#df6771';polygonIcon(c,[[24,35],[10,20],[12,12],[19,13],[24,19],[29,11],[36,13],[36,23]]);c.fillStyle='#ffb6a1';c.fillRect(13,13,6,7);c.fillStyle='#8c6039';c.fillRect(25,0,5,12);c.fillRect(32,1,4,8);
  }else if(id==='daedalus'){
    c.save();c.translate(24,24);c.rotate(-.65);c.fillStyle='#985149';c.fillRect(-19,-3,37,6);c.fillRect(-3,-18,6,38);c.fillStyle='#eab385';c.fillRect(-17,-13,4,25);c.fillRect(12,-13,4,25);c.fillRect(-16,-16,30,4);c.fillRect(-16,12,30,4);c.fillStyle='#f2d7a6';c.fillRect(-2,-22,3,33);c.fillStyle='#ec6664';c.fillRect(-4,14,8,8);c.restore();
  }else{
    c.save();c.translate(25,25);c.rotate(-.55);c.fillStyle='#997c52';c.fillRect(-3,-1,6,24);c.fillStyle='#415c82';c.fillRect(-17,-16,34,20);c.fillStyle='#90c8ec';c.fillRect(-17,-16,34,5);c.fillStyle='#d6f2ff';c.fillRect(-17,-16,5,20);c.fillStyle='#6f9dc7';c.fillRect(12,-16,5,20);c.restore();line(c,[{x:34,y:4},{x:28,y:17},{x:38,y:13},{x:28,y:31}],'#d3f1ff',2);
  }
  c.restore();
}
function polygonIcon(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
export function drawItemAuras(c,p,time){
  if(p.respawn>0||p.lives<=0)return;
  if(p.bkbLeft>0){c.save();c.globalAlpha=.75;c.strokeStyle='#f5d270';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y-35,38,58,0,0,Math.PI*2);c.stroke();for(let i=0;i<6;i++){const a=time*2+i*Math.PI/3;c.fillStyle='#ffe4a1';c.fillRect(p.x+Math.cos(a)*36,p.y-35+Math.sin(a)*53,4,4);}c.restore();}
  if(p.staticLeft>0){c.save();c.strokeStyle='#9ddafa';c.lineWidth=2;c.beginPath();for(let i=0;i<=16;i++){const a=i*Math.PI/8,r=43+Math.sin(i*9+time*18)*5,x=p.x+Math.cos(a)*r,y=p.y-30+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.restore();}
  if(p.spawnShield>0)ring(c,p.x,p.y-35,42,'#dbeac075',1);
}
