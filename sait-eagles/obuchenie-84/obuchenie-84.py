# -*- coding: utf-8 -*-
"""Задание 84 (18.11.2026): «Обучение» только у Андрея.
Вставляет блок blok-84.html сразу после <head> страницы сайта EAGLES.
Запуск: python3 obuchenie-84.py ВХОД.html ВЫХОД.html
Коды выхода: 0 — ГОТОВО; 2 — НЕ НУЖНО (на странице нет ссылки на Обучение); 1 — СТОП.
"""
import sys, os, re, hashlib
D = os.path.dirname(os.path.abspath(__file__))
BLK = open(os.path.join(D, 'blok-84.html'), encoding='utf-8').read().strip() + '\n'
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
name = os.path.basename(src)
if 'egObOnly1' in s:
    print('СТОП: блок 84 уже стоит в', name); sys.exit(1)
if 'egTapV2' not in s:
    print('СТОП: в', name, 'нет звука из задания 80 — сначала задание 80'); sys.exit(1)
if 'obuchenie.html' not in s and not name.startswith('obuchenie'):
    print('НЕ НУЖНО', name, '(нет ссылки на Обучение)'); sys.exit(2)
m = re.search(r'<head[^>]*>', s, re.I)
if not m:
    print('СТОП: в', name, 'нет <head>'); sys.exit(1)
k = m.end()
s2 = s[:k] + '\n' + BLK + s[k:]
open(dst, 'w', encoding='utf-8', newline='').write(s2)
print('ГОТОВО', dst, 'md5', hashlib.md5(s2.encode('utf-8')).hexdigest())
