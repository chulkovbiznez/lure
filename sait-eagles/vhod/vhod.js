/* НОВЫЙ ВХОД EAGLES (09.11.2026). Работает поверх старого кода страницы, его не меняя:
   окна «Вход» (#lgn) и «Код из письма» (#cdo) в стиле окна ПИН; код в 6 ячейках, кнопки «Подтвердить» не видно —
   6 цифр, и проверка идёт сама (это делал и старый код); вставка целиком из письма; при обрыве связи проверка
   тихо повторяется 1 раз; блокировка «Слишком много попыток» с отсчётом; «Прислать код ещё раз» с таймером 60 с;
   ошибка сервера reg_busy («много регистраций в этот час») показывается честно, с минутами. */
(function(){
  if(window.__vhod) return; window.__vhod = 1;
  var $ = function(i){ return document.getElementById(i); };
  var L = $('lgn'), C = $('cdo'), code = $('cCode'), btn = $('cBtn'), st = $('cSt');
  if(!L || !C || !code || !btn || !st) return;
  var LOGO = '__LOGO__', VH0 = 'Вставь или впиши код. Вход откроется сам.';
  var ARR = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  [L, C].forEach(function(o){
    var box = o.querySelector('.box'), inn = o.querySelector('.in'), h = inn && inn.querySelector('h3'); if(!box || !h) return;
    o.classList.add('vh');
    var g = document.createElement('div'); g.className = 'vh-glow'; box.insertBefore(g, box.firstChild);
    var lg = document.createElement('div'); lg.className = 'vh-lg'; lg.style.setProperty('--vh-img', 'url(' + LOGO + ')'); inn.insertBefore(lg, h);
  });
  var lh = L.querySelector('h3'); if(lh) lh.textContent = 'Вход в EAGLES';
  var lid = $('lId');
  if(lid){ var w = document.createElement('div'); w.className = 'vh-fld'; lid.parentNode.insertBefore(w, lid); w.appendChild(lid);
    w.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>');
    lid.placeholder = 'ID или почта'; }
  var lb = $('lBtn'); if(lb){ lb.classList.add('vh-btn'); lb.innerHTML = '<span class="sp"></span><span>Получить код</span>' + ARR; }

  /* 6 ячеек */
  code.removeAttribute('maxlength'); code.placeholder = '';
  var cells = document.createElement('div'); cells.className = 'vh-cells';
  cells.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  code.parentNode.insertBefore(cells, code); cells.appendChild(code);
  var I = cells.querySelectorAll('i'), busy = 0;
  var lock = document.createElement('div'); lock.className = 'vh-lock'; lock.hidden = true; st.parentNode.insertBefore(lock, st.nextSibling);
  function draw(){ var v = code.value.replace(/\D/g, ''), f = document.activeElement === code;
    for(var k = 0; k < 6; k++){ I[k].textContent = v[k] || ''; I[k].classList.toggle('f', !!v[k]); I[k].classList.toggle('cur', f && k === v.length && !busy && !code.disabled); } }
  function state(s){ cells.className = 'vh-cells' + (s ? ' ' + s : ''); busy = s === 'chk' ? 1 : 0; draw(); }
  function say(t, c){ st.innerHTML = t || ''; st.className = 'st' + (c ? ' ' + c : ''); }
  code.addEventListener('input', function(){ if(code.value.replace(/\D/g, '').length > 6) code.value = code.value.replace(/\D/g, '').slice(-6);
    if(cells.classList.contains('bad')) state(''); draw(); });
  code.addEventListener('focus', draw); code.addEventListener('blur', draw);
  cells.addEventListener('click', function(){ if(!code.disabled) code.focus(); });
  /* окно кода открылось заново — чистое состояние */
  new MutationObserver(function(){ if(C.classList.contains('open') && !busy && !code.disabled){ state(''); if(!st.textContent) say(VH0); } }).observe(C, { attributes: true, attributeFilter: ['class'] });

  /* «Прислать код ещё раз» с отсчётом */
  var rs = $('cResend'), rsT = 0, rsAt = 0, RS0 = rs ? rs.textContent : '';
  function rsTick(){ clearTimeout(rsT); if(!rs) return; if(code.disabled){ rs.disabled = true; rs.textContent = 'Новый код недоступен'; return; }
    var s = Math.ceil((rsAt - Date.now()) / 1000);
    if(s > 0){ rs.disabled = true; rs.textContent = 'Новый код через 0:' + (s < 10 ? '0' : '') + s; rsT = setTimeout(rsTick, 500); } else { rs.disabled = false; rs.textContent = RS0; } }

  /* блокировка с отсчётом */
  var lkT = 0;
  function unlock(){ clearTimeout(lkT); lock.hidden = true; code.disabled = false; }
  function locked(min){ var until = Date.now() + min * 60000; code.disabled = true; code.value = ''; state('lock'); say('');
    lock.innerHTML = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><div><b>Слишком много попыток</b><span>Вход откроется через <em></em></span></div>';
    lock.hidden = false; rsTick();
    (function t(){ var s = Math.max(0, Math.ceil((until - Date.now()) / 1000)), e = lock.querySelector('em'); if(!e) return;
      e.textContent = Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
      if(s > 0) lkT = setTimeout(t, 1000); else { unlock(); state(''); say('Можно снова. Нажми «' + RS0 + '».'); rsAt = 0; rsTick(); } })(); }

  /* обёртка запросов входа: тихий повтор при обрыве + реакция на ответ */
  var F = window.fetch;
  window.fetch = function(u){
    var s = String(u && u.url || u), m = /[?&]action=(login_verify|reg_verify|login_request|reg_request)(&|$)/.exec(s);
    if(!m) return F.apply(this, arguments);
    var a = m[1], ver = /verify/.test(a), self = this, args = arguments, again = 0;
    if(ver){ state('chk'); say('Проверяю…'); }
    function go(){ return F.apply(self, args).catch(function(e){ if(ver && !again){ again = 1; return new Promise(function(r){ setTimeout(r, 900); }).then(go); } throw e; }); }
    return go().then(function(r){
      r.clone().json().then(function(j){ setTimeout(function(){ after(a, j || {}, again); }, 30); }).catch(function(){ if(ver) state(''); });
      return r;
    }, function(e){ if(ver) setTimeout(function(){ state(''); }, 30); throw e; });
  };
  function after(a, j, again){
    if(/verify/.test(a)){
      if(j.ok){ state('good'); say('Готово, заходим…', 'ok'); return; }
      if(j.error === 'locked'){ locked(Number(j.retryAfterMin) || 60); return; }
      state('bad'); setTimeout(function(){ code.value = ''; draw(); if(document.activeElement !== code && !code.disabled) code.focus(); }, 450);
      if(j.error === 'bad_code' && again) say('Код не подошёл. Возможно, он уже сработал, пока не было связи. Нажми «' + RS0 + '».', 'err');
      if(j.error === 'expired'){ rsAt = 0; rsTick(); }
      return;
    }
    if(j.ok){ unlock(); rsAt = Date.now() + 60000; rsTick(); if(C.classList.contains('open')){ state(''); } return; }
    if(j.error === 'too_often'){ rsAt = Date.now() + 60000; rsTick(); }
    if(j.error === 'reg_busy'){ var n = Number(j.retryAfterMin) || 60, t = 'Сейчас очень много регистраций. Попробуй через ' + n + ' мин.';
      [$('rSt'), st].forEach(function(e){ if(e && /err/.test(e.className)) e.innerHTML = t; }); }
  }
  say(VH0); draw();
})();
