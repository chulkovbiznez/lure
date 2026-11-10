# Собирает ЧИСТЫЙ Профиль EAGLES (profile.html) из живой страницы и живого скина /profil-novyj-v1.js?v=5.
# Новый золотой дизайн прямо в разметке и в стилях в <head>: страница с первого кадра рисуется в новом виде,
# старый оранжевый вид не появляется даже на долю секунды, и «шторка» ANTIMIG больше не нужна.
# Убрано: шторка ANTIMIG, скин-переделка после загрузки, старая «Карта EAGLES» в окне (277 КБ, давно открывается
# новая страница /karty.html), лишние видео-иконки, которые скин всё равно останавливал.
# Логика, сервер, ПИН, касания, чат, копилка, игра, партнёры, PRO — те же самые скрипты живой страницы.
# Запуск: python3 build.py ЖИВОЙ_profile.html ЖИВОЙ_profil-novyj-v1.js НОВЫЙ_profile.html
import re,sys,json,hashlib
src,skin,dst=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(src,encoding='utf-8').read()
k=open(skin,encoding='utf-8').read()
assert hashlib.md5(k.encode('utf-8')).hexdigest()=='931d90dbb190eb5f1670aba395845d38','СТОП: скин profil-novyj-v1.js не тот (нужен v=5)'
assert 'pfnClean1' not in s,'УЖЕ СТОИТ: это уже чистый Профиль'
def one(x,what=''):
    assert s.count(x)==1,('СТОП, не один раз: '+(what or x[:60]),s.count(x));return x
def rep(a,b,what=''):
    global s; one(a,what); s=s.replace(a,b)
def cut(a,b):
    global s; i=s.index(one(a)); j=s.index(b,i)+len(b); part=s[i:j]; s=s[:i]+s[j:]; return part

# --- части скина
CSS=json.loads(re.search(r'\n  var CSS = ("(?:[^"\\]|\\.)*");\n',k).group(1))
A=dict(re.findall(r"(\w+):'(data:[^']*)'",k[k.index('var A = {'):k.index('};',k.index('var A = {'))]))
assert set(A)=={'klogo','c0','c1','c2','c3','chat','kop','biz','prod','nag','vzlet'},sorted(A)
KCSS=''.join(re.findall(r"'((?:[^'\\]|\\.)*)'",re.search(r"var css = ('(?:[^'\\]|\\.)*'(?:\s*\+\s*'(?:[^'\\]|\\.)*')*);",k).group(1)))
ARR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'

# --- 1. шторка ANTIMIG больше не нужна
cut('<!-- ANTIMIG v1','<!-- END ANTIMIG v1 -->')
# --- 2. скин-переделку убираем: её вид теперь в разметке
cut('<!-- PROFIL NOVYJ v1','<script src="/profil-novyj-v1.js?v=5"></script>')
# --- 3. старая «Карта EAGLES» в окне: кнопка давно ведёт на /karty.html
cut('<!-- EAGLES · Профиль, блок «Карта EAGLES»','</style>')
j=s.index('<script>',s.index('/* живая Карта EAGLES')-60); assert '/* живая Карта EAGLES' in s[j:j+80]
jj=s.index('</script>',j)+9; assert 'window.egOwnMap = showOwn' in s[j:jj]; s=s[:j]+s[jj:]
cut('<!-- KARTY v1','</script>')
rep("document.getElementById('openMap').addEventListener('click', function(){ if(window.egOwnMap) window.egOwnMap(this); else egToast('Карта EAGLES скоро откроется'); });",
    "document.getElementById('openMap').addEventListener('click', function(){ location.href = '/karty.html'; });")
# --- 4. кнопка LURE: стиль в <head>, сама кнопка в разметке
lure=cut('<!-- LURE VIDEOKNOPKA v1','<!-- end LURE VIDEOKNOPKA v1 -->')
LCSS=re.search(r'<style>(.*?)</style>',lure,re.S).group(1)
# --- 5. логотип: картинка определяется до разметки и ставится сразу, без пустого места
plogo=cut('<!-- EAGLES FINAL · Профиль, блок 2','</script>')
assert plogo.count('<script>')==1 and 'window.EG_PLOGO =' in plogo
rep('<div class="eagles-page egp">',plogo+'\n<div class="eagles-page egp">')

