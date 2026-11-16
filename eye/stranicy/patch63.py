# -*- coding: utf-8 -*-
"""EYE задание 63: EYE — обычная страница с нижним меню (без окна с золотой рамкой),
одна красная цифра на «Контактах» на всех страницах, золотая пыль и тёплый свет сверху на всех вкладках (как в Профиле).
Запуск: python3 patch63.py <папка с живыми страницами> <папка для результата>"""
import sys, os

def once(s, a, b, name):
    n = s.count(a)
    if n != 1: raise SystemExit('%s: ожидал 1 вхождение, нашёл %d: %r' % (name, n, a[:80]))
    return s.replace(a, b)

YELLOW = 'html.zl-obuchenie .eg-tdot{background:#ffd23f!important}'

FX_CSS = """<style>/* EAGLES 16.11.2026: золотая пыль сверху, как в Профиле (за содержимым страницы, под тёплым светом) */
body{isolation:isolate}
#egTopFx{position:absolute;left:0;right:0;top:0;height:340px;z-index:-1;pointer-events:none;overflow:hidden;
  -webkit-mask-image:linear-gradient(180deg,#000 55%,transparent);mask-image:linear-gradient(180deg,#000 55%,transparent)}
#egTopFx canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
%s</style>
"""
FX_HTML = """<div id="egTopFx" aria-hidden="true"><canvas></canvas></div>
<script>
/* EAGLES 16.11.2026: золотая пыль сверху (та же, что за логотипом в Профиле) */
(function(){
  var box = document.getElementById('egTopFx'), cv = box && box.firstChild; if(!cv || !cv.getContext) return;
  var cx = cv.getContext('2d'); if(!cx) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var P = [], W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  function rs(){ W = cv.clientWidth || innerWidth; H = cv.clientHeight || 340; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  rs(); window.addEventListener('resize', rs);
  for(var i = 0; i < 34; i++) P.push({ x:Math.random(), y:Math.random(), r:Math.random() * 1.6 + .4, s:Math.random() * .0012 + .0004, a:Math.random() * 6.28 });
  function fr(){
    cx.clearRect(0, 0, W, H);
    for(var i = 0; i < P.length; i++){ var p = P[i]; p.y -= p.s; p.a += .02; if(p.y < 0){ p.y = 1; p.x = Math.random(); }
      cx.beginPath(); cx.arc(p.x * W + Math.sin(p.a) * 6, p.y * H, p.r, 0, 7); cx.fillStyle = 'rgba(255,214,110,' + (.35 + .35 * Math.sin(p.a)) + ')'; cx.fill(); }
    if(!reduce && !document.hidden) requestAnimationFrame(fr); else setTimeout(function(){ requestAnimationFrame(fr); }, 1000);
  }
  fr();
})();
</script>
"""

EXTRA = {
  # у «Моих контактов» тёплый свет нарисован на обёртке .mk-page — переносим его на body, чтобы пыль была видна
  'contacts': 'html.ktn body{background:radial-gradient(120% 46% at 50% 0%,#1d1408 0%,#070607 58%) no-repeat,#060607}html.ktn .mk-page{background:transparent!important}\n',
  # у EYE не было тёплого света сверху — даём тот же, что на Обучении и Канале
  'chat': 'html body{background:radial-gradient(120% 40% at 50% 0%,#1d1408 0%,#070708 60%) no-repeat,#070708!important}.ch-page{background:transparent!important}\n',
}

def add_fx(s, name):
    if 'id="egTopFx"' in s: raise SystemExit(name + ': пыль уже стоит')
    h = s.find('</head>')
    if h < 0: raise SystemExit(name + ': нет </head>')
    s = s[:h] + FX_CSS.replace('%s', EXTRA.get(name, '')) + s[h:]
    b = s.find('<body', h); e = s.find('>', b) + 1
    return s[:e] + '\n' + FX_HTML + s[e:]

def badge_block(src_dir):
    c = open(os.path.join(src_dir, 'contacts.html'), encoding='utf-8').read()
    a = c.index('<style>.eg-tdot{'); st = c[a:c.index('</style>', a) + len('</style>')]
    k = c.index('КС 27.10'); a = c.rfind('<script>', 0, k); b = c.index('</script>', k) + len('</script>')
    return '\n' + st + '\n' + c[a:b] + '\n'

