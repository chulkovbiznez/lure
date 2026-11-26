const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const F=process.argv[2],tag=process.argv[3],login=process.argv[4]!=='0';const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:844},recordVideo:{dir:'vp-'+tag,size:{width:390,height:844}}});const p=await c.newPage();
const pr=fs.readFileSync(F);
await p.route(u=>new URL(u).pathname==='/profile.html',async r=>{await new Promise(z=>setTimeout(z,300));r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:pr})});
await p.route(u=>{const x=new URL(u);return x.host==='app.eaglesteam.ru'&&x.pathname==='/'},r=>r.fulfill({status:200,contentType:'text/html',body:'<html><body style="background:#fff">LANDING</body></html>'}));
await p.route(/functions\.yandexcloud/,async r=>{await new Promise(z=>setTimeout(z,1000));r.fulfill({status:200,contentType:'application/json',body:'{}'})});
await p.goto('https://app.eaglesteam.ru/egpwa/favicon-48.png');
await p.evaluate(l=>{localStorage.clear();sessionStorage.clear();if(l){localStorage.setItem('eaglesfree_id','11111');localStorage.setItem('eaglesfree_session','x');localStorage.setItem('eaglesfree_last_activity',String(Date.now()));localStorage.setItem('eg_onb_done','1');localStorage.setItem('eg_pin_t','11111:'+Date.now())}},login);
const t0=Date.now();await p.goto('https://app.eaglesteam.ru/profile.html?app=android&v=14',{waitUntil:'commit'}).catch(()=>{});await p.waitForTimeout(4000);await c.close();await b.close();return;
const tl=[];for(let i=0;i<40;i++){await p.waitForTimeout(50);const s=await p.evaluate(()=>{const z=document.getElementById('egpZ');return z?getComputedStyle(z).display:'-'}).catch(()=>'nav');tl.push((Date.now()-t0)+':'+s)}
console.log(tag,p.url(),tl.filter((x,i)=>i%4==0).join(' '));await c.close();await b.close();})();
