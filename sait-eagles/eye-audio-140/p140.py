# Задание 140: eye.js v6.3 — звук в аудиозвонке, «Включить видео» в аудиозвонке, быстрое переподключение EYE.
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80])
    s = s.replace(a, b)

rep("/* EYE v6.2 (25.11.2026)", """/* EYE v6.3 (26.11.2026, задание 140) — 1) звук собеседника играет через отдельный <audio> (в аудиозвонке видео-элемент ждал картинку и молчал);
   2) в аудиозвонке есть кнопка камеры: нажал — звонок становится видеозвонком (без перезвона); 3) EYE переподключается сразу, когда приложение
   снова на экране / появился интернет / нажали «позвонить» (раньше ждал до 30 с, а после too_many — 5 минут).
   EYE v6.2 (25.11.2026)""")

# 1) звук через <audio>
rep("""      var v = x.tile.querySelector('video'), stream = x.isMe ? (call.screen ? call.scrStream : call.local) : x.stream;
      if (stream && v.srcObject !== stream) v.srcObject = stream;""",
"""      var v = x.tile.querySelector('video'), stream = x.isMe ? (call.screen ? call.scrStream : call.local) : x.stream;
      if (stream && v.srcObject !== stream) v.srcObject = stream;
      if (!x.isMe && x.stream) peerAudio(x, v);""")
rep("""  function defMain() {""",
"""  // v6.3: голос собеседника — отдельный <audio> только со звуковыми дорожками; видео-элемент без звука
  function peerAudio(x, v) {
    var a = x.stream.getAudioTracks(); if (!a.length) return;
    var key = a.map(function (t) { return t.id; }).join(',');
    if (!x.au) { x.au = document.createElement('audio'); x.au.autoplay = true; x.au.setAttribute('playsinline', ''); x.au.style.display = 'none'; document.body.appendChild(x.au); }
    if (x.auKey !== key) { x.auKey = key; x.au.srcObject = new MediaStream(a); }
    if (!x.auBad) v.muted = true;
    if (x.au.paused && !x.auTry) {
      x.auTry = true;
      var p = x.au.play();
      if (p && p.then) p.then(function () { x.auTry = false; x.auBad = false; }, function () { x.auTry = false; x.auBad = true; v.muted = false; try { v.play(); } catch (e) {} });
      else x.auTry = false;
    }
  }
  function auOff(P) { if (P && P.au) { try { P.au.pause(); P.au.srcObject = null; P.au.remove(); } catch (e) {} P.au = null; } }
  function defMain() {""")
rep("""    if (P) { try { P.pc.close(); } catch (e) {} delete call.peers[id]; }""",
    """    if (P) { try { P.pc.close(); } catch (e) {} auOff(P); delete call.peers[id]; }""")
rep("""      vals(call.peers).forEach(function (P) { try { P.pc.close(); } catch (e) {} });""",
    """      vals(call.peers).forEach(function (P) { try { P.pc.close(); } catch (e) {} auOff(P); });""")

# 2) камера в аудиозвонке
rep("""'.eye-audio .eye-lv,.eye-audio #eyeCam,.eye-audio #eyeFlip{display:none}""", """'.eye-audio .eye-lv,.eye-audio #eyeFlip{display:none}""")
rep("""    var st0 = myState(); ov.querySelector('#eyeMic').innerHTML = st0.mic ? IC.mic : IC.micx; ov.querySelector('#eyeMic').classList.toggle('off', !st0.mic);""",
"""    var st0 = myState(); ov.querySelector('#eyeMic').innerHTML = st0.mic ? IC.mic : IC.micx; ov.querySelector('#eyeMic').classList.toggle('off', !st0.mic);
    ov.querySelector('#eyeCam').innerHTML = st0.camOn ? IC.cam : IC.camx; ov.querySelector('#eyeCam').classList.toggle('off', !st0.camOn);""")
rep("""  function toggle(kind, btn) {
    if (!call || !call.local) return;""",
"""  function toggle(kind, btn) {
    if (!call || !call.local) return;
    if (kind === 'video' && !camTrack()) { camOn140(btn); return; }""")
