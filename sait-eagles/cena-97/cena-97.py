# -*- coding: utf-8 -*-
"""Задание 97 (19.11.2026): новые цены EAGLES на страницах сайта — E1 499 ₽, E6 2 590 ₽ (432 ₽/мес), E12 4 990 ₽ (416 ₽/мес).
Запуск: python3 cena-97.py ПАПКА   (в папке лежат живые файлы *-do-97.html; рядом пишутся *-97.html)
Меняет только цены и примеры с ценами. Если в файле после замен остались старые цены — СТОП по всем файлам, ничего не пишет.
"""
import sys, re, os, hashlib
D = sys.argv[1]
FILES = ['faq', 'marketing', 'oferta', 'profile', 'vyplaty', 'contacts', 'obuchenie', 'roliki']
SP = r'(?: |&nbsp;| )'
NB = r'(?<!\d)(?<!\d )(?<!\d\u00a0)(?<!\d&nbsp;)'
OLD = re.compile(NB + r'(?:199|999|1' + SP + r'?690)' + SP + r'?(?:₽|руб)|167' + SP + r'?₽' + SP + r'в месяц|141' + SP + r'?₽' + SP + r'в месяц|EG_PAY = \{[^}]*price: 199\b|начислено 423')
R = [
  (NB + r'199(' + SP + r'×' + SP + r'17' + SP + r'÷' + SP + r'30' + SP + r'=' + SP + r')112,77', r'499\g<1>282,77'),
  (r'начислено 423(' + SP + r'₽\.' + SP + r'Через 2 месяца он вернул' + SP + r')1' + SP + r'400(' + SP + r'₽' + SP + r'\(83%\)\.' + SP + r'Из твоих следующих бонусов вычтется' + SP + r')351(' + SP + r'₽' + SP + r'\(83%' + SP + r'от' + SP + r')423',
   r'начислено 1 248\g<1>4 158\g<2>1 040\g<3>1 248'),
  (NB + r'199(' + SP + r'?(?:₽|руб))', r'499\g<1>'),
  (NB + r'999(' + SP + r'?(?:₽|руб))', r'2 590\g<1>'),
  (NB + r'1(' + SP + r'?)690(' + SP + r'?(?:₽|руб))', r'4\g<1>990\g<2>'),
  (NB + r'167(' + SP + r'?₽' + SP + r'в месяц)', r'432\g<1>'),
  (NB + r'141(' + SP + r'?₽' + SP + r'в месяц)', r'416\g<1>'),
  (r"(EG_PAY = \{[^}]*price: )199\b", r'\g<1>499'),
]
out, bad = {}, []
for f in FILES:
    p = os.path.join(D, f + '-do-97.html')
    if not os.path.exists(p):
        print('нет файла', p); bad.append(f); continue
    s = open(p, encoding='utf-8', newline='').read(); n = 0
    for a, b in R:
        s, k = re.subn(a, b, s); n += k
    left = OLD.findall(s)
    if left:
        bad.append(f); print('СТОП', f, 'остались старые цены:', left[:5])
    out[f] = (s, n)
if bad:
    print('СТОП: ничего не записано. Проблемные файлы:', bad); sys.exit(1)
for f, (s, n) in out.items():
    b = s.encode('utf-8'); open(os.path.join(D, f + '-97.html'), 'wb').write(b)
    print('ГОТОВО', f + '-97.html', 'замен', n, 'md5', hashlib.md5(b).hexdigest())
