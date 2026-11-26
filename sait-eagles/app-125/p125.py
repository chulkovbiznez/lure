import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egFast1' not in s
anchor="/* вход: ключ сессии, автовыход через 30 дней бездействия"
i=s.index(anchor); j=s.index('</script>',i)+len('</script>')
blk=("\n<script id=\"egFast1\">/* 26.11 egFast1: уже вошёл и нет ?ref — сразу в профиль, без мелькания регистрации */"
"(function(){try{if(localStorage.getItem('eaglesfree_id')&&localStorage.getItem('eaglesfree_session')&&!/[?&]ref=/.test(location.search)){"
"document.write('<style id=\"egFastS\">body{visibility:hidden!important}</style>');"
"location.replace('/profile.html'+location.search);}}catch(e){}})();</script>")
s=s[:j]+blk+s[j:]
open(dst,'w',encoding='utf-8').write(s)
