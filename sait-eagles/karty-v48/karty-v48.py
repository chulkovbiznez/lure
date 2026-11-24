# KARTY v48 (24.11): кнопка «▶ Видео» рядом с «✦ Создать в LURE». Видео вылетает из кнопки на ~70% экрана,
# фон размыт; по окончании (или ✕ / тап по фону / Esc) видео «всасывается» обратно в кнопку.
import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'egVid48' in s: sys.exit('УЖЕ v48')
if 'egLure47' not in s: sys.exit('НЕТ v47')
CSS='''<style id="egVid48">
#vid48b{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:8px 13px;font:900 12px var(--f,Montserrat,sans-serif);color:#ffe08a;background:linear-gradient(180deg,#2a2012,#15100a);border:1px solid rgba(255,210,63,.6);cursor:pointer;animation:v48pulse 2.4s ease-in-out infinite}
#vid48b i{width:0;height:0;border-left:8px solid #ffd23f;border-top:5px solid transparent;border-bottom:5px solid transparent;display:inline-block}
@keyframes v48pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,210,63,.0)}50%{box-shadow:0 0 0 5px rgba(255,210,63,.18),0 0 18px rgba(255,190,40,.35)}}
#vid48{position:fixed;inset:0;z-index:99999;display:none}
#vid48.on{display:block}
#vid48 .bg{position:absolute;inset:0;background:rgba(5,4,6,.5);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0}
#vid48 .bx{position:fixed;border-radius:22px;overflow:hidden;background:#000;border:1.5px solid rgba(255,210,63,.7);box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 40px rgba(255,190,40,.25);transform-origin:0 0;will-change:transform,opacity}
#vid48 video{display:block;width:100%;height:100%;object-fit:cover;background:#000}
#vid48 .x{position:absolute;right:10px;top:10px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,210,63,.6);background:rgba(10,8,6,.7);color:#ffd23f;font:900 16px/34px sans-serif;text-align:center;cursor:pointer;z-index:2}
@media (prefers-reduced-motion:reduce){#vid48b{animation:none}}
</style>
'''
JS='''<script id="egVid48js">
(function(){try{
  var SRC='/karty-stili/obuchenie-oblozhka.mp4',POS='/karty-stili/obuchenie-oblozhka.jpg';
  var b=document.getElementById('vid48b');if(!b)return;
  var ov=document.createElement('div');ov.id='vid48';
  ov.innerHTML='<div class="bg"></div><div class="bx"><button type="button" class="x" aria-label="Закрыть">✕</button><video playsinline controls preload="none" poster="'+POS+'"></video></div>';
  document.body.appendChild(ov);
  var bg=ov.querySelector('.bg'),bx=ov.querySelector('.bx'),v=ov.querySelector('video'),busy=false,open=false;
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fin(){var H=Math.min(innerHeight*.72,innerHeight-40),W=H*9/16;if(W>innerWidth*.92){W=innerWidth*.92;H=W*16/9}return{l:(innerWidth-W)/2,t:(innerHeight-H)/2,w:W,h:H}}
  function from(f){var r=b.getBoundingClientRect();return 'translate('+(r.left-f.l)+'px,'+(r.top-f.t)+'px) scale('+(r.width/f.w)+','+(r.height/f.h)+')'}
  function show(){if(busy||open)return;busy=true;open=true;var f=fin();
    bx.style.left=f.l+'px';bx.style.top=f.t+'px';bx.style.width=f.w+'px';bx.style.height=f.h+'px';ov.classList.add('on');
    if(!v.src)v.src=SRC;try{v.currentTime=0}catch(e){}var p=v.play();if(p&&p.catch)p.catch(function(){});
    var d=RM?1:560;
    bg.animate([{opacity:0},{opacity:1}],{duration:d,fill:'forwards'});
    bx.animate([{transform:from(f),opacity:.3,borderRadius:'999px'},{transform:'translate(0,0) scale(1.04,1.04)',opacity:1,offset:.75,borderRadius:'22px'},{transform:'none',opacity:1,borderRadius:'22px'}],{duration:d,easing:'cubic-bezier(.2,.9,.25,1)',fill:'forwards'}).onfinish=function(){busy=false}}
  function hide(){if(busy||!open)return;busy=true;v.pause();var f=fin(),d=RM?1:520;
    bg.animate([{opacity:1},{opacity:0}],{duration:d,fill:'forwards'});
    bx.animate([{transform:'none',opacity:1,filter:'blur(0)'},{transform:'translate(0,0) scale(1.05,.96)',opacity:1,offset:.18},{transform:from(f)+' rotate(8deg)',opacity:0,filter:'blur(3px)',borderRadius:'999px'}],{duration:d,easing:'cubic-bezier(.55,0,.85,.35)',fill:'forwards'}).onfinish=function(){
      ov.classList.remove('on');open=false;busy=false;
      b.animate([{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:RM?1:420,easing:'ease-out'})}}
  b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show()});
  ov.querySelector('.x').addEventListener('click',function(e){e.stopPropagation();hide()});
  bg.addEventListener('click',hide);
  v.addEventListener('ended',hide);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&open){e.stopPropagation();hide()}},true);
}catch(e){console.warn('KARTY v48',e)}})();
</script>
'''
a='<span class="eg-lw"><button type="button" class="mini" id="nmLure">✦ Создать в LURE</button></span>'
if s.count(a)!=1: sys.exit('НЕТ кнопки LURE')
s=s.replace(a,a+'<button type="button" id="vid48b" aria-label="Видео-инструкция"><i></i>Видео</button>')
s=s.rstrip('\n')+'\n'+CSS+JS
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО v48 md5',hashlib.md5(s.encode('utf-8')).hexdigest())
