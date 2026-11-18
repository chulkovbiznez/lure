# -*- coding: utf-8 -*-
"""Карты EAGLES v41 (18.11.2026, решение Андрея: «1 карта и 3 острова»).
Бесплатный (и тот, у кого закончился EAGLES Pro): работают первая карта и первые 3 острова на ней.
Всё остальное остаётся на месте, но серое с замком «PRO»: открыть и изменить нельзя, ничего не удаляется.
Нажал на серое — окно «Продли EAGLES Pro, и всё снова откроется» с кнопкой «Продлить Pro» (ведёт в Профиль).
При входе, если что-то на паузе, один раз за сессию то же окно. Pro и Андрей ничего не замечают (сервер шлёт lim только не-Pro).
Сервер не меняется. Ставится поверх v40 (задание 82). Запуск: python3 karty-v41.py ВХОД.html ВЫХОД.html
"""
import sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
if 'KARTY v41' in s:
    print('СТОП: v41 уже стоит'); sys.exit(1)
if 'KARTY v40' not in s:
    print('СТОП: нет v40 (сначала задание 82)'); sys.exit(1)
def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    if n != cnt:
        print('СТОП: якорь найден', n, 'раз:', a[:90]); sys.exit(1)
    s = s.replace(a, b)

CSS = r'''/* KARTY v41 (18.11.2026): после FREE-лимита карты и острова серые с замком */
.mc.lkd .mc-cov,.mc.lkd .mc-b,.mc.lkd .mc-n{filter:grayscale(1) brightness(.5)}
.mc-lk{position:absolute;top:14px;left:14px;z-index:4;padding:5px 10px;border-radius:99px;background:rgba(10,8,6,.88);border:1px solid rgba(255,210,63,.55);color:#ffd23f;font:900 11px/1 var(--f);letter-spacing:.06em;pointer-events:none}
.nd.lkd{filter:grayscale(1) brightness(.45)}
.lkd-l{opacity:.45;filter:grayscale(1)}
'''
rep('/* KARTY v40 (18.11.2026)', CSS + '/* KARTY v40 (18.11.2026)')

JS = r'''// KARTY v41 (18.11.2026): FREE = 1 карта + 3 острова; лишнее (например, после окончания Pro) серое, на паузе, не удаляется
const mLk=i=>!!LIM&&i>=LIM.maps;
const islOf=m=>((m&&m.data&&m.data.kids)||[]).filter(k=>Array.isArray(k.kids));
const lkIsl=mi=>!LIM||mi>=LIM.maps?[]:islOf(MAPS[mi]).slice(LIM.isl);
const hasD=(a,d)=>a===d||(Array.isArray(a.kids)&&a.kids.some(k=>hasD(k,d)));
function dLk(mi,d){if(!LIM)return false;if(mLk(mi))return true;return lkIsl(mi).some(k=>hasD(k,d))}
let LKD=new Set();
function nLk(n){if(!LIM||!LKD.size||!n)return false;let a=n;while(a&&a.depth>1)a=a.parent;return !!a&&LKD.has(a.d)}
function proLk(what){box('Доступно в EAGLES Pro',(what||'Это')+' на паузе: бесплатно открыты 1 карта и 3 острова на ней.\nВсё, что тут было, сохранено. Продли EAGLES Pro, и всё снова откроется.',null,'Продлить Pro',()=>{location.href='/profile.html'})}
function markLk(){LKD=new Set(lkIsl(curMap));if(!LKD.size)return;nodes.forEach(n=>{if(nLk(n)){if(n.dot)n.dot.classList.add('lkd');if(n.el)n.el.classList.add('lkd-l')}})}
{const _lm=loadMap;loadMap=function(i,fly){if(mLk(i))i=0;const r=_lm.call(this,i,fly===undefined?true:fly);markLk();return r}}
{const _rf=refresh;refresh=function(){const r=_rf.apply(this,arguments);markLk();return r}}
{const _t=tap;tap=function(n){if(nLk(n)){proLk('Этот остров');return}return _t.apply(this,arguments)}}
{const _pk=peekOn;peekOn=function(x,y,n){if(nLk(n)){proLk('Этот остров');return}return _pk.apply(this,arguments)}}
{const _of=openFromDeck;openFromDeck=function(i){if(mLk(i)){proLk('Эта карта');return}return _of.apply(this,arguments)}}
{const _oe=openEditMap;openEditMap=function(i){if(mLk(i)){proLk('Эта карта');return}return _oe.apply(this,arguments)}}
{const _ps=pickSR;pickSR=function(i){const x=SR[i];if(x&&dLk(x.mi,x.d)){closeSearch();$('dl').hidden=true;proLk(x.kind==='map'?'Эта карта':x.kind==='multi'?'Этот остров':'Это дело');return}return _ps.apply(this,arguments)}}
{const _ch=cardHTML;cardHTML=function(m,i){let h=_ch(m,i);if(mLk(i))h=h.replace('<div class="mc" ','<div class="mc lkd" ').replace('<i class="mc-sh"></i>','<i class="mc-sh"></i><i class="mc-lk">🔒 PRO</i>');return h}}
(function lkHello(n){if(!READY){if(n<60)setTimeout(()=>lkHello(n+1),500);return}
  if(!LIM)return;const over=MAPS.length>LIM.maps||MAPS.some((m,i)=>lkIsl(i).length);if(!over)return;
  try{if(sessionStorage.getItem('karty-lk1'))return;sessionStorage.setItem('karty-lk1','1')}catch(e){}
  box('EAGLES Pro закончился','Твои карты и острова на месте, ничего не удалено.\nСейчас открыты 1 карта и 3 острова на ней, остальное серое и на паузе.\nПродли EAGLES Pro, и всё снова откроется.',null,'Продлить Pro',()=>{location.href='/profile.html'})})(0);
'''
rep('resize();\n(async()=>{', JS + 'resize();\n(async()=>{')

open(dst, 'w', encoding='utf-8', newline='').write(s)
b = s.encode('utf-8')
print('ГОТОВО', dst, len(b), 'байт, md5', hashlib.md5(b).hexdigest())
