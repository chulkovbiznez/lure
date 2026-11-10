const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2], TAG=process.argv[3];
const ID='23456';
async function page(b,opt={}){
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await ctx.addInitScript(o=>{try{if(sessionStorage.getItem('__init'))return;sessionStorage.setItem('__init','1');
    for(const k in o.ls)localStorage.setItem(k,o.ls[k]);for(const k in o.ss)sessionStorage.setItem(k,o.ss[k]);}catch(e){}},
    {ls:Object.assign({eaglesfree_id:ID,eaglesfree_session:'SESS',eaglesfree_name:'Андрей Чулков',eaglesfree_last_activity:String(Date.now()),eaglesfree_plan:opt.plan||'pro'},opt.ls||{}),ss:opt.lock?{}:{eg_pin_ok:ID}});
  const p=await ctx.newPage();const log=[],errs=[],nav=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|fonts|ERR_/.test(m.text()))errs.push(m.text())});
  p.on('framenavigated',f=>{if(f===p.mainFrame())nav.push(f.url())});
  await ctx.route(/app\.eaglesteam\.ru\/profile\.html/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html'}));
  await ctx.route(/app\.eaglesteam\.ru\/(karty|contacts|binar|marketing|obuchenie|kanal|chat)\.html|lure\.eaglesteam\.ru|app\.eaglesteam\.ru\/games\/vzlet/,r=>{if(r.request().resourceType()==='document'||r.request().resourceType()==='iframe')return r.fulfill({body:'<h1>OTHER</h1>',contentType:'text/html'});return r.continue()});
  await ctx.route(/functions\.yandexcloud\.net/,async r=>{const u=new URL(r.request().url());const q=Object.fromEntries(u.searchParams);delete q._;log.push(q.action||q.type);
    let a=q.action,res={ok:false};
    const pro=(opt.plan||'pro')==='pro';
    if(a==='me')res={ok:true,name:'Андрей Чулков',plan:pro?'pro':'free',paidUntil:pro?Date.UTC(2026,11,31):0,tg:'andrey_ch',max:'',openAt:0,price:199};
    if(a==='candidates_load')res={ok:true,data:JSON.stringify({candidates:{a:{name:'X'},b:{name:'Y'}}})};
    if(a==='last_activation')res={ok:false};
    if(a==='partners_list')res={ok:true,partners:opt.empty?[]:[{n:1,name:'Пётр Иванов',at:Date.UTC(2026,10,2),touches:7},{n:2,name:'Мария Сидорова',at:Date.UTC(2026,10,5),touches:3}]};
    if(a==='chat_unread')res={ok:true,n:3};
    if(a==='kop_get')res={ok:true,base:5000,frozen:0,free:5000,dreams:[]};
    if(a==='game_me')res={ok:true,played:true,best:150};
    if(a==='pin_state')res={ok:true,has:true,blocked:false};
    await new Promise(z=>setTimeout(z,120));r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(res)})});
  await p.goto('https://app.eaglesteam.ru/profile.html'+(opt.q||'')).catch(e=>errs.push('goto '+e.message));await p.waitForTimeout(opt.wait||3500);
  return {ctx,p,log,errs,nav};
}
function dom(p){return p.evaluate(()=>{
  const w=document.querySelector('#loggedInBlock .wrap');
  const kids=[...w.children].filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return (e.id||e.className)+' @'+Math.round(r.top)+' h'+Math.round(r.height)});
  const vis=s=>{const e=document.querySelector(s);if(!e)return 'none';const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return cs.display==='none'||cs.visibility==='hidden'||r.width===0?'hidden':Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)};
  const sel=['#egLogo','.pfn-dust','#eg-game-btn','#editNameLink','#nameDisplay','#pfChip','#pfMeta','#glassBlock','.pfn-steps','#kontaktyVB','#lureVB','#openMap','.pfn-stage','#openChat','#openKop','#chatN','#pfnGame','#binarBlock','#bnInviteBtn','#partnersBlock','#planBox','.pfn-card','.tabbar','.foot','#egp','#egpZ','#noLoginBlock'];
  const V={};sel.forEach(s=>V[s]=vis(s));
  return {kids,V,text:w.innerText.replace(/\s+/g,' ').trim(),pfMeta:document.getElementById('pfMeta').textContent,cls:document.documentElement.className,bodyKids:[...document.body.children].filter(e=>e.tagName!=='SCRIPT'&&e.tagName!=='STYLE').map(e=>e.tagName+'#'+e.id+'.'+(typeof e.className==='string'?e.className:'')+(getComputedStyle(e).display==='none'||e.hidden?'(h)':''))};
})}
const R={};
(async()=>{const b=await chromium.launch();
 let t=await page(b,{});
 await t.p.screenshot({path:`P-${TAG}-pro.png`,fullPage:true});
 R.pro=await dom(t.p);R.pro.log=t.log;R.pro.errs=t.errs;
 // clicks
 const click=async(sel,w=900)=>{await t.p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center'}),sel);await t.p.waitForTimeout(150);await t.p.locator(sel).first().click({timeout:3000}).catch(e=>R['err'+sel]=e.message.slice(0,100));await t.p.waitForTimeout(w);};
 await click('#openChat');R.chatOpen=await t.p.evaluate(()=>({on:document.getElementById('egChw').classList.contains('on'),src:document.getElementById('egChf').getAttribute('src')}));
 await t.p.screenshot({path:`P-${TAG}-chat.png`});
 await t.p.evaluate(()=>{document.getElementById('egChw').classList.remove('on');document.documentElement.style.overflow=''});
 await click('#openKop');R.kopOpen=await t.p.evaluate(()=>{const k=document.querySelector('.kp');return k?!k.hidden:'none'});
 await t.p.screenshot({path:`P-${TAG}-kop.png`});
 await t.ctx.close();
 t=await page(b,{});await click('#editNameLink');R.editOpen=await t.p.evaluate(()=>getComputedStyle(document.getElementById('nameEditBlock')).display);await t.ctx.close();
 t=await page(b,{});await click('#pfRenew');R.pkg=await t.p.evaluate(()=>document.getElementById('pkOv').classList.contains('on'));await t.p.screenshot({path:`P-${TAG}-pkg.png`});await t.ctx.close();
 t=await page(b,{});await click('#openMap',1500);R.mapNav=t.nav.slice(1);await t.ctx.close();
 t=await page(b,{});await click('#pfnGame',2500);R.gameNav=t.nav.slice(1);R.gameBody=await t.p.evaluate(()=>document.body.children.length+' '+document.documentElement.style.overflow+' '+!!document.querySelector('iframe[src*="vzlet"]')).catch(()=>'nav');await t.p.screenshot({path:`P-${TAG}-game.png`});await t.ctx.close();
 t=await page(b,{});R.hrefs=await t.p.evaluate(()=>[...document.querySelectorAll('#kontaktyVB,#lureVB,#binarBlock a,.tabbar a')].map(a=>a.getAttribute('href')));await t.ctx.close();
 // free + empty
 t=await page(b,{plan:'free',empty:true});
 await t.p.screenshot({path:`P-${TAG}-free.png`,fullPage:true});
 R.free=await dom(t.p);R.free.errs=t.errs;
 await click('#pfGoPro');R.pkgFree=await t.p.evaluate(()=>document.getElementById('pkOv').classList.contains('on'));
 await t.ctx.close();
 // PIN locked
 t=await page(b,{lock:true});
 await t.p.screenshot({path:`P-${TAG}-pin.png`});
 R.pin=await t.p.evaluate(()=>({egp:!document.getElementById('egp').hidden,pad:!document.getElementById('egpPad').hidden}));R.pin.errs=t.errs;
 await t.ctx.close();
 // no login
 const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 await ctx.route(/app\.eaglesteam\.ru\/profile\.html/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html'}));
 await ctx.route(/functions\.yandexcloud\.net/,r=>r.fulfill({contentType:'application/json',body:'{"ok":false}'}));
 await ctx.route(/app\.eaglesteam\.ru\/(\?.*)?$/,r=>r.fulfill({body:'<h1>MAIN</h1>',contentType:'text/html'}));
 await p.goto('https://app.eaglesteam.ru/profile.html');await p.waitForTimeout(2500);R.nologin={url:p.url(),txt:(await p.evaluate(()=>document.body.innerText)).slice(0,200)};
 await ctx.close();
 fs.writeFileSync(`R-${TAG}.json`,JSON.stringify(R,null,1));await b.close();
})();
