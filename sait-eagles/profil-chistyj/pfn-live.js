/* ЧИСТЫЙ ПРОФИЛЬ EAGLES (11.11.2026): живая часть нового вида. Сам вид уже в разметке и стилях,
   здесь только то, что зависит от данных: золотая пыль, деления касаний, игра, ссылка-приглашение,
   число партнёров, карта PRO, видео кнопок «Мои контакты» и LURE. Взято из прежнего скина Профиля v1.1. */
(function(){
  if(window.__pfnV1) return; window.__pfnV1 = 1;
  var NAG = '__NAG__';
  var reduce = false; try{ reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  function $(id){ return document.getElementById(id); }
  function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
  function after(ref, node){ if(ref && node && ref.parentNode && ref.nextSibling !== node) ref.parentNode.insertBefore(node, ref.nextSibling); }
  var ARR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

  /* золотая пыль за логотипом */
  function dust(){
    var cv = document.querySelector('.egp .ptop .pfn-dust'); if(!cv) return;
    var cx = cv.getContext('2d'); if(!cx) return;
    var P = [], W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function rs(){ W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    rs(); window.addEventListener('resize', rs);
    for(var i = 0; i < 30; i++) P.push({ x:Math.random(), y:Math.random(), r:Math.random() * 1.6 + .4, s:Math.random() * .0012 + .0004, a:Math.random() * 6.28 });
    function fr(){
      cx.clearRect(0, 0, W, H);
      for(var i = 0; i < P.length; i++){ var p = P[i]; p.y -= p.s; p.a += .02; if(p.y < 0){ p.y = 1; p.x = Math.random(); }
        cx.beginPath(); cx.arc(p.x * W + Math.sin(p.a) * 6, p.y * H, p.r, 0, 7); cx.fillStyle = 'rgba(255,214,110,' + (.35 + .35 * Math.sin(p.a)) + ')'; cx.fill(); }
      if(!reduce && !document.hidden) requestAnimationFrame(fr); else setTimeout(function(){ requestAnimationFrame(fr); }, 1000);
    }
    fr();
  }

  /* касания: пять делений рядом с кругом */
  function touches(){
    var g = $('glassBlock'), steps = g && g.querySelector('.pfn-steps'); if(!steps) return;
    var dN = $('dN'), wv = $('wv1');
    function upd(){
      var n = parseInt((dN && dN.textContent) || '0', 10) || 0, c = (wv && wv.getAttribute('fill')) || '#ffd23f';
      var it = steps.children; for(var i = 0; i < 5; i++){ it[i].className = i < n ? 'on' : ''; it[i].style.setProperty('--c', c); }
    }
    upd();
    if(window.MutationObserver){
      if(dN) new MutationObserver(upd).observe(dN, { childList:true, characterData:true, subtree:true });
      if(wv) new MutationObserver(upd).observe(wv, { attributes:true, attributeFilter:['fill'] });
    }
  }

  /* игра «Взлетай»: значок игры живёт в плашке, «Играть» нажимает его */
  function game(){
    var t = $('pfnGame'), gb = $('eg-game-btn'); if(!t) return;
    function hasBadge(){ return gb && gb.children.length > 0; }
    function adopt(){
      if(!hasBadge()) return false;
      var im = t.querySelector('.pfn-gimg'); if(im) im.remove();
      gb.removeAttribute('style'); return true;
    }
    if(!adopt()){ var k = 0, iv = setInterval(function(){ if(adopt() || ++k > 30) clearInterval(iv); }, 300); }
    function tapBadge(){
      var r = gb.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var tg = document.elementFromPoint(x, y);
      if(!tg || !gb.contains(tg)) tg = gb.querySelector('*') || gb;
      for(var d = 0; tg && tg.shadowRoot && d < 5; d++){ var u = tg.shadowRoot.elementFromPoint ? tg.shadowRoot.elementFromPoint(x, y) : null; if(!u || u === tg) break; tg = u; }
      var o = { bubbles:true, cancelable:true, composed:true, view:window, clientX:x, clientY:y, button:0, pointerId:1, pointerType:'touch', isPrimary:true };
      ['pointerover','pointerenter','pointerdown','mousedown','pointerup','mouseup'].forEach(function(n){
        try{ tg.dispatchEvent(n.indexOf('pointer') === 0 && window.PointerEvent ? new PointerEvent(n, o) : new MouseEvent(n, o)); }catch(e){}
      });
      try{ if(typeof tg.click === 'function') tg.click(); else tg.dispatchEvent(new MouseEvent('click', o)); }catch(e){}
    }
    function snap(){ return document.body.children.length + '|' + gb.getElementsByTagName('*').length + '|' + document.documentElement.style.overflow + '|' + document.body.style.overflow + '|' + location.href; }
    function go(e){
      if(gb && e && e.target && gb.contains(e.target)) return;
      var src = (gb && gb.getAttribute('data-src')) || '/games/vzlet/play/';
      if(!hasBadge()){ location.href = src; return; }
      var before = snap();
      tapBadge();
      setTimeout(function(){ if(snap() === before) location.href = src; }, 900);
    }
    t.addEventListener('click', go);
    t.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(e); } });
  }

  /* партнёрская программа: подпись и значок у «Пригласить друга» (кнопку перерисовывает её скрипт) */
  function partner(){
    var inv = $('bnInviteBtn'); if(!inv) return;
    var fix = function(){
      var s = inv.querySelector('small'); if(s && s.textContent !== 'Твоя ссылка в команду') s.textContent = 'Твоя ссылка в команду';
      var a = inv.querySelector('.arr'); if(a && !a.querySelector('svg')) a.innerHTML = ARR;
      if(!inv.querySelector('.pfn-ic')){ var ic = el('span', 'pfn-ic', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10" cy="8" r="4"/><path d="M3 20c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5M19 7v6M16 10h6"/></svg>'); inv.insertBefore(ic, inv.firstChild); }
    };
    fix(); if(window.MutationObserver) new MutationObserver(fix).observe(inv, { childList:true });
  }

  /* мои партнёры: подпись с числом и пустые места */
  function partners(){
    var b = $('partnersBlock'), list = $('partnersList'); if(!b || !list) return;
    var ch = b.querySelector('.ch');
    function upd(){
      var sub = ch && ch.querySelector('small'), n = list.querySelectorAll('.prt').length, emp = list.querySelector('.empty');
      if(sub) sub.textContent = n ? (n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'партнёр' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 'партнёра' : 'партнёров') + ' в команде') : (emp && /Загружаю/.test(emp.textContent) ? 'Загружаю…' : 'Пока никого, места ждут');
      var ph = b.querySelector('.pfn-seats');
      if(!n && emp && !/Загружаю/.test(emp.textContent)){
        if(!ph){ ph = el('div', 'pfn-seats', '<i>+</i><i>+</i><i>+</i><i>+</i>'); ph.setAttribute('aria-hidden', 'true'); list.parentNode.insertBefore(ph, list); }
      } else if(ph) ph.remove();
    }
    upd(); if(window.MutationObserver) new MutationObserver(upd).observe(list, { childList:true, subtree:true });
  }

  /* Мой PRO: золотая карта (блок рисует скрипт тарифа, когда пришёл ответ сервера) */
  function head(card, img, title, sub){
    var ch = card.querySelector('.ch'); if(!ch || ch.classList.contains('pfn-sh')) return ch;
    ch.classList.add('pfn-sh');
    ch.innerHTML = '<img src="' + img + '" alt=""><span><b class="pfn-gold">' + title + '</b><small>' + sub + '</small></span>';
    return ch;
  }
  function pro(){
    var box = $('planBox'); if(!box) return;
    function upd(){
      if(box.querySelector('.pfn-card') || box.querySelector('.pfn-sh')) return;
      var renew = $('pfRenew');
      if(renew){
        var d = box.querySelector('.txt b'), nm = ($('nameDisplay') && $('nameDisplay').textContent) || '';
        box.classList.add('pfn-pro');
        var c = el('div', 'pfn-card',
          '<img class="pfn-tr" src="' + NAG + '" alt=""><span class="pfn-eg">EAGLES</span><span class="pfn-big pfn-gold">PRO</span>' +
          '<span class="pfn-bot"><span><small>Владелец</small><b></b></span><span style="text-align:right"><small>Действует до</small><b></b></span></span>');
        var bs = c.querySelectorAll('.pfn-bot b'); bs[0].textContent = nm; bs[1].textContent = d ? d.textContent : 'PRO';
        box.insertBefore(c, box.firstChild);
        var p = el('p', 'pfn-note', 'Продли заранее: срок добавится, ничего не сгорит.'); after(renew, p);
      } else {
        box.classList.remove('pfn-pro');
        head(box, NAG, 'Преимущества PRO', 'Всё без лимитов и партнёрская программа');
      }
    }
    upd(); if(window.MutationObserver) new MutationObserver(upd).observe(box, { childList:true });
  }

  /* видео в кнопках «Мои контакты» и LURE: играет, только когда кнопку видно */
  function vid(a){
    if(!a) return; var v = a.querySelector('video'); if(!v) return; v.muted = true;
    function play(){ if(reduce) return; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
    var seen = true;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ en.forEach(function(x){ seen = x.isIntersecting; if(seen) play(); else v.pause(); }); }, {threshold:.2}).observe(a);
    } else play();
    document.addEventListener('visibilitychange', function(){ if(document.hidden) v.pause(); else if(seen) play(); });
  }

  [dust, touches, game, partner, partners, pro].forEach(function(f){ try{ f(); }catch(e){} });
  try{ vid($('kontaktyVB')); }catch(e){}
  try{ vid($('lureVB')); }catch(e){}
})();
