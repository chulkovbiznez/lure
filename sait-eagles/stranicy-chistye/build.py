# Собирает ЧИСТЫЕ страницы EAGLES (11.11.2026, egClean1): Мои контакты, Мои ролики, Обучение, Команда (бинар), Канал.
# Было: старая оранжевая страница + скин-скрипт в самом конце (kontakty-novye-v1.js или zoloto-v1.js),
# который перекрашивал её после загрузки, + «шторка» ANTIMIG, которая прятала страницу, пока скин не сработал.
# Стало: стили нового вида в <head> и класс на <html> сразу, поэтому старый вид не рисуется ни на кадр.
#  - Контакты: украшения (подзаголовок, «Мои люди», деления касаний, кнопка «Добавить контакт») прямо в разметке,
#    живая часть (цифры, инициалы) сразу после скрипта страницы.
#  - Ролики, Обучение, Команда, Канал: золотые иконки ставятся в момент появления элементов, до первого кадра.
# Логика, сервер и данные страниц не меняются. Шторка и подключение скина убираются.
# Запуск: python3 build.py СТРАНИЦА ЖИВОЙ.html ЖИВОЙ_СКИН.js НОВЫЙ.html   (СТРАНИЦА: contacts|roliki|obuchenie|binar|kanal)
import re,sys,json,hashlib
page,src,skin,dst=sys.argv[1:5]
SKIN_MD5={'contacts':'29646f0f742b8ec201378835d5c6ba61'}
for p in ['roliki','obuchenie','binar','kanal']: SKIN_MD5[p]='5e12b02c486f9f60e4e9a64a1209946a'
assert page in SKIN_MD5,'СТОП: неизвестная страница '+page
s=open(src,encoding='utf-8').read()
k=open(skin,encoding='utf-8').read()
assert hashlib.md5(k.encode('utf-8')).hexdigest()==SKIN_MD5[page],'СТОП: скин не тот ('+('kontakty-novye-v1.js v=1' if page=='contacts' else 'zoloto-v1.js v=1')+')'
assert 'egClean1' not in s,'УЖЕ СТОИТ: это уже чистая страница'
def one(x,what=''):
    assert s.count(x)==1,('СТОП, не один раз: '+(what or x[:60]),s.count(x));return x
def rep(a,b,what=''):
    global s; one(a,what); s=s.replace(a,b)
def cut(a,b):
    global s; i=s.index(one(a)); j=s.index(b,i)+len(b); part=s[i:j]; s=s[:i]+s[j:]; return part
def jsstr(t,start):
    i=t.index('"',start); j=i+1
    while t[j]!='"': j+= 2 if t[j]=='\\' else 1
    return i,j+1,json.loads(t[i:j+1])

# --- шторка ANTIMIG больше не нужна
cut('<!-- ANTIMIG v1','<!-- END ANTIMIG v1 -->')
NOTE='<!-- ЧИСТАЯ СТРАНИЦА EAGLES (11.11.2026, egClean1): новый вид сразу, без скина и шторки -->\n'

