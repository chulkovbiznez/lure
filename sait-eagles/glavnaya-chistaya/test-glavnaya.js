const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2], TAG=process.argv[3];
async function page(b,url,opt={}){
  const ctx=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});
  if(opt.ls) await ctx.addInitScript(o=>{for(const k in o)localStorage.setItem(k,o[k])},opt.ls);
  const p=await ctx.newPage();const log=[],errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|fonts/.test(m.text()))errs.push(m.text())});
  await ctx.route(/app\.eaglesteam\.ru\/(\?.*)?$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html'}));
  await ctx.route(/app\.eaglesteam\.ru\/(profile|binar)\.html/,r=>r.fulfill({body:'<h1>PROFILE</h1>',contentType:'text/html'}));
  await ctx.route(/\.(mp4|webp|jpg)$/,r=>r.fulfill({status:404,body:''}));
  await ctx.route(/functions\.yandexcloud\.net/,async r=>{const u=new URL(r.request().url());const q=Object.fromEntries(u.searchParams);delete q._;log.push(q);
    let a=q.action,res={ok:false};
    if(a==='bin_ref')res=q.ref==='99999'?{ok:false,error:'not_found'}:{ok:true,id:q.ref,name:q.ref==='11111'?'Андрей Чулков':'Пётр Иванов',plan:'pro'};
    if(a==='login_request')res={ok:true,id:'55555',emailHint:'a***@mail.ru'};
    if(a==='reg_request')res={ok:true,id:'77777'};
    if(a==='login_verify'||a==='reg_verify')res=q.code==='123456'?{ok:true,id:q.id,name:'Тест',session:'S1'}:{ok:false,error:'bad_code'};
    await new Promise(z=>setTimeout(z,150));r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(res)})});
  await p.goto(url).catch(e=>errs.push('goto '+e.message));await p.waitForTimeout(1500);
  return {ctx,p,log,errs};
}
const R={};
(async()=>{const b=await chromium.launch();
 // 1 открытие
 let t=await page(b,'https://app.eaglesteam.ru/');
 await t.p.screenshot({path:`T-${TAG}-1.png`});
 R.open={mentor:await t.p.locator('#gl .hero .mentor').innerText(),log:t.log,errs:t.errs};
 // 2 вход
 await t.p.click('#gIn');await t.p.waitForTimeout(600);
 R.loginVisible=await t.p.locator('#lgn').isVisible();
 await t.p.screenshot({path:`T-${TAG}-2.png`});
 await t.p.fill('#lId','55555');await t.p.click('#lBtn');await t.p.waitForTimeout(1200);
 R.codeVisible=await t.p.locator('#cdo').isVisible();
 await t.p.screenshot({path:`T-${TAG}-3.png`});
 await t.p.evaluate(v=>{const c=document.getElementById('cCode');c.value=v;c.dispatchEvent(new Event('input',{bubbles:true}))},'111111');await t.p.waitForTimeout(1200);
 R.badCode=await t.p.locator('#cSt').innerText();
 await t.p.evaluate(v=>{const c=document.getElementById('cCode');c.value=v;c.dispatchEvent(new Event('input',{bubbles:true}))},'123456');await t.p.waitForTimeout(2500);
 R.loginEnd={url:t.p.url(),ls:await t.p.evaluate(()=>({id:localStorage.eaglesfree_id,s:localStorage.eaglesfree_session})).catch(e=>'nav'),log:t.log.slice(1),errs:t.errs};
 await t.ctx.close();
 // 3 регистрация
 t=await page(b,'https://app.eaglesteam.ru/');
 await t.p.click('#gl .hero .gbtn.reg');await t.p.waitForTimeout(700);
 await t.p.screenshot({path:`T-${TAG}-4.png`});
 await t.p.fill('#fN','Иван');await t.p.fill('#fF','Петров');await t.p.fill('#fE','ivan@mail.ru');
 await t.p.click('.g-next');await t.p.waitForTimeout(500);
 await t.p.fill('#cT','@ivan_petrov');await t.p.waitForTimeout(200);
 await t.p.click('.g-next');await t.p.waitForTimeout(500);
 await t.p.screenshot({path:`T-${TAG}-5.png`});
 await t.p.click('#polCb');await t.p.click('#cta');await t.p.waitForTimeout(1500);
 R.regCode=await t.p.locator('#cdo').isVisible();R.regSt=await t.p.locator('#rSt').innerText().catch(()=>'');R.why=await t.p.locator('#why').innerText().catch(()=>'');await t.p.screenshot({path:`T-${TAG}-5b.png`});
 await t.p.evaluate(v=>{const c=document.getElementById('cCode');c.value=v;c.dispatchEvent(new Event('input',{bubbles:true}))},'123456');await t.p.waitForTimeout(3500);
 R.regEnd={url:t.p.url(),log:t.log.slice(1),errs:t.errs};
 await t.ctx.close();
 // 4 ссылка ?ref
 t=await page(b,'https://app.eaglesteam.ru/?ref=12345&s=L');await t.p.waitForTimeout(800);
 R.ref={regOpen:await t.p.locator('#reg').isVisible(),mentor:await t.p.locator('#gl .hero .mentor').innerText(),log:t.log,errs:t.errs};
 await t.p.screenshot({path:`T-${TAG}-6.png`});
 await t.ctx.close();
 // 5 ?code из письма
 t=await page(b,'https://app.eaglesteam.ru/?code=123456&u=55555&m=l');await t.p.waitForTimeout(2500);
 R.mailcode={url:t.p.url(),log:t.log,errs:t.errs};await t.ctx.close();
 // 6 уже вошёл
 t=await page(b,'https://app.eaglesteam.ru/',{ls:{eaglesfree_id:'55555',eaglesfree_session:'S1'}});
 R.logged={url:t.p.url()};await t.ctx.close();
 // 7 «как зарегистрироваться» + «?»
 t=await page(b,'https://app.eaglesteam.ru/');
 await t.p.click('#gHow');await t.p.waitForTimeout(600);R.ins=await t.p.locator('#ins').isVisible();
 await t.p.screenshot({path:`T-${TAG}-7.png`});
 await t.p.click('#iGo');await t.p.waitForTimeout(900);R.insToReg=await t.p.locator('#reg').isVisible();
 await t.p.fill('#fN','И');await t.p.fill('#fF','П');await t.p.fill('#fE','i@m.ru');await t.p.click('.g-next');await t.p.waitForTimeout(500);
 await t.p.click('#ciT .q-btn');await t.p.waitForTimeout(800);R.help=await t.p.locator('.qh').count();
 await t.p.screenshot({path:`T-${TAG}-8.png`});
 // изменить наставника
 await t.p.click('.qh-x');await t.p.waitForTimeout(700);await t.p.click('.g-back');await t.p.waitForTimeout(400);
 await t.p.click('#mChg');await t.p.fill('#nInp','12345');await t.p.waitForTimeout(1200);await t.p.click('#nOk');await t.p.waitForTimeout(300);
 R.chg={m:await t.p.locator('#mName').innerText(),hero:await t.p.locator('#gl .hero .mentor').innerText()};
 // карусель
 await t.p.keyboard.press('Escape');
 R.errs7=t.errs;await t.ctx.close();
 t=await page(b,'https://app.eaglesteam.ru/');
 await t.p.locator('#gCfw').scrollIntoViewIfNeeded();await t.p.click('#gArR');await t.p.waitForTimeout(700);await t.p.click('#gArR');await t.p.waitForTimeout(700);
 R.car=await t.p.locator('#gCnt').innerText();await t.p.screenshot({path:`T-${TAG}-9.png`});
 await t.p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await t.p.waitForTimeout(600);await t.p.screenshot({path:`T-${TAG}-10.png`});
 R.links=await t.p.$$eval('#gl a',a=>a.map(x=>x.getAttribute('href')));
 R.errs9=t.errs;
 await b.close();
 fs.writeFileSync(`R-${TAG}.json`,JSON.stringify(R,null,1));console.log('done');
})();
