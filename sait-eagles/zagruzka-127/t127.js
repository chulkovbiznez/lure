const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
const html=fs.readFileSync(process.argv[2]);
await p.route(u=>new URL(u).pathname==='/profile.html',r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
await p.route(/functions\.yandexcloud/,async r=>{await new Promise(z=>setTimeout(z,1500));r.fulfill({status:200,contentType:'application/json',body:'{}'})});
await p.goto('https://app.eaglesteam.ru/robots.txt');
await p.evaluate(()=>{localStorage.setItem('eaglesfree_id','11111');localStorage.setItem('eaglesfree_session','x');localStorage.setItem('eaglesfree_name','Тест Тестов');localStorage.setItem('eaglesfree_last_activity',String(Date.now()));localStorage.setItem('eg_pin_t','11111:'+Date.now());localStorage.setItem('eg_onb_done','1')});
const t0=Date.now();p.goto('https://app.eaglesteam.ru/profile.html?app=android&v=12').catch(()=>{});
const log=[];for(const ms of [400,1200,2000,3000,4500]){await p.waitForTimeout(ms-(Date.now()-t0));const z=await p.evaluate(()=>{const e=document.getElementById('egpZ');return e?(e.hidden?'hidden':'shown'):'none'}).catch(()=>'err');log.push(ms+':'+z);await p.screenshot({path:process.argv[3]+'-'+ms+'.png'});}
console.log(log.join(' '));await b.close();})();
