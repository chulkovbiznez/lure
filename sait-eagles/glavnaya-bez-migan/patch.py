import sys,os
src,dst=sys.argv[1],sys.argv[2]
D=os.path.dirname(os.path.abspath(__file__))
s=open(src,encoding='utf-8').read()
H=open(os.path.join(D,'blok-head.html'),encoding='utf-8').read().strip()
B=open(os.path.join(D,'blok-body.html'),encoding='utf-8').read().strip()
if 'id="glavFixV1"' in s: print('УЖЕ СТОИТ: glavFixV1 уже есть'); sys.exit(1)
if s.count('id="glavV1"')!=1 or s.count('id="glavTopV1"')!=1 or s.count('id="glavPreV1"')!=1: print('СТОП: нет glavV1, glavTopV1 или glavPreV1 (сначала задания 32, 40, 42)'); sys.exit(1)
if s.count('</head>')!=1: print('СТОП: </head> не один'); sys.exit(1)
s=s.replace('</head>',H+'</head>',1)
i=s.rfind('</body>')
if i<s.find('id="glavTopV1"'): print('СТОП: не нашёл </body> после glavTopV1'); sys.exit(1)
s=s[:i]+B+s[i:]
open(dst,'w',encoding='utf-8',newline='').write(s)
print('ГОТОВО %d байт'%len(s.encode('utf-8')))
