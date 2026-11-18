# Задание 86: EYE (chat.html) — подсказка на тап по микрофону + удаление сообщений.
#  * Короткий тап по микрофону больше НЕ включает запись: появляется подсказка «Удерживай для записи»
#    (как в Telegram). Остаются два способа: держать или потянуть вверх в замок.
#  * Долгое нажатие на сообщение (на компьютере — правая кнопка мыши) открывает меню:
#    Ответить · Копировать · Удалить только у себя · Удалить у всех (у всех — даже чужое сообщение, только в переписке).
#    Удаление спрашивает второй раз («нажми ещё раз»). Нужен сервер с блоком EYE CHAT v3 (ec_del, ec_hid).
# Запуск: python3 patch86.py chat-do-86.html chat-v86.html
import sys, hashlib
src, dst = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
if 'EYE-86' in s: sys.exit('УЖЕ СТОИТ: патч 86 уже применён, ничего не делаю')
if 'EYE-79' not in s: sys.exit('СТОП: на сайте нет задания 79 — сначала 79')
def once(a, b, name):
    global s
    n = s.count(a)
    if n != 1: sys.exit('СТОП: не найдено место «%s» (%d)' % (name, n))
    s = s.replace(a, b)

# 1) стили
once('  .ch-form.hold.near .ec-lockhint{', '''  /* EYE-86: подсказка на тап и меню сообщения */
  .ec-taphint{ position:absolute; right:52px; bottom:58px; z-index:5; padding:9px 13px; border-radius:12px; background:#1d1712; border:1px solid rgba(255,210,63,.45);
    color:var(--gold); font:800 13px var(--f); white-space:nowrap; box-shadow:0 8px 24px rgba(0,0,0,.5); opacity:0; transform:translateY(6px); transition:opacity .18s, transform .18s; pointer-events:none; }
  .ec-taphint.on{ opacity:1; transform:none; }
  .ch-b{ -webkit-touch-callout:none; }
  .ch-b.ec-pr{ transform:scale(.97); }
  .ec-msq{ margin:2px 2px 6px; padding:6px 10px; border-left:3px solid var(--gold); border-radius:8px; background:rgba(255,210,63,.08); font:600 13px/1.35 var(--f); color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ch-sheet button.sure{ background:#5a1f1f; color:#fff; border-color:#a33; }
  .ch-form.hold.near .ec-lockhint{''', 'css')

# 2) подсказка рядом с микрофоном
once('<div class="ec-lockhint" id="ecLockHint">', '<div class="ec-taphint" id="ecTapHint">Удерживай для записи</div><div class="ec-lockhint" id="ecLockHint">', 'taphint')

# 3) меню сообщения
once('<div class="ch-sheet" id="rSheet">', '<div class="ch-sheet" id="ecMs"><div class="in"><div class="ec-msq" id="ecMsq"></div>'
     '<button type="button" id="ecMre">Ответить</button><button type="button" id="ecMcp">Копировать</button>'
     '<button type="button" class="red" id="ecMdm">Удалить только у себя</button><button type="button" class="red" id="ecMda">Удалить у всех</button>'
     '<button type="button" id="ecMx">Отмена</button></div></div><div class="ch-sheet" id="rSheet">', 'sheet')

# 4) короткий тап — не запись, а подсказка
once("    if(Date.now() - h.t < 350){ h.locked = true; HOLD = null; var f = rf(); f.classList.remove('hold'); if(REC && REC !== 'wait') f.classList.add('lock'); return; }   // короткий тап",
     "    if(Date.now() - h.t < 350){ HOLD = null; rf().classList.remove('hold', 'near'); if(REC === 'wait') REC = null; else if(REC) recDrop(); tapHint(); return; }   // EYE-86: короткий тап — подсказка",
     'tap')
once("/* микрофон: держишь — пишется; вверх — замок; отпустил — готово; короткий тап — запись с замком */",
     "/* микрофон: держишь — пишется; вверх — замок; отпустил — готово; короткий тап — подсказка «Удерживай для записи» (EYE-86) */\n"
     "  var THT = null; function tapHint(){ var e = $('ecTapHint'); if(!e) return; e.classList.add('on'); if(navigator.vibrate) try{ navigator.vibrate(10); }catch(x){} clearTimeout(THT); THT = setTimeout(function(){ e.classList.remove('on'); }, 1800); }",
     'mic')

# 5) переписка: удалённые у всех и спрятанные у себя не показывать
once("return api({ action:'chat_open', 'with':id }).then(function(r){",
     "return Promise.all([api({ action:'chat_open', 'with':id }), first ? api({ action:'ec_hid', 'with':id }).catch(function(){ return null; }) : null]).then(function(rr){ var r = rr[0];\n"
     "      if(first && id === PEER){ HID = {}; if(rr[1] && rr[1].ok && rr[1].hid) rr[1].hid.forEach(function(a){ HID[a] = 1; }); }\n"
     "      if(r && r.ok && r.msgs){ var nd = 0; r.msgs = r.msgs.filter(function(m){ if(m.t === '[[del]]'){ nd++; return false; } return !HID[m.at]; }); r.sig = r.msgs.length + ':' + nd; }",
     'room')
once("if(first || r.msgs.length !== lastN){", "if(first || r.sig !== lastN){", 'sig')
once("lastN = r.msgs.length;", "lastN = r.sig;", 'lastN')

