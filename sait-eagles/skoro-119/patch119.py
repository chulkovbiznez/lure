# Задание 119: «ноябрь» → «декабрь» + подключение eg-skoro.js. python3 patch119.py pdo pnew
import sys, os
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
TAG = '<script src="/eg-skoro.js?v=1"></script>\n'
R = {
 'binar.html': [("'откроется скоро, в ноябре'", "'откроется скоро, в декабре'", 1)],
 'contacts.html': [('Оплата подключится 22 ноября 2026.', 'Оплата подключится в декабре 2026.', 1)],
 'roliki.html': [('Оплата подключится 22 ноября 2026.', 'Оплата подключится в декабре 2026.', 1)],
 'obuchenie.html': [('Оплата подключится 22 ноября 2026.', 'Оплата подключится в декабре 2026.', 1),
                    ('🔒 С 1.11.2026 — уроки по сетевому', '🔒 С декабря 2026 — уроки по сетевому', 1),
                    ('<title>', TAG + '<title>', 1)],
 'kanal.html': [('<title>', TAG + '<title>', 1)],
 'profile.html': [('скоро, в ноябре', 'скоро, в декабре', 4),
                  ('сетевому маркетингу с ноября', 'сетевому маркетингу с декабря', 1),
                  ('и сетевому маркетингу, с ноября', 'и сетевому маркетингу, с декабря', 1)],
}
ok = True
for f, reps in R.items():
    s = open(os.path.join(src, f), encoding='utf-8').read()
    if 'eg-skoro.js' in s: print('STOP', f, 'уже с eg-skoro'); ok = False; continue
    for a, b, n in reps:
        c = s.count(a)
        if c != n: print('STOP', f, 'нашёл', c, 'вместо', n, ':', a[:40]); ok = False
        if f in ('obuchenie.html','kanal.html') and a == '<title>': s = s.replace(a, b, 1)
        else: s = s.replace(a, b)
    open(os.path.join(dst, f), 'w', encoding='utf-8').write(s)
    print('ok', f)
sys.exit(0 if ok else 1)
