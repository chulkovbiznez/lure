#!/usr/bin/env python3
"""bez-migan-eyrie (23.11.2026): убрать мелькание старой страницы при переходе Обучение <-> EYRIE (Канал).
Использование: python3 patch.py ПАПКА_С_ЖИВЫМИ_СТРАНИЦАМИ ПАПКА_ДЛЯ_НОВЫХ
1) egOb108 в 7 страницах: владелец (11111/23933) по вкладке EYRIE идёт СРАЗУ на /kanal.html (без eyrie.html с «Загружаю…»).
2) obuchenie.html и kanal.html: шторка kcWait1 — старая статичная разметка не рисуется, пока eg-kontent.js и kanal-posty.js
   не построили новый вид (снимается на DOMContentLoaded, страховка 3 с).
3) eyrie.html: переадресация владельца в самом начале <head>, до первой отрисовки.
"""
import sys, os, hashlib
SRC, DST = sys.argv[1], sys.argv[2]
os.makedirs(DST, exist_ok=True)
PAGES7 = ['profile', 'chat', 'contacts', 'obuchenie', 'kanal', 'roliki', 'binar']

A_OLD = "var O=['11111','23933'],d=document.documentElement,p=location.pathname,u='';"
A_NEW = A_OLD + "\nvar EY=(function(){try{var i=localStorage.getItem('eaglesfree_id')||'';return O.indexOf(i)>=0?'/kanal.html':'/eyrie.html';}catch(e){return '/eyrie.html';}})();/* egEy2: владелец сразу в свой канал (23.11.2026) */"
B_OLD = "a.setAttribute('href','/eyrie.html')"
B_NEW = "a.setAttribute('href',EY)"
C_OLD = "if(!a||/\\/eyrie(\\.html)?$/.test(p))return;e.preventDefault();e.stopImmediatePropagation();location.href='/eyrie.html';"
C_NEW = "if(!a||/\\/eyrie(\\.html)?$/.test(p))return;e.preventDefault();e.stopImmediatePropagation();if(EY==='/kanal.html'&&/\\/kanal(\\.html)?$/.test(p)&&!u)return;location.href=EY;"

CSS = {
 'obuchenie': "html.kcw #learnMain>:not(.ptop):not(.zl-sub),html.kcw .learn-page .lchip{visibility:hidden!important}",
 'kanal': "html.kcw #eagles-kanal .ek-w>:not(.zl-eyrie){visibility:hidden!important}",
}
def wait_block(css):
    return ("<script>/* kcWait1 (23.11.2026): пока eg-kontent.js не построил новый вид, старая разметка не видна (не мелькает). "
            "Снимается на DOMContentLoaded (после defer-скриптов), страховка 3 с. Откат: удалить этот блок. */\n"
            "(function(){try{var d=document.documentElement;d.classList.add('kcw');var st=document.createElement('style');st.id='kcWait1';"
            "st.textContent=" + repr(css).replace("'", "'") + ";(document.head||d).appendChild(st);"
            "function on(){d.classList.remove('kcw');}document.addEventListener('DOMContentLoaded',on);setTimeout(on,3000);}catch(e){}})();\n</script>\n")

def md5(b): return hashlib.md5(b).hexdigest()[:8]
for p in PAGES7:
    s = open(f'{SRC}/{p}.html', encoding='utf-8').read(); o = s
    for a, b in ((A_OLD, A_NEW), (B_OLD, B_NEW), (C_OLD, C_NEW)):
        assert s.count(a) == 1, (p, a[:40], s.count(a)); s = s.replace(a, b)
    if p in CSS:
        assert 'kcWait1' not in s
        i = s.index('</script>', s.index('egOb108')) + len('</script>\n')
        s = s[:i] + wait_block(CSS[p]) + s[i:]
    open(f'{DST}/{p}.html', 'w', encoding='utf-8').write(s)
    print(p, len(o.encode()), md5(o.encode()), '->', len(s.encode()), md5(s.encode()))

s = open(f'{SRC}/eyrie.html', encoding='utf-8').read(); o = s
H = "<head>\n"
assert s.count(H) == 1 and 'egEy2' not in s
s = s.replace(H, H + "<script>/* egEy2 (23.11.2026): владелец сразу в свой канал, до отрисовки «Загружаю…» */try{var i=localStorage.getItem('eaglesfree_id');if(i==='11111'||i==='23933')location.replace('/kanal.html');}catch(e){}</script>\n", 1)
open(f'{DST}/eyrie.html', 'w', encoding='utf-8').write(s)
print('eyrie', len(o.encode()), md5(o.encode()), '->', len(s.encode()), md5(s.encode()))