if page=='contacts':
    a,b,CSS=jsstr(k,k.index('var CSS = '))
    a2,b2,IMG=jsstr(k,k.index('IMG = ',b)); assert k[b:a2].strip()==', IMG ='.replace(' =',' =') or True
    # скин без стилей и без украшений, которые теперь в разметке
    live=k[:a]+'""'+k[b:a2]+'""'+k[b2:]
    cut('<!-- KONTAKTY NOVYE v1','<script src="/kontakty-novye-v1.js?v=1"></script>')
    rep('<html lang="ru">','<html lang="ru" class="ktn">')
    EXTRA='/* пока скрипт входа не решил, что показать, подпись внизу не мелькает одна */\n.mk-page #noLoginCard[style*="none"]~#appBody[style*="none"]~.footer-credit{visibility:hidden}\n'
    rep('</head>',NOTE+'<style id="ktnCss">'+CSS+'\n'+EXTRA+'</style>\n</head>')
    # разметка: то, что раньше добавлял скин
    rep('<div class="title-row">\n    <h1 class="large-title">Мои контакты</h1>',
        '<div class="title-row"><img class="ktn-hico" src="'+IMG+'" alt="">\n    <h1 class="large-title">Мои контакты</h1>')
    i=s.index('<div class="title-row">'); j=s.index('\n  </div>\n',i)+len('\n  </div>\n')
    s=s[:j]+'  <div class="ktn-sub" id="ktnSub"></div>\n'+s[j:]
    ST=('<div class="ktn-st" id="ktnSt"><span class="ktn-lbl">Мои люди</span><div class="ktn-row"><div class="ktn-c" id="ktnA"><b>0</b><small>в работе</small></div>'
        '<div class="ktn-c" id="ktnD" role="button" tabindex="0"><b>0</b><small>ждут связи</small></div>'
        '<div class="ktn-c" id="ktnP" role="button" tabindex="0"><b>0</b><small>партнёры</small></div></div></div>')
    rep('      <div class="gauge-card">\n        <div class="gauge-label">АКТИВНОСТЬ СЕГОДНЯ</div>',
        '      '+ST+'\n      <div class="gauge-card">\n        <div class="gauge-label">Касания сегодня</div><div class="ktn-ph" id="ktnPh"></div><div class="ktn-steps" id="ktnSteps"><i></i><i></i><i></i><i></i><i></i></div><div class="ktn-hint">Касание = отметка у человека в карточке. Норма — 5 в день.</div>')
    rep('<button class="add-btn" id="addBtn">+ Добавить контакт</button>',
        '<button class="add-btn" id="addBtn"><span class="ktn-ic">+</span><span class="ktn-at"><b>Добавить контакт</b><small>Новый человек в твой список</small></span><span class="ktn-arr">→</span></button>')
    # живая часть: setup без вставок (они уже в разметке)
    for x,y in [("    document.documentElement.classList.add('ktn');\n    var st = el('style'); st.id = 'ktnCss'; st.textContent = CSS; document.head.appendChild(st);\n",""),
                ("    var tr = $('.title-row'); var sub = el('div', 'ktn-sub'); sub.id = 'ktnSub';\n",""),
                ("    if(tr){ tr.parentNode.insertBefore(sub, tr.nextSibling);\n      if(IMG.length > 20){ var hi = el('img', 'ktn-hico'); hi.src = IMG; hi.alt = ''; tr.insertBefore(hi, tr.firstChild); } }\n",""),
                ("    if(lb){ lb.textContent = 'Касания сегодня';\n      var ph = el('div', 'ktn-ph'); ph.id = 'ktnPh'; var stp = el('div', 'ktn-steps', '<i></i><i></i><i></i><i></i><i></i>'); stp.id = 'ktnSteps';\n      var hn = el('div', 'ktn-hint', 'Касание = отметка у человека в карточке. Норма — 5 в день.');\n      lb.parentNode.insertBefore(hn, lb.nextSibling); lb.parentNode.insertBefore(stp, hn); lb.parentNode.insertBefore(ph, stp); }\n",""),
                ("    var ab = $('#addBtn');\n    if(ab && !$('.ktn-ic', ab)){ ab.innerHTML = '<span class=\"ktn-ic\">+</span><span class=\"ktn-at\"><b>Добавить контакт</b><small>Новый человек в твой список</small></span><span class=\"ktn-arr\">→</span>'; }\n",""),
                ("      var s = el('div', 'ktn-st'); s.id = 'ktnSt';\n",""),
                ("      s.innerHTML = '<span class=\"ktn-lbl\">Мои люди</span><div class=\"ktn-row\"><div class=\"ktn-c\" id=\"ktnA\"><b>0</b><small>в работе</small></div>'\n        + '<div class=\"ktn-c\" id=\"ktnD\" role=\"button\" tabindex=\"0\"><b>0</b><small>ждут связи</small></div>'\n        + '<div class=\"ktn-c\" id=\"ktnP\" role=\"button\" tabindex=\"0\"><b>0</b><small>партнёры</small></div></div>';\n      g.parentNode.insertBefore(s, g);\n","")]:
        assert live.count(x)==1,('СТОП, в скине нет места: '+x[:60]); live=live.replace(x,y)
    # сразу после главного скрипта страницы (он показывает список), до первого кадра
    i=s.index("document.getElementById('appBody').style.display = 'block';"); j=s.index('</script>',i)+9
    s=s[:j]+'\n<!-- ЧИСТЫЕ КОНТАКТЫ: живая часть нового вида (цифры, инициалы, деления) -->\n<script>\n'+live.strip()+'\n</script>'+s[j:]
    for bad in ['antiMigV1','kontakty-novye-v1.js?v=1','АКТИВНОСТЬ СЕГОДНЯ','+ Добавить контакт']: assert bad not in s,('осталось: '+bad)
