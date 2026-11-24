# KARTY v45: «Стили» v2 — 12 стилей Андрея × (Значок / Сцена), поле «Тема», превью-картинки /karty-stili/ic-NN.jpg и sc-NN.jpg (Андрей 24.11)
import sys,hashlib,re
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'KARTY v45' in s: sys.exit('УЖЕ СТОИТ v45 — ничего не делаю')
a=s.find('\n// KARTY v44:');b=s.find("console.warn('KARTY v44',e)}\n")
if a<0 or b<0: sys.exit('НЕ НАЙДЕН блок v44 — сначала нужен karty v44')
b+=len("console.warn('KARTY v44',e)}\n")
JS=r'''
// KARTY v45: окно «Стили» v2 — 12 стилей × Значок/Сцена, поле «Тема» (Андрей 24.11)
try{(function(){
const ST45=[
 ['Кино','cinematic hyper-realistic movie still, dramatic lighting, film grain, teal and orange color grade','linear-gradient(180deg,#0f3b4a 0 55%,#e07b2e 55%)'],
 ['Мультяшный','classic flat 2D TV cartoon style, thick black outlines, bright flat colors, simple shading','linear-gradient(135deg,#ffd84a,#4fb3ff)'],
 ['Масло','oil painting with thick visible brush strokes on canvas, rich colors','linear-gradient(135deg,#7a4a1e,#d9a441,#3b5f7a)'],
 ['Карандаш','graphite pencil sketch on white paper, hand-drawn lines and cross-hatching, no color','linear-gradient(135deg,#f4f1ea,#9c9890)'],
 ['Пластилин','handmade plasticine claymation, visible fingerprints in the clay, soft studio light','linear-gradient(135deg,#ff9a5a,#6fc3a0)'],
 ['Чёрно-белый','black and white high-contrast photograph, deep shadows, no color','linear-gradient(135deg,#eee,#111)'],
 ['Неон','glowing neon tubes in pink and cyan on a dark background, light glow and reflections','radial-gradient(circle,#ff5ad0 0 20%,#28e0ff 21% 34%,#120a2a 35%)'],
 ['Золото EAGLES','polished yellow gold sealed under thick clear liquid glass, amber reflections, pure black background, premium','radial-gradient(circle at 40% 35%,#fff3b0,#e9a23b 45%,#3a2608 75%,#0b0806)'],
 ['Аниме','Japanese anime illustration, clean cel shading, vivid colors','linear-gradient(135deg,#7ec8ff,#ff9ec4)'],
 ['Акварель','soft watercolor painting, visible paper texture, color blooms','radial-gradient(circle at 30% 30%,#9fd3ff,transparent 50%),radial-gradient(circle at 70% 65%,#ffb4a2,transparent 50%),#fbf7f0'],
 ['3D-мульт','glossy 3D animated movie render, bright colors, soft lighting','radial-gradient(circle at 40% 35%,#ffd9a0,#ff8a3d 50%,#6b2fd6 90%)'],
 ['Комикс','comic book pop art, halftone dots, bold ink lines, primary colors','radial-gradient(circle,#111 0 1.5px,transparent 2px) 0 0/8px 8px,#ffd23f']
];
const VAR45=[['Значок','твоя тема крупным планом'],['Сцена','твоя тема в целой сцене']];
const NN=i=>String(i+1).padStart(2,'0');
const css=document.createElement('style');css.textContent=`
#mbSt{width:100%;height:44px;border-radius:12px;border:1px solid rgba(255,210,63,.55);background:linear-gradient(180deg,#2a2012,#16110b);color:#ffd23f;font:800 14px/1 var(--f,Montserrat,sans-serif);cursor:pointer}
#st45{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.62)}
#st45[hidden]{display:none}
#st45 .s4{width:min(560px,100%);max-height:90vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#17120c,#0b0a0c);border-top:1px solid rgba(255,210,63,.35);border-radius:22px 22px 0 0;padding-bottom:env(safe-area-inset-bottom,0px);font-family:var(--f,Montserrat,sans-serif);color:#f4efe6}
#st45 .h4{padding:12px 16px 8px;display:flex;flex-direction:column;gap:9px}
#st45 .t4{display:flex;align-items:center;justify-content:space-between}
#st45 .t4 b{font:900 18px/1.2 inherit;color:#ffd23f}
#st45 .x4{width:34px;height:34px;border-radius:50%;border:1px solid #2a2622;background:#141217;color:#f4efe6;font-size:16px;cursor:pointer}
#st45 label{font:800 10px/1 inherit;letter-spacing:.14em;text-transform:uppercase;color:#a39a8c}
#st45 .tm{width:100%;height:42px;border-radius:12px;border:1px solid rgba(255,210,63,.4);background:#0a0907;color:#f4efe6;font:700 15px inherit;padding:0 12px}
#st45 .tm.bad{border-color:#e8321a}
#st45 .b4{overflow-y:auto;padding:4px 16px 18px;display:flex;flex-direction:column;gap:12px}
#st45 .g45{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#st45 .g45 button{display:flex;flex-direction:column;gap:6px;padding:6px;border-radius:14px;border:1px solid #2a2622;background:#141217;color:#f4efe6;font:800 11.5px/1.2 inherit;cursor:pointer;text-align:center}
#st45 .g45 button.on{border-color:#ffd23f;background:#231b10;color:#ffe08a}
#st45 .p45{display:block;width:100%;aspect-ratio:1/1;border-radius:10px;background-size:cover;background-position:center}
#st45 .vv{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#st45 .vv button{display:flex;flex-direction:column;gap:6px;padding:7px;border-radius:14px;border:1px solid #2a2622;background:#141217;color:#f4efe6;cursor:pointer;text-align:left;font:inherit}
#st45 .vv button.on{border-color:#ffd23f;background:#1d170f}
#st45 .vv b{font:800 14px/1.2 inherit}#st45 .vv small{color:#a39a8c;font-size:11.5px}
#st45 .sh{font:800 10px/1 inherit;letter-spacing:.14em;text-transform:uppercase;color:#ffd23f}
#st45 .go{width:100%;height:48px;border-radius:14px;border:0;background:linear-gradient(180deg,#ffe27a,#e9a23b);color:#1a1206;font:900 15px/1 inherit;cursor:pointer}
#st45 .go:disabled{opacity:.4}`;
document.head.appendChild(css);
const old=document.getElementById('st44');if(old)old.remove();
const ov=document.createElement('div');ov.id='st45';ov.hidden=true;ov.innerHTML='<div class="s4" role="dialog" aria-modal="true"><div class="h4"><div class="t4"><b>🎨 Стили</b><button type="button" class="x4" aria-label="Закрыть">✕</button></div><label for="tm45">Тема — про что картинка</label><input id="tm45" class="tm" maxlength="80" autocomplete="off" placeholder="Например: блюда, бизнес, спортзал"></div><div class="b4"></div></div>';
document.body.appendChild(ov);
let mode=null,goFn=null,cur=-1,vr=-1;
let btn=document.getElementById('mbSt');
if(!btn){btn=document.createElement('button');btn.type='button';btn.id='mbSt';const mbA=document.querySelector('#myBox .mb-a');if(mbA)mbA.parentNode.insertBefore(btn,mbA)}
const nb=btn.cloneNode(false);btn.replaceWith(nb);btn=nb;btn.textContent='🎨 Стили — выбрать готовый стиль';btn.hidden=true;
const tm=()=>ov.querySelector('#tm45');
const bg=(k,i)=>`url('/karty-stili/${k}-${NN(i)}.jpg'),${ST45[i][2]}`;
function PR(i,v,T){const st=ST45[i][1];
  if(i===7&&v===0)return mode==='cv'?CVPROMPT(T):ICPROMPT(T);
  const subj=`The subject is: "${T}" (the words may be Russian — understand their meaning and show exactly that subject).`;
  if(v===0)return `${subj}\nClose-up of this subject as one clear central object, filling about 60% of a square frame, simple uncluttered background, icon-like composition.\nStyle: ${st}.\nSquare 1:1. No text, no letters, no logos, no watermark.`;
  return `${subj}\nA full scene that shows this subject in action in its natural setting, with environment, depth and atmosphere; the subject stays the clear main focus.\nStyle: ${st}.\nSquare 1:1. No text, no letters, no logos, no watermark.`}
function draw(){
  let h='<div class="sh">1. Стиль</div><div class="g45">'+ST45.map((s,i)=>`<button type="button" data-s="${i}" class="${i===cur?'on':''}"><span class="p45" style="background-image:${bg('ic',i)}"></span>${s[0]}</button>`).join('')+'</div>';
  if(cur>=0){h+='<div class="sh">2. Что сделать</div><div class="vv">'+VAR45.map((v,j)=>`<button type="button" data-v="${j}" class="${j===vr?'on':''}"><span class="p45" style="background-image:${bg(j?'sc':'ic',cur)}"></span><b>${v[0]}</b><small>${v[1]}</small></button>`).join('')+'</div>';
    h+=`<button type="button" class="go" data-go="1" ${vr<0?'disabled':''}>✦ Открыть в LURE</button>`}
  const b4=ov.querySelector('.b4');const y=b4.scrollTop;b4.innerHTML=h;b4.scrollTop=y}
ov.addEventListener('click',e=>{
  if(e.target===ov||e.target.closest('.x4')){ov.hidden=true;return}
  const c=e.target.closest('[data-s]');if(c){cur=+c.dataset.s;vr=-1;draw();const g=ov.querySelector('.vv');if(g)g.scrollIntoView({block:'nearest',behavior:'smooth'});return}
  const v=e.target.closest('[data-v]');if(v){vr=+v.dataset.v;draw();const g=ov.querySelector('.go');if(g)g.scrollIntoView({block:'nearest',behavior:'smooth'});return}
  if(e.target.closest('[data-go]')&&cur>=0&&vr>=0&&goFn){const T=tm().value.trim().slice(0,80);
    if(!T){tm().classList.add('bad');tm().focus();toast('Напиши тему: про что картинка');return}
    try{LS('karty-st45',String(cur))}catch(_){}ov.hidden=true;goFn(PR(cur,vr,T))}});
ov.querySelector('#tm45').addEventListener('input',e=>e.target.classList.remove('bad'));
btn.onclick=()=>{const T=$('mbIn').value.trim()||(mode==='cv'?$('nmName').value.trim():nm.value.trim());tm().value=T.slice(0,80);tm().classList.remove('bad');
  cur=-1;vr=-1;try{const k=+LS('karty-st45');if(LS('karty-st45')!=null&&k>=0&&k<ST45.length)cur=k}catch(_){}draw();ov.hidden=false;if(!T)setTimeout(()=>tm().focus(),60)};
const _box=box;
box=function(t,p,pr,go,fn,inp){_box(t,p,pr,go,fn,inp);
  mode=t==='Обложка в LURE'?'cv':t==='Создать иконку в LURE'?'ic':null;
  goFn=mode==='cv'?(x=>toLure(x,{t:'cv',ed:nmEdit,name:$('nmName').value,cv:nmCv,man:nmCvMan})):mode==='ic'?(x=>toLure(x,retState())):null;
  btn.hidden=!mode};
})()}catch(e){console.warn('KARTY v45',e)}
'''
s=s[:a]+JS+s[b:]
assert s.count('KARTY v45')==2 and 'KARTY v44' not in s
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО karty v45 md5',hashlib.md5(s.encode('utf-8')).hexdigest())
