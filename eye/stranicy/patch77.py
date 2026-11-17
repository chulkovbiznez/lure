# Задание 77: плитка мессенджера в Профиле — вместо «ƎVE» в логотипе ставится EYE (иконки чата и камеры и «МЕССЕНДЖЕР» остаются).
# Запуск: python3 patch77.py profile-do-77.html eye-logo-messendzher-tile.webp profile-v77.html
import sys, re, base64
src, logo, dst = sys.argv[1:4]
h = open(src, encoding='utf-8').read()
if 'eye-tlogo77' in h: sys.exit('УЖЕ СТОИТ: патч 77 уже применён, ничего не делаю')
pat = re.compile(r'<img class="eye-tlogo eye-tlogo2" src="data:image/[a-z]+;base64,[A-Za-z0-9+/=]+"[^>]*>')
m = pat.findall(h)
if len(m) != 1: sys.exit('СТОП: логотип плитки найден %d раз (нужно 1)' % len(m))
b = base64.b64encode(open(logo, 'rb').read()).decode()
h = h.replace(m[0], '<img class="eye-tlogo eye-tlogo2 eye-tlogo77" src="data:image/webp;base64,' + b + '" alt="EYE · мессенджер" width="340" height="185">')
css = '<style id="eye-tlogo77">#openChat .eye-tlogo.eye-tlogo77, .egp #openChat .eye-tlogo.eye-tlogo77{max-width:172px!important}</style>'
if h.count('</head>') != 1: sys.exit('СТОП: </head> не один')
h = h.replace('</head>', css + '</head>')
open(dst, 'w', encoding='utf-8').write(h)
print('OK', dst, len(h))
