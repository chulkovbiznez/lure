# KARTY v45b: превью стилей не видно — класс .pv занят окном просмотра Карт. Переименовать в .p45 (24.11)
import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'KARTY v45' not in s: sys.exit('НЕТ v45')
if '.p45{' in s: sys.exit('УЖЕ ИСПРАВЛЕНО')
n1=s.count('#st45 .pv{width:100%');n2=s.count('<span class="pv"')
if n1!=1 or n2!=2: sys.exit(f'НЕ НАЙДЕНО {n1} {n2}')
s=s.replace('#st45 .pv{width:100%','#st45 .p45{display:block;width:100%').replace('<span class="pv"','<span class="p45"')
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО v45b md5',hashlib.md5(s.encode('utf-8')).hexdigest())
