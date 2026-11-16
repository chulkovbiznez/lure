# -*- coding: utf-8 -*-
"""EYE задание 64: логотип EYE (золотой, в стиле LURE) вверху страницы EYE вместо текстового заголовка.
Запуск: python3 patch64.py <chat.html живой> <логотип.webp> <результат>"""
import sys, base64
src, logo, dst = sys.argv[1:4]
s = open(src, encoding='utf-8').read()
b64 = base64.b64encode(open(logo, 'rb').read()).decode()
def once(s, a, b, n):
    if s.count(a) != 1: raise SystemExit('%s: ожидал 1, нашёл %d' % (n, s.count(a)))
    return s.replace(a, b)
CSS = ('<style>/* EAGLES 17.11.2026: логотип EYE вверху страницы, как у LURE */\n'
       '.eye-logo{display:flex;flex-direction:column;align-items:center;gap:4px;margin:2px 0 16px;text-align:center}\n'
       '.eye-logo img{display:block;width:min(56vw,230px);height:auto;filter:drop-shadow(0 6px 18px rgba(255,150,30,.28))}\n'
       '.eye-logo small{font:800 11px/1.2 Montserrat,system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#c9a35a}\n'
       '#chHome>.ch-top{display:none}\n'
       '</style>\n')
s = once(s, '</head>', CSS + '</head>', 'head')
s = once(s, '<div id="chHome" style="display:none">\n    <div class="ch-top">',
         '<div id="chHome" style="display:none">\n    <div class="eye-logo"><img src="data:image/webp;base64,' + b64 + '" alt="EYE" width="230" height="61"><small>Мессенджер</small></div>\n    <div class="ch-top">', 'logo')
open(dst, 'w', encoding='utf-8', newline='').write(s)
print('ok', len(s))
