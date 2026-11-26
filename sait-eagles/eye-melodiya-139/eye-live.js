/* EYE v6.2 (25.11.2026) — кнопки «Принять» / «Сбросить» в уведомлении о звонке (приложение EAGLES 1.2): страница открывается с ?eyeans=ID или ?eyedecl=ID,
   и звонок от этого человека принимается или сбрасывается сам, без второго нажатия.
   EYE v6.1 (17.11.2026) — при первом входе на страницу EYE: карточка «Разреши доступ к камере и микрофону» (крестик) + сразу запрос телефона.
   EYE v6 (17.11.2026) — кнопка «Заявки» вверху страницы EYE: список людей, которые зовут в друзья (Принять / Отклонить); цифра на «Звонках» = только пропущенные звонки;
   плитка на главной Профиля с логотипом из страницы не перезаписывается.
   EYE v5 (16.11.2026) — EYE открывается обычной страницей /chat.html с нижним меню (как Контакты, Обучение), без окна с золотой рамкой поверх Профиля.
   EYE v4.2 (16.11.2026) — пункт EYE в нижнем меню теперь стоит прямо в страницах (сразу 5 пунктов, без «подскока»); eye.js только оживляет его.
   EYE v4.1 (16.11.2026) — chat.html v2 сама рисует шапку EYE и три вкладки (без мелькания «Сообщений»); eye.js не дублирует вкладку «Звонки».
   EYE v4 (16.11.2026) — EYE как продукт: золотая кнопка EYE на главной вместо «Чата с командой», пункт EYE в нижнем меню,
   красная цифра = непрочитанные сообщения + пропущенные звонки + запросы в друзья; в окне EYE вкладки «Чаты», «Звонки», «Объявления».
   «Звонки»: друзья с кнопками аудио/видео, недавние и пропущенные звонки (журнал хранится в этом телефоне/компьютере), добавить друга по ID.
   EYE v3.3 (16.11.2026) — кнопка «показать экран» есть и на телефоне: пробуем, иначе понятная подсказка.
   EYE v3.2 (16.11.2026) — главный экран (у каждого свой выбор, нажатием), демонстрация экрана с компьютера, значки микрофона/камеры.
   EYE v3.1 (16.11.2026) — камера выключена: аватарка или серый «ноунейм», имя и фамилия, аудиоволны.
   EYE v3 (16.11.2026) — аудио или видео, звонок до 4 человек (кнопка «+» в звонке зовёт своего друга).
   Было: EYE v2.3 (16.11.2026) — видеозвонки EAGLES. Подключается на страницах сайта одной строкой:
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
    '.eye-c{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(255,210,63,.14);border:1px solid rgba(255,210,63,.5);color:#ffd23f;cursor:pointer}' +
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
    '.eye-audio .eye-lv,.eye-audio #eyeCam,.eye-audio #eyeFlip{display:none}.eye-audio .eye-rv{opacity:0}' +
    '.eye-abox{display:none}.eye-audio .eye-abox{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(360px 360px at 50% 40%,rgba(255,170,40,.22),transparent 70%),linear-gradient(180deg,#120d07,#070708 70%)}' +
    '.eye-abox .eye-av{margin-top:0}.eye-audio .eye-who{display:none}' +
    '.eye-pick{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:flex-end;background:rgba(0,0,0,.55);font-family:Montserrat,system-ui,sans-serif}' +
    '.eye-pick .in{width:100%;max-width:520px;margin:0 auto;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));border-radius:22px 22px 0 0;background:#141217;border:1px solid #2a2622;color:#f4f2ee}' +
    '.eye-pick .h{font:900 15px/1.3 Montserrat,sans-serif;text-align:center;margin-bottom:12px}' +
    '.eye-pick .r{display:flex;gap:10px}.eye-pick .r button{flex:1;height:52px;border-radius:16px;justify-content:center;font-size:14px}' +
    '.eye-pick .c{display:block;width:100%;height:44px;margin-top:10px;border-radius:14px;border:1px solid #2a2622;background:#1d1a17;color:#a29b90;font:800 14px Montserrat,sans-serif;cursor:pointer}' +
    '.eye-grid{position:absolute;inset:0;display:grid;gap:6px;background:#070708}.eye-grid.n1{grid-template:1fr/1fr}.eye-grid.n2{grid-template:1fr 1fr/1fr}.eye-grid.n3{grid-template:1fr 1fr/1fr 1fr}.eye-grid.n3 .eye-tile:first-child{grid-column:1/3}' +
    '.eye-grid.g{top:calc(62px + env(safe-area-inset-top,0px));bottom:calc(104px + env(safe-area-inset-bottom,0px));padding:0 6px}.eye-grid.g .eye-tile{border-radius:16px;border:1px solid #2a2622}' +
    '.eye-tile{position:relative;overflow:hidden;min-height:0;background:radial-gradient(360px 300px at 50% 40%,rgba(255,170,40,.20),transparent 70%),linear-gradient(180deg,#120d07,#070708 75%)}' +
    '.eye-tile video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}.eye-tile.hasv video{opacity:1}' +
    '.eye-tile .ta{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center}.eye-tile.hasv .ta{display:none}' +
    '.eye-tile .ta .eye-av{margin-top:0}.eye-grid.g .eye-av{width:84px;height:84px}.eye-grid.g .eye-av div{font-size:28px}.eye-grid.g .eye-av::before,.eye-grid.g .eye-av::after{inset:-10px}.eye-grid.g .eye-nm{margin-top:14px;font-size:15px}.eye-grid.g .eye-st{font-size:12px}' +
    '.eye-tile.inv{opacity:.8}.eye-tile:not(.inv) .eye-av::before,.eye-tile:not(.inv) .eye-av::after{animation:none;opacity:0}' +
    '.eye-tile .tn{display:none}.eye-grid.g .eye-tile.hasv .tn{display:block;position:absolute;left:10px;bottom:8px;font:800 13px/1 Montserrat,sans-serif;text-shadow:0 1px 6px rgba(0,0,0,.9)}' +
    '.eye-c.off#eyeAdd{opacity:.4}.eye-pick.top{z-index:2147483002}.eye-pick .eye-chips{justify-content:center;flex-wrap:wrap}.eye-pick .s{margin-top:10px;font:700 11px/1.4 Montserrat,sans-serif;color:#6d675f;text-align:center}' +
    '.eye-av div img{width:100%;height:100%;object-fit:cover;border-radius:50%}.eye-av div .eye-nn{width:62%;height:62%;fill:#6f6a64;margin-top:12%}.eye-tile .eye-av div{background:radial-gradient(circle at 50% 30%,#3a3631,#1c1a18)}' +
    '.eye-tile .eye-av{transition:box-shadow .08s linear}.eye-wv{display:flex;align-items:center;gap:4px;height:34px;margin-top:14px}.eye-wv i{display:block;width:5px;height:34px;border-radius:3px;background:linear-gradient(180deg,#fff1b8,#ffd23f 50%,#d98d16);transform:scaleY(.15);transform-origin:50% 50%}' +
    '.eye-grid.g .eye-wv{height:22px;margin-top:10px}.eye-grid.g .eye-wv i{height:22px;width:4px}.eye-tile.inv .eye-wv,.eye-tile.moff .eye-wv{opacity:.25}.eye-lv.off{display:none}' +
    '.eye-tile .eye-nm{padding:0 10px}' +
    '.eye-grid{display:block!important;top:0!important;bottom:0!important;padding:0!important}.eye-grid .eye-tile{position:absolute;inset:0;border:0!important;border-radius:0!important}.eye-grid .eye-tile .tn{display:none!important}' +
    '.eye-strip{position:absolute;left:10px;right:10px;bottom:calc(104px + env(safe-area-inset-bottom,0px));z-index:2;display:flex;gap:8px;justify-content:flex-end;overflow-x:auto;scrollbar-width:none;padding:4px 2px}.eye-strip::-webkit-scrollbar{display:none}' +
    '.eye-strip .eye-tile{flex:none;width:84px;height:112px;border-radius:14px;border:2px solid rgba(255,210,63,.55);box-shadow:0 6px 18px rgba(0,0,0,.55);cursor:pointer}.eye-strip .eye-tile.me{border-color:rgba(255,255,255,.35)}' +
    '.eye-strip .ta{padding:4px 4px 16px}.eye-strip .eye-av{width:46px;height:46px;padding:2px}.eye-strip .eye-av div{font-size:16px}.eye-strip .eye-nm,.eye-strip .eye-st{display:none}' +
    '.eye-strip .eye-wv{height:12px;margin-top:6px;gap:2px}.eye-strip .eye-wv i{height:12px;width:3px}' +
    '.eye-strip .tn{display:block!important;position:absolute;left:0;right:0;bottom:4px;text-align:center;font:800 10px/1 Montserrat,sans-serif;text-shadow:0 1px 4px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px}' +
    '.eye-tile.me video{transform:scaleX(-1)}.eye-tile.scr video{object-fit:contain;background:#000;transform:none}' +
    '.eye-who{bottom:auto!important;top:calc(66px + env(safe-area-inset-top,0px))}.eye-c.on{background:linear-gradient(180deg,#fff1b8,#ffd23f 40%,#d98d16);color:#2a1702;border:0}' +
    '@media (max-width:400px){.eye-c{width:44px;height:44px}.eye-c.end{width:56px;height:56px}.eye-ctl{padding:10px 12px}}' +
    '@media (prefers-reduced-motion:reduce){.eye-av::before,.eye-av::after,.eye-yes i,.eye-card{animation:none}}';
  css += '' +
    '.eye-tn{position:absolute;top:0;left:calc(50% + 5px);min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#e8321a;color:#fff;font:900 10px/16px Montserrat,sans-serif;font-style:normal;text-align:center;box-shadow:0 0 0 2px #0a0806}.eye-tn[hidden]{display:none}' +
    '#openChat[data-eye] .cb-t b{letter-spacing:.22em}' +
    '.eye-h1{color:#ffd23f;letter-spacing:.16em}.eye-h1s{display:block;margin-top:2px;font:700 11px/1.2 Montserrat,sans-serif;letter-spacing:0;color:#a29b90}' +
    '.eye-calls{font-family:Montserrat,system-ui,sans-serif;color:#f4f2ee}' +
    '.eye-lbl{margin:16px 2px 8px;font:800 11px/1 Montserrat,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#e9a23b}.eye-calls .eye-lbl:first-child{margin-top:2px}' +
    '.eye-row{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;margin-bottom:8px;border-radius:16px;background:#141217;border:1px solid #2a2622;color:#f4f2ee;text-align:left;font-family:inherit}' +
    'button.eye-row{cursor:pointer}' +
    '.eye-row .t{flex:1;min-width:0;font:800 14.5px/1.25 Montserrat,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.eye-row .t small{display:block;margin-top:2px;font:600 12px/1.3 Montserrat,sans-serif;color:#a29b90;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eye-row .t small.miss{color:#ff6a5a}' +
    '.eye-row .tm{flex:none;align-self:flex-start;font:700 11px/1 Montserrat,sans-serif;color:#6d675f}' +
    '.eye-row .fb{flex:none;display:flex;gap:8px}' +
    '.eye-cb{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer;border:0;color:#2a1702;background:linear-gradient(180deg,#fff1b8,#ffd23f 38%,#f3b230 72%,#d98d16);box-shadow:0 6px 16px rgba(255,180,40,.25)}' +
    '.eye-cb.au{color:#ffd23f;background:rgba(255,210,63,.08);border:1px solid rgba(255,210,63,.45);box-shadow:none}' +
    '.eye-cb svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.eye-reqs{position:fixed;inset:0;z-index:2147482400;display:flex;align-items:flex-end;background:rgba(0,0,0,.55);font-family:Montserrat,system-ui,sans-serif}' +
    '.eye-reqs .in{width:100%;max-width:520px;margin:0 auto;max-height:80vh;overflow:auto;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));border-radius:22px 22px 0 0;background:#141217;border-top:1px solid rgba(255,210,63,.35);color:#f4f4f2}' +
    '.eye-reqs .h{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px;font:900 16px/1.2 Montserrat,sans-serif;color:#ffd23f}' +
    '.eye-reqs .h button{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#a29b90;font:800 15px/1 Montserrat,sans-serif;cursor:pointer}' +
    '.eye-reqs .eye-req{margin:0 0 8px}.eye-reqs .eye-empty{margin:4px 0 6px}.eye-reqs .eye-wait{margin-top:10px}' +
    '.eye-perm{position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:2147482300;max-width:500px;margin:0 auto;padding:16px 16px 14px;border-radius:20px;background:linear-gradient(180deg,#2a1d0c,#141008);border:1.5px solid #ffd23f;box-shadow:0 18px 40px rgba(0,0,0,.6),0 0 24px rgba(255,210,63,.25);color:#f4f4f2;font-family:Montserrat,system-ui,sans-serif}' +
    '.eye-perm .k{font:900 15px/1.25 Montserrat,sans-serif;color:#ffd23f;padding-right:34px}.eye-perm p{margin:8px 0 0;font:600 13px/1.45 Montserrat,sans-serif;color:#e8e1d4}' +
    '.eye-perm .x{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#c9c1b4;font:800 15px/1 Montserrat,sans-serif;cursor:pointer}' +
    '.eye-perm .go{display:block;width:100%;height:46px;margin-top:12px;border:0;border-radius:14px;background:linear-gradient(135deg,#ffd23f,#ff9a2b);color:#1a0d04;font:900 15px Montserrat,sans-serif;cursor:pointer}' +
    '.eye-perm .ar{display:block;margin:10px auto 0;width:28px;height:28px;color:#ffd23f;animation:eyeArr 1.1s ease-in-out infinite}@keyframes eyeArr{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}' +
    '.eye-perm.ok{border-color:#46de82}.eye-perm.ok .k{color:#46de82}' +
    '.eye-calls .eye-req{margin:0 0 8px}.eye-calls .eye-add{margin-top:0}.eye-note{margin:14px 2px 0;font:600 11px/1.45 Montserrat,sans-serif;color:#6d675f}';
  function addCss() { if (document.getElementById('eye-css')) return; var s = document.createElement('style'); s.id = 'eye-css'; s.textContent = css; document.head.appendChild(s); }

  var IC = {
    cam: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></svg>',
    end: '<svg viewBox="0 0 24 24"><path d="M3 14.5c5-4.6 13-4.6 18 0l-2.4 3-3.6-1.6v-2.6a10 10 0 00-6 0v2.6L5.4 17.5z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    micx: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M3.5 3.5l17 17"/></svg>',
    camx: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5zM2 3l19 19"/></svg>',
    scr: '<svg viewBox="0 0 24 24"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4M12 13.5V7.5M9 10l3-3 3 3"/></svg>',
    flip: '<svg viewBox="0 0 24 24"><path d="M4 9a8 8 0 0114-4l2 2M20 15a8 8 0 01-14 4l-2-2M20 4v4h-4M4 20v-4h4"/></svg>',
    add: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5M19 8v6M16 11h6"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    tel: '<svg viewBox="0 0 24 24"><path d="M5 3.5h3.5l1.8 4.6-2.3 1.5a11 11 0 006.4 6.4l1.5-2.3 4.6 1.8V19a2 2 0 01-2 2A17.5 17.5 0 013 5.5a2 2 0 012-2z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  var ov = null;
  function clearOv() { if (ov) { ov.remove(); ov = null; } stopTone(); }
  function toast(t) { addCss(); var d = document.createElement('div'); d.className = 'eye-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, t.length > 80 ? 9000 : 4200); }

  function ringScreen(peer, status, incoming) {
    clearOv(); addCss();
    ov = document.createElement('div'); ov.className = 'eye-ov eye-ring-bg'; ov.setAttribute('role', 'dialog');
    ov.innerHTML = '<div class="eye-brand">EYE</div><div class="eye-kind">' + (call && call.video === false ? 'Аудиозвонок' : 'Видеозвонок') + ' EAGLES</div>' +
      '<div class="eye-av"><div>' + faceHtml(peer) + '</div></div>' +
      '<div class="eye-nm">' + esc(peer.name || ('ID ' + peer.id)) + '</div><div class="eye-st" id="eyeSt">' + esc(status) + '</div>' +
      '<div class="eye-acts">' +
      (incoming ? '<button class="eye-b eye-no" id="eyeNo"><i>' + IC.end + '</i>Отклонить</button><button class="eye-b eye-yes" id="eyeYes"><i>' + (call && call.video === false ? IC.tel : IC.cam) + '</i>Принять</button>'
                : '<button class="eye-b eye-no" id="eyeNo"><i>' + IC.end + '</i>Отменить</button>') +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('#eyeNo').onclick = function () { if (call) { call.byMe = true; send({ t: incoming ? 'decline' : 'hangup', cid: call.cid }); } finish(''); };
    if (incoming) ov.querySelector('#eyeYes').onclick = accept;
  }
  function setSt(t) { var e = ov && ov.querySelector('#eyeSt'); if (e) e.textContent = t; }

  function liveScreen() {
    clearOv(); addCss();
    ov = document.createElement('div'); ov.className = 'eye-ov eye-live' + (call.video === false ? ' eye-audio' : '');
    ov.innerHTML = '<div class="eye-grid" id="eyeGrid"></div><div class="eye-strip" id="eyeStrip"></div>' +
      '<div class="eye-top"><span class="eye-pill" id="eyeQ">● соединяю…</span><span class="eye-pill g" id="eyeT">00:00</span></div>' +
      '<div class="eye-who" id="eyeWho"></div>' +
      '<div class="eye-ctl"><button class="eye-c" id="eyeMic" aria-label="Микрофон">' + IC.mic + '</button><button class="eye-c" id="eyeCam" aria-label="Камера">' + IC.cam + '</button>' +
      '<button class="eye-c end" id="eyeEnd" aria-label="Завершить">' + IC.end + '</button><button class="eye-c" id="eyeAdd" aria-label="Добавить в звонок">' + IC.add + '</button>' +
      '<button class="eye-c" id="eyeScr" aria-label="Демонстрация экрана">' + IC.scr + '</button>' +
      (PHONE ? '<button class="eye-c" id="eyeFlip" aria-label="Сменить камеру">' + IC.flip + '</button>' : '') + '</div>';
    document.body.appendChild(ov);
    ov.querySelector('#eyeEnd').onclick = function () { send({ t: 'hangup', cid: call.cid }); finish('Звонок завершён'); };
    ov.querySelector('#eyeMic').onclick = function () { toggle('audio', this); };
    ov.querySelector('#eyeCam').onclick = function () { toggle('video', this); };
    ov.querySelector('#eyeAdd').onclick = addPick;
    ov.querySelector('#eyeScr').onclick = shareScreen; if (PHONE) ov.querySelector('#eyeFlip').onclick = flip;
    var st0 = myState(); ov.querySelector('#eyeMic').innerHTML = st0.mic ? IC.mic : IC.micx; ov.querySelector('#eyeMic').classList.toggle('off', !st0.mic);
    if (!wvRaf) wvRaf = requestAnimationFrame(waves);
    call.t0 = Date.now();
    clearInterval(call.timer);
    call.timer = setInterval(function () {
      if (!call) return;
      var s = Math.floor((Date.now() - call.t0) / 1000), e = ov && ov.querySelector('#eyeT');
      if (e) e.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      layout();
    }, 1000);
    layout();
  }
  /* v3: плитки участников (до 3 собеседников + я в углу) */
  function vals(o) { return Object.keys(o || {}).map(function (k) { return o[k]; }); }
  function hasVideo(st) { return !!st && st.getVideoTracks().some(function (t) { return t.readyState === 'live' && !t.muted; }); }
  function layout() {
    if (!call || !ov) return;
    var g = ov.querySelector('#eyeGrid'), sp = ov.querySelector('#eyeStrip'); if (!g || !sp) return;
    var others = vals(call.peers).concat(vals(call.inv)), M = meX(), all = others.concat([M]), keep = [];
    var ids = all.map(function (x) { return x.id; });
    // кто на большом экране: каждый выбирает сам у себя (нажал на маленькую плитку — она стала большой)
    if (call.pinned && ids.indexOf(call.main) < 0) call.pinned = false;
    if (!call.pinned) call.main = defMain();
    var mainX = null;
    all.forEach(function (x) {
      if (!x.tile) {
        x.tile = document.createElement('div'); x.tile.className = 'eye-tile' + (x.isMe ? ' me' : '');
        x.tile.innerHTML = '<video autoplay playsinline' + (x.isMe ? ' muted' : '') + '></video><div class="ta"><div class="eye-av"><div>' + faceHtml(x) + '</div></div>' +
          '<div class="eye-nm">' + esc(x.name || ('ID ' + x.id)) + '</div><div class="eye-st"></div>' +
          '<div class="eye-wv" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="tn">' + (x.isMe ? 'Ты' : esc(first(x.name) || ('ID ' + x.id))) + '</div>';
        x.tile.onclick = function () { if (call && !x.inv && call.main !== x.id) { call.main = x.id; call.pinned = true; layout(); } };
      }
      var v = x.tile.querySelector('video'), stream = x.isMe ? (call.screen ? call.scrStream : call.local) : x.stream;
      if (stream && v.srcObject !== stream) v.srcObject = stream;
      var hv = x.isMe ? (!!call.screen || myState().camOn) : (hasVideo(x.stream) && !x.camOff);
      x.tile.classList.toggle('hasv', hv);
      x.tile.classList.toggle('scr', x.isMe ? !!call.screen : !!x.scr);
      x.tile.classList.toggle('moff', x.isMe ? !myState().mic : !!x.micOff);
      if (!x.faceOk && !x.inv && !x.isMe) { var f = x.tile.querySelector('.eye-av>div'); if (f && avOf(x.id) !== null) { f.innerHTML = faceHtml(x); x.faceOk = true; } }
      x.tile.classList.toggle('inv', !!x.inv);
      x.tile.querySelector('.eye-st').textContent = x.isMe ? (myState().mic ? 'Ты' : 'Ты · микрофон выключен') : x.inv ? 'Звоним…' : x.micOff && x.cs === 'connected' ? 'микрофон выключен' : x.camOff && x.cs === 'connected' && call.video !== false ? 'камера выключена' : x.cs === 'connected' ? (others.length > 1 ? '' : (call.video === false ? 'Аудиозвонок EYE' : '')) : 'соединяю…';
      var isMain = x.id === call.main, box = isMain ? g : sp;
      x.tile.classList.toggle('main', isMain);
      if (isMain) mainX = x;
      if (x.tile.parentNode !== box) box.appendChild(x.tile);
      keep.push(x.tile);
    });
    // порядок маленьких плиток: собеседники, потом я
    all.forEach(function (x) { if (x.id !== call.main && x.tile.parentNode === sp) sp.appendChild(x.tile); });
    [g, sp].forEach(function (box) { Array.prototype.slice.call(box.children).forEach(function (t) { if (keep.indexOf(t) < 0) t.remove(); }); });
    var who = ov.querySelector('#eyeWho'); if (who) who.textContent = mainX && !mainX.isMe && mainX.tile.classList.contains('hasv') ? (mainX.name || '') + (mainX.scr ? ' · показывает экран' : '') : '';
    var add = ov.querySelector('#eyeAdd'); if (add) add.classList.toggle('off', others.length >= MAXP - 1);
    var sb = ov.querySelector('#eyeScr'); if (sb) sb.classList.toggle('on', !!call.screen);
    var ps = vals(call.peers), q = ov.querySelector('#eyeQ');
    if (q) {
      if (ps.length > 1) q.textContent = '● в звонке: ' + (ps.filter(function (x) { return x.cs === 'connected'; }).length + 1);
      else { var s = ps[0] && ps[0].cs; q.textContent = s === 'connected' ? '● связь есть' : s === 'disconnected' ? '● связь плохая…' : s === 'failed' ? '● нет связи' : '● соединяю…'; }
    }
    bitrate(ps.length);
  }
  // v3.2 (Андрей 16.11): в групповом звонке у всех на большом экране тот, кто начал звонок; в звонке на двоих — собеседник
  function defMain() {
    var ps = vals(call.peers);
    if (ps.length >= 2) {
      if (call.host === 'me') return 'me';
      if (call.host && call.peers[call.host]) return call.host;
      return ps[0].id;
    }
    var o = vals(call.peers).concat(vals(call.inv));
    return o.length ? o[0].id : 'me';
  }
  function meX() { if (!call.meX) call.meX = { id: 'me', isMe: true, name: (me && me.name) || 'Я', cs: 'connected' }; return call.meX; }
  // в групповом звонке каждый шлёт видео всем — ужимаем качество, чтобы хватило мобильного интернета
  function bitrate(n) {
    var want = n > 1 ? (n > 2 ? 300000 : 450000) : 0;
    vals(call.peers).forEach(function (P) {
      if (!P.pc || P.br === want || P.cs !== 'connected') return;
      P.pc.getSenders().forEach(function (sd) {
        if (!sd.track || sd.track.kind !== 'video' || !sd.getParameters) return;
        var pr = sd.getParameters(); if (!pr.encodings || !pr.encodings.length) return;
        if (want) pr.encodings[0].maxBitrate = want; else delete pr.encodings[0].maxBitrate;
        sd.setParameters(pr).catch(function () {});
      });
      P.br = want;
    });
  }
  var MAXP = 4;   // решение Андрея 16.11.2026: в звонке до 4 человек
  function addPick() {
    if (!call || !call.cid) return;
    var n = vals(call.peers).length + vals(call.inv).length;
    if (n >= MAXP - 1) { toast('В звонке уже 4 человека — это максимум.'); return; }
    var show = function () {
      var list = FL.friends.filter(function (x) { return !call.peers[x.id] && !call.inv[x.id] && !(me && me.id === x.id); });
      if (!list.length) { toast('Позвать можно только своих друзей EYE. Добавить друзей можно в «Сообщениях».'); return; }
      addCss();
      var d = document.createElement('div'); d.className = 'eye-pick top'; d.setAttribute('role', 'dialog');
      d.innerHTML = '<div class="in"><div class="h">Добавить в звонок</div><div class="eye-chips">' + list.map(function (x) {
        return '<button type="button" class="eye-chip" data-id="' + esc(x.id) + '">' + ava(x) + '<em>' + esc(first(x.name) || x.id) + '</em></button>';
      }).join('') + '</div><div class="s">Звать можно своих друзей. Всего в звонке до 4 человек.</div><button type="button" class="c">Отмена</button></div>';
      document.body.appendChild(d);
      d.onclick = function (e) {
        var b = e.target.closest('[data-id]');
        if (b) { d.remove(); if (!call) return; var x = byId(b.getAttribute('data-id')); send({ t: 'add', cid: call.cid, to: b.getAttribute('data-id') }); toast('Звоним: ' + (first(x && x.name) || 'друг') + '…'); }
        else if (e.target === d || e.target.closest('.c')) d.remove();
      };
    };
    if (FL.friends.length) show(); else loadFriends().then(function () { if (call) show(); });
  }
  function toggle(kind, btn) {
    if (!call || !call.local) return;
    var tr = kind === 'audio' ? call.local.getAudioTracks() : call.local.getVideoTracks();
    tr.forEach(function (x) { x.enabled = !x.enabled; });
    var on = tr.length && tr[0].enabled;
    btn.classList.toggle('off', !on);
    btn.innerHTML = kind === 'audio' ? (on ? IC.mic : IC.micx) : (on ? IC.cam : IC.camx);
    if (kind === 'video' && !call.screen) vals(call.peers).forEach(function (P) { setVideoSend(P, camTrack()); });
    vals(call.peers).forEach(sendState); layout();
  }
  /* v3.1: по каналу данных сообщаем собеседникам, включены ли у меня камера и микрофон (иначе у них чёрный экран) */
  function myState() {
    var v = call && call.local ? call.local.getVideoTracks() : [], a = call && call.local ? call.local.getAudioTracks() : [];
    var camOn = v.some(function (t) { return t.enabled && t.readyState === 'live'; });
    return { cam: camOn || !!(call && call.screen), camOn: camOn, mic: a.some(function (t) { return t.enabled; }), scr: !!(call && call.screen) };
  }
  /* v3.2: демонстрация экрана (браузер на компьютере; телефонные браузеры экран отдавать не умеют) */
  // v3.3: кнопка экрана есть везде; на телефоне пробуем — если браузер не даёт, говорим об этом (и оставляем «сменить камеру»)
  var PHONE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var HASDM = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  var CANSHARE = true;
  var NOSHARE = 'Этот телефон не даёт сайту показать экран (так устроен браузер). Показать экран можно с компьютера, а смотреть — и с телефона.';
  function camTrack() { var v = call && call.local ? call.local.getVideoTracks() : []; return v[0] || null; }
  function vTr(P) {
    var ts = P.pc && P.pc.getTransceivers ? P.pc.getTransceivers() : [];
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i];
      if (!t.stopped && t.receiver && t.receiver.track && t.receiver.track.kind === 'video' && (t.direction === 'sendrecv' || t.direction === 'sendonly')) return t;
    }
    return null;
  }
  function setVideoSend(P, track) { var t = vTr(P); if (t && t.sender.track !== track) t.sender.replaceTrack(track).catch(function () {}); }
  function shareScreen() {
    if (!call) return;
    if (call.screen) { stopShare(); return; }
    if (!HASDM) { toast(NOSHARE); return; }
    navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false }).then(function (st) {
      var t = st.getVideoTracks()[0];
      if (!call || !t) { st.getTracks().forEach(function (x) { x.stop(); }); return; }
      try { t.contentHint = 'detail'; } catch (e) {}
      call.screen = t; call.scrStream = st;
      t.onended = stopShare;
      vals(call.peers).forEach(function (P) { setVideoSend(P, t); sendState(P); });
      toast('Ты показываешь экран. Остановить — та же кнопка.');
      layout();
    }).catch(function (e) { if (PHONE || (e && e.name === 'NotSupportedError')) toast(NOSHARE); });
  }
  function stopShare() {
    if (!call || !call.screen) return;
    try { call.screen.stop(); } catch (e) {}
    call.screen = null; call.scrStream = null;
    vals(call.peers).forEach(function (P) { setVideoSend(P, camTrack()); sendState(P); });
    layout();
  }
  function sendState(P) { try { if (P.dc && P.dc.readyState === 'open') P.dc.send(JSON.stringify(myState())); } catch (e) {} }
  /* аватарка: фото из профиля EAGLES или серый «ноунейм» */
  var AV = {};
  var NONAME = '<svg class="eye-nn" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="12"/><path d="M10 58c0-13 10-20 22-20s22 7 22 20z"/></svg>';
  function avOf(id) {
    if (AV[id] !== undefined) return AV[id];
    var f = byId(id); if (f) return (AV[id] = f.av || '');
    if (FRON !== true) return (AV[id] = '');
    AV[id] = null;   // спрашиваем у сервера EAGLES один раз
    api({ action: 'fr_state', 'with': id }).then(function (r) { AV[id] = (r && r.peer && r.peer.av) || ''; layout(); }).catch(function () { AV[id] = ''; });
    return null;
  }
  function faceHtml(x) {
    if (x.isMe) return NONAME;
    var a = avOf(x.id);
    return a && /^(data:image\/|https:\/\/)/.test(a) ? '<img alt="" src="' + esc(a) + '">' : NONAME;
  }
  /* аудиоволны: громкость голоса каждого собеседника (и моя — на кнопке микрофона) */
  var actx = null, wvRaf = 0;
  function audioCtx() {
    try { if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); } if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {}
    return actx;
  }
  function meter(st) {
    var c = audioCtx(); if (!c || !st || !st.getAudioTracks().length) return null;
    try { var an = c.createAnalyser(); an.fftSize = 256; c.createMediaStreamSource(st).connect(an); return { an: an, buf: new Uint8Array(an.fftSize), st: st }; } catch (e) { return null; }
  }
  function level(m) {
    if (!m) return 0;
    m.an.getByteTimeDomainData(m.buf);
    var sum = 0; for (var i = 0; i < m.buf.length; i++) { var d = (m.buf[i] - 128) / 128; sum += d * d; }
    var rms = Math.sqrt(sum / m.buf.length);
    return rms < 0.004 ? 0 : Math.min(1, Math.sqrt(rms * 6));
  }
  function waves() {
    wvRaf = 0;
    if (!call || !ov) return;
    vals(call.peers).forEach(function (P) {
      if (!P.tile) return;
      if (P.stream && (!P.mt || P.mt.st !== P.stream || (!P.mt.an && P.stream.getAudioTracks().length))) P.mt = meter(P.stream) || { st: P.stream };
      var l = P.micOff ? 0 : level(P.mt && P.mt.an ? P.mt : null);
      P.lv = (P.lv || 0) * 0.6 + l * 0.4;
      var bars = P.tile.querySelectorAll('.eye-wv i');
      for (var i = 0; i < bars.length; i++) { var k = 1 - Math.abs(i - 3) / 4; bars[i].style.transform = 'scaleY(' + (0.15 + P.lv * k * (0.7 + 0.3 * Math.sin(Date.now() / 90 + i * 1.7))).toFixed(3) + ')'; }
      var av = P.tile.querySelector('.eye-av'); if (av) av.style.boxShadow = '0 0 ' + Math.round(6 + P.lv * 40) + 'px ' + Math.round(P.lv * 14) + 'px rgba(255,210,63,' + (0.15 + P.lv * 0.55).toFixed(2) + ')';
    });
    if (call.local && (!call.mt || call.mt.st !== call.local)) call.mt = meter(call.local) || { st: call.local };
    var mic = ov.querySelector('#eyeMic'), ml = myState().mic ? level(call.mt && call.mt.an ? call.mt : null) : 0;
    call.mlv = (call.mlv || 0) * 0.6 + ml * 0.4;
    if (mic) mic.style.boxShadow = '0 0 0 ' + Math.round(call.mlv * 9) + 'px rgba(255,210,63,' + (call.mlv * 0.45).toFixed(2) + ')';
    if (call.meX && call.meX.tile) {
      var mb = call.meX.tile.querySelectorAll('.eye-wv i');
      for (var j = 0; j < mb.length; j++) { var kk = 1 - Math.abs(j - 3) / 4; mb[j].style.transform = 'scaleY(' + (0.15 + call.mlv * kk * (0.7 + 0.3 * Math.sin(Date.now() / 90 + j * 1.7))).toFixed(3) + ')'; }
    }
    wvRaf = requestAnimationFrame(waves);
  }
  var facing = 'user';
  function flip() {
    if (!call || !call.local || !navigator.mediaDevices) return;
    facing = facing === 'user' ? 'environment' : 'user';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } }).then(function (s) {
      var nt = s.getVideoTracks()[0];
      if (!call) { nt.stop(); return; }
      if (!call.screen) vals(call.peers).forEach(function (P) { setVideoSend(P, nt); });
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

  /* ---------- WebRTC: с каждым собеседником своё соединение ---------- */
  function media(video) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('nomedia'));
    if (video === false) return navigator.mediaDevices.getUserMedia({ audio: true });
    return navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .catch(function () { return navigator.mediaDevices.getUserMedia({ audio: true }); });
  }
  function makePeer(x, offer) {
    var id = String(x.id);
    delete call.inv[id];
    var P = call.peers[id] = { id: id, name: x.name || '', iceQ: [], stream: null, cs: 'new' };
    if (call.seen) call.seen[id] = x.name || call.seen[id] || '';
    var pc = P.pc = new RTCPeerConnection({ iceServers: ICE });
    try {
      P.dc = pc.createDataChannel('eye', { negotiated: true, id: 0 });
      P.dc.onopen = function () { sendState(P); };
      P.dc.onmessage = function (e) {
        try {
          var d = JSON.parse(e.data); P.camOff = d.cam === false; P.micOff = d.mic === false;
          if (d.scr && !P.scr && call) { call.main = P.id; call.pinned = true; }   // кто показывает экран — на большой экран
          P.scr = !!d.scr; layout();
        } catch (x) {}
      };
    } catch (e) {}
    pc.onicecandidate = function (e) { if (e.candidate && call) send({ t: 'ice', cid: call.cid, to: id, c: e.candidate }); };
    pc.ontrack = function (e) {
      if (e.streams && e.streams[0]) P.stream = e.streams[0];
      else { if (!P.stream) P.stream = new MediaStream(); P.stream.addTrack(e.track); }
      e.track.onmute = e.track.onunmute = function () { layout(); };
      layout();
    };
    pc.onconnectionstatechange = function () {
      P.cs = pc.connectionState;
      if (P.cs === 'failed' && call && call.peers[id] === P) {
        dropPeer(id);
        if (!vals(call.peers).length && !vals(call.inv).length) { send({ t: 'hangup', cid: call.cid }); finish('Не получилось соединиться. Проверь интернет.'); return; }
        toast((first(P.name) || 'Собеседник') + ': связь пропала');
      }
      layout();
    };
    call.local.getTracks().forEach(function (t) { pc.addTrack(t, call.local); });
    if (offer) {
      // у кого нет камеры, всё равно может видеть собеседника
      if (!call.local.getVideoTracks().length) try { pc.addTransceiver('video', { direction: 'sendrecv' }); } catch (e) {}
      if (call.screen) setVideoSend(P, call.screen);
      pc.createOffer().then(function (o) { return pc.setLocalDescription(o); })
        .then(function () { if (call) send({ t: 'sdp', cid: call.cid, to: id, sdp: pc.localDescription }); }).catch(function () {});
    }
    layout();
    return P;
  }
  function dropPeer(id) {
    var P = call && call.peers[id];
    if (P) { try { P.pc.close(); } catch (e) {} delete call.peers[id]; }
    if (call) delete call.inv[id];
    layout();
  }
  function peerFor(m) {   // сервер v3 пишет from; старый сервер — нет (тогда собеседник один)
    if (m.from) return call.peers[m.from] || null;
    var a = vals(call.peers); return a.length === 1 ? a[0] : null;
  }

  function accept() {
    if (!call) return;
    stopTone(); setSt(call.video === false ? 'Включаю микрофон…' : 'Включаю камеру…');
    media(call.video).then(function (s) {
      if (!call) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      audioCtx(); call.local = s; call.live = true; liveScreen(); makePeer(call.peer, false); send({ t: 'accept', cid: call.cid });
    }).catch(function () { if (call) send({ t: 'decline', cid: call.cid }); finish(CAMHELP); });
  }

  function finish(msg) {
    if (call) {
      try { logCall(call); } catch (e) {}
      clearInterval(call.timer);
      vals(call.peers).forEach(function (P) { try { P.pc.close(); } catch (e) {} });
      if (wvRaf) { cancelAnimationFrame(wvRaf); wvRaf = 0; }
      if (call.screen) try { call.screen.stop(); } catch (e) {}
      if (actx) { try { actx.close(); } catch (e) {} actx = null; }
      if (call.local) call.local.getTracks().forEach(function (t) { t.stop(); });
    }
    call = null; clearOv(); if (msg) toast(msg);
    var pk = document.querySelector('.eye-pick.top'); if (pk) pk.remove();
  }

  // v2.2: Chrome на Android сам запрещает камеру после нескольких отказов — подсказываем, где разрешить
  var CAMHELP = 'Нет доступа к камере и микрофону. Нажми на значок слева от адреса сайта → Разрешения → Камера и Микрофон → Разрешить, потом обнови страницу.';
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
    elsewhere: '',
    full: 'В звонке уже 4 человека — это максимум.',
    old_app: 'У кого-то в звонке старая версия EAGLES. Пусть обновит страницу.',
    self_busy: 'Ты уже в звонке.'
  };

  function onMsg(m) {
    if (m.t === 'hello') { me = m.me; if (m.ice) ICE = m.ice; retry = 1000; return; }
    if (m.t === 'error') {
      // v2.1: ошибки подключения (много открытых вкладок, нет входа) не показываем — они не про звонок.
      if (m.why === 'too_many' || m.why === 'no_login') { retry = 300000; return; }
      if (call && call.role === 'caller' && !call.cid) { call.why = m.why; finish(WHY[m.why] || 'Не получилось позвонить'); }
      else if (call) toast(WHY[m.why] || 'Ошибка звонка');
      return;
    }
    if (m.t === 'ring') {
      if (call) { send({ t: 'decline', cid: m.cid }); return; }
      call = { cid: m.cid, role: 'callee', peer: m.from, video: m.video !== false, peers: {}, inv: {}, host: m.from && m.from.id, ts: Date.now(), seen: {} };
      var grp = (m.group || []).map(first).filter(Boolean);
      ringScreen(m.from, grp.length ? 'зовёт тебя в звонок с: ' + grp.join(', ') : 'звонит тебе в EAGLES…', true);
      if (NACT && NACT.id === String(m.from && m.from.id) && Date.now() - NACT.t < 90000) {   // v6.2: нажали кнопку в уведомлении
        var na = NACT.a; NACT = null;
        if (na === 'ans') { accept(); return; }
        call.byMe = true; send({ t: 'decline', cid: call.cid }); finish(''); toast('Звонок отклонён'); return;
      }
      startTone();
      if (document.hidden && window.Notification && Notification.permission === 'granted') {
        try { new Notification('EYE · ' + m.from.name + ' звонит', { body: (m.video === false ? 'Аудиозвонок' : 'Видеозвонок') + ' EAGLES. Нажми, чтобы ответить.', tag: 'eye-' + m.cid }); } catch (e) {}
      }
      return;
    }
    if (!call || (m.cid && call.cid && m.cid !== call.cid)) return;
    if (m.t === 'ringing') { call.cid = m.cid; if (m.peer && m.peer.name) call.peer.name = m.peer.name; setSt('Вызываю…'); return; }
    if (m.t === 'accepted') {          // кто-то взял трубку — я уже в звонке и сам шлю ему приглашение
      var x = m.peer || call.peer;
      if (!call.live) { call.live = true; liveScreen(); }
      if (!call.peers[x.id]) makePeer(x, true);
      return;
    }
    if (m.t === 'joined') { if (m.peers && m.peers[0]) call.host = m.peers[0].id; (m.peers || []).forEach(function (p) { if (!call.peers[p.id]) makePeer(p, false); }); return; }
    if (m.t === 'adding') { if (m.peer && !call.peers[m.peer.id]) { call.inv[m.peer.id] = { id: m.peer.id, name: m.peer.name || '', inv: true }; layout(); } return; }
    if (m.t === 'invite_end') {
      var iv = call.inv[m.id]; delete call.inv[m.id]; layout();
      if (iv) toast((first(iv.name) || 'Друг') + (m.why === 'declined' ? ' отклонил звонок' : m.why === 'noanswer' ? ' не ответил' : m.why === 'old_app' ? ': нужно обновить страницу EAGLES' : ' не подключился'));
      return;
    }
    if (m.t === 'peer_left') { var pl = call.peers[m.id]; dropPeer(m.id); if (pl) toast((first(pl.name) || 'Собеседник') + ' вышел из звонка'); return; }
    if (m.t === 'sdp') {
      var P = peerFor(m); if (!P) return;
      var d = m.sdp;
      P.pc.setRemoteDescription(d).then(function () {
        P.iceQ.forEach(function (c) { P.pc.addIceCandidate(c).catch(function () {}); }); P.iceQ = [];
        if (d.type === 'offer' && P.pc.getTransceivers) {
          P.pc.getTransceivers().forEach(function (t) { if (t.receiver && t.receiver.track && t.receiver.track.kind === 'video' && t.direction === 'recvonly' && !t.sender.track) t.direction = 'sendrecv'; });
          if (call && call.screen) setVideoSend(P, call.screen);
        }
        if (d.type === 'offer') return P.pc.createAnswer().then(function (a) { return P.pc.setLocalDescription(a); })
          .then(function () { if (call) send({ t: 'sdp', cid: call.cid, to: P.id, sdp: P.pc.localDescription }); });
      }).catch(function () {});
      return;
    }
    if (m.t === 'ice') {
      var Q = peerFor(m); if (!Q) return;
      if (Q.pc.remoteDescription && Q.pc.remoteDescription.type) Q.pc.addIceCandidate(m.c).catch(function () {});
      else Q.iceQ.push(m.c);
      return;
    }
    if (m.t === 'hangup') { call.why = m.why || ''; finish(WHY[m.why] != null ? WHY[m.why] : 'Звонок завершён'); }
  }

  function connect() {
    var s = sess(); if (!s || s.length < 40) return;
    try { ws = new WebSocket(WS_URL + '?sess=' + encodeURIComponent(s) + '&v=3'); } catch (e) { return; }
    ws.onmessage = function (e) { try { onMsg(JSON.parse(e.data)); } catch (x) {} };
    ws.onclose = function () {
      ws = null; clearInterval(pingT);
      if (call && !call.live) finish('Нет связи с EYE');
      else if (call) finish('Связь с EYE прервалась. Позвони ещё раз.');
      setTimeout(connect, retry); retry = Math.min(retry * 2, 30000);
    };
    ws.onopen = function () { clearInterval(pingT); pingT = setInterval(function () { send({ t: 'ping' }); }, 30000); };
  }

  function startCall(id, name, video) {
    video = video !== false;
    if (TOPW) {                       // окно чата внутри Профиля: звоним из Профиля, экран на весь телефон
      try { if (TOPW.EYE && TOPW.EYE.call) return TOPW.EYE.call(id, name, video); } catch (e) {}
      toast('EYE сейчас недоступен. Обнови страницу.'); return;
    }
    if (call) return;
    if (!ws || ws.readyState !== 1) { toast('EYE сейчас недоступен. Проверь интернет и попробуй ещё раз.'); return; }
    try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
    call = { cid: '', role: 'caller', peer: { id: String(id), name: name || '' }, video: video, peers: {}, inv: {}, host: 'me', ts: Date.now(), seen: {} };
    audioCtx();
    ringScreen(call.peer, video ? 'Включаю камеру…' : 'Включаю микрофон…', false);
    media(video).then(function (s) {
      if (!call) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      call.local = s; setSt('Соединяю…');
      send({ t: 'call', to: String(id), video: video });
    }).catch(function () { finish(CAMHELP); });
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
      if (action === 'fr_add') toast(r.state === 'yes' ? 'Теперь вы друзья. Можно звонить в EYE.' : 'Запрос отправлен. ' + nm + ' увидит его в EYE → «Заявки».');
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
      box.innerHTML = '<button type="button" class="eye-btn" id="eyeTel" aria-label="Аудиозвонок EYE">' + IC.tel + '</button>' +
        '<button type="button" class="eye-btn" id="eyeCall" aria-label="Видеозвонок EYE">' + IC.cam + '</button>';
      box.querySelector('#eyeTel').onclick = function () { var q = peerFromPage(); if (q) startCall(q.id, q.name, false); };
      box.querySelector('#eyeCall').onclick = function () { var q = peerFromPage(); if (q) startCall(q.id, q.name, true); };
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

  /* ---------- v4: журнал звонков (хранится в этом телефоне/компьютере) ---------- */
  function myId() { try { return localStorage.getItem('eaglesfree_id') || ''; } catch (e) { return ''; } }
  function logKey() { return 'eye_log_' + myId(); }
  function getLog() { try { var a = JSON.parse(localStorage.getItem(logKey()) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function putLog(a) { try { localStorage.setItem(logKey(), JSON.stringify(a.slice(0, 60))); } catch (e) {} }
  function logCall(c) {
    if (!c || !c.peer || !c.peer.id || !myId() || c.why === 'elsewhere') return;
    var inc = c.role === 'callee', st;
    if (c.live) st = 'ok';
    else if (inc) st = c.byMe ? 'declined' : 'missed';
    else st = c.byMe ? 'cancel' : c.why === 'declined' ? 'declined' : c.why === 'noanswer' ? 'noanswer' : 'fail';
    var pid = String(c.peer.id), others = [], ids = {}; ids[pid] = 1;
    Object.keys(c.seen || {}).forEach(function (k) { if (!ids[k] && k !== String(me && me.id)) { ids[k] = 1; others.push(c.seen[k] || ''); } });
    var e = { cid: c.cid || '', ts: c.ts || Date.now(), id: pid, name: c.peer.name || (c.seen && c.seen[pid]) || '', others: others,
      n: Object.keys(ids).length + 1, video: c.video !== false, dir: inc ? 'in' : 'out', st: st,
      dur: c.live && c.t0 ? Math.round((Date.now() - c.t0) / 1000) : 0, fresh: st === 'missed' };
    var a = getLog();
    if (e.cid) {                        // тот же звонок уже записан другой вкладкой
      for (var i = 0; i < a.length; i++) if (a[i].cid === e.cid) {
        if (a[i].st === 'ok' && e.st !== 'ok') return;
        a.splice(i, 1); break;
      }
    }
    a.unshift(e); putLog(a);
  }
  function missedN() { return getLog().filter(function (e) { return e.fresh; }).length; }
  function markMissedSeen() { var a = getLog(), ch = false; a.forEach(function (e) { if (e.fresh) { e.fresh = false; ch = true; } }); if (ch) putLog(a); }
  function hm(ms) { var d = new Date(ms); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function whenTs(ms) {
    var d = new Date(ms), n = new Date();
    if (d.toDateString() === n.toDateString()) return hm(ms);
    if (d.toDateString() === new Date(n - 864e5).toDateString()) return 'вчера';
    return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2);
  }
  function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function logLine(e) {
    var k = (e.video ? 'видео' : 'аудио') + (e.n > 2 ? ' · групповой, ' + e.n + ' чел.' : '');
    var st = e.st === 'ok' ? (e.dir === 'in' ? 'входящий' : 'исходящий') + (e.dur ? ' · ' + mmss(e.dur) : '')
      : e.st === 'missed' ? 'пропущенный' : e.st === 'declined' ? (e.dir === 'in' ? 'ты отклонил' : 'отклонил звонок')
      : e.st === 'noanswer' ? 'не ответил' : e.st === 'cancel' ? 'отменён' : 'не дозвонился';
    return k + ' · ' + st;
  }

  /* ---------- v4: непрочитанные сообщения (сервер EAGLES) ---------- */
  var UNR = { n: 0, t: 0 };
  function loadUnread() {
    if (sess().length < 40) return;
    UNR.t = Date.now();
    api({ action: 'chat_unread' }).then(function (r) { if (r && r.ok) UNR.n = Number(r.n) || 0; badges(); }).catch(function () {});
  }
  function total() { return UNR.n + missedN() + FL.incoming.length; }
  function setN(el, n) { if (!el) return; var t = n > 9 ? '9+' : String(n); if (el.textContent !== t) el.textContent = t; el.hidden = !n; el.style.display = n ? '' : 'none'; }

  /* ---------- v4: золотая кнопка EYE на главной (вместо «Чата с командой») ---------- */
  function homeBtn() {
    var b = document.getElementById('openChat'); if (!b) return;
    if (!b.getAttribute('data-eye')) {
      addCss(); b.setAttribute('data-eye', '1'); b.setAttribute('aria-label', 'Открыть EYE');
      var t = b.querySelector('.cb-t'); if (t && !t.querySelector('img')) t.innerHTML = '<b>EYE</b><small>Чаты и звонки команды</small>';
      var f = document.getElementById('egChf'); if (f) f.title = 'EYE';
      var n0 = document.getElementById('chatN'); if (n0) n0.style.setProperty('display', 'none', 'important');
      var n = document.createElement('i'); n.className = 'cb-n'; n.id = 'eyeN'; n.style.display = 'none';
      (b.querySelector('.cb-vid') || b).appendChild(n);
      b.onclick = function () { setTimeout(function () { location.href = '/chat.html'; }, 160); };   // v5: EYE открывается как обычная страница с нижним меню
    }
    setN(document.getElementById('eyeN'), total());
  }

  /* ---------- v4: пункт EYE в нижнем меню (на всех страницах) ---------- */
  function navTab() {
    var bar = document.querySelector('.tabbar'), inner = bar;
    if (!bar) { var ek = document.querySelector('.ek-nav > div'); if (ek) { bar = ek.parentNode; inner = ek; } }
    if (!bar || !inner || !inner.children.length) return;
    var t = document.getElementById('tabEye');
    if (t && !t._eye) {               // пункт уже стоит в странице — только оживляем
      t._eye = 1; addCss();
      if (!t.querySelector('.eye-tn')) t.insertAdjacentHTML('beforeend', '<i class="eye-tn" hidden></i>');
      if (/profile\.html\?chat=/.test(t.getAttribute('href') || '')) t.setAttribute('href', '/chat.html');   // v5: EYE — обычная страница
    }
    if (!t) {
      addCss();
      var ref = inner.children[0];
      t = document.createElement('a'); t.id = 'tabEye'; t.href = '/chat.html'; t._eye = 1;
      if (ref.classList.contains('tab-item')) t.className = 'tab-item';
      t.innerHTML = IC.eye + 'EYE<i class="eye-tn" hidden></i>';
      inner.insertBefore(t, ref.nextSibling);
      inner.style.setProperty('grid-template-columns', 'repeat(' + inner.children.length + ',1fr)', 'important');
    }
    setN(t.querySelector('.eye-tn'), total());
  }

  /* ---------- v4: экран EYE (страница чата): вкладки «Чаты», «Звонки», «Объявления» ---------- */
  var CALLS_ON = false;
  function eyePage() {
    var home = document.getElementById('chHome'), tabs = home && home.querySelector('.ch-tabs');
    if (!tabs) return;
    if (!tabs.getAttribute('data-eye')) {
      addCss(); tabs.setAttribute('data-eye', '1');
      var h1 = home.querySelector('.ch-h1'); if (h1) h1.innerHTML = '<span class="eye-h1">EYE</span><small class="eye-h1s">чаты и звонки EAGLES</small>';
      try { document.title = 'EYE · EAGLES'; } catch (e) {}
      var ann = null;
      Array.prototype.forEach.call(tabs.querySelectorAll('button'), function (b) {
        var dt = b.getAttribute('data-t');
        if (dt === 'chats' && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.nodeValue = 'Чаты';
        if (dt === 'ann') ann = b;
        if (dt !== 'calls') b.addEventListener('click', function () { CALLS_ON = false; var v = document.getElementById('vCalls'); if (v) v.hidden = true; });
      });
      var cb = document.getElementById('eyeTabCalls');
      if (!cb) {
        cb = document.createElement('button'); cb.type = 'button'; cb.setAttribute('data-t', 'calls'); cb.id = 'eyeTabCalls';
        cb.innerHTML = 'Звонки<span class="ch-n" id="nCalls" hidden></span>';
        tabs.insertBefore(cb, ann);
      }
      tabs.style.gridTemplateColumns = 'repeat(3,1fr)';
      var v = document.createElement('div'); v.id = 'vCalls'; v.className = 'eye-calls'; v.hidden = true;
      var va = document.getElementById('vAnn'); (va || document.getElementById('vChats')).insertAdjacentElement('afterend', v);
      cb.onclick = showCalls;
    }
    var nc = document.getElementById('nCalls'); if (nc) { var k = missedN(); nc.hidden = !k; nc.textContent = k > 9 ? '9+' : k; }
    reqBtn();
    if (CALLS_ON) drawCalls();
  }
  function showCalls() {
    CALLS_ON = true;
    Array.prototype.forEach.call(document.querySelectorAll('.ch-tabs button'), function (b) { b.classList.toggle('on', b.getAttribute('data-t') === 'calls'); });
    ['vChats', 'chFind', 'vAnn'].forEach(function (id) { var e = document.getElementById(id); if (e) e.hidden = true; });
    var v = document.getElementById('vCalls'); if (v) v.hidden = false;
    markMissedSeen(); drawCalls(); loadFriends();
  }
  function drawCalls() {
    var el = document.getElementById('vCalls'); if (!el || el.hidden) return;
    var log = getLog(), key = JSON.stringify([FRON, FL, log]);
    if (el.getAttribute('data-k') === key) return;
    var keep = el.querySelector('#eyeAddId'), typed = keep ? keep.value : '', focused = keep && document.activeElement === keep;
    el.setAttribute('data-k', key);
    var h = '';
    h += '<div class="eye-lbl">Друзья · позвонить</div>';
    if (FRON === null && !FL.friends.length) h += '<div class="eye-empty">Загружаю…</div>';
    else if (!FL.friends.length) h += '<div class="eye-empty">Пока нет друзей. Звонить в EYE можно только друзьям. Впиши ID человека внизу или открой с ним переписку и нажми «В друзья». Когда он подтвердит, сможете созваниваться.</div>';
    FL.friends.forEach(function (x) {
      h += '<div class="eye-row eye-sm">' + ava(x) + '<div class="t">' + esc(x.name) + '<small>ID ' + esc(x.id) + '</small></div><div class="fb">' +
        '<button type="button" class="eye-cb au" data-a="tel" data-id="' + esc(x.id) + '" aria-label="Аудиозвонок: ' + esc(x.name) + '">' + IC.tel + '</button>' +
        '<button type="button" class="eye-cb" data-a="vid" data-id="' + esc(x.id) + '" aria-label="Видеозвонок: ' + esc(x.name) + '">' + IC.cam + '</button></div></div>';
    });
    if (FL.outgoing.length) h += '<div class="eye-wait">Ждут подтверждения: ' + FL.outgoing.map(function (x) { return esc(first(x.name)); }).join(', ') + '</div>';
    h += '<div class="eye-lbl">Недавние звонки</div>';
    if (!log.length) h += '<div class="eye-empty">Звонков пока не было.</div>';
    log.slice(0, 30).forEach(function (e) {
      var f = byId(e.id), nm = e.name || (f && f.name) || ('ID ' + e.id);
      var title = e.others && e.others.length ? first(nm) + ', ' + e.others.map(first).filter(Boolean).slice(0, 1).join(', ') + (e.others.length > 1 ? ' и ещё ' + (e.others.length - 1) : '') : nm;
      h += '<button type="button" class="eye-row eye-sm" data-a="log" data-id="' + esc(e.id) + '" data-v="' + (e.video ? 1 : 0) + '">' + ava({ name: nm, av: f && f.av }) +
        '<div class="t">' + esc(title) + '<small' + (e.st === 'missed' ? ' class="miss"' : '') + '>' + esc(logLine(e)) + '</small></div><span class="tm">' + esc(whenTs(e.ts)) + '</span></button>';
    });
    h += '<div class="eye-lbl">Добавить друга по ID</div>';
    h += '<form class="eye-add" autocomplete="off"><input id="eyeAddId" inputmode="numeric" maxlength="8" placeholder="ID в EAGLES" aria-label="ID человека">' +
      '<button type="submit" class="eye-gold" id="eyeAddGo" disabled>Позвать</button></form>';
    h += '<div class="eye-note">Недавние звонки видны на том телефоне или компьютере, где был открыт EAGLES. Пропущенный звонок попадёт сюда, если EAGLES был открыт.</div>';
    el.innerHTML = h;
    var inp = el.querySelector('#eyeAddId'), go = el.querySelector('#eyeAddGo');
    inp.value = typed; go.disabled = typed.length < 5; if (focused) inp.focus();
    inp.oninput = function () { this.value = this.value.replace(/\D/g, ''); go.disabled = this.value.length < 5; };
    el.querySelector('form').onsubmit = function (e) {
      e.preventDefault(); var id = inp.value; if (id.length < 5) return;
      go.disabled = true; frDo('fr_add', id, '').then(function () { var i2 = document.getElementById('eyeAddId'); if (i2) i2.value = ''; });
    };
    Array.prototype.forEach.call(el.querySelectorAll('[data-a]'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-id'), a = b.getAttribute('data-a'), x = byId(id);
        if (a === 'tel' || a === 'vid') startCall(id, x ? x.name : '', a === 'vid');
        else if (a === 'log') { if (FS[id] === 'yes' || FRON === false) pickCall(id, x ? x.name : ''); else toast(WHY.not_friends); }
        else if (a === 'ok') frDo('fr_add', id, x ? x.name : '');
        else if (a === 'no') frDo('fr_del', id, x ? x.name : '');
      };
    });
  }
  /* ---------- v6: «Заявки» — кто зовёт в друзья (кнопка вверху страницы EYE) ---------- */
  var reqEl = null;
  function reqBtn() {
    var b = document.getElementById('eyeReqBtn'); if (!b) return;
    if (!b._eye) { b._eye = 1; b.addEventListener('click', function () { openReqs(); loadFriends(); }); }
    setN(document.getElementById('nReq'), FL.incoming.length);
    if (reqEl) drawReqs();
  }
  function openReqs() {
    addCss(); if (reqEl) return;
    reqEl = document.createElement('div'); reqEl.className = 'eye-reqs'; reqEl.setAttribute('role', 'dialog'); reqEl.setAttribute('aria-label', 'Заявки в друзья');
    reqEl.innerHTML = '<div class="in"></div>';
    document.body.appendChild(reqEl);
    reqEl.onclick = function (e) {
      if (e.target === reqEl || e.target.closest('[data-a="close"]')) { reqEl.remove(); reqEl = null; return; }
      var b = e.target.closest('[data-a]'); if (!b) return;
      var id = b.getAttribute('data-id'), x = byId(id);
      if (b.getAttribute('data-a') === 'ok') { markSeen(id); frDo('fr_add', id, x ? x.name : ''); }
      if (b.getAttribute('data-a') === 'no') { markSeen(id); frDo('fr_del', id, x ? x.name : ''); }
    };
    drawReqs();
  }
  function drawReqs() {
    var inn = reqEl && reqEl.querySelector('.in'); if (!inn) return;
    var h = '<div class="h">Заявки в друзья<button type="button" data-a="close" aria-label="Закрыть">✕</button></div>';
    if (FRON === null && !FL.incoming.length) h += '<div class="eye-empty">Загружаю…</div>';
    else if (!FL.incoming.length) h += '<div class="eye-empty">Новых заявок нет. Когда тебя позовут в друзья, человек появится здесь.</div>';
    FL.incoming.forEach(function (x) {
      h += '<div class="eye-req eye-sm">' + ava(x) + '<div class="t">' + esc(x.name) + '<small>ID ' + esc(x.id) + ' · хочет дружить</small></div>' +
        '<button type="button" class="eye-fr eye-gold" data-a="ok" data-id="' + esc(x.id) + '">Принять</button>' +
        '<button type="button" class="x" data-a="no" data-id="' + esc(x.id) + '" aria-label="Отклонить">✕</button></div>';
    });
    if (FL.outgoing.length) h += '<div class="eye-wait">Ты позвал, ждут ответа: ' + FL.outgoing.map(function (x) { return esc(first(x.name)); }).join(', ') + '</div>';
    if (inn.getAttribute('data-h') !== h) { inn.setAttribute('data-h', h); inn.innerHTML = h; }
  }
  function badges() { homeBtn(); if (!TOPW) navTab(); eyePage(); }

  // выбор: аудио или видео (недавние звонки)
  function pickCall(id, name) {
    addCss();
    var d = document.createElement('div'); d.className = 'eye-pick'; d.setAttribute('role', 'dialog');
    d.innerHTML = '<div class="in"><div class="h">Позвонить ' + esc(first(name) || 'другу') + '</div><div class="r">' +
      '<button type="button" class="eye-fr" data-v="0">' + IC.tel + 'Аудио</button><button type="button" class="eye-fr eye-gold" data-v="1">' + IC.cam + 'Видео</button></div>' +
      '<button type="button" class="c">Отмена</button></div>';
    document.body.appendChild(d);
    d.onclick = function (e) {
      var b = e.target.closest('[data-v]');
      if (b) { d.remove(); startCall(id, name, b.getAttribute('data-v') === '1'); }
      else if (e.target === d || e.target.closest('.c')) d.remove();
    };
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

  /* ---------- v6.1: первый вход в EYE — попросить камеру и микрофон сразу ---------- */
  var permDone = false;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k) { try { localStorage.setItem(k, '1'); } catch (e) {} }
  function permCard() {
    if (permDone || TOPW || !document.getElementById('chHome')) return; permDone = true;
    if (lsGet('eye_perm_ok') || lsGet('eye_perm_seen')) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    function both(fn) {
      if (!navigator.permissions || !navigator.permissions.query) return fn(false);
      Promise.all([navigator.permissions.query({ name: 'camera' }), navigator.permissions.query({ name: 'microphone' })])
        .then(function (r) { fn(r[0].state === 'granted' && r[1].state === 'granted'); }).catch(function () { fn(false); });
    }
    both(function (granted) {
      if (granted) { lsSet('eye_perm_ok'); return; }
      addCss();
      var d = document.createElement('div'); d.className = 'eye-perm'; d.setAttribute('role', 'dialog');
      d.innerHTML = '<button type="button" class="x" aria-label="Закрыть">✕</button>' +
        '<div class="k">⚠️ Внимание! Разреши доступ к камере и микрофону</div>' +
        '<p>Сейчас телефон спросит разрешение — нажми «Разрешить». Если отказаться, звонки в EYE работать не будут, а включать камеру и звук потом придётся долго, через настройки телефона.</p>' +
        '<button type="button" class="go">Разрешить доступ</button>' +
        '<svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v15M5 12l7 7 7-7"/></svg>';
      document.body.appendChild(d);
      function close() { lsSet('eye_perm_seen'); d.remove(); }
      function ask() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function (st) {
          st.getTracks().forEach(function (t) { t.stop(); });
          lsSet('eye_perm_ok'); d.className = 'eye-perm ok';
          d.innerHTML = '<div class="k">✓ Готово! Камера и микрофон разрешены</div><p>Теперь можно звонить друзьям в EYE.</p>';
          setTimeout(function () { d.remove(); }, 2200);
        }).catch(function (e) {
          var p = d.querySelector('p'); if (!p) return;
          if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) p.textContent = CAMHELP;
          else if (e && e.name === 'NotFoundError') p.textContent = 'Не нашёл камеру или микрофон на этом устройстве. Звонить без них не получится.';
        });
      }
      d.querySelector('.x').onclick = close;
      d.querySelector('.go').onclick = ask;
      ask();   // сразу вызываем запрос телефона
    });
  }

  function render() { placeButton(); badges(); reqCard(); permCard(); }

  /* ---------- v6.2: действие из уведомления о звонке (?eyeans=ID / ?eyedecl=ID), живёт 90 с ---------- */
  var NACT = null;
  try {
    var qa = new URLSearchParams(location.search), na1 = qa.get('eyeans'), nd1 = qa.get('eyedecl');
    if (na1 || nd1) {
      NACT = { a: na1 ? 'ans' : 'decl', id: String(na1 || nd1).replace(/\D/g, ''), t: Date.now() };
      qa.delete('eyeans'); qa.delete('eyedecl');
      history.replaceState(null, '', location.pathname + (qa.toString() ? '?' + qa.toString() : '') + location.hash);
    }
  } catch (e) { NACT = null; }

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
    if (!TOPW && !document.hidden && Date.now() - UNR.t > 60000 && (document.getElementById('openChat') || document.getElementById('tabEye'))) loadUnread();
  }
  function boot() {
    if (!TOPW) connect();
    loadFriends();
    setInterval(tick, 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && Date.now() - flT > 15000) loadFriends(); });
    // окно EYE закрыли или прочитали переписку — пересчитать красную цифру
    window.addEventListener('message', function (e) { if (e.data && (e.data.eg === 'chatClose' || e.data.eg === 'chatSeen')) setTimeout(loadUnread, 400); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
