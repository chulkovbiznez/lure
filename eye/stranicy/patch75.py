# Задание 75: внутри EYE (chat.html) вместо большого логотипа с иконками ставится ровный «ƎVE» без иконок и наклона.
# Запуск: python3 patch75.py chat-do-75.html eye-logo-rovnyj.webp chat-v75.html
import sys, re, base64
src, logo, dst = sys.argv[1:4]
h = open(src, encoding='utf-8').read()
if 'eye-logo75' in h: sys.exit('УЖЕ СТОИТ: патч 75 уже применён, ничего не делаю')
pat = re.compile(r'<div class="eye-logo"><img src="data:image/[a-z]+;base64,[A-Za-z0-9+/=]+"[^>]*>')
m = pat.findall(h)
if len(m) != 1: sys.exit('СТОП: логотип EYE найден %d раз (нужно 1)' % len(m))
b = base64.b64encode(open(logo, 'rb').read()).decode()
new = '<div class="eye-logo eye-logo75"><img src="data:image/webp;base64,' + b + '" alt="EYE" width="400" height="162">'
h = h.replace(m[0], new)
css = '<style id="eye-logo75">#chHome .eye-logo75 img{width:min(42vw,170px)!important;filter:drop-shadow(0 4px 12px rgba(255,150,30,.25))!important}#chHome .eye-logo75{margin:6px 0 14px!important}</style>'
if h.count('</head>') != 1: sys.exit('СТОП: </head> не один')
h = h.replace('</head>', css + '</head>')
open(dst, 'w', encoding='utf-8').write(h)
print('OK', dst, len(h))
