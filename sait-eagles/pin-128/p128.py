# 128: экран ПИН не мелькает перед загрузкой — #egp скрыт с самого начала до решения скрипта ПИН
import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egPre128' not in s
a='</script>'; i=s.index('<script id="egPinHour1">'); j=s.index(a,i)+len(a)
s=s[:j]+"<script id=\"egPre128\">try{if(localStorage.getItem('eaglesfree_id')&&localStorage.getItem('eaglesfree_session'))document.write('<style id=\"egpPre\">#egp{visibility:hidden!important}</style>')}catch(e){}</script>"+s[j:]
k=s.index('<script id="egBoot127">'); e=s.index('</script>',k)+len('</script>')
s=s[:e]+"<script>try{var egpP=document.getElementById('egpPre');egpP&&egpP.parentNode.removeChild(egpP)}catch(e){}</script>"+s[e:]
open(dst,'w',encoding='utf-8').write(s);print('ok')
