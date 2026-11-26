# 129: профиль — экран загрузки виден с первой отрисовки; без входа — сразу на главную (для старта приложения 1.3.1 прямо с профиля)
import sys
d=sys.argv[1]
p=open(d+'/profile-do-129.html',encoding='utf-8').read()
assert 'egZ0' not in p
k=p.index('<script id="egPre128">'); e=p.index('</script>',k)+len('</script>')
p=p[:e]+("<script id=\"egZ0\">/* 26.11 egZ0: вошёл и (приложение или первый заход) — экран загрузки с первой отрисовки; не вошёл — на главную */"
"try{var z0i=localStorage.getItem('eaglesfree_id'),z0s=localStorage.getItem('eaglesfree_session');"
"if((!z0i||!z0s)&&/[?&]app=android/.test(location.search)){document.write('<style>body{display:none!important}</style>');location.replace('/'+location.search)}"
"else if(z0i&&z0s&&(/[?&]app=android/.test(location.search)||sessionStorage.getItem('eg_in_app')==='1'||!sessionStorage.getItem('egb127'))){document.documentElement.classList.add('egz0');"
"document.write('<style id=\"egZ0s\">html.egz0 #egpZ[hidden]{display:flex!important}html.egz0,html.egz0 body{background:#070708!important}</style>')}}catch(e){}</script>")+p[e:]
k=p.index('<script id="egBoot127">'); e=p.index('</script>',k)+len('</script>')
p=p[:e]+"<script>try{document.documentElement.classList.remove('egz0')}catch(e){}</script>"+p[e:]
open(d+'/site/profile.html','w',encoding='utf-8').write(p)
print('ok')
