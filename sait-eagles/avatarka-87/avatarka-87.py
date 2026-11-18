#!/usr/bin/env python3
# Задание 87: аватарка в Профиле появляется сразу (копия в телефоне), потом сверяется с сервером.
import sys
p = sys.argv[1] if len(sys.argv) > 1 else 'profile.html'
s = open(p, encoding='utf-8').read()
if 'egAva1' in s:
    sys.exit('УЖЕ ЕСТЬ egAva1 — ничего не меняю')
if 'editNameLink' not in s or 'egpn' not in s:
    sys.exit('ЭТО НЕ ПРОФИЛЬ — стоп')
A = '<span id="cabAvatarPlaceholder"></span></div></div>'
B = 'function setAvatar(src){'
C = "nameEditBlock.addEventListener('click', function(ev){ if(ev.target === nameEditBlock) showName(); });"
for k in (A, B, C):
    if s.count(k) != 1:
        sys.exit('НЕ НАШЁЛ МЕСТО (%d): %s' % (s.count(k), k[:40]))
early = ("<script>/* egAva1: аватарка сразу из копии */(function(){try{var id=localStorage.getItem('eaglesfree_id');"
         "var a=id&&localStorage.getItem('egAva-'+id);if(!a)return;var i=document.getElementById('cabAvatarImg'),"
         "p=document.getElementById('cabAvatarPlaceholder');i.src=a;i.style.display='block';if(p)p.style.display='none';}catch(e){}})();</script>")
s = s.replace(A, A + early)
s = s.replace(B, B + " /* egAva1 */ try{var _id=localStorage.getItem('eaglesfree_id');if(_id&&src&&src.length<300000)localStorage.setItem('egAva-'+_id,src);}catch(e){}"
                 " if(previewImg.getAttribute('src')===src&&modalImg.getAttribute('src')===src&&previewImg.style.display==='block')return;")
s = s.replace(C, "/* egAva1 */ try{var _ca=localStorage.getItem('egAva-'+localStorage.getItem('eaglesfree_id'));if(_ca)setAvatar(_ca);}catch(e){}\n  " + C)
open(p, 'w', encoding='utf-8').write(s)
print('OK egAva1 вставлен')
