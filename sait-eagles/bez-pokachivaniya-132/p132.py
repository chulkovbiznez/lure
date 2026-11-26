# Задание 132 (26.11.2026): profile.html — в приложении/первом открытии (egnoin) логотип экрана загрузки стоит на месте
# (без покачивания zgrFloat вверх-вниз), только перелив; отступ снизу 50px вместо 6vh —
# тогда заставка приложения (снимок при высоте 840) совпадает с сайтом на любом телефоне. Андрей: «орёл меняет положение то выше то ниже».
# Вход: живой cf2f74d5. python3 p132.py in.html out.html
import sys
s=open(sys.argv[1],encoding='utf-8').read()
a="html.egnoin .zgr-lg{animation:zgrFloat 4.2s ease-in-out infinite!important}"
assert s.count(a)==1
s=s.replace(a,"html.egnoin .zgr-lg{animation:none!important}html.egnoin .zgr{padding-bottom:50px!important}")
open(sys.argv[2],'w',encoding='utf-8').write(s)
