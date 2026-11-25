/* egPwa1: приложение EAGLES (PWA), шаг 1 — 25.11.2026.
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
if(app)return;
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
  if(document.getElementById('egPwa')||!onProfile()||!logged()||skipped())return;
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
}catch(e){}})();
