# Задание 107: подключает заставку старта (eg-start.js) к profile.html или index.html — одна строка перед </body>.
# Запуск: python3 patch107.py profile-do.html profile-new.html
import sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
TAG = '<!-- egStart1 --><script src="/eg-start.js?v=1" defer></script><!-- /egStart1 -->\n'
s = open(src, encoding='utf-8').read()
if 'egStart1' in s: sys.exit('СТОП: заставка уже подключена в ' + src)
i = s.rfind('</body>')
if i < 0: sys.exit('СТОП: нет </body> в ' + src)
s = s[:i] + TAG + s[i:]
if s.count('<!-- egStart1 -->') != 1 or s.count('<!-- /egStart1 -->') != 1: sys.exit('СТОП: проверка не прошла')
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО', dst, 'md5', hashlib.md5(s.encode('utf-8')).hexdigest(), 'байт', len(s.encode('utf-8')))
