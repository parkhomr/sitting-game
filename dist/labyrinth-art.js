import {LAB_WIDTH,LAB_HEIGHT,PORTAL_DURATION} from './labyrinth-data.js';
function artSaw(c,x,y,r,col){c.fillStyle=col;c.beginPath();for(let i=0;i<24;i++){let a=i*Math.PI/12,d=i%2?r:r*.72;i?c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d):c.moveTo(x+Math.cos(a)*d,y+Math.sin(a)*d)}c.closePath();c.fill()}
// All artwork is generated locally. The portraits are stylized 2D illustrations;
// silhouettes and high-contrast equipment remain recognizable at game scale.
export function drawLabHero(c,id,x,y,size=48,options={}){
 const palettes={
  drow:{body:'#3a7084',shade:'#23485c',light:'#a8deea',skin:'#accbd1',cape:'#293f5e',metal:'#b6e4ed'},
  timber:{body:'#b76a42',shade:'#653e35',light:'#e6b16e',skin:'#dac09a',cape:'#754b36',metal:'#c9d3c8'},
  sf:{body:'#7d3032',shade:'#421f2b',light:'#f5a058',skin:'#802f34',cape:'#4c252b',metal:'#e86847'},
  rubick:{body:'#497b48',shade:'#29463a',light:'#b5ed8a',skin:'#8dbd8c',cape:'#315140',metal:'#c5ef8a'},
  sniper:{body:'#897349',shade:'#514c3a',light:'#e6ce8d',skin:'#d9ab83',cape:'#5b5a43',metal:'#c2c9bc'},
  cm:{body:'#4e8fc0',shade:'#28577e',light:'#bee8fa',skin:'#ecccad',cape:'#39739b',metal:'#d6eff6'},
  jugger:{body:'#b87948',shade:'#744737',light:'#f0c78b',skin:'#e0b49b',cape:'#8d493b',metal:'#e3e8da'},
  mars:{body:'#9d3e30',shade:'#5c2928',light:'#e2a85c',skin:'#d7a575',cape:'#8d302d',metal:'#efc77b'},
  witch:{body:'#745187',shade:'#483858',light:'#c6a2d0',skin:'#ae9073',cape:'#573a70',metal:'#d9bf7d'},
  magnus:{body:'#78748e',shade:'#4e4b63',light:'#b7aec3',skin:'#9a91aa',cape:'#575469',metal:'#ddd1af'}
 };
 const p=palettes[id]||palettes.drow,t=options.time||0;
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(size/40,size/40);c.globalAlpha*=options.illusion?.55:1;
 c.lineJoin='round';c.lineCap='round';
 const poly=(pts,fill,stroke='#182623',width=1.5)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}};
 const path=(pts,color,width=1.5)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()};
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
 const disc=(x,y,r,fill,stroke='#182623',width=1.5)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}};
 // Ground shadow and rear cape give the body a readable silhouette.
 c.fillStyle='#050b0990';c.beginPath();c.ellipse(0,18,19,5,0,0,Math.PI*2);c.fill();
 if(['drow','rubick','cm','witch','mars'].includes(id)){
  poly([[-11,-8],[-17,3],[-16,16],[-6,14],[0,17],[8,14],[16,17],[15,0],[10,-8]],p.cape);
  path([[-11,-3],[-12,13]],p.shade,1);path([[10,-3],[12,13]],p.shade,1);
 }
 // Legs, boots, arms and shaped tunic are a common base, then each hero gets bespoke equipment.
 poly([[-9,7],[-2,7],[-2,16],[-5,19],[-11,18]],p.shade);
 poly([[2,7],[9,7],[11,18],[5,19],[2,16]],p.shade);
 rect(-10,15,8,3,'#26342e');rect(3,15,8,3,'#26342e');
 poly([[-10,-6],[-16,-4],[-18,7],[-13,10],[-9,4]],p.shade);
 poly([[10,-6],[16,-4],[18,7],[13,10],[9,4]],p.shade);
 poly([[-10,-8],[10,-8],[13,-3],[11,10],[6,14],[-6,14],[-11,10],[-13,-3]],p.body);
 poly([[-9,-7],[8,-7],[6,-2],[-7,-2]],p.light,null);
 rect(-10,7,20,3,p.shade);rect(-2,7,4,3,p.metal);
 // Head and expression.
 poly([[-8,-20],[8,-20],[10,-15],[7,-7],[4,-5],[-4,-5],[-8,-8],[-10,-15]],p.skin);
 rect(-6,-14,3,2,'#253c39');rect(3,-14,3,2,'#253c39');
 path([[-3,-8],[3,-8]],p.shade,1);
 if(id==='drow'){
  poly([[-12,-13],[-11,-21],[-6,-26],[6,-26],[11,-20],[12,-13],[8,-16],[6,-21],[-6,-21],[-8,-16]],'#314e65');
  path([[-9,-20],[0,-24],[8,-20]],'#86c3d5',1.3);rect(-6,-15,3,2,'#d5f4f8');rect(3,-15,3,2,'#d5f4f8');
  poly([[-12,-7],[-6,-4],[-8,6],[-14,3]],'#789eaf');poly([[12,-7],[6,-4],[8,6],[14,3]],'#789eaf');
  path([[14,-21],[23,-12],[25,-3],[21,9],[14,16]],'#b4e2e9',2.2);path([[14,-21],[14,16]],'#e4f4ec',.8);path([[8,-2],[23,-2]],'#e6f4e8',1.3);
  rect(-4,0,8,2,'#d2eaf0');path([[-2,2],[-5,6]],'#a7d2db',1);
 }else if(id==='timber'){
  poly([[-18,-7],[-14,-13],[14,-13],[18,-7],[18,9],[12,15],[-12,15],[-18,9]],'#8d563d');
  poly([[-15,-5],[15,-5],[14,8],[8,11],[-8,11],[-14,8]],'#bd754b');
  rect(-14,1,28,2,'#e0a265');rect(-5,4,10,5,'#715249');rect(-3,5,6,2,'#9ed3c6');
  poly([[-10,-16],[-8,-22],[8,-22],[10,-16],[8,-9],[-8,-9]],'#bcc6b8');
  rect(-7,-18,6,5,'#427d89');rect(1,-18,6,5,'#427d89');rect(-6,-17,3,2,'#b9eef0');rect(2,-17,3,2,'#b9eef0');
  for(const px of [-13,11])for(const py of [-3,7])disc(px,py,1,'#f1ca87',null);
  poly([[-18,5],[-22,5],[-22,15],[-13,16],[-12,10]],'#58665d');poly([[12,10],[15,15],[23,15],[23,6],[18,5]],'#58665d');
  c.save();c.translate(20,3);c.rotate(t*3);artSaw(c,0,0,11,'#d4ddd1');disc(0,0,5,'#7a8e84');disc(0,0,2,'#e7c27d',null);c.restore();
 }else if(id==='sf'){
  poly([[-11,-16],[-16,-28],[-9,-23],[-5,-19]],'#d9634b');poly([[11,-16],[16,-28],[9,-23],[5,-19]],'#d9634b');
  poly([[-9,-21],[9,-21],[11,-11],[5,-5],[-5,-5],[-11,-11]],'#51232b');rect(-6,-15,3,2,'#ffd27b');rect(3,-15,3,2,'#ffd27b');
  poly([[-15,-7],[-9,-9],[-8,-3],[-14,0]],'#a44338');poly([[15,-7],[9,-9],[8,-3],[14,0]],'#a44338');
  path([[-17,0],[-22,7],[-16,11]],'#f17a4d',2.5);path([[17,0],[22,7],[16,11]],'#f17a4d',2.5);
  poly([[-5,-2],[0,-6],[5,-2],[4,5],[0,8],[-4,5]],'#e75d3e');poly([[-2,0],[0,-3],[2,0],[1,4],[-1,4]],'#ffd27d',null);
 }else if(id==='rubick'){
  poly([[-11,-14],[-11,-21],[0,-27],[11,-21],[11,-14],[7,-18],[0,-21],[-7,-18]],'#365a48');
  poly([[-7,-17],[7,-17],[6,-9],[0,-6],[-6,-9]],'#263e39');rect(-5,-14,3,2,'#c6f993');rect(2,-14,3,2,'#c6f993');
  poly([[-10,-6],[-6,-8],[0,-2],[6,-8],[10,-6],[7,5],[0,10],[-7,5]],'#7ab25a');path([[-6,-5],[0,1],[6,-5]],'#d0f29a',1.2);disc(0,2,2,'#d6fba2',null);
  path([[14,17],[20,-22]],'#a18e63',2.5);poly([[15,-23],[20,-29],[25,-23],[20,-17]],'#a8ec83');poly([[18,-23],[20,-26],[22,-23],[20,-20]],'#ecffbd',null);
 }else if(id==='sniper'){
  poly([[-11,-18],[-9,-23],[9,-23],[11,-18],[14,-17],[14,-14],[-14,-14],[-14,-17]],'#9e8d65');rect(-9,-20,17,2,'#d8c297');
  poly([[-6,-10],[6,-10],[8,-6],[5,-2],[0,0],[-5,-2],[-8,-6]],'#e7d1ad');path([[-4,-7],[4,-7]],'#9b8067',1);
  rect(-9,0,18,3,'#535847');rect(-7,4,3,5,'#d5b66e');rect(4,4,3,5,'#d5b66e');
  path([[-6,4],[25,-2]],'#333e38',5);path([[-6,3],[25,-3]],'#b5b9a8',2.3);rect(21,-5,8,3,'#677b70');rect(4,-5,8,3,'#313d35');
 }else if(id==='cm'){
  poly([[-11,-15],[-10,-23],[-5,-26],[5,-26],[10,-23],[11,-15],[7,-17],[7,-21],[-7,-21],[-7,-17]],'#e4d3a9');
  path([[-7,-22],[0,-25],[7,-22]],'#f1e6ca',1);rect(-7,-15,3,2,'#4d7182');rect(4,-15,3,2,'#4d7182');
  poly([[-10,-6],[-6,-8],[0,-2],[6,-8],[10,-6],[6,8],[0,11],[-6,8]],'#83bbe0');path([[-8,2],[0,8],[8,2]],'#e3f5fc',1.3);disc(0,1,2,'#e5ffff',null);
  path([[15,17],[20,-22]],'#c9d9cf',2.5);poly([[20,-29],[25,-24],[20,-17],[15,-24]],'#98d5ee');poly([[20,-26],[22,-23],[20,-20],[18,-23]],'#efffff',null);
 }else if(id==='jugger'){
  poly([[-9,-22],[-6,-25],[6,-25],[9,-22],[8,-10],[4,-6],[-4,-6],[-8,-10]],'#f0e5cc');
  rect(-6,-19,12,3,'#b95a42');rect(-6,-15,3,5,'#693e38');rect(3,-15,3,5,'#693e38');rect(-2,-10,4,2,'#915745');
  poly([[-13,-5],[-9,-8],[-3,-4],[-7,3],[-14,1]],'#d8a564');poly([[13,-5],[9,-8],[3,-4],[7,3],[14,1]],'#d8a564');
  path([[-8,1],[8,6]],'#784536',2);rect(-10,8,20,3,'#b04d3c');
  path([[11,10],[16,5]],'#5d4035',3);poly([[15,5],[17,7],[30,-22],[27,-24]],'#dce8d8');path([[18,2],[27,-19]],'#fff9e4',.8);
 }else if(id==='mars'){
  poly([[-11,-17],[-10,-23],[0,-25],[10,-23],[11,-17],[7,-18],[6,-20],[-6,-20],[-7,-18]],'#cb954f');
  poly([[-12,-23],[-8,-27],[8,-27],[12,-23],[10,-21],[-10,-21]],'#b94536');path([[-8,-24],[8,-24]],'#f0734b',1);
  rect(-7,-14,4,2,'#342c27');rect(3,-14,4,2,'#342c27');rect(-2,-14,4,7,'#c99257');
  poly([[-11,-6],[-6,-8],[0,-4],[6,-8],[11,-6],[8,6],[0,10],[-8,6]],'#b7573c');path([[-6,-4],[0,2],[6,-4]],'#e9b86c',1.5);rect(-2,2,4,4,'#e4b366');
  path([[12,15],[25,-25]],'#d4b67e',2.7);poly([[24,-30],[28,-31],[28,-24],[24,-22],[22,-25]],'#f4d48d');
  disc(-16,3,9,'#b77a3f');disc(-16,3,6,'#d4a15c');path([[-20,3],[-12,3]],'#f4d18a',1.8);disc(-16,3,2,'#f3d48e',null);
 }else if(id==='witch'){
  poly([[-12,-21],[-9,-26],[9,-26],[12,-21],[15,-20],[15,-17],[-15,-17],[-15,-20]],'#604074');rect(-9,-22,18,2,'#b789ba');
  rect(-6,-14,3,2,'#ffdf91');rect(3,-14,3,2,'#ffdf91');path([[-4,-9],[4,-9]],'#e9ca9b',1);
  poly([[-10,-6],[-5,-8],[0,-2],[5,-8],[10,-6],[7,8],[-7,8]],'#8963a0');
  for(const px of [-6,-3,0,3,6])disc(px,-3,1,'#e8c68c',null);rect(-8,8,16,3,'#e0b85f');
  path([[14,17],[22,-22]],'#bd9663',2.7);disc(22,-25,5,'#7bd1a7');disc(22,-25,2,'#e1ffca',null);
 }else if(id==='magnus'){
  poly([[-8,-20],[-14,-28],[-17,-30],[-15,-18],[-11,-14]],'#e1d9bd');poly([[8,-20],[14,-28],[17,-30],[15,-18],[11,-14]],'#e1d9bd');
  poly([[-10,-21],[10,-21],[12,-15],[8,-7],[0,-4],[-8,-7],[-12,-15]],'#a49bb3');
  rect(-7,-15,4,2,'#342e3f');rect(3,-15,4,2,'#342e3f');poly([[-5,-9],[5,-9],[6,-5],[0,-3],[-6,-5]],'#c4b8bc');
  poly([[-14,-6],[-10,-9],[-4,-5],[-8,3],[-16,1]],'#a39cad');poly([[14,-6],[10,-9],[4,-5],[8,3],[16,1]],'#a39cad');
  path([[-8,1],[0,5],[8,1]],'#d6c9bd',1.5);rect(-3,7,6,3,'#d3c3a1');
  path([[13,10],[26,-12]],'#867866',3);poly([[22,-13],[28,-19],[32,-14],[27,-8]],'#c5c8bc');path([[25,-14],[29,-16]],'#eef1db',1);
 }
 c.restore();
}
// Compact pixel-art sprites, drawn locally without network assets.
export function drawLabEnemy(c,e,time=0){
 c.save();c.translate(Math.round(e.x),Math.round(e.y));let sc=e.boss?2.5:e.elite?1.35:1;c.scale(sc,sc);const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)}, L=(pts,col,width=3)=>{c.beginPath();c.strokeStyle=col;c.lineWidth=width;pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
 c.fillStyle='#070d0999';c.beginPath();c.ellipse(0,17,22,7,0,0,7);c.fill();let k=e.boss?(e.name==='Primal Beast'?'beast':e.name==='Arcane Warden'?'warden':'aghanim'):e.kind;
 if(k==='courier'){R(-13,-7,26,19,'#d1a43e');R(-9,-16,18,12,'#efd16a');R(-7,-13,3,3,'#503b20');R(4,-13,3,3,'#503b20');L([[-12,-4],[-22,-12],[-19,2]],'#f1dc91',3);L([[12,-4],[22,-12],[19,2]],'#f1dc91',3);R(-9,11,6,5,'#a9782b');R(3,11,6,5,'#a9782b')}
 else if(k==='scout'){R(-11,-12,22,23,'#a67a54');R(-15,-21,30,12,'#c89b70');R(-18,-17,8,5,'#cfaa77');R(10,-17,8,5,'#cfaa77');R(-8,-15,3,3,'#252121');R(4,-15,3,3,'#252121');L([[10,5],[23,-14]],'#d2c5a2');R(-9,11,6,8,'#624d40');R(4,11,6,8,'#624d40')}
 else if(k==='satyr'||k==='adept'){R(-11,-5,22,22,k==='satyr'?'#a95976':'#8470b0');R(-10,-20,20,16,'#b79281');L([[-6,-20],[-14,-29],[-17,-27]],'#ded0aa');L([[6,-20],[14,-29],[17,-27]],'#ded0aa');R(-6,-15,3,3,'#221b2b');R(3,-15,3,3,'#221b2b');L([[14,12],[23,-22]],'#b99f7d');R(20,-27,7,8,'#e0c0f0')}
 else if(k==='warrior'||k==='archer'){R(-8,-20,16,15,'#e4dfc4');R(-5,-16,3,4,'#3b3a31');R(3,-16,3,4,'#3b3a31');R(-10,-4,20,16,'#d8cfad');for(let i=0;i<3;i++)R(-6,-2+i*4,12,2,'#615b4d');R(-10,12,5,7,'#e4dfc4');R(5,12,5,7,'#e4dfc4');if(k==='archer'){L([[14,-19],[24,-5],[22,11],[14,17]],'#a58a67',2);L([[14,-19],[14,17]],'#e2dbc8',1)}else{L([[12,8],[23,-18]],'#cbd4c9',4);R(17,-22,8,5,'#f0f0d6')}}
 else if(k==='hellbear'||k==='beast'){R(-18,-6,36,21,'#a96544');R(-13,-19,26,17,'#cc8960');R(-17,-22,8,8,'#8a523a');R(9,-22,8,8,'#8a523a');R(-8,-14,4,3,'#1f1c1a');R(4,-14,4,3,'#1f1c1a');R(-6,-8,12,6,'#deb695');R(-17,13,10,8,'#744a39');R(7,13,10,8,'#744a39')}
 else if(k==='ogre'){R(-18,-8,36,24,'#8480ad');R(-14,-23,14,15,'#a49ed3');R(2,-22,14,15,'#a49ed3');R(-10,-16,3,3,'#201b30');R(7,-16,3,3,'#201b30');L([[16,5],[28,-16]],'#72523b',6);R(22,-22,11,10,'#b1aaa5')}
 else if(k==='pudge'){R(-17,-8,34,27,'#b8a279');R(-11,-21,22,15,'#b9a985');R(-8,-17,4,3,'#312c27');R(4,-17,4,3,'#312c27');R(-10,3,21,9,'#d1bc93');L([[15,1],[28,6],[29,17]],'#d6cab2',4);L([[-15,0],[-26,-8],[-25,-18]],'#9d9c91',3)}
 else if(k==='ward'){R(-6,-8,12,29,'#597d46');L([[0,5],[-17,-10],[-22,-13]],'#78994d',6);L([[2,3],[18,-13],[24,-16]],'#78994d',6);R(-11,-20,22,14,'#94be61');R(-7,-16,4,3,'#e9d473');R(3,-16,4,3,'#e9d473')}
 else if(k==='ghost'){R(-11,-20,22,28,'#9ad5d0');R(-15,-10,30,15,'#b1e3da');R(-8,7,6,12,'#82c5c4');R(2,7,6,12,'#82c5c4');R(-7,-14,4,4,'#365d69');R(3,-14,4,4,'#365d69')}
 else if(k==='crystal'){R(-8,-25,16,44,'#87c9ed');R(-15,-12,30,25,'#a3d9f5');R(-5,-22,6,34,'#e0f7ff');L([[-15,12],[0,22],[15,12]],'#5a91bd',3)}
 else if(k==='construct'||k==='warden'){R(-16,-6,32,23,'#6882a5');R(-11,-23,22,19,'#8aa8d0');R(-5,-17,10,7,'#d0ecff');R(-23,-4,8,16,'#889eb9');R(15,-4,8,16,'#889eb9');R(-11,16,8,6,'#485c75');R(3,16,8,6,'#485c75');R(-4,2,8,7,'#c9e9ff')}
 else if(k==='mimic'){R(-20,-6,40,24,'#8c633d');R(-22,-16,44,13,'#b4854e');R(-20,-17,40,4,'#d4ae6a');R(-4,-6,8,9,'#e1c46a');R(-15,-10,5,3,'#e5e0bd');R(10,-10,5,3,'#e5e0bd')}
 else if(k==='aghanim'){R(-14,-6,28,24,'#7060a4');R(-11,-22,22,17,'#c8a986');R(-16,-25,32,7,'#e1c16f');R(-10,2,20,4,'#d7bf75');L([[15,12],[22,-28]],'#e4cb87',4);R(17,-32,10,10,'#b2daff');R(-7,-14,4,3,'#39283d');R(3,-14,4,3,'#39283d')}
 // Hand-drawn identifying details for every creature; no external assets.
 // These accents are visual only and do not alter enemy hitboxes.
 const Pdetail=(pts,fill,stroke='#242a26')=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=1.4;c.lineJoin='round';c.stroke()};
 if(k==='courier'){
  Pdetail([[-14,-3],[-25,-13],[-21,-2],[-15,1]],'#f5e2a3');Pdetail([[14,-3],[25,-13],[21,-2],[15,1]],'#f5e2a3');
  Pdetail([[-10,-7],[10,-7],[10,6],[0,11],[-10,6]],'#b77e28');R(-2,-7,4,14,'#f8dc7f');R(-10,-2,20,3,'#f8dc7f');R(-4,-19,8,2,'#fff0a9');
 }else if(k==='scout'){
  Pdetail([[-12,-21],[-5,-25],[7,-25],[13,-21],[10,-17],[-10,-17]],'#63503e');R(-6,-23,12,2,'#d9b778');
  Pdetail([[-12,-4],[-7,-8],[7,-8],[12,-4],[10,11],[-10,11]],'#896344');L([[-9,-3],[8,7]],'#e2c091',2);R(-3,1,5,4,'#d1b36d');
  Pdetail([[18,-14],[25,-22],[24,-11],[20,-8]],'#d9d4bd');R(-7,-16,2,2,'#f3d572');R(5,-16,2,2,'#f3d572');
 }else if(k==='satyr'||k==='adept'){
  Pdetail([[-11,-3],[-6,-7],[0,-3],[6,-7],[11,-3],[9,13],[-9,13]],k==='satyr'?'#813c5f':'#574581');
  L([[-8,-1],[0,7],[8,-1]],'#d5b7df',2);Pdetail([[0,0],[3,4],[0,7],[-3,4]],'#e2b7f2');
  R(-7,-15,3,2,'#ffdaae');R(4,-15,3,2,'#ffdaae');L([[-5,-7],[0,-4],[5,-7]],'#efe1d2',1.5);Pdetail([[23,-32],[28,-26],[23,-21],[18,-26]],'#cbb5f4','#f1e4ff');
 }else if(k==='warrior'||k==='archer'){
  Pdetail([[-9,-20],[-5,-23],[5,-23],[9,-20],[9,-10],[5,-7],[-5,-7],[-9,-10]],'#e7dfc3');
  R(-7,-16,4,4,'#34312d');R(3,-16,4,4,'#34312d');R(-1,-12,2,3,'#766d58');L([[-5,-9],[5,-9]],'#766d58',1);
  for(let y=-3;y<=5;y+=4)L([[-7,y],[0,y+2],[7,y]],'#efe8d2',1.5);L([[0,-4],[0,10]],'#8e846c',1.5);
  if(k==='archer'){R(-14,-7,4,15,'#795a40');L([[14,-18],[23,-5],[14,16]],'#e8c994',2);L([[12,-1],[26,-1]],'#e9e4cf',1)}
  else{Pdetail([[-19,-5],[-11,-8],[-8,-3],[-9,10],[-14,14],[-19,8]],'#7f7760');L([[-14,-5],[-14,9]],'#d7c9a3',1.5);L([[18,-16],[24,-22]],'#f4f0da',2)}
 }else if(k==='hellbear'){
  Pdetail([[-18,-5],[-11,-9],[11,-9],[18,-5],[16,12],[9,17],[-9,17],[-16,12]],'#a96749');
  L([[-12,0],[-7,4],[-3,1],[2,5],[8,1],[13,3]],'#e5aa7e',2);Pdetail([[-10,-11],[-6,-14],[6,-14],[10,-11],[7,-5],[-7,-5]],'#e0b18e');R(-4,-10,8,3,'#5a392d');
  for(const x of [-15,-11,8,12])R(x,16,3,4,'#ead0ae');R(-10,-18,3,2,'#f7db9d');R(7,-18,3,2,'#f7db9d');
 }else if(k==='ogre'){
  Pdetail([[-19,-5],[-13,-10],[13,-10],[19,-5],[16,13],[-16,13]],'#756a96');L([[-14,0],[0,8],[14,0]],'#c2acd1',2);R(-4,4,8,5,'#ddbb73');
  R(-11,-18,4,3,'#f5d493');R(7,-18,4,3,'#f5d493');L([[-11,-10],[-5,-9]],'#463653',2);L([[5,-9],[11,-10]],'#463653',2);
  Pdetail([[23,-24],[30,-22],[32,-16],[26,-12],[21,-16]],'#8e877f');L([[24,-21],[29,-18]],'#ddd2bd',1);
 }else if(k==='pudge'){
  Pdetail([[-17,-4],[-11,-8],[11,-8],[17,-4],[15,15],[-15,15]],'#aa906d');Pdetail([[-10,1],[10,1],[10,12],[-10,12]],'#cfb594');
  L([[-7,4],[7,9]],'#814e4c',2);for(const x of [-5,0,5])L([[x,4],[x-1,8]],'#eedbb7',1);L([[-11,-3],[12,8]],'#674d3c',2);
  R(-7,-18,3,2,'#e8cd9f');R(5,-18,3,2,'#e8cd9f');Pdetail([[-27,-20],[-19,-19],[-19,-13],[-25,-12]],'#bbbcb0');L([[22,6],[28,10],[24,16]],'#e5ddc9',2);
 }else if(k==='ward'){
  Pdetail([[-10,-19],[0,-25],[10,-19],[12,-12],[7,-7],[-7,-7],[-12,-12]],'#a6ca65');R(-8,-16,5,3,'#f5dd7c');R(3,-16,5,3,'#f5dd7c');
  L([[-6,-9],[0,-6],[6,-9]],'#335637',2);L([[0,-5],[0,17]],'#b1cf70',2);Pdetail([[-8,3],[-20,-6],[-15,5]],'#7caa55');Pdetail([[8,4],[21,-8],[16,5]],'#7caa55');
 }else if(k==='ghost'){
  Pdetail([[-12,-16],[-8,-22],[8,-22],[12,-16],[13,5],[7,15],[2,10],[-3,16],[-8,10],[-13,14]],'#a8dcd5','#639b9b');
  R(-7,-15,4,5,'#345d69');R(3,-15,4,5,'#345d69');L([[-4,-4],[0,-6],[4,-4]],'#5b9298',1.5);L([[-10,2],[-6,7],[-3,4]],'#e5fcf1',1.5);L([[4,7],[8,3]],'#e5fcf1',1.5);
 }else if(k==='crystal'){
  Pdetail([[0,-29],[14,-12],[15,12],[0,24],[-15,12],[-14,-12]],'#91d2f4','#5b95bd');Pdetail([[0,-29],[2,2],[15,12],[0,24],[-4,4]],'#c4edff','#77b9d9');L([[-14,-12],[2,2],[14,-12]],'#e1f8ff',1.5);L([[2,2],[-15,12]],'#70aad1',1.5);
 }else if(k==='construct'){
  Pdetail([[-18,-4],[-12,-10],[12,-10],[18,-4],[14,13],[0,18],[-14,13]],'#607b9d');Pdetail([[-10,-22],[-6,-26],[6,-26],[10,-22],[12,-12],[6,-8],[-6,-8],[-12,-12]],'#a4c5dc');
  R(-7,-18,14,4,'#3d617a');R(-5,-17,10,2,'#d5f6ff');Pdetail([[0,-5],[6,2],[0,9],[-6,2]],'#b7efff','#4d829d');L([[-13,4],[-8,8]],'#c1e5f4',2);L([[13,4],[8,8]],'#c1e5f4',2);
 }else if(k==='mimic'){
  Pdetail([[-21,-6],[21,-6],[18,13],[-18,13]],'#69452e');Pdetail([[-21,-17],[21,-17],[20,-8],[-20,-8]],'#ba8549');
  L([[-17,-7],[17,-7]],'#e5bc77',2);for(const x of [-15,-9,-3,3,9,15])Pdetail([[x-2,-6],[x+2,-6],[x,-1]],'#f2e5c1','#7c5636');
  Pdetail([[-5,1],[5,1],[4,8],[-4,8]],'#e5c36c');R(-2,3,4,3,'#76552d');R(-14,-13,5,3,'#efcf70');R(9,-13,5,3,'#efcf70');
 }
 // Bosses share the outlined, layered 2D art direction of the heroes.
 if(e.boss){const P=(pts,fill,stroke='#17241f')=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.lineWidth=2;c.lineJoin='round';c.strokeStyle=stroke;c.stroke()};
  if(k==='beast'){
   P([[-12,-20],[-25,-32],[-22,-15],[-15,-11]],'#dec19a');P([[12,-20],[25,-32],[22,-15],[15,-11]],'#dec19a');
   P([[-20,-5],[-15,-12],[15,-12],[20,-5],[18,15],[11,18],[-11,18],[-18,15]],'#8c503e');
   P([[-14,-20],[-10,-25],[10,-25],[14,-20],[16,-8],[10,-2],[-10,-2],[-16,-8]],'#ba7653');
   P([[-11,-9],[-7,-13],[7,-13],[11,-9],[9,-3],[-9,-3]],'#d9a77d');
   R(-10,-19,5,3,'#201d1b');R(5,-19,5,3,'#201d1b');R(-7,-8,14,3,'#4e3229');R(-8,-8,3,5,'#fff0d3');R(5,-8,3,5,'#fff0d3');
   L([[-14,1],[-7,6],[0,2],[7,6],[14,1]],'#e3a578',2);R(-14,11,9,5,'#6f3d33');R(5,11,9,5,'#6f3d33');
  }else if(k==='warden'){
   P([[-14,-18],[-22,-29],[-21,-11],[-13,-8]],'#c2ddf0');P([[14,-18],[22,-29],[21,-11],[13,-8]],'#c2ddf0');
   P([[-20,-4],[-14,-12],[14,-12],[20,-4],[17,14],[9,18],[-9,18],[-17,14]],'#536c91');
   P([[-16,-10],[-9,-16],[9,-16],[16,-10],[13,3],[0,11],[-13,3]],'#819ec2');
   P([[-12,-23],[-8,-27],[8,-27],[12,-23],[14,-13],[9,-8],[-9,-8],[-14,-13]],'#a5c5e1');
   P([[-7,-20],[7,-20],[7,-14],[-7,-14]],'#d6f4ff','#557893');P([[0,-3],[6,2],[0,8],[-6,2]],'#c9f3ff','#44617b');
   L([[-13,0],[0,11],[13,0]],'#cdeaff',2);R(-17,-5,4,7,'#b8d7ed');R(13,-5,4,7,'#b8d7ed');
  }else if(k==='aghanim'){
   P([[-16,-3],[-11,-10],[11,-10],[16,-3],[14,17],[-14,17]],'#4b3d75');
   P([[-12,-6],[-6,-10],[0,-4],[6,-10],[12,-6],[10,9],[0,14],[-10,9]],'#8069ac');
   P([[-10,-22],[10,-22],[11,-10],[6,-6],[-6,-6],[-11,-10]],'#cfae8a');
   P([[-14,-22],[-12,-28],[-7,-32],[0,-29],[7,-32],[12,-28],[14,-22]],'#d8b962');
   L([[-11,-26],[0,-23],[11,-26]],'#f8e2a0',2);R(-7,-18,4,3,'#30263c');R(3,-18,4,3,'#30263c');
   P([[-7,-10],[7,-10],[5,-5],[0,-3],[-5,-5]],'#e9d3af');L([[-11,-4],[0,8],[11,-4]],'#e9cd85',2);
   P([[0,3],[4,7],[0,11],[-4,7]],'#b6e6ff','#668cac');L([[14,12],[23,-27]],'#dfc683',4);P([[23,-35],[28,-29],[23,-23],[18,-29]],'#b9e9ff','#e9f8ff');
  }
  if(k==='beast'){L([[-19,8],[-23,13],[-20,17]],'#f4d9b2',2);L([[19,8],[23,13],[20,17]],'#f4d9b2',2);L([[-6,10],[0,13],[6,10]],'#e8b086',2)}
  if(k==='warden'){L([[-15,11],[-8,15]],'#d7f5ff',2);L([[15,11],[8,15]],'#d7f5ff',2);R(-1,-19,2,4,'#ffffff')}
  if(k==='aghanim'){R(-8,-28,3,3,'#e7f7ff');R(5,-28,3,3,'#e7f7ff');L([[-9,14],[0,17],[9,14]],'#f3d98f',2)}
 }
 c.restore();
}
export function drawLabMap(c,w){let idx=(w.choiceIndex??w.room??0),themes=[['#252a24','#3a4437','#66735b'],['#2b2624','#493b35','#80685a'],['#202c29','#304740','#617b65'],['#242332','#373149','#71658c'],['#2d2821','#504534','#907454']];let [base,tile,edge]=themes[Math.abs(idx)%themes.length];c.fillStyle=base;c.fillRect(0,0,LAB_WIDTH,LAB_HEIGHT);for(let y=0;y<LAB_HEIGHT;y+=100)for(let x=0;x<LAB_WIDTH;x+=100){let v=((x/100*13+y/100*19+idx*7)%9);c.fillStyle=v===0?tile:base;c.fillRect(x+2,y+2,96,96);c.strokeStyle='#0d171455';c.lineWidth=2;c.strokeRect(x+2,y+2,96,96);if(v===2){c.strokeStyle=edge+'66';c.beginPath();c.moveTo(x+20,y+20);c.lineTo(x+46,y+31);c.lineTo(x+53,y+48);c.stroke()}}c.strokeStyle=edge;c.lineWidth=18;c.strokeRect(10,10,LAB_WIDTH-20,LAB_HEIGHT-20);for(const o of w.obstacles||[]){c.fillStyle='#0b130dbb';c.fillRect(o.x+8,o.y+12,o.w,o.h);c.fillStyle=edge;c.fillRect(o.x,o.y,o.w,o.h);c.fillStyle=tile;c.fillRect(o.x+7,o.y+7,o.w-14,o.h-14);c.fillStyle='#d4c29a44';c.fillRect(o.x+10,o.y+10,o.w-20,5)}for(const h of w.hazards||[]){c.strokeStyle=h.active?'#ef7558':'#a69a65';c.lineWidth=3;c.setLineDash(h.active?[]:[8,7]);c.strokeRect(h.x,h.y,h.w,h.h);c.setLineDash([]);if(h.active){c.fillStyle='#ef755833';c.fillRect(h.x,h.y,h.w,h.h)}}}

