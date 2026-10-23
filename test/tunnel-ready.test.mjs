import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkTunnelReady} from '../tunnel-ready.mjs';
test('an allocated address is not ready while DNS or Cloudflare routing is failing',async()=>{
  const dns=await checkTunnelReady('https://pending.example','mine',{fetchImpl:async()=>{throw Object.assign(Error('fetch failed'),{cause:{code:'ENOTFOUND'}});}});
  assert.equal(dns.ready,false);assert.match(dns.reason,/DNS/);
  const edge=await checkTunnelReady('https://pending.example','mine',{fetchImpl:async()=>new Response('not connected',{status:503})});assert.equal(edge.ready,false);
});
test('a healthy response must identify this exact game process',async()=>{
  for(const instanceId of ['other',undefined]){
    const result=await checkTunnelReady('https://pending.example','mine',{fetchImpl:async()=>Response.json({ok:true,transport:'websocket',instanceId})});assert.equal(result.ready,false);
  }
  const ok=await checkTunnelReady('https://ready.example','mine',{fetchImpl:async(url,options)=>{assert.equal(url.pathname,'/health');assert.equal(options.cache,'no-store');return Response.json({ok:true,transport:'websocket',instanceId:'mine'});}});
  assert.equal(ok.ready,true);
});
