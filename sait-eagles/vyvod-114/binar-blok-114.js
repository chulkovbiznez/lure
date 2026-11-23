  // ===== ВЫВОД v1 (задание 114, 23.11.2026): через покупку LURE или деньгами (только ИП/самозанятым) =====
  var WDM = null;
  function wdMin(M){ return M.minWithdraw || 1000; }
  function wdAll(M){ var T = M.totals || {}; return Math.round(((T.ok || 0) + (T.tax || 0)) * 100) / 100; }
  function wdCan(M){ return !!M.active && wdAll(M) >= wdMin(M); }
  function wdCss(){
    if($('wdCss')) return;
    var s = document.createElement('style'); s.id = 'wdCss';
    s.textContent = '.wd-veil{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:flex-end;justify-content:center;z-index:9000}'
      + '.wd-sh{width:100%;max-width:460px;background:#121216;border:1px solid #2b2b32;border-bottom:0;border-radius:20px 20px 0 0;padding:18px 16px calc(20px + env(safe-area-inset-bottom,0px));max-height:92vh;overflow:auto;color:#f2f2f2}'
      + '.wd-sh h3{margin:0 0 10px;font-size:17px}.wd-opt{display:block;width:100%;text-align:left;background:#070708;border:1px solid #2b2b32;border-radius:14px;padding:13px;color:#f2f2f2;font:inherit;cursor:pointer;margin-top:8px}'
      + '.wd-opt.on{border-color:#e9a23b;box-shadow:0 0 0 1px #e9a23b inset}.wd-opt.off{opacity:.55;cursor:not-allowed}.wd-opt b{display:flex;justify-content:space-between;gap:8px;font-size:15px}'
      + '.wd-opt span{display:block;font-size:12.5px;color:#a9a9b3;margin-top:4px;line-height:1.45}.wd-calc{display:grid;grid-template-columns:1fr auto;gap:6px 12px;background:#070708;border-radius:12px;padding:12px;margin-top:10px;font-size:14px}'
      + '.wd-calc .r{text-align:right;font-weight:800}.wd-calc .g{color:#ffd84a;font-size:16px}.wd-calc .m{color:#ff9a4a}.wd-lbl{font-size:12px;color:#a9a9b3;margin:12px 0 6px;display:block}'
      + '.wd-chk{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;line-height:1.45;margin-top:10px;color:#d8d8de}.wd-chk input{margin-top:2px;width:18px;height:18px;accent-color:#e9a23b;flex:none}'
      + '.wd-done{text-align:center}.wd-done .i{font-size:40px;color:#4cd97b;font-weight:800}';
    document.head.appendChild(s);
  }
  function wdOpen(M, why){
    var m = $('bnOutMsg');
    if(!wdCan(M)){ m.style.display = 'block'; m.innerHTML = esc(why) + (!M.active ? ' <a href="/profile.html" style="color:#ffd23f;font-weight:800">Профиль →</a>' : ''); return; }
    m.style.display = 'none'; wdCss(); WDM = M;
    var T = M.totals, hold = (M.wd && M.wd.holdPct) || 0, tax = M.tax && M.tax !== 'owner', all = wdAll(M), cashAvail = T.ok || 0;
    var cashOn = tax && M.canWithdraw, pick = '';
    var v = document.createElement('div'); v.className = 'wd-veil'; v.id = 'wdVeil';
    v.innerHTML = '<div class="wd-sh" role="dialog" aria-modal="true" aria-labelledby="wdH"><div id="wdStep">'
      + '<h3 id="wdH">Как вывести?</h3>'
      + '<button class="wd-opt" id="wdL"><b><span style="display:inline;margin:0;color:#f2f2f2;font-size:15px">Через покупку <span style="display:inline;color:#9fd3ff;font-size:15px">LURE</span></span><i id="wdLs" style="font-style:normal"></i></b><span id="wdLd"></span></button>'
      + '<button class="wd-opt' + (cashOn ? '' : ' off') + '" id="wdC"><b><span style="display:inline;margin:0;color:#f2f2f2;font-size:15px">Деньгами на карту</span><i id="wdCs" style="font-style:normal"></i></b><span id="wdCd"></span></button>'
      + '<label class="wd-lbl" for="wdA">Сколько вывести, ₽ (от ' + rub(wdMin(M)) + ')</label><input class="bn-in" id="wdA" inputmode="numeric" value="' + Math.floor(all) + '">'
      + '<div id="wdInnBox" hidden><label class="wd-lbl" for="wdInn">Твой ИНН, 12 цифр (для налоговой; один раз)</label><input class="bn-in" id="wdInn" inputmode="numeric" maxlength="12" autocomplete="off" placeholder="ИНН физлица"></div>'
      + '<div id="wdCalc"></div><label class="wd-chk" id="wdChkRow" hidden><input type="checkbox" id="wdAg"><span id="wdAgT"></span></label>'
      + '<div class="bn-msg err" id="wdErr"></div>'
      + '<button class="bn-btn gold" id="wdGo" disabled>Выбери способ</button><button class="bn-btn ghost" id="wdX">Отмена</button></div>'
      + '<div id="wdDone" class="wd-done" hidden><div class="i">✓</div><h3 id="wdDt"></h3><p class="bn-note" id="wdDd"></p><a class="bn-btn gold" id="wdDl" href="https://lure.eaglesteam.ru/" style="display:block;text-decoration:none;text-align:center">Открыть LURE</a><button class="bn-btn ghost" id="wdDx">Закрыть</button></div></div>';
    document.body.appendChild(v);
    function amt(){ return Math.floor(Number(String($('wdA').value).replace(/\D/g, '')) || 0); }
    function net(a){ return tax || !hold ? a : Math.round(a * (100 - hold)) / 100; }
    function close(){ v.remove(); document.removeEventListener('keydown', key); }
    function key(e){ if(e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    v.onclick = function(e){ if(e.target === v) close(); };
    function render(){
      var a = amt(), n = net(a), err = '';
      $('wdL').className = 'wd-opt' + (pick === 'lure' ? ' on' : '');
      $('wdC').className = 'wd-opt' + (pick === 'cash' ? ' on' : '') + (cashOn ? '' : ' off');
      $('wdLs').textContent = rub(n);
      $('wdLd').textContent = tax ? 'Рубли на баланс LURE: чат, картинки, видео. Налог по своему статусу платишь сам.'
        : hold ? 'Рубли на баланс LURE: чат, картинки, видео. Это твой доход: удерживается ' + hold + ' % налога.'
        : 'Рубли на баланс LURE: чат, картинки, видео. Это твой доход: налог 13 % заплатишь сам по уведомлению из налоговой.';
      $('wdCs').textContent = cashOn ? rub(cashAvail) : '🔒';
      $('wdCd').textContent = !tax ? 'Только для самозанятых и ИП. Самозанятость оформляется бесплатно в приложении «Мой налог», потом укажи статус ниже на этой странице.'
        : cashOn ? 'Выплата в ближайшую субботу. На каждую выплату нужен чек в «Мой налог».' : 'Выплаты деньгами откроются вместе со стартом. Через LURE можно уже сейчас.';
      $('wdInnBox').hidden = !(pick === 'lure' && !tax);
      $('wdChkRow').hidden = !(pick === 'lure' && !tax);
      $('wdAgT').textContent = hold ? 'Понимаю: это мой доход. EAGLES удержит ' + hold + ' % налога (НДФЛ) и перечислит его в налоговую. Рубли в LURE тратятся только на нейросети и обратно в деньги не выводятся.'
        : 'Понимаю: это мой доход. EAGLES сообщит о нём в налоговую, налог 13 % я заплачу сам по уведомлению из налоговой. Рубли в LURE тратятся только на нейросети и обратно в деньги не выводятся.';
      var c = '';
      if(pick === 'lure' && !tax && hold) c = '<div class="wd-calc"><span>Выводишь</span><span class="r">' + rub(a) + '</span><span>Налог ' + hold + ' % (НДФЛ)</span><span class="r m">− ' + rub(a - n) + '</span><span>На баланс LURE</span><span class="r g">' + rub(n) + '</span></div>';
      else if(pick === 'lure' && !tax) c = '<div class="wd-calc"><span>На баланс LURE</span><span class="r g">' + rub(a) + '</span><span>Налог 13 % заплатишь сам</span><span class="r m">' + rub(Math.round(a * 13) / 100) + '</span></div>';
      else if(pick === 'lure') c = '<div class="wd-calc"><span>На баланс LURE</span><span class="r g">' + rub(a) + '</span></div>';
      else if(pick === 'cash') c = '<div class="wd-calc"><span>На карту в субботу</span><span class="r g">' + rub(a) + '</span></div>';
      $('wdCalc').innerHTML = c;
      var lim = pick === 'cash' ? cashAvail : all;
      if(pick && a < wdMin(M)) err = 'Минимум ' + rub(wdMin(M)) + '.'; else if(pick && a > lim) err = 'Можно вывести не больше ' + rub(lim) + '.';
      var e = $('wdErr'); e.style.display = err ? 'block' : 'none'; e.textContent = err;
      var ok = !!pick && !err && (pick !== 'lure' || tax || $('wdAg').checked);
      $('wdGo').disabled = !ok;
      $('wdGo').textContent = !pick ? 'Выбери способ' : pick === 'lure' ? 'Зачислить ' + rub(n) + ' в LURE' : 'Заказать выплату ' + rub(a);
    }
    $('wdL').onclick = function(){ pick = 'lure'; render(); };
    $('wdC').onclick = function(){ if(cashOn){ pick = 'cash'; } render(); };
    $('wdA').oninput = render; $('wdAg').onchange = render;
    $('wdX').onclick = close; $('wdDx').onclick = function(){ close(); load(true); };
    var ERR = { need_agree:'Поставь галочку, что понимаешь про налог.', bad_inn:'Проверь ИНН: 12 цифр, без ошибок.', inn_taken:'Этот ИНН уже привязан к другому ID. Напиши в поддержку.',
      min:'Минимум ' + rub(wdMin(M)) + '.', no_money:'Столько уже нельзя вывести. Обнови страницу.', need_pro:'Нужна активная подписка.', need_status:'Деньгами только самозанятым и ИП.',
      cash_closed:'Выплаты деньгами откроются вместе со стартом.', owner:'Владельцу выводить не нужно.' };
    $('wdGo').onclick = function(){
      var b = this, a = amt(); b.disabled = true; b.textContent = 'Отправляю…';
      api({ action:'wd_req', kind:pick, amt:a, inn:($('wdInn').value || '').replace(/\D/g, ''), agree:$('wdAg').checked ? '1' : '' }).then(function(r){
        if(!r || !r.ok){ var e = $('wdErr'); e.style.display = 'block'; e.textContent = (r && ERR[r.error]) || 'Не получилось. Попробуй ещё раз.'; render(); return; }
        $('wdStep').hidden = true; $('wdDone').hidden = false;
        if(r.kind === 'lure'){
          $('wdDt').textContent = 'В LURE идёт ' + rub(r.net);
          $('wdDd').textContent = 'Рубли появятся на балансе, когда откроешь LURE.' + (!tax ? (r.hold ? ' Налог ' + rub(r.hold) + ' EAGLES перечислит за тебя.' : ' Налог 13 % заплатишь сам, когда придёт уведомление из налоговой.') : '');
        } else {
          $('wdDt').textContent = 'Заявка на ' + rub(r.sum) + ' принята'; $('wdDd').textContent = 'Выплата придёт в ближайшую субботу. Не забудь чек в «Мой налог».'; $('wdDl').hidden = true;
        }
      }).catch(function(){ var e = $('wdErr'); e.style.display = 'block'; e.textContent = 'Нет связи. Попробуй ещё раз.'; render(); });
    };
    render(); $('wdL').focus();
  }
  // ===== /ВЫВОД v1 =====
