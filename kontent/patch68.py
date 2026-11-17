# Задание 68: добавить eg-kontent.js в kanal.html и obuchenie.html (больше в страницах ничего не меняется).
# Запуск в папке ~/kanal68:  python3 patch68.py   (рядом должны лежать kanal-do-68.html и obuchenie-do-68.html)
import re, sys
TAG = '<script src="/eg-kontent.js?v=1" defer></script>'
k = open('kanal-do-68.html', encoding='utf-8').read()
o = open('obuchenie-do-68.html', encoding='utf-8').read()
kp = re.findall(r'<script src="/kanal-posty\.js\?v=\d+"(?: defer)?></script>', k)
bad = []
if len(kp) != 1: bad.append('kanal: тег kanal-posty.js найден %d раз (нужно 1)' % len(kp))
if 'eg-kontent' in k: bad.append('kanal: eg-kontent уже есть')
if 'eg-kontent' in o: bad.append('obuchenie: eg-kontent уже есть')
if o.count('</body>') != 1: bad.append('obuchenie: </body> найден %d раз (нужно 1)' % o.count('</body>'))
if 'learn-page' not in o: bad.append('obuchenie: нет learn-page (не та страница?)')
if 'id="eagles-kanal"' not in k: bad.append('kanal: нет eagles-kanal (не та страница?)')
if bad:
    print('СТОП:', '; '.join(bad)); sys.exit(1)
k2 = k.replace(kp[0], TAG + '\n<script src="/kanal-posty.js?v=3" defer></script>', 1)
i = o.rfind('</body>')
o2 = o[:i] + TAG + '\n' + o[i:]
open('kanal-v68.html', 'w', encoding='utf-8').write(k2)
open('obuchenie-v68.html', 'w', encoding='utf-8').write(o2)
print('OK kanal: было', kp[0], '| размер', len(k.encode()), '->', len(k2.encode()))
print('OK obuchenie: размер', len(o.encode()), '->', len(o2.encode()))
