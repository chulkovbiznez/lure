const {chromium}=require('playwright');const fs=require('fs');
const DIR=process.argv[2], TAG=process.argv[3], ONLY=process.argv[4];
const ID='23456';
const td=new Date(),p2=v=>('0'+v).slice(-2),T=td.getFullYear()+'-'+p2(td.getMonth()+1)+'-'+p2(td.getDate());
const STORE={candidates:{c1:{name:'Пётр Иванов',status:'became_partner',nextTouch:T,phone:'+79990000001'},c2:{name:'Мария Сидорова',status:'thinking',nextTouch:'2026-11-01'},c3:{name:'Олег',status:'not_watched',nextTouch:'2026-12-20'}},logs:{[T]:{touches:2,candidateIds:['c1','c2']}}};
async function page(b,name,opt={}){
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await ctx.addInitScript(o=>{try{if(sessionStorage.getItem('__i'))return;sessionStorage.setItem('__i','1');for(const k in o)localStorage.setItem(k,o[k]);sessionStorage.setItem('eg_pin_ok',o.eaglesfree_id);}catch(e){}},
    {eaglesfree_id:ID,eaglesfree_session:'S',eaglesfree_name:'Андрей Чулков',eaglesfree_last_activity:String(Date.now()),eaglesfree_plan:'pro',['eaglesfree_kandidaty_'+ID]:JSON.stringify(STORE)});
  const p=await ctx.newPage();const log=[],errs=[],nav=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|fonts|ERR_/.test(m.text()))errs.push(m.text())});
  p.on('framenavigated',f=>{if(f===p.mainFrame())nav.push(f.url())});
  await ctx.route(/app\.eaglesteam\.ru\/(profile|contacts|obuchenie|kanal|roliki|binar|marketing|karty)\.html/,r=>r.fulfill({body:'<h1>OTHER</h1>',contentType:'text/html'}));
  await ctx.route(new RegExp('app\\.eaglesteam\\.ru/'+name+'\\.html'),r=>r.fulfill({body:fs.readFileSync(DIR+'/'+name+'.html'),contentType:'text/html'}));
  await ctx.route(/functions\.yandexcloud\.net/,async r=>{const u=new URL(r.request().url());const q=Object.fromEntries(u.searchParams);log.push(q.action||q.type||'post');
    const R={me:{ok:true,name:'Андрей Чулков',plan:'pro',paidUntil:Date.UTC(2026,11,31)},candidates_load:{ok:true,at:1,data:JSON.stringify(STORE)},
      videos_list:{ok:true,list:[{id:'v1',title:'Мой ролик',url:'https://rutube.ru/video/x'}],limit:15,plan:'pro'},vlinks_stats:{ok:true,links:{}}};
    await new Promise(z=>setTimeout(z,150));r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(R[q.action]||{ok:false})})});
  await p.goto('https://app.eaglesteam.ru/'+name+'.html').catch(e=>errs.push('goto '+e.message));await p.waitForTimeout(3500);
  return {ctx,p,log,errs,nav};
}
const info=p=>p.evaluate(()=>({cls:document.documentElement.className,title:document.title,text:document.body.innerText.replace(/\s+/g,' ').trim(),
  imgs:[...document.querySelectorAll('img[class^="zl-"],img[class^="ktn"],.ktn-st,.ktn-steps i.on,.ktn-sub,.zl-head,.zl-sub,.zl-eyrie')].map(e=>e.className+':'+(e.getBoundingClientRect().height>0)),
  tab:[...document.querySelectorAll('.tabbar a')].map(a=>a.getAttribute('href')+(a.classList.contains('active')?'*':'')),
  h:document.documentElement.scrollHeight}));
const R={};
(async()=>{const b=await chromium.launch();
 for(const name of (ONLY?[ONLY]:['contacts','roliki','obuchenie','binar','kanal'])){
  let t=await page(b,name);
  await t.p.screenshot({path:`S-${TAG}-${name}.png`,fullPage:true});
  R[name]=await info(t.p);R[name].log=t.log;R[name].errs=t.errs;
  if(name==='contacts'){
    const c=async(sel,w=700)=>{await t.p.locator(sel).first().click({timeout:3000}).catch(e=>R[name]['err'+sel]=e.message.slice(0,80));await t.p.waitForTimeout(w);};
    await c('#ktnD');R[name].afterD=(await info(t.p)).text.slice(0,600);
    await c('#ktnD');await c('#ktnP');R[name].afterP=(await info(t.p)).text.slice(0,600);await c('#ktnP');
    await c('#addBtn');R[name].form=await t.p.evaluate(()=>document.getElementById('formZone').innerText.slice(0,200));
    await t.p.screenshot({path:`S-${TAG}-${name}-form.png`});
    await c('#tabBtnCal',1200);R[name].cal=(await t.p.evaluate(()=>document.getElementById('tabCal').innerText.replace(/\s+/g,' ').slice(0,300)));
    await t.p.screenshot({path:`S-${TAG}-${name}-cal.png`});
  }
  await t.ctx.close();
 }
 fs.writeFileSync(`R-${TAG}.json`,JSON.stringify(R,null,1));await b.close();
})();