// Shard-like portal: a luminous faceted crystal aperture, animated on the shared world clock.
export function drawLabPortal(c,e,time){
 const t=Math.max(0,Math.min(1,1-(e.portalUntil-time)/PORTAL_DURATION)),fade=Math.sin(Math.PI*t),r=(e.elite?46:39)*(.65+.35*Math.sin(Math.PI*t/2));
 const main=e.elite?'#a9ffd0':'#82ddff',light=e.elite?'#e2ffea':'#ddf8ff';
 c.save();c.translate(e.x,e.y);c.globalAlpha=.55+.45*fade;c.shadowColor=main;c.shadowBlur=22;
 c.strokeStyle=main;c.lineWidth=4;c.beginPath();c.ellipse(0,0,r*.72,r,0,0,Math.PI*2);c.stroke();
 c.fillStyle=e.elite?'#83f9ba88':'#4fbaff88';c.beginPath();c.moveTo(0,-r);c.lineTo(r*.57,-r*.22);c.lineTo(r*.4,r*.63);c.lineTo(0,r);c.lineTo(-r*.4,r*.63);c.lineTo(-r*.57,-r*.22);c.closePath();c.fill();c.stroke();
 c.strokeStyle=light;c.lineWidth=2;c.beginPath();c.moveTo(0,-r);c.lineTo(0,r);c.moveTo(-r*.57,-r*.22);c.lineTo(0,r*.2);c.lineTo(r*.57,-r*.22);c.stroke();
 for(let i=0;i<4;i++){let a=i*Math.PI/2+t*1.8,x=Math.cos(a)*r*1.1,y=Math.sin(a)*r*1.1;c.fillStyle=light;c.beginPath();c.moveTo(x,y-5);c.lineTo(x+3,y);c.lineTo(x,y+5);c.lineTo(x-3,y);c.closePath();c.fill()}c.restore();
}

