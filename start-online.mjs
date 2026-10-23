import { createGameServer } from './server.mjs';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, access, writeFile, rename, chmod, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { checkTunnelReady } from './tunnel-ready.mjs';

const root=path.dirname(fileURLToPath(import.meta.url)),tools=path.join(root,'.tools');
const version='2026.10.3';
async function binary(){
  if(process.env.CLOUDFLARED_PATH)return process.env.CLOUDFLARED_PATH;
  if(spawnSync('cloudflared',['--version'],{stdio:'ignore'}).status===0)return 'cloudflared';
  const platform={linux:'linux',darwin:'darwin',win32:'windows'}[process.platform],arch={x64:'amd64',arm64:'arm64',ia32:'386'}[process.arch];
  if(!platform||!arch)throw Error('Установи cloudflared для своей системы и повтори запуск.');
  const dest=path.join(tools,process.platform==='win32'?'cloudflared.exe':'cloudflared');
  try{await access(dest);return dest;}catch{}
  await mkdir(tools,{recursive:true});
  const name=`cloudflared-${platform}-${arch}`+(platform==='windows'?'.exe':platform==='darwin'?'.tgz':'');
  console.log('Первый запуск: скачиваю Cloudflare Tunnel с официального GitHub…');
  const headers={'User-Agent':'Oscar-Farm-Club','Accept':'application/vnd.github+json'};
  const metadata=await fetch(`https://api.github.com/repos/cloudflare/cloudflared/releases/tags/${version}`,{headers,signal:AbortSignal.timeout(20000)});
  if(!metadata.ok)throw Error('Не удалось получить cloudflared. Проверь интернет и повтори запуск.');
  const release=await metadata.json(),asset=release.assets.find(a=>a.name===name);
  if(!asset)throw Error('Нет cloudflared для этой системы: '+name);
  const response=await fetch(asset.browser_download_url,{signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Error('Не удалось скачать cloudflared: '+response.status);
  const data=Buffer.from(await response.arrayBuffer());
  if(asset.digest?.startsWith('sha256:')&&createHash('sha256').update(data).digest('hex')!==asset.digest.slice(7))throw Error('Контрольная сумма cloudflared не совпала. Повтори загрузку.');
  const temporary=dest+'.download';await writeFile(temporary,data);
  if(platform==='darwin'){
    const result=spawnSync('tar',['-xzf',temporary,'-C',tools,'cloudflared'],{stdio:'inherit'});await rm(temporary,{force:true});
    if(result.status!==0)throw Error('Не удалось распаковать cloudflared.');
  }else await rename(temporary,dest);
  if(platform!=='windows')await chmod(dest,0o755);return dest;
}
let server,tunnel,closing=false;
const shutdown=new AbortController();
function stop(){if(closing)return;closing=true;shutdown.abort();tunnel?.kill();server?.closeLiveConnections();server?.closeAllConnections();server?.close();}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,stop);
try{
  const executable=await binary();if(closing)process.exit(0);
  server=createGameServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const port=server.address().port;
  console.log(`Локальная игра: http://localhost:${port}\nСоздаю ссылку для друзей из любых стран…`);
  tunnel=spawn(executable,['tunnel','--no-autoupdate','--protocol','auto','--url',`http://127.0.0.1:${port}`],{stdio:['ignore','pipe','pipe']});
  let shown=false,checking=false,tail='';
  async function waitForPublicLink(origin){
    checking=true;console.log('Адрес выделен. Проверяю DNS и доступность игры — пока не отправляй ссылку друзьям.');
    let attempts=0;
    while(!closing){
      const result=await checkTunnelReady(origin,server.instanceId,{signal:shutdown.signal});
      if(closing)return;
      if(result.ready){
        shown=true;server.setPublicOrigin(origin);
        console.log(`\nВНЕШНЯЯ ССЫЛКА ПРОВЕРЕНА — ИГРА ДОСТУПНА\n${origin}\n\nЕё можете открывать и ты, и друзья.\nТебе для меньшей задержки рекомендуется: http://localhost:${port}\n\n1. Выбери «Ведущий» и создай комнату.\n2. «Ссылка друзьям» скопирует проверенную ВНЕШНЮЮ ссылку с кодом комнаты.\n3. Друзья открывают её и входят. Панель ведущего остаётся у тебя.\n\nЕсли Firefox пишет Server Not Found: открой about:networking#dns,\nнажми Clear DNS Cache и повтори открытие ссылки.\n\nДержи компьютер и этот терминал включёнными. Ctrl+C — остановить.\nСсылка временная: при следующем запуске будет новая.\n`);
        return;
      }
      if(attempts++%5===0)console.log('Ссылка ещё не готова: '+result.reason+'. Продолжаю проверку…');
      try{await delay(1500,undefined,{signal:shutdown.signal});}catch{return;}
    }
  }
  function output(chunk){const text=chunk.toString();tail=(tail+text).slice(-6000);const match=tail.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);if(match&&!checking&&!closing)void waitForPublicLink(match[0]);}
  tunnel.stdout.on('data',output);tunnel.stderr.on('data',output);
  tunnel.on('error',error=>{console.error('Не удалось запустить туннель:',error.message);stop();process.exitCode=1;});
  tunnel.on('exit',code=>{if(!closing){console.error('Туннель остановлен.',shown?'Ссылка больше не работает.':tail);process.exitCode=code||1;stop();}});
}catch(error){console.error(error.message);stop();process.exitCode=1;}
