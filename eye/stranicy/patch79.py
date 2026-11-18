# Задание 79: EYE (chat.html) — ответ на сообщение свайпом, с цитатой (как в Telegram).
#  * Потяни любое сообщение влево — над полем ввода появится «Ответ …» с цитатой (✕ — отменить).
#  * На компьютере — двойной клик по сообщению.
#  * В отправленном сообщении сверху цитата; нажатие на неё прокручивает к исходному сообщению.
#  * Хранится в тексте сообщения меткой [[re:время|ID|кусок текста]] — сервер не меняется.
# Запуск: python3 patch79.py chat-do-79.html chat-v79.html
import sys
src, dst = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
if 'EYE-79' in s: sys.exit('УЖЕ СТОИТ: патч 79 уже применён, ничего не делаю')
if 'EYE-78' not in s: sys.exit('СТОП: на сайте нет задания 78 — сначала 78')
def once(a, b, name):
    global s
    n = s.count(a)
    if n != 1: sys.exit('СТОП: не найдено место «%s» (%d)' % (name, n))
    s = s.replace(a, b)

# 1) стили
once('  /* EYE-78: удержание, замок, пауза */', '''  /* EYE-79: ответ на сообщение */
  .ch-b{ position:relative; transition:transform .18s; touch-action:pan-y; }
  .ch-b.sw{ transition:none; }
  .ch-b .ec-rei{ position:absolute; right:-34px; top:50%; width:26px; height:26px; margin-top:-13px; border-radius:50%; background:#2a2016; color:var(--gold); display:grid; place-items:center; opacity:0; }
  .ch-b .ec-rei svg{ width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; }
  .ec-q{ display:block; margin:0 0 6px; padding:5px 9px; border-left:3px solid var(--gold); border-radius:6px; background:rgba(255,210,63,.08); font:600 12.5px/1.35 var(--f); color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; }
  .ec-q b{ display:block; color:var(--gold); font-weight:800; font-size:12px; }
  .ch-b.ec-hl{ box-shadow:0 0 0 2px var(--gold); }
  .ec-rbar{ display:none; align-items:center; gap:10px; max-width:520px; margin:0 auto 8px; padding:7px 10px; border-left:3px solid var(--gold); border-radius:10px; background:#1d1712; }
  .ec-rbar.on{ display:flex; }
  .ec-rbar span{ flex:1; min-width:0; font:600 12.5px/1.35 var(--f); color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ec-rbar span b{ display:block; color:var(--gold); font-weight:800; font-size:12px; }
  .ec-rbar button{ flex:none; width:30px; height:30px; border:0; border-radius:50%; background:#2a2016; color:var(--muted); font:800 15px var(--f); cursor:pointer; }
  /* EYE-78: удержание, замок, пауза */''', 'css')

# 2) полоска «Ответ …» над полем ввода
once('<div class="ch-form" id="rForm" hidden><div class="in">',
     '<div class="ch-form" id="rForm" hidden><div class="ec-rbar" id="ecRbar"><span id="ecRtx"></span><button type="button" id="ecRx" aria-label="Не отвечать">✕</button></div><div class="in">', 'rbar')

# 3) список чатов: метку ответа не показывать
once("function lastTxt(t){ var v = VRX.exec(String(t || ''));",
     "function lastTxt(t){ t = String(t || '').replace(RERX0, ''); var v = VRX.exec(t);", 'lastTxt')

# 4) отрисовка сообщений: цитата сверху, data-at у всех, запоминаем тексты
once("var vh = voiceHtml(m.t); html += '<div class=\"ch-b' + (m.me ? ' me' : '') + (vh ? ' ec-vb' : '') + '\"' + (m.me ? ' data-at=\"' + m.at + '\"' : '') + '>' + (vh || linkify(m.t)) + '<i>'",
     "MS[m.at] = m; var vh = voiceHtml(m.t); html += '<div class=\"ch-b' + (m.me ? ' me' : '') + (vh ? ' ec-vb' : '') + '\" data-at=\"' + m.at + '\">' + (vh || reHtml(m.t)) + '<i>'",
     'render')
once("      BLOCKED = r.iBlocked;", "      PNAME = p.name || ''; if(first) MS = {};\n      BLOCKED = r.iBlocked;", 'pname')

# 5) отправка текста: с меткой ответа; после отправки — убрать полоску
once("api({ action:'chat_send', 'with':PEER, text:t }).then(function(r){\n      if(r && r.ok){ ta.value = ''; ta.oninput(); room(true); }",
     "api({ action:'chat_send', 'with':PEER, text:reWrap(t) }).then(function(r){\n      if(r && r.ok){ ta.value = ''; ta.oninput(); reClear(); room(true); }", 'send')

# 6) при выходе из переписки — убрать полоску
once("  function closeRoom(){ recStop(false);", "  function closeRoom(){ reClear(); recStop(false);", 'close')

