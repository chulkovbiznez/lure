# Задание 95: вставляет широкую версию LURE для ноутбука (block95.html) перед </head>.
# Запуск: python3 lure-desk-95.py index-do-95.html index-new95.html
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'lureDesk95' in s: print('СТОП: ноутбук уже стоит (lureDesk95 есть)');sys.exit(1)
if s.count('</head>')!=1: print('СТОП: </head> не один');sys.exit(1)
b=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block95.html'),encoding='utf-8').read()
s=s.replace('</head>',b+'</head>',1)
open(dst,'w',encoding='utf-8').write(s)
d=open(dst,'rb').read()
print('ГОТОВО lureDesk95 вставлен',dst,'md5',hashlib.md5(d).hexdigest(),'байт',len(d))