BADGE = ''

def add_badge(s, name):
    # красная цифра на «Контактах» — та же, что на остальных страницах (на «Роликах» и в EYE её не было)
    if 'eg-tdot' in s: raise SystemExit(name + ': цифра уже есть')
    k = s.rfind('</body>')
    return s[:k] + BADGE + s[k:] if k >= 0 else s + BADGE

def fix_tab(s, name):
    return once(s, 'href="/profile.html?chat="', 'href="/chat.html"', name + ' tabEye')

def no_yellow(s, name):
    return once(s, YELLOW, '', name + ' yellow') if YELLOW in s else s

def p_profile(s):
    s = fix_tab(s, 'profile')
    s = once(s, """  function open(to){
    f.src = '/chat.html?embed=1' + (to ? '&to=' + encodeURIComponent(to) : '');
    w.classList.add('on'); document.documentElement.style.overflow = 'hidden';
  }""", """  function open(to){   /* 16.11.2026: EYE — обычная страница с нижним меню, без окна поверх Профиля */
    var u = '/chat.html' + (to ? '?to=' + encodeURIComponent(to) : '');
    if(new URLSearchParams(location.search).get('chat') !== null){ location.replace(u); return; }
    setTimeout(function(){ location.href = u; }, 160);
  }""", 'profile open')
    return s

EYE_SVG = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'

def p_chat(s):
    s = once(s, '<a class="tab-item active" href="/profile.html">', '<a class="tab-item" href="/profile.html">', 'chat prof')
    s = once(s, 'Профиль</a>\n  <a class="tab-item" href="/contacts.html">',
             'Профиль</a>\n  <a class="tab-item active" id="tabEye" href="/chat.html">' + EYE_SVG + 'EYE<i class="eye-tn" hidden></i></a>\n  <a class="tab-item" href="/contacts.html">', 'chat eye')
    s = once(s, '  .ch-page .tab-item.active::before{ content:""; position:absolute; top:-8px; left:30%; right:30%; height:3px; border-radius:0 0 3px 3px; background:#ff6a2b; box-shadow:0 0 12px #ff6a2b; }\n',
             '  .ch-page .tab-item.active::before{ content:""; position:absolute; top:-8px; left:30%; right:30%; height:3px; border-radius:0 0 3px 3px; background:#ff6a2b; box-shadow:0 0 12px #ff6a2b; }\n'
             '  /* 16.11.2026: EYE — обычная вкладка: золотое меню из 5 пунктов, как на остальных страницах, без стрелки «назад» */\n'
             '  .ch-page .tabbar{ grid-template-columns:repeat(5,1fr); background:rgba(10,8,6,.82); border-top:1px solid rgba(255,210,63,.18); }\n'
             '  .ch-page .tab-item.active{ color:#ffd23f; }\n'
             '  .ch-page .tab-item.active svg{ transform:translateY(-2px) scale(1.08); }\n'
             '  .ch-page .tab-item.active::before{ background:#ffd23f; box-shadow:0 0 12px #ffd23f; }\n'
             '  #hBack{ display:none; }\n'
             '  .ch-wrap{ position:relative; z-index:1; }\n', 'chat css')
    return s

PAGES = {
  'profile':   lambda s: p_profile(s),
  'contacts':  lambda s: add_fx(fix_tab(s, 'contacts'), 'contacts'),
  'obuchenie': lambda s: add_fx(no_yellow(fix_tab(s, 'obuchenie'), 'obuchenie'), 'obuchenie'),
  'kanal':     lambda s: add_fx(no_yellow(fix_tab(s, 'kanal'), 'kanal'), 'kanal'),
  'binar':     lambda s: add_fx(no_yellow(fix_tab(s, 'binar'), 'binar'), 'binar'),
  'roliki':    lambda s: add_badge(add_fx(no_yellow(fix_tab(s, 'roliki'), 'roliki'), 'roliki'), 'roliki'),
  'chat':      lambda s: add_badge(add_fx(p_chat(s), 'chat'), 'chat'),
}

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    BADGE = badge_block(src)
    for n, f in PAGES.items():
        s = open(os.path.join(src, n + '.html'), encoding='utf-8').read()
        open(os.path.join(dst, n + '.html'), 'w', encoding='utf-8', newline='').write(f(s))
        print('ok', n)
