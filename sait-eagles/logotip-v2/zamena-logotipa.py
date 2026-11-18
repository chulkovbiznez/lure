# -*- coding: utf-8 -*-
"""Задание 80 (18.11.2026): новый логотип EAGLES «Зеркало твоего бизнеса».
Меняет в странице встроенные картинки старого логотипа EAGLES на новые (узнаёт старую картинку по md5),
и пропорции 660/401 → 660/405. Больше в странице ничего не трогает.
Картинки бывают двух видов: data:image/...;base64,XXX в HTML/CSS и base64, разрезанный на куски строк в JS.
Запуск: python3 zamena-logotipa.py ВХОД.html ВЫХОД.html   (картинки logo-*.webp лежат рядом со скриптом)
"""
import sys, re, base64, hashlib, os

D = os.path.dirname(os.path.abspath(__file__))
def b64(fn):
    return base64.b64encode(open(os.path.join(D, fn), 'rb').read()).decode()

ZAMENA = {
    '78d9d3d7b2e8618f72b1086866b466a9': b64('logo-660.webp'),              # главная: вход; профиль: экран загрузки
    '21eed7a1bfa9c8f58e231703f9496018': b64('logo-380.webp'),              # главная: шапка
    'c8dc78280c798a23b879fd404bdae336': b64('logo-440.webp'),              # профиль: большой логотип сверху
    'c94218420c050fed457e023ee93300de': b64('logo-bez-slogana-380.webp'),  # обучение: фон шапки
    '39092203efe7390b4ba3b12ccf9b00d0': b64('logo-bez-slogana-260.webp'),  # маркетинг: логотип
}

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
n = 0

def md5b(raw):
    try:
        return hashlib.md5(base64.b64decode(raw)).hexdigest()
    except Exception:
        return ''

# 1) data:image/...;base64,XXX
def rep_uri(m):
    global n
    h = md5b(m.group(2))
    if h in ZAMENA:
        n += 1
        return 'data:image/webp;base64,' + ZAMENA[h]
    return m.group(0)
s2 = re.sub(r'data:image/(\w+);base64,([A-Za-z0-9+/=]+)', rep_uri, s)

# 2) base64 кусками строк в JS: 'UklGR...' + '...' или ['UklGR...', '...']
PAT = re.compile(r"""(['"])(?:UklGR|iVBORw0K|/9j/)[A-Za-z0-9+/=]*\1(?:\s*[+,]\s*(['"])[A-Za-z0-9+/=]*\2)*""")
def rep_js(m):
    global n
    raw = ''.join(re.findall(r"""['"]([A-Za-z0-9+/=]*)['"]""", m.group(0)))
    h = md5b(raw)
    if h in ZAMENA:
        n += 1
        q = m.group(1)
        return q + ZAMENA[h] + q
    return m.group(0)
s2 = PAT.sub(rep_js, s2)

k = s2.count('660/401')
s2 = s2.replace('660/401', '660/405')
if n == 0:
    print('СТОП: старый логотип не найден в', src); sys.exit(1)
open(dst, 'w', encoding='utf-8', newline='').write(s2)
print('ГОТОВО', dst, 'логотипов заменено:', n, 'пропорций:', k, 'md5', hashlib.md5(s2.encode('utf-8')).hexdigest())
