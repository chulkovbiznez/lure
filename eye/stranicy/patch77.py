# Задание 77: плитка мессенджера в Профиле — вместо логотипа «ƎVE МЕССЕНДЖЕР» с иконками ставится логотип Андрея EYE.
# Запуск: python3 patch77.py profile-do-77.html eye-logo-natural.webp profile-v77.html
import sys, re, base64
src, logo, dst = sys.argv[1:4]
h = open(src, encoding='utf-8').read()
if 'eye-tlogo77' in h: sys.exit('УЖЕ СТОИТ: патч 77 уже применён, ничего не делаю')
pat = re.compile(r'<img class="eye-tlogo eye-tlogo2" src="data:image/[a-z]+;base64,[A-Za-z0-9+/=]+"[^>]*>')
m = pat.findall(h)
if len(m) != 1: sys.exit('СТОП: логотип плитки найден %d раз (нужно 1)' % len(m))
b = base64.b64encode(open(logo, 'rb').read()).decode()
h = h.replace(m[0], '<img class="eye-tlogo eye-tlogo2 eye-tlogo77" src="data:image/webp;base64,' + b + '" alt="EYE" width="800" height="250">')
css = '<style id="eye-tlogo77">#openChat .eye-tlogo.eye-tlogo77, .egp #openChat .eye-tlogo.eye-tlogo77{max-width:150px!important;margin:0 auto 4px!important;filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))!important}</style>'
if h.count('</head>') != 1: sys.exit('СТОП: </head> не один')
h = h.replace('</head>', css + '</head>')
open(dst, 'w', encoding='utf-8').write(h)
print('OK', dst, len(h))
