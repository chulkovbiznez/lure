# 126: карусель на странице регистрации — актуальные продукты (26.11.2026)
import sys,re,base64
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egKar126' not in s
a=s.index('id="gCf"'); b=s.index('id="gArL"',a)
head,sec,tail=s[:a],s[a:b],s[b:]
def img(n): return 'data:image/webp;base64,'+base64.b64encode(open('img/%s.webp'%n,'rb').read()).decode()
def art(title):
    i=sec.index('<h3>'+title); st=sec.rindex('<article class="pc">',0,i); en=sec.index('</article>',i)+len('</article>'); return st,en
def put(title,new):
    global sec
    st,en=art(title); sec=sec[:st]+new+sec[en:]
def shot(n): return '<div class="vis shot"><img src="%s" alt="" loading="lazy" decoding="async"></div>'%img(n)
# 1) Чат с командой -> EYE
put('Чат с командой','<article class="pc">'+shot('eye')+'<h3>EYE</h3><b class="hk">Звонки и чаты команды</b><p>Видеозвонки до 4 человек, чаты и объявления для своей команды. Звонок дойдёт, даже когда приложение закрыто.</p></article>')
# 2) Мои контакты, Календарь — свежие экраны
for t,n in [('Мои контакты','kontakty'),('Календарь касаний','kalendar')]:
    st,en=art(t); a2=sec[st:en]; a2=re.sub(r'<div class="vis shot"><img src="data:[^"]+"',lambda m:'<div class="vis shot"><img src="%s"'%img(n),a2,count=1); sec=sec[:st]+a2+sec[en:]
# 3) EYRIE: СКОРО -> PRO, свежий экран
put('EYRIE','<article class="pc">'+shot('eyrie')+'<h3>EYRIE <span class="tg">PRO</span></h3><b class="hk">Твой собственный канал</b><p>Свой канал внутри EAGLES: посты, ролики, подписчики и кнопка «Вступить в команду». Кто пришёл по ссылке твоего канала, встаёт под тебя.</p></article>')
# 4) Обучение: PRO -> СКОРО (для всех, старт в декабре)
put('Обучение','<article class="pc">'+shot('obuchenie')+'<h3>Обучение <span class="tg soon">СКОРО</span></h3><b class="hk">Нейросети и сетевой по шагам</b><p>Уроки от Андрея: нейросети для контента и ответов кандидатам, сетевой маркетинг и монтаж. Старт в декабре, вместе с EAGLES.</p></article>')
# 5) Карты: убрать старые стандартные картинки (их больше нет), оставить логотип КАРТЫ
st,en=art('Карты EAGLES'); a2=sec[st:en]
logo=re.search(r'<img class="kfl" src="(data:[^"]+)"',a2).group(1)
a2=re.sub(r'<div class="vis kfan">.*?<span class="kfcap">[^<]*</span></div>','<div class="vis kfan egKar126" style="display:flex;align-items:center;justify-content:center"><img class="kfl" src="%s" alt="" style="position:static;inset:auto;transform:none;width:auto;height:78%%;max-width:92%%;margin:0 0 18px;object-fit:contain;animation:none"><span class="kfcap">Своё фото или картинка из LURE</span></div>'%logo,a2,count=1,flags=re.S)
sec=sec[:st]+a2+sec[en:]
s=head+sec+tail
s=s.replace('</head>','<!-- egKar126: карусель обновлена 26.11.2026 -->\n</head>',1)
open(dst,'w',encoding='utf-8').write(s)
print('ok')
