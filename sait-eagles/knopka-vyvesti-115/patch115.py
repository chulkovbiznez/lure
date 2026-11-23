# Задание 115 (23.11.2026): кнопка «Вывести» справа от суммы, перелив + искры, когда вывести можно. Запуск: python3 patch115.py binar.html binar-new.html
import sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
if 'egOut115' in s: sys.exit('СТОП: кнопка уже стоит')
CSS = '''<style id="egOut115">
.eg-mt{display:flex;align-items:center;gap:12px}.eg-mt>div{flex:1;min-width:0}
.eg-outw{position:relative;flex:none}
.eg-outw .bn-btn{width:auto;margin:0;padding:12px 20px;border-radius:999px;font-size:15px;white-space:nowrap;position:relative;overflow:hidden}
.eg-outw .bn-btn.gold::after{content:"";position:absolute;top:-20%;bottom:-20%;width:38%;left:-60%;transform:skewX(-20deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0));animation:egSweep 2.6s ease-in-out infinite}
@keyframes egSweep{0%{left:-60%}55%,100%{left:130%}}
.eg-outw canvas{position:absolute;left:-14px;top:-14px;width:calc(100% + 28px);height:calc(100% + 28px);pointer-events:none}
@media (prefers-reduced-motion:reduce){.eg-outw .bn-btn.gold::after{animation:none;display:none}}
</style>
'''
FX = '''  // ===== egOut115: искры по контуру кнопки «Вывести» =====
  var egFxT = 0;
  function egOutFx(){
    var b = $('bnOut'); if(!b || !b.classList.contains('gold')) return;
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var w = b.parentNode, cv = document.createElement('canvas'); w.appendChild(cv);
    var ctx = cv.getContext('2d'), W = 0, H = 0, parts = [], t0 = performance.now(), my = ++egFxT;
    function size(){ var d = window.devicePixelRatio || 1; W = w.offsetWidth + 28; H = w.offsetHeight + 28; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    function per(u){ var x0 = 14, y0 = 14, ww = W - 28, h = H - 28, r = h / 2, s = ww - 2 * r, a = Math.PI * r, L = 2 * s + 2 * a, d = ((u % 1) + 1) % 1 * L;
      if(d < s) return [x0 + r + d, y0]; d -= s; if(d < a){ var q = -Math.PI / 2 + d / r; return [x0 + ww - r + r * Math.cos(q), y0 + r + r * Math.sin(q)]; }
      d -= a; if(d < s) return [x0 + ww - r - d, y0 + h]; d -= s; var z = Math.PI / 2 + d / r; return [x0 + r + r * Math.cos(z), y0 + r + r * Math.sin(z)]; }
    function fr(now){
      if(my !== egFxT || !document.body.contains(cv)) return;
      if(!W) size();
      var T = (now - t0) / 1000; ctx.clearRect(0, 0, W, H);
      for(var j = 0; j < 2; j++){ var u = T * 0.28 + j / 2, p = per(u);
        for(var q = 0; q < 16; q++){ var pp = per(u - q * 0.007); ctx.fillStyle = 'rgba(255,' + (214 - q * 6) + ',' + (110 - q * 6) + ',' + ((1 - q / 16) * 0.9).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(pp[0], pp[1], 2.4 * (1 - q / 18), 0, 7); ctx.fill(); }
        if(Math.random() < 0.4) parts.push({ x:p[0], y:p[1], vx:(Math.random() - .5) * 44, vy:(Math.random() - .5) * 44, l:1 });
        ctx.fillStyle = 'rgba(255,252,230,.95)'; ctx.beginPath(); ctx.arc(p[0], p[1], 2, 0, 7); ctx.fill(); }
      parts = parts.filter(function(s){ s.x += s.vx / 60; s.y += s.vy / 60; s.l -= 0.04; if(s.l <= 0) return false; ctx.fillStyle = 'rgba(255,214,110,' + (s.l * .8).toFixed(3) + ')'; ctx.fillRect(s.x - .8, s.y - .8, 1.6, 1.6); return true; });
      requestAnimationFrame(fr);
    }
    requestAnimationFrame(fr);
  }
'''
R = [
 ("</head>", CSS + "</head>"),
 ("""    $('bnMoney').innerHTML = '<div class="bn-note" style="margin:0 0 4px">Доступно к выводу</div><div class="bn-money">' + rub(T.ok) + '</div>'""",
  """    var egCan = !!M.tax && M.tax !== 'owner' && T.ok >= (M.minWithdraw || 1000);
    $('bnMoney').innerHTML = '<div class="eg-mt"><div><div class="bn-note" style="margin:0 0 4px">Доступно к выводу</div><div class="bn-money">' + rub(T.ok) + '</div></div>'
      + '<div class="eg-outw"><button class="bn-btn ' + (egCan ? 'gold' : 'lock') + '" id="bnOut">' + (egCan ? 'Вывести' : '🔒 Вывести') + '</button></div></div>'"""),
 ("""      + '<button class="bn-btn ' + (M.canWithdraw ? 'gold' : 'lock') + '" id="bnOut">' + (M.canWithdraw ? 'Вывести ' + rub(T.ok) : '🔒 Вывести') + '</button>'
""", ""),
 ("    if(!M.tax) taxForm('');", "    egOutFx();\n    if(!M.tax) taxForm('');"),
 ("  function showItems(list){", FX + "  function showItems(list){"),
]
for a, b in R:
    n = s.count(a)
    if n != 1: sys.exit('СТОП: нашлось %d раз: %s' % (n, a[:70]))
    s = s.replace(a, b)
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО md5', hashlib.md5(s.encode()).hexdigest(), 'байт', len(s.encode()))
