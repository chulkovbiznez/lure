/* egPwa4: приложение EAGLES (PWA) — 25.11.2026. v4: экран «3 шага» при первом запуске приложения (задание 124). v2: + уведомления (egPush1, задание 122). v3: ПИН держится час, шторка чистится (задание 123).
   1) регистрирует /sw.js; 2) в приложении ставит на <html> класс egapp;
   3) на Android в Профиле показывает плашку «Установить приложение EAGLES»
      (только вошедшим, не в приложении, «Не сейчас» прячет на 7 дней). iPhone не трогаем. */
(function(){try{
var d=document.documentElement, KEY='eg_pwa_skip', ev=null;
var app=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
/* Android-приложение (TWA) открывает /?app=android: помним в этой вкладке (sessionStorage), «Установить» внутри приложения не зовём */
try{if(/[?&]app=android/.test(location.search)||document.referrer.indexOf('android-app://ru.eaglesteam.app')===0)sessionStorage.setItem('eg_in_app','1');if(sessionStorage.getItem('eg_in_app')==='1')app=true;}catch(e){}
if(app)d.classList.add('egapp');
if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});
function logged(){try{return (localStorage.getItem('eaglesfree_session')||'').length>20;}catch(e){return false;}}
function skipped(){try{var t=+localStorage.getItem(KEY)||0;return Date.now()-t<7*864e5;}catch(e){return false;}}
function onProfile(){return /\/profile(\.html)?$/.test(location.pathname);}
function css(){if(document.getElementById('egPwaCss'))return;var s=document.createElement('style');s.id='egPwaCss';s.textContent=
'#egPwa{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:99990;max-width:436px;margin:0 auto;'+
'background:linear-gradient(180deg,#1b1812,#111009);border:1px solid rgba(224,180,74,.45);border-radius:20px;padding:14px;display:flex;gap:12px;align-items:center;'+
'box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.4) inset;font-family:Montserrat,system-ui,-apple-system,sans-serif;color:#f1ece2;'+
'transform:translateY(140%);opacity:0;transition:transform .45s cubic-bezier(.2,.9,.25,1.15),opacity .3s}'+
'#egPwa.on{transform:none;opacity:1}'+
'#egPwa img{width:52px;height:52px;border-radius:14px;flex:none;box-shadow:0 0 24px rgba(224,180,74,.25)}'+
'#egPwa .t{flex:1;min-width:0}#egPwa b{display:block;font-size:15px;line-height:1.25}#egPwa span{display:block;font-size:12.5px;color:#a59c8c;margin-top:3px;line-height:1.35}'+
'#egPwa .bt{display:flex;flex-direction:column;gap:6px;flex:none}'+
'#egPwa button{border:0;border-radius:12px;font:800 13.5px Montserrat,system-ui,sans-serif;padding:10px 14px;cursor:pointer}'+
'#egPwa .y{color:#1d1a14;background:linear-gradient(180deg,#f7dc85,#c9971f);box-shadow:0 4px 14px rgba(224,180,74,.3)}'+
'#egPwa .n{background:none;color:#a59c8c;padding:4px 6px;font-weight:600;font-size:12px}'+
'html.egd #egPwa{left:auto;right:24px;bottom:24px}';
document.head.appendChild(s);}
function show(){
  if(app||document.getElementById('egPwa')||!onProfile()||!logged()||skipped())return;
  css();var b=document.createElement('div');b.id='egPwa';b.setAttribute('role','dialog');b.setAttribute('aria-label','Установить приложение EAGLES');
  b.innerHTML='<img src="/egpwa/icon-192.png" alt=""><div class="t"><b>Приложение EAGLES</b><span>Иконка на экране телефона, открывается в один тап</span></div>'+
    '<div class="bt"><button class="y" type="button">Установить</button><button class="n" type="button">Не сейчас</button></div>';
  document.body.appendChild(b);requestAnimationFrame(function(){requestAnimationFrame(function(){b.classList.add('on');});});
  b.querySelector('.y').onclick=function(){if(!ev)return hide();ev.prompt();ev.userChoice.then(function(r){if(r&&r.outcome==='accepted')hide();else hide(true);ev=null;});};
  b.querySelector('.n').onclick=function(){hide(true);};
}
function hide(skip){if(skip){try{localStorage.setItem(KEY,String(Date.now()));}catch(e){}}var b=document.getElementById('egPwa');if(!b)return;b.classList.remove('on');setTimeout(function(){b.remove();},450);}
addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;setTimeout(show,2500);});
addEventListener('appinstalled',function(){hide();});
window.egPwaShow=function(){show();};/* для проверки */
/* ---- egPush1: уведомления (задание 122). Плашка «Включить уведомления» в Профиле; подписка уходит на сервер (push_sub) ---- */
var API='https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip', PKEY='eg_push_skip', PSYNC='eg_push_sync';
function sess(){try{return localStorage.getItem('eaglesfree_session')||'';}catch(e){return '';}}
function me(){try{return localStorage.getItem('eaglesfree_id')||'';}catch(e){return '';}}
function canPush(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;}
function api(q){return fetch(API+'?'+q+'&sess='+encodeURIComponent(sess()),{cache:'no-store'}).then(function(r){return r.json();});}
function u8(k){var s=k.replace(/-/g,'+').replace(/_/g,'/');s+='===='.slice(s.length%4||4);var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a;}
function subscribe(){
  return navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(){return navigator.serviceWorker.ready;}).then(function(reg){
    return reg.pushManager.getSubscription().then(function(old){
      if(old)return old;
      return api('action=push_key').then(function(r){if(!r||!r.ok||!r.key)throw new Error('nokey');return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(r.key)});});
    });
  }).then(function(sub){
    return api('action=push_sub&sub='+encodeURIComponent(JSON.stringify(sub))).then(function(r){
      if(r&&r.ok){try{localStorage.setItem(PSYNC,me()+':'+Date.now());}catch(e){}}return r;});
  });
}
function pskipped(){try{return Date.now()-(+localStorage.getItem(PKEY)||0)<7*864e5;}catch(e){return false;}}
function pshow(){
  if(!canPush()||Notification.permission!=='default'||!onProfile()||!logged()||pskipped())return;
  if(document.getElementById('egOnb')||(app&&inTwa()&&!onbDone()))return; /* v4: в приложении уведомления включает экран шагов */
  if(document.getElementById('egPwa'))return; /* сначала плашка «Установить», уведомления — потом */
  css();var b=document.createElement('div');b.id='egPwa';b.className='push';b.setAttribute('role','dialog');b.setAttribute('aria-label','Включить уведомления');
  b.innerHTML='<img src="/egpwa/icon-192.png" alt=""><div class="t"><b>Включить уведомления</b><span>Сообщения EYE, заявки в друзья и новые партнёры сразу на телефон</span></div>'+
    '<div class="bt"><button class="y" type="button">Включить</button><button class="n" type="button">Не сейчас</button></div>';
  document.body.appendChild(b);requestAnimationFrame(function(){requestAnimationFrame(function(){b.classList.add('on');});});
  b.querySelector('.y').onclick=function(){
    var y=this;y.disabled=true;y.textContent='…';
    Notification.requestPermission().then(function(p){
      if(p==='granted')return subscribe().then(function(){y.textContent='Готово ✓';setTimeout(function(){hide();},900);});
      try{localStorage.setItem(PKEY,String(Date.now()));}catch(e){}hide();
    }).catch(function(){y.disabled=false;y.textContent='Включить';});
  };
  b.querySelector('.n').onclick=function(){try{localStorage.setItem(PKEY,String(Date.now()));}catch(e){}hide();};
}
/* уже разрешено: раз в сутки (и при смене аккаунта) обновляем подписку на сервере */
function psync(){
  if(!canPush()||Notification.permission!=='granted'||!logged())return;
  var v='';try{v=localStorage.getItem(PSYNC)||'';}catch(e){}
  var a=v.split(':');if(a[0]===me()&&Date.now()-(+a[1]||0)<864e5)return;
  subscribe().catch(function(){});
}
addEventListener('load',function(){setTimeout(function(){psync();pshow();},app?1500:4500);});
window.egPushShow=function(){try{localStorage.removeItem(PKEY);}catch(e){}pshow();};

