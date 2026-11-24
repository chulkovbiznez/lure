/* eg-skoro.js (24.11.2026, задание 119): «Скоро, в декабре» на Обучении и в Канале Андрея.
   Видео и уроки НЕ удаляются: они только скрыты стилем. Убрать этот файл из страниц = всё вернётся как было.
   Подключение: в <head> страницы obuchenie.html и kanal.html — <script src="/eg-skoro.js?v=1"></script> */
(function(){
  if (window.__egSkoro) return; window.__egSkoro = 1;
  var page = /kanal\.html/.test(location.pathname) ? 'kanal' : 'obuchenie';

  var HIDE = page === 'obuchenie'
    ? '.learn-page .stories,.learn-page .seg,.learn-page .kc-urs,.learn-page .section-title,#proBox,#lessonsList,.learn-page .lchip'
    : '#eagles-kanal .ek-stories,#ek-upl,#eagles-kanal .kc-fw,#eagles-kanal .ek-tabs,#eagles-kanal .kp-tlink,#eagles-kanal .ek-sec,#eagles-kanal .kc-posts';

  var css = HIDE + '{display:none!important}'
  + '.sk{position:relative;margin:18px 0 8px;padding:6px 0 4px;isolation:isolate}'
  /* живой фон за стеклом: тёплые пятна медленно плавают, стекло их преломляет */
  + '.sk-bg{position:absolute;inset:-10px -6px;z-index:-1;overflow:hidden;border-radius:34px;pointer-events:none}'
  + '.sk-bg i{position:absolute;border-radius:50%;filter:blur(26px);opacity:.85;animation:skf 14s ease-in-out infinite alternate}'
  + '.sk-bg i:nth-child(1){width:220px;height:220px;left:-40px;top:10px;background:radial-gradient(circle,#ffb21f,rgba(255,120,20,0) 70%)}'
  + '.sk-bg i:nth-child(2){width:260px;height:260px;right:-70px;top:120px;background:radial-gradient(circle,#ffd23f,rgba(255,200,60,0) 70%);animation-duration:18s}'
  + '.sk-bg i:nth-child(3){width:200px;height:200px;left:30%;bottom:-40px;background:radial-gradient(circle,#ff7a2b,rgba(255,90,30,0) 70%);animation-duration:22s}'
  + '@keyframes skf{0%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.12)}100%{transform:translate(-20px,25px) scale(.95)}}'
  /* жидкое стекло: прозрачная заливка, сильное размытие и насыщенность, светлый блик по краю, мягкая тень */
  + '.lg{position:relative;border-radius:28px;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.04) 45%,rgba(255,255,255,.09));'
  + '-webkit-backdrop-filter:blur(22px) saturate(190%) brightness(1.05);backdrop-filter:blur(22px) saturate(190%) brightness(1.05);'
  + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.12),inset 0 0 0 1px rgba(255,255,255,.14),0 18px 40px rgba(0,0,0,.45);overflow:hidden}'
  + '.lg::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.2px;background:linear-gradient(140deg,rgba(255,255,255,.75),rgba(255,255,255,.05) 35%,rgba(255,220,140,.08) 65%,rgba(255,255,255,.5));'
  + '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}'
  + '.lg::after{content:"";position:absolute;left:-30%;top:-60%;width:160%;height:90%;background:radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.22),rgba(255,255,255,0) 60%);transform:rotate(-8deg);pointer-events:none;animation:skg 7s ease-in-out infinite}'
  + '@keyframes skg{0%,100%{opacity:.55;transform:translateX(-6%) rotate(-8deg)}50%{opacity:1;transform:translateX(6%) rotate(-8deg)}}'
  + '.sk-main{padding:26px 20px 22px;text-align:center}'
  + '.sk-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border-radius:999px;font:900 12px "Montserrat",sans-serif;letter-spacing:.14em;color:#fff;'
  + 'background:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.08));box-shadow:inset 0 1px 0 rgba(255,255,255,.6),inset 0 0 0 1px rgba(255,255,255,.2)}'
  + '.sk-pill b{width:7px;height:7px;border-radius:50%;background:#ffd23f;box-shadow:0 0 10px #ffd23f;animation:skp 1.6s ease-in-out infinite}'
  + '@keyframes skp{50%{opacity:.35}}'
  + '.sk-main h2{margin:14px 0 8px;font:900 26px/1.15 "Montserrat",sans-serif;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.35)}'
  + '.sk-main h2 span{white-space:nowrap;background:linear-gradient(180deg,#ffe58a,#ffb21f);-webkit-background-clip:text;background-clip:text;color:transparent}'
  + '.sk-main p{margin:0 auto;max-width:330px;font:600 14px/1.5 "Montserrat",sans-serif;color:rgba(255,255,255,.82)}'
  + '.sk-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}'
  + '.sk-t{padding:16px 8px 14px;text-align:center;border-radius:22px}'
  + '.sk-t em{display:block;font-style:normal;font-size:24px;line-height:1}'
  + '.sk-t b{display:block;margin-top:8px;font:800 12.5px "Montserrat",sans-serif;color:#fff}'
  + '.sk-t small{display:block;margin-top:3px;font:700 11px "Montserrat",sans-serif;color:#ffd23f;letter-spacing:.04em}'
  + '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.lg{background:rgba(40,30,18,.85)}}'
  + '@media (prefers-reduced-motion:reduce){.sk-bg i,.lg::after,.sk-pill b{animation:none}}';

  var st = document.createElement('style'); st.id = 'egSkoroCss'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var T = page === 'obuchenie'
    ? { h:'Всё обучение — <span>в декабре</span>', p:'Уроки по нейросетям, сетевому маркетингу и монтажу появятся здесь в декабре 2026, вместе со стартом EAGLES.',
        t:[['🧠','Нейросети'],['🤝','Сетевой'],['🎬','Монтаж']] }
    : { h:'Ролики и уроки — <span>в декабре</span>', p:'Сторис, ролики и обучающие видео появятся в канале в декабре 2026, вместе со стартом EAGLES.',
        t:[['⭕','Сторис'],['🎞️','Ролики'],['🎓','Уроки']] };

  function card(){
    var d = document.createElement('div'); d.className = 'sk'; d.id = 'egSkoro';
    var tiles = T.t.map(function(x){ return '<div class="lg sk-t"><em>' + x[0] + '</em><b>' + x[1] + '</b><small>декабрь</small></div>'; }).join('');
    d.innerHTML = '<div class="sk-bg"><i></i><i></i><i></i></div>'
      + '<div class="lg sk-main"><span class="sk-pill"><b></b>СКОРО</span><h2>' + T.h + '</h2><p>' + T.p + '</p></div>'
      + '<div class="sk-row">' + tiles + '</div>';
    return d;
  }
  function place(){
    if (document.getElementById('egSkoro')) return true;
    var a = page === 'obuchenie' ? document.querySelector('.learn-page .zl-sub') : document.querySelector('#eagles-kanal .ek-chhead');
    if (!a || !a.parentNode) return false;
    a.parentNode.insertBefore(card(), a.nextSibling);
    return true;
  }
  function go(){
    place();
    /* eg-kontent.js перестраивает страницу — следим и возвращаем плашку, если её смыло */
    var mo = new MutationObserver(function(){ place(); });
    mo.observe(document.body, { childList:true, subtree:true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
