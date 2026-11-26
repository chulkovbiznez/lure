const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await c.newPage();
const html=fs.readFileSync(process.argv[2]);
await p.route(u=>{const x=new URL(u);return x.host==='app.eaglesteam.ru'&&(x.pathname==='/'||x.pathname==='/index.html')},r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
await p.route(/functions\.yandexcloud/,r=>r.abort());
await p.goto('https://app.eaglesteam.ru/',{waitUntil:'load'});await p.waitForTimeout(2500);
await p.locator('#gCfw').scrollIntoViewIfNeeded();await p.evaluate(()=>document.getElementById('gCfw').scrollIntoView());await p.waitForTimeout(800);
await p.evaluate(()=>document.getElementById('gArL').click());await p.waitForTimeout(900);for(let i=0;i<12;i++){await p.locator('#gCfw').screenshot({path:process.argv[3]+'-'+String(i).padStart(2,'0')+'.png'});await p.evaluate(()=>document.getElementById('gArR').click());await p.waitForTimeout(900);}
await b.close();})();