// ---------------------------------------------------------------------------
// Skill effect visuals. Cast FX are one-shot, client-side animations driven by
// the engine cast events; they are descriptive only and never feed back into
// the rules. Each entry has a lifetime and optional ground/air draw phases.
// ---------------------------------------------------------------------------
const fxRing=(c,x,y,r,w,col,alpha=1,dash)=>{if(alpha<=0||r<=0)return;c.save();c.globalAlpha*=Math.min(1,Math.max(0,alpha));c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=w;if(dash)c.setLineDash(dash);c.stroke();c.restore()};
const fxDisc=(c,x,y,r,col,alpha=1)=>{if(alpha<=0||r<=0)return;c.save();c.globalAlpha*=Math.min(1,Math.max(0,alpha));c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=col;c.fill();c.restore()};
const fxDiscS=(c,x,y,r,fill,stroke,width=1.2,alpha=1)=>{if(alpha<=0||r<=0)return;c.save();c.globalAlpha*=Math.min(1,Math.max(0,alpha));c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}c.restore()};
const fxLine=(c,x1,y1,x2,y2,col,w=2,alpha=1)=>{if(alpha<=0)return;c.save();c.globalAlpha*=Math.min(1,Math.max(0,alpha));c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=w;c.stroke();c.restore()};
const fxPoly=(c,pts,fill,stroke,width=1.5,alpha=1)=>{if(alpha<=0||!pts||pts.length<2)return;c.save();c.globalAlpha*=Math.min(1,Math.max(0,alpha));c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}c.restore()};