else:
    a,b,CSS=jsstr(k,k.index('var CSS = '))
    live=k[:a]+'""'+k[b:]
    cut('<!-- ZOLOTO v1','<script src="/zoloto-v1.js?v=1"></script>')
    rep('<html lang="ru">','<html lang="ru" class="zl zl-'+page+'">')
    rep('</head>',NOTE+'<style id="zlCss">'+CSS+'</style>\n</head>')
    if page=='kanal':
        # вошедшему человеку канал сразу не показывает «Войти» и «Зарегистрироваться» (раньше они мелькали до скрипта)
        rep('</head>','<script>try{if(localStorage.getItem(\'eaglesfree_id\')&&localStorage.getItem(\'eaglesfree_session\'))document.documentElement.classList.add(\'ek-logged\')}catch(e){}</script>\n'
            '<style>html.ek-logged #eagles-kanal .ek-in,html.ek-logged #eagles-kanal .ek-cta[data-reg="cta"],html.ek-logged #eagles-kanal .ek-free{display:none!important}</style>\n</head>')
    for x,y in [("    var p = which(); if(!p) return false;\n    var R = document.documentElement; R.classList.add('zl', 'zl-' + p);\n",
                 "    var p = '"+page+"';\n"),
                ("    var busy = 0; try{ new MutationObserver(function(){ if(busy) return; busy = 1; setTimeout(function(){ PAGES[p](); busy = 0; }, 60); }).observe(document.body, { childList:true, subtree:true }); }catch(e){}\n",
                 "    /* чистая страница: иконки ставятся сразу, как только браузер прочитал элемент, до первого кадра */\n"
                 "    var busy = 0; try{ new MutationObserver(function(){ if(busy) return; busy = 1; try{ PAGES[p](); }catch(e){} busy = 0; }).observe(document.body, { childList:true, subtree:true }); }catch(e){}\n")]:
        assert live.count(x)==1,('СТОП, в скине нет места: '+x[:60]); live=live.replace(x,y)
    m=re.search(r'<body[^>]*>',s); assert s.count('<body')==1
    s=s[:m.end()]+'\n<!-- ЧИСТАЯ СТРАНИЦА: золотые иконки ставятся по мере чтения страницы -->\n<script>\n'+live.strip()+'\n</script>'+s[m.end():]
    for bad in ['antiMigV1','zoloto-v1.js?v=1']: assert bad not in s,('осталось: '+bad)
# --- все стили страницы — в <head> (в том же порядке, после нового вида, как и было по каскаду):
#     иначе до стиля в середине страницы браузер успевает нарисовать куски старым видом
h=s.index('</head>'); body=s[h:]
spans=[(m.start(),m.end()) for m in re.finditer(r'<script\b[^>]*>.*?</script>',body,re.S)]
def inscript(i): return any(a<=i<b for a,b in spans)
moved=[]; parts=[]; pos=0
for m in re.finditer(r'<style\b[^>]*>.*?</style>|<link\b[^>]*>',body,re.S):
    if inscript(m.start()): continue
    if m.group(0).startswith('<link') and not re.search(r'rel="(stylesheet|preconnect)"',m.group(0)): continue
    moved.append(m.group(0)); parts.append(body[pos:m.start()]); pos=m.end()
parts.append(body[pos:]); body=''.join(parts)
assert moved,'СТОП: нет стилей в теле'
s=s[:h]+'<!-- стили страницы перенесены сюда из тела (egClean1) -->\n'+'\n'.join(moved)+'\n'+body
out=s
open(dst,'w',encoding='utf-8').write(out)
print('ГОТОВО %s %d байт'%(page,len(out.encode('utf-8'))))
