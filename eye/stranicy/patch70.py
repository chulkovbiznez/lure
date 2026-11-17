# -*- coding: utf-8 -*-
"""EYE задание 70 (profile.html): плитка EYE в Профиле — вместо мегафона и старого логотипа новый логотип
ƎVE «Мессенджер» с иконками чата и камеры (eye/eve-logo-ikonki.png, фон убран), под ним «Чаты и звонки».
Логотип остаётся внутри .cb-t (тогда eye.js не переписывает подпись), картинка мегафона скрыта стилем (цифра непрочитанных в .cb-vid остаётся), из файла не удаляется.
Запуск: python3 patch70.py <profile.html живой> <logo.webp> <результат>"""
import sys, re, base64
src, logo, dst = sys.argv[1:4]
s = open(src, encoding='utf-8').read()
b64 = base64.b64encode(open(logo, 'rb').read()).decode()
rx = re.compile(r'<img class="eye-tlogo" src="data:image/webp;base64,[A-Za-z0-9+/=]+" alt="[^"]*" width="150" height="82">')
if len(rx.findall(s)) != 1: raise SystemExit('нет старого логотипа')
s = rx.sub(lambda m: '<img class="eye-tlogo eye-tlogo2" src="data:image/webp;base64,' + b64 + '" alt="EVE · мессенджер" width="340" height="189">', s)
css = ('<style>/* EAGLES 17.11.2026 (задание 70): плитка EYE — новый логотип с иконками чата и камеры вместо мегафона */\n'
  '#openChat .cb-vid img.pfn-art{display:none!important}\n'
  'html.pfn .egp .cbrow #openChat .cb-vid, .egp #openChat .cb-vid{height:0!important;min-height:0!important;margin:0!important}\n'
  '#openChat .cb-t.eye-tl{justify-content:center!important;width:100%}\n'
  'html.pfn .egp .cbrow #openChat .eye-tlogo.eye-tlogo2, .egp #openChat .eye-tlogo.eye-tlogo2{max-width:172px;margin:0 auto 6px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.55))}\n'
  'html.pfn .egp .cbrow #openChat .cb-t.eye-tl small{font-size:13px;color:#cbbf9e;font-weight:700}\n'
  '</style>\n</head>')
if s.count('</head>') != 1: raise SystemExit('</head>')
s = s.replace('</head>', css)
open(dst, 'w', encoding='utf-8', newline='').write(s)
print('ok')
