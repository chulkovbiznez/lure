# KARTY v47 (24.11): кнопка «✦ Создать в LURE» как «Вывести» (задание 115): золотая заливка, перелив, искры по контуру.
import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'egLure47' in s: sys.exit('УЖЕ v47')
CSS='''<style id="egLure47">
.eg-lw{position:relative;display:inline-flex;flex:none}
#nmLure{position:relative;overflow:hidden;border:0!important;border-radius:999px;padding:9px 15px;font-size:12px;font-weight:900;color:#1a1205!important;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);box-shadow:0 6px 18px rgba(255,190,40,.28),inset 0 1px 0 rgba(255,255,255,.6)}
#nmLure:not(.lk)::after{content:"";position:absolute;top:-20%;bottom:-20%;width:38%;left:-60%;transform:skewX(-20deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0));animation:egSweep47 2.6s ease-in-out infinite}
@keyframes egSweep47{0%{left:-60%}55%,100%{left:130%}}
.eg-lw canvas{position:absolute;left:-14px;top:-14px;width:calc(100% + 28px);height:calc(100% + 28px);pointer-events:none}
@media (prefers-reduced-motion:reduce){#nmLure::after{animation:none!important;display:none}}
</style>
'''
JS='''<script id="egLure47js">
(function(){try{
  var b=document.getElementById('nmLure');if(!b)return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var w=b.parentNode,cv=document.createElement('canvas');w.appendChild(cv);
  var ctx=cv.getContext('2d'),W=0,H=0,parts=[],t0=performance.now();
  function size(){var d=window.devicePixelRatio||1,nw=w.offsetWidth+28,nh=w.offsetHeight+28;if(nw===W&&nh===H)return;W=nw;H=nh;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
  function per(u){var x0=14,y0=14,ww=W-28,h=H-28,r=h/2,s=ww-2*r,a=Math.PI*r,L=2*s+2*a,d=((u%1)+1)%1*L;
    if(d<s)return[x0+r+d,y0];d-=s;if(d<a){var q=-Math.PI/2+d/r;return[x0+ww-r+r*Math.cos(q),y0+r+r*Math.sin(q)]}
    d-=a;if(d<s)return[x0+ww-r-d,y0+h];d-=s;var z=Math.PI/2+d/r;return[x0+r+r*Math.cos(z),y0+r+r*Math.sin(z)]}
  function fr(now){requestAnimationFrame(fr);
    if(!b.offsetParent||b.classList.contains('lk')){if(W){ctx.clearRect(0,0,W,H)}parts=[];return}
    size();if(W<40)return;var T=(now-t0)/1000;ctx.clearRect(0,0,W,H);
    for(var j=0;j<2;j++){var u=T*.28+j/2,p=per(u);
      for(var q=0;q<16;q++){var pp=per(u-q*.007);ctx.fillStyle='rgba(255,'+(214-q*6)+','+(110-q*6)+','+((1-q/16)*.9).toFixed(3)+')';ctx.beginPath();ctx.arc(pp[0],pp[1],2.4*(1-q/18),0,7);ctx.fill()}
      if(Math.random()<.4)parts.push({x:p[0],y:p[1],vx:(Math.random()-.5)*44,vy:(Math.random()-.5)*44,l:1});
      ctx.fillStyle='rgba(255,252,230,.95)';ctx.beginPath();ctx.arc(p[0],p[1],2,0,7);ctx.fill()}
    parts=parts.filter(function(s){s.x+=s.vx/60;s.y+=s.vy/60;s.l-=.04;if(s.l<=0)return false;ctx.fillStyle='rgba(255,214,110,'+(s.l*.8).toFixed(3)+')';ctx.fillRect(s.x-.8,s.y-.8,1.6,1.6);return true})}
  requestAnimationFrame(fr);
}catch(e){console.warn('KARTY v47',e)}})();
</script>
'''
def rep(a,b):
    global s
    n=s.count(a)
    if n!=1: sys.exit(f'НЕ НАЙДЕНО ({n}): {a[:60]}')
    s=s.replace(a,b)
rep('<button type="button" class="mini" id="nmLure">✦ Создать в LURE</button>','<span class="eg-lw"><button type="button" class="mini" id="nmLure">✦ Создать в LURE</button></span>')
s=s.rstrip('\n')+'\n'+CSS+JS
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО v47 md5',hashlib.md5(s.encode('utf-8')).hexdigest())
