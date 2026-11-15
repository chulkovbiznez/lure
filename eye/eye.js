/* EYE — видеозвонки EAGLES. Подключается на страницах сайта одной строкой:
   <script src="https://eye.eaglesteam.ru/eye.js" defer></script>
   Сам находит ключ входа EAGLES, держит связь с сервером EYE, показывает входящий звонок на любой странице,
   а в «Сообщениях» добавляет золотую кнопку видеозвонка в шапку переписки. */
(function () {
  if (window.EYE) return;
  var WS_URL = (window.EYE_WS || 'wss://eye.eaglesteam.ru/ws');
  var SKEY = 'eaglesfree_session';
  var ws = null, me = null, ICE = [{ urls: ['stun:eye.eaglesteam.ru:3478'] }], retry = 1000, pingT = null;
  var call = null; // {cid, role:'caller'|'callee', peer:{id,name}, pc, local, remote, iceQ:[], t0, timer}

  function sess() { try { return localStorage.getItem(SKEY) || ''; } catch (e) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initials(n) { n = String(n || '').trim().split(/\s+/); return ((n[0] || '?')[0] + ((n[1] || '')[0] || '')).toUpperCase(); }
  function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }

  /* ---------- стиль ---------- */
  var css = '' +
    '.eye-ov{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;color:#f4f2ee;-webkit-font-smoothing:antialiased}' +
    '.eye-ring-bg{background:radial-gradient(360px 360px at 50% 38%,rgba(255,170,40,.30),transparent 70%),radial-gradient(500px 300px at 50% 110%,rgba(255,106,43,.18),transparent 70%),linear-gradient(180deg,#120d07,#070708 70%);padding:calc(56px + env(safe-area-inset-top,0px)) 22px calc(40px + env(safe-area-inset-bottom,0px))}' +
    '.eye-brand{font:900 13px/1 inherit;letter-spacing:.42em;color:#ffd23f;font-family:inherit}' +
    '.eye-kind{margin-top:8px;font:800 11px/1 Montserrat,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#a29b90}' +
    '.eye-av{position:relative;margin-top:44px;width:140px;height:140px;border-radius:50%;padding:4px;background:conic-gradient(#fff1b8,#ffd23f,#d98d16,#ffd23f,#fff1b8)}' +
    '.eye-av::before,.eye-av::after{content:"";position:absolute;inset:-16px;border-radius:50%;border:1.5px solid rgba(255,210,63,.55);animation:eyeW 2.4s ease-out infinite}' +
    '.eye-av::after{animation-delay:1.2s}@keyframes eyeW{0%{transform:scale(.86);opacity:1}100%{transform:scale(1.3);opacity:0}}' +
    '.eye-av div{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 50% 30%,#2e2316,#100c09);font:900 44px/1 Montserrat,sans-serif;color:#ffd23f}' +
    '.eye-nm{margin-top:30px;font:900 24px/1.15 Montserrat,sans-serif;text-align:center}' +
    '.eye-st{margin-top:8px;font:800 13px/1.3 Montserrat,sans-serif;color:#ffe08a;text-align:center;min-height:18px}' +
    '.eye-acts{margin-top:auto;width:100%;max-width:340px;display:flex;justify-content:space-around;align-items:flex-end}' +
    '.eye-b{display:flex;flex-direction:column;align-items:center;gap:9px;font:800 11px/1 Montserrat,sans-serif;color:#a29b90;background:none;border:0;cursor:pointer;padding:0}' +
    '.eye-b i{width:68px;height:68px;border-radius:50%;display:grid;place-items:center}' +
    '.eye-b svg{width:28px;height:28px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.eye-no i{background:linear-gradient(180deg,#ff6a5a,#d91f12);box-shadow:0 10px 26px rgba(232,50,26,.45)}.eye-no svg{stroke:#fff}' +
    '.eye-yes i{background:linear-gradient(180deg,#fff1b8,#ffd23f 38%,#f3b230 72%,#d98d16);box-shadow:0 8px 24px rgba(255,180,40,.45);animation:eyeP 2s ease-out infinite}.eye-yes svg{stroke:#2a1702}' +
    '@keyframes eyeP{0%{box-shadow:0 0 0 0 rgba(255,210,63,.5)}100%{box-shadow:0 0 0 14px rgba(255,210,63,0)}}' +
    '.eye-live{background:#0b0907}' +
    '.eye-rv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#0b0907}' +
    '.eye-lv{position:absolute;right:14px;top:calc(70px + env(safe-area-inset-top,0px));width:96px;height:136px;object-fit:cover;border-radius:18px;border:2px solid #ffd23f;background:#1a1a1d;transform:scaleX(-1);z-index:2}' +
    '.eye-top{position:absolute;top:calc(16px + env(safe-area-inset-top,0px));left:14px;right:14px;display:flex;justify-content:space-between;align-items:center;z-index:2}' +
    '.eye-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border-radius:99px;background:rgba(14,12,15,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);font:800 11px/1 Montserrat,sans-serif}' +
    '.eye-pill.g{color:#ffd23f;border-color:rgba(255,210,63,.35)}' +
    '.eye-who{position:absolute;left:16px;bottom:calc(120px + env(safe-area-inset-bottom,0px));z-index:2;font:900 19px/1.15 Montserrat,sans-serif;text-shadow:0 2px 10px rgba(0,0,0,.8)}' +
    '.eye-ctl{position:absolute;left:12px;right:12px;bottom:calc(24px + env(safe-area-inset-bottom,0px));z-index:2;max-width:420px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:30px;background:rgba(14,12,15,.65);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,210,63,.28)}' +
    '.eye-c{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(255,210,63,.14);border:1px solid rgba(255,210,63,.5);color:#ffd23f;cursor:pointer}' +
    '.eye-c.off{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);color:#8a847c}' +
    '.eye-c svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.eye-c.end{width:60px;height:60px;background:linear-gradient(180deg,#ff6a5a,#d91f12);border:0;color:#fff}' +
    '.eye-toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483001;max-width:88vw;padding:12px 16px;border-radius:16px;background:rgba(20,18,23,.96);border:1px solid rgba(255,210,63,.4);color:#f4f2ee;font:700 13px/1.35 Montserrat,sans-serif;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.5)}' +
    '.eye-btn{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;border:0;cursor:pointer;margin-right:6px;background:linear-gradient(180deg,#fff1b8,#ffd23f 38%,#f3b230 72%,#d98d16);color:#2a1702;box-shadow:0 6px 16px rgba(255,180,40,.35)}' +
    '.eye-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '@media (prefers-reduced-motion:reduce){.eye-av::before,.eye-av::after,.eye-yes i{animation:none}}';
  function addCss() { if (document.getElementById('eye-css')) return; var s = document.createElement('style'); s.id = 'eye-css'; s.textContent = css; document.head.appendChild(s); }

  var IC = {
    cam: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></svg>',
    end: '<svg viewBox="0 0 24 24"><path d="M3 14.5c5-4.6 13-4.6 18 0l-2.4 3-3.6-1.6v-2.6a10 10 0 00-6 0v2.6L5.4 17.5z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    flip: '<svg viewBox="0 0 24 24"><path d="M4 9a8 8 0 0114-4l2 2M20 15a8 8 0 01-14 4l-2-2M20 4v4h-4M4 20v-4h4"/></svg>'
  };

  var ov = null;
  function clearOv() { if (ov) { ov.remove(); ov = null; } stopTone(); }
  function toast(t) { addCss(); var d = document.createElement('div'); d.className = 'eye-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4200); }

  function ringScreen(peer, status, incoming) {
    clearOv(); addCss();
    ov = document.createElement('div'); ov.className = 'eye-ov eye-ring-bg'; ov.setAttribute('role', 'dialog');
    ov.innerHTML = '<div class="eye-brand">EYE</div><div class="eye-kind">Видеозвонок EAGLES</div>' +
      '<div class="eye-av"><div>' + esc(initials(peer.name)) + '</div></div>' +
      '<div class="eye-nm">' + esc(peer.name || ('ID ' + peer.id)) + '</div><div class="eye-st" id="eyeSt">' + esc(status) + '</div>' +
      '<div class="eye-acts">' +
      (incoming ? '<button class="eye-b eye-no" id="eyeNo"><i>' + IC.end + '</i>Отклонить</button><button class="eye-b eye-yes" id="eyeYes"><i>' + IC.cam + '</i>Принять</button>'
                : '<button class="eye-b eye-no" id="eyeNo"><i>' + IC.end + '</i>Отменить</button>') +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('#eyeNo').onclick = function () { if (call) send({ t: incoming ? 'decline' : 'hangup', cid: call.cid }); finish(''); };
    if (incoming) ov.querySelector('#eyeYes').onclick = accept;
  }
  function setSt(t) { var e = ov && ov.querySelector('#eyeSt'); if (e) e.textContent = t; }

  function liveScreen() {
    clearOv(); addCss();
    ov = document.createElement('div'); ov.className = 'eye-ov eye-live';
    ov.innerHTML = '<video class="eye-rv" id="eyeRv" autoplay playsinline></video><video class="eye-lv" id="eyeLv" autoplay playsinline muted></video>' +
      '<div class="eye-top"><span class="eye-pill" id="eyeQ">● соединяю…</span><span class="eye-pill g" id="eyeT">00:00</span></div>' +
      '<div class="eye-who">' + esc(call.peer.name || '') + '</div>' +
      '<div class="eye-ctl"><button class="eye-c" id="eyeMic" aria-label="Микрофон">' + IC.mic + '</button><button class="eye-c" id="eyeCam" aria-label="Камера">' + IC.cam + '</button>' +
      '<button class="eye-c end" id="eyeEnd" aria-label="Завершить">' + IC.end + '</button><button class="eye-c" id="eyeFlip" aria-label="Сменить камеру">' + IC.flip + '</button></div>';
    document.body.appendChild(ov);
    if (call.local) ov.querySelector('#eyeLv').srcObject = call.local;
    if (call.remote) ov.querySelector('#eyeRv').srcObject = call.remote;
    ov.querySelector('#eyeEnd').onclick = function () { send({ t: 'hangup', cid: call.cid }); finish('Звонок завершён'); };
    ov.querySelector('#eyeMic').onclick = function () { toggle('audio', this); };
    ov.querySelector('#eyeCam').onclick = function () { toggle('video', this); };
    ov.querySelector('#eyeFlip').onclick = flip;
    call.t0 = Date.now();
    call.timer = setInterval(function () {
      var s = Math.floor((Date.now() - call.t0) / 1000), e = ov && ov.querySelector('#eyeT');
      if (e) e.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }
  function toggle(kind, btn) {
    if (!call || !call.local) return;
    var tr = kind === 'audio' ? call.local.getAudioTracks() : call.local.getVideoTracks();
    tr.forEach(function (x) { x.enabled = !x.enabled; });
    btn.classList.toggle('off', tr.length && !tr[0].enabled);
  }
  var facing = 'user';
  function flip() {
    if (!call || !call.pc || !navigator.mediaDevices) return;
    facing = facing === 'user' ? 'environment' : 'user';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } }).then(function (s) {
      var nt = s.getVideoTracks()[0], sender = call.pc.getSenders().find(function (x) { return x.track && x.track.kind === 'video'; });
      if (sender) sender.replaceTrack(nt);
      call.local.getVideoTracks().forEach(function (t) { t.stop(); call.local.removeTrack(t); });
      call.local.addTrack(nt);
    }).catch(function () {});
  }

  /* ---------- звук звонка ---------- */
  var tone = null;
  function startTone() {
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ctx = new A(), on = true;
      tone = { ctx: ctx, iv: setInterval(function () {
        if (!on) return;
        [880, 1175].forEach(function (f, i) {
          var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
          var t = ctx.currentTime + i * 0.18; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
          o.start(t); o.stop(t + 0.17);
        });
      }, 1300) };
      if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
    } catch (e) {}
  }
  function stopTone() { if (tone) { clearInterval(tone.iv); try { tone.ctx.close(); } catch (e) {} tone = null; } }

  /* ---------- WebRTC ---------- */
  function media() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('nomedia'));
    return navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .catch(function () { return navigator.mediaDevices.getUserMedia({ audio: true }); });
  }
  function makePc() {
    var pc = new RTCPeerConnection({ iceServers: ICE });
    call.pc = pc; call.iceQ = [];
    pc.onicecandidate = function (e) { if (e.candidate) send({ t: 'ice', cid: call.cid, c: e.candidate }); };
    pc.ontrack = function (e) {
      call.remote = e.streams[0];
      var v = ov && ov.querySelector('#eyeRv'); if (v) v.srcObject = call.remote;
    };
    pc.onconnectionstatechange = function () {
      var q = ov && ov.querySelector('#eyeQ'), s = pc.connectionState;
      if (q) q.textContent = s === 'connected' ? '● связь есть' : s === 'connecting' ? '● соединяю…' : s === 'disconnected' ? '● связь плохая…' : s === 'failed' ? '● нет связи' : '● ' + s;
      if (s === 'failed') { send({ t: 'hangup', cid: call.cid }); finish('Не получилось соединиться. Проверь интернет.'); }
    };
    call.local.getTracks().forEach(function (t) { pc.addTrack(t, call.local); });
    return pc;
  }
  function flushIce() { if (!call) return; (call.iceQ || []).forEach(function (c) { call.pc.addIceCandidate(c).catch(function () {}); }); call.iceQ = []; }

  function accept() {
    if (!call) return;
    stopTone(); setSt('Включаю камеру…');
    media().then(function (s) {
      call.local = s; makePc(); liveScreen(); send({ t: 'accept', cid: call.cid });
    }).catch(function () { send({ t: 'decline', cid: call.cid }); finish('Нужен доступ к камере и микрофону'); });
  }

  function finish(msg) {
    if (call) {
      clearInterval(call.timer);
      if (call.pc) try { call.pc.close(); } catch (e) {}
      if (call.local) call.local.getTracks().forEach(function (t) { t.stop(); });
    }
    call = null; clearOv(); if (msg) toast(msg);
  }

  var WHY = {
    offline: 'Человек сейчас не в EAGLES. Напиши ему в чат, пусть откроет EAGLES.',
    busy: 'Сейчас занят другим звонком.',
    need_pro: 'Звонить можно с EAGLES PRO. Принимать звонки можно всем.',
    not_allowed: 'Звонить можно только людям из своей команды.',
    blocked: 'Звонок недоступен.',
    too_often: 'Слишком много звонков подряд. Попробуй через минуту.',
    bad_id: 'Не нашёл этого человека.',
    no_login: 'Войди в EAGLES, чтобы звонить.',
    noanswer: 'Не ответил. Можно написать в чат.',
    declined: 'Отклонил звонок.',
    hangup: 'Звонок завершён',
    gone: 'Звонок завершён',
    elsewhere: ''
  };

  function onMsg(m) {
    if (m.t === 'hello') { me = m.me; if (m.ice) ICE = m.ice; retry = 1000; return; }
    if (m.t === 'error') {
      if (call && call.role === 'caller' && !call.cid) finish(WHY[m.why] || 'Не получилось позвонить');
      else if (m.why !== 'no_login') toast(WHY[m.why] || 'Ошибка звонка');
      return;
    }
    if (m.t === 'ring') {
      if (call) { send({ t: 'decline', cid: m.cid }); return; }
      call = { cid: m.cid, role: 'callee', peer: m.from };
      ringScreen(m.from, 'звонит тебе в EAGLES…', true); startTone();
      if (document.hidden && window.Notification && Notification.permission === 'granted') {
        try { new Notification('EYE · ' + m.from.name + ' звонит', { body: 'Видеозвонок EAGLES. Нажми, чтобы ответить.', tag: 'eye-' + m.cid }); } catch (e) {}
      }
      return;
    }
    if (!call || (m.cid && call.cid && m.cid !== call.cid)) return;
    if (m.t === 'ringing') { call.cid = m.cid; if (m.peer && m.peer.name) call.peer.name = m.peer.name; setSt('Вызываю…'); return; }
    if (m.t === 'accepted') {
      liveScreen(); makePc();
      call.pc.createOffer().then(function (o) { return call.pc.setLocalDescription(o); })
        .then(function () { send({ t: 'sdp', cid: call.cid, sdp: call.pc.localDescription }); });
      return;
    }
    if (m.t === 'sdp' && call.pc) {
      var d = m.sdp;
      call.pc.setRemoteDescription(d).then(function () {
        flushIce();
        if (d.type === 'offer') return call.pc.createAnswer().then(function (a) { return call.pc.setLocalDescription(a); })
          .then(function () { send({ t: 'sdp', cid: call.cid, sdp: call.pc.localDescription }); });
      }).catch(function () {});
      return;
    }
    if (m.t === 'ice' && call.pc) {
      if (call.pc.remoteDescription && call.pc.remoteDescription.type) call.pc.addIceCandidate(m.c).catch(function () {});
      else call.iceQ.push(m.c);
      return;
    }
    if (m.t === 'hangup') { finish(WHY[m.why] != null ? WHY[m.why] : 'Звонок завершён'); }
  }

  function connect() {
    var s = sess(); if (!s || s.length < 40) return;
    try { ws = new WebSocket(WS_URL + '?sess=' + encodeURIComponent(s)); } catch (e) { return; }
    ws.onmessage = function (e) { try { onMsg(JSON.parse(e.data)); } catch (x) {} };
    ws.onclose = function () {
      ws = null; clearInterval(pingT);
      if (call && call.role === 'caller' && !call.pc) finish('Нет связи с EYE');
      setTimeout(connect, retry); retry = Math.min(retry * 2, 30000);
    };
    ws.onopen = function () { clearInterval(pingT); pingT = setInterval(function () { send({ t: 'ping' }); }, 30000); };
  }

  function startCall(id, name) {
    if (call) return;
    if (!ws || ws.readyState !== 1) { toast('EYE сейчас недоступен. Проверь интернет и попробуй ещё раз.'); return; }
    try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
    call = { cid: '', role: 'caller', peer: { id: String(id), name: name || '' } };
    ringScreen(call.peer, 'Включаю камеру…', false);
    media().then(function (s) {
      if (!call) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      call.local = s; setSt('Соединяю…');
      send({ t: 'call', to: String(id), video: true });
    }).catch(function () { finish('Нужен доступ к камере и микрофону'); });
  }

  /* ---------- кнопка в «Сообщениях» ---------- */
  function peerFromPage() {
    var to = ''; try { to = new URLSearchParams(location.search).get('to') || ''; } catch (e) {}
    var room = document.getElementById('chRoom');
    if (!to || !room || !room.classList.contains('on')) return null;
    var b = document.querySelector('#rPeer b');
    return { id: to.replace(/\D/g, ''), name: b ? b.textContent.trim() : '' };
  }
  function placeButton() {
    var menu = document.getElementById('rMenu'); if (!menu) return;
    var btn = document.getElementById('eyeCall'), p = peerFromPage();
    if (!p || !p.id) { if (btn) btn.hidden = true; return; }
    if (!btn) {
      addCss(); btn = document.createElement('button'); btn.type = 'button'; btn.id = 'eyeCall'; btn.className = 'eye-btn';
      btn.setAttribute('aria-label', 'Видеозвонок EYE'); btn.innerHTML = IC.cam;
      btn.onclick = function () { var q = peerFromPage(); if (q) startCall(q.id, q.name); };
      menu.parentNode.insertBefore(btn, menu);
    }
    btn.hidden = false;
  }

  window.EYE = { call: startCall, get me() { return me; }, get online() { return !!(ws && ws.readyState === 1); } };
  function boot() { connect(); placeButton(); setInterval(placeButton, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
