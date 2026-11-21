/* EAGLES СТАРТ v1 (egStart1, задание 107, 21.11.2026, Андрей; 107б — плашка в Профиле под логотипом).
   • До старта людям ничего не видно. Андрей (11111) видит плашку «ПРОВЕРКА» со статистикой за всё время.
   • profile.html?start=1 у Андрея — экран «СТАРТ ПРОЕКТА» с большой кнопкой (нажимается один раз, для видео).
     30 минут после старта там же кнопка «Переснять старт».
   • После старта: в Профиле плашка сверху по центру «В ПОЛЁТЕ · таймер · ПАКЕТЫ N», на странице регистрации
     карточка «Уже в полёте N регистраций». На каждую регистрацию счётчик пружинит и показывает «+1».
   • Тап — окно «Статистика EAGLES» поверх страницы (страница под ним размыта), крестик — назад.
     Цифры крутятся барабанами от прошлого захода человека (хранится в телефоне) до сейчас.
   • Все, у кого открыт сайт в момент нажатия, видят отсчёт 3-2-1 и «МЫ ВЗЛЕТЕЛИ!».
   Сервер: действия start_info (открытое, только чтение) и start_go (только Андрей). */
(function () {
  if (window.egStart1) return; window.egStart1 = 1;
  var API = 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
  var OWNER = '11111';
  function LS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function LSset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var SESS = LS('eaglesfree_session') || '', ID = LS('eaglesfree_id') || '';
  var isOwner = ID === OWNER;
  var path = location.pathname.toLowerCase();
  var PAGE = /profile/.test(path) ? 'profile' : (/\/$|index\.html$/.test(path) ? 'reg' : '');
  if (!PAGE) return;
  var WANT_START = PAGE === 'profile' && isOwner && /[?&]start=1/.test(location.search);
  var RM = false; try { RM = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var LOGO = 'data:image/webp;base64,__LOGO__';
  var PKN = { E1: ['E1', 'на месяц', 'Месяц', '499 ₽'], E6: ['E6', 'на полгода', 'Полгода', '2 590 ₽'], E12: ['E12', 'на год', 'Год', '4 990 ₽'] };

  /* ---------- стили ---------- */
  var css = '@font-face{font-family:"EG Gold";src:url(data:font/woff2;base64,__FONT__) format("woff2");font-display:swap}'
  + '@property --ega{syntax:"<angle>";inherits:false;initial-value:0deg}'
  + '.egs-gf{font-family:"EG Gold",Montserrat,system-ui,sans-serif;font-weight:400}'
  + '.egs-gt{background:linear-gradient(180deg,#fff3c4 0%,#ffe08a 22%,#ffd23f 48%,#e9a23b 72%,#a8661a 100%);-webkit-background-clip:text;background-clip:text;color:transparent}'
  + '.egs-gd .egs-cell b{background:linear-gradient(180deg,#fff3c4 0%,#ffe08a 22%,#ffd23f 48%,#e9a23b 72%,#a8661a 100%);-webkit-background-clip:text;background-clip:text;color:transparent}'
  + '.egs-reel{display:inline-flex;align-items:center}'
  + '.egs-cell{position:relative;display:inline-block;height:1.2em;width:.72em;overflow:hidden;text-align:center;line-height:1.2em}'
  + '.egs-cell .egs-st{position:absolute;left:0;right:0;top:0;will-change:transform}'
  + '.egs-cell .egs-st b{display:block;height:1.2em;font-weight:inherit}'
  + '.egs-cell.dim{opacity:.28}.egs-cell.gap{margin-left:.16em}'
  + '.egs-cell.land{animation:egsCl .5s ease-out}@keyframes egsCl{30%{text-shadow:0 0 18px #fff,0 0 30px #ffd23f;transform:scale(1.12)}}'
  + '@keyframes egsSpring{0%{transform:scale(1)}22%{transform:scale(1.13);box-shadow:0 0 34px rgba(255,200,60,.6)}42%{transform:scale(.95)}62%{transform:scale(1.04)}80%{transform:scale(.99)}100%{transform:scale(1)}}'
  + '#egsLive{position:fixed;z-index:9000;top:calc(env(safe-area-inset-top,0px) + 12px);left:0;right:0;margin:0 auto;width:max-content;display:flex;align-items:center;gap:10px;padding:7px 12px 7px 10px;border-radius:16px;border:0;cursor:pointer;color:#f3eee6;font-family:Montserrat,system-ui,sans-serif;background:rgba(16,13,10,.88);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);isolation:isolate;box-shadow:0 6px 24px rgba(0,0,0,.5),0 0 22px rgba(255,180,40,.18)}'
  + '#egsLive:before{content:"";position:absolute;inset:-1px;border-radius:17px;padding:1px;z-index:-1;background:conic-gradient(from var(--ega),rgba(255,210,63,.15),#ffe08a,rgba(255,106,43,.5),rgba(255,210,63,.15) 40%,rgba(255,210,63,.15));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:egsBord 3s linear infinite}'
  + '@keyframes egsBord{to{--ega:360deg}}'
  + '#egsLive.inl{position:relative;top:auto;left:auto;right:auto;z-index:2;margin:2px auto 14px}'
  + '#egsLive.land,.egs-rc.land{animation:egsSpring .75s}'
  + '.egs-dot{width:8px;height:8px;border-radius:50%;background:#3ecf6c;animation:egsDot 1.6s infinite}.egs-dot.pre{background:#ffb02e}'
  + '@keyframes egsDot{0%{box-shadow:0 0 0 0 rgba(62,207,108,.7)}70%{box-shadow:0 0 0 7px rgba(62,207,108,0)}100%{box-shadow:0 0 0 0 rgba(62,207,108,0)}}'
  + '.egs-lv{display:flex;flex-direction:column;line-height:1.05;text-align:left}'
  + '.egs-lv em{font-style:normal;font-size:8.5px;letter-spacing:.18em;color:#a29b90;font-weight:700}'
  + '.egs-lv strong{font-size:15px;font-variant-numeric:tabular-nums;font-weight:700;color:#ffe08a}'
  + '.egs-sep{width:1px;height:26px;background:rgba(255,210,63,.25)}.egs-mini{font-size:17px}'
  + '.egs-plus{position:absolute;right:10px;top:-4px;font-weight:900;font-size:12px;color:#ffe08a;pointer-events:none;animation:egsPlus 1.1s ease-out forwards}@keyframes egsPlus{to{transform:translateY(-22px);opacity:0}}'
  + '.egs-rc{display:block;box-sizing:border-box;width:calc(100% - 32px);max-width:420px;margin:14px auto;padding:14px 16px;border-radius:22px;text-align:center;cursor:pointer;color:#f3eee6;font-family:Montserrat,system-ui,sans-serif;background:radial-gradient(ellipse at 50% 0%,rgba(255,210,63,.14),transparent 60%),#0f0c09;box-shadow:inset 0 0 0 1px #3a2f20,0 0 30px rgba(255,180,40,.12);position:relative}'
  + '.egs-rc.fixed{position:fixed;z-index:9000;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 10px);margin:0 auto}'
  + '.egs-lbl{font-size:10px;letter-spacing:.24em;color:#a29b90;font-weight:700;text-transform:uppercase}'
  + '.egs-rc .egs-rn{font-size:46px;margin:4px 0 0}.egs-rc p{margin:2px 0 0;font-size:13px;color:#d9d2c6}.egs-rc p b{color:#ffe08a}'
  /* окно статистики */
  + '#egsPn{position:fixed;inset:0;z-index:100000;display:none;align-items:flex-start;justify-content:center;overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 14px) 12px 24px;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(18px) saturate(1.2);backdrop-filter:blur(18px) saturate(1.2);font-family:Montserrat,system-ui,sans-serif;color:#f3eee6;box-sizing:border-box}'
  + '#egsPn.on{display:flex}#egsPn *{box-sizing:border-box}'
  + '.egs-cab{position:relative;width:100%;max-width:440px;border-radius:28px;padding:16px 16px 18px;background:linear-gradient(180deg,#1d1710 0%,#100d0a 60%,#0b0908 100%);box-shadow:0 0 0 1.5px #6b4a17,0 0 0 4px #1a130b,0 0 0 5.5px rgba(255,210,63,.55),0 30px 80px rgba(0,0,0,.7),0 0 70px rgba(255,170,40,.18);animation:egsCab .5s cubic-bezier(.2,1.2,.3,1)}'
  + '@keyframes egsCab{from{opacity:0;transform:scale(.7) translateY(-20px)}}'
  + '.egs-bulbs{display:flex;justify-content:space-between;padding:0 6px 12px}.egs-bulbs i{width:9px;height:9px;border-radius:50%;background:#5a4523;animation:egsBulb 1.2s infinite}'
  + '@keyframes egsBulb{0%,100%{background:#5a4523;box-shadow:none}20%{background:#fff3c4;box-shadow:0 0 10px 2px #ffd23f}}'
  + '.egs-top{display:flex;align-items:center;gap:8px}.egs-top img{height:30px}.egs-tit{flex:1;font-size:12px;letter-spacing:.2em;color:#ffe08a;font-weight:900}'
  + '.egs-x{width:34px;height:34px;border-radius:50%;background:#1f1a14;border:.5px solid #2a2622;font-size:18px;color:#a29b90;display:grid;place-items:center;cursor:pointer;padding:0}'
  + '.egs-x.off{opacity:.55}'
  + '.egs-pre{margin-top:10px;font-size:11px;color:#ffcf7a;text-align:center;background:rgba(255,176,46,.08);border:.5px solid rgba(255,176,46,.35);border-radius:10px;padding:6px 8px}'
  + '.egs-tm{margin-top:14px;text-align:center}.egs-tmr{margin-top:8px;display:flex;justify-content:center;align-items:flex-start;gap:6px}'
  + '.egs-tg{display:flex;flex-direction:column;align-items:center;gap:4px}.egs-tg .egs-win{font-size:30px;padding:2px 6px;border-radius:10px;background:#07060a;box-shadow:inset 0 0 0 1px #3a2f20,inset 0 6px 12px rgba(0,0,0,.8)}'
  + '.egs-tg>span{font-size:9px;color:#a29b90;letter-spacing:.14em;font-weight:700}.egs-col{font-size:26px;color:#e9a23b;padding-top:4px}'
  + '.egs-main{margin-top:16px;padding:14px 12px 12px;border-radius:20px;text-align:center;background:radial-gradient(ellipse at 50% 0%,rgba(255,210,63,.12),transparent 60%),#0c0a08;box-shadow:inset 0 0 0 1px #3a2f20}'
  + '.egs-slot{position:relative;margin:10px auto 0;display:inline-block;padding:4px 10px;border-radius:14px;font-size:58px;background:linear-gradient(180deg,#000 0%,#17120c 50%,#000 100%);box-shadow:inset 0 0 0 2px #6b4a17,inset 0 0 0 4px #000,0 0 30px rgba(255,180,40,.15)}'
  + '.egs-slot:after{content:"";position:absolute;inset:0;border-radius:14px;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,0) 28%,rgba(255,255,255,.05) 48%,rgba(0,0,0,0) 72%,rgba(0,0,0,.85) 100%)}'
  + '.egs-since{margin-top:12px;display:inline-flex;align-items:center;gap:8px;font-size:12px;padding:7px 12px;border-radius:999px;background:rgba(62,207,108,.1);color:#bff2cf;border:.5px solid rgba(62,207,108,.35)}.egs-since b{color:#7dffa6;font-weight:900}'
  + '.egs-pk{margin-top:12px;display:flex;flex-direction:column;gap:8px}'
  + '.egs-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:#141217;border:.5px solid #2a2622;position:relative;overflow:hidden}'
  + '.egs-bd{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:15px;color:#3a2306;background:linear-gradient(180deg,#fff3c4,#ffd23f 50%,#e9a23b)}'
  + '.egs-nm>b{display:block;font-size:14px}.egs-nm>s{text-decoration:none;font-size:11px;color:#a29b90}.egs-row .egs-rv{font-size:28px}'
  + '.egs-bar{position:absolute;left:0;bottom:0;height:2px;width:0;background:linear-gradient(90deg,#e9a23b,#ffd23f);transition:width 1.2s cubic-bezier(.2,.9,.2,1);box-shadow:0 0 8px #ffd23f}'
  + '.egs-hit{animation:egsHit .7s}@keyframes egsHit{30%{background:#2a2112;border-color:rgba(255,210,63,.6)}}'
  + '.egs-sect{margin-top:16px}.egs-sect>.egs-lbl{display:block;margin-bottom:8px}'
  + '.egs-earn{padding:14px 12px;border-radius:20px;text-align:center;background:radial-gradient(ellipse at 50% 0%,rgba(62,207,108,.12),transparent 60%),#0c0a08;box-shadow:inset 0 0 0 1px #2d3a24}'
  + '.egs-earn .egs-ew{font-size:38px;margin-top:4px;display:inline-flex;align-items:baseline;gap:6px}.egs-earn .egs-ew em{font-style:normal;font-size:24px;color:#ffe08a}'
  + '.egs-earn p{font-size:11px;color:#a29b90;margin:6px 0 0;line-height:1.4}'
  + '.egs-ranks{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
  + '.egs-rk{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:14px;background:#141217;border:.5px solid #2a2622}'
  + '.egs-rk>div>b{display:block;font-size:12.5px}.egs-rk>div>s{text-decoration:none;font-size:10px;color:#a29b90}.egs-rk .egs-rv{font-size:22px}'
  + '.egs-feed ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}'
  + '.egs-feed li{font-size:12px;color:#d9d2c6;display:flex;justify-content:space-between;gap:8px;padding:7px 10px;border-radius:10px;background:#100e0c;border:.5px solid #221d17;animation:egsFin .5s cubic-bezier(.2,1,.3,1)}'
  + '.egs-feed li span:last-child{color:#ffd23f;font-weight:700;white-space:nowrap}@keyframes egsFin{from{opacity:0;transform:translateY(-10px) scale(.96)}}'
  + '.egs-empty{font-size:12px;color:#a29b90;text-align:center;padding:8px}'
  /* экран старта */
  + '#egsOv{position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:Montserrat,system-ui,sans-serif;color:#f3eee6;background:radial-gradient(ellipse 90% 70% at 50% 42%,#2b1e08 0%,#120d06 45%,#050405 100%)}'
  + '#egsOv.leave{animation:egsOut .9s cubic-bezier(.6,0,.4,1) forwards}@keyframes egsOut{to{opacity:0;transform:scale(1.15);filter:blur(14px)}}'
  + '.egs-rays{position:absolute;left:50%;top:42%;width:240vmax;height:240vmax;transform:translate(-50%,-50%);background:repeating-conic-gradient(from 0deg,rgba(255,210,63,.09) 0deg 3deg,transparent 3deg 15deg);-webkit-mask:radial-gradient(circle,#000 0%,transparent 42%);mask:radial-gradient(circle,#000 0%,transparent 42%);animation:egsSpin 70s linear infinite}'
  + '@keyframes egsSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}'
  + '#egsFx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
  + '.egs-ovc{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 16px;width:100%;max-width:560px;transition:opacity .5s,transform .5s}'
  + '.egs-ovc img{width:min(78vw,400px);filter:drop-shadow(0 10px 40px rgba(255,170,40,.35));animation:egsFly 5s ease-in-out infinite}@keyframes egsFly{50%{transform:translateY(-10px)}}'
  + '.egs-kick{margin-top:4px;font-size:11px;letter-spacing:.38em;color:#ffe08a;opacity:.8;font-weight:700}'
  + '.egs-big{margin-top:14px;font-size:clamp(34px,10vw,58px);line-height:1}'
  + '.egs-sub{margin-top:10px;color:#d9d2c6;font-size:14px;max-width:340px;line-height:1.45}'
  + '.egs-gw{position:relative;margin-top:34px;width:200px;height:200px;display:grid;place-items:center}'
  + '.egs-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,210,63,.6);animation:egsPulse 2.4s cubic-bezier(.2,.6,.3,1) infinite}.egs-ring.r2{animation-delay:1.2s}'
  + '@keyframes egsPulse{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.7);opacity:0}}'
  + '.egs-go{position:relative;width:178px;height:178px;border-radius:50%;border:0;cursor:pointer;background:radial-gradient(circle at 50% 30%,#fff6cf 0%,#ffe08a 18%,#ffd23f 42%,#e9a23b 70%,#8a5212 100%);box-shadow:0 0 0 6px rgba(20,14,6,.9),0 0 0 8px rgba(255,210,63,.55),0 0 60px 10px rgba(255,170,40,.45),inset 0 -10px 24px rgba(120,60,0,.55),inset 0 8px 18px rgba(255,255,255,.6);color:#3a2306;font-size:34px}'
  + '.egs-go:active{transform:scale(.94)}.egs-go small{display:block;font-family:Montserrat,sans-serif;font-weight:900;font-size:10px;letter-spacing:.3em;margin-top:2px;opacity:.75}'
  + '.egs-hint{margin-top:18px;font-size:12px;color:#a29b90;max-width:320px}'
  + '.egs-ghost{margin-top:14px;font-size:12px;color:#ffe08a;border:1px dashed rgba(255,210,63,.45);border-radius:999px;padding:8px 14px;background:none;cursor:pointer}'
  + '.egs-cd{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:3;filter:drop-shadow(0 0 30px rgba(255,180,40,.55))}'
  + '.egs-cd b{font-size:min(56vw,300px);line-height:1;opacity:0}.egs-cd b.in{animation:egsNum .9s cubic-bezier(.2,.9,.2,1) forwards}'
  + '@keyframes egsNum{0%{opacity:0;transform:scale(2.6)}25%{opacity:1;transform:scale(1)}80%{opacity:1;transform:scale(.92)}100%{opacity:0;transform:scale(.6)}}'
  + '.egs-shock{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;border:3px solid #ffe08a;box-shadow:0 0 30px #ffd23f;pointer-events:none;animation:egsShock .9s ease-out forwards;z-index:2}'
  + '@keyframes egsShock{to{transform:scale(28);opacity:0;border-width:.5px}}'
  + '.egs-shake{animation:egsShake .45s}@keyframes egsShake{20%{transform:translate(-6px,3px)}40%{transform:translate(5px,-4px)}60%{transform:translate(-4px,-2px)}80%{transform:translate(3px,4px)}}'
  + '#egsFlash{position:fixed;inset:0;z-index:100002;pointer-events:none;background:radial-gradient(circle,#fff 0%,#ffe08a 35%,rgba(255,170,40,0) 75%);opacity:0}#egsFlash.on{animation:egsFlash 1.1s ease-out forwards}'
  + '@keyframes egsFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}'
  + '.egs-won{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:4;padding:0 16px}.egs-won.on{display:flex}'
  + '.egs-won .w1{font-size:clamp(40px,13vw,80px);line-height:1;animation:egsPop .7s cubic-bezier(.2,1.4,.3,1) both}'
  + '.egs-won .w2{margin-top:12px;font-size:13px;letter-spacing:.35em;color:#ffe08a;font-weight:700;animation:egsPop .7s .15s cubic-bezier(.2,1.4,.3,1) both}'
  + '@keyframes egsPop{from{opacity:0;transform:scale(.4)}}'
  + '@media (prefers-reduced-motion:reduce){.egs-rays,.egs-ovc img,.egs-ring,.egs-bulbs i,#egsLive:before{animation:none}}';
  var st = document.createElement('style'); st.id = 'egStart1css'; st.textContent = css; document.head.appendChild(st);
  var svg = document.createElement('div');
  svg.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="egsB1"><feGaussianBlur stdDeviation="0 1.2"/></filter><filter id="egsB2"><feGaussianBlur stdDeviation="0 3"/></filter><filter id="egsB3"><feGaussianBlur stdDeviation="0 6"/></filter><filter id="egsB4"><feGaussianBlur stdDeviation="0 10"/></filter></svg>';
  document.body.appendChild(svg.firstChild);

  /* ---------- звук (WebAudio), выключатель запоминается ---------- */
  var AC = null, sound = LS('egStartMute') !== '1', lastTick = 0;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, d, type, v, t0, f2) { var a = ac(); if (!a || !sound) return; var t = a.currentTime + (t0 || 0), o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v || .15, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02); }
  function noise(d, v, t0, hp) { var a = ac(); if (!a || !sound) return; var n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0); for (var i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / n); var s = a.createBufferSource(); s.buffer = b; var f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800; var g = a.createGain(); g.gain.value = v || .2; s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + (t0 || 0)); }
  var sfx = {
    tick: function () { var n = performance.now(); if (n - lastTick < 28) return; lastTick = n; tone(2400 + Math.random() * 400, .025, 'square', .025); },
    ding: function () { tone(1318, .35, 'triangle', .09); tone(1976, .5, 'triangle', .06, .06); },
    win: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, .4, 'triangle', .08, i * .08); }); },
    beat: function () { tone(110, .5, 'sine', .5, 0, 45); noise(.12, .12, 0, 2000); },
    boom: function () { tone(80, 1.4, 'sine', .7, 0, 30); noise(1.2, .35, 0, 300); tone(523, 1, 'triangle', .08, .1); tone(784, 1.2, 'triangle', .07, .15); tone(1046, 1.4, 'triangle', .06, .2); },
    pop: function () { tone(880, .12, 'sine', .08, 0, 1320); }
  };

  /* ---------- барабаны ---------- */
  var anims = [], looping = false;
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function setDigit(cell, d) { var s = cell.firstChild; s.innerHTML = '<b>' + d + '</b>'; s.style.transform = 'translateY(0)'; s.style.filter = ''; }
  function stopCell(cell) { anims = anims.filter(function (a) { return a.cell !== cell; }); }
  function loop(now) {
    var keep = [];
    anims.forEach(function (a) {
      var el = now - a.t0, pos;
      if (el < a.dur) pos = a.steps * easeOut(el / a.dur);
      else if (el < a.dur + 320) { var k = (el - a.dur) / 320; pos = a.steps + .16 * Math.sin(k * Math.PI * 2) * (1 - k); }
      else { setDigit(a.cell, a.n); if (a.flash) { a.cell.classList.remove('land'); void a.cell.offsetWidth; a.cell.classList.add('land'); } if (a.done) a.done(); return; }
      var v = Math.abs(pos - a.prev); a.prev = pos;
      var fl = Math.floor(pos); if (fl !== a.lastFl) { a.lastFl = fl; if (a.sound) sfx.tick(); }
      var b = RM ? 0 : v > 1.1 ? 4 : v > .55 ? 3 : v > .25 ? 2 : v > .1 ? 1 : 0;
      if (b !== a.b) { a.b = b; a.st.style.filter = b ? 'url(#egsB' + b + ')' : ''; }
      a.st.style.transform = 'translateY(' + (-(pos + 1) * 1.2) + 'em)';
      keep.push(a);
    });
    anims = anims.filter(function (a) { return keep.indexOf(a) >= 0; });
    if (anims.length) requestAnimationFrame(loop); else looping = false;
  }
  function kick() { if (!looping) { looping = true; requestAnimationFrame(loop); } }
  function Reel(el, len, groups) {
    this.el = el; this.len = len; this.cells = []; this.v = 0; this.dimZeros = true; el.innerHTML = '';
    for (var i = 0; i < len; i++) {
      var c = document.createElement('span'); c.className = 'egs-cell'; var s = document.createElement('span'); s.className = 'egs-st'; c.appendChild(s);
      if (groups && (len - 1 - i) % 3 === 2 && i > 0) c.classList.add('gap');
      el.appendChild(c); this.cells.push(c); setDigit(c, 0);
    }
    this.dim(0);
  }
  Reel.prototype.digits = function (v) { return String(Math.max(0, Math.floor(v))).padStart(this.len, '0').slice(-this.len).split('').map(Number); };
  Reel.prototype.dim = function (v) { var s = String(Math.max(0, Math.floor(v))), me = this; this.cells.forEach(function (c, i) { c.classList.toggle('dim', me.dimZeros && i < me.len - s.length); }); };
  Reel.prototype.set = function (v) { var me = this; this.v = v; this.digits(v).forEach(function (d, i) { stopCell(me.cells[i]); setDigit(me.cells[i], d); }); this.dim(v); };
  Reel.prototype.roll = function (from, to, o) {
    o = o || {}; var dur = o.dur || 2000, stagger = o.stagger == null ? 180 : o.stagger, slot = !!o.slot, mode = o.mode || 'count', snd = o.sound !== false, done = o.done;
    var A = this.digits(from), B = this.digits(to), me = this, left = this.len, any = false; this.v = to;
    this.cells.forEach(function (cell, i) {
      stopCell(cell);
      var p = me.len - 1 - i, base = (B[i] - A[i] + 10) % 10, steps;
      if (mode === 'count') { var real = Math.floor(to / Math.pow(10, p)) - Math.floor(from / Math.pow(10, p)); steps = real < 0 ? base : (real > 40 ? 40 + base : real); } else steps = base;
      if (slot) steps = Math.max(steps, base + 10 + (i % 2 ? 10 : 0));
      if (!steps) { setDigit(cell, B[i]); if (--left === 0) { me.dim(to); if (done) done(); } return; }
      any = true; var h = '';
      for (var j = -1; j <= steps + 1; j++) h += '<b>' + (((A[i] + j) % 10) + 10) % 10 + '</b>';
      var s = cell.firstChild; s.innerHTML = h; s.style.transform = 'translateY(-1.2em)';
      anims.push({ cell: cell, st: s, n: B[i], steps: steps, t0: performance.now(), dur: slot ? dur + i * stagger : dur, prev: 0, lastFl: 0, b: 0, sound: snd, flash: slot,
        done: function () { if (slot) sfx.tick(); if (--left === 0) { me.dim(to); if (done) done(); } } });
    });
    if (any) kick(); this.dim(Math.max(from, to));
  };
  function spring(el) { if (!el) return; el.classList.remove('land'); void el.offsetWidth; el.classList.add('land'); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtShort(s) { s = Math.max(0, Math.floor(s)); var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return d ? d + 'д ' + pad(h) + ':' + pad(m) : pad(h) + ':' + pad(m) + ':' + pad(x); }
  function parts(s) { s = Math.max(0, Math.floor(s)); return [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60]; }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- данные с сервера ---------- */
  var S = null, off = 0, lastFetch = 0;   // S: последний ответ start_info; off: часы сервера − часы телефона
  function now() { return Date.now() + off; }
  function elapsed() { return S && S.at ? (now() - S.at) / 1000 : 0; }
  function q(a) { return API + '?action=' + a + '&_=' + Date.now() + (SESS ? '&sess=' + encodeURIComponent(SESS) : ''); }
  function getInfo() {
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 9000);
    return fetch(q('start_info') + (isOwner ? '&preview=1' : ''), ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (j) { clearTimeout(t); return j; }, function () { clearTimeout(t); return null; });
  }
  function totals(x) { return x && x.pk ? (x.pk.E1 || 0) + (x.pk.E6 || 0) + (x.pk.E12 || 0) : 0; }
  function seenKey() { return 'egStartSeen'; }
  function getSeen() { try { var o = JSON.parse(LS(seenKey()) || 'null'); return o && S && o.at === S.at ? o : null; } catch (e) { return null; } }
  function putSeen() { if (!S || !S.ok) return; LSset(seenKey(), JSON.stringify({ at: S.at, t: now(), pk: S.pk, earned: S.earned || 0, ranks: S.ranks || [] })); }

  /* ---------- плашка в Профиле / карточка на регистрации ---------- */
  var live = null, liveR = null, rc = null, rcR = null;
  function buildLive() {
    if (PAGE === 'profile') {
      if (live) return;
      live = document.createElement('button'); live.id = 'egsLive'; live.type = 'button'; live.setAttribute('aria-label', 'Статистика EAGLES');
      live.innerHTML = '<i class="egs-dot"></i><div class="egs-lv"><em id="egsLvL">В ПОЛЁТЕ</em><strong id="egsLvT">00:00:00</strong></div><i class="egs-sep"></i><div class="egs-lv"><em>ПАКЕТЫ</em><span class="egs-mini egs-gf egs-gd"><span class="egs-reel" id="egsLvC"></span></span></div>';
      /* 107б: в Профиле плашка стоит под логотипом (между «Зеркало твоего бизнеса» и карточкой с именем), а не поверх него */
      var top = document.querySelector('.ptop') || (document.getElementById('egLogo') || {}).parentNode;
      if (top && top.parentNode && top !== document.body) { live.classList.add('inl'); top.parentNode.insertBefore(live, top.nextSibling); }
      else document.body.appendChild(live);
      liveR = new Reel(document.getElementById('egsLvC'), 4);
      live.onclick = function () { openPanel(); };
    } else {
      if (rc) return;
      rc = document.createElement('div'); rc.className = 'egs-rc'; rc.setAttribute('role', 'button');
      rc.innerHTML = '<div class="egs-lbl" id="egsRcL">Уже в полёте</div><div class="egs-rn egs-gf egs-gd"><span class="egs-reel" id="egsRcN"></span></div><p>регистраций · <b id="egsRcT"></b></p>';
      var btn = null, all = document.querySelectorAll('button,a');
      for (var i = 0; i < all.length; i++) { var tx = (all[i].textContent || '').toLowerCase(); if (/регистр/.test(tx) && all[i].offsetParent) { btn = all[i]; break; } }
      if (btn && btn.parentNode) btn.parentNode.insertBefore(rc, btn); else { rc.classList.add('fixed'); document.body.appendChild(rc); }
      rcR = new Reel(document.getElementById('egsRcN'), 5, true);
      rc.onclick = function () { openPanel(); };
    }
  }
  function showCounts(fromTotal, slot) {
    var t = totals(S);
    if (liveR) { if (slot) liveR.roll(fromTotal, t, { slot: true, dur: 1200, stagger: 150, sound: false }); else liveR.set(t); }
    if (rcR) { if (slot) rcR.roll(fromTotal, t, { slot: true, dur: 1500, stagger: 180, sound: false }); else rcR.set(t); }
    paintLabels();
  }
  function paintLabels() {
    var pre = S && S.preview;
    var l = document.getElementById('egsLvL'); if (l) l.textContent = pre ? 'ПРОВЕРКА' : 'В ПОЛЁТЕ';
    var d = live && live.querySelector('.egs-dot'); if (d) d.classList.toggle('pre', !!pre);
    var rl = document.getElementById('egsRcL'); if (rl) rl.textContent = pre ? 'Проверка до старта (видишь только ты)' : 'Уже в полёте';
  }
  function tickClock() {
    if (!S) return;
    var e = elapsed(), tx = S.preview ? 'до старта' : fmtShort(e);
    var a = document.getElementById('egsLvT'); if (a) a.textContent = tx;
    var b = document.getElementById('egsRcT'); if (b) { var d = Math.floor(e / 86400); b.textContent = S.preview ? 'до старта' : (d ? d + ' дн. ' + Math.floor(e % 86400 / 3600) + ' ч с момента старта' : fmtShort(e) + ' с момента старта'); }
    if (pnOpen && !rolling && !S.preview) { var s = Math.floor(e); if (s !== shownT) { var A = parts(shownT), B = parts(s); [tD, tH, tM, tS].forEach(function (r, i) { if (A[i] !== B[i]) r.roll(A[i], B[i], { mode: 'wrap', dur: 380, sound: false }); }); shownT = s; } }
  }
  function plusOne(n) {
    var host = live || rc; if (!host) return;
    spring(host);
    var p = document.createElement('span'); p.className = 'egs-plus'; p.textContent = '+' + n; host.appendChild(p); setTimeout(function () { p.remove(); }, 1100);
  }

  /* ---------- окно «Статистика EAGLES» ---------- */
  var pn = null, pnOpen = false, rolling = false, shownT = -1, tD, tH, tM, tS, tot, rcs = {}, earnR, rkR = [];
  function buildPanel() {
    if (pn) return;
    pn = document.createElement('div'); pn.id = 'egsPn'; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-label', 'Статистика EAGLES');
    var bulbs = ''; for (var i = 0; i < 16; i++) bulbs += '<i style="animation-delay:' + (i * 75) + 'ms"></i>';
    var rows = ['E1', 'E6', 'E12'].map(function (k) { return '<div class="egs-row" id="egsR' + k + '"><div class="egs-bd egs-gf">' + k + '</div><div class="egs-nm"><b>' + PKN[k][2] + '</b><s>' + PKN[k][3] + '</s></div><div class="egs-rv egs-gf egs-gd"><span class="egs-reel" id="egsC' + k + '"></span></div><i class="egs-bar" id="egsBar' + k + '"></i></div>'; }).join('');
    pn.innerHTML = '<div class="egs-cab"><div class="egs-bulbs">' + bulbs + '</div>'
      + '<div class="egs-top"><img src="' + LOGO + '" alt=""><div class="egs-tit">СТАТИСТИКА EAGLES</div><button type="button" class="egs-x" id="egsSnd" aria-label="Звук"></button><button type="button" class="egs-x" id="egsX" aria-label="Закрыть">×</button></div>'
      + '<div class="egs-pre" id="egsPre" style="display:none">Проверка до старта: видишь только ты, цифры за всё время. После «Старта» отсчёт пойдёт с нуля.</div>'
      + '<div class="egs-tm" id="egsTm"><div class="egs-lbl">С момента старта</div><div class="egs-tmr egs-gf">'
      + '<div class="egs-tg"><div class="egs-win egs-gd"><span class="egs-reel" id="egsTD"></span></div><span>ДНЕЙ</span></div><div class="egs-col">:</div>'
      + '<div class="egs-tg"><div class="egs-win egs-gd"><span class="egs-reel" id="egsTH"></span></div><span>ЧАСОВ</span></div><div class="egs-col">:</div>'
      + '<div class="egs-tg"><div class="egs-win egs-gd"><span class="egs-reel" id="egsTM"></span></div><span>МИНУТ</span></div><div class="egs-col">:</div>'
      + '<div class="egs-tg"><div class="egs-win egs-gd"><span class="egs-reel" id="egsTS"></span></div><span>СЕКУНД</span></div></div></div>'
      + '<div class="egs-main"><div class="egs-lbl">Регистраций на пакеты</div><div class="egs-slot egs-gf egs-gd"><span class="egs-reel" id="egsTot"></span></div><br><div class="egs-since" id="egsSince"><span id="egsSinceL">С твоего прошлого захода</span><b id="egsSinceN">+0</b></div></div>'
      + '<div class="egs-pk">' + rows + '</div>'
      + '<div class="egs-sect"><span class="egs-lbl">Партнёры заработали</span><div class="egs-earn"><div class="egs-ew egs-gf egs-gd"><span class="egs-reel" id="egsEarn"></span><em class="egs-gf">₽</em></div><p>Сумма начислений партнёрам с момента старта. Результат каждого зависит от его работы.</p></div></div>'
      + '<div class="egs-sect" id="egsRkS"><span class="egs-lbl">Звания</span><div class="egs-ranks" id="egsRanks"></div></div>'
      + '<div class="egs-sect egs-feed"><span class="egs-lbl">Только что</span><ul id="egsFeed"></ul></div>'
      + '</div>';
    document.body.appendChild(pn);
    tD = new Reel(document.getElementById('egsTD'), 2); tH = new Reel(document.getElementById('egsTH'), 2); tM = new Reel(document.getElementById('egsTM'), 2); tS = new Reel(document.getElementById('egsTS'), 2);
    [tD, tH, tM, tS].forEach(function (r) { r.dimZeros = false; });
    tot = new Reel(document.getElementById('egsTot'), 5, true);
    ['E1', 'E6', 'E12'].forEach(function (k) { rcs[k] = new Reel(document.getElementById('egsC' + k), 4); });
    earnR = new Reel(document.getElementById('egsEarn'), 9, true);
    document.getElementById('egsX').onclick = closePanel;
    pn.addEventListener('click', function (e) { if (e.target === pn) closePanel(); });
    var sb = document.getElementById('egsSnd');
    function paintSnd() { sb.textContent = sound ? '🔊' : '🔇'; sb.classList.toggle('off', !sound); }
    sb.onclick = function () { sound = !sound; LSset('egStartMute', sound ? '0' : '1'); paintSnd(); };
    paintSnd();
  }
  function buildRanks() {
    var box = document.getElementById('egsRanks'), names = (S && S.rankNames) || [];
    if (box.children.length === names.length && names.length) return;
    box.innerHTML = names.map(function (r, i) { return '<div class="egs-rk" id="egsRk' + i + '"><div><b>' + esc(r[0]) + '</b><s>от ' + Number(r[1]).toLocaleString('ru-RU') + ' ₽</s></div><div class="egs-rv egs-gf egs-gd"><span class="egs-reel" id="egsRkv' + i + '"></span></div></div>'; }).join('');
    rkR = names.map(function (r, i) { return new Reel(document.getElementById('egsRkv' + i), 3); });
  }
  function bars() { var t = Math.max(1, totals(S)); ['E1', 'E6', 'E12'].forEach(function (k) { document.getElementById('egsBar' + k).style.width = ((S.pk[k] || 0) / t * 100) + '%'; }); }
  function feed() {
    var ul = document.getElementById('egsFeed'), f = (S && S.feed) || [];
    ul.innerHTML = f.length ? f.slice(0, 3).map(function (x) { var k = PKN[x.pkg] || PKN.E1; return '<li><span>' + esc(x.name || 'Новый орёл') + '</span><span>' + k[0] + ' · ' + k[1] + '</span></li>'; }).join('') : '<li class="egs-empty" style="animation:none;justify-content:center">Первые регистрации появятся здесь</li>';
  }
  function hit(id) { var r = document.getElementById(id); if (!r) return; r.classList.remove('egs-hit'); void r.offsetWidth; r.classList.add('egs-hit'); }
  function countUp(el, n, ms) { var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / ms); el.textContent = '+' + Math.round(n * easeOut(k)).toLocaleString('ru-RU'); if (k < 1) requestAnimationFrame(f); })(t0); }
  function openPanel() {
    if (!S || !S.ok) return;
    buildPanel(); buildRanks(); ac();
    pn.classList.add('on'); pnOpen = true;
    document.getElementById('egsPre').style.display = S.preview ? '' : 'none';
    document.getElementById('egsTm').style.display = S.preview ? 'none' : '';
    document.getElementById('egsRkS').style.display = S.ranks ? '' : 'none';
    var seen = getSeen() || { t: S.at || now(), pk: { E1: 0, E6: 0, E12: 0 }, earned: 0, ranks: [] };
    var first = !getSeen();
    var T = totals(S), T0 = totals(seen), es = seen.t && S.at ? Math.max(0, (seen.t - S.at) / 1000) : 0, en = elapsed();
    var ago = (now() - (seen.t || now())) / 1000;
    document.getElementById('egsSinceL').textContent = first ? (S.preview ? 'За всё время' : 'С момента старта') : ago < 5400 ? 'С твоего прошлого захода' : ago < 172800 ? 'С твоего прошлого захода (вчера)' : 'С твоего прошлого захода (' + Math.round(ago / 86400) + ' дн. назад)';
    document.getElementById('egsSinceN').textContent = '+0';
    feed(); rolling = true;
    setTimeout(function () {
      if (!S.preview) { var pf = parts(es), pt = parts(en); [tD, tH, tM, tS].forEach(function (r, i) { r.roll(pf[i], pt[i], { mode: 'wrap', slot: true, dur: 1300, stagger: 120, sound: false }); }); shownT = Math.floor(en); }
      tot.roll(T0, T, { slot: true, dur: 1700, stagger: 230, done: function () { rolling = false; sfx.win(); putSeen(); } });
      ['E1', 'E6', 'E12'].forEach(function (k, i) { setTimeout(function () { rcs[k].roll((seen.pk || {})[k] || 0, S.pk[k] || 0, { slot: true, dur: 1300, stagger: 150, sound: false, done: function () { sfx.ding(); hit('egsR' + k); } }); }, 500 + i * 260); });
      countUp(document.getElementById('egsSinceN'), Math.max(0, T - T0), 2400); bars();
      setTimeout(function () { earnR.roll(seen.earned || 0, S.earned || 0, { slot: true, dur: 1800, stagger: 110, sound: false, done: sfx.ding }); }, 900);
      var ra = seen.ranks || [], rb = S.ranks || [];
      rkR.forEach(function (r, i) { setTimeout(function () { r.roll(ra[i] || 0, rb[i] || 0, { slot: true, dur: 1100, stagger: 110, sound: false, done: function () { if ((rb[i] || 0) > (ra[i] || 0)) hit('egsRk' + i); } }); }, 1200 + i * 160); });
    }, 300);
  }
  function closePanel() { if (!pn) return; pn.classList.remove('on'); pnOpen = false; if (!rolling) putSeen(); }

  /* обновление с сервера: новая регистрация → пружина и +N */
  function apply(j) {
    if (!j || !j.ok) return;
    if (j.now) off = j.now - Date.now();
    var prev = S; S = j;
    if (!S.at && !S.preview) { if (live) { live.remove(); live = null; } if (rc) { rc.remove(); rc = null; } return; }
    var wasNone = !prev || (!prev.at && !prev.preview);
    if (prev && !prev.at && S.at && now() - S.at < 120000 && !WANT_START) { liftoff(false); return; }
    buildLive();
    if (wasNone) { showCounts(0, true); tickClock(); return; }
    var a = totals(prev), b = totals(S);
    if (b !== a) {
      if (liveR) liveR.roll(liveR.v, b, { dur: 600, sound: false });
      if (rcR) rcR.roll(rcR.v, b, { dur: 600, sound: false });
      if (b > a) plusOne(b - a);
      if (pnOpen && !rolling) {
        tot.roll(tot.v, b, { dur: 700, sound: false }); sfx.pop();
        ['E1', 'E6', 'E12'].forEach(function (k) { if (rcs[k].v !== (S.pk[k] || 0)) { rcs[k].roll(rcs[k].v, S.pk[k] || 0, { dur: 700, sound: false }); hit('egsR' + k); } });
        bars(); feed();
      }
    }
    if (pnOpen && !rolling) {
      if (earnR.v !== (S.earned || 0)) earnR.roll(earnR.v, S.earned || 0, { dur: 700, sound: false });
      buildRanks(); rkR.forEach(function (r, i) { var v = (S.ranks || [])[i] || 0; if (r.v !== v) r.roll(r.v, v, { dur: 700, sound: false }); });
    }
    paintLabels();
  }
  function poll() {
    if (document.hidden) return;
    var started = S && S.at, gap = started ? 15000 : 6000;
    if (Date.now() - lastFetch < gap - 200) return;
    lastFetch = Date.now();
    getInfo().then(apply);
  }

  /* ---------- экран старта (только Андрей, profile.html?start=1) и общий отсчёт 3-2-1 ---------- */
  var ov = null, cv = null, cx = null, P = [], W = 0, H = 0, ovAlive = false;
  function buildOv(owner) {
    ov = document.createElement('section'); ov.id = 'egsOv';
    ov.innerHTML = '<div class="egs-rays"></div><canvas id="egsFx"></canvas>'
      + '<div class="egs-ovc" id="egsOvc"><img src="' + LOGO + '" alt="EAGLES"><div class="egs-kick">ЗЕРКАЛО ТВОЕГО БИЗНЕСА</div>'
      + '<div class="egs-big egs-gf egs-gt">СТАРТ ПРОЕКТА</div><div class="egs-sub" id="egsOvSub">Сегодня EAGLES расправляет крылья. Одно нажатие, и время пошло для всей команды.</div>'
      + (owner ? '<div class="egs-gw"><i class="egs-ring"></i><i class="egs-ring r2"></i><button type="button" class="egs-go egs-gf" id="egsGo">СТАРТ<small>ВЗЛЕТАЕМ</small></button></div><div class="egs-hint" id="egsHint">Кнопка видна только тебе и нажимается один раз</div><button type="button" class="egs-ghost" id="egsClose">Закрыть</button>' : '')
      + '</div><div class="egs-cd"><b class="egs-gf egs-gt" id="egsCdn">3</b></div><div class="egs-won" id="egsWon"><div class="w1 egs-gf egs-gt">МЫ ВЗЛЕТЕЛИ!</div><div class="w2">ПРОЕКТ EAGLES СТАРТОВАЛ</div></div>';
    document.body.appendChild(ov);
    var fl = document.createElement('div'); fl.id = 'egsFlash'; document.body.appendChild(fl);
    cv = document.getElementById('egsFx'); cx = cv.getContext('2d'); ovAlive = true; rs();
    window.addEventListener('resize', rs);
    for (var i = 0; i < 70; i++) { var e = ember(); e.y = Math.random() * H; P.push(e); }
    draw();
  }
  function rs() { if (!cv) return; var D = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * D; cv.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0); }
  function ember() { return { x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * .3, vy: -(.3 + Math.random() * 1.1), r: .6 + Math.random() * 2.2, l: 1, d: .0015 + Math.random() * .004, h: 32 + Math.random() * 14 }; }
  function burst(n) { var x = W / 2, y = H * .45; for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 13; P.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1 + Math.random() * 3, l: 1, d: .008 + Math.random() * .012, h: 28 + Math.random() * 18, f: 1 }); } }
  function draw() {
    if (!ovAlive) return; cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
    P.forEach(function (p) { p.x += p.vx; p.y += p.vy; if (p.f) { p.vx *= .965; p.vy = p.vy * .965 + .05; } p.l -= p.d;
      var g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4); g.addColorStop(0, 'hsla(' + p.h + ',100%,75%,' + Math.max(0, p.l) + ')'); g.addColorStop(1, 'hsla(' + p.h + ',100%,50%,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r * 4, 0, 7); cx.fill(); });
    P = P.filter(function (p) { return p.l > 0 && p.y > -20; }); var n = P.filter(function (p) { return !p.f; }).length; while (n++ < 70) P.push(ember());
    requestAnimationFrame(draw);
  }
  function shock() { var s = document.createElement('i'); s.className = 'egs-shock'; ov.appendChild(s); setTimeout(function () { s.remove(); }, 900); }
  function countdown(cb) {
    var c = document.getElementById('egsOvc'); c.style.opacity = 0; c.style.transform = 'scale(.9)';
    var n = 3, b = document.getElementById('egsCdn');
    function step() {
      if (n === 0) { cb(); return; }
      b.textContent = n; b.classList.remove('in'); void b.offsetWidth; b.classList.add('in'); sfx.beat(); shock();
      ov.classList.remove('egs-shake'); void ov.offsetWidth; ov.classList.add('egs-shake'); n--; setTimeout(step, 950);
    }
    setTimeout(step, 450);
  }
  function boomAndLeave() {
    sfx.boom(); var fl = document.getElementById('egsFlash'); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); burst(320);
    for (var k = 0; k < 3; k++) setTimeout(shock, k * 140);
    document.getElementById('egsWon').classList.add('on');
    setTimeout(function () {
      ov.classList.add('leave');
      setTimeout(function () {
        ovAlive = false; ov.remove(); fl.remove(); ov = null;
        buildLive(); showCounts(0, false); tickClock();
        var h = live || rc;
        if (h && !RM && h.animate) { var r = h.getBoundingClientRect(), dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height / 2);
          h.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(3)', opacity: 0 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(2.6)', opacity: 1, offset: .3 }, { transform: 'none', opacity: 1 }], { duration: 1100, easing: 'cubic-bezier(.6,0,.2,1)' }); }
      }, 850);
    }, 2300);
  }
  function liftoff(owner) { if (ov) return; buildOv(false); ac(); countdown(boomAndLeave); }
  function ownerStart() {
    buildOv(true);
    var hint = document.getElementById('egsHint'), go = document.getElementById('egsGo'), busy = false;
    document.getElementById('egsClose').onclick = function () { ovAlive = false; ov.remove(); ov = null; var f = document.getElementById('egsFlash'); if (f) f.remove(); };
    if (S && S.at) {
      hint.textContent = S.canReset ? 'Старт уже нажат. Можно переснять: первые 30 минут кнопка сбрасывает старт.' : 'Старт уже нажат, время идёт.';
      if (S.canReset) { go.innerHTML = 'ЕЩЁ РАЗ<small>ПЕРЕСНЯТЬ</small>'; go.style.fontSize = '26px'; } else { go.disabled = true; go.style.opacity = .5; }
    }
    go.onclick = function () {
      if (busy) return; busy = true; ac();
      var reset = S && S.at && S.canReset;
      var chain = reset ? fetch(q('start_go') + '&reset=1').then(function (r) { return r.json(); }) : Promise.resolve({ ok: true });
      chain.then(function (r0) {
        if (!r0 || !r0.ok) throw new Error(r0 && r0.error || 'reset');
        return fetch(q('start_go')).then(function (r) { return r.json(); });
      }).then(function (j) {
        if (!j || !j.ok || !j.at) throw new Error(j && j.error || 'start');
        S = Object.assign({}, S || {}, { at: j.at, preview: 0 }); if (j.now) off = j.now - Date.now();
        countdown(function () { boomAndLeave(); setTimeout(function () { lastFetch = 0; poll(); }, 3500); });
      }).catch(function (e) { busy = false; hint.textContent = 'Не получилось (' + e.message + '). Проверь интернет и нажми ещё раз.'; });
    };
  }

  /* ---------- запуск ---------- */
  getInfo().then(function (j) {
    if (j && j.ok) { if (j.now) off = j.now - Date.now(); S = j; }
    if (WANT_START) { ownerStart(); if (S && (S.at || S.preview)) { buildLive(); showCounts(0, false); tickClock(); } }
    else if (S && (S.at || S.preview)) { buildLive(); showCounts(0, true); tickClock(); }
    lastFetch = Date.now();
    setInterval(poll, 1000);
    setInterval(tickClock, 250);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
  });
})();
