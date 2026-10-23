// A newly allocated Quick Tunnel name can appear in the logs before DNS/edge routing works.
export async function checkTunnelReady(origin,instanceId,{fetchImpl=fetch,timeout=5000,signal}={}){
  const timeoutSignal=AbortSignal.timeout(timeout);
  try{
    const response=await fetchImpl(new URL('/health',origin),{
      signal:signal?AbortSignal.any([signal,timeoutSignal]):timeoutSignal,
      cache:'no-store',redirect:'error',headers:{Accept:'application/json','Cache-Control':'no-cache'}
    });
    if(!response.ok)return {ready:false,reason:'туннель пока отвечает HTTP '+response.status};
    const data=await response.json();
    if(data.ok!==true||data.transport!=='websocket'||data.instanceId!==instanceId)return {ready:false,reason:'ответ ещё не от этого игрового сервера'};
    return {ready:true};
  }catch(error){
    const code=error.cause?.code||error.code;
    if(['ENOTFOUND','EAI_AGAIN','ENODATA'].includes(code))return {ready:false,reason:'DNS нового адреса ещё не доступен'};
    if(['AbortError','TimeoutError'].includes(error.name))return {ready:false,reason:'внешний адрес пока не ответил'};
    return {ready:false,reason:'ожидаем доступности игры через туннель'};
  }
}
