# Карты v52 (26.11.2026): «Выключить»/«Отложить» на странице глушат будильник приложения 1.18 (eagles://alarmoff). Ставится поверх v51.
import sys
f = sys.argv[1]; S = open(f, encoding='utf8').read()
if 'alarmoff' in S: sys.exit('STOP: v52 уже стоит')
if 'egAl51' not in S: sys.exit('STOP: нет v51')
old = "function closeNotes(id){try{"
if S.count(old) != 1: sys.exit('STOP: якорь closeNotes')
S = S.replace(old, "function closeNotes(id){try{var inApp=false;try{inApp=sessionStorage.getItem('eg_in_app')==='1'||document.referrer.indexOf('android-app://ru.eaglesteam.app')===0||(/Android/i.test(navigator.userAgent)&&matchMedia('(display-mode: standalone)').matches)}catch(_){}if(inApp)setTimeout(function(){try{location.href='eagles://alarmoff'}catch(_){}},0)}catch(_){}try{")
open(f, 'w', encoding='utf8').write(S); print('v52 OK')
