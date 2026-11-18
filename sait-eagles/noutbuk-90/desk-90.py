#!/usr/bin/env python3
# Задание 90: широкая версия для ноутбука — подключает общий файл /egd/desk.css и /egd/desk.js к странице.
# На телефоне ничего не меняется: всё срабатывает только на экране шире 1200 точек.
import sys, hashlib
p, out = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read()
if 'egDesk1' in s:
    sys.exit('СТОП: ноутбук уже стоит')
if s.count('</head>') != 1:
    sys.exit('СТОП: не нашёл </head> (%d)' % s.count('</head>'))
tag = ('<!-- egDesk1: широкая версия для ноутбука (18.11.2026) -->'
       '<link rel="stylesheet" href="/egd/desk.css?v=1">'
       '<script src="/egd/desk.js?v=1" defer></script>\n')
s = s.replace('</head>', tag + '</head>')
open(out, 'w', encoding='utf-8').write(s)
b = s.encode('utf-8')
print('ГОТОВО egDesk1 вставлен', out, 'md5', hashlib.md5(b).hexdigest(), 'байт', len(b))
