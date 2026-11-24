# KARTY v48b (24.11): на телефоне (Chrome Android) видео открывалось размытым — backdrop-filter размывал и сам ролик.
# Теперь размываем не через backdrop-filter, а саму страницу под окном (filter:blur на детях body), ролик чёткий.
import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'egVid48b' in s: sys.exit('УЖЕ v48b')
def rep(a,b):
    global s
    n=s.count(a)
    if n!=1: sys.exit(f'НЕ НАЙДЕНО ({n}): {a[:60]}')
    s=s.replace(a,b)
rep('#vid48 .bg{position:absolute;inset:0;background:rgba(5,4,6,.5);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0}',
    '#vid48 .bg{position:absolute;inset:0;background:rgba(5,4,6,.45);opacity:0}/*egVid48b*/.v48blur{transition:filter .45s ease;filter:blur(12px)!important}.v48unblur{transition:filter .45s ease}')
rep('transform-origin:0 0;will-change:transform,opacity}','transform-origin:0 0;z-index:2}')
rep("var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;",
    "var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;"
    "function blur(on){[].forEach.call(document.body.children,function(el){if(el===ov||el.tagName==='SCRIPT'||el.tagName==='STYLE')return;if(on){el.classList.remove('v48unblur');el.classList.add('v48blur')}else{el.classList.add('v48unblur');el.classList.remove('v48blur')}})}")
rep("ov.classList.add('on');","ov.classList.add('on');blur(true);")
rep("bg.animate([{opacity:1},{opacity:0}],{duration:d,fill:'forwards'});","bg.animate([{opacity:1},{opacity:0}],{duration:d,fill:'forwards'});blur(false);")
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО v48b md5',hashlib.md5(s.encode('utf-8')).hexdigest())
