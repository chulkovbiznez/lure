const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();
for(const [name,file,login] of [['old','/tmp/lure/sait-eagles/app-125/index-do-125.html',1],['new','/tmp/lure/sait-eagles/app-125/site/index.html',1],['new-out','/tmp/lure/sait-eagles/app-125/site/index.html',0],['new-ref','/tmp/lure/sait-eagles/app-125/site/index.html',1]]){
 const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();
 const html=fs.readFileSync(file);
 await p.route(u=>{const x=new URL(u);return x.host==='app.eaglesteam.ru'&&(x.pathname==='/'||x.pathname==='/index.html')},r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
 await p.route(u=>new URL(u).pathname==='/profile.html',async r=>{await new Promise(z=>setTimeout(z,2500));r.fulfill({status:200,contentType:'text/html',body:'<html><body style="background:#070708;color:#fff">PROFILE '+'</body></html>'})});
 await p.route(/functions\.yandexcloud|egpwa|sw\.js/,r=>r.abort());
 await p.goto('https://app.eaglesteam.ru/robots.txt').catch(()=>{});
 if(login) await p.evaluate(()=>{localStorage.setItem('eaglesfree_id','11111');localStorage.setItem('eaglesfree_session','x');localStorage.setItem('eaglesfree_last_activity',String(Date.now()))});
 const url='https://app.eaglesteam.ru/'+(name==='new-ref'?'?ref=12345':'?app=android&v=12');
 p.goto(url).catch(()=>{});
 await p.waitForTimeout(1200);await p.screenshot({path:'t125-'+name+'-a.png'});
 await p.waitForTimeout(2500);await p.screenshot({path:'t125-'+name+'-b.png'});console.log(name,p.url());await c.close();}
await b.close();})();
