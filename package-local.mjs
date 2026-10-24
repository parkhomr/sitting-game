import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, '..', 'СИДИ-КАЧАЙСЯ.html');
const css = readFileSync(path.join(root, 'dist/style.css'), 'utf8');
const engine = ['engine.js','netcode.js','effects.js'].map(file=>readFileSync(path.join(root,'dist',file),'utf8')).join('\n');
const js = readFileSync(path.join(root, 'dist/game.js'), 'utf8').replace(/^import[^\n]+from ['"]\.\/(?:engine|netcode|effects)\.js['"];?\s*/gm, '');
const arcadeModules=['chaos-data.js','arcade-engine.js','arcade-wire.js','arcade-art.js','arcade-prediction.js','arcade-client.js'];
const arcadeJS=arcadeModules.map(file=>readFileSync(path.join(root,'dist',file),'utf8').replace(/^import[^\n]+from ['"]\.\/[^'"]+['"];?\s*/gm,'')).join('\n');
let arcadeHTML=readFileSync(path.join(root,'dist/arcade.html'),'utf8').replace('<link rel="stylesheet" href="arcade.css">',()=>'<style>'+readFileSync(path.join(root,'dist/arcade.css'),'utf8')+'</style>').replace('<script type="module" src="arcade-client.js"></script>','').replace('</body>',()=>'<script type="module">'+arcadeJS.replace(/<\/script/gi,'<\\/script')+'</script></body>');
let html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');

// Everything needed to play travels inside one file. No server or network.
html = html.replace(/^\s*<link[^>]+https:\/\/fonts\.[^>]+>\s*$/gm, '');
html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + css + '\n</style>');
html = html.replace('<script type="module" src="game.js"></script>', '');
html = html.replace('class="brand" href="./"', 'class="brand" href="#"');
html = html.replace('</body>',()=>'<script type="application/json" id="arcadeBundle">'+JSON.stringify(arcadeHTML).replace(/</g,'\\u003c')+'</script></body>');
html = html.replace('</body>', () => '<script type="module">\n' + (engine+'\n'+js).replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>');

if (/<(?:script|link)\b[^>]*(?:src|href)=["']https?:/i.test(html)) {
  throw new Error('The local game must not have external dependencies.');
}
writeFileSync(output, html, 'utf8');
console.log(output);

// Minimal UTF-8 ZIP writer: packaging needs only Node, including on Windows.
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function zip(entries,destination){
  const local=[],central=[];let offset=0;
  for(const [filename,value] of entries){
    const name=Buffer.from(filename),data=Buffer.isBuffer(value)?value:Buffer.from(value),compressed=deflateRawSync(data);
    let checksum=0xffffffff;for(const byte of data)checksum=crcTable[(checksum^byte)&255]^(checksum>>>8);checksum=(checksum^0xffffffff)>>>0;
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(checksum,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
    local.push(header,name,compressed);
    const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50,0);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(33,14);record.writeUInt32LE(checksum,16);record.writeUInt32LE(compressed.length,20);record.writeUInt32LE(data.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);central.push(record,name);
    offset+=header.length+name.length+compressed.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  writeFileSync(destination,Buffer.concat([...local,directory,end]));console.log(destination);
}
const guide=readFileSync(path.join(root,'КАК-ИГРАТЬ.txt'));
zip([['СИДИ-КАЧАЙСЯ.html',html],['КАК-ИГРАТЬ.txt',guide]],path.resolve(root,'..','oscar-farm-local.zip'));
const sourceFiles=['package-local.mjs','package.json','server.mjs','start-online.mjs','tunnel-ready.mjs','README.md','КАК-ИГРАТЬ.txt','balance/simulate.mjs','balance/run-audit.mjs','balance/REPORT.md','balance/report.json','balance/arcade-audit.mjs','balance/ARCADE-REPORT.md','balance/arcade-report.json','dist/index.html','dist/style.css','dist/game.js','dist/engine.js','dist/netcode.js','dist/effects.js',...arcadeModules.map(file=>'dist/'+file),'dist/arcade.html','dist/arcade.css','research/MODES.md','research/VALIDATION.md','vendor/ws/LICENSE','vendor/ws/package.json','vendor/ws/wrapper.mjs','vendor/ws/index.js'];
sourceFiles.push(...readdirSync(path.join(root,'test')).filter(file=>file.endsWith('.test.mjs')).map(file=>'test/'+file));
sourceFiles.push(...readdirSync(path.join(root,'vendor/ws/lib')).filter(file=>file.endsWith('.js')).map(file=>'vendor/ws/lib/'+file));
zip([...sourceFiles.map(file=>['oscar-farm/'+file,readFileSync(path.join(root,file))]),['oscar-farm/СИДИ-КАЧАЙСЯ.html',html]],path.resolve(root,'..','oscar-farm-multiplayer.zip'));

// Keep ready-to-play artifacts inside the repository as well as beside the local project.
const downloads=path.join(root,'downloads');
mkdirSync(downloads,{recursive:true});
for(const name of ['СИДИ-КАЧАЙСЯ.html','oscar-farm-local.zip','oscar-farm-multiplayer.zip']){
  copyFileSync(path.resolve(root,'..',name),path.join(downloads,name));
}
console.log(downloads);
