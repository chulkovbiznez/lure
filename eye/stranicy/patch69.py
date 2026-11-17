# -*- coding: utf-8 -*-
"""EYE задание 69 (chat.html): галочки (одна — отправлено, две золотые — прочитано) и голосовые до 1 минуты.
Нужен блок сервера EYE CHAT v2 (eye/eye-chat-server.js): ec_seen, ec_seenlist, POST ec_voice.
Запуск: python3 patch69.py <chat.html живой> <chat.html результат>"""
import sys
src, dst = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
def once(a, b, n):
    global s
    if s.count(a) != 1: raise SystemExit('%s: ожидал 1, нашёл %d' % (n, s.count(a)))
    s = s.replace(a, b)

CSS = r'''
  /* EYE 17.11.2026 (задание 69): галочки и голосовые */
  .ec-tk{ display:inline-flex; vertical-align:-2px; margin-left:4px; color:var(--dim); }
  .ec-tk svg{ width:16px; height:12px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
  .ec-tk.rd{ color:var(--gold); }
  .ch-it small .ec-tk{ margin:0 4px 0 0; }
  .ec-v{ display:flex; align-items:center; gap:10px; min-width:200px; padding:2px 0; white-space:normal; }
  .ec-pl{ width:38px; height:38px; flex:none; border:0; border-radius:50%; background:linear-gradient(135deg,#ffd23f,#ff8c28); color:#1a0d04; display:grid; place-items:center; cursor:pointer; }
  .ec-pl svg{ width:16px; height:16px; fill:currentColor; }
  .ec-pl .ps{ display:none; } .ec-v.on .ec-pl .pl{ display:none; } .ec-v.on .ec-pl .ps{ display:block; }
  .ec-bar{ flex:1; height:4px; border-radius:2px; background:rgba(255,255,255,.14); overflow:hidden; }
  .ec-bar span{ display:block; height:100%; width:0; background:var(--gold); }
  .ec-t{ font:800 12px var(--f); color:var(--muted); min-width:32px; text-align:right; }
  .ec-mic{ width:46px; height:46px; flex:none; border:1px solid #3a3228; border-radius:14px; background:#141217; color:var(--gold); cursor:pointer; display:grid; place-items:center; }
  .ec-mic svg, .ec-del svg{ width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
  .ec-rec{ display:none; flex:1; align-items:center; gap:10px; min-height:46px; }
  .ch-form.rec .ec-rec{ display:flex; } .ch-form.rec #rText, .ch-form.rec #ecMic{ display:none; }
  .ec-del{ width:46px; height:46px; flex:none; border:1px solid #3a3228; border-radius:14px; background:#141217; color:#ff6a5a; cursor:pointer; display:grid; place-items:center; }
  .ec-dot{ width:10px; height:10px; border-radius:50%; background:#e8321a; animation:ecBl 1s infinite; flex:none; }
  .ch-form.done .ec-dot{ animation:none; background:var(--gold); }
  @keyframes ecBl{ 50%{ opacity:.25; } }
  .ec-rt{ flex:1; font:800 15px var(--f); color:var(--fg); }
  .ec-rt small{ color:var(--dim); font-weight:700; }
'''
once('  .ch-send:disabled{ opacity:.45; }\n', '  .ch-send:disabled{ opacity:.45; }\n' + CSS, 'css')

MIC = '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4"/></svg>'
DEL = '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>'
once('<textarea id="rText" rows="1" maxlength="1000" placeholder="Сообщение…"></textarea><button class="ch-send" type="button" id="rSend"',
     '<textarea id="rText" rows="1" maxlength="1000" placeholder="Сообщение…"></textarea>'
     '<button class="ec-mic" type="button" id="ecMic" aria-label="Голосовое сообщение">' + MIC + '</button>'
     '<div class="ec-rec"><button class="ec-del" type="button" id="ecDel" aria-label="Удалить запись">' + DEL + '</button>'
     '<span class="ec-dot"></span><span class="ec-rt" id="ecTime">0:00 <small>/ 1:00</small></span></div>'
     '<button class="ch-send" type="button" id="rSend"', 'form')

# список чатов: галочка у «Ты:», голосовое вместо метки
once("'<span class=\"ch-it\"><b>' + esc(x.name) + '</b><small>' + (x.mineLast ? 'Ты: ' : '') + esc(x.last) + '</small></span>'",
     "'<span class=\"ch-it\"><b>' + esc(x.name) + '</b><small>' + (x.mineLast ? '<b class=\"ec-tk\" data-p=\"' + esc(x.id) + '\" data-at=\"' + x.at + '\">' + TK1 + '</b>Ты: ' : '') + esc(lastTxt(x.last)) + '</small></span>'", 'list')
once("      badge($('nChats'), n);\n", "      badge($('nChats'), n); seenList();\n", 'list seen')

