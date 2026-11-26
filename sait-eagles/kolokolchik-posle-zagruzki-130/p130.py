# Задание 130 (26.11.2026): profile.html
# 1) колокольчик звенит только после того, как экран загрузки EAGLES исчез;
# 2) в приложении/при первом открытии экран загрузки сразу с логотипом (без появления из темноты 0,8 с) — убирает «чёрную паузу».
# Вход: живой profile.html md5 d705cdd6. python3 p130.py profile.html profile-130.html
import sys
s=open(sys.argv[1],encoding='utf-8').read()
a="document.documentElement.classList.add('egz0');document.write('<style id=\"egZ0s\">html.egz0 #egpZ[hidden]{display:flex!important}html.egz0,html.egz0 body{background:#070708!important}</style>')"
assert s.count(a)==1
b="document.documentElement.classList.add('egz0','egnoin');document.write('<style id=\"egZ0s\">html.egz0 #egpZ[hidden]{display:flex!important}html.egz0,html.egz0 body{background:#070708!important}html.egnoin .zgr-lg{animation:zgrFloat 4.2s ease-in-out infinite!important}html.egnoin .zgr-bar{animation:none!important}html.egnoin .zgr-lg::after{animation-delay:0s!important}</style>')"
s=s.replace(a,b)
c="if (pinOpen()) return setTimeout(wait, 200);"
assert s.count(c)==1
s=s.replace(c,"if (pinOpen() || zgrOn()) return setTimeout(wait, 200);")
d="function pinOpen() {"
assert s.count(d)==1
s=s.replace(d,"function zgrOn() { var z = document.getElementById('egpZ'); return !!(z && (!z.hidden || document.documentElement.classList.contains('egz0'))); } /* 26.11 egBell130: звенит только после экрана загрузки */\n  function pinOpen() {")
open(sys.argv[2],'w',encoding='utf-8').write(s)