# 7) логика
once("  /* ---------- EYE-78 (18.11.2026)", r'''  /* ---------- EYE-79 (18.11.2026): ответ на сообщение свайпом ---------- */
  var MS = {}, PNAME = '', RE = null;
  var RERX = /^\[\[re:(\d{10,14})\|(\d{1,9})\|([^\]\n]{0,90})\]\]\n?/, RERX0 = /^\[\[re:[^\]\n]*(\]\]\n?|$)/;
  var REI = '<b class="ec-rei"><svg viewBox="0 0 24 24"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg></b>';
  function reSnip(t){ t = String(t || ''); var v = VRX.exec(t.replace(RERX0, '')); if(v) return '🎤 Голосовое ' + mmss(+v[2]);
    return t.replace(RERX0, '').replace(/\s+/g, ' ').replace(/[\[\]|]/g, '').trim().slice(0, 60) || '…'; }
  function reWho(from){ return from === String(ID) ? 'Ты' : (PNAME || 'Собеседник'); }
  function reHtml(t){ t = String(t || ''); var m = RERX.exec(t); if(!m) return linkify(t.replace(RERX0, ''));
    return '<span class="ec-q" data-re="' + m[1] + '"><b>' + esc(reWho(m[2])) + '</b>' + esc(m[3]) + '</span>' + linkify(t.slice(m[0].length)); }
  function reWrap(t){ if(!RE) return t; return '[[re:' + RE.at + '|' + RE.from + '|' + RE.snip + ']]\n' + t; }
  function reSet(at){ var m = MS[at]; if(!m) return;
    RE = { at:m.at, from: m.me ? String(ID) : String(PEER), snip: reSnip(m.t) };
    $('ecRtx').innerHTML = '<b>Ответ · ' + (m.me ? 'Ты' : esc(PNAME || 'Собеседник')) + '</b>' + esc(RE.snip); $('ecRbar').classList.add('on');
    if(navigator.vibrate) try{ navigator.vibrate(12); }catch(e){}
    try{ ta.focus(); }catch(e){} }
  function reClear(){ RE = null; var b = $('ecRbar'); if(b) b.classList.remove('on'); }
  $('ecRx').onclick = reClear;
  /* свайп влево по сообщению */
  var SW = null;
  $('rMsgs').addEventListener('touchstart', function(e){ var b = e.target.closest('.ch-b[data-at]'); if(!b || e.touches.length !== 1 || e.target.closest('.ec-pl,a')) { SW = null; return; }
    SW = { b:b, x:e.touches[0].clientX, y:e.touches[0].clientY, dx:0, on:false, no:false }; }, { passive:true });
  $('rMsgs').addEventListener('touchmove', function(e){ if(!SW || SW.no) return; var dx = e.touches[0].clientX - SW.x, dy = e.touches[0].clientY - SW.y;
    if(!SW.on){ if(Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)){ SW.no = true; return; } if(dx < -10 && Math.abs(dx) > Math.abs(dy)){ SW.on = true; SW.b.classList.add('sw'); if(!SW.b.querySelector('.ec-rei')) SW.b.insertAdjacentHTML('beforeend', REI); } else return; }
    SW.dx = Math.max(-90, Math.min(0, dx)); SW.b.style.transform = 'translateX(' + SW.dx + 'px)';
    var ic = SW.b.querySelector('.ec-rei'); if(ic) ic.style.opacity = Math.min(1, -SW.dx / 60); }, { passive:true });
  function swEnd(){ if(!SW) return; var s = SW; SW = null; if(!s.on) return; s.b.classList.remove('sw'); s.b.style.transform = '';
    var ic = s.b.querySelector('.ec-rei'); if(ic) ic.style.opacity = 0; if(s.dx <= -55) reSet(+s.b.getAttribute('data-at')); }
  $('rMsgs').addEventListener('touchend', swEnd); $('rMsgs').addEventListener('touchcancel', swEnd);
  $('rMsgs').addEventListener('dblclick', function(e){ var b = e.target.closest('.ch-b[data-at]'); if(b && !e.target.closest('.ec-pl,a')){ try{ getSelection().removeAllRanges(); }catch(x){} reSet(+b.getAttribute('data-at')); } });
  /* нажал на цитату — прокрутить к исходному сообщению */
  $('rMsgs').addEventListener('click', function(e){ var q = e.target.closest('.ec-q'); if(!q) return; var t = $('rMsgs').querySelector('.ch-b[data-at="' + q.getAttribute('data-re') + '"]');
    if(!t){ toast('Это сообщение уже далеко в истории'); return; } t.scrollIntoView({ block:'center', behavior:'smooth' }); t.classList.add('ec-hl'); setTimeout(function(){ t.classList.remove('ec-hl'); }, 1400); });

  /* ---------- EYE-78 (18.11.2026)''', 'js')
open(dst, 'w', encoding='utf-8', newline='').write(s)
print('OK', dst, len(s))
