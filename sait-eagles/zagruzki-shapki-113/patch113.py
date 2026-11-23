# -*- coding: utf-8 -*-
# Задание 113 (23.11.2026): экраны загрузки + золотые надписи вверху
# для «Мои контакты» (contacts.html), EYRIE (kanal.html), «Обучение» (obuchenie.html).
# Запуск: python3 patch113.py <kontakty|eyrie|obuchenie> <вход.html> <выход.html>
# Только вид: логика, данные и сервер не трогаются. Откат: залить старый файл.
# Экран загрузки показывается при первом открытии страницы в сессии браузера,
# при повторных переходах (Обучение <-> EYRIE и т.п.) не показывается, чтобы не мелькать.
# Надписи вверху сделаны только стилями (без подмены текста скриптом), поэтому
# слово-заголовок не успевает мелькнуть, а h1 остаётся для поиска и читалок.
import sys, hashlib, re

MARK = 'egZ113'

CFG = {
    'kontakty': dict(
        boot='/kontakty-zagruzka.webp', ar='880/550',
        head='/kontakty-zagolovok.webp',
        need='<h1 class="large-title">Мои контакты</h1>',
        css=(
            'html body .title-row .ktn-hico{display:none!important}'
            'html body .title-row{flex-wrap:wrap!important}'
            'html body .title-row h1.large-title{flex:0 0 100%!important;order:2;'
            'width:min(76vw,330px)!important;max-width:100%;aspect-ratio:1000/223;margin:4px auto 0!important;'
            'font-size:0!important;line-height:0!important;color:transparent!important;'
            '-webkit-text-fill-color:transparent!important;text-shadow:none!important;'
            'background:url(/kontakty-zagolovok.webp) center/contain no-repeat!important;'
            '-webkit-background-clip:border-box!important;background-clip:border-box!important}'
            'html body .title-row .vid-btn{order:1;margin:0 0 0 auto!important}'
        )),
    'eyrie': dict(
        boot='/eyrie-zagruzka.webp', ar='880/555',
        head='/eyrie-zagolovok.webp',
        need='zl-eyrie',
        css=(
            'html body .zl-eyrie>b{display:block!important;width:min(76vw,330px)!important;'
            'aspect-ratio:1000/236;margin:0 auto!important;padding:0!important;'
            'font-size:0!important;line-height:0!important;letter-spacing:0!important;color:transparent!important;'
            '-webkit-text-fill-color:transparent!important;text-shadow:none!important;filter:none!important;'
            'background:url(/eyrie-zagolovok.webp) center/contain no-repeat!important;'
            '-webkit-background-clip:border-box!important;background-clip:border-box!important;animation:none!important}'
            'html body .zl-eyrie>b::before,html body .zl-eyrie>b::after{display:none!important}'
            'html body .zl-eyrie>small{display:block;text-align:center}'
        )),
    'obuchenie': dict(
        boot='/obuchenie-zagruzka.webp', ar='880/548',
        head='/obuchenie-zagolovok.webp',
        need='<h1 class="learn-title">Обучение</h1>',
        css=(
            'html body .learn-page .ptop{display:flex!important;flex-direction:column!important;'
            'align-items:center!important;gap:8px!important}'
            'html body .learn-page .ptop .zl-hico{display:none!important}'
            'html body .learn-page .ptop h1.learn-title{width:min(76vw,330px)!important;max-width:100%;'
            'aspect-ratio:1000/192;margin:0 auto!important;'
            'font-size:0!important;line-height:0!important;color:transparent!important;'
            '-webkit-text-fill-color:transparent!important;text-shadow:none!important;'
            'background:url(/obuchenie-zagolovok.webp) center/contain no-repeat!important;'
            '-webkit-background-clip:border-box!important;background-clip:border-box!important}'
            'html body .learn-page .ptop .lchip{margin:0 auto!important;justify-self:auto!important}'
        )),
}

