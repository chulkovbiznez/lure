# Будильник Карт (26.11.2026): sw.js сайта (корень app.eaglesteam.ru/sw.js). Запуск: python3 sw-rem.py sw.js
# Уведомление «⏰ …» с tag rem-<ID>-<ключ>: висит до нажатия, кнопки «Отложить 10 мин» и «Готово».
import sys
f = sys.argv[1]; S = open(f, encoding='utf8').read()
if 'rem_snooze' in S: sys.exit('STOP: sw.js уже с будильником')
def rep(old, new, name):
    global S
    if S.count(old) != 1: sys.exit('STOP: якорь "%s" найден %d раз' % (name, S.count(old)))
    S = S.replace(old, new)
rep("  if(ring)o.requireInteraction=true;\n",
    "  if(ring)o.requireInteraction=true;\n"
    "  if(/^rem-/.test(d.tag||'')){o.requireInteraction=true;o.vibrate=[400,200,400,200,400];o.data.tag=d.tag;o.data.t=String(d.title||'').replace(/^\\u23F0\\s*/,'');\n"
    "    o.actions=[{action:'snz',title:'Отложить 10 мин'},{action:'ok',title:'Готово'}];}\n", 'push')
rep("self.addEventListener('notificationclick',function(e){\n  e.notification.close();var u=(e.notification.data&&e.notification.data.url)||'/';\n",
    "self.addEventListener('notificationclick',function(e){\n  e.notification.close();var u=(e.notification.data&&e.notification.data.url)||'/';\n"
    "  /* будильник Карт 26.11: «Отложить 10 мин» — без открытия сайта; «Готово» — открыть дело и отметить */\n"
    "  var nd=e.notification.data||{},rm=/^rem-(\\d+)-([0-9a-f]{16})$/.exec(nd.tag||'');\n"
    "  if(rm&&e.action==='snz'){var b=new URLSearchParams();b.append('id',rm[1]);b.append('u',u);b.append('t',nd.t||'');b.append('k',rm[2]);\n"
    "    e.waitUntil(fetch('https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip?type=rem_snooze',{method:'POST',body:b}).catch(function(){}));return;}\n"
    "  if(rm&&e.action==='ok')u=u+'&ok';\n", 'click')
open(f, 'w', encoding='utf8').write(S); print('SW OK')
