# Карты v53 (26.11.2026): будильники передаются в приложение (eagles://alarms?d=...), оно заводит их в телефоне само (APK 1.19+). Ставится поверх v52.
import sys
f = sys.argv[1]; S = open(f, encoding='utf8').read()
if 'egAl53' in S: sys.exit('STOP: v53 уже стоит')
if 'alarmoff' not in S: sys.exit('STOP: нет v52')
BLOCK = r'''<script id="egAl53">
(function(){
  function inApp(){try{return sessionStorage.getItem('eg_in_app')==='1'||document.referrer.indexOf('android-app://ru.eaglesteam.app')===0||(/Android/i.test(navigator.userAgent)&&matchMedia('(display-mode: standalone)').matches)}catch(_){return false}}
  var sent=null,tm=0;
  function b64(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function list(){var n=Date.now()+5000,out=[],cnt=0;(window.AL50||[]).forEach(function(a){if(!a||!a.rf)return;var at=[];for(var k=0;k<=(a.rp||0);k++){var t=a.rf+k*(a.ri||3)*60000;if(t>n&&cnt<30){at.push(t);cnt++}}if(at.length)out.push({id:a.id,t:String(a.t||'Будильник').slice(0,80),at:at})});return out}
  function sync(){if(!inApp())return;var L=list(),s=JSON.stringify(L);if(s===sent)return;if(!L.length&&sent===null&&!window.__al53del)return;sent=s;try{location.href='eagles://alarms?d='+b64(s)}catch(_){}}
  window.al53sync=sync;
  function hook(){var o=window.al50ui;if(typeof o!=='function'||o.__a53)return false;var w=function(){var r=o.apply(this,arguments);clearTimeout(tm);tm=setTimeout(sync,400);return r};w.__a53=1;window.al50ui=w;return true}
  if(!hook()){var i=0,h=setInterval(function(){if(hook()||++i>40)clearInterval(h)},250)}
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('#al50l'))window.__al53del=1},true);
  setTimeout(sync,2500);
})();
</script>
'''
S = S + '\n' + BLOCK if '</body>' not in S else S.replace('</body>', BLOCK + '</body>', 1)
open(f, 'w', encoding='utf8').write(S); print('v53 OK')
