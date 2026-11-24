# KARTY v46 (24.11): убрать встроенные обложки и значки совсем (решение Андрея).
# Остаются только «Своё фото» / «Своя PNG» и «Создать в LURE». Где картинки нет — нейтральная заглушка.
# Данные людей не трогаем: id иконок и обложек в картах остаются, свои фото и свои иконки (my_*) работают.
import sys,re,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'KARTY v46' in s: sys.exit('УЖЕ v46')
PH=("data:image/svg+xml;utf8,"+"<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>"
 "<defs><radialGradient id='g' cx='50%' cy='38%' r='62%'><stop offset='0' stop-color='%23302412'/><stop offset='1' stop-color='%230c0a08'/></radialGradient>"
 "<linearGradient id='r' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23ffe08a'/><stop offset='.5' stop-color='%23d79a22'/><stop offset='1' stop-color='%23ffd23f'/></linearGradient></defs>"
 "<circle cx='128' cy='128' r='112' fill='url(%23g)' stroke='url(%23r)' stroke-width='6'/>"
 "<path d='M128 74 L140 116 L182 128 L140 140 L128 182 L116 140 L74 128 L116 116 Z' fill='url(%23r)' opacity='.9'/></svg>")
# 1) библиотека значков -> одна заглушка (Proxy: любой старый id отдаёт заглушку, свои my_* как раньше)
m=re.search(r'const LIB=\{.*?\};const TEX=\{\};',s,re.S)
if not m: sys.exit('НЕТ LIB')
s=s[:m.start()]+("// KARTY v46: встроенных значков нет\nconst PH46=\""+PH+"\";"
 "const LIB=new Proxy({goal:{n:'Картинка',k:[],src:PH46,a:1}},{get(t,p){if(p in t)return t[p];if(typeof p==='string'&&!p.startsWith('my_'))return t.goal}});const TEX={};")+s[m.end():]
# 2) обложки
m=re.search(r'const COVL=\[.*?\];const COV=\{\};COVL\.forEach\(c=>COV\[c\.id\]=c\);',s,re.S)
if not m: sys.exit('НЕТ COVL')
s=s[:m.start()]+'const COVL=[];const COV={};'+s[m.end():]
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: sys.exit(f'НЕ НАЙДЕНО ({c}): {a[:60]}')
    s=s.replace(a,b)
rep("const BASE10=['calendar','work','money','family','home','gym','study','video','phone','goal'];","const BASE10=[];")
rep("function autoCv(name){","function autoCv(name){return '';")
rep('<div class="cvp" id="cvPick" role="group" aria-label="Обложки EAGLES"></div>','<div class="cvp" id="cvPick" role="group" aria-label="Обложки EAGLES" hidden style="display:none"></div>')
rep('id="nmWhy">Наши обложки оживают при листании. Своё фото стоит без анимации.</div>','id="nmWhy">Поставь своё фото или создай обложку в LURE.</div>')
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО v46 md5',hashlib.md5(s.encode('utf-8')).hexdigest(),'размер',len(s.encode('utf-8')))
