/* EAGLES КОЛОКОЛЬЧИК v1 (egBell1, задание 83, 18.11.2026, Андрей).
   Профиль: золотой колокольчик в левом верхнем углу, если есть несделанные дела на сегодня:
   - Карты: срок сегодня или просрочен (как «Сегодня» в Картах) или пометка «срочно», не сделано;
   - Мои контакты: дата касания сегодня или прошла (как кнопка «Сегодня» в Контактах).
   При входе 2 раза «тын-дын» (+25 %, качание, вибрация на Android), потом пульс раз в 2 с.
   Звук с полным звонком — не чаще раза в 30 минут, иначе колокольчик просто пульсирует.
   Ничего не сохраняет и не меняет на сервере: только читает karty=get и candidates_load. */
(function () {
  if (window.egBell1) return; window.egBell1 = 1;
  var API = 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
  function LS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function LSset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var SESS = LS('eaglesfree_session') || '', ID = LS('eaglesfree_id') || '';
  if (!SESS || !ID) return;
  var SND = '__ZVONOK_B64__';
  var GAP = 30 * 60 * 1000, KEY = 'egBell1-last-' + ID;

  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  var TODAY = iso(new Date());
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ddmm(s) { return s ? s.slice(8, 10) + '.' + s.slice(5, 7) : ''; }

  /* ---------- звук: разблокируется первым касанием (ввод ПИНа — это касание) ---------- */
  var ctx = null, buf = null, unlocked = false, waitTouch = null;
  function bytes() { var s = atob(SND), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }
  function unlock() {
    try {
      if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return; ctx = new A(); }
      if (ctx.state === 'suspended') ctx.resume();
      if (!buf) ctx.decodeAudioData(bytes(), function (b) { buf = b; }, function () {});
      unlocked = true;
    } catch (e) {}
    if (waitTouch) { var f = waitTouch; waitTouch = null; setTimeout(f, 120); }
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(function (t) { document.addEventListener(t, unlock, { capture: true, passive: true }); });
  function play() { try { if (ctx && buf && ctx.state === 'running') { var s = ctx.createBufferSource(), g = ctx.createGain(); g.gain.value = 0.9; s.buffer = buf; s.connect(g); g.connect(ctx.destination); s.start(); } } catch (e) {} }

  /* ---------- данные ---------- */
  function cnt(d) { if (!d.kids) return { a: 1, d: d.done ? 1 : 0 }; var a = 0, x = 0; d.kids.forEach(function (k) { var c = cnt(k); a += c.a; x += c.d; }); return { a: a, d: x }; }
  function kartyList(o) {
    var out = [];
    if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { o = null; } }
    if (!o || !Array.isArray(o.maps)) return out;
    o.maps.forEach(function (m, mi) {
      function walk(d, path, names) {
        (d.kids || []).forEach(function (k, i) {
          if (!k || typeof k !== 'object') return;
          var isT = !Array.isArray(k.kids), c = isT ? null : cnt(k);
          var open = isT ? !k.done : (c.a > 0 && c.d < c.a);
          var pri = k.pri != null ? k.pri : (k.urgent ? 1 : 0);
          var today = !!k.due && k.due <= TODAY;
          if (open && (today || (isT && pri >= 1))) {
            var late = !!k.due && (k.due < TODAY || (k.due === TODAY && k.tm && k.tm < nowHM()));
            out.push({ name: isT ? (k.t || 'Дело') : (k.name || 'Остров'), where: [m.name || 'Карта'].concat(names).join(' › '),
              due: k.due || '', tm: k.tm || '', late: late, urgent: pri >= 1, link: '/karty.html#delo=' + [mi].concat(path, [i]).join('.') });
          }
          if (!isT) walk(k, path.concat([i]), names.concat([k.name || 'Остров']));
        });
      }
      if (m && m.data) walk(m.data, [], []);
    });
    out.sort(function (a, b) { return ((a.due || '9999') + (a.tm || '99')).localeCompare((b.due || '9999') + (b.tm || '99')); });
    return out;
  }
  function touchISO(s) {
    s = String(s || '').trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    var m = /^(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?$/.exec(s); if (!m) return '';
    var y = m[3] ? Number(m[3]) : new Date().getFullYear(); if (y < 100) y += 2000;
    var d = Number(m[1]), mo = Number(m[2]); if (!(d >= 1 && d <= 31 && mo >= 1 && mo <= 12)) return '';
    return y + '-' + pad(mo) + '-' + pad(d);
  }
  function kandList(o) {
    var out = [];
    if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { o = null; } }
    var C = o && o.candidates; if (!C) return out;
    Object.keys(C).forEach(function (id) {
      var c = C[id]; if (!c || c.locked) return;
      var t = touchISO(c.nextTouch); if (!t || t > TODAY) return;
      out.push({ name: c.name || 'Кандидат', due: t, late: t < TODAY, link: '/contacts.html' });
    });
    out.sort(function (a, b) { return a.due.localeCompare(b.due); });
    return out;
  }
  function tmo(p) { return Promise.race([p, new Promise(function (r) { setTimeout(function () { r(null); }, 8000); })]); }
  function getKarty() {
    var b = new URLSearchParams(); b.append('data', '');
    return tmo(fetch(API + '?type=map_save&sess=' + encodeURIComponent(SESS) + '&karty=get', { method: 'POST', body: b })
      .then(function (r) { return r.json(); }).then(function (g) { return g && g.ok && g.data ? g.data : null; }).catch(function () { return null; }))
      .then(function (d) { return d || LS('karty-v1-' + ID); });
  }
  function getKand() {
    return tmo(fetch(API + '?action=candidates_load&partnerId=' + encodeURIComponent(ID) + '&_=' + Date.now())
      .then(function (r) { return r.json(); }).then(function (g) { return g && g.ok && g.data ? g.data : null; }).catch(function () { return null; }))
      .then(function (d) { return d || LS('eaglesfree_kandidaty_' + ID); });
  }

  /* ---------- вид ---------- */
  var css = '' +
    '#egBell{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));left:16px;width:44px;height:44px;border-radius:50%;border:1.5px solid #ffd23f;padding:0;cursor:pointer;z-index:900;' +
    'background:radial-gradient(circle at 35% 30%,#2b2210,#0e0c0a 70%);display:grid;place-items:center;box-shadow:0 0 18px rgba(255,210,63,.28);-webkit-tap-highlight-color:transparent}' +
    '#egBell[hidden]{display:none}#egBell svg{width:23px;height:23px;transform-origin:50% 8%}' +
    '#egBell b{position:absolute;top:-5px;right:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#ff3b30;color:#fff;font:800 11px/16px Montserrat,system-ui,sans-serif;border:2px solid #070708;box-sizing:border-box;text-align:center}' +
    '#egBell.ring{animation:egBR .95s cubic-bezier(.3,.7,.4,1) both}#egBell.ring svg{animation:egBS .95s ease-in-out both}' +
    '@keyframes egBR{0%{transform:scale(1)}18%{transform:scale(1.25)}70%{transform:scale(1.25)}100%{transform:scale(1)}}' +
    '@keyframes egBS{0%{transform:rotate(0)}10%{transform:rotate(16deg)}20%{transform:rotate(-14deg)}30%{transform:rotate(12deg)}40%{transform:rotate(-10deg)}50%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}70%{transform:rotate(3deg)}80%,100%{transform:rotate(0)}}' +
    '#egBell.pulse{animation:egBP 2s ease-in-out infinite}#egBell.pulse::after{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid #ffd23f;animation:egBH 2s ease-out infinite;pointer-events:none}' +
    '@keyframes egBP{0%,100%{transform:scale(1)}12%{transform:scale(1.09)}26%{transform:scale(1)}}@keyframes egBH{0%{transform:scale(1);opacity:.7}40%{transform:scale(1.55);opacity:0}100%{opacity:0}}' +
    '#egBellP{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:calc(66px + env(safe-area-inset-top,0px)) 12px 20px}' +
    '#egBellP[hidden]{display:none}#egBellP .w{width:100%;max-width:440px;max-height:calc(100vh - 100px);overflow:auto;background:#141217;border:1px solid #e9a23b;border-radius:18px;padding:14px;box-shadow:0 18px 50px rgba(0,0,0,.7);font-family:Montserrat,system-ui,sans-serif;color:#f3ece0}' +
    '#egBellP .h{display:flex;justify-content:space-between;align-items:center;gap:10px;font:800 15px/1.3 Montserrat,sans-serif;color:#ffd23f;margin-bottom:6px}' +
    '#egBellP .x{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,210,63,.35);background:none;color:#ffe08a;font-size:18px;cursor:pointer}' +
    '#egBellP .g{font:800 11px/1.2 Montserrat,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#e9a23b;margin:12px 0 2px}' +
    '#egBellP a.i{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:.5px solid #2a2622;color:inherit;text-decoration:none}' +
    '#egBellP a.i i{font-style:normal;font:800 12px/1.4 Montserrat,sans-serif;color:#ff5a4f;white-space:nowrap;width:86px;flex:0 0 86px}#egBellP a.i i.ok{color:#ffd23f}' +
    '#egBellP a.i div{min-width:0;font-size:13px;line-height:1.4;font-weight:600}#egBellP a.i small{display:block;color:#9a9087;font-size:11px;font-weight:500}' +
    '#egBellP .bt{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}#egBellP .bt a{display:block;text-align:center;border-radius:12px;padding:11px;font:800 13px Montserrat,sans-serif;color:#1a1305;text-decoration:none;background:linear-gradient(90deg,#e9a23b,#ffd23f,#ffe08a)}' +
    '@media (prefers-reduced-motion:reduce){#egBell.pulse,#egBell.pulse::after,#egBell.ring,#egBell.ring svg{animation:none}}';
  var SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="egBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#e9a23b"/></linearGradient></defs>' +
    '<path fill="url(#egBg)" d="M12 2.2c.7 0 1.2.5 1.2 1.2v.7a6.3 6.3 0 0 1 5 6.2v4.1l1.7 2.4c.4.6 0 1.4-.7 1.4H4.8c-.7 0-1.1-.8-.7-1.4l1.7-2.4v-4.1a6.3 6.3 0 0 1 5-6.2v-.7c0-.7.5-1.2 1.2-1.2Z"/><path fill="url(#egBg)" d="M9.6 19.4h4.8a2.4 2.4 0 0 1-4.8 0Z"/></svg>';

  var bell = null, pop = null, K = [], P = [], timers = [];
  function build() {
    if (bell) return;
    var st = document.createElement('style'); st.id = 'egBellCss'; st.textContent = css; document.head.appendChild(st);
    bell = document.createElement('button'); bell.id = 'egBell'; bell.type = 'button'; bell.hidden = true;
    bell.innerHTML = SVG + '<b id="egBellN">0</b>'; document.body.appendChild(bell);
    pop = document.createElement('div'); pop.id = 'egBellP'; pop.hidden = true; document.body.appendChild(pop);
    bell.addEventListener('click', function () { draw(); pop.hidden = false; });
    pop.addEventListener('click', function (e) { if (e.target === pop || e.target.closest('.x')) pop.hidden = true; });
  }
  function when(x) {
    if (x.late) return x.due === TODAY ? 'просрочено' : 'с ' + ddmm(x.due);
    if (x.due === TODAY) return x.tm ? 'до ' + x.tm : 'сегодня';
    return 'срочно';
  }
  function draw() {
    var n = K.length + P.length, h = '<div class="w"><div class="h"><span>Сегодня не закрыто: ' + n + '</span><button type="button" class="x" aria-label="Закрыть">✕</button></div>';
    if (K.length) h += '<div class="g">Карты · ' + K.length + '</div>' + K.map(function (x) {
      return '<a class="i" href="' + x.link + '"><i class="' + (x.late ? '' : 'ok') + '">' + esc(when(x)) + '</i><div>' + esc(x.name) + '<small>' + esc(x.where) + (x.urgent && (x.due || x.late) ? ' · срочно' : '') + '</small></div></a>'; }).join('');
    if (P.length) h += '<div class="g">Мои контакты · ' + P.length + '</div>' + P.map(function (x) {
      return '<a class="i" href="' + x.link + '"><i class="' + (x.late ? '' : 'ok') + '">' + esc(x.late ? 'с ' + ddmm(x.due) : 'сегодня') + '</i><div>' + esc(x.name) + '<small>пора связаться</small></div></a>'; }).join('');
    h += '<div class="bt"><a href="/karty.html">Открыть Карты</a><a href="/contacts.html">Контакты</a></div></div>';
    pop.innerHTML = h;
  }
  function ringOnce(snd) {
    if (snd) play();
    try { if (snd && navigator.vibrate) navigator.vibrate([90, 60, 90]); } catch (e) {}
    bell.classList.remove('pulse', 'ring'); void bell.offsetWidth; bell.classList.add('ring');
  }
  function sequence(snd) {
    timers.forEach(clearTimeout); timers = [];
    timers.push(setTimeout(function () { ringOnce(snd); }, 300));
    timers.push(setTimeout(function () { ringOnce(snd); }, 300 + 2350));
    timers.push(setTimeout(function () { bell.classList.remove('ring'); bell.classList.add('pulse'); }, 300 + 2350 + 1100));
  }
  function pinOpen() { var p = document.querySelector('.egpn'); return !!(p && !p.hidden && getComputedStyle(p).display !== 'none'); }
  function show(first) {
    var n = K.length + P.length; build();
    if (!n) { bell.hidden = true; bell.classList.remove('pulse', 'ring'); pop.hidden = true; return; }
    document.getElementById('egBellN').textContent = n > 99 ? '99+' : String(n);
    var was = !bell.hidden; bell.hidden = false;
    if (!first) { if (!was) bell.classList.add('pulse'); return; }
    var last = Number(LS(KEY) || 0);
    if (Date.now() - last < GAP) { bell.classList.add('pulse'); return; }
    LSset(KEY, String(Date.now()));
    var tries = 0;
    (function go() {
      if (unlocked && ctx && ctx.state === 'running' && buf) return sequence(true);
      if (unlocked && ctx && tries++ < 10) return setTimeout(go, 150);
      sequence(false); waitTouch = function () { sequence(true); };
    })();
  }
  function load(first) {
    Promise.all([getKarty(), getKand()]).then(function (r) {
      K = kartyList(r[0]); P = kandList(r[1]);
      (function wait() { if (pinOpen()) return setTimeout(wait, 300); setTimeout(function () { show(first); }, first ? 350 : 0); })();
    });
  }
  function start() { load(true); document.addEventListener('visibilitychange', function () { if (!document.hidden) { TODAY = iso(new Date()); load(false); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
