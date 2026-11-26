# Задание 131 (26.11.2026): profile.html
# 1) Экран загрузки (#egpZ + его скрипт) переносится в начало <body>, перед экраном ПИН (#egp ~175 КБ),
#    чтобы при первой отрисовке сразу был логотип с полоской, а не чёрный фон.
# 2) Под полоской — проценты загрузки толстыми цифрами Montserrat Black (встроенный шрифт только из цифр и %, 4 КБ),
#    золотой градиент, плавный счёт за полоской, в конце 100 %.
# Вход: живой profile.html md5 dece5bb1. python3 p131.py profile.html dig.woff2 out.html
import sys,base64
s=open(sys.argv[1],encoding='utf-8').read()
b64=base64.b64encode(open(sys.argv[2],'rb').read()).decode()
# 0) большой <style> экрана ПИН/загрузки (~184 КБ, в нём логотип) — из начала <body> в конец <head>:
#    стили в head браузер дочитывает ДО первой отрисовки, поэтому первый кадр уже с логотипом.
b=s.find('<body>');st=s.find('<style>',b);en=s.find('</style>',st)+8
assert 0<st-b<200 and '.egpn{' in s[st:st+300] and '#egpZ,#egp{--zgr-img' in s[st:en]
sty=s[st:en];s=s[:st]+s[en:]
h=s.find('</head>');assert s.count('</head>')==1
s=s[:h]+sty.replace('<style>','<style id="egPinCss131">',1)+'\n'+s[h:]
m=s.find('<!-- ZAGRUZKA-V1');e=s.find('</script>',m)+9
blk=s[m:e]; assert m>0 and blk.count('id="egpZ"')==1 and 'window.zgrDone' in blk
s=s[:m]+s[e:]
anchor='<div class="egpn" id="egp">'
assert s.count(anchor)==1
blk=blk.replace('<div class="zgr-t" hidden></div></div>','<div class="zgr-pc" id="egpZpc">6%</div><div class="zgr-t" hidden></div></div>',1)
assert 'egpZpc' in blk
css=('<style id="egPc131">@font-face{font-family:"EgDig";src:url(data:font/woff2;base64,'+b64+') format("woff2");font-weight:900;font-display:block}'
 '.zgr-pc{margin-top:-24px;font:900 34px/1 "EgDig","Montserrat",system-ui,sans-serif;letter-spacing:1px;font-variant-numeric:tabular-nums;'
 'background:linear-gradient(180deg,#fff1b8 0%,#ffd23f 45%,#ff9a2a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;'
 'filter:drop-shadow(0 0 10px rgba(255,170,40,.45));min-width:3.2em;text-align:center}</style>')
js=('<script id="egPc131j">(function(){try{var Z=document.getElementById("egpZ"),B=Z.querySelector(".zgr-bar i"),T=document.getElementById("egpZpc"),v=6,last=-1;'
 'function f(){if(Z.hidden){v=6;last=-1;T.textContent="6%";return setTimeout(function(){requestAnimationFrame(f)},150)}'
 'var t=parseFloat(B.style.width)||6;v+=(t-v)*(t>=100?.25:.12);if(t-v<.5)v=t;var n=Math.min(100,Math.round(v));if(n!==last){last=n;T.textContent=n+"%"}requestAnimationFrame(f)}'
 'requestAnimationFrame(f)}catch(e){}})();</script>')
s=s.replace(anchor,css+'\n'+blk+'\n'+js+'\n'+anchor,1)
open(sys.argv[3],'w',encoding='utf-8').write(s)