const CAST_FX={
 drow0:{dur:.55,ground(c,f,k){fxRing(c,f.x,f.y,14+40*k,3,'#bfeef7',.8*(1-k))},air(c,f,k){
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5+k*3.5,px=f.x+Math.cos(a)*(18+8*Math.sin(k*9+i)),py=f.y-8+Math.sin(a)*(12+6*Math.cos(k*7+i));fxPoly(c,[[px,py-4],[px+3,py],[px,py+4],[px-3,py]],'#cdeef8','#e6fbff',1,.9*(1-k))}
  fxLine(c,f.x+10,f.y-22,f.x+22,f.y-6,'#dff6fb',2,.7*(1-k))}},
 drow1:{dur:.5,ground(c,f,k){const r=Math.max(40,f.r);fxDisc(c,f.x,f.y,r*.9,'rgba(168,222,234,'+(.28*(1-k)).toFixed(3)+')');fxRing(c,f.x,f.y,r*(.35+.65*k),5,'#a8deea',.9*(1-k));fxRing(c,f.x,f.y,r*k,3,'#e2f6fa',.7*(1-k))},air(c,f,k){for(let i=0;i<8;i++){const a=i*Math.PI/4+k*2.4,rr=Math.max(40,f.r)*(.4+.6*k);fxLine(c,f.x+Math.cos(a)*rr*.8,f.y+Math.sin(a)*rr*.8,f.x+Math.cos(a+.35)*rr,f.y+Math.sin(a+.35)*rr,'#d6f1f6',2,.75*(1-k))}}},
 drow2:{dur:.75,air(c,f,k){for(let i=-1;i<=1;i++)for(let j=0;j<3;j++){const kk=k*1.45-j*.3-i*.03;if(kk<=0||kk>=1)continue;const a=(f.a||0)+i*.17,len=560*kk,x1=f.x+Math.cos(a)*(len-26),y1=f.y+Math.sin(a)*(len-26),x2=f.x+Math.cos(a)*len,y2=f.y+Math.sin(a)*len;fxLine(c,x1,y1,x2,y2,'#cfeef7',3,.85*(1-kk*.4));fxDisc(c,x2,y2,3.5,'#eef8fc',.9*(1-kk*.4))}}},
 drow3:{dur:.6,air(c,f,k){fxRing(c,f.x,f.y-6,30-6*k,2.5,'#f2d488',.9*(1-k));c.save();c.translate(f.x,f.y-6);c.rotate(k*2.4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);fxLine(c,34,0,46,0,'#f7e3a6',2.5,.8*(1-k))}c.restore();for(let i=0;i<3;i++){const kk=(k*1.3-i*.15)%1;fxDisc(c,f.x-14+i*14,f.y-8-36*kk,2.6,'#ffe9b0',.85*(1-kk))}}},
 timber0:{dur:.6,ground(c,f,k){fxRing(c,f.x,f.y,260*(.55+.45*k),6,'#f0e6d2',.5*(1-k));fxDisc(c,f.x,f.y,120*(1-k),'rgba(230,177,110,.30)')},air(c,f,k){for(const s of [1,-1]){const a=s*k*10;c.save();c.translate(f.x+Math.cos(a)*(50+130*k),f.y+Math.sin(a)*(50+130*k));c.rotate(a*1.7);artSaw(c,0,0,13,'#d4ddd1');c.restore()}}},
 timber1:{dur:.45,ground(c,f,k){if(k>.6){fxRing(c,f.x,f.y,20+90*(k-.6)/.4,4,'#e6b16e',.8*(1-k));fxDisc(c,f.x,f.y,40*(1-k),'rgba(230,177,110,.4)')}},air(c,f,k){const kk=Math.min(1,k*1.6),x2=(f.x0??f.x)+((f.x-(f.x0??f.x))*kk),y2=(f.y0??f.y)+((f.y-(f.y0??f.y))*kk);fxLine(c,f.x0??f.x,f.y0??f.y,x2,y2,'#c9d3c8',4,.9);for(let i=0;i<6;i++){const t2=i/5;fxDisc(c,(f.x0??f.x)+((x2-(f.x0??f.x))*t2),(f.y0??f.y)+((y2-(f.y0??f.y))*t2),2.2,'#9ed3c6',.8)}fxPoly(c,[[x2+7,y2],[x2+13,y2+5],[x2+7,y2+10],[x2+1,y2+5]],'#7fa9a0','#3f5d55',1.4,.95)}},
 timber3:{dur:.7,ground(c,f,k){const r=Math.max(120,f.r);fxRing(c,f.x,f.y,r,4,'#d4ddd1',.8*(1-k));fxRing(c,f.x,f.y,r*.62,2,'#9ed3c6',.6*(1-k));c.save();c.translate(f.x,f.y);c.rotate(k*11);c.globalAlpha=1-k;artSaw(c,0,0,r*.5,'#d4ddd1');c.restore();fxDisc(c,f.x,f.y,8,'#e7c27d',.9*(1-k))},air(c,f,k){for(let i=0;i<8;i++){const a=i*Math.PI/4+k*7,R=Math.max(120,f.r)*(.5+.5*k);fxDisc(c,f.x+Math.cos(a)*R,f.y+Math.sin(a)*R,2.4,'#f1ca87',.8*(1-k))}}},
 sf0:{dur:.5,ground(c,f,k){for(const rz of f.razes||[]){fxDisc(c,rz.x,rz.y,200*(.4+.6*k),'rgba(125,48,50,.5)',.75*(1-k));fxRing(c,rz.x,rz.y,200*(.4+.6*k),5,'#e0665e',.8*(1-k));fxLine(c,rz.x-60*(1-k),rz.y,rz.x+60*(1-k),rz.y,'#f5a058',3,.9*(1-k))}},air(c,f,k){for(const rz of f.razes||[]){c.save();c.translate(rz.x,rz.y);c.rotate(-.6+k*1.2);c.globalAlpha=.8*(1-k);c.beginPath();c.arc(0,0,120,.2,Math.PI-.2);c.strokeStyle='#f17a4d';c.lineWidth=6;c.stroke();c.restore()}}},
 sf3:{dur:.8,ground(c,f,k){fxRing(c,f.x,f.y,700*k,7,'#c8443c',.55*(1-k));fxRing(c,f.x,f.y,420*k,4,'#e0665e',.7*(1-k));fxDisc(c,f.x,f.y,90*(1-k),'rgba(224,102,94,.5)')},air(c,f,k){for(let i=0;i<12;i++){const a=i*Math.PI/6+k*.8,len=180+420*k;fxLine(c,f.x+Math.cos(a)*len*.3,f.y+Math.sin(a)*len*.3,f.x+Math.cos(a)*len,f.y+Math.sin(a)*len,'#f5a058',3,.7*(1-k));fxDisc(c,f.x+Math.cos(a)*len,f.y+Math.sin(a)*len,4,'#ffd27d',.8*(1-k))}}},
 rubick0:{dur:.45,ground(c,f,k){fxDisc(c,f.x,f.y,26*(1-k),'rgba(165,236,138,.7)');fxRing(c,f.x,f.y,10+50*k,3,'#a0e864',.8*(1-k))},air(c,f,k){for(const p2 of f.pts||[]){const steps=5;c.save();c.globalAlpha=.9*(1-k);c.beginPath();c.moveTo(f.x,f.y);for(let i=1;i<=steps;i++){const t2=i/steps;c.lineTo(f.x+(p2.x-f.x)*t2+(i<steps?Math.sin(i*9.1+k*22)*14:0),f.y+(p2.y-f.y)*t2+(i<steps?Math.cos(i*7.7+k*19)*14:0))}c.strokeStyle='#b5ed8a';c.lineWidth=3;c.stroke();c.restore();fxDisc(c,p2.x,p2.y,6*(1-k),'#d6fba2',.9*(1-k))}}},
 rubick1:{dur:.6,ground(c,f,k){const r=Math.max(80,f.r);fxRing(c,f.x,f.y,r*(.5+.5*k),5,'#a0e864',.8*(1-k));fxDisc(c,f.x,f.y,r*.5*(1-k),'rgba(160,232,100,.25)')},air(c,f,k){for(let i=0;i<7;i++){const a=i*Math.PI*2/7+k*6,rr=(20+30*k)*(1-k*.5);fxDisc(c,f.x+Math.cos(a)*rr,f.y-10-70*((k+i*.12)%1),2.6,'#c5ef8a',.9*(1-k))}}},
 rubick3:{dur:.6,ground(c,f,k){fxRing(c,f.x,f.y,8+40*k,3,'#a8ec83',.9*(1-k))},air(c,f,k){if(!f.steal)return;const kk=Math.min(1,k*1.4);fxLine(c,f.steal.x,f.steal.y,f.steal.x+(f.x-f.steal.x)*kk,f.steal.y+(f.y-f.steal.y)*kk,'#c5ef8a',3.5,.85);for(let i=0;i<4;i++){const t2=(k*1.6+i*.25)%1;fxDisc(c,f.steal.x+(f.x-f.steal.x)*t2,f.steal.y+(f.y-f.steal.y)*t2,2.6,'#ecffbd',.9*(1-t2))}fxPoly(c,[[f.steal.x-8,f.steal.y-8],[f.steal.x,f.steal.y-14],[f.steal.x+8,f.steal.y-8],[f.steal.x,f.steal.y-2]],'#a8ec83',null,0,.9*(1-k))}},
 stolen:{dur:.5,ground(c,f,k){const col={hellbear:'#e0a265',satyr:'#e2b7f2',adept:'#c19bf4',pudge:'#d9c9a8',ogre:'#a49ed3',construct:'#8aa8d0',scout:'#c89b70',ghost:'#9ad5d0',warrior:'#d8cfad',archer:'#a58a67',boss:'#f6c65b'}[f.stolen]||'#a0e864',r=Math.max(60,f.r||120);fxRing(c,f.x,f.y,r*(.35+.65*k),6,col,.85*(1-k));fxDisc(c,f.x,f.y,r*.45*(1-k),'rgba(255,255,255,.22)')},air(c,f,k){if(f.stolen==='adept'){for(let i=0;i<6;i++){const a=i*Math.PI/3,rr=(1-k)*90;fxLine(c,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,f.x+Math.cos(a)*(rr+16),f.y+Math.sin(a)*(rr+16),'#c19bf4',2,.8*(1-k))}}else{for(let i=0;i<6;i++){const a=i*Math.PI/3+k*4;fxDisc(c,f.x+Math.cos(a)*70*(1-k*.4),f.y+Math.sin(a)*70*(1-k*.4),3,'#f2e0ff',.7*(1-k))}}}},
 sniper0:{dur:.55,ground(c,f,k){const r=Math.max(120,f.r);fxDisc(c,f.x,f.y,r*(.5+.5*k),'rgba(150,140,120,.28)');fxRing(c,f.x,f.y,r,4,'#c8b98d',.7*(1-k))},air(c,f,k){for(let i=0;i<10;i++){const a=i*Math.PI/5+k*5,rr=Math.max(120,f.r)*(.3+.7*((k*1.2+i*.09)%1));fxDisc(c,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,2.6+(i%3),'#e8a54b',.75*(1-k))}}},
 sniper2:{dur:.5,air(c,f,k){fxRing(c,f.x,f.y-6,34+8*k,2,'#e6ce8d',.9*(1-k));c.save();c.translate(f.x,f.y-6);c.rotate(k*1.6);for(let i=0;i<4;i++){c.rotate(Math.PI/2);fxLine(c,40,0,54,0,'#f4e6bb',3,.8*(1-k))}c.restore();fxDisc(c,f.x,f.y-6,3,'#fff3cf',.9*(1-k))}},
 sniper3:{dur:.4,air(c,f,k){const a=f.a||0,kk=Math.min(1,k*2.2),len=1250*kk;fxLine(c,f.x+Math.cos(a)*26,f.y+Math.sin(a)*26,f.x+Math.cos(a)*len,f.y+Math.sin(a)*len,'#ffe9b0',3.5,.85*(1-kk));fxLine(c,f.x+Math.cos(a)*26,f.y+Math.sin(a)*26,f.x+Math.cos(a)*len,f.y+Math.sin(a)*len,'#ffffff',1.2,.6*(1-kk));fxDisc(c,f.x+Math.cos(a)*30,f.y+Math.sin(a)*30,14*(1-k),'rgba(255,240,190,.85)')}},
 cm0:{dur:.55,ground(c,f,k){const r=Math.max(120,f.r);fxDisc(c,f.x,f.y,r*(.35+.65*k),'rgba(159,207,255,.30)');fxRing(c,f.x,f.y,r*(.4+.6*k),5,'#bee8fa',.85*(1-k));fxRing(c,f.x,f.y,r*k*.7,2.5,'#e6f6ff',.6*(1-k));for(let i=0;i<8;i++){const a=i*Math.PI/4;fxLine(c,f.x+Math.cos(a)*r*.35*k,f.y+Math.sin(a)*r*.35*k,f.x+Math.cos(a)*r*.62*k,f.y+Math.sin(a)*r*.62*k,'#d6eff6',2,.7*(1-k))}}},
 cm1:{dur:.5,air(c,f,k){for(let i=0;i<5;i++){const px=f.x-30+i*15,h=26*((k*1.3-i*.08)%1);fxPoly(c,[[px,f.y-6],[px+4,f.y-6-h],[px,f.y-12-h],[px-4,f.y-6]],'#bee8fa','#e6f6ff',1.2,.85*(1-k))}fxRing(c,f.x,f.y-8,10+26*k,2.5,'#d6eff6',.8*(1-k))}},
 cm3:{dur:.7,ground(c,f,k){const r=f.r||400;fxRing(c,f.x,f.y,r*k,5,'#bee8fa',.8*(1-k));fxDisc(c,f.x,f.y,r*.4*k,'rgba(159,207,255,.18)')},air(c,f,k){for(let i=0;i<14;i++){const a=i*Math.PI/7+k*6,rr=(f.r||400)*(.25+.75*((i*.13+k)%1));fxDisc(c,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,2.4,'#e6f6ff',.8*(1-k))}}},
 jugger0:{dur:.5,ground(c,f,k){fxRing(c,f.x,f.y,Math.max(80,f.r),5,'#f0e5cc',.7*(1-k))},air(c,f,k){for(const s of [0,Math.PI]){const a=s+k*12;c.save();c.translate(f.x+Math.cos(a)*54,f.y+Math.sin(a)*54);c.rotate(a*2);artSaw(c,0,0,12,'#dce8d8');c.restore()}}},
 jugger1:{dur:.6,ground(c,f,k){const r=Math.max(120,f.r);fxDisc(c,f.x,f.y,r*(.3+.7*k),'rgba(80,225,112,.20)');fxRing(c,f.x,f.y,r*(.4+.6*k),4,'#86e59e',.8*(1-k));fxRing(c,f.x,f.y,r*k*.6,2,'#c2f2cd',.6*(1-k))},air(c,f,k){for(let i=0;i<4;i++){const kk=(k*1.25+i*.22)%1,px=f.x-30+i*20;fxLine(c,px-5,f.y-14-40*kk,px+5,f.y-14-40*kk,'#b8f2c4',2.4,.85*(1-kk));fxLine(c,px,f.y-19-40*kk,px,f.y-9-40*kk,'#b8f2c4',2.4,.85*(1-kk))}}},
 jugger3:{dur:.6,air(c,f,k){const pts=f.pts||[];for(let i=0;i<Math.min(6,pts.length);i++){const kk=k*2-i*.14;if(kk<0||kk>1)continue;const p2=pts[i],a=Math.atan2(p2.y-f.y,p2.x-f.x)+Math.sin(kk*9+i)*.6,px=f.x+Math.cos(a)*40*kk,py=f.y+Math.sin(a)*40*kk;fxLine(c,px-Math.cos(a+.5)*34,py-Math.sin(a+.5)*34,px+Math.cos(a+.5)*34,py+Math.sin(a+.5)*34,'#fff6d8',3.5,1-kk);fxLine(c,px,py,p2.x,p2.y,'#f7e3a6',2,.7*(1-kk))}fxDisc(c,f.x,f.y,26*(1-k),'rgba(255,246,216,.5)')}},
 mars0:{dur:.45,air(c,f,k){const a=f.a||0,kk=Math.min(1,k*1.8),len=780*kk,x1=f.x+Math.cos(a)*Math.max(0,len-56),y1=f.y+Math.sin(a)*Math.max(0,len-56),x2=f.x+Math.cos(a)*len,y2=f.y+Math.sin(a)*len;fxLine(c,x1,y1,x2,y2,'#d4b67e',6,.9*(1-kk*.3));fxPoly(c,[[x2+Math.cos(a)*16,y2+Math.sin(a)*16],[x2+Math.cos(a+2.2)*9,y2+Math.sin(a+2.2)*9],[x2+Math.cos(a-2.2)*9,y2+Math.sin(a-2.2)*9]],'#f4d48d','#8a6a2f',1.4,.95*(1-kk*.3));fxLine(c,x1,y1,x2,y2,'#f4d48d',2,.6*(1-kk))}},
 mars1:{dur:.5,ground(c,f,k){const r=Math.max(100,f.r),a=f.a||0;fxDisc(c,f.x,f.y,r*(.4+.6*k),'rgba(244,212,141,.30)');fxRing(c,f.x,f.y,r*(.4+.6*k),5,'#e9b86c',.85*(1-k));for(let i=-1;i<=1;i++){const a2=a+i*.5;fxLine(c,f.x+Math.cos(a2)*r*.3,f.y+Math.sin(a2)*r*.3,f.x+Math.cos(a2)*r*.75*k,f.y+Math.sin(a2)*r*.75*k,'#f4d48d',3,.7*(1-k))}},air(c,f,k){const a=f.a||0;for(let i=-1;i<=1;i++){const a2=a+i*.42,rr=(f.r||220)*(.5+.5*k);c.save();c.translate(f.x+Math.cos(a2)*rr,f.y+Math.sin(a2)*rr);c.rotate(a2);c.globalAlpha=.85*(1-k);c.beginPath();c.arc(0,0,16,-1.1,1.1);c.strokeStyle='#f4d48d';c.lineWidth=5;c.stroke();c.restore()}}},
 mars3:{dur:.8,ground(c,f,k){const r=f.r||430;fxRing(c,f.x,f.y,r,8,'#f4d48d',.5*(1-k*.4));fxRing(c,f.x,f.y,r*.96,2,'#e9b86c',.6);for(let i=0;i<18;i++){const a=i*Math.PI*2/18,px=f.x+Math.cos(a)*r,py=f.y+Math.sin(a)*r,h=34*Math.min(1,Math.max(0,k*1.5-i*.05));fxLine(c,px,py,px,py-h,'#e9b86c',3,.9);fxPoly(c,[[px,py-h-10],[px+5,py-h],[px-5,py-h]],'#f4d48d','#8a6a2f',1.2,.9)}}},
 witch0:{dur:.7,air(c,f,k){const path=[{x:f.x0??f.x,y:f.y0??f.y},{x:f.x,y:f.y},...(f.pts||[])];if(path.length<2)return;const seg=path.length-1,t2=Math.min(1,k*1.35)*seg,i0=Math.min(seg-1,Math.floor(t2)),tt=t2-i0,p1=path[i0],p2=path[i0+1],px=p1.x+(p2.x-p1.x)*tt,py=p1.y+(p2.y-p1.y)*tt-Math.sin(Math.min(1,k*1.35)*Math.PI)*46;fxLine(c,p1.x,p1.y,px,py+6,'#c98de3',2,.4);fxDiscS(c,px,py,10,'#e8dcf0','#573a70',1.5);fxDisc(c,px-3.4,py-2,2,'#2a1e33');fxDisc(c,px+3.4,py-2,2,'#2a1e33');fxDisc(c,px,py+5,3.4,'#745187')}},
 witch1:{dur:.6,ground(c,f,k){fxDisc(c,f.x,f.y,300*(.4+.6*k),'rgba(201,141,227,.16)');fxRing(c,f.x,f.y,120+180*k,4,'#c6a2d0',.8*(1-k))},air(c,f,k){for(let i=0;i<5;i++){const kk=(k*1.3+i*.18)%1,px=f.x-24+i*12,py=f.y-20-60*kk;fxLine(c,px-5,py,px+5,py,'#d9bf7d',2.4,.85*(1-kk));fxLine(c,px,py-5,px,py+5,'#d9bf7d',2.4,.85*(1-kk))}}},
 witch2:{dur:.6,ground(c,f,k){const r=Math.max(120,f.r);fxDisc(c,f.x,f.y,r*(.4+.6*k),'rgba(116,81,135,.30)');fxRing(c,f.x,f.y,r*(.5+.5*k),4,'#c6a2d0',.85*(1-k));c.save();c.translate(f.x,f.y);c.rotate(k*2.2);c.globalAlpha=.8*(1-k);c.strokeStyle='#d9bf7d';c.lineWidth=2;c.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*Math.PI*4/5,px=Math.cos(a)*r*.45,py=Math.sin(a)*r*.45;i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke();c.restore()}},
 witch3:{dur:.5,ground(c,f,k){fxRing(c,f.x,f.y,26+34*k,3,'#c6a2d0',.85*(1-k));fxDisc(c,f.x,f.y,20*(1-k),'rgba(201,141,227,.35)')},air(c,f,k){const h=30*Math.min(1,k*1.6);fxLine(c,f.x,f.y-6,f.x,f.y-6-h,'#bd9663',4,.95);fxDiscS(c,f.x,f.y-10-h,7,'#e8dcf0','#573a70',1.2,.95);fxDisc(c,f.x,f.y-10-h,3,'#7bd1a7',.95*(1-k))}},
 magnus0:{dur:.5,air(c,f,k){const a=f.a||0,rr=40+700*k;c.save();c.translate(f.x,f.y);c.rotate(a);c.globalAlpha=.85*(1-k);c.beginPath();c.arc(0,0,rr,-.42,.42);c.strokeStyle='#b7aec3';c.lineWidth=9;c.stroke();c.beginPath();c.arc(0,0,rr,-.3,.3);c.strokeStyle='#e8e2ef';c.lineWidth=3;c.stroke();c.restore()}},
 magnus1:{dur:.5,ground(c,f,k){fxRing(c,f.x,f.y,20+30*k,3,'#e2a85c',.8*(1-k))},air(c,f,k){fxPoly(c,[[f.x-14,f.y-18],[f.x-26,f.y-40],[f.x-8,f.y-30]],'#e07a5c',null,0,.9*(1-k));fxPoly(c,[[f.x+14,f.y-18],[f.x+26,f.y-40],[f.x+8,f.y-30]],'#e07a5c',null,0,.9*(1-k));fxDisc(c,f.x,f.y-14,10*(1-k),'rgba(224,122,92,.6)')}},
 magnus2:{dur:.5,ground(c,f,k){const x0=f.x0??f.x,y0=f.y0??f.y;fxLine(c,x0,y0,f.x,f.y,'rgba(183,174,195,.4)',10,1-k);fxRing(c,f.x,f.y,(f.r||150)*(.4+.6*k),6,'#b7aec3',.8*(1-k));fxDisc(c,f.x,f.y,(f.r||150)*.4*(1-k),'rgba(183,174,195,.35)')},air(c,f,k){for(let i=0;i<6;i++){const t2=i/5,px=(f.x0??f.x)+((f.x-(f.x0??f.x))*t2),py=(f.y0??f.y)+((f.y-(f.y0??f.y))*t2);fxDisc(c,px,py-6-18*((k*1.2+i*.11)%1),3,'#ddd1af',.6*(1-k))}}},
 magnus3:{dur:.7,ground(c,f,k){const r=f.r||350;fxDisc(c,f.x,f.y,r*k,'rgba(183,163,220,.28)');fxRing(c,f.x,f.y,r*k,8,'#b7a3dc',.85*(1-k));fxRing(c,f.x,f.y,r*k*.6,4,'#ddd1af',.6*(1-k));for(let i=0;i<12;i++){const a=i*Math.PI/6+k*1.2,len=r*(.3+.7*k);fxLine(c,f.x+Math.cos(a)*len*.7,f.y+Math.sin(a)*len*.7,f.x+Math.cos(a)*len,f.y+Math.sin(a)*len,'#c5c8bc',3,.7*(1-k))}}},
 deathEnemy:{dur:.5,ground(c,f,k){fxRing(c,f.x,f.y,10+70*k,4,f.col,.8*(1-k))},air(c,f,k){for(let i=0;i<8;i++){const a=i*Math.PI/4+k*3,rr=14+66*k;fxDisc(c,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,3.2*(1-k),f.col,.85*(1-k))}}},
 deathPlayer:{dur:.8,ground(c,f,k){fxRing(c,f.x,f.y,8+60*k,4,'#cfd8d2',.7*(1-k));fxLine(c,f.x-14*(1-k),f.y-14*(1-k),f.x+14*(1-k),f.y+14*(1-k),'#e8efec',3,.8*(1-k));fxLine(c,f.x+14*(1-k),f.y-14*(1-k),f.x-14*(1-k),f.y+14*(1-k),'#e8efec',3,.8*(1-k))}}
};
// Build a one-shot animation from a cast event; null when the skill has no FX.
export function createCastFX(ev){
 if(!ev||ev.type!=='cast'||!ev.hero)return null;
 const f=ev.fx||{};let kind;
 if(ev.hero==='rubick'&&ev.slot===3&&f.stolen)kind='stolen';else kind=ev.hero+ev.slot;
 if(!CAST_FX[kind])return null;
 return {kind,x:f.x||0,y:f.y||0,r:f.r||0,a:f.a||0,x0:f.x0,y0:f.y0,pts:f.pts||[],razes:f.razes||[],steal:f.steal||null,stolen:f.stolen||null,col:f.col||'#dbed8a',dur:CAST_FX[kind].dur,age:0};
}
export function drawCastFX(c,f,layer){
 const def=CAST_FX[f.kind];if(!def)return;const k=Math.min(1,f.age/f.dur);
 const fn=layer==='ground'?def.ground:def.air;if(fn)fn(c,f,k);
}
// Death puffs reuse the same one-shot system; tier colors match enemy framing.
export function createDeathFX(ev,w){
 if(!ev)return null;
 if(ev.type==='enemy_death')return {kind:'deathEnemy',x:ev.x||0,y:ev.y||0,col:ev.boss?'#f6c65b':ev.elite?'#f0c857':'#dbed8a',dur:.5,age:0};
 if(ev.type==='death'&&ev.player&&w){const p=w.players[ev.player];if(p)return {kind:'deathPlayer',x:p.x,y:p.y,dur:.8,age:0}}
 return null;
}
// ---------------------------------------------------------------------------
// Persistent area visuals. Warnings double as danger timers: an inner arc
// sweeps a full turn as the impact approaches, using the zone duration.
// ---------------------------------------------------------------------------
export function drawLabZone(c,z,w){
 const t=w?w.seconds:0,x=z.x,y=z.y,r=z.radius||0;
 if(z.kind==='warning'||z.kind==='prisonWarning'){
  const prog=z.dur>0?Math.min(1,Math.max(0,1-z.left/z.dur)):0;
  c.fillStyle=z.kind==='prisonWarning'?'rgba(245,67,53,.26)':'rgba(245,67,53,.20)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  c.strokeStyle=z.kind==='prisonWarning'?'#ff8d7a':'#ff6559';c.lineWidth=4;c.stroke();
  c.beginPath();c.arc(x,y,Math.max(1,r*.5),-Math.PI/2,-Math.PI/2+prog*Math.PI*2);c.strokeStyle='rgba(255,150,110,.9)';c.lineWidth=5;c.stroke();
  if(z.kind==='prisonWarning')for(let i=0;i<8;i++){const a=i*Math.PI/4;fxLine(c,x+Math.cos(a)*r*.85,y+Math.sin(a)*r*.85,x+Math.cos(a)*r,y+Math.sin(a)*r,'rgba(255,120,90,.55)',2)}
  return;
 }
 if(z.kind==='heal'){const pl=.5+.5*Math.sin(t*5);c.fillStyle='rgba(80,225,112,.14)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();fxRing(c,x,y,r,4,'#86e59e',.8+.2*pl);fxRing(c,x,y,r*.6,2,'#c2f2cd',.5+.4*pl);fxLine(c,x-9,y,x+9,y,'#b8f2c4',3,.9);fxLine(c,x,y-9,x,y+9,'#b8f2c4',3,.9);return}
 if(z.kind==='ring'){c.fillStyle='rgba(240,125,100,.10)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();fxRing(c,x,y,r,9,'rgba(244,212,141,.8)');fxRing(c,x,y,r*.94,2,'#e9b86c',.6);for(let i=0;i<20;i++){const a=i*Math.PI/10+t*.7,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;fxPoly(c,[[px+Math.cos(a)*12,py+Math.sin(a)*12],[px+Math.cos(a+2.4)*7,py+Math.sin(a+2.4)*7],[px+Math.cos(a-2.4)*7,py+Math.sin(a-2.4)*7]],'#e9b86c','#8a6a2f',1.2,.9)}return}
 if(z.kind==='enemyField'){const pl=.5+.5*Math.sin(t*6);c.fillStyle='rgba(139,125,245,.18)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();fxRing(c,x,y,r,4,'#a696f0',.9);for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*2,rr=r*(.25+.5*((i*.23+t*.4)%1));fxDisc(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr,3+2*pl,'rgba(166,150,240,.7)')}return}
 // kind==='damage': themed by the fx tag the engine attaches to the zone.
 if(z.fx==='chakram'){c.fillStyle='rgba(239,117,88,.10)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();fxRing(c,x,y,r,3,'#d4ddd1',.7);c.save();c.translate(x,y);c.rotate(t*7);c.globalAlpha=.85;artSaw(c,0,0,r*.45,'#d4ddd1');c.restore();c.save();c.translate(x,y);c.rotate(-t*5+2);c.globalAlpha=.6;artSaw(c,0,0,r*.28,'#9ed3c6');c.restore();fxDiscS(c,x,y,6,'#e7c27d','#7a8e84',1.4)}
 else if(z.fx==='shrapnel'){c.fillStyle='rgba(150,140,120,.26)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();fxRing(c,x,y,r,3,'#c8b98d',.7);for(let i=0;i<8;i++){const a=i*Math.PI/4+t*1.7,rr=r*(.25+.65*((i*.19+t*.3)%1));fxDisc(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr,2.6,'#e8a54b',.6+.3*Math.sin(t*9+i))}}
 else if(z.fx==='frostfield'){c.fillStyle='rgba(159,207,255,.22)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();fxRing(c,x,y,r,3,'#bee8fa',.8);for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.4,px=x+Math.cos(a)*r*.55,py=y+Math.sin(a)*r*.55;fxPoly(c,[[px,py-9],[px+3.4,py],[px,py+9],[px-3.4,py]],'#d6eff6','#e6f6ff',1,.85)}}
 else{c.fillStyle='rgba(139,125,245,.16)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.strokeStyle='#a696f0';c.lineWidth=4;c.stroke()}
}
// Projectiles carry hero-themed bodies at the true hitbox size. Enemy shots
// stay hostile red; the Pudge hook shows its chain back to the thrower.
export function drawLabProjectile(c,q,w,heroId){
 if(q.delay>0)return;
 const a=Math.atan2(q.vy,q.vx),tx=q.x-Math.cos(a)*18,ty=q.y-Math.sin(a)*18;
 if(q.enemy){
  if(q.hook){const src=(w.enemies||[]).find(e=>e.id===q.enemy);if(src)fxLine(c,src.x,src.y,q.x,q.y,'rgba(214,202,178,.8)',3);
   fxLine(c,tx,ty,q.x,q.y,'#9d9c91',5);fxDiscS(c,q.x,q.y,9,'#bbbcb0','#6e6d62',1.6);fxPoly(c,[[q.x+Math.cos(a)*13,q.y+Math.sin(a)*13],[q.x+Math.cos(a+2.2)*8,q.y+Math.sin(a+2.2)*8],[q.x+Math.cos(a-2.2)*8,q.y+Math.sin(a-2.2)*8]],'#9d9c91','#5a5950',1.4)}
  else{fxLine(c,tx,ty,q.x,q.y,'rgba(255,130,102,.45)',4);fxDiscS(c,q.x,q.y,q.radius||8,'#ff8266','#a34836',1.4);fxDisc(c,q.x-Math.cos(a)*3,q.y-Math.sin(a)*3,(q.radius||8)*.4,'#ffd2b8')}
  return;
 }
 switch(heroId){
  case 'drow':fxLine(c,tx,ty,q.x,q.y,q.frost?'#bfeef7':'rgba(207,238,247,.5)',q.frost?4:3);fxPoly(c,[[q.x+Math.cos(a)*9,q.y+Math.sin(a)*9],[q.x+Math.cos(a+2.3)*6,q.y+Math.sin(a+2.3)*6],[q.x+Math.cos(a-2.3)*6,q.y+Math.sin(a-2.3)*6]],q.frost?'#e6f6ff':'#eef8fc','#7ba7b5',1.2);if(q.frost)fxDisc(c,q.x,q.y,(q.radius||8)+3,'rgba(190,232,250,.35)');break;
  case 'mars':fxLine(c,tx,ty,q.x,q.y,'#d4b67e',6);fxPoly(c,[[q.x+Math.cos(a)*14,q.y+Math.sin(a)*14],[q.x+Math.cos(a+2.2)*8,q.y+Math.sin(a+2.2)*8],[q.x+Math.cos(a-2.2)*8,q.y+Math.sin(a-2.2)*8]],'#f4d48d','#8a6a2f',1.3);fxDisc(c,q.x-Math.cos(a)*10,q.y-Math.sin(a)*10,3,'rgba(244,212,141,.5)');break;
  case 'magnus':c.save();c.translate(q.x,q.y);c.rotate(a);c.beginPath();c.arc(-14,0,16,-1,1);c.strokeStyle='#b7aec3';c.lineWidth=7;c.stroke();c.beginPath();c.arc(-14,0,16,-.7,.7);c.strokeStyle='#e8e2ef';c.lineWidth=2.5;c.stroke();c.restore();break;
  case 'sniper':fxLine(c,tx-Math.cos(a)*16,ty-Math.sin(a)*16,q.x,q.y,'rgba(255,233,176,.55)',2.4);fxDiscS(c,q.x,q.y,4.5,'#ffe9b0','#8a6a2f',1.2);break;
  case 'sf':fxDisc(c,q.x,q.y,(q.radius||8)+4,'rgba(224,102,94,.30)');fxDiscS(c,q.x,q.y,q.radius||8,'#51232b','#e0665e',1.6);fxDisc(c,q.x,q.y,3,'#ffd27d');break;
  default:fxLine(c,tx,ty,q.x,q.y,'rgba(219,237,138,.45)',4);fxDiscS(c,q.x,q.y,q.radius||8,'#dbed8a','#7c9a4d',1.4);
 }
}
// Status auras drawn with their hero: spins, channels, buffs and debuffs.
export function drawLabHeroAura(c,p,w){
 const t=w.seconds,leg=n=>(p.legendary||[]).includes(n),st=p.status||{};
 if(st.spin>0){const r=leg('Blade Storm')?250:180;for(const s of [0,Math.PI]){const a=s+t*9;c.save();c.translate(p.x+Math.cos(a)*r*.42,p.y+Math.sin(a)*r*.42);c.rotate(a*1.5);artSaw(c,0,0,12,'rgba(220,232,216,.9)');c.restore()}fxRing(c,p.x,p.y,r*.42,2,'rgba(220,232,216,.35)')}
 if(st.restore>0){const pl=.5+.5*Math.sin(t*4);fxDisc(c,p.x,p.y,270,'rgba(201,141,227,.10)');fxRing(c,p.x,p.y,300,3,'rgba(201,141,227,'+(.3+.25*pl).toFixed(3)+')');fxRing(c,p.x,p.y,180,2,'rgba(216,170,232,'+(.4+.3*pl).toFixed(3)+')')}
 if(p.channel&&p.channel.kind==='blizzard'){const r=400;for(let i=0;i<12;i++){const a=i*Math.PI/6+t*2.2,rr=r*(.2+.8*((i*.137+t*.35)%1));fxDisc(c,p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr,2.6,'rgba(230,246,255,.8)')}fxRing(c,p.x,p.y,r*.35,2,'rgba(190,232,250,.5)')}
 if(p.channel&&p.channel.kind==='ward'){const px=p.x+44,py=p.y-6;fxLine(c,px,py,px,py-30,'rgba(189,150,99,.95)',4);fxDiscS(c,px,py-36,8,'rgba(232,220,240,.95)','#573a70',1.2);fxDisc(c,px,py-36,3.4,'rgba(123,209,167,.9)');fxRing(c,px,py-36,12+4*Math.sin(t*6),1.5,'rgba(123,209,167,.6)')}
 if(st.takeAim>0)fxRing(c,p.x,p.y,32,1.5,'rgba(230,206,141,.6)');
 if(st.empower>0){fxDisc(c,p.x,p.y,30,'rgba(224,122,92,.18)');fxRing(c,p.x,p.y,24+3*Math.sin(t*8),2,'rgba(224,122,92,.7)')}
 if(st.frost>0)fxRing(c,p.x,p.y-8,20,1.5,'rgba(190,232,250,.55)');
 if(st.bkb>0)fxRing(c,p.x,p.y,30+2*Math.sin(t*10),3,'rgba(140,40,40,.8)');
 if(st.blade>0)fxRing(c,p.x,p.y,27,2,'rgba(230,90,70,'+(.5+.3*Math.sin(t*9)).toFixed(3)+')');
 if(st.poison>0)for(let i=0;i<3;i++)fxDisc(c,p.x-8+i*8,p.y-30-10*((t*1.4+i*.33)%1),2.6,'rgba(146,196,81,.8)');
 if(st.marksmanship>0)fxRing(c,p.x,p.y,36+2*Math.sin(t*7),1.6,'rgba(242,212,136,.55)');
 if((p.reactive||0)>0)fxRing(c,p.x,p.y,26+(p.reactive||0)*2,1.6,'rgba(201,211,200,.6)');
 if((p.souls||0)>0)fxDiscS(c,p.x+22,p.y-40,3.6,'rgba(255,210,125,.85)','#8a5a2f',1);
 if(st.silence>0)fxRing(c,p.x,p.y,26,1.5,'rgba(180,180,180,.5)',1,[4,4]);
 if(st.stun>0)for(let i=0;i<3;i++){const a=t*4+i*2.1,px=p.x+Math.cos(a)*16,py=p.y-44+Math.sin(a)*5;fxPoly(c,[[px,py-6],[px+4,py],[px,py+6],[px-4,py]],'#ffe9b0',null,0,.95)}
}
// Enemy condition marks so crowd control reads at a glance.
export function drawLabEnemyStatus(c,e,t){
 const x=e.x,y=e.y,r=e.radius||22,st=e.status||{};
 if(st.stun>0)for(let i=0;i<3;i++){const a=t*4+i*2.1,px=x+Math.cos(a)*16,py=y-r-12+Math.sin(a)*5;fxPoly(c,[[px,py-6],[px+4,py],[px,py+6],[px-4,py]],'#ffe9b0',null,0,.95)}
 if(st.slow>0)fxRing(c,x,y,r+4,2,'rgba(159,207,255,.65)');
 if(st.silence>0)fxRing(c,x,y,r+8,1.5,'rgba(190,190,190,.55)',1,[4,4]);
 if(e.maledict){c.save();c.translate(x,y-r-18);c.rotate(Math.sin(t*3)*.3);c.globalAlpha=.9;fxDiscS(c,0,0,7,'#d9bf7d','#573a70',1.2);fxDisc(c,-2.4,-1.6,1.4,'#2a1e33');fxDisc(c,2.4,-1.6,1.4,'#2a1e33');c.restore()}
 if(st.rush>0)for(let i=0;i<3;i++)fxLine(c,x-r-6-i*7,y+6-i*5,x-r-18-i*7,y+6-i*5,'rgba(255,130,102,.5)',2);
 if(e.guardTime>0)fxRing(c,x,y,r+6,2,'rgba(230,220,190,.7)');
 if(e.shield>0&&e.shieldTime>0)fxRing(c,x,y,r+10,1.5,'rgba(166,229,255,.5)',1,[6,5]);
}
