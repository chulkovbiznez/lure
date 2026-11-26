import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'eyeVB' not in s
CSS='''<style id="eyeVB133">#eyeVB{position:relative;display:block;aspect-ratio:720/520;width:100%;margin:12px 0;border-radius:22px;overflow:hidden;border:1.5px solid #8a6a2a;text-decoration:none;color:#f3ede2;isolation:isolate;-webkit-tap-highlight-color:transparent;background:#000;box-shadow:0 0 0 1px rgba(255,210,63,.08),0 12px 30px rgba(233,162,59,.18);transition:transform .15s ease}
#eyeVB video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
#eyeVB::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.7) 28%,rgba(0,0,0,.1) 42%,rgba(0,0,0,0) 48%)}
#eyeVB .evb-logo{position:absolute;left:3%;top:50%;transform:translateY(-58%);width:43%;height:auto;max-width:none;margin:0;filter:drop-shadow(0 4px 14px rgba(0,0,0,.65))}
#eyeVB .evb-cap{position:absolute;left:3%;width:43%;bottom:22px;text-align:center;font-size:11px;font-weight:600;color:#e7dfd1;white-space:nowrap;line-height:1.2}
#eyeVB:focus-visible{outline:2px solid #ffd23f;outline-offset:3px}#eyeVB:active{transform:scale(.985)}
html.pfn .egp #eyeVB{margin:0}
html.egd #loggedInBlock #eyeVB{grid-column:span 6;height:280px!important;width:100%!important;max-width:none!important;box-sizing:border-box}
html.egd #loggedInBlock #openMap{height:280px!important}
@media (prefers-reduced-motion:reduce){#eyeVB:active{transform:none}}</style>'''
TILE='''

      <a id="eyeVB" href="/chat.html" aria-label="Открыть EYE, видеозвонки"><video muted loop playsinline preload="metadata" poster="/eye-knopka-poster.jpg" src="/eye-knopka.mp4"></video><img class="evb-logo" src="/eye-knopka-logo.webp" alt=""><span class="evb-cap">Звонки до 4 человек</span></a>
'''
# CSS в head, после pfnLvb
i=s.find('<style id="pfnLvb">'); j=s.find('</style>',i)+8; assert i>0
s=s[:j]+'\n'+CSS+s[j:]
# переставить: Карты, EYE, LURE, Контакты
k=s.find('<a id="kontaktyVB"'); assert k>0
m0=s.find('<button class="mapbtn pfn-kb" id="openMap"'); assert m0>k
m1=s.find('</button>',m0)+9
mapb=s[m0:m1]
s=s[:m0].rstrip()+'\n'+s[m1:]   # убрать Карты со старого места
lu=s.find('<a id="lureVB"'); lend=s.find('</a>',lu)+4
lure=s[lu:lend]; s=s[:lu].rstrip()+'\n'+s[lend:]
k=s.find('<a id="kontaktyVB"')
s=s[:k]+mapb+TILE+'\n      '+lure+'\n\n      '+s[k:]
# видео играет, только когда кнопку видно
a="try{ vid($('lureVB')); }catch(e){}"; assert s.count(a)==1
s=s.replace(a,a+"\n  try{ vid($('eyeVB')); }catch(e){}")
open(dst,'w',encoding='utf-8').write(s)
