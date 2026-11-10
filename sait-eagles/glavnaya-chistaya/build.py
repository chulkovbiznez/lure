# Собирает ЧИСТУЮ главную EAGLES (index.html) из живой страницы: новый дизайн прямо в разметке,
# без старых слоёв (старая главная egf/eglnd, старая карусель, 8 лишних картинок, заплатки glavPre/glavFix/fsOff).
# Логика регистрации, входа, кода, наставника, ?ref, ?code, «?»-подсказок — та же, что на живой странице.
# Запуск: python3 build.py ЖИВОЙ_index.html НОВЫЙ_index.html
import re,sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
def cut(a,b,start=0,incl=True):
    i=s.index(a,start);j=s.index(b,i+len(a))
    return s[i:j+len(b)] if incl else s[i:j]
def one(x,what):
    assert s.count(x)==1,('не один раз: '+what,s.count(x));return x
# --- части живой страницы
one('/* запрет зума','vp');one('/* вход: ключ сессии','sess')
vp=cut('<script>\n/* запрет зума','</script>')
sess=cut('<script>\n/* вход: ключ сессии','</script>')
fonts=re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?family=Unbounded[^>]*>',s).group(0)
egfcss=cut('<style>\nhtml, body, #allrecords','</style>')
modals=cut('  <!-- как зарегистрироваться -->','<!-- EAGLES FINAL · Главная, блок 2',incl=False)
modals=modals.rstrip()
assert modals.endswith('</div>')
modals=modals[:-len('</div>')].rstrip()   # последний </div> закрывал .egf
logic=cut('<!-- EAGLES FINAL · Главная, блок 2','</script>')
imgs={}
for m in re.finditer(r'EG_IMGS\.(\w+) = `(.*?)`\.replace',s,re.S): imgs[m.group(1)]=re.sub(r'\s','',m.group(2))
vh=cut('<!-- НОВЫЙ ВХОД 09.11.2026 -->','</script>')
vhcss=vh[:vh.index('</style>')+8]; vhjs=vh[vh.index('</style>')+8:].strip()
gl=cut('<!-- НОВАЯ ГЛАВНАЯ 10.11.2026','</script>')
glcss=gl[gl.index('<style id="glavV1">'):gl.index('</style>')+8]
gljs=gl[gl.index('<script>'):]
topcss=re.search(r'<style id="glavTopV1">(.*?)</style>',s,re.S).group(1)
fixjs=re.search(r'<!-- glavFixV1: скрипт к стилю в head -->(<script>.*?</script>)',s,re.S).group(1)

# --- логика: убрать старую карусель, просмотр и описание картинок (их больше нет на странице)
a=logic.index('    /* ---------- карусель ---------- */');b=logic.index('    /* ---------- как зарегистрироваться ---------- */')
logic=logic[:a]+"    /* старая карусель, просмотр и описание картинок убраны 11.11.2026: на новой главной их нет */\n    function stop(){}\n    function anyOpen(){ return !$('wrn').hidden || !$('reg').hidden || !$('ins').hidden || !$('lgn').hidden || !$('cdo').hidden; }\n\n"+logic[b:]
x="    if(IM.logo) $('egLogo').src = IM.logo;\n"; assert logic.count(x)==1; logic=logic.replace(x,'')
for bad in ["$('track')","openVw","openDsc","$('egLogo')","$('fsM')"]: assert bad not in logic,bad

# --- новая главная: разметка прямо в странице, а не из скрипта
m=re.search(r'box\.innerHTML=("(?:[^"\\]|\\.)*");eg\.insertBefore\(box,eg\.firstChild\);',gljs)
import json
glhtml=json.loads(m.group(1))
pre="(function(){\n  var eg=document.getElementById('eglnd');if(!eg||document.getElementById('gl'))return;\n  try{document.documentElement.style.fontSize='';localStorage.removeItem('eg-fs')}catch(e){}\n  var box=document.createElement('div');box.id='gl';"
assert gljs.count(pre)==1
gljs=gljs.replace(pre+'box.innerHTML='+m.group(1)+';eg.insertBefore(box,eg.firstChild);',"(function(){\n  var box=document.getElementById('gl');if(!box)return;\n  try{document.documentElement.style.fontSize='';localStorage.removeItem('eg-fs')}catch(e){}")
assert 'innerHTML="' not in gljs[:400]
lg="  function logo(){var l=$('egLogo');if(l&&l.src&&l.src.indexOf('data:')===0){box.style.setProperty('--logo','url(\"'+l.src+'\")');return true}return false}\n  if(!logo()){var n=0,t=setInterval(function(){if(logo()||++n>40)clearInterval(t)},250)}\n"
assert gljs.count(lg)==1; gljs=gljs.replace(lg,'')
# скрипт «без подмигиваний»: логотип теперь в стиле, страница видна сразу; остаётся память карточки наставника
fx=fixjs
a=fx.index('function setLogo');b=fx.index("var m=g.querySelector('.hero .mentor')")
fx=fx[:a]+fx[b:]

css_extra='#gl{--logo:url("'+imgs['logo']+'")}\n'+topcss+'\n#gl .hero .mentor>*{opacity:0;transition:opacity .3s ease}#gl .hero .mentor.mok>*{opacity:1}\n'
head=('<!doctype html>\n<html lang="ru"><head><meta charset="utf-8">\n'
 '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">\n'
 '<title>EAGLES · Вход</title>\n<meta name="theme-color" content="#070708">\n'
 '<!-- ЧИСТАЯ ГЛАВНАЯ EAGLES (11.11.2026, glavClean1): новый дизайн прямо в странице, без старых слоёв. Сборка: мозг kod/glavnaya/chistaya/build.py -->\n'
 '<style>html,body{margin:0;padding:0;background:#070708;}</style>\n'
 +vp+'\n'+sess+'\n'+fonts+'\n'+egfcss+'\n'+glcss.replace('<style id="glavV1">','<style id="glavClean1">')+'\n<style>'+css_extra+'</style>\n'+vhcss+'\n</head>')
body=('<body>\n<div class="egf" id="egf">\n  <div class="glow"></div>\n'
 '  <div hidden><button id="btnIn" type="button"></button><button id="btnIns" type="button"></button><button id="btnReg" type="button"></button></div>\n'
 '  <div class="eglnd" id="eglnd"><div id="gl">'+glhtml+'</div></div>\n'
 +modals+'\n</div>\n'
 '<script>\nwindow.EG_IMGS = window.EG_IMGS || {};\nEG_IMGS.photo = "'+imgs['photo']+'";\nEG_IMGS.pid = "'+imgs['pid']+'";\n</script>\n'
 +logic+'\n'+vhjs+'\n'+gljs+'\n'+fx+'\n</body></html>\n')
out=head+'\n'+body
for bad in ['glavPreV1','glavFixV1','fsOffV1','id="vw"','id="dsc"','id="track"','id="egLogo"','EG_IMGS.krug']:
    assert bad not in out,bad
open(dst,'w',encoding='utf-8',newline='').write(out)
print('ГОТОВО %d байт'%len(out.encode('utf-8')))