# --- 6. стили нового вида в <head>, класс pfn сразу на <html>
rep('<html lang="ru">','<html lang="ru" class="pfn">')
EXTRA=('#pfnGame .pfn-gslot>*{grid-area:1/1}\n'
       '#pfnGame .pfn-gslot #eg-game-btn:empty{display:none}\n'
       '/* пока скрипт входа не решил, что показать, подпись внизу не мелькает одна */\n'
       '.egp #loggedInBlock[style*="none"]~#noLoginBlock[style*="none"]~.foot{visibility:hidden}\n')
rep('</head>','<!-- ЧИСТЫЙ ПРОФИЛЬ EAGLES (11.11.2026, pfnClean1): новый вид прямо в странице, без скина и шторки -->\n'
    '<style id="pfnCss">\n'+CSS+'\n</style>\n<style id="pfnKvb">'+KCSS+'</style>\n<style id="pfnLvb">'+LCSS.strip()+'\n'+EXTRA+'</style>\n</head>')

# --- 7. разметка
rep('<div class="ptop"><img class="biglogo" id="egLogo" src="" alt="EAGLES · Зеркало твоего бизнеса">',
    '<div class="ptop"><canvas class="pfn-dust" aria-hidden="true"></canvas><img class="biglogo" id="egLogo" src="" alt="EAGLES · Зеркало твоего бизнеса"><script>document.getElementById(\'egLogo\').src=window.EG_PLOGO||\'\';</script>')
rep('\n      <span id="eg-game-btn" data-src="/games/vzlet/play/" style="position:absolute;right:46px;top:-1px;z-index:2"></span>','')
rep('<p class="dhint">Касания отмечаются в «Контактах». Нажми на круг, чтобы перейти</p>','<p class="dhint">Отмечай касания в «Контактах». Нажми на круг.</p>')
rep('<p class="mot" id="mot"></p>','<p class="mot" id="mot"></p><div class="pfn-steps"><i></i><i></i><i></i><i></i><i></i></div>')
m=re.search(r'\n      <button class="mapbtn" id="openMap" type="button">.*?</button>\n',s,re.S); one(m.group(0))
KVB=('\n      <a id="kontaktyVB" href="/contacts.html" aria-label="Открыть «Мои контакты»"><video muted loop playsinline autoplay preload="metadata" poster="/kontakty-knopka-v2-poster.jpg" src="/kontakty-knopka-v2.mp4"></video><img class="kvb-logo" src="/kontakty-logo.png" alt=""></a>\n'
     '      <a id="lureVB" href="https://lure.eaglesteam.ru" aria-label="Открыть LURE, нейросети без VPN"><video muted loop playsinline preload="metadata" poster="/lure-knopka-poster.jpg" src="/lure-knopka.mp4"></video><img class="lvb-logo" src="/lure-knopka-logo.webp" alt=""><span class="lvb-cap">Чат · картинки · видео · звук</span></a>\n')
MAP=('      <button class="mapbtn pfn-kb" id="openMap" type="button" aria-label="Открыть Карты EAGLES">\n        <b>Карта EAGLES</b>\n        <small>Бизнес, цели, дела, поездки</small>\n'
     '        <span class="pfn-stage" aria-hidden="true"><span class="pfn-glow"></span>'
     '<span class="pfn-cd c1"><img src="'+A['c0']+'" alt=""></span><span class="pfn-cd c2"><img src="'+A['c1']+'" alt=""></span>'
     '<span class="pfn-cd c3"><img src="'+A['c2']+'" alt=""></span><span class="pfn-cd c4"><img src="'+A['c3']+'" alt=""></span></span>'
     '<img class="pfn-klogo" src="'+A['klogo']+'" alt=""><span class="pfn-kcap">Бизнес · цели · дела · поездки</span>\n      </button>\n')
