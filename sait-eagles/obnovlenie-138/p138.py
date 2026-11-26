import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egUpd138' not in s
END="}catch(e){}})();"
assert s.rstrip().endswith(END)
BLOCK=r'''
/* egUpd138 (26.11.2026): плашка «Есть новая версия приложения» внизу, только внутри Android-приложения.
   Версия приложения приходит в адресе запуска (&ac=14 с версии 1.13), последняя — в /app/version.json.
   1.13+ обновляется само в 2 нажатия (eagles://update), старые версии скачивают файл как раньше. «Позже» — на сутки. */
try{var ac=(location.search.match(/[?&]ac=(\d+)/)||[])[1];if(ac&&/[?&]app=android/.test(location.search))sessionStorage.setItem('eg_app_ac',ac);}catch(e){}
function appAc(){try{return +sessionStorage.getItem('eg_app_ac')||0;}catch(e){return 0;}}
function updSkip(){try{return Date.now()-(+localStorage.getItem('eg_upd_skip')||0)<864e5;}catch(e){return false;}}
function updBusy(){var z=document.getElementById('egpZ');return !!((z&&(!z.hidden||d.classList.contains('egz0')))||pinOpen()||document.getElementById('egOnb')||document.querySelector('.eg-onb.on'));}
function updStart(){
  if(!inTwa()||!onProfile()||!logged()||updSkip()||document.getElementById('egPwa'))return;
  fetch('/app/version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json();}).then(function(v){
    if(!v||!(+v.code>appAc()))return;
    (function wait(){if(updBusy())return setTimeout(wait,400);
      css();var b=document.createElement('div');b.id='egPwa';b.setAttribute('role','dialog');b.setAttribute('aria-label','Есть новая версия приложения EAGLES');
      b.innerHTML='<img src="/egpwa/icon-192.png" alt=""><div class="t"><b>Есть новая версия '+String(v.name||'').replace(/[^0-9.]/g,'')+'</b><span>'+(v.note?String(v.note).replace(/[<>&]/g,''):'Обнови приложение, это займёт минуту')+'</span></div>'+
        '<div class="bt"><button class="y" type="button">Обновить</button><button class="n" type="button">Позже</button></div>';
      document.body.appendChild(b);requestAnimationFrame(function(){requestAnimationFrame(function(){b.classList.add('on');});});
      function close(){b.classList.remove('on');setTimeout(function(){b.remove();},450);}
      b.querySelector('.n').onclick=function(){try{localStorage.setItem('eg_upd_skip',String(Date.now()));}catch(e){}close();};
      b.querySelector('.y').onclick=function(){close();
        if(appAc()>=14)location.href='intent://update#Intent;scheme=eagles;package=ru.eaglesteam.app;end';
        else location.href='/app/EAGLES.apk?v='+(+v.code||0);};
    })();
  }).catch(function(){});
}
addEventListener('load',function(){setTimeout(updStart,2500);});
'''
i=s.rstrip().rfind(END)
s=s[:i]+BLOCK+'\n'+s[i:]
s=s.replace('/* egPwa4:','/* egPwa5 (+egUpd138 плашка обновления): egPwa4:',1)
open(dst,'w',encoding='utf-8').write(s)
