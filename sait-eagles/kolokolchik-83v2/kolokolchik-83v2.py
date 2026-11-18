# Задание 83 v2: меняет колокольчик v1 (egBell1) на v2 (egBell2) в profile.html. Если v1 нет — вставляет перед </body>.
# Запуск: python3 kolokolchik-83v2.py profile-do-83v2.html profile-new83v2.html
import sys, os, hashlib
src, dst = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
blok = open(os.path.join(here, 'blok-83v2.html'), encoding='utf-8').read()
s = open(src, encoding='utf-8').read()
if '<!-- egBell2' in s: sys.exit('СТОП: колокольчик v2 уже стоит в ' + src)
if 'editNameLink' not in s or 'egpn' not in s: sys.exit('СТОП: это не страница Профиля ' + src)
a = s.find('<!-- egBell1:'); b = s.find('<!-- /egBell1 -->')
if a >= 0 and b > a:
    b += len('<!-- /egBell1 -->')
    if s[b:b+1] == '\n': b += 1
    s = s[:a] + blok + s[b:]; how = 'v1 заменён на v2'
else:
    i = s.rfind('</body>')
    if i < 0: sys.exit('СТОП: нет </body> в ' + src)
    s = s[:i] + blok + s[i:]; how = 'v2 вставлен (v1 не было)'
if s.count('egBell1:') or s.count('<!-- egBell2') != 1: sys.exit('СТОП: проверка не прошла')
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО', how, dst, 'md5', hashlib.md5(s.encode('utf-8')).hexdigest(), 'байт', len(s.encode('utf-8')))