# переписка: data-at, голосовые, галочки
once("html += '<div class=\"ch-b' + (m.me ? ' me' : '') + '\">' + linkify(m.t) + '<i>' + hm(m.at) + '</i></div>'; });",
     "var vh = voiceHtml(m.t); html += '<div class=\"ch-b' + (m.me ? ' me' : '') + (vh ? ' ec-vb' : '') + '\"' + (m.me ? ' data-at=\"' + m.at + '\"' : '') + '>' + (vh || linkify(m.t)) + '<i>' + hm(m.at) + (m.me ? tk(m.at <= SEEN) : '') + '</i></div>'; });", 'bubble')
once("        lastN = r.msgs.length; window.scrollTo(0, document.body.scrollHeight);\n",
     "        lastN = r.msgs.length; window.scrollTo(0, document.body.scrollHeight); ecMark();\n", 'after render')
once("  function room(first){\n    var id = PEER;\n",
     "  function room(first){\n    var id = PEER; seenRoom(id, first);\n", 'room seen')
once("  function closeRoom(){ PEER = '';", "  function closeRoom(){ recStop(false); PEER = '';", 'close rec')
once("  function openRoom(id){\n    PEER = id; lastN = -1;", "  function openRoom(id){\n    PEER = id; lastN = -1; SEEN = 0;", 'open seen')

