# -*- coding: utf-8 -*-
"""LURE: возврат в Карты EAGLES (18.11.2026, просьба Андрея, задание 82).
Если LURE открыт из Карт (lure.eaglesteam.ru/#img&ar=1:1&back=karty&p=...):
- вверху слева вместо стрелки — кнопка «Вернуться в карты» (ведёт на app.eaglesteam.ru/karty.html#iz-lure,
  Карты сами откроют то место, где ты добавлял иконку/фото);
- после «Создать картинку» поле промпта очищается (промпт больше не всплывает снова);
- в окне готовой картинки под «Скачать» — большая кнопка «Вернуться в карты».
Обычный вход в LURE (без back=karty) — всё как было. Работает и до задания 81, и после.
Запуск: python3 lure-vozvrat-v82.py ВХОД.html ВЫХОД.html
"""
import sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
if 'lure_back' in s:
    print('СТОП: возврат в Карты уже стоит'); sys.exit(1)
def rep(a, b):
    global s
    n = s.count(a)
    if n != 1:
        print('СТОП: якорь найден', n, 'раз:', a[:90]); sys.exit(1)
    s = s.replace(a, b)

CSS = ('/* Возврат в Карты (18.11.2026, задание 82) */\n'
       '.top .wrap>.back.tokarty{width:auto;max-width:48vw;height:32px;gap:2px;padding:0 11px 0 5px;border:.5px solid rgba(233,162,59,.6)!important;border-radius:999px;'
       'color:var(--gold1);font:700 12.5px/1 var(--f);white-space:nowrap;text-decoration:none;background:#15110b}\n'
       '.top .wrap>.back.tokarty svg{width:17px;height:17px}\n'
       '.top .wrap>.back.tokarty~.bal{width:auto;min-width:56px}\n'
       '#vKarty{margin-top:8px;text-decoration:none}\n'
       '.bkpulse{animation:bkP 1s ease-in-out 4}@keyframes bkP{50%{box-shadow:0 0 0 4px rgba(255,210,63,.5),0 0 24px rgba(255,170,40,.6)}}\n')
i = s.find('</style>')
if i < 0:
    print('СТОП: нет </style>'); sys.exit(1)
s = s[:i] + CSS + s[i:]

rep('<button class="btn2" id="vClose" type="button"',
    '<a class="btn" id="vKarty" href="https://app.eaglesteam.ru/karty.html#iz-lure" hidden>← Вернуться в карты</a>\n      <button class="btn2" id="vClose" type="button"')

JS = r'''/* Возврат в Карты (18.11.2026, задание 82): пришли из Карт (#...&back=karty) — помним до 6 часов в этой вкладке */
var KARTYU='https://app.eaglesteam.ru/karty.html#iz-lure',BKK=(function(){var h=location.hash,v=null;
  try{if(/[#&]back=karty(&|$)/.test(h))sessionStorage.setItem('lure_back',String(Date.now()));else if(!h||h==='#')sessionStorage.removeItem('lure_back');v=sessionStorage.getItem('lure_back')}catch(e){}
  return v&&Date.now()-(+v)<6*3600e3?1:0})();
function bkOff(){try{sessionStorage.removeItem('lure_back')}catch(e){}}
(function(){if(!BKK)return;var a=document.querySelector('.top .back');if(a){a.href=KARTYU;a.classList.add('tokarty');a.setAttribute('aria-label','Вернуться в карты');
  a.innerHTML='<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg><span>Вернуться в карты</span>';a.addEventListener('click',bkOff)}
  var v=document.getElementById('vKarty');if(v){v.hidden=false;v.addEventListener('click',bkOff)}})();
'''
rep('/* Промпт снаружи (08.11.2026', JS + '/* Промпт снаружи (08.11.2026')

rep("""  toast(PFM?'Промпт уже вставлен""", """  if(BKK){toast('Промпт для Карт готов, формат 1:1. Выбери модель и нажми «Создать картинку». Потом нажми на картинку → «Скачать» → «Вернуться в карты»');return}
  toast(PFM?'Промпт уже вставлен""")

rep("""GAL[t].unshift(r.job);drawGal(t);poll();toast(t==='img'?'Рисую. Картинка появится ниже.'""",
    """GAL[t].unshift(r.job);drawGal(t);poll();if(BKK&&t==='img'){$('imgP').value='';mgrow($('imgP'));toast('Рисую. Когда появится — нажми на неё → «Скачать» → «Вернуться в карты»');return}toast(t==='img'?'Рисую. Картинка появится ниже.'""")

rep("""b.textContent=bt;toast('Скачано ✓ Файл в «Загрузках»')""",
    """b.textContent=bt;if(BKK){toast('Скачано ✓ Теперь «Вернуться в карты»');var k=$('vKarty');k.classList.remove('bkpulse');void k.offsetWidth;k.classList.add('bkpulse');return}toast('Скачано ✓ Файл в «Загрузках»')""")

open(dst, 'w', encoding='utf-8', newline='').write(s)
print('ГОТОВО', dst, len(s.encode('utf-8')), 'байт, md5', hashlib.md5(s.encode('utf-8')).hexdigest())
