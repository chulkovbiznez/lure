/* eg-gost.js v2 · 27.11.2026 · «Витрина до старта» (Андрей 27.11 00:52).
   Гости и FREE видят сайт, но ничего не меняют. Всё могут только PRO 11111–11114 (кроме регистрации: она закрыта для всех).
   - окно «Доступно только PRO… напишите в MAX» на любое действие (сохранить, отправить, добавить, лайк, коммент…);
   - кнопки регистрации (главная, канал) → «Регистрация в декабре»;
   - игра → «ДЛЯ PRO В ДЕКАБРЕ»;
   - гость без входа: в Профиле и Контактах демо-кабинет под размытием (вымышленный «Орлан Демонов», ID 000000);
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

  /* 4) ГОСТЬ (без входа): вместо «Ты ещё не вошёл» — демо-кабинет. Все люди и цифры ВЫМЫШЛЕННЫЕ (пример). */
  function demo(){
    if (mode !== 'guest') return;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    var view = /\/profile(\.html)?$/.test(path) ? 'profile' : /\/contacts(\.html)?$/.test(path) ? 'contacts' : '';
    if (!view || document.getElementById('egDemo')) return;
    var N = ['Ан*** К.', 'Мар*** С.', 'Вик*** Л.', 'Ири*** П.', 'Ден*** Ж.', 'Оль*** Т.', 'Сер*** Б.', 'Нат*** Е.', 'Пав*** Д.', 'Еле*** Р.',
             'Ром*** Ф.', 'Юли*** Н.', 'Арт*** В.', 'Кри*** М.', 'Иго*** З.', 'Све*** А.', 'Мак*** Ю.', 'Дар*** Ш.', 'Ген*** Ц.', 'Тат*** Х.'];
    var W = ['смотрит ролик 2', 'досмотрел(а) до конца', 'смотрит ролик 1', 'открыл(а) ссылку', 'смотрит ролик 3'];
    var ST = [['пригласить', '#ffd23f'], ['смотрит ролик', '#3ecf6c'], ['перезвонить', '#ff6a2b'], ['думает', '#c9b48a']];
    var c = '#egDemo{position:fixed;left:0;right:0;top:0;bottom:calc(70px + env(safe-area-inset-bottom,0px));z-index:49;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#070708;color:#f4f4f2;font-family:Montserrat,system-ui,sans-serif}'
      + '#egDemo .w{max-width:520px;margin:0 auto;padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px}'
      + '#egDemo .top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:16px;background:linear-gradient(90deg,#2a1b0c,#120d09);box-shadow:inset 0 0 0 1px rgba(255,210,63,.3)}'
      + '#egDemo .top b{display:block;font:900 11px Montserrat,sans-serif;letter-spacing:.14em;color:#ffd23f}#egDemo .top small{display:block;font:600 11px Montserrat,sans-serif;color:#c9c0b2;margin-top:2px}'
      + '#egDemo .in{flex:none;min-height:38px;padding:0 16px;border-radius:999px;border:1.5px solid rgba(255,210,63,.6);background:transparent;color:#ffd23f;font:800 13px Montserrat,sans-serif;text-decoration:none;display:inline-flex;align-items:center}'
      + '#egDemo .bx{position:relative;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 1px #2a2622}'
      + '#egDemo .bl{filter:blur(5px);-webkit-filter:blur(5px);padding:18px;background:linear-gradient(160deg,#17141a,#110f13);display:flex;flex-direction:column;gap:12px;pointer-events:none;user-select:none}'
      + '#egDemo .av{display:flex;align-items:center;gap:12px}#egDemo .av i{width:64px;height:64px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 30%,#ffe08a,#e9a23b 55%,#6b3e10);box-shadow:0 0 0 2px #ffd23f}'
      + '#egDemo .av b{display:block;font:900 18px Montserrat,sans-serif}#egDemo .av small{color:#a29b90;font:600 12px Montserrat,sans-serif}'
      + '#egDemo .st{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}#egDemo .st div{background:#1d1a20;border-radius:14px;padding:10px}'
      + '#egDemo .st b{display:block;font:900 20px Montserrat,sans-serif;color:#ffd23f}#egDemo .st small{font:600 10px Montserrat,sans-serif;color:#a29b90}'
      + '#egDemo .r{display:flex;align-items:center;gap:10px;background:#1a171c;border-radius:12px;padding:8px 10px}#egDemo .r i{width:28px;height:28px;border-radius:50%;background:#3a2c18;flex:none}'
      + '#egDemo .r b{flex:1;font:700 13px Montserrat,sans-serif}#egDemo .r em{font:600 11px Montserrat,sans-serif;font-style:normal}'
      + '#egDemo .ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(7,7,8,.3)}'
      + '#egDemo .ov div{max-width:290px;text-align:center;padding:16px 18px;border-radius:20px;background:rgba(20,18,23,.85);box-shadow:inset 0 0 0 1.5px rgba(255,210,63,.6)}'
      + '#egDemo .ov b{display:block;font:900 11px Montserrat,sans-serif;letter-spacing:.14em;color:#ffd23f}#egDemo .ov p{margin:8px 0 4px;font:700 14px/1.35 Montserrat,sans-serif}#egDemo .ov small{color:#c9c0b2;font:600 12px Montserrat,sans-serif}'
      + '#egDemo h4{margin:6px 0 0;font:800 11px Montserrat,sans-serif;letter-spacing:.14em;color:#a29b90}'
      + '#egDemo .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}'
      + '#egDemo .t{display:flex;flex-direction:column;justify-content:space-between;gap:4px;min-height:76px;padding:12px;border-radius:18px;text-align:left;text-decoration:none;color:#f4f4f2;background:linear-gradient(150deg,#2a1b0c,#120d09);box-shadow:inset 0 0 0 1px rgba(255,210,63,.35);border:0;font-family:inherit;cursor:pointer}'
      + '#egDemo .t b{font:900 14px Montserrat,sans-serif}#egDemo .t small{font:600 11px Montserrat,sans-serif;color:#c9b48a}#egDemo .t.off small{color:#ff6a2b}'
      + '#egDemo .k{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#141217;box-shadow:inset 0 0 0 1px #2a2622}#egDemo .k i{width:36px;height:36px;border-radius:50%;flex:none;background:#2a1b0c;box-shadow:inset 0 0 0 1px #5a4220}'
      + '#egDemo .k div{flex:1;min-width:0}#egDemo .k b{display:block;font:800 14px Montserrat,sans-serif}#egDemo .k span{display:block;font:600 12px Montserrat,sans-serif;color:#a29b90;filter:blur(4px);-webkit-filter:blur(4px)}#egDemo .k em{font:700 11px Montserrat,sans-serif;font-style:normal}'
      + '#egDemo .hd{display:flex;align-items:center;justify-content:space-between}#egDemo .hd b{font:900 22px Montserrat,sans-serif}'
      + '#egDemo .plus{width:44px;height:44px;border-radius:50%;border:0;background:#2a2725;color:#8a8378;font:800 22px Montserrat,sans-serif;cursor:pointer}'
      + '#egDemo .note{font:600 12px/1.4 Montserrat,sans-serif;color:#a29b90}'
      + '#egDemo .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#egDemo .cards div{min-height:88px;border-radius:16px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;font:800 12px Montserrat,sans-serif;color:#fff}'
      + '#egDemo .cards span{filter:blur(3px);-webkit-filter:blur(3px);font-size:14px}'
      + '#egDemo .max{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:14px;background:linear-gradient(135deg,#ffd23f,#ff9a2b);color:#1a1206;font:800 14px Montserrat,sans-serif;text-decoration:none}'
      + '#egDemo .back{align-self:flex-start;background:none;border:0;color:#ffd23f;font:800 13px Montserrat,sans-serif;padding:8px 0;cursor:pointer}';
    var st = document.createElement('style'); st.id = 'egDemoCss'; st.textContent = c; document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'egDemo';
    var top = '<div class="top"><div><b>РЕЖИМ ПРОСМОТРА</b><small>Старт EAGLES в декабре 2026</small></div><a class="in" href="/">Войти</a></div>';
    var maxBtn = '<a class="max" href="' + MAX + '" target="_blank" rel="noopener">Написать в MAX — забронировать очередь</a>';
    function contactsHtml(n){
      var h = '';
      for (var i = 0; i < n; i++) { var s2 = ST[i % ST.length]; h += '<div class="k"><i></i><div><b>' + N[i] + '</b><span>+7 900 000 00 00</span></div><em style="color:' + s2[1] + '">' + s2[0] + '</em></div>'; }
      return h;
    }
    function profile(){
      var rows = '';
      for (var i = 0; i < 6; i++) rows += '<div class="r"><i></i><b>' + N[i] + '</b><em style="color:#3ecf6c">' + W[i % W.length] + '</em></div>';
      return top
        + '<div class="bx"><div class="bl" aria-hidden="true"><div class="av"><i></i><div><b>Орлан Демонов</b><br><small>ID 000000 · PRO · пример</small></div></div>'
        + '<div class="st"><div><b>137</b><small>касаний</small></div><div><b>48</b><small>контактов</small></div><div><b>20</b><small>смотрели ролики</small></div></div>' + rows + '</div>'
        + '<div class="ov"><div><b>ПРИМЕР ПРОФИЛЯ</b><p>Так выглядит кабинет партнёра: касания, контакты, кто смотрел твои ролики</p><small>Свой профиль — с PRO в декабре</small></div></div></div>'
        + '<h4>ПРОДУКТЫ · МОЖНО ОТКРЫТЬ И ПОСМОТРЕТЬ</h4><div class="g">'
        + '<button type="button" class="t" data-v="cards"><b>Карты</b><small>смотреть пример</small></button>'
        + '<a class="t" href="/contacts.html"><b>Мои контакты</b><small>смотреть пример</small></a>'
        + '<a class="t" href="https://lure.eaglesteam.ru/?gost=1"><b>LURE</b><small>какие есть нейросети</small></a>'
        + '<a class="t" href="/obuchenie.html"><b>Обучение</b><small>3 видео открыты</small></a>'
        + '<a class="t" href="/marketing.html"><b>Маркетинг</b><small>пакеты, ранги, бонусы</small></a>'
        + '<a class="t" href="/eyrie.html"><b>EYRIE</b><small>канал открыт</small></a>'
        + '<button type="button" class="t" data-v="pro"><b>EYE звонки</b><small>для PRO</small></button>'
        + '<button type="button" class="t off" data-v="game"><b>Игра</b><small>для PRO в декабре</small></button>'
        + '</div>' + maxBtn;
    }
    function cards(){
      return top + '<button type="button" class="back" data-v="profile">← Профиль</button><div class="hd"><b>Карты</b></div>'
        + '<div class="note">Пример: карты демо-профиля. Добавить свою — только PRO.</div><div class="cards">'
        + '<div style="background:linear-gradient(135deg,#e8321a,#7a1208)">Банк · кешбэк<span>•••• 4821</span></div>'
        + '<div style="background:linear-gradient(135deg,#2b6cf0,#0d2a6b)">Банк · зарплата<span>•••• 1907</span></div>'
        + '<div style="background:linear-gradient(135deg,#3ecf6c,#0f5a2a)">Банк · кредитка<span>•••• 6630</span></div>'
        + '<div style="background:linear-gradient(135deg,#e9a23b,#5a3208)">Своё фото<span>•••• 0042</span></div></div>'
        + '<button type="button" class="t off" data-v="pro" style="min-height:48px;align-items:center;justify-content:center"><b>+ Добавить карту</b></button>' + maxBtn;
    }
    function contacts(){
      return top + '<div class="hd"><b>Мои контакты</b><button type="button" class="plus" data-v="pro" aria-label="Добавить контакт">+</button></div>'
        + '<div class="note">Пример списка демо-профиля: имена скрыты наполовину, номера размыты. Свои контакты — с PRO в декабре.</div>'
        + contactsHtml(12) + maxBtn;
    }
    function draw(v){ d.innerHTML = '<div class="w">' + (v === 'cards' ? cards() : v === 'contacts' ? contacts() : profile()) + '</div>'; d.scrollTop = 0; }
    d.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-v]'); if (!b) return;
      var v = b.getAttribute('data-v');
      if (v === 'pro' || v === 'game') { show(v); return; }
      draw(v);
    });
    draw(view);
    document.body.appendChild(d);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demo); else demo();
})();
