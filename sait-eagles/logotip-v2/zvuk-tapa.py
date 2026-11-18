# -*- coding: utf-8 -*-
"""Задание 80 v2 (18.11.2026): звук тапа как клавиатура iPhone на сайте EAGLES.
Если в странице есть старая функция egSoftTap(c) — заменяет её на новую (zvuk-tapa.js рядом).
Если нет — вставляет перед </body> маленький блок: звук на каждое нажатие ссылки/кнопки.
Запуск: python3 zvuk-tapa.py ВХОД.html ВЫХОД.html
"""
import sys, os, hashlib
D = os.path.dirname(os.path.abspath(__file__))
SND = open(os.path.join(D, 'zvuk-tapa.js'), encoding='utf-8').read().strip()
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
if 'egTapV2' in s:
    print('СТОП: звук уже стоит в', src); sys.exit(1)
key = 'function egSoftTap(c){'
i = s.find(key)
if i >= 0:
    if s.count(key) != 1:
        print('СТОП: egSoftTap больше одного раза'); sys.exit(1)
    j = i + len(key) - 1; depth = 0
    while True:
        ch = s[j]
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: break
        j += 1
    s2 = s[:i] + '/* egTapV2 */\n' + SND + '\n' + s[j+1:]
    how = 'замена egSoftTap'
else:
    blk = ('<script>/* egTapV2: звук тапа как клавиатура iPhone (18.11.2026) */\n(function(){if(window.__egTapOn)return;window.__egTapOn=1;\n'
           'var actx=null;function getCtx(){if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)();return actx;}\n'
           + SND + '\n'
           "document.addEventListener('click',function(ev){var el=ev.target.closest&&ev.target.closest('a, button, [role=button], label');if(!el)return;"
           "try{var c=getCtx();if(c.state==='running')egSoftTap(c);else c.resume().then(function(){egSoftTap(c);}).catch(function(){});}catch(e){}},true);\n"
           '})();</script>\n')
    k = s.rfind('</body>')
    if k < 0:
        print('СТОП: нет </body>'); sys.exit(1)
    s2 = s[:k] + blk + s[k:]
    how = 'вставлен блок'
open(dst, 'w', encoding='utf-8', newline='').write(s2)
print('ЗВУК', dst, how, 'md5', hashlib.md5(s2.encode('utf-8')).hexdigest())