JS = r'''
  /* ---------- EYE 17.11.2026 (задание 69): галочки и голосовые ---------- */
  var TK1 = '<svg viewBox="0 0 16 12"><path d="M3 6.5l3 3 7-7"/></svg>', TK2 = '<svg viewBox="0 0 16 12"><path d="M1 6.5l3 3 7-7"/><path d="M7.5 9.5l7-7"/></svg>';
  var SEEN = 0;
  function tk(rd){ return '<b class="ec-tk' + (rd ? ' rd' : '') + '" title="' + (rd ? 'Прочитано' : 'Отправлено') + '">' + (rd ? TK2 : TK1) + '</b>'; }
  var VRX = /^\[\[voice:(u\/\d+\/v\/[0-9a-f]{16}\.(?:webm|ogg|m4a|mp3))\|(\d{1,2})\]\]$/;
  function mmss(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function lastTxt(t){ var v = VRX.exec(String(t || '')); return v ? '🎤 Голосовое ' + mmss(+v[2]) : t; }
  function voiceHtml(t){ var v = VRX.exec(String(t || '')); if(!v) return '';
    return '<div class="ec-v" data-src="/' + v[1] + '" data-sec="' + v[2] + '"><button type="button" class="ec-pl" aria-label="Слушать">'
      + '<svg class="pl" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg><svg class="ps" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg></button>'
      + '<span class="ec-bar"><span></span></span><span class="ec-t">' + mmss(+v[2]) + '</span></div>'; }
  function seenRoom(id, first){
    api({ action:'ec_seen', 'with':id }).then(function(r){ if(id !== PEER || !r || !r.ok) return; SEEN = Number(r.seen) || 0; ecMark(); }).catch(function(){});
  }
  function ecMark(){ Array.prototype.forEach.call($('rMsgs').querySelectorAll('.ch-b.me[data-at]'), function(b){
    var rd = Number(b.getAttribute('data-at')) <= SEEN, t = b.querySelector('.ec-tk'); if(t && t.classList.contains('rd') !== rd) t.outerHTML = tk(rd); }); }
  function seenList(){
    if(!$('vChats').querySelector('.ec-tk[data-p]')) return;
    api({ action:'ec_seenlist' }).then(function(r){ if(!r || !r.ok) return;
      Array.prototype.forEach.call($('vChats').querySelectorAll('.ec-tk[data-p]'), function(t){
        var s = r.seen[t.getAttribute('data-p')], rd = s != null && Number(t.getAttribute('data-at')) <= s;
        t.classList.toggle('rd', rd); t.innerHTML = rd ? TK2 : TK1; t.title = rd ? 'Прочитано' : 'Отправлено'; }); }).catch(function(){});
  }
  /* плеер: один на страницу */
  var AU = null, AUSRC = '';
  function vEl(){ return AUSRC ? $('rMsgs').querySelector('.ec-v[data-src="' + AUSRC + '"]') : null; }
  function vShow(){ var e = vEl(); if(!e) return; var sec = +e.getAttribute('data-sec') || 1, ct = AU ? AU.currentTime : 0;
    e.classList.toggle('on', !!(AU && !AU.paused)); e.querySelector('.ec-bar span').style.width = Math.min(100, ct / sec * 100) + '%';
    e.querySelector('.ec-t').textContent = mmss(AU && !AU.paused || ct > 0 ? ct : sec); }
  $('rMsgs').addEventListener('click', function(ev){
    var b = ev.target.closest('.ec-pl'); if(!b) return; var e = b.closest('.ec-v'), src = e.getAttribute('data-src');
    if(!AU){ AU = new Audio(); AU.preload = 'auto';
      AU.ontimeupdate = vShow; AU.onpause = vShow; AU.onplay = vShow;
      AU.onended = function(){ var x = vEl(); AU.currentTime = 0; if(x){ x.classList.remove('on'); x.querySelector('.ec-bar span').style.width = '0'; x.querySelector('.ec-t').textContent = mmss(+x.getAttribute('data-sec')); } };
      AU.onerror = function(){ toast('Не получилось включить запись на этом телефоне'); }; }
    if(AUSRC === src && !AU.paused){ AU.pause(); return; }
    if(AUSRC !== src){ var old = vEl(); if(old){ old.classList.remove('on'); old.querySelector('.ec-bar span').style.width = '0'; old.querySelector('.ec-t').textContent = mmss(+old.getAttribute('data-sec')); }
      AUSRC = src; AU.src = src; }
    var pr = AU.play(); if(pr && pr.catch) pr.catch(function(){});
  });
  /* запись: нажал микрофон — пишет до 1 минуты; ➤ отправить, корзина — удалить */
  var REC = null, RST = 0, RTM = null, RSTREAM = null, RCH = [], RMIME = '', RSEND = false, RLEN = 0;
  function recUi(on){ $('rForm').classList.toggle('rec', on); $('rForm').classList.remove('done'); $('rSend').disabled = on ? false : !ta.value.trim(); }
  function recTick(){ var s = (Date.now() - RST) / 1000; $('ecTime').innerHTML = mmss(Math.min(60, s)) + ' <small>/ 1:00</small>'; if(s >= 60){ RSEND = true; recHalt(); } }
  function recHalt(){ clearInterval(RTM); RTM = null; if(REC && REC.state !== 'inactive'){ RLEN = Math.min(60, (Date.now() - RST) / 1000); REC.stop(); } $('rForm').classList.add('done'); }
  function recStop(send){ RSEND = !!send; if(REC && REC.state !== 'inactive') recHalt(); else if(!REC) recUi(false); }
  function recDone(){
    var send = RSEND, chunks = RCH, mime = RMIME, len = RLEN, to = PEER; RSEND = false; RCH = [];
    try{ RSTREAM && RSTREAM.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
    RSTREAM = null; REC = null; recUi(false);
    if(!send || !to) return;
    if(len < 1){ toast('Слишком короткое, держи дольше секунды'); return; }
    var blob = new Blob(chunks, { type: mime || 'audio/webm' }), fr = new FileReader(), b = $('rSend'); b.disabled = true;
    fr.onload = function(){ var b64 = String(fr.result).split(',')[1] || '', fd = new FormData();
      fd.append('with', to); fd.append('data', b64); fd.append('mime', (mime || 'audio/webm').split(';')[0]); fd.append('sec', String(Math.max(1, Math.round(len))));
      fetch(BACKEND_URL + '?type=ec_voice', { method:'POST', body:fd }).then(function(r){ return r.json(); }).then(function(r){
        b.disabled = !ta.value.trim();
        if(r && r.ok){ if(to === PEER) room(true); }
        else toast(r && r.error === 'audio_big' ? 'Запись слишком большая' : r && r.error === 'bad_audio' ? 'Не получилось записать звук' : ERR[r && r.error] || 'Голосовое не отправилось');
      }).catch(function(){ b.disabled = !ta.value.trim(); toast('Нет связи с сервером'); }); };
    fr.readAsDataURL(blob);
  }
  $('ecMic').onclick = function(){
    if(REC) return;
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){ toast('Голосовые не работают в этом браузере. Открой сайт в Chrome или Safari'); return; }
    var types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/aac'];
    RMIME = ''; for(var i = 0; i < types.length; i++) if(MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(types[i])){ RMIME = types[i]; break; }
    navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true } }).then(function(st){
      if(!PEER){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
      RSTREAM = st; RCH = []; RSEND = false;
      try{ REC = RMIME ? new MediaRecorder(st, { mimeType:RMIME, audioBitsPerSecond:32000 }) : new MediaRecorder(st); }catch(e){ REC = new MediaRecorder(st); }
      RMIME = REC.mimeType || RMIME;
      REC.ondataavailable = function(e){ if(e.data && e.data.size) RCH.push(e.data); };
      REC.onstop = recDone;
      REC.start(250); RST = Date.now(); RLEN = 0; recUi(true); recTick(); RTM = setInterval(recTick, 250);
    }).catch(function(e){ toast(e && e.name === 'NotAllowedError' ? 'Разреши микрофон: значок 🔒 слева от адреса сайта → Микрофон → Разрешить' : 'Микрофон не включился'); });
  };
  $('ecDel').onclick = function(){ recStop(false); };
'''
once("  var ta = $('rText');\n", JS + "  var ta = $('rText');\n", 'js')
once("  $('rSend').onclick = function(){\n    var t = ta.value.trim();",
     "  $('rSend').onclick = function(){\n    if(REC){ recStop(true); return; }\n    var t = ta.value.trim();", 'send rec')
once("ta.oninput = function(){ ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; $('rSend').disabled = !ta.value.trim(); };",
     "ta.oninput = function(){ ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; $('rSend').disabled = !REC && !ta.value.trim(); };", 'oninput')
open(dst, 'w', encoding='utf-8', newline='').write(s)
print('ok')