rep("""  /* v3.1: по каналу данных сообщаем""",
"""  // v6.3: в аудиозвонке включили камеру — шлём видео в уже готовый видеоканал (без перезвона)
  function camOn140(btn) {
    if (!navigator.mediaDevices || call.camBusy) return;
    call.camBusy = true; facing = 'user';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } }).then(function (s) {
      var t = s.getVideoTracks()[0];
      if (!call || !t) { s.getTracks().forEach(function (x) { x.stop(); }); return; }
      call.camBusy = false;
      call.local.addTrack(t);
      if (!call.screen) vals(call.peers).forEach(function (P) { setVideoSend(P, t); });
      toVideo140();
      if (btn) { btn.classList.remove('off'); btn.innerHTML = IC.cam; }
      var mt = call.meX && call.meX.tile && call.meX.tile.querySelector('video'); if (mt) mt.srcObject = null;
      vals(call.peers).forEach(sendState); layout();
    }).catch(function () { if (call) call.camBusy = false; toast('Нет доступа к камере. Разреши камеру для EAGLES в настройках телефона.'); });
  }
  function toVideo140() { if (!call || call.video !== false) return; call.video = true; if (ov) ov.classList.remove('eye-audio'); }
  /* v3.1: по каналу данных сообщаем""")
rep("""          var d = JSON.parse(e.data); P.camOff = d.cam === false; P.micOff = d.mic === false;""",
    """          var d = JSON.parse(e.data); P.camOff = d.cam === false; P.micOff = d.mic === false;
          if (d.cam && call && call.video === false) toVideo140();   // v6.3: собеседник включил камеру""")

# 3) быстрое переподключение
rep("""      if (m.why === 'too_many' || m.why === 'no_login') { retry = 300000; return; }""",
    """      if (m.why === 'no_login') { retry = 300000; return; }
      if (m.why === 'too_many') { retry = 20000; return; }   // v6.3: старые соединения сервер сам закрывает за ~45 с""")
rep("""      setTimeout(connect, retry); retry = Math.min(retry * 2, 30000);
    };""",
"""      clearTimeout(rcT); rcT = setTimeout(connect, retry); retry = Math.min(retry * 2, 30000);
    };""")
rep("""  function connect() {
    var s = sess(); if (!s || s.length < 40) return;""",
"""  var rcT = 0;
  function kick() { if (TOPW || ws) return; clearTimeout(rcT); if (retry > 20000) retry = 20000; connect(); }   // v6.3: переподключиться сейчас
  function connect() {
    if (ws && ws.readyState < 2) return;
    var s = sess(); if (!s || s.length < 40) return;""")
rep("""    if (!ws || ws.readyState !== 1) { toast('EYE сейчас недоступен. Проверь интернет и попробуй ещё раз.'); return; }""",
"""    if (!ws || ws.readyState !== 1) {   // v6.3: сначала пробуем переподключиться (до 8 с), потом уже говорим
      if (startCall.wait) return;
      kick(); startCall.wait = Date.now(); toast('Подключаю EYE…');
      var wt = setInterval(function () {
        if (ws && ws.readyState === 1) { clearInterval(wt); startCall.wait = 0; startCall(id, name, video); }
        else if (Date.now() - startCall.wait > 8000) { clearInterval(wt); startCall.wait = 0; toast('EYE сейчас недоступен. Проверь интернет и попробуй ещё раз.'); }
        else if (!ws) kick();
      }, 300);
      return;
    }""")
rep("""    if (!TOPW) connect();""",
"""    if (!TOPW) {
      connect();
      var hidAt = 0;
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { hidAt = Date.now(); return; }
        // долго был свёрнут — старое соединение могло тихо умереть: открываем новое (если не в звонке)
        if (ws && !call && hidAt && Date.now() - hidAt > 40000) { var o = ws; ws = null; clearInterval(pingT); o.onclose = null; try { o.close(); } catch (e) {} }
        kick();
      });
      window.addEventListener('pageshow', kick); window.addEventListener('online', kick); window.addEventListener('focus', kick);
    }""")
open(dst, 'w', encoding='utf8').write(s); print('PATCH140 OK')
