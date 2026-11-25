/* Kalon ranked beta: portal session via strict postMessage, server-owned submissions. */
(function(){
"use strict";
const endpoint="https://jwwvwhomjqnozyqwbzwp.supabase.co/functions/v1/kalon-runs";
const key="sb_publishable__a2SI5r42X4eC6bcZFkZCQ_Q6_l4-vT";
const origins=new Set(["https://the-rozu.github.io","https://raw.githack.com"]);
let token=null,requested=[],startPromise=null,finalized=false;
const banner=document.getElementById("kalon-ranking-status");
const result=document.getElementById("kalon-ranking-result");
function setStatus(message){
 if(banner)banner.textContent=message;
 if(result)result.textContent=message;
}
window.addEventListener("message",event=>{
 if(event.source!==window.parent||!origins.has(event.origin))return;
 const msg=event.data;
 if(!msg||msg.type!=="calion:session"||msg.game!=="kalon"||msg.version!==1)return;
 token=typeof msg.accessToken==="string"?msg.accessToken:null;
 const callbacks=requested;requested=[];for(const done of callbacks)done(token);
});
function parentOrigin(){
 if(window.parent===window)return null;
 try{
  const origin=new URL(document.referrer).origin;
  return origins.has(origin)?origin:null;
 }catch{return null;}
}
async function askForToken(){
 const origin=parentOrigin();
 if(!origin)return null;
 return await new Promise(resolve=>{
  const done=t=>{clearTimeout(timeout);resolve(t);};
  requested.push(done);
  const timeout=setTimeout(()=>{
    const index=requested.indexOf(done);if(index>=0)requested.splice(index,1);
    resolve(token);
  },2200);
  window.parent.postMessage({type:"calion:request-session",game:"kalon",version:1},origin);
 });
}
async function send(action,body){
 const access=await askForToken()||token;
 if(!access)throw Error("Brak zalogowanego konta w Calionie.");
 const response=await fetch(endpoint,{
  method:"POST",mode:"cors",credentials:"omit",
  headers:{"Content-Type":"application/json","apikey":key,"Authorization":"Bearer "+access},
  body:JSON.stringify({action,...body})
 });
 const payload=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(payload.error||"Serwer rankingu odrzucił zgłoszenie.");
 return payload;
}
function start(){
 finalized=false;
 startPromise=send("start",{}).then(data=>{
  setStatus("♜ Wyprawa rankingowa rozpoczęta. Wynik zostanie zapisany po zakończeniu.");
  return data.runId;
 }).catch(e=>{
  setStatus("♜ Gra gościnna: "+e.message+" Wynik nie trafi do rankingu.");
  return null;
 });
}
async function finish(stats,outcome){
 if(finalized)return;finalized=true;
 if(!startPromise){setStatus("♜ Gra gościnna: brak sesji rankingowej.");return;}
 const id=await startPromise;
 if(!id)return;
 setStatus("♜ Trwa zapisywanie wyniku wyprawy…");
 try{
  const data=await send("finish",{runId:id,stats,outcome});
  setStatus("♜ Wynik zapisany w rankingu BETA: "+Number(data.score||0).toLocaleString("pl-PL")+" pkt. Ranking wymaga dalszej weryfikacji anty-cheat.");
 }catch(e){setStatus("♜ Nie zapisano wyniku: "+e.message);}
}
window.KalonRanked={start,finish};
setStatus("♜ Ranking BETA: zaloguj się na stronie Calionu przed rozpoczęciem wyprawy. Gra bez konta nadal działa.");
})();
