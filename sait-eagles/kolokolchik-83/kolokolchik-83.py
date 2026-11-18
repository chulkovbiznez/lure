# Задание 83: вставляет колокольчик (blok-83.html) в profile.html перед </body>.
# Запуск: python3 kolokolchik-83.py profile-do-83.html profile-new83.html
import sys, os, hashlib
src, dst = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
blok = open(os.path.join(here, 'blok-83.html'), encoding='utf-8').read()
s = open(src, encoding='utf-8').read()
if 'egBell1' in s: sys.exit('СТОП: колокольчик уже стоит в ' + src)
if 'editNameLink' not in s or 'egpn' not in s: sys.exit('СТОП: это не страница Профиля ' + src)
i = s.rfind('</body>')
if i < 0: sys.exit('СТОП: нет </body> в ' + src)
s = s[:i] + blok + s[i:]
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО', dst, 'md5', hashlib.md5(s.encode('utf-8')).hexdigest(), 'байт', len(s.encode('utf-8')))
