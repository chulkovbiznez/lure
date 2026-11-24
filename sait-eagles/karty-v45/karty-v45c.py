# KARTY v45c: плитки Акварель и Комикс пустые — в подложке был чистый цвет/размер, недопустимые в background-image. Заменить на градиенты (24.11)
import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if '.p45{' not in s: sys.exit('НЕТ v45b')
a="transparent 50%),#fbf7f0']"
b="'radial-gradient(circle,#111 0 1.5px,transparent 2px) 0 0/8px 8px,#ffd23f'"
if s.count(a)!=1 or s.count(b)!=1: sys.exit(f'НЕ НАЙДЕНО {s.count(a)} {s.count(b)}')
s=s.replace(a,"transparent 50%),linear-gradient(#fbf7f0,#fbf7f0)']").replace(b,"'linear-gradient(135deg,#ffd23f,#e8321a)'")
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО v45c md5',hashlib.md5(s.encode('utf-8')).hexdigest())
