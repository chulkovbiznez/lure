const {chromium}=require('playwright');
(async()=>{
 const js=process.argv[2];
 const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 const mk=async(id)=>{const c=await b.newContext({permissions:['camera','microphone']});
   await c.addInitScript(i=>{localStorage.setItem('eaglesfree_session',i+'x'.repeat(50));},id);
   await c.route('**/eye.js',r=>r.fulfill({path:js,contentType:'application/javascript'}));
   const p=await c.newPage(); p.on('console',m=>{if(m.type()==='error')console.log(id,'ERR',m.text().slice(0,120))}); await p.goto('http://localhost:8000/index.html'); return p;};
 const A=await mk('1'), B=await mk('2');
 await A.waitForTimeout(1500);
 await A.evaluate(()=>EYE.call('2','User 2',false));
 await B.waitForSelector('#eyeYes',{timeout:8000}); await B.click('#eyeYes');
 await A.waitForTimeout(5000);
 const st=p=>p.evaluate(()=>{const v=[...document.querySelectorAll('.eye-tile:not(.me) video')].map(v=>({paused:v.paused,rs:v.readyState,muted:v.muted,tracks:v.srcObject?v.srcObject.getTracks().map(t=>t.kind+(t.muted?':muted':'')).join(','):''}));
   const a=[...document.querySelectorAll('audio')].map(a=>({paused:a.paused,rs:a.readyState,tr:a.srcObject?a.srcObject.getAudioTracks().length:0}));
   return {audioMode:!!document.querySelector('.eye-audio'),q:(document.querySelector('#eyeQ')||{}).textContent,cam:getComputedStyle(document.querySelector('#eyeCam')).display,video:v,audio:a,hasv:document.querySelectorAll('.eye-tile.hasv:not(.me)').length};});
 console.log('A',JSON.stringify(await st(A)));console.log('B',JSON.stringify(await st(B)));
 if(await A.$('#eyeCam') && (await st(A)).cam!=='none'){ await A.click('#eyeCam'); await A.waitForTimeout(4000);
   console.log('after cam A',JSON.stringify(await st(A)));console.log('after cam B',JSON.stringify(await st(B))); await B.screenshot({path:'b.png'});}
 await b.close();
})();
