# Карты v49 (26.11.2026): «🔔 Напомнить» в деле — будильник через уведомления на телефон.
# Запуск: python3 karty-v49.py karty.html  (каждая замена проверяется: якорь нужное число раз, иначе STOP)
# Что делает: в окне дела под «Срок» ряд кнопок Нет / В срок / За 15 мин / За час / За день.
# В деле хранится rm (минуты до срока, -1 = нет) и rf (когда звонить, мс; считает страница по своему часовому поясу).
# Сервер (eagles-server, блок REM v1) собирает rf при сохранении Карт и шлёт уведомление в срок.
# Ссылка karty.html#delo=<карта>.<путь>&ok из кнопки «Готово» в уведомлении отмечает дело выполненным.
import sys
f = sys.argv[1]
S = open(f, encoding='utf8').read()
if 'rm49' in S: sys.exit('STOP: v49 уже стоит')
def rep(old, new, name, n=1):
    global S
    c = S.count(old)
    if c != n: sys.exit('STOP: якорь "%s" найден %d раз (нужно %d)' % (name, c, n))
    S = S.replace(old, new)

# 1) ряд кнопок под «Срок»
rep('<button type="button" class="mini" id="dueClr" hidden>Убрать срок</button></div>',
    '<button type="button" class="mini" id="dueClr" hidden>Убрать срок</button></div>'
    '<div class="row" id="rmRow" hidden><span class="lbl">🔔 Напомнить</span><div class="rm49" id="rm49">'
    '<button type="button" data-m="-1">Нет</button><button type="button" data-m="0">В срок</button>'
    '<button type="button" data-m="15">За 15 мин</button><button type="button" data-m="60">За час</button>'
    '<button type="button" data-m="1440">За день</button></div><div class="rm49h" id="rm49h"></div></div>', 'due-row')

# 2) при сохранении дела/острова пишем rm
rep("tm:$('due').value?$('dueT').value||'':''",
    "tm:$('due').value?$('dueT').value||'':'',rm:$('due').value?(window.RM49===undefined?0:window.RM49):-1", 'tm', 5)

# 3) открыть окно: новое дело — «В срок», старое — как было (у старых дел без rm — «Нет»)
rep("nm.value='';$('due').value='';$('dueT').value='';", "nm.value='';$('due').value='';$('dueT').value='';rm49set(0);", 'open-new')
rep("$('dueT').value=d.tm||'';", "$('dueT').value=d.tm||'';rm49set(d.rm===undefined?-1:d.rm);", 'open-ed')
rep("$('dueT').value=t.d.tm||'';", "$('dueT').value=t.d.tm||'';rm49set(t.d.rm===undefined?-1:t.d.rm);", 'save-to')
# возврат из LURE: помним выбор
rep("dueT:$('dueT').value,", "dueT:$('dueT').value,rm:window.RM49,", 'ret')
rep("$('dueT').value=f.dueT||''}", "$('dueT').value=f.dueT||'';rm49set(f.rm===undefined?0:f.rm)}", 'ret-back')
# ряд виден, только когда есть дата
rep("function dueBtn(){$('dueClr').hidden=!$('due').value;$('dueT').hidden=!$('due').value}",
    "function dueBtn(){$('dueClr').hidden=!$('due').value;$('dueT').hidden=!$('due').value;try{rm49ui()}catch(e){}}", 'dueBtn')

# 4) перед каждым сохранением пересчитать rf во всех делах
rep("function serial(){MAPS[curMap].trash=TRASH.slice();", "function serial(){MAPS[curMap].trash=TRASH.slice();try{rf49all(MAPS)}catch(e){}", 'serial')

# 5) «Готово» из уведомления: karty.html#delo=0.2.1&ok
rep("function deloLink(){const m=/#delo=([\\d.]+)/.exec(location.hash);if(!m)return;",
    "function deloLink(){const m=/#delo=([\\d.]+)/.exec(location.hash);if(!m)return;const ok49=/&ok\\b/.test(location.hash);", 'delo')
rep("setTimeout(()=>{SR=[{mi,kind:d.kids?'multi':'task',d}];pickSR(0)},400)}",
    "if(ok49&&!d.kids&&!d.done){d.done=true;delete d.rf;if(mi===curMap){if(root){removeTree(root);root=null}loadMap(curMap,false)}save();try{dlUpd()}catch(e){}toast('Готово ✓ Дело отмечено выполненным')}\n"
    "  setTimeout(()=>{SR=[{mi,kind:d.kids?'multi':'task',d}];pickSR(0)},400)}", 'delo-open')

