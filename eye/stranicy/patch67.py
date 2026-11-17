# -*- coding: utf-8 -*-
"""EYE задание 67:
 chat.html  — логотип ƎVE «Мессенджер» вверху (как задание 66) + кнопка «Заявки» справа над вкладками;
 profile.html — плитка EYE на главной Профиля: мегафон, под ним логотип ƎVE «Мессенджер», подпись «Чаты и звонки».
Запуск: python3 patch67.py <папка живых страниц> <папка результата> <logo.webp> <logo-sm.webp>"""
import sys, os, base64, subprocess
src, dst, logo, logo_sm = sys.argv[1:5]
here = os.path.dirname(os.path.abspath(__file__))
def once(s, a, b, n):
    if s.count(a) != 1: raise SystemExit('%s: ожидал 1, нашёл %d' % (n, s.count(a)))
    return s.replace(a, b)
os.makedirs(dst, exist_ok=True)
# 1) chat.html: логотип (patch66) + «Заявки»
tmp = os.path.join(dst, 'chat.tmp.html')
subprocess.check_call([sys.executable, os.path.join(here, 'patch66.py'), os.path.join(src, 'chat.html'), logo, tmp])
s = open(tmp, encoding='utf-8').read(); os.remove(tmp)
BELL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/></svg>'
s = once(s, '#chHome>.ch-top{display:none}\n',
  '#chHome>.ch-top{display:none}\n'
  '.eye-reqrow{display:flex;justify-content:flex-end;margin:-6px 0 8px}\n'
  '.eye-reqb{position:relative;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 13px;border-radius:16px;border:1px solid rgba(255,210,63,.45);'
  'background:linear-gradient(180deg,#2a2016,#17110b);color:#ffd23f;font:800 12.5px/1 Montserrat,system-ui,sans-serif;cursor:pointer}\n'
  '.eye-reqb svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}\n'
  '.eye-reqb .ch-n{position:absolute;top:-7px;right:-7px;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:9px;background:#e8321a;color:#fff;font:900 10px/18px Montserrat,sans-serif;text-align:center}\n'
  '.eye-reqb .ch-n[hidden]{display:none}\n', 'chat css')
s = once(s, '"></div>\n    <div class="ch-top">',
  '"></div>\n    <div class="eye-reqrow"><button type="button" class="eye-reqb" id="eyeReqBtn">' + BELL + 'Заявки<span class="ch-n" id="nReq" hidden></span></button></div>\n    <div class="ch-top">', 'chat req')
open(os.path.join(dst, 'chat.html'), 'w', encoding='utf-8', newline='').write(s)
# 2) profile.html: плитка EYE
p = open(os.path.join(src, 'profile.html'), encoding='utf-8').read()
b64 = base64.b64encode(open(logo_sm, 'rb').read()).decode()
p = once(p, '<span class="cb-t"><b>Чат с командой</b><small>Сообщения и объявления</small></span>',
  '<span class="cb-t eye-tl"><img class="eye-tlogo" src="data:image/webp;base64,' + b64 + '" alt="EYE · мессенджер" width="150" height="82"><small>Чаты и звонки</small></span>', 'profile tile')
p = once(p, '</head>', '<style>/* EAGLES 17.11.2026: плитка EYE — мегафон, логотип, «Чаты и звонки» */\n'
  'html.pfn .egp .cbrow #openChat .cb-t.eye-tl{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}\n'
  'html.pfn .egp .cbrow #openChat .eye-tlogo{display:block;width:100%;max-width:150px;height:auto;margin:0 auto}\n'
  'html.pfn .egp .cbrow #openChat .cb-t.eye-tl small{font-size:12px;color:#a69d8f}\n'
  '.egp #openChat .cb-t.eye-tl{text-align:center}.egp #openChat .eye-tlogo{display:block;width:100%;max-width:150px;height:auto;margin:0 auto}\n'
  '</style>\n</head>', 'profile css')
open(os.path.join(dst, 'profile.html'), 'w', encoding='utf-8', newline='').write(p)
print('ok')