/* v3 (25.11.2026, задание 123): 1) ПИН не спрашивается снова 1 час после последнего использования EAGLES (Андрей: «пускай час держится»):
   отметка eg_pin_t = ID:время, её читает строка в начале profile/binar/karty; 2) открыл EAGLES — его уведомления в шторке убираются, цифра на значке гаснет. */
var PT='eg_pin_t';
function pinKeep(){try{var id=localStorage.getItem('eaglesfree_id');if(!localStorage.getItem('eaglesfree_session')){localStorage.removeItem(PT);return;}if(id&&sessionStorage.getItem('eg_pin_ok')===id)localStorage.setItem(PT,id+':'+Date.now());}catch(e){}}
function clearNotes(){if(document.hidden||!('serviceWorker' in navigator))return;navigator.serviceWorker.ready.then(function(r){return r.getNotifications();}).then(function(ns){ns.forEach(function(n){n.close();});}).catch(function(){});}
addEventListener('load',function(){pinKeep();setTimeout(clearNotes,800);});
document.addEventListener('visibilitychange',function(){if(document.hidden)pinKeep();else clearNotes();});
addEventListener('pagehide',pinKeep);
setInterval(pinKeep,60000);

/* v4 (25.11.2026, задание 124): первый запуск Android-приложения — экран «3 шага»: уведомления → камера и микрофон → не усыплять EAGLES (шаг 3 — только в приложении 1.2+,
   оно открывается с ?app=android&v=12). Показывается один раз (eg_onb_done) в Профиле, после входа и ПИН. Уже выданные разрешения пропускаются. */