# 5б) окно-карточка дела (там срок меняется сразу): тот же ряд «Напомнить»
rep("<button type=\"button\" class=\"mini\" id=\"cDueClr\" ${d.due?'':'hidden'}>Убрать срок</button></div>",
    "<button type=\"button\" class=\"mini\" id=\"cDueClr\" ${d.due?'':'hidden'}>Убрать срок</button></div>"
    "<div class=\"row\" id=\"cRmRow\" ${d.due?'':'hidden'}><span class=\"lbl\">🔔 Напомнить</span><div class=\"rm49\" id=\"cRm49\">"
    "<button type=\"button\" data-m=\"-1\">Нет</button><button type=\"button\" data-m=\"0\">В срок</button>"
    "<button type=\"button\" data-m=\"15\">За 15 мин</button><button type=\"button\" data-m=\"60\">За час</button>"
    "<button type=\"button\" data-m=\"1440\">За день</button></div><div class=\"rm49h\" id=\"cRm49h\"></div></div>", 'card-row')
rep("$('cDueClr').hidden=true;$('cTime').hidden=true;rp()};", "$('cDueClr').hidden=true;$('cTime').hidden=true;rp()};try{rm49card(d)}catch(e){}", 'card-wire')

# 6) стили и код v49 перед </body>
BLOCK = r'''<style id="egRm49">
.rm49{display:flex;flex-wrap:wrap;gap:6px;flex:1 1 100%}
.rm49 button{border:1px solid rgba(255,255,255,.16);background:transparent;color:var(--fg);border-radius:999px;padding:8px 12px;font:700 12px var(--f);cursor:pointer}
.rm49 button[aria-pressed="true"]{border-color:var(--gold);background:var(--gold);color:#16130a}
.rm49h{flex:1 1 100%;font-size:12px;color:var(--mut)}
.rm49h b{color:var(--gold)}
</style>
<script id="egRm49js">
(function(){
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function el(id){return document.getElementById(id)}
// когда звонить: срок минус rm; без времени — в 9:00 (за день — в 9:00 накануне)
function rfOf(due,tm,rm){if(!due||rm===undefined||rm===null||rm<0)return 0;var b=new Date(due+'T'+(tm||'09:00'));if(isNaN(b))return 0;
  if(!tm){if(rm>=1440)b.setDate(b.getDate()-1);return b.getTime()}return b.getTime()-rm*60000}
window.rf49all=function(MAPS){var go=function(d){if(!d||typeof d!=='object')return;var f=d.done?0:rfOf(d.due,d.tm,d.rm);if(f)d.rf=f;else delete d.rf;(d.kids||[]).forEach(go)};
  (MAPS||[]).forEach(function(m){go(m.data)})};
window.rm49ui=function(){var due=el('due'),r=el('rmRow');if(!r||!due)return;r.hidden=!due.value;
  var v=window.RM49===undefined?0:window.RM49;[].forEach.call(el('rm49').children,function(b){b.setAttribute('aria-pressed',String(+b.dataset.m===v))});
  var h=el('rm49h'),f=rfOf(due.value,(el('dueT')||{}).value,v);
  if(!h)return;if(v<0||!f){h.textContent=v<0?'Без напоминания':'';return}
  var x=new Date(f);h.innerHTML='Напомню <b>'+x.getDate()+' '+MON[x.getMonth()]+' в '+String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')+'</b>'+((el('dueT')||{}).value?'':' · время не указано, поэтому в 9:00')+(f<Date.now()?' · уже прошло':'')};
window.rm49set=function(v){v=+v;window.RM49=isFinite(v)?v:0;window.rm49ui()};
// карточка дела: d меняется сразу, страница сама сохраняет каждые 4 с
window.rm49card=function(d){var row=el('cRmRow'),box=el('cRm49'),h=el('cRm49h'),cd=el('cDue'),ct=el('cTime'),cc=el('cDueClr');if(!row||!box)return;
  function paint(){row.hidden=!d.due;var v=d.rm===undefined?-1:d.rm;[].forEach.call(box.children,function(b){b.setAttribute('aria-pressed',String(+b.dataset.m===v))});
    var f=d.done?0:rfOf(d.due,d.tm,v);if(!h)return;if(v<0||!f){h.textContent=v<0?'Без напоминания':'';return}
    var x=new Date(f);h.innerHTML='Напомню <b>'+x.getDate()+' '+MON[x.getMonth()]+' в '+String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')+'</b>'+(d.tm?'':' · время не указано, поэтому в 9:00')+(f<Date.now()?' · уже прошло':'')}
  box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;d.rm=+b.dataset.m;paint();try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}});
  if(cd)cd.addEventListener('input',function(){if(d.due&&d.rm===undefined)d.rm=0;paint()});if(ct)ct.addEventListener('input',paint);if(cc)cc.addEventListener('click',function(){setTimeout(paint,0)});
  paint()};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#rm49 button');if(!b)return;window.rm49set(b.dataset.m);try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}});
['due','dueT'].forEach(function(id){var x=el(id);if(x)x.addEventListener('input',window.rm49ui)});
})();
</script>
'''
S = S.rstrip('\n') + '\n' + BLOCK  # в живом файле нет </body>: дописываем в конец
open(f, 'w', encoding='utf8').write(S)
print('v49 OK')