# 6) логика меню и удаления
once("  /* ---------- объявления ---------- */", r'''  /* ---------- EYE-86 (18.11.2026): меню сообщения — ответить, копировать, удалить ---------- */
  var HID = {}, MSAT = 0, LP = null, LPT = 0, MSURE = '', MSURET = null;
  function msTxt(m){ var t = String(m.t || '').replace(RERX0, ''); return VRX.test(t) ? '' : t; }
  function msOpen(at){ var m = MS[at]; if(!m || !PEER) return; MSAT = at; msSure('');
    $('ecMsq').textContent = (m.me ? 'Ты: ' : (PNAME || 'Собеседник') + ': ') + reSnip(m.t);
    $('ecMcp').style.display = msTxt(m) ? '' : 'none';
    $('ecMs').classList.add('on'); if(navigator.vibrate) try{ navigator.vibrate(15); }catch(e){} }
  function msClose(){ $('ecMs').classList.remove('on'); msSure(''); }
  function msSure(w){ MSURE = w; clearTimeout(MSURET);
    $('ecMdm').textContent = w === 'me' ? 'Нажми ещё раз — удалить у себя' : 'Удалить только у себя'; $('ecMdm').classList.toggle('sure', w === 'me');
    $('ecMda').textContent = w === 'all' ? 'Нажми ещё раз — удалить у всех' : 'Удалить у всех'; $('ecMda').classList.toggle('sure', w === 'all');
    if(w) MSURET = setTimeout(function(){ msSure(''); }, 4000); }
  function msDel(all){ var at = MSAT, to = PEER; if(!at || !to) return;
    if(MSURE !== (all ? 'all' : 'me')){ msSure(all ? 'all' : 'me'); return; }
    msClose();
    var p = { action:'ec_del', 'with':to, at:at }; if(all) p.all = 1;
    api(p).then(function(r){
      if(r && r.ok){ if(!all) HID[at] = 1; var b = $('rMsgs').querySelector('.ch-b[data-at="' + at + '"]'); if(b) b.remove(); delete MS[at];
        if(RE && RE.at === at) reClear(); toast(all ? 'Удалено у всех' : 'Удалено у тебя'); if(to === PEER) room(true); }
      else toast(r && r.error === 'not_found' ? 'Сообщение уже удалено' : r && r.error === 'unknown_action' ? 'Удаление ещё не включено на сервере' : 'Не получилось удалить');
    }).catch(function(){ toast('Нет связи с сервером'); });
  }
  $('ecMre').onclick = function(){ var at = MSAT; msClose(); reSet(at); };
  $('ecMcp').onclick = function(){ var m = MS[MSAT], t = m ? msTxt(m) : ''; msClose(); if(!t) return;
    var ok = function(){ toast('Скопировано'); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function(){ toast('Не получилось скопировать'); });
    else { var x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); try{ document.execCommand('copy'); ok(); }catch(e){} x.remove(); } };
  $('ecMdm').onclick = function(){ msDel(false); };
  $('ecMda').onclick = function(){ msDel(true); };
  $('ecMx').onclick = msClose;
  $('ecMs').addEventListener('click', function(e){ if(e.target === this) msClose(); });
  /* долгое нажатие на сообщение (телефон) и правая кнопка мыши (компьютер) */
  function lpStop(){ if(!LP) return; clearTimeout(LP.t); LP.b.classList.remove('ec-pr'); LP = null; }
  $('rMsgs').addEventListener('touchstart', function(e){ lpStop(); var b = e.target.closest('.ch-b[data-at]'); if(!b || e.touches.length !== 1 || e.target.closest('.ec-pl,a,.ec-q')) return;
    var x = e.touches[0].clientX, y = e.touches[0].clientY;
    LP = { b:b, x:x, y:y, t:setTimeout(function(){ if(!LP) return; var bb = LP.b; LP = null; bb.classList.remove('ec-pr'); if(SW && SW.on) return; SW = null; LPT = Date.now(); msOpen(+bb.getAttribute('data-at')); }, 480) };
    setTimeout(function(){ if(LP && LP.b === b) b.classList.add('ec-pr'); }, 150); }, { passive:true });
  $('rMsgs').addEventListener('touchmove', function(e){ if(LP && (Math.abs(e.touches[0].clientX - LP.x) > 10 || Math.abs(e.touches[0].clientY - LP.y) > 10)) lpStop(); }, { passive:true });
  $('rMsgs').addEventListener('touchend', lpStop); $('rMsgs').addEventListener('touchcancel', lpStop);
  $('rMsgs').addEventListener('contextmenu', function(e){ var b = e.target.closest('.ch-b[data-at]'); if(!b) return; e.preventDefault();
    if(Date.now() - LPT < 1000) return; lpStop(); msOpen(+b.getAttribute('data-at')); });

  /* ---------- объявления ---------- */''', 'menu')

# 7) закрыть меню при выходе из переписки
once("function closeRoom(){ reClear();", "function closeRoom(){ reClear(); try{ msClose(); }catch(e){}", 'close')

open(dst, 'w', encoding='utf-8').write(s)
print('OK', dst, len(s.encode('utf-8')), 'md5', hashlib.md5(s.encode('utf-8')).hexdigest())
