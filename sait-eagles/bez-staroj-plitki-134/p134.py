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
#eyeVB .evb-dust{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
html.egd #loggedInBlock #eyeVB{grid-column:span 6;height:280px!important;width:100%!important;max-width:none!important;box-sizing:border-box}
html.egd #loggedInBlock #openMap{height:280px!important}
/* старая плитка «EYE мессенджер» дублирует кнопку EYE — прячем (элемент остаётся для скриптов), Копилка на всю ширину */
.egp .cbrow #openChat,html.pfn .egp .cbrow #openChat{display:none!important}
.egp .cbrow,html.pfn .egp .cbrow{grid-template-columns:1fr!important}
html.egd #loggedInBlock .cbrow{height:auto}
.egp .cbrow #openKop,html.pfn .egp .cbrow #openKop{flex-direction:row!important;align-items:center!important;gap:16px!important;padding:12px 18px 12px 12px!important;min-height:0!important;height:auto!important}
.egp .cbrow #openKop .cb-vid,html.pfn .egp .cbrow #openKop .cb-vid{width:86px!important;height:86px!important;min-height:0!important;flex:none!important;margin:0!important}
.egp .cbrow #openKop .cb-vid img.pfn-art{width:100%!important;height:100%!important;object-fit:contain!important}
.egp .cbrow #openKop,html.pfn .egp .cbrow #openKop{justify-content:center!important}
.egp .cbrow #openKop .cb-t{flex:none!important;text-align:left}
.egp .cbrow #openKop .cb-arr{display:none!important}
@media (prefers-reduced-motion:reduce){#eyeVB:active{transform:none}}</style>'''
TILE='''

      <a id="eyeVB" href="/chat.html" aria-label="Открыть EYE, видеозвонки"><video muted loop playsinline preload="metadata" poster="/eye-knopka-poster.jpg" src="/eye-knopka.mp4"></video><canvas class="evb-dust" aria-hidden="true"></canvas><img class="evb-logo" src="/eye-knopka-logo.webp" alt=""><span class="evb-cap">Звонки до 4 человек</span></a>
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
JS=r"""<script id="eyeDust133">/* золотые частицы на кнопке EYE, как в шапке профиля; телефоны не перекрывают */
(function(){var a=document.getElementById('eyeVB'),cv=a&&a.querySelector('.evb-dust');if(!cv||!cv.getContext)return;var cx=cv.getContext('2d');
var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,dpr=Math.min(2,window.devicePixelRatio||1),W=0,H=0,P=[],seen=true;
function rs(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);}rs();window.addEventListener('resize',rs);
function ph(x,y){return x>.41&&x<.98&&y>.09&&y<.91;}
for(var i=0;i<34;i++)P.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.4,s:Math.random()*.0016+.0005,a:Math.random()*6.28});
if('IntersectionObserver' in window)new IntersectionObserver(function(e){seen=e[0].isIntersecting;},{threshold:0}).observe(a);
function fr(){cx.clearRect(0,0,W,H);for(var i=0;i<P.length;i++){var p=P[i];p.y-=p.s;p.a+=.02;if(p.y<0){p.y=1;p.x=Math.random();}
var x=p.x+Math.sin(p.a)*6/(W||1);if(ph(x,p.y))continue;cx.beginPath();cx.arc(x*W,p.y*H,p.r,0,7);cx.fillStyle='rgba(255,214,110,'+(.35+.35*Math.sin(p.a))+')';cx.fill();}
if(!red&&!document.hidden&&seen)requestAnimationFrame(fr);else setTimeout(function(){requestAnimationFrame(fr);},700);}fr();})();</script>"""
b=s.rfind('</body>'); assert b>0
s=s[:b]+JS+'\n'+s[b:]
open(dst,'w',encoding='utf-8').write(s)
