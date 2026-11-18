#!/usr/bin/env python3
# Задание 87: аватарка в Профиле появляется сразу (копия в телефоне), потом сверяется с сервером.
import sys, hashlib
p = sys.argv[1]
out = sys.argv[2]
s = open(p, encoding='utf-8').read()
if 'egAva1' in s:
    sys.exit('СТОП: аватарка 87 уже стоит')
if 'editNameLink' not in s or 'egpn' not in s:
    sys.exit('СТОП: это не страница Профиля')
A = '<span id="cabAvatarPlaceholder"></span></div></div>'
B = 'function setAvatar(src){'
C = "nameEditBlock.addEventListener('click', function(ev){ if(ev.target === nameEditBlock) showName(); });"
for k in (A, B, C):
    if s.count(k) != 1:
        sys.exit('СТОП: не нашёл место (%d): %s' % (s.count(k), k[:40]))
early = ("<script>/* egAva1: аватарка сразу из копии */(function(){try{var id=localStorage.getItem('eaglesfree_id');"
         "var a=id&&localStorage.getItem('egAva-'+id);if(!a)return;var i=document.getElementById('cabAvatarImg'),"
         "p=document.getElementById('cabAvatarPlaceholder');i.src=a;i.style.display='block';if(p)p.style.display='none';}catch(e){}})();</script>")
s = s.replace(A, A + early)
s = s.replace(B, B + " /* egAva1 */ try{var _id=localStorage.getItem('eaglesfree_id');if(_id&&src&&src.length<300000)localStorage.setItem('egAva-'+_id,src);}catch(e){}"
                 " if(previewImg.getAttribute('src')===src&&modalImg.getAttribute('src')===src&&previewImg.style.display==='block')return;")
s = s.replace(C, "/* egAva1 */ try{var _ca=localStorage.getItem('egAva-'+localStorage.getItem('eaglesfree_id'));if(_ca)setAvatar(_ca);}catch(e){}\n  " + C)
open(out, 'w', encoding='utf-8').write(s)
b = s.encode('utf-8')
print('ГОТОВО egAva1 вставлен', out, 'md5', hashlib.md5(b).hexdigest(), 'байт', len(b))
