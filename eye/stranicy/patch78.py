# Задание 78: EYE (chat.html) — голосовое как во всех мессенджерах + значок непрочитанного гаснет сразу.
#  * Держишь микрофон — пишется. Отпустил — запись готова, внизу «Удалить / ▶ прослушать / Отправить».
#  * Пока держишь, тянешь палец вверх — замок 🔒: пишется без пальца; есть «Пауза / Продолжить», «Удалить», «Отправить».
#  * Короткий тап по микрофону — тоже включает запись сразу с замком (для тех, кто привык нажимать).
#  * Открыл переписку — сразу пересчитывается красная цифра EYE в нижнем меню (раньше ждала до минуты).
# Запуск: python3 patch78.py chat-do-78.html chat-v78.html
import sys
src, dst = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
if 'EYE-78' in s: sys.exit('УЖЕ СТОИТ: патч 78 уже применён, ничего не делаю')
def once(a, b, name):
    global s
    n = s.count(a)
    if n != 1: sys.exit('СТОП: не найдено место «%s» (%d)' % (name, n))
    s = s.replace(a, b)

# 1) разметка панели записи: пауза, прослушать, подсказка замка
once('<span class="ec-dot"></span><span class="ec-rt" id="ecTime">0:00 <small>/ 1:00</small></span></div>',
     '<span class="ec-dot"></span><span class="ec-rt" id="ecTime">0:00 <small>/ 1:00</small></span>'
     '<button class="ec-pau" type="button" id="ecPause" aria-label="Пауза"><svg class="p1" viewBox="0 0 24 24"><path d="M7 4h3v16H7zM14 4h3v16h-3z"/></svg><svg class="p2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/></svg></button>'
     '<button class="ec-pau" type="button" id="ecPlay" aria-label="Прослушать"><svg class="p1" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg><svg class="p2" viewBox="0 0 24 24"><path d="M7 4h3v16H7zM14 4h3v16h-3z"/></svg></button>'
     '</div><div class="ec-lockhint" id="ecLockHint"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg><span>вверх — замок</span></div>',
     'rec markup')

# 2) стили
once('  .ec-dot{', '''  /* EYE-78: удержание, замок, пауза */
  #rForm .in{ position:relative; }
  .ec-mic{ touch-action:none; -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }
  .ch-form.hold #ecMic{ display:grid !important; background:linear-gradient(135deg,#ffd23f,#ff8c28); color:#1a0d04; transform:scale(1.18); transition:transform .15s; }
  .ch-form.hold #rSend{ display:none; }
  .ec-pau{ width:40px; height:40px; flex:none; border:1px solid #3a3228; border-radius:12px; background:#141217; color:var(--gold); cursor:pointer; display:none; place-items:center; }
  .ec-pau svg{ width:18px; height:18px; fill:currentColor; }
  .ec-pau .p2{ display:none; } .ec-pau.on .p1{ display:none; } .ec-pau.on .p2{ display:block; }
  #ecPause .p2{ fill:#e8321a; }
  .ch-form.lock:not(.done) #ecPause{ display:grid; }
  .ch-form.done #ecPlay{ display:grid; }
  .ch-form.hold .ec-del{ visibility:hidden; }
  .ch-form.paused .ec-dot{ animation:none; background:#8a7f70; }
  .ec-lockhint{ display:none; position:absolute; left:0; bottom:62px; flex-direction:column; align-items:center; gap:4px; padding:10px 8px 8px; border-radius:16px;
    background:#1d1712; border:1px solid rgba(255,210,63,.45); color:var(--gold); font:800 10.5px var(--f); box-shadow:0 8px 24px rgba(0,0,0,.5); animation:ecUp 1.2s ease-in-out infinite; }
  .ec-lockhint svg{ width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
  .ch-form.hold .ec-lockhint{ display:flex; }
  .ch-form.hold.near .ec-lockhint{ background:linear-gradient(135deg,#ffd23f,#ff8c28); color:#1a0d04; animation:none; }
  @keyframes ecUp{ 50%{ transform:translateY(-6px); } }
  .ec-dot{''', 'css')

