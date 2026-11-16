# -*- coding: utf-8 -*-
"""EYE задание 62: пункт EYE прямо в нижнем меню страниц (сразу 5 пунктов) + один мягкий звук нажатий на всех страницах.
Запуск: python3 patch62.py <папка с живыми страницами> <папка для результата>
Страницы: profile, contacts, obuchenie, kanal, binar, roliki (+ chat.html v2 лежит рядом готовым файлом)."""
import sys, os, re

EYE_SVG = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
EYE_A = '<a class="tab-item" id="tabEye" href="/profile.html?chat=">' + EYE_SVG + 'EYE<i class="eye-tn" hidden></i></a>'
EYE_A_EK = '<a href="/profile.html?chat=" id="tabEye">' + EYE_SVG + 'EYE<i class="eye-tn" hidden></i></a>'
G5 = 'grid-template-columns:repeat(5,1fr)!important'

SOFT = r"""
  /* EAGLES 16.11.2026: один мягкий звук нажатий на всех страницах — тёплый короткий «тук» без щелчка */
  function egSoftTap(c){
    var t = c.currentTime + .005, o = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(440, t + .09);
    o2.type = 'sine'; o2.frequency.setValueAtTime(990, t); o2.frequency.exponentialRampToValueAtTime(660, t + .09); g2.gain.value = .25;
    f.type = 'lowpass'; f.frequency.value = 2200;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(c.destination);
    o.start(t); o2.start(t); o.stop(t + .18); o2.stop(t + .18);
  }
"""

BLOCK = "\n<script>\n/* EAGLES 16.11.2026: мягкий звук нажатий, как на всех страницах (ссылка открывается через 0,16 с, чтобы звук успел) */\n(function(){\n  var actx = null;\n  function getCtx(){ if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }" + SOFT + r"""  document.addEventListener('click', function(ev){
    var el = ev.target.closest('a, button'); if(!el) return;
    try{ var c = getCtx(); if(c.state === 'running') egSoftTap(c); else c.resume().then(function(){ egSoftTap(c); }).catch(function(){}); }catch(e){}
    if(el.tagName === 'A' && !ev.defaultPrevented && !ev.ctrlKey && !ev.metaKey){
      var h = el.getAttribute('href');
      if(h && h.charAt(0) !== '#' && el.target !== '_blank' && !/^(javascript|mailto|tel):/i.test(h)){ ev.preventDefault(); var u = el.href; setTimeout(function(){ location.href = u; }, 160); }
    }
  });
})();
</script>
"""

def once(s, a, b, name):
    n = s.count(a)
    if n != 1: raise SystemExit('%s: ожидал 1 вхождение, нашёл %d: %r' % (name, n, a[:80]))
    return s.replace(a, b)

def soft_sound(s, name):
    i = s.index('function playClick(){')
    a = s.index('function fire(){', i)
    b = s.index("if(c.state === 'running')", a)
    a = s.rfind('\n', 0, a) + 1; b = s.rfind('\n', 0, b) + 1
    s = s[:a] + '      function fire(){ egSoftTap(c); }\n' + s[b:]
    j = s.rfind('\n', 0, i) + 1
    s = s[:j] + SOFT.lstrip('\n') + s[j:]
    return once(s, "if(hrefAttr && hrefAttr !== '#' && el.target !== '_blank'){", "if(hrefAttr && hrefAttr !== '#' && el.target !== '_blank' && !ev.defaultPrevented){", name)

def add_block(s):
    k = s.rfind('</body>')
    return s[:k] + BLOCK + s[k:] if k >= 0 else s + BLOCK

PROF = '<path d="M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7"/></svg>Профиль</a>'

def p_profile(s):
    s = once(s, PROF + "' +\n", PROF + "' +\n    '" + EYE_A + "' +\n", 'profile tab')
    s = once(s, "  bar.className = 'tabbar';\n  bar.innerHTML =\n    '<a class=\"tab-item active\"", "  bar.className = 'tabbar'; bar.style.setProperty('grid-template-columns', 'repeat(5,1fr)', 'important');\n  bar.innerHTML =\n    '<a class=\"tab-item active\"", 'profile grid')
    return soft_sound(s, 'profile')

def p_obuchenie(s):
    s = once(s, PROF + "' +\n", PROF + "' +\n    '" + EYE_A + "' +\n", 'obuchenie tab')
    s = once(s, "  bar.className = 'tabbar';\n  bar.innerHTML =", "  bar.className = 'tabbar'; bar.style.setProperty('grid-template-columns', 'repeat(5,1fr)', 'important');\n  bar.innerHTML =", 'obuchenie grid')
    return soft_sound(s, 'obuchenie')

def p_contacts(s):
    s = once(s, '<nav class="tabbar">\n  <a class="tab-item" href="/profile.html">', '<nav class="tabbar" style="' + G5 + '">\n  <a class="tab-item" href="/profile.html">', 'contacts nav')
    i = s.index('<nav class="tabbar" style='); j = s.index(PROF, i) + len(PROF)
    s = s[:j] + '\n  ' + EYE_A + s[j:]
    return soft_sound(s, 'contacts')

def p_binar(s):
    s = once(s, '<div class="tabbar">\n  <a class="tab-item active" href="/profile.html">', '<div class="tabbar" style="' + G5 + '">\n  <a class="tab-item active" href="/profile.html">', 'binar nav')
    i = s.index('<div class="tabbar" style='); j = s.index(PROF, i) + len(PROF)
    s = s[:j] + '\n  ' + EYE_A + s[j:]
    return add_block(s)

def p_kanal(s):
    s = once(s, '<nav class="ek-nav" aria-label="Меню"><div>', '<nav class="ek-nav" aria-label="Меню"><div style="' + G5 + '">', 'kanal nav')
    i = s.index('<nav class="ek-nav" aria-label="Меню">'); j = s.index(PROF, i) + len(PROF)
    s = s[:j] + '\n  ' + EYE_A_EK + s[j:]
    return add_block(s)

def p_roliki(s):
    a = s.index('<div class="tabbar">\n  <a class="tab-item" href="/profile.html"><span class="tab-icon">')
    b = s.index('</div>', a) + len('</div>')
    I = {'p': '<circle cx="12" cy="8" r="4"/>' + '<path d="M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7"/>',
         'c': '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h4"/>',
         'o': '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3.5 3 8.5 3 12 0v-5"/>',
         'k': '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>'}
    def it(href, k, t): return '  <a class="tab-item" href="' + href + '"><svg viewBox="0 0 24 24">' + I[k] + '</svg>' + t + '</a>\n'
    nb = ('<div class="tabbar" style="' + G5 + '">\n' + it('/profile.html', 'p', 'Профиль') + '  ' + EYE_A + '\n' +
          it('/contacts.html', 'c', 'Контакты') + it('/obuchenie.html', 'o', 'Обучение') + it('/kanal.html', 'k', 'Канал') + '</div>')
    s = s[:a] + nb + s[b:]
    return add_block(s)

P = {'profile': p_profile, 'obuchenie': p_obuchenie, 'contacts': p_contacts, 'binar': p_binar, 'kanal': p_kanal, 'roliki': p_roliki}
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    for n, f in P.items():
        s = open(os.path.join(src, n + '.html'), encoding='utf-8').read()
        if 'id="tabEye"' in s: raise SystemExit(n + ': уже исправлена')
        out = f(s)
        open(os.path.join(dst, n + '.html'), 'w', encoding='utf-8').write(out)
        print(n, len(s.encode()), '->', len(out.encode()))
