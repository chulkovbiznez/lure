#!/usr/bin/env python3
# Задание 89: облегчить Профиль — большие вшитые картинки (data:...;base64) выносятся в отдельные файлы egd/img/<хеш>.<тип>.
# Картинка экрана загрузки/ПИН (--zgr-img) остаётся внутри страницы, чтобы она появлялась мгновенно.
# Запуск: python3 legche-89.py profile-do-89.html profile-new89.html img89
import sys, re, os, hashlib, base64
src, out, d = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding='utf-8').read()
if 'egLegche89' in s:
    sys.exit('СТОП: облегчение 89 уже стоит')
if 'editNameLink' not in s or 'egpn' not in s:
    sys.exit('СТОП: это не страница Профиля')
EXT = {'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg'}
os.makedirs(d, exist_ok=True)
rx = re.compile(r'data:(image/(?:webp|png|jpeg|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)')
files = {}
def rep(m):
    full = m.group(0)
    if len(full) < 3000:
        return full
    before = s[max(0, m.start() - 20):m.start()]
    if '--zgr-img' in before:
        return full
    raw = base64.b64decode(m.group(2))
    h = hashlib.md5(raw).hexdigest()[:16]
    name = h + '.' + EXT[m.group(1)]
    if name not in files:
        open(os.path.join(d, name), 'wb').write(raw)
        files[name] = len(raw)
    return '/egd/img/' + name
n = rx.sub(rep, s)
if not files:
    sys.exit('СТОП: нечего выносить')
n = n.replace('</head>', '<!-- egLegche89: картинки вынесены в /egd/img/ (18.11.2026) -->\n</head>', 1)
open(out, 'w', encoding='utf-8').write(n)
b = n.encode('utf-8')
print('ГОТОВО egLegche89', out, 'md5', hashlib.md5(b).hexdigest(), 'байт', len(b), 'было', len(s.encode('utf-8')), 'картинок', len(files))
