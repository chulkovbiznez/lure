# Задание 123: в profile/binar/karty — ПИН не спрашивается 1 час после последнего использования (отметку eg_pin_t ставит egpwa/pwa.js v3).
import sys
A='<script src="/egpwa/pwa.js" defer></script>'
S="<script id=\"egPinHour1\">(function(){try{var id=localStorage.getItem('eaglesfree_id'),t=(localStorage.getItem('eg_pin_t')||'').split(':');if(id&&localStorage.getItem('eaglesfree_session')&&t[0]===id&&Date.now()-(+t[1]||0)<36e5)sessionStorage.setItem('eg_pin_ok',id);}catch(e){}})();</script>"
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf8').read()
if 'egPinHour1' in s: print('ALREADY'); sys.exit(0)
assert s.count(A)==1, 'anchor'
i=s.index(A); assert i < s.index("sessionStorage.getItem('eg_pin_ok')"), 'order'
open(dst,'w',encoding='utf8').write(s.replace(A,A+S,1)); print('OK')