ZGR_CSS = (
    '.zgr{position:fixed;inset:0;z-index:100005;background:#070708;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:38px;padding:0 24px 6vh;overflow:hidden;transition:opacity .45s ease}'
    '.zgr[hidden]{display:none!important}'
    '.zgr.zgr-out{opacity:0;pointer-events:none}'
    '.zgr-glw{position:absolute;left:50%;top:43%;width:600px;height:600px;margin:-300px 0 0 -300px;border-radius:50%;background:radial-gradient(circle,rgba(255,176,46,.22),rgba(255,120,30,.07) 38%,rgba(0,0,0,0) 66%);animation:zgrPulse 3.4s ease-in-out infinite;pointer-events:none}'
    '.zgr-lg{position:relative;width:min(82vw,360px);aspect-ratio:var(--zgr-ar);background:var(--zgr-img) center/contain no-repeat;animation:zgrIn .8s cubic-bezier(.2,.8,.2,1) both,zgrFloat 4.2s ease-in-out .8s infinite}'
    '.zgr-lg::after{content:"";position:absolute;inset:0;-webkit-mask:var(--zgr-img) center/contain no-repeat;mask:var(--zgr-img) center/contain no-repeat;background:linear-gradient(100deg,rgba(255,255,255,0) 40%,rgba(255,246,214,.75) 50%,rgba(255,255,255,0) 60%) no-repeat;background-size:300% 100%;animation:zgrShine 2.8s ease-in-out .6s infinite}'
    '.zgr-bar{position:relative;width:min(58vw,230px);height:4px;border-radius:4px;background:rgba(255,210,63,.13);box-shadow:inset 0 0 0 .5px rgba(255,210,63,.18);animation:zgrIn .6s .25s both}'
    '.zgr-bar i{position:absolute;left:0;top:0;bottom:0;width:6%;border-radius:4px;background:linear-gradient(90deg,#ffe08a,#ffd23f 30%,#ff9a2a 70%,#ff5a1f);box-shadow:0 0 14px rgba(255,170,40,.75),0 0 3px rgba(255,220,120,.9);transition:width .5s cubic-bezier(.3,.7,.3,1)}'
    '.zgr-bar i::after{content:"";position:absolute;right:-3px;top:50%;width:10px;height:10px;margin-top:-5px;border-radius:50%;background:radial-gradient(circle,#fff6d6,rgba(255,200,80,.6) 45%,rgba(255,170,40,0) 70%)}'
    '.zgr-t{position:absolute;left:0;right:0;bottom:calc(14vh + env(safe-area-inset-bottom,0px));text-align:center;font:600 13px/1.5 Montserrat,system-ui,sans-serif;color:#8a8074;padding:0 24px}'
    '.zgr-t a{color:#ffd23f}'
    '@keyframes zgrIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:none}}'
    '@keyframes zgrFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'
    '@keyframes zgrShine{0%{background-position:100% 0}55%,100%{background-position:0 0}}'
    '@keyframes zgrPulse{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}'
    '@media (prefers-reduced-motion:reduce){.zgr-lg,.zgr-lg::after,.zgr-glw{animation:none}}'
)

BOOT_JS = (
    "(function(){var Z=document.getElementById('boot');if(!Z)return;var K='egz113:'+location.pathname,first=1;"
    "try{first=!sessionStorage.getItem(K);sessionStorage.setItem(K,'1')}catch(e){}"
    "if(!first){Z.parentNode.removeChild(Z);window.zgrShow=window.zgrDone=function(){};return}"
    "var B=Z.querySelector('.zgr-bar i'),p=6,t=0,fin=0;function tick(){if(fin)return;p+=(92-p)*(p<60?.16:.07);B.style.width=p+'%'}"
    "window.zgrShow=function(){if(!Z.hidden&&t)return;fin=0;Z.classList.remove('zgr-out');Z.hidden=false;if(!t){tick();t=setInterval(tick,260);clearTimeout(Z._w);Z._w=setTimeout(function(){if(!fin&&!Z.hidden){var x=Z.querySelector('.zgr-t');x.innerHTML='Загрузка идёт дольше обычного. <a href=>Обновить</a>';x.hidden=false}},15000)}};"
    "window.zgrDone=function(){if(Z.hidden||fin)return;fin=1;clearInterval(t);t=0;B.style.width='100%';setTimeout(function(){Z.classList.add('zgr-out');setTimeout(function(){Z.hidden=true;Z.classList.remove('zgr-out')},460)},380)};"
    "Z.hidden=true;zgrShow();var t0=Date.now();function end(){setTimeout(zgrDone,Math.max(0,700-(Date.now()-t0)))}"
    "if(document.readyState==='complete')end();else addEventListener('load',end);setTimeout(zgrDone,6000)})();"
)


def main():
    if len(sys.argv) != 4 or sys.argv[1] not in CFG:
        print('СТОП: запуск python3 patch113.py <kontakty|eyrie|obuchenie> <вход> <выход>'); sys.exit(1)
    c = CFG[sys.argv[1]]
    s = open(sys.argv[2], encoding='utf-8').read()
    if MARK in s:
        print('СТОП: задание 113 уже стоит на этой странице'); sys.exit(2)
    if c['need'] not in s:
        print('СТОП: не нашёл на странице «%s» — страница не та или изменилась' % c['need']); sys.exit(3)
    if s.count('</head>') != 1:
        print('СТОП: </head> найден %d раз' % s.count('</head>')); sys.exit(4)
    m = re.search(r'<body[^>]*>', s)
    if not m:
        print('СТОП: нет <body>'); sys.exit(5)
    if 'id="boot"' in s:
        print('СТОП: на странице уже есть id="boot"'); sys.exit(6)

    head = (
        '<!-- %s: экран загрузки + золотая надпись (23.11.2026) -->'
        '<link rel="preload" as="image" href="%s"><link rel="preload" as="image" href="%s">'
        '<style id="%s">%s#boot{--zgr-img:url(%s);--zgr-ar:%s}%s</style>\n'
    ) % (MARK, c['boot'], c['head'], MARK, ZGR_CSS, c['boot'], c['ar'], c['css'])
    boot = (
        '\n<div class="zgr" id="boot" role="status" aria-label="Загрузка"><div class="zgr-glw"></div>'
        '<div class="zgr-lg"></div><div class="zgr-bar"><i></i></div><div class="zgr-t" hidden></div></div>'
        '<script>/* %s */%s</script>\n'
    ) % (MARK, BOOT_JS)

    s = s.replace('</head>', head + '</head>', 1)
    m = re.search(r'<body[^>]*>', s)
    s = s[:m.end()] + boot + s[m.end():]
    b = s.encode('utf-8')
    open(sys.argv[3], 'wb').write(b)
    print('ГОТОВО %s md5 %s байт %d' % (sys.argv[3], hashlib.md5(b).hexdigest(), len(b)))


main()
