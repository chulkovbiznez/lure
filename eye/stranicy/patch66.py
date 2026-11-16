# -*- coding: utf-8 -*-
"""EYE задание 66 v3: логотип ƎVE «Мессенджер» со значками чата и камеры (фон убран) вверху страницы EYE вместо текстового заголовка.
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
       '.eye-logo img{display:block;width:min(66vw,270px);height:auto;filter:drop-shadow(0 6px 18px rgba(255,150,30,.22))}\n'
              '#chHome>.ch-top{display:none}\n'
       '</style>\n')
s = once(s, '</head>', CSS + '</head>', 'head')
s = once(s, '<div id="chHome" style="display:none">\n    <div class="ch-top">',
         '<div id="chHome" style="display:none">\n    <div class="eye-logo"><img src="data:image/webp;base64,' + b64 + '" alt="EYE · мессенджер" width="270" height="__H__"></div>\n    <div class="ch-top">', 'logo')
from PIL import Image
H = round(Image.open(logo).height * 270 / Image.open(logo).width)
s = s.replace('__H__', str(H))
open(dst, 'w', encoding='utf-8', newline='').write(s)
print('ok', len(s))