s=s.replace(m.group(0),KVB+MAP)
rep('<button class="chatbtn" id="openChat" type="button">\n        <span class="cb-vid mapvid" aria-hidden="true"><video autoplay muted loop playsinline preload="auto" disablepictureinpicture src="/chat-ikon.mp4"></video>',
    '<button class="chatbtn pfn-tile" id="openChat" type="button">\n        <span class="cb-vid mapvid" aria-hidden="true"><img class="pfn-art" src="'+A['chat']+'" alt="">')
rep('<button class="chatbtn kpbtn" id="openKop" type="button">\n        <span class="cb-vid mapvid" aria-hidden="true"><video autoplay muted loop playsinline preload="auto" disablepictureinpicture src="/kop-ikon.mp4"></video>',
    '<button class="chatbtn kpbtn pfn-tile" id="openKop" type="button">\n        <span class="cb-vid mapvid" aria-hidden="true"><img class="pfn-art" src="'+A['kop']+'" alt="">')
GAME=('      <div class="pfn-gm pfn-mat" id="pfnGame" role="button" tabindex="0" aria-label="Играть во «Взлетай»">'
      '<span class="pfn-gslot"><img class="pfn-gimg" src="'+A['vzlet']+'" alt=""><span id="eg-game-btn" data-src="/games/vzlet/play/"></span></span>'
      '<span class="pfn-gt"><span class="pfn-lbl">Мини-игра</span><b class="pfn-gold">Взлетай</b></span><span class="pfn-play">Играть</span></div>\n')
rep('\n      </div>\n\n\n      <div class="card goldline" id="binarBlock">','\n      </div>\n'+GAME+'\n      <div class="card goldline pfn-done" id="binarBlock">')
def sh(img,t,sub): return '<div class="ch pfn-sh"><img src="'+img+'" alt=""><span><b class="pfn-gold">'+t+'</b><small>'+sub+'</small></span></div>'
INV='\n        <button class="row dashed" type="button" id="bnInviteBtn"></button>\n        <div class="note" id="bnInviteNote"></div>'
rep(INV,'')
rep('<div class="ch"><span class="chi">🦅</span>Партнёрская программа</div>',sh(A['biz'],'Партнёрская программа','Приглашай, расти, получай выплаты')+INV)
b0=s.index('id="binarBlock"'); b1=s.index('id="partnersBlock"')
blk=s[b0:b1]; assert blk.count('<span class="arr">→</span>')==2; s=s[:b0]+blk.replace('<span class="arr">→</span>','<span class="arr">'+ARR+'</span>')+s[b1:]
rep('<div class="card" id="partnersBlock">\n        <div class="ch"><span class="chi">🤝</span>Мои партнёры</div>',
    '<div class="card pfn-done" id="partnersBlock">\n        '+sh(A['prod'],'Мои партнёры','Твоя команда растёт здесь'))

# --- 8. живая часть нового вида (то, что зависит от данных): в конец страницы
LIVE=open(__file__.replace('build.py','pfn-live.js'),encoding='utf-8').read().replace('__NAG__',A['nag'])
rep('<!-- ПИН БЫСТРЕЕ И КОМПАКТНЕЕ 10.11.2026 -->','<!-- ЧИСТЫЙ ПРОФИЛЬ: живая часть нового вида -->\n<script>\n'+LIVE+'</script>\n\n<!-- ПИН БЫСТРЕЕ И КОМПАКТНЕЕ 10.11.2026 -->')

for bad in ['antiMigV1','egcl','profil-novyj-v1.js','egOwnMap','km-','/karta-ikon.mp4','/chat-ikon.mp4','/kop-ikon.mp4','createElement(\'a\');\n    a.id=\'lureVB\'']:
    assert bad not in s,('осталось: '+bad)
for need in ['id="egp"','id="egpZ"','pin_state','kop_get','partners_list','chat_unread','/games/eg-game-button.js','id="pkOv"','id="egChw"','id="kontaktyVB"','id="lureVB"','id="pfnGame"','tabbar']:
    assert need in s,('нет: '+need)
out=s
open(dst,'w',encoding='utf-8').write(out)
print('ГОТОВО %d байт'%len(out.encode('utf-8')))
