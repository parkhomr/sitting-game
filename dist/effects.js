// All effects are local Canvas animation; no particles are sent over the network.
const FX_COLORS={drow:'#a8f5ff',timber:'#f0bb64',sf:'#ff493d',rubick:'#94fb72',sniper:'#ffe3a0'};
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
function ring(c,x,y,r,color,flat=.5){r=Math.max(0,r);c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.ellipse(x,y,r,r*flat,0,0,Math.PI*2);c.stroke();}
function flame(c,x,y,size,t){
  ring(c,x,y,size,'#290f22');ring(c,x,y,size*.78,'#ff4e35');
  c.fillStyle='#391324';c.beginPath();c.ellipse(x,y,size*.7,size*.25,0,0,Math.PI*2);c.fill();
  for(let i=0;i<7;i++){const dx=(i-3)*size*.2,h=size*(.6+Math.sin(i*4+t*18)*.2);c.fillStyle=i%2?'#d52430':'#ff5d35';c.fillRect(x+dx-3,y-h,6,h);c.fillStyle='#ffb66a';c.fillRect(x+dx-1,y-h*.7,3,h*.6);}
}
export function drawProjectile(c,s,target,time){
  const skill=s.skill||s.hero;if(s.ability&&(skill==='sf'||skill==='rubick'))return;
  const angle=target?Math.atan2(target.y-35-s.y,target.x-s.x):0;
  c.save();c.translate(s.x,s.y);c.rotate(angle);
  if(skill==='drow'){
    line(c,[{x:-25,y:0},{x:7,y:0}],'#7ac6df',3);line(c,[{x:-18,y:0},{x:9,y:0}],'#ddfbff',1);
    c.fillStyle='#e0ffff';c.beginPath();c.moveTo(12,0);c.lineTo(4,-4);c.lineTo(4,4);c.fill();line(c,[{x:-17,y:-4},{x:-12,y:0},{x:-17,y:4}],'#c0eaf1');
  }else if(skill==='sf'){
    c.fillStyle='#62142a';c.fillRect(-28,-3,20,6);c.fillStyle='#bb2335';c.fillRect(-20,-5,20,10);c.fillStyle='#fa4b3b';c.fillRect(-7,-6,13,12);c.fillStyle='#301122';c.fillRect(-3,-3,7,6);c.fillStyle='#ffad61';c.fillRect(4,-2,5,4);
  }else if(skill==='timber'){
    c.rotate(time*15);const radius=s.ability?13:8;c.fillStyle='#e2d7a5';c.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?radius*.72:radius;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();ring(c,0,0,radius*.55,'#617363',1);c.fillStyle='#90633e';c.fillRect(-2,-2,4,4);
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
    if(kind)this.add(kind,event,skill==='sniper'?.65:skill==='sf'?.8:.55);
  }
  impact(event){this.add('impact',{...event,color:FX_COLORS[event.skill]||'#d9efba'},.23);}
  enemy(event){this.add('enemy',event,event.kit==='invoker'?1.5:event.kit==='cm'||event.kit==='dazzle'?1.1:.65);}
  sun(event){this.add('sun',event,.7);}
  requiem(event){this.add('requiem',event,1.1);}
  hazard(event){this.add('hazard',{...event,hazardKind:event.kind},.55);}
  neutral(event){this.add('neutral',event,.35);}
  clear(){this.items=[];}
  draw(c,dt,time){
    dt=Math.max(0,Math.min(.1,dt));
    this.items=this.items.filter(e=>(e.age+=dt)<e.life);
    for(const e of this.items){
      const t=e.age/e.life,alpha=Math.min(1,(1-t)*2);c.save();c.globalAlpha=alpha;
      if(e.kind==='requiem'){
        const r=e.radius*Math.min(1,t*1.8);ring(c,e.x,e.y,r,'#ff5647',1);ring(c,e.x,e.y,r*.75,'#8d293a',1);
        for(let j=0;j<18;j++){const a=j*Math.PI/9,px=e.x+Math.cos(a)*r,py=e.y+Math.sin(a)*r;line(c,[{x:e.x+Math.cos(a)*r*.35,y:e.y+Math.sin(a)*r*.35},{x:px,y:py}],'#e23942',5);c.fillStyle='#ffc0a0';c.fillRect(px-6,py-7,12,12);c.fillStyle='#461a2a';c.fillRect(px-4,py-4,3,3);c.fillRect(px+1,py-4,3,3);}
      }else if(e.kind==='hazard'){
        const color=e.hazardKind==='manaBurn'?'#9ec2ff':'#f1ad73';
        if(e.fromX!==undefined)line(c,[{x:e.fromX,y:e.fromY},{x:e.toX,y:e.toY}],color,10*(1-t));
        else ring(c,e.x,e.y,e.radius*(.4+t*.8),color,1);
      }else if(e.kind==='neutral'){
        const color=e.kit==='banisher'?'#bfdc8d':e.ranged?'#e0a875':'#a48573';
        for(const p of e.points||[])line(c,[{x:e.x,y:e.y},{x:p.x,y:p.y}],color,e.kit?4:2);
      }else if(e.kind==='muzzle'){
        const r=5+e.age*35;c.fillStyle=e.color;c.fillRect(e.x-r*.5,e.y-2,r,4);c.fillRect(e.x-2,e.y-r*.5,4,r);
      }else if(e.kind==='raze'){
        (e.points||[]).forEach((p,i)=>{const age=e.age-i*.035;if(age>=0)flame(c,p.x,p.y,16+Math.sin(Math.min(1,age/.55)*Math.PI)*22,time+i);});
      }else if(e.kind==='chain'){
        let from={x:e.x,y:e.y};for(const [i,p] of (e.points||[]).entries()){const chain=[];for(let j=0;j<=8;j++){const a=j/8;chain.push({x:from.x+(p.x-from.x)*a,y:from.y+(p.y-20-from.y)*a+(j===0||j===8?0:Math.sin(j*9+i*3+e.age*70)*10)});}line(c,chain,'#458743',6);line(c,chain,'#a8ff87',2);ring(c,p.x,p.y-20,8+t*15,'#b8ffa0',1);from={x:p.x,y:p.y-20};}
      }else if(e.kind==='saws'){
        ring(c,e.x-20,e.y+30,20+t*55,'#e6bc79');for(const p of e.points||[]){ring(c,p.x,p.y-10,12+t*24,'#dedcba',.7);for(let j=0;j<6;j++){const a=j*Math.PI/3+time*8;c.fillStyle='#ebbe79';c.fillRect(p.x+Math.cos(a)*22,p.y-10+Math.sin(a)*12,4,4);}}
      }else if(e.kind==='scope'){
        for(const p of e.points||[]){ring(c,p.x,p.y-25,19-t*10,'#ffcf89',1);line(c,[{x:p.x-28,y:p.y-25},{x:p.x+28,y:p.y-25}],'#ffe3a2');line(c,[{x:p.x,y:p.y-54},{x:p.x,y:p.y+4}],'#ffe3a2');if(t>.25)line(c,[{x:e.x,y:e.y},{x:p.x,y:p.y-25}],'#fff0cc',t>.65?1:3);}
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
          else if(['lina','pudge','lion'].includes(e.kit)){line(c,[{x:e.x,y:e.y},{x:(e.x+p.x)/2,y:(e.y+p.y)/2-12},{x:p.x,y:p.y}],color,e.kit==='pudge'?5:3);ring(c,p.x,p.y,8+t*22,color,1);}
          else if(e.kit==='cm'){ring(c,p.x,p.y,18,color,1);for(let j=0;j<6;j++){const a=j*Math.PI/3;line(c,[{x:p.x,y:p.y},{x:p.x+Math.cos(a)*26,y:p.y+Math.sin(a)*26}],color);}}
          else if(e.kit==='pa'){line(c,[{x:p.x-25,y:p.y-30},{x:p.x+20,y:p.y+20}],color,4);}
        }
      }
      c.restore();
    }
  }
}
