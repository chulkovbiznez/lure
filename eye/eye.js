/* EYE v2.1 (16.11.2026) — видеозвонки EAGLES. Подключается на страницах сайта одной строкой:
   <script src="/eye.js?v=2" defer></script>   (файл лежит в бакете сайта app.eaglesteam.ru)
   Сам находит ключ входа EAGLES, держит связь с сервером EYE, показывает входящий звонок на любой странице.
   Правило Андрея 16.11.2026: звонить можно только взаимным ДРУЗЬЯМ (запрос + подтверждение).
   В «Сообщениях»: в шапке переписки — «В друзья» / «Принять» / золотая кнопка звонка (если друзья),
   в меню «⋯» — «Убрать из друзей»; на главном экране «Сообщений» — блок «Друзья · EYE» (запросы, друзья, добавить по ID).
   На других страницах — карточка «X хочет дружить». Внутри окна чата в Профиле (iframe) звонок идёт через Профиль. */
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
    '.eye-fr{flex:none;height:34px;padding:0 12px;margin-right:6px;border-radius:99px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;font:800 12px/1 Montserrat,system-ui,sans-serif;color:#ffd23f;background:rgba(255,210,63,.08);border:1.5px solid rgba(255,210,63,.55)}' +
    '.eye-fr svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}' +
    '.eye-gold{color:#2a1702;border:0;background:linear-gradient(180deg,#fff1b8,#ffd23f 38%,#f3b230 72%,#d98d16);box-shadow:0 6px 16px rgba(255,180,40,.3)}' +
    '.eye-dim{color:#a29b90;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.14)}' +
    '.eye-home{margin:12px 0 14px;padding:14px 14px 12px;border-radius:22px;background:linear-gradient(180deg,#17141a,#110f13);border:1px solid #2a2622;box-shadow:inset 0 0 0 1px rgba(255,210,63,.08);font-family:Montserrat,system-ui,sans-serif;color:#f4f2ee}' +
    '.eye-hh{display:flex;align-items:center;justify-content:space-between;gap:10px}' +
    '.eye-hh b{font:900 15px/1.1 Montserrat,sans-serif}.eye-hh b span{margin-left:6px;font-size:10px;letter-spacing:.3em;color:#ffd23f}' +
    '.eye-hh small{font:700 11px/1.3 Montserrat,sans-serif;color:#6d675f;text-align:right}' +
    '.eye-req{display:flex;align-items:center;gap:10px;margin-top:12px;padding:10px;border-radius:16px;background:rgba(255,210,63,.07);border:1px solid rgba(255,210,63,.3)}' +
    '.eye-req .t{flex:1;min-width:0;font:800 13px/1.25 Montserrat,sans-serif}.eye-req .t small{display:block;font:700 11px/1.3 Montserrat,sans-serif;color:#a29b90}' +
    '.eye-req .x{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#a29b90;font:800 15px/1 Montserrat,sans-serif;cursor:pointer}' +
    '.eye-chips{display:flex;gap:12px;overflow-x:auto;margin:12px -4px 0;padding:2px 4px 4px;scrollbar-width:none}.eye-chips::-webkit-scrollbar{display:none}' +
    '.eye-chip{flex:none;width:66px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;padding:0;cursor:pointer;color:#f4f2ee;font:800 11px/1.15 Montserrat,sans-serif;text-align:center}' +
    '.eye-chip em{font-style:normal;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.eye-ava{position:relative;flex:none;width:52px;height:52px;border-radius:50%;padding:2px;background:conic-gradient(#fff1b8,#ffd23f,#d98d16,#ffd23f,#fff1b8)}' +
    '.eye-ava>span{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 30%,#2e2316,#100c09);font:900 17px/1 Montserrat,sans-serif;color:#ffd23f}' +
    '.eye-ava img{width:100%;height:100%;object-fit:cover}' +
    '.eye-ava i{position:absolute;right:-3px;bottom:-3px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#fff1b8,#ffd23f 38%,#d98d16);color:#2a1702;border:2px solid #110f13}' +
    '.eye-ava i svg{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}' +
    '.eye-sm .eye-ava{width:40px;height:40px}.eye-sm .eye-ava>span{font-size:14px}' +
    '.eye-empty{margin-top:10px;font:700 12px/1.45 Montserrat,sans-serif;color:#a29b90}' +
    '.eye-wait{margin-top:10px;font:700 11px/1.4 Montserrat,sans-serif;color:#6d675f}' +
    '.eye-add{display:flex;gap:8px;margin-top:12px}' +
    '.eye-add input{flex:1;min-width:0;height:40px;padding:0 12px;border-radius:12px;border:1px solid #2a2622;background:#0d0c0e;color:#f4f2ee;font:700 14px Montserrat,sans-serif;outline:none}' +
    '.eye-add input:focus{border-color:rgba(255,210,63,.6)}' +
    '.eye-add button{flex:none;height:40px;padding:0 14px;border-radius:12px;cursor:pointer;font:800 13px Montserrat,sans-serif}' +
    '.eye-add button:disabled{opacity:.45;cursor:default}' +
    '.eye-card{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:2147482000;max-width:420px;margin:0 auto;padding:14px;border-radius:20px;background:rgba(20,17,22,.97);border:1px solid rgba(255,210,63,.45);box-shadow:0 14px 40px rgba(0,0,0,.6);font-family:Montserrat,system-ui,sans-serif;color:#f4f2ee;animation:eyeIn .25s ease-out}' +
    '@keyframes eyeIn{from{transform:translateY(-14px);opacity:0}to{transform:none;opacity:1}}' +
    '.eye-card .k{font:900 10px/1 Montserrat,sans-serif;letter-spacing:.3em;color:#ffd23f}' +
    '.eye-card .r{display:flex;align-items:center;gap:12px;margin-top:10px}.eye-card .r p{margin:0;flex:1;font:700 13px/1.35 Montserrat,sans-serif;color:#d8d2c8}.eye-card .r p b{color:#f4f2ee}' +
    '.eye-card .a{display:flex;gap:8px;margin-top:12px}.eye-card .a button{flex:1;height:42px;border-radius:14px;cursor:pointer;font:800 14px Montserrat,sans-serif}' +
    '@media (prefers-reduced-motion:reduce){.eye-av::before,.eye-av::after,.eye-yes i,.eye-card{animation:none}}';
  function addCss() { if (document.getElementById('eye-css')) return; var s = document.createElement('style'); s.id = 'eye-css'; s.textContent = css; document.head.appendChild(s); }

  var IC = {
    cam: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></svg>',
    end: '<svg viewBox="0 0 24 24"><path d="M3 14.5c5-4.6 13-4.6 18 0l-2.4 3-3.6-1.6v-2.6a10 10 0 00-6 0v2.6L5.4 17.5z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    flip: '<svg viewBox="0 0 24 24"><path d="M4 9a8 8 0 0114-4l2 2M20 15a8 8 0 01-14 4l-2-2M20 4v4h-4M4 20v-4h4"/></svg>',
    add: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5M19 8v6M16 11h6"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
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
    not_allowed: 'Звонить можно только друзьям.',
    not_friends: 'Звонить можно только друзьям. Добавь человека в друзья, а он подтвердит.',
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
      // v2.1: ошибки подключения (много открытых вкладок, нет входа) не показываем — они не про звонок.
      if (m.why === 'too_many' || m.why === 'no_login') { retry = 300000; return; }
      if (call && call.role === 'caller' && !call.cid) finish(WHY[m.why] || 'Не получилось позвонить');
      else if (call) toast(WHY[m.why] || 'Ошибка звонка');
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
    if (TOPW) {                       // окно чата внутри Профиля: звоним из Профиля, экран на весь телефон
      try { if (TOPW.EYE && TOPW.EYE.call) return TOPW.EYE.call(id, name); } catch (e) {}
      toast('EYE сейчас недоступен. Обнови страницу.'); return;
    }
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

  /* ---------- друзья (сервер сайта EAGLES: fr_list, fr_add, fr_del, fr_state) ---------- */
  var BACKEND = window.EYE_BACKEND || 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
  var FRON = null;       // null — ещё не знаем, true — друзья включены на сервере, false — нет (старый сервер: звонок как раньше)
  var FL = { friends: [], incoming: [], outgoing: [] }, FS = {}, flT = 0, busyFr = false;
  var FERR = {
    limit: 'Сегодня уже 20 запросов в друзья. Продолжим завтра.',
    blocked: 'Не получится: переписка между вами ограничена.',
    bad_id: 'Не нашёл человека с таким ID.',
    too_many: 'Слишком много друзей и запросов.',
    unknown_action: 'Друзья ещё не включены на сервере EAGLES.'
  };
  function api(p) {
    p.sess = sess();
    var q = Object.keys(p).map(function (k) { return k + '=' + encodeURIComponent(p[k]); }).join('&');
    return fetch(BACKEND + '?' + q + '&_=' + Date.now()).then(function (r) { return r.json(); });
  }
  function first(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
  function ava(x, cam) {
    var inner = x.av && /^(data:image\/|https:\/\/)/.test(x.av) ? '<img alt="" src="' + esc(x.av) + '">' : esc(initials(x.name));
    return '<span class="eye-ava"><span>' + inner + '</span>' + (cam ? '<i>' + IC.cam + '</i>' : '') + '</span>';
  }
  function setFL(r) {
    FL = { friends: r.friends || [], incoming: r.incoming || [], outgoing: r.outgoing || [] };
    FS = {};
    FL.friends.forEach(function (x) { FS[x.id] = 'yes'; });
    FL.incoming.forEach(function (x) { FS[x.id] = 'in'; });
    FL.outgoing.forEach(function (x) { FS[x.id] = 'out'; });
  }
  function loadFriends() {
    if (sess().length < 40) return Promise.resolve();
    flT = Date.now();
    return api({ action: 'fr_list' }).then(function (r) {
      if (r && r.ok) { FRON = true; setFL(r); }
      else if (r && r.error === 'unknown_action') FRON = false;
      render();
    }).catch(function () {});
  }
  function frDo(action, id, name) {
    if (busyFr) return Promise.resolve(); busyFr = true;
    return api({ action: action, 'with': id }).then(function (r) {
      busyFr = false;
      if (!r || !r.ok) { toast(FERR[r && r.error] || 'Не получилось. Попробуй ещё раз.'); return; }
      var nm = first(name) || 'Человек';
      if (action === 'fr_add') toast(r.state === 'yes' ? 'Теперь вы друзья. Можно звонить в EYE.' : 'Запрос отправлен. ' + nm + ' увидит его в «Сообщениях».');
      return loadFriends();
    }).catch(function () { busyFr = false; toast('Нет связи с сервером EAGLES'); });
  }

  /* ---------- «Сообщения»: шапка переписки ---------- */
  function peerFromPage() {
    var to = ''; try { to = new URLSearchParams(location.search).get('to') || ''; } catch (e) {}
    var room = document.getElementById('chRoom');
    if (!to || !room || !room.classList.contains('on')) return null;
    var b = document.querySelector('#rPeer b');
    return { id: to.replace(/\D/g, ''), name: b ? b.textContent.trim() : '' };
  }
  var roomPeer = '';
  function placeButton() {
    var menu = document.getElementById('rMenu'); if (!menu) return;
    var box = document.getElementById('eyeFr'), p = peerFromPage();
    if (!box) { addCss(); box = document.createElement('span'); box.id = 'eyeFr'; box.style.cssText = 'display:flex;align-items:center;flex:none'; menu.parentNode.insertBefore(box, menu); }
    if (!p || !p.id) { box.hidden = true; roomPeer = ''; sheetItem(null); return; }
    box.hidden = false;
    if (p.id !== roomPeer) {          // открыли другую переписку — уточняем дружбу у сервера
      roomPeer = p.id;
      if (FRON !== false) api({ action: 'fr_state', 'with': p.id }).then(function (r) {
        if (r && r.ok) { FRON = true; if (r.state) FS[p.id] = r.state; else delete FS[p.id]; render(); }
        else if (r && r.error === 'unknown_action') { FRON = false; render(); }
      }).catch(function () {});
    }
    var st = FRON === false ? 'yes' : FRON ? (FS[p.id] || '') : null, key = p.id + ':' + st;
    if (box.getAttribute('data-k') === key) { sheetItem(st); return; }
    box.setAttribute('data-k', key);
    if (st === null) { box.innerHTML = ''; sheetItem(null); return; }
    if (st === 'yes') {
      box.innerHTML = '<button type="button" class="eye-btn" id="eyeCall" aria-label="Видеозвонок EYE">' + IC.cam + '</button>';
      box.firstChild.onclick = function () { var q = peerFromPage(); if (q) startCall(q.id, q.name); };
    } else if (st === 'in') {
      box.innerHTML = '<button type="button" class="eye-fr eye-gold">' + IC.ok + 'Принять</button>';
      box.firstChild.onclick = function () { var q = peerFromPage(); if (q) frDo('fr_add', q.id, q.name); };
    } else if (st === 'out') {
      box.innerHTML = '<button type="button" class="eye-fr eye-dim">Ждём ответа</button>';
      box.firstChild.onclick = function () { var q = peerFromPage(); toast((first(q && q.name) || 'Человек') + ' ещё не подтвердил дружбу. Отменить запрос можно в меню ⋯'); };
    } else {
      box.innerHTML = '<button type="button" class="eye-fr">' + IC.add + 'В друзья</button>';
      box.firstChild.onclick = function () { var q = peerFromPage(); if (q) frDo('fr_add', q.id, q.name); };
    }
    sheetItem(st);
  }
  // пункт в меню «⋯» переписки
  function sheetItem(st) {
    var sh = document.getElementById('rSheet'), cancel = document.getElementById('rCancel');
    if (!sh || !cancel) return;
    var b = document.getElementById('eyeFrDel');
    var label = st === 'yes' ? 'Убрать из друзей' : st === 'out' ? 'Отменить запрос в друзья' : st === 'in' ? 'Отклонить запрос в друзья' : '';
    if (!label || FRON !== true) { if (b) b.hidden = true; return; }
    if (!b) {
      b = document.createElement('button'); b.type = 'button'; b.id = 'eyeFrDel';
      cancel.parentNode.insertBefore(b, cancel);
      b.onclick = function () { sh.classList.remove('on'); var q = peerFromPage(); if (q) frDo('fr_del', q.id, q.name); };
    }
    b.hidden = false; if (b.textContent !== label) b.textContent = label;
  }

  /* ---------- «Сообщения»: блок «Друзья · EYE» на главном экране ---------- */
  function homeBlock() {
    var home = document.getElementById('chHome'), list = document.getElementById('vChats');
    if (!home || !list) return;
    var el = document.getElementById('eyeHome');
    if (!el) { addCss(); el = document.createElement('div'); el.id = 'eyeHome'; el.className = 'eye-home'; el.hidden = true; list.parentNode.insertBefore(el, list); }
    el.hidden = FRON !== true || list.hidden || home.style.display === 'none';
    if (el.hidden) return;
    var key = JSON.stringify(FL);
    if (el.getAttribute('data-k') === key) return;
    var keep = el.querySelector('#eyeAddId'), typed = keep ? keep.value : '', focused = keep && document.activeElement === keep;
    el.setAttribute('data-k', key);
    var h = '<div class="eye-hh"><b>Друзья<span>EYE</span></b><small>видеозвонки только<br>между друзьями</small></div>';
    FL.incoming.forEach(function (x) {
      h += '<div class="eye-req eye-sm">' + ava(x) + '<div class="t">' + esc(x.name) + '<small>хочет дружить в EAGLES</small></div>' +
        '<button type="button" class="eye-fr eye-gold" data-a="ok" data-id="' + esc(x.id) + '">Принять</button>' +
        '<button type="button" class="x" data-a="no" data-id="' + esc(x.id) + '" aria-label="Отклонить">✕</button></div>';
    });
    if (FL.friends.length) {
      h += '<div class="eye-chips">' + FL.friends.map(function (x) {
        return '<button type="button" class="eye-chip" data-a="call" data-id="' + esc(x.id) + '" aria-label="Видеозвонок: ' + esc(x.name) + '">' + ava(x, true) + '<em>' + esc(first(x.name)) + '</em></button>';
      }).join('') + '</div>';
    } else if (!FL.incoming.length) {
      h += '<div class="eye-empty">Пока нет друзей. Открой переписку с человеком и нажми «В друзья» или впиши его ID ниже. Когда он подтвердит, сможете созваниваться по видео.</div>';
    }
    if (FL.outgoing.length) h += '<div class="eye-wait">Ждут подтверждения: ' + FL.outgoing.map(function (x) { return esc(first(x.name)); }).join(', ') + '</div>';
    h += '<form class="eye-add" autocomplete="off"><input id="eyeAddId" inputmode="numeric" maxlength="8" placeholder="Добавить в друзья по ID" aria-label="ID человека">' +
      '<button type="submit" class="eye-gold" id="eyeAddGo" disabled>Позвать</button></form>';
    el.innerHTML = h;
    var inp = el.querySelector('#eyeAddId'), go = el.querySelector('#eyeAddGo');
    inp.value = typed; go.disabled = typed.length < 5; if (focused) inp.focus();
    inp.oninput = function () { this.value = this.value.replace(/\D/g, ''); go.disabled = this.value.length < 5; };
    el.querySelector('form').onsubmit = function (e) {
      e.preventDefault(); var id = inp.value; if (id.length < 5) return;
      go.disabled = true; frDo('fr_add', id, '').then(function () { var i2 = document.getElementById('eyeAddId'); if (i2) { i2.value = ''; } });
    };
    Array.prototype.forEach.call(el.querySelectorAll('[data-a]'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-id'), a = b.getAttribute('data-a'), x = byId(id);
        if (a === 'call') startCall(id, x ? x.name : '');
        else if (a === 'ok') frDo('fr_add', id, x ? x.name : '');
        else if (a === 'no') frDo('fr_del', id, x ? x.name : '');
      };
    });
  }
  function byId(id) {
    var all = FL.friends.concat(FL.incoming, FL.outgoing);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* ---------- карточка «X хочет дружить» на остальных страницах ---------- */
  var cardEl = null;
  function seen() { try { return JSON.parse(sessionStorage.getItem('eye_fr_seen') || '[]'); } catch (e) { return []; } }
  function markSeen(id) { var a = seen(); if (a.indexOf(id) < 0) a.push(id); try { sessionStorage.setItem('eye_fr_seen', JSON.stringify(a)); } catch (e) {} }
  function reqCard() {
    if (TOPW || FRON !== true || call || document.getElementById('chHome')) { if (cardEl && (call || FRON !== true)) { cardEl.remove(); cardEl = null; } return; }
    var s0 = seen(), x = null;
    for (var i = 0; i < FL.incoming.length; i++) if (s0.indexOf(FL.incoming[i].id) < 0) { x = FL.incoming[i]; break; }
    if (!x) { if (cardEl) { cardEl.remove(); cardEl = null; } return; }
    if (cardEl && cardEl.getAttribute('data-id') === x.id) return;
    if (cardEl) cardEl.remove();
    addCss();
    cardEl = document.createElement('div'); cardEl.className = 'eye-card'; cardEl.setAttribute('role', 'dialog'); cardEl.setAttribute('data-id', x.id);
    cardEl.innerHTML = '<div class="k">EYE · ЗАПРОС В ДРУЗЬЯ</div><div class="r eye-sm">' + ava(x) +
      '<p><b>' + esc(x.name) + '</b> хочет дружить в EAGLES. Друзья могут созваниваться по видео.</p></div>' +
      '<div class="a"><button type="button" class="eye-fr eye-dim" data-a="later">Позже</button><button type="button" class="eye-fr eye-gold" data-a="ok">Принять</button></div>';
    document.body.appendChild(cardEl);
    var id = x.id, nm = x.name;
    cardEl.querySelector('[data-a="later"]').onclick = function () { markSeen(id); reqCard(); };
    cardEl.querySelector('[data-a="ok"]').onclick = function () { markSeen(id); frDo('fr_add', id, nm); };
  }

  function render() { placeButton(); homeBlock(); reqCard(); }

  /* ---------- запуск ---------- */
  // Окно чата внутри Профиля (iframe того же сайта, где тоже подключён EYE): своё соединение не открываем,
  // звонки и входящие показывает Профиль.
  var TOPW = null;
  try {
    if (window.top !== window && window.top.location.host === location.host &&
        window.top.document.querySelector('script[src*="eye.js"]')) TOPW = window.top;
  } catch (e) { TOPW = null; }

  window.EYE = {
    call: startCall, friends: loadFriends,
    get me() { return me; }, get online() { return !!(ws && ws.readyState === 1); }
  };
  function tick() {
    render();
    if (!document.hidden && Date.now() - flT > (document.getElementById('chHome') ? 45000 : 120000)) loadFriends();
  }
  function boot() {
    if (!TOPW) connect();
    loadFriends();
    setInterval(tick, 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && Date.now() - flT > 15000) loadFriends(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
