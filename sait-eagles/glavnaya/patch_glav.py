# Новая главная EAGLES (задание 31): добавляет блок glav-blok.html перед последним </body> в index.html.
# Старый код страницы не меняется. Запуск: python3 patch_glav.py СТАРЫЙ.html НОВЫЙ.html
import sys,os
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'id="glavV1"' in s: print('УЖЕ СТОИТ: новая главная уже есть в файле, ничего не делаю'); sys.exit(1)
need=['id="eglnd"','id="btnReg"','id="btnIn"','id="btnIns"','id="regIn"','id="mBox"','id="mName"','id="mId"','id="fN"','id="fF"','id="fE"','id="cont"','id="ciT"','id="cT"','id="cM"','id="cW"','id="cP"','id="vT"','id="pol"','id="polCb"','id="cta"','id="rSt"','id="vhodV1"','id="fsOffV1"']
miss=[x for x in need if s.count(x)!=1]
if miss: print('СТОП: в странице не найдено (или найдено не по одному разу):',', '.join(miss)); sys.exit(1)
if s.count('</body>')<1: print('СТОП: нет </body>'); sys.exit(1)
b=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'glav-blok.html'),encoding='utf-8').read()
i=s.rfind('</body>');out=s[:i]+b+s[i:]
open(dst,'w',encoding='utf-8',newline='').write(out)
print('ГОТОВО',len(out.encode('utf-8')),'байт')
