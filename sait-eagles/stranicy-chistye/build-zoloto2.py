# Собирает ЧИСТЫЕ золотые страницы EAGLES (17.11.2026, egClean2): Маркетинг-план и 11 документов.
# Было: старый оранжевый вид, скин zoloto-v2.js на сайт так и не ставили (задание 34 не запускали).
# Стало: золотые стили из zoloto-v2.js прямо в <head> и класс на <html> сразу, без скрипта-скина.
#  - Маркетинг: только стили (скин на этой странице ничего не добавлял).
#  - Документы: золотая иконка над заголовком прямо в разметке (раньше её вставлял скин).
#  - Все стили из тела страницы переносятся в <head> после золотых, порядок каскада тот же.
# Тексты, ссылки и логика страниц не меняются.
# Запуск: python3 build-zoloto2.py СТРАНИЦА ЖИВОЙ.html zoloto-v2.js НОВЫЙ.html
#   СТРАНИЦА: marketing | oferta politika soglasie soglashenie faq vyplaty kodeks rassylki reklama dokumenty partner
import re,sys,json,hashlib
page,src,skin,dst=sys.argv[1:5]
DOCS=['oferta','politika','soglasie','soglashenie','faq','vyplaty','kodeks','rassylki','reklama','dokumenty','partner']
assert page=='marketing' or page in DOCS,'СТОП: неизвестная страница '+page
k=open(skin,encoding='utf-8').read()
assert hashlib.md5(k.encode('utf-8')).hexdigest()=='1dc063f11359d4d98c0913088f778506','СТОП: скин не тот (нужен zoloto-v2.js)'
s=open(src,encoding='utf-8').read()
assert 'egClean2' not in s,'УЖЕ СТОИТ: это уже чистая золотая страница'
assert 'zoloto' not in s and 'antiMig' not in s,'СТОП: на странице уже есть скин или шторка'
def rep(a,b,what=''):
    global s; assert s.count(a)==1,('СТОП, не один раз: '+(what or a[:60]),s.count(a)); s=s.replace(a,b)
d=json.JSONDecoder()
CSS,e=d.raw_decode(k,k.index('var CSS = ')+10)
I,_=d.raw_decode(k,k.index('{',e))
cls='marketing' if page=='marketing' else 'doc'
if page=='marketing': assert 'class="egm' in s,'СТОП: это не страница маркетинга'
else: assert s.count('<div class="eg-pol-wrap"')==1 and s.count('<h1>')==1,'СТОП: это не страница документа'
rep('<html lang="ru">','<html lang="ru" class="zl zl-'+cls+'">')
rep('</head>','<!-- ЧИСТАЯ ЗОЛОТАЯ СТРАНИЦА EAGLES (17.11.2026, egClean2): новый вид сразу, без скина -->\n<style id="zlCss">'+CSS+'</style>\n</head>')
if cls=='doc':
    rep('<h1>','<div class="zl-dhead"><img class="zl-dico" src="'+I['DOCS']+'" alt="" decoding="async"></div><h1>')
# все стили из тела — в <head>, после золотых (как было по каскаду, когда скин дописывал стиль в head)
h=s.index('</head>'); body=s[h:]
spans=[(m.start(),m.end()) for m in re.finditer(r'<script\b[^>]*>.*?</script>',body,re.S)]
moved=[]; parts=[]; pos=0
for m in re.finditer(r'<style\b[^>]*>.*?</style>|<link\b[^>]*>',body,re.S):
    if any(a<=m.start()<b for a,b in spans): continue
    if m.group(0).startswith('<link') and not re.search(r'rel="(stylesheet|preconnect)"',m.group(0)): continue
    moved.append(m.group(0)); parts.append(body[pos:m.start()]); pos=m.end()
parts.append(body[pos:]); body=''.join(parts)
assert moved,'СТОП: нет стилей в теле'
s=s[:h]+'<!-- стили страницы перенесены сюда из тела (egClean2) -->\n'+'\n'.join(moved)+'\n'+body
open(dst,'w',encoding='utf-8',newline='').write(s)
print('ГОТОВО %s %d байт md5 %s'%(page,len(s.encode('utf-8')),hashlib.md5(s.encode('utf-8')).hexdigest()))
