/* eg-gost.js v1 · 27.11.2026 · «Витрина до старта» (Андрей 27.11 00:52).
   Гости и FREE видят сайт, но ничего не меняют. Всё могут только PRO 11111–11114 (кроме регистрации: она закрыта для всех).
   - окно «Доступно только PRO… напишите в MAX» на любое действие (сохранить, отправить, добавить, лайк, коммент…);
   - кнопки регистрации (главная, канал) → «Регистрация в декабре»;
   - игра → «ДЛЯ PRO В ДЕКАБРЕ»;
   - запросы-изменения к серверу у не-PRO не уходят вовсе (сервер тоже их отклоняет: previewGuard_ в eagles-server).
   Подключается из /egpwa/pwa.js (есть на всех страницах). В декабре: убрать строку подключения из pwa.js. */
(function(){
  if (window.egGost) return;
  var FULL = ['11111', '11112', '11113', '11114'];
  var MAX = 'https://max.ru/u/f9LHodD0cOIec-v91ujcZ-dap9pM51MzN00AwcIMTy-x29hys8Mcg8n8HJ4';
  var SRV = 'functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
  var WRITE = /^(start_go|vlink_send|vlink_reset|chat_send|chat_block|ann_send|bin_join|bin_place|bin_fix|fr_add|fr_del|ec_del|ec_hid|ec_voice|kp_add|kp_hello|kp_del|kp_like|kp_swoop|kp_com|kp_cdel|kp_cedit|kc_keep|kc_upurl|kc_img|kc_add|kc_fold|kc_del|kc_folddel|update_profile|map_save|kop_save|img_put|img_del|avatar_upload|candidates_save|tax_set|videos_save|reg_request|reg_verify)$/;
  function ls(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
  var id = ls('eaglesfree_id'), ss = ls('eaglesfree_session');
  var mode = (id && ss) ? (FULL.indexOf(String(id)) >= 0 ? 'full' : 'free') : 'guest';
  document.documentElement.classList.add('eg-' + mode);

  var T = {
    pro: ['Доступно только PRO', 'Регистрация откроется в декабре. Напишите в MAX внизу страницы, чтобы забронировать очередь.', 1],
    reg: ['Регистрация в декабре', 'Сейчас сайт открыт только для просмотра. Напишите в MAX, чтобы забронировать очередь на регистрацию.', 1],
    lesson: ['Откроется в декабре', 'В декабре все уроки будут доступны всем с подпиской PRO.', 1],
    game: ['ДЛЯ PRO В ДЕКАБРЕ', 'Игра откроется вместе со стартом EAGLES.', 0]
  };
  var css = '#egG{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:egGf .18s ease-out}'
    + '@keyframes egGf{from{opacity:0}to{opacity:1}}'
    + '#egG .b{width:100%;max-width:360px;box-sizing:border-box;border-radius:24px;padding:24px 20px 18px;text-align:center;font-family:Montserrat,system-ui,sans-serif;color:#f4f4f2;'
    + 'background:linear-gradient(160deg,#2a1b0c,#120d09);box-shadow:inset 0 0 0 1.5px rgba(255,210,63,.55),0 20px 50px rgba(0,0,0,.6)}'
    + '#egG h3{margin:0 0 10px;font:900 19px/1.2 Montserrat,sans-serif;color:#ffd23f;letter-spacing:.02em}'
    + '#egG h3.big{font-size:24px;letter-spacing:.04em}'
    + '#egG p{margin:0 0 16px;font:600 14px/1.5 Montserrat,sans-serif;color:#f4f4f2}'
    + '#egG a,#egG button{display:block;width:100%;box-sizing:border-box;min-height:48px;border-radius:14px;font:800 14px Montserrat,sans-serif;cursor:pointer;text-decoration:none;line-height:48px;padding:0;margin-top:8px}'
    + '#egG a{background:linear-gradient(135deg,#ffd23f,#ff9a2b);color:#1a1206;border:0}'
    + '#egG button{background:transparent;color:#ffd23f;border:1.5px solid rgba(255,210,63,.45)}';
  var last = 0;
  function show(kind){
    var now = Date.now(); if (now - last < 600 || document.getElementById('egG')) return; last = now;
    if (!document.getElementById('egGcss')) { var st = document.createElement('style'); st.id = 'egGcss'; st.textContent = css; document.head.appendChild(st); }
    var t = T[kind] || T.pro, d = document.createElement('div'); d.id = 'egG';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="b"><h3' + (kind === 'game' ? ' class="big"' : '') + '>' + t[0] + '</h3><p>' + t[1] + '</p>'
      + (t[2] ? '<a href="' + MAX + '" target="_blank" rel="noopener">Написать в MAX</a>' : '') + '<button type="button">Понятно</button></div>';
    d.addEventListener('click', function(e){ if (e.target === d || e.target.tagName === 'BUTTON') d.remove(); });
    document.body.appendChild(d);
  }
  window.egGost = { mode: mode, full: mode === 'full', show: show, FULL: FULL };

  /* 1) регистрация закрыта для всех: кнопки «Зарегистрироваться» на главной и в канале */
  var REG = '.gbtn.reg,#gHow,.ek-cta,#ek-reggo';
  /* 2) не-PRO: игра */
  function stop(e){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
  function onTap(e){
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('#egG')) return;
    if (t.closest(REG)) { stop(e); show('reg'); return; }
    if (mode === 'full') return;
    if (t.closest('#eg-game-btn')) { stop(e); show('game'); return; }
  }
  ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu'].forEach(function(ev){
    document.addEventListener(ev, function(e){
      if (ev !== 'click') { var t = e.target; if (t && t.closest && (t.closest(REG) || (mode !== 'full' && t.closest('#eg-game-btn')))) { e.stopPropagation(); e.stopImmediatePropagation(); } return; }
      onTap(e);
    }, { capture: true, passive: false });
  });

  /* 3) сервер: изменения у не-PRO не отправляем; ответы reg_closed / pro_only → окно */
  function actOf(url, body){
    var a = '';
    try { var u = new URL(String(url), location.href); if (u.href.indexOf(SRV) < 0) return null; a = u.searchParams.get('action') || u.searchParams.get('type') || ''; } catch (e) { return null; }
    try {
      if (!a && body) {
        if (typeof FormData !== 'undefined' && body instanceof FormData) a = body.get('type') || body.get('action') || '';
        else if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) a = body.get('type') || body.get('action') || '';
        else if (typeof body === 'string') { var m = body.match(/(?:^|&)(?:type|action)=([a-z_]+)/); if (m) a = m[1]; }
      }
    } catch (e) {}
    return a;
  }
  function fake(err){ return new Response(JSON.stringify({ ok: false, error: err }), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
  if (window.fetch) {
    var of = window.fetch;
    window.fetch = function(input, init){
      var url = (input && input.url) || input, a = actOf(url, init && init.body);
      if (a == null) return of.apply(this, arguments);
      if (/^reg_(request|verify)$/.test(a)) { show('reg'); return Promise.resolve(fake('reg_closed')); }
      if (mode !== 'full' && WRITE.test(a)) { show('pro'); return Promise.resolve(fake(mode === 'guest' ? 'auth' : 'pro_only')); }
      return of.apply(this, arguments).then(function(r){
        try { r.clone().json().then(function(j){ if (j && (j.error === 'pro_only' || j.error === 'reg_closed')) show(j.error === 'reg_closed' ? 'reg' : 'pro'); }, function(){}); } catch (e) {}
        return r;
      });
    };
  }
  if (window.XMLHttpRequest) {
    var oo = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m, u){ this.__egU = u; return oo.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function(body){
      var a = actOf(this.__egU, body);
      if (a && ((mode !== 'full' && WRITE.test(a)) || /^reg_/.test(a))) {
        show(/^reg_/.test(a) ? 'reg' : 'pro');
        var x = this; setTimeout(function(){ try { x.abort(); } catch (e) {} }, 0); return;
      }
      return os.apply(this, arguments);
    };
  }
})();
