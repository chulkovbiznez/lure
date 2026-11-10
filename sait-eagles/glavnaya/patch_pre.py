import sys
src,dst=sys.argv[1],sys.argv[2]
import os
s=open(src,encoding='utf-8').read()
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'glav-pre.html'),encoding='utf-8').read().strip()
if 'id="glavPreV1"' in s: print('УЖЕ СТОИТ: glavPreV1 уже есть'); sys.exit(1)
if s.count('id="glavV1"')!=1: print('СТОП: нет новой главной glavV1 (сначала задание 32)'); sys.exit(1)
if s.count('</head>')!=1 or s.count('id="eglnd"')!=1: print('СТОП: не нашёл </head> или eglnd ровно один раз'); sys.exit(1)
s=s.replace('</head>',blk+'</head>',1)
open(dst,'w',encoding='utf-8',newline='').write(s)
print('ГОТОВО %d байт'%len(s.encode('utf-8')))
