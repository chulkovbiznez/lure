# 127: экран загрузки EAGLES при открытии профиля (приложение / первый заход за сессию) до полной готовности страницы
import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egBoot127' not in s
anchor="try{zgrShow()}catch(e){}}}catch(e){document.getElementById('egp').hidden=true;}})();</script>"
assert s.count(anchor)==1
blk=("\n<script id=\"egBoot127\">/* 26.11 egBoot127: в приложении и при первом открытии за сессию — экран загрузки EAGLES с полоской, "
"пока страница и все запросы не закончатся (макс. 8 с). Если нужен ПИН — работает старый экран ПИН. */"
"(function(){try{var id=localStorage.getItem('eaglesfree_id'),ss=localStorage.getItem('eaglesfree_session');"
"var app=/[?&]app=android/.test(location.search)||sessionStorage.getItem('eg_in_app')==='1';"
"var first=!sessionStorage.getItem('egb127');if(!id||!ss||!(app||first))return;sessionStorage.setItem('egb127','1');"
"if(sessionStorage.getItem('eg_pin_ok')!==id)return;zgrShow();"
"var t0=Date.now(),n=0,last=t0,on=1,of=window.fetch;"
"if(of)window.fetch=function(){if(!on)return of.apply(this,arguments);n++;last=Date.now();var p=of.apply(this,arguments);"
"function d(){n--;last=Date.now()}p.then(d,d);return p};"
"function chk(){var now=Date.now();if((document.readyState==='complete'&&n<=0&&now-last>450&&now-t0>800)||now-t0>8000){on=0;try{zgrDone()}catch(e){}}else setTimeout(chk,120)}chk();"
"}catch(e){}})();</script>")
s=s.replace(anchor,anchor+blk,1)
open(dst,'w',encoding='utf-8').write(s)
print('ok')
