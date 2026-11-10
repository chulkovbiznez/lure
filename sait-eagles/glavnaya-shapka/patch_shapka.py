import sys,os
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'shapka-blok.html'),encoding='utf-8').read().strip()
if 'id="glavTopV1"' in s: print('УЖЕ СТОИТ: glavTopV1 уже есть'); sys.exit(1)
if s.count('id="glavV1"')!=1: print('СТОП: нет новой главной glavV1'); sys.exit(1)
i=s.rfind('</body>')
if i<0 or i<s.find('id="glavV1"'): print('СТОП: не нашёл </body> после glavV1'); sys.exit(1)
s=s[:i]+blk+s[i:]
open(dst,'w',encoding='utf-8',newline='').write(s)
print('ГОТОВО %d байт'%len(s.encode('utf-8')))
