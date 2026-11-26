const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();
for(const pin of [1,0]){const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const html=fs.readFileSync(process.argv[2]);
await p.route(u=>new URL(u).pathname==='/profile.html',r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
await p.route(/functions\.yandexcloud/,async r=>{await new Promise(z=>setTimeout(z,800));r.fulfill({status:200,contentType:'application/json',body:'{}'})});
await p.addInitScript(()=>{window.__seen=[];new MutationObserver(()=>{const e=document.getElementById('egp');if(e&&!window.__f){window.__f=1;window.__seen.push('egp-parsed vis='+getComputedStyle(e).visibility)}}).observe(document,{childList:true,subtree:true})});
await p.goto('https://app.eaglesteam.ru/robots.txt');
await p.evaluate(pin=>{localStorage.setItem('eaglesfree_id','11111');localStorage.setItem('eaglesfree_session','x');localStorage.setItem('eaglesfree_last_activity',String(Date.now()));localStorage.setItem('eg_onb_done','1');if(pin)localStorage.setItem('eg_pin_t','11111:'+Date.now());else localStorage.removeItem('eg_pin_t')},pin);
await p.goto('https://app.eaglesteam.ru/profile.html?app=android&v=12');await p.waitForTimeout(3500);
const r=await p.evaluate(()=>({seen:window.__seen,pre:!!document.getElementById('egpPre'),egpHidden:document.getElementById('egp').hidden,egpVis:getComputedStyle(document.getElementById('egp')).visibility}));
console.log('pin-ok='+pin,JSON.stringify(r));await p.screenshot({path:'p128-'+pin+'.png'});await c.close();}
await b.close();})();
