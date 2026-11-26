import sys,re
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find('<h3>Календарь касаний</h3>'); assert i>0 and s.count('<h3>Календарь касаний</h3>')==1
a=s.rfind('<article',0,i)
m=re.compile(r'<img src="data:image/webp;base64,[A-Za-z0-9+/=]+"').search(s,a,i); assert m
s=s[:m.start()]+'<img src="/egd/img/kalendar-voda.webp?v=136" width="585" height="420"'+s[m.end():]
old='<p>Каждый день закрашивается по числу касаний. Нажми на день и увидишь подробно, с кем и как ты работал.</p>'
assert s.count(old)==1
s=s.replace(old,'<p>С каждым касанием водичка в кружке поднимается, а цифра сверху показывает, сколько их было. Нажми на день и увидишь, с кем и как ты работал.</p>')
open(dst,'w',encoding='utf-8').write(s)