try{var av=(location.search.match(/[?&]v=(\d+)/)||[])[1];if(av&&/[?&]app=android/.test(location.search))sessionStorage.setItem('eg_app_v',av);}catch(e){}
function appV(){try{return +sessionStorage.getItem('eg_app_v')||0;}catch(e){return 0;}}
function onbDone(){try{return localStorage.getItem('eg_onb_done')==='1';}catch(e){return true;}}
function inTwa(){try{return sessionStorage.getItem('eg_in_app')==='1';}catch(e){return false;}}
function pinOpen(){var p=document.getElementById('egp');return !!(p&&!p.hidden&&getComputedStyle(p).display!=='none');}
function permQ(n){try{return navigator.permissions.query({name:n}).then(function(r){return r.state;}).catch(function(){return 'prompt';});}catch(e){return Promise.resolve('prompt');}}
var IC={n:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',c:'<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',b:'<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/><path d="M11 9l-2 3h4l-2 3"/>'};
function onbCss(){if(document.getElementById('egOnbCss'))return;var s=document.createElement('style');s.id='egOnbCss';s.textContent=
'#egOnb{position:fixed;inset:0;z-index:99995;display:flex;flex-direction:column;align-items:center;padding:calc(28px + env(safe-area-inset-top,0px)) 26px calc(30px + env(safe-area-inset-bottom,0px));color:#f4f2ee;font-family:Montserrat,system-ui,sans-serif;'+
'background:radial-gradient(420px 360px at 50% 30%,rgba(255,170,40,.20),transparent 70%),linear-gradient(180deg,#120d07,#070708 70%);opacity:0;transition:opacity .35s}#egOnb.on{opacity:1}'+
'#egOnb .tp{display:flex;align-items:center;justify-content:space-between;align-self:stretch;max-width:440px;width:100%}#egOnb .ds{display:flex;gap:7px}#egOnb .ds i{width:28px;height:5px;border-radius:3px;background:rgba(255,255,255,.12)}#egOnb .ds i.on{background:linear-gradient(90deg,#ffe27a,#e0a42a)}'+
'#egOnb .st{font:700 12px Montserrat,sans-serif;color:#8d857a}#egOnb .lg{width:72px;height:72px;border-radius:20px;margin-top:18px;box-shadow:0 0 40px rgba(224,180,74,.35)}'+
'#egOnb .ic{width:min(150px,34vw);height:min(150px,34vw);border-radius:50%;margin:5vh 0 26px;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,rgba(255,210,63,.25),rgba(255,210,63,.04) 70%);border:1.5px solid rgba(255,210,63,.45);box-shadow:0 0 60px rgba(255,180,40,.18)}'+
'#egOnb .ic svg{width:42%;height:42%;stroke:#ffd23f;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
'#egOnb h2{font:900 26px/1.2 Montserrat,sans-serif;text-align:center;margin:0;background:linear-gradient(180deg,#fff3c4,#ffd23f 55%,#d9951c);-webkit-background-clip:text;background-clip:text;color:transparent}'+
'#egOnb p{font:500 15px/1.5 Montserrat,sans-serif;color:#b9b0a2;text-align:center;margin:14px 0 0;max-width:360px}#egOnb p b{color:#f4f2ee}#egOnb .sp{flex:1}'+
'#egOnb .y{align-self:stretch;max-width:440px;width:100%;margin:0 auto;border:0;border-radius:18px;padding:18px;font:800 17px Montserrat,sans-serif;color:#2a1702;background:linear-gradient(180deg,#fff1b8,#ffd23f 38%,#f3b230 72%,#d98d16);box-shadow:0 10px 28px rgba(255,180,40,.3);cursor:pointer}'+
'#egOnb .n{margin-top:12px;background:none;border:0;font:600 14px Montserrat,sans-serif;color:#7d766c;padding:8px 16px;cursor:pointer}'+
'#egOnb .ok{display:flex;flex-direction:column;gap:12px;align-self:stretch;max-width:440px;width:100%;margin:26px auto 0}#egOnb .ok div{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,210,63,.18);font:700 15px Montserrat,sans-serif}'+
'#egOnb .ok span{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#ffe27a,#d9951c);color:#2a1702;font-weight:900;font-size:14px}#egOnb .ok .off{color:#7d766c}#egOnb .ok .off span{background:rgba(255,255,255,.1);color:#7d766c}';
document.head.appendChild(s);}
function onbStart(){
  if(!app||!inTwa()||onbDone()||!onProfile()||!logged()||document.getElementById('egOnb'))return;
  if(pinOpen()){setTimeout(onbStart,1000);return;}
  Promise.all([canPush()?Promise.resolve(Notification.permission):Promise.resolve('denied'),permQ('camera'),permQ('microphone')]).then(function(r){
    var S=[],res={};
    if(r[0]==='default')S.push('n');else res.n=r[0]==='granted';
    if(r[1]!=='granted'||r[2]!=='granted')S.push('c');else res.c=true;
    if(appV()>=12)S.push('b');
    if(!S.length){try{localStorage.setItem('eg_onb_done','1');}catch(e){}return;}
    var T={n:['Уведомления','Чтобы не пропустить <b>сообщения</b>, <b>звонки EYE</b> и <b>новых партнёров</b> в команде.','Включить'],
           c:['Камера и микрофон','Для <b>видеозвонков EYE</b> с командой и голосовых сообщений.','Разрешить'],
           b:['Не усыплять EAGLES','Иначе телефон «засыпает» приложение, и <b>звонки не доходят</b>, пока его не откроешь.','Разрешить']};
    onbCss();var o=document.createElement('div');o.id='egOnb';o.setAttribute('role','dialog');document.body.appendChild(o);
    document.documentElement.style.overflow='hidden';
    var i=0;
    function next(){i++;draw();}
    function draw(){
      if(i>=S.length)return fin();
      var k=S[i],t=T[k],dots='';for(var j=0;j<S.length;j++)dots+='<i'+(j<=i?' class="on"':'')+'></i>';
      o.innerHTML='<div class="tp"><div class="ds">'+dots+'</div><div class="st">Шаг '+(i+1)+' из '+S.length+'</div></div><img class="lg" src="/egpwa/icon-192.png" alt="">'+
        '<div class="ic"><svg viewBox="0 0 24 24">'+IC[k]+'</svg></div><h2>'+t[0]+'</h2><p>'+t[1]+'</p><div class="sp"></div><button class="y" type="button">'+t[2]+'</button><button class="n" type="button">Позже</button>';
      var y=o.querySelector('.y');
      o.querySelector('.n').onclick=function(){res[k]=false;next();};
      y.onclick=function(){y.disabled=true;y.textContent='…';
        if(k==='n')Notification.requestPermission().then(function(p){res.n=p==='granted';return p==='granted'?subscribe().catch(function(){}):0;}).then(next,next);
        else if(k==='c')navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(function(st){st.getTracks().forEach(function(x){x.stop();});res.c=true;try{localStorage.setItem('eye_perm_ok','1');localStorage.setItem('eye_perm_seen','1');}catch(e){}next();},function(){res.c=false;next();});
        else{res.b=true;var gone=false,f=function(){if(!document.hidden&&gone){document.removeEventListener('visibilitychange',f);next();}else if(document.hidden)gone=true;};
          document.addEventListener('visibilitychange',f);location.href='intent://battery#Intent;scheme=eagles;package=ru.eaglesteam.app;end';
          setTimeout(function(){if(!gone){document.removeEventListener('visibilitychange',f);next();}},2500);}
      };
    }
    function fin(){
      try{localStorage.setItem('eg_onb_done','1');}catch(e){}
      var L={n:'Уведомления',c:'Камера и микрофон',b:'Работа в фоне'},rows='';
      ['n','c','b'].forEach(function(k){if(k in res)rows+='<div'+(res[k]?'':' class="off"')+'><span>'+(res[k]?'✓':'–')+'</span>'+L[k]+(res[k]?'':' · позже')+'</div>';});
      o.innerHTML='<img class="lg" src="/egpwa/icon-192.png" alt="" style="width:96px;height:96px;border-radius:26px;margin-top:5vh"><h2 style="margin-top:30px;font-size:30px">Готово!</h2>'+
        '<p>EAGLES настроен. Теперь всё приходит <b>сразу, со звуком и поверх экрана</b>.</p><div class="ok">'+rows+'</div><div class="sp"></div><button class="y" type="button">Войти в EAGLES</button>';
      o.querySelector('.y').onclick=function(){o.classList.remove('on');document.documentElement.style.overflow='';setTimeout(function(){o.remove();},380);};
    }
    draw();requestAnimationFrame(function(){requestAnimationFrame(function(){o.classList.add('on');});});
  });
}
addEventListener('load',function(){setTimeout(onbStart,1200);});
window.egOnbShow=function(){try{localStorage.removeItem('eg_onb_done');}catch(e){}onbStart();};

}catch(e){}})();