# 3) логика записи — заменяем блок задания 69 целиком
a = s.index("  /* запись: нажал микрофон")
b = s.index("  $('ecDel').onclick = function(){ recStop(false); };\n") + len("  $('ecDel').onclick = function(){ recStop(false); };\n")
NEW = r'''  /* ---------- EYE-78 (18.11.2026): голосовое удержанием, замок, пауза ---------- */
  var REC = null, RSTREAM = null, RCH = [], RMIME = '', RSEND = false, RLEN = 0, RTM = null;
  var RACC = 0, RFROM = 0, RPAUSED = false, RBLOB = null, RURL = '', HOLD = null, RPLAY = null;
  function rf(){ return $('rForm'); }
  function recSec(){ return Math.min(60, (RACC + (RFROM && !RPAUSED ? Date.now() - RFROM : 0)) / 1000); }
  function recUi(on){ var f = rf(); f.classList.toggle('rec', on); if(!on){ f.classList.remove('done', 'lock', 'hold', 'near', 'paused'); }
    $('rSend').disabled = on ? false : !ta.value.trim(); }
  function recTick(){ var s = recSec(); $('ecTime').innerHTML = mmss(s) + ' <small>/ 1:00</small>'; if(s >= 60) recFinish(false); }
  function recPause(){ if(!REC || REC.state === 'inactive') return;
    if(!RPAUSED){ try{ REC.pause(); }catch(e){ toast('Пауза не работает на этом телефоне'); return; } RACC += Date.now() - RFROM; RFROM = 0; RPAUSED = true; }
    else { try{ REC.resume(); }catch(e){ return; } RFROM = Date.now(); RPAUSED = false; }
    rf().classList.toggle('paused', RPAUSED); $('ecPause').classList.toggle('on', RPAUSED); $('ecPause').setAttribute('aria-label', RPAUSED ? 'Продолжить' : 'Пауза'); recTick(); }
  /* закончить запись: send=true — сразу отправить, false — оставить готовой к отправке */
  function recFinish(send){ RSEND = !!send; clearInterval(RTM); RTM = null;
    if(REC && REC.state !== 'inactive'){ RLEN = recSec(); if(RPAUSED){ try{ REC.resume(); }catch(e){} } REC.stop(); }
    var f = rf(); f.classList.add('done'); f.classList.remove('hold', 'near', 'paused'); }
  function recDrop(){ var f = rf(); try{ RPLAY && RPLAY.pause(); }catch(e){} RPLAY = null; $('ecPlay').classList.remove('on');
    if(RURL){ try{ URL.revokeObjectURL(RURL); }catch(e){} } RURL = ''; RBLOB = null; RLEN = 0;
    if(REC && REC.state !== 'inactive'){ RSEND = false; RCH = []; clearInterval(RTM); RTM = null; REC.onstop = function(){ recClean(); recUi(false); }; REC.stop(); }
    else { recClean(); recUi(false); } }
  function recStop(send){ if(send) { if(REC && REC.state !== 'inactive') recFinish(true); else if(RBLOB) recSendBlob(); } else recDrop(); }
  function recClean(){ try{ RSTREAM && RSTREAM.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} RSTREAM = null; REC = null; RFROM = 0; RACC = 0; RPAUSED = false; }
  function recDone(){
    var send = RSEND, chunks = RCH; RSEND = false; RCH = []; recClean();
    if(RLEN < 1){ toast('Слишком короткое — держи микрофон дольше секунды'); RBLOB = null; recUi(false); return; }
    RBLOB = new Blob(chunks, { type: RMIME || 'audio/webm' });
    $('ecTime').innerHTML = mmss(RLEN) + ' <small>готово</small>'; rf().classList.add('rec', 'done'); $('rSend').disabled = false;
    if(send) recSendBlob();
  }
  function recSendBlob(){
    var blob = RBLOB, len = RLEN, mime = RMIME, to = PEER, b = $('rSend'); if(!blob || !to) return; b.disabled = true;
    var fr = new FileReader();
    fr.onload = function(){ var b64 = String(fr.result).split(',')[1] || '', fd = new FormData();
      fd.append('with', to); fd.append('data', b64); fd.append('mime', (mime || 'audio/webm').split(';')[0]); fd.append('sec', String(Math.max(1, Math.round(len))));
      fetch(BACKEND_URL + '?type=ec_voice', { method:'POST', body:fd }).then(function(r){ return r.json(); }).then(function(r){
        if(r && r.ok){ recDrop(); if(to === PEER) room(true); }
        else { b.disabled = false; toast(r && r.error === 'audio_big' ? 'Запись слишком большая' : r && r.error === 'bad_audio' ? 'Не получилось записать звук' : ERR[r && r.error] || 'Голосовое не отправилось'); }
      }).catch(function(){ b.disabled = false; toast('Нет связи с сервером'); }); };
    fr.readAsDataURL(blob);
  }
  function recStart(locked){
    if(REC || RBLOB) return;
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){ toast('Голосовые не работают в этом браузере. Открой сайт в Chrome или Safari'); return; }
    var types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/aac'];
    RMIME = ''; for(var i = 0; i < types.length; i++) if(MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(types[i])){ RMIME = types[i]; break; }
    REC = 'wait';
    navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true } }).then(function(st){
      if(!PEER || REC !== 'wait'){ st.getTracks().forEach(function(t){ t.stop(); }); if(REC === 'wait') REC = null; return; }
      RSTREAM = st; RCH = []; RSEND = false; RLEN = 0; RACC = 0; RPAUSED = false;
      try{ REC = RMIME ? new MediaRecorder(st, { mimeType:RMIME, audioBitsPerSecond:32000 }) : new MediaRecorder(st); }catch(e){ REC = new MediaRecorder(st); }
      RMIME = REC.mimeType || RMIME;
      REC.ondataavailable = function(e){ if(e.data && e.data.size) RCH.push(e.data); };
      REC.onstop = recDone;
      REC.start(250); RFROM = Date.now(); recUi(true);
      var f = rf(); $('ecPause').classList.remove('on');
      if(HOLD && HOLD.up && !HOLD.locked){ HOLD = null; recFinish(false); }      // палец уже отпустили, пока телефон спрашивал микрофон
      else if(locked || !HOLD || (HOLD && HOLD.locked)){ f.classList.add('lock'); f.classList.remove('hold'); }
      else f.classList.add('hold');
      recTick(); RTM = setInterval(recTick, 250);
    }).catch(function(e){ REC = null; HOLD = null; rf().classList.remove('hold', 'near');
      toast(e && e.name === 'NotAllowedError' ? 'Разреши микрофон: значок 🔒 слева от адреса сайта → Микрофон → Разрешить' : 'Микрофон не включился'); });
  }
  /* микрофон: держишь — пишется; вверх — замок; отпустил — готово; короткий тап — запись с замком */
  var mic = $('ecMic');
  mic.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  mic.addEventListener('pointerdown', function(e){
    if(REC || RBLOB) return; e.preventDefault();
    try{ mic.setPointerCapture(e.pointerId); }catch(x){}
    HOLD = { id:e.pointerId, y:e.clientY, t:Date.now(), up:false, locked:false };
    rf().classList.add('hold'); recStart(false);
  });
  mic.addEventListener('pointermove', function(e){
    if(!HOLD || HOLD.id !== e.pointerId || HOLD.locked) return;
    var dy = HOLD.y - e.clientY, f = rf(); f.classList.toggle('near', dy > 40);
    if(dy > 80){ HOLD.locked = true; f.classList.remove('hold', 'near'); if(REC && REC !== 'wait') f.classList.add('lock'); if(navigator.vibrate) try{ navigator.vibrate(15); }catch(x){} }
  });
  function micUp(e){
    if(!HOLD || HOLD.id !== e.pointerId) return; var h = HOLD; h.up = true; rf().classList.remove('near');
    if(h.locked){ HOLD = null; return; }
    if(Date.now() - h.t < 350){ h.locked = true; HOLD = null; var f = rf(); f.classList.remove('hold'); if(REC && REC !== 'wait') f.classList.add('lock'); return; }   // короткий тап
    if(REC && REC !== 'wait'){ HOLD = null; recFinish(false); }
  }
  mic.addEventListener('pointerup', micUp);
  mic.addEventListener('pointercancel', micUp);
  $('ecPause').onclick = recPause;
  $('ecPlay').onclick = function(){ if(!RBLOB) return; var b = $('ecPlay');
    if(RPLAY && !RPLAY.paused){ RPLAY.pause(); return; }
    if(!RPLAY){ RURL = URL.createObjectURL(RBLOB); RPLAY = new Audio(RURL); RPLAY.onplay = function(){ b.classList.add('on'); }; RPLAY.onpause = RPLAY.onended = function(){ b.classList.remove('on'); }; }
    var p = RPLAY.play(); if(p && p.catch) p.catch(function(){ toast('Не получилось прослушать'); }); };
  $('ecDel').onclick = function(){ recDrop(); };
'''
s = s[:a] + NEW + s[b:]

# 4) кнопка «Отправить» во время записи / после записи
once("    if(REC){ recStop(true); return; }\n", "    if(REC && REC !== 'wait'){ recFinish(true); return; }\n    if(RBLOB){ recSendBlob(); return; }\n", 'send')
once("$('rSend').disabled = !REC && !ta.value.trim(); };", "$('rSend').disabled = !REC && !RBLOB && !ta.value.trim(); };", 'oninput')

# 5) значок непрочитанного: открыли переписку — сразу пересчитать красную цифру EYE (eye.js слушает chatSeen)
once("        lastN = r.msgs.length; window.scrollTo(0, document.body.scrollHeight); ecMark();",
     "        lastN = r.msgs.length; window.scrollTo(0, document.body.scrollHeight); ecMark();\n        try{ window.postMessage({ eg:'chatSeen' }, '*'); }catch(e){}", 'badge')
open(dst, 'w', encoding='utf-8', newline='').write(s)
print('OK', dst, len(s))
