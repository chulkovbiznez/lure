/* egPwa3: приложение EAGLES (PWA) — 25.11.2026. v2: + уведомления (egPush1, задание 122). v3: ПИН держится час, шторка чистится (задание 123).
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

}catch(e){}})();
