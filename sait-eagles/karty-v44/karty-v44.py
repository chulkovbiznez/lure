# KARTY v44: окно «Стили» в окнах «Обложка в LURE» и «Создать иконку в LURE» (Андрей «Стили ДА» 23.11)
import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'KARTY v44' in s: sys.exit('УЖЕ СТОИТ v44 — ничего не делаю')
for need in ['function box(t,p,pr,go,fn,inp)','async function toLure(pr,st)','function retState()','const CVPROMPT=','const ICPROMPT=',"id=\"myBox\""]:
    if need not in s: sys.exit('НЕ НАЙДЕНО: '+need)
anchor='})();\n</script>'
k=s.rfind(anchor)
if k<0 or s.count('</script>')<2: sys.exit('НЕ НАЙДЕН КОНЕЦ СКРИПТА')
JS=r'''
// KARTY v44: окно «Стили» (8 стилей × 3 варианта → LURE), Андрей 23.11
try{(function(){
const ST44=[
 {n:'Золото EAGLES',sw:'radial-gradient(circle at 40% 35%,#fff3b0,#e9a23b 45%,#3a2608 75%,#0b0806)',v:[['Значок','символ по центру',null],['Сцена','маленький мир под стеклом','A tiny golden diorama about "{T}" inside a glass dome, warm amber light, black background, cinematic macro photo, shallow depth of field, square 1:1, no text'],['Обложка','крупно, с бликами','Luxury cover image about "{T}": golden eagle wing and gold particles flowing over black glass, gold rim light, high contrast, square 1:1, no text']]},
 {n:'Бумага',sw:'linear-gradient(160deg,#f7efe0 0 30%,#e7c99a 30% 55%,#c98d4e 55% 78%,#8a5a2b 78%)',v:[['Значок','бумажный символ','A layered paper-cut symbol for "{T}", 5 layers of warm craft paper, soft shadows between layers, cream background, top light, square 1:1, no text'],['Сцена','бумажный театр','A paper theatre scene about "{T}", cut-out layers in sand, terracotta and gold tones, soft volumetric light, handmade feel, square 1:1, no text'],['Обложка','оригами','Origami composition about "{T}", folded golden and white paper, clean light background, gentle shadows, square 1:1, no text']]},
 {n:'Неон',sw:'radial-gradient(circle,#ff5ad0 0 18%,transparent 19%),radial-gradient(circle,#28e0ff 0 34%,#120a2a 35%)',v:[['Значок','неоновый знак','A glowing neon sign icon for "{T}", pink and cyan tubes on a dark brick wall, light glow and reflections, square 1:1, no text'],['Сцена','ночной город','Night city scene about "{T}", wet street with neon reflections, purple and cyan light, cinematic, square 1:1, no text'],['Обложка','синтвейв','Synthwave poster about "{T}", sunset grid horizon, chrome shapes, magenta and cyan, square 1:1, no text']]},
 {n:'Акварель',sw:'radial-gradient(circle at 30% 30%,#9fd3ff,transparent 45%),radial-gradient(circle at 70% 65%,#ffb4a2,transparent 45%),#fbf7f0',v:[['Значок','акварельный символ','A watercolor icon for "{T}", soft pigment blooms, visible paper texture, white background, square 1:1, no text'],['Сцена','иллюстрация','Gentle watercolor illustration about "{T}", pastel blue and peach, loose brush strokes, square 1:1, no text'],['Обложка','открытка','Watercolor postcard about "{T}" with a thin gold ink outline, airy composition, square 1:1, no text']]},
 {n:'3D-игрушка',sw:'radial-gradient(circle at 40% 35%,#ffd9a0,#ff8a3d 50%,#6b2fd6 90%)',v:[['Значок','3D-значок','A cute glossy 3D icon for "{T}", soft rounded shapes, bright orange and violet, studio light, plain pastel background, square 1:1, no text'],['Сцена','мини-мир','Isometric 3D mini world about "{T}", tiny figures, soft shadows, toy-like materials, square 1:1, no text'],['Обложка','персонаж','A friendly 3D character doing "{T}", Pixar-like lighting, bright colors, square 1:1, no text']]},
 {n:'Фото',sw:'linear-gradient(180deg,#2b3a4a 0 45%,#c9a67a 45% 60%,#5b4a3a 60%)',v:[['Значок','предмет крупно','A realistic product-style photo of one object that represents "{T}", soft daylight, clean background, shallow depth of field, square 1:1, no text'],['Сцена','жизнь','Realistic lifestyle photo about "{T}", natural window light, warm tones, 35mm, square 1:1, no text'],['Обложка','вдохновение','Inspiring photo about "{T}": a person on a mountain top at golden hour, back view, epic scale, square 1:1, no text']]},
 {n:'Кино',sw:'linear-gradient(180deg,#081218 0 20%,#0f3b4a 20% 55%,#e07b2e 55% 80%,#081218 80%)',v:[['Значок','символ в кадре','Cinematic shot of a symbol for "{T}" lit by a single warm spotlight in smoke, teal and orange grade, square 1:1, no text'],['Сцена','кадр фильма','Movie still about "{T}", dramatic lighting, anamorphic lens flare, teal and orange grade, square 1:1, no text'],['Обложка','постер','Epic movie poster art about "{T}", hero silhouette, sky and light rays, square 1:1, no text']]},
 {n:'Минимализм',sw:'radial-gradient(circle,#ffd23f 0 2px,transparent 3px) 0 0/12px 12px,#0c0c0d',v:[['Значок','линия','A minimal single-line icon for "{T}", thin gold line on black, lots of empty space, square 1:1, no text'],['Сцена','плоская графика','Flat minimal illustration about "{T}", 3 colors only, geometric shapes, square 1:1, no text'],['Обложка','геометрия','Minimal geometric composition about "{T}", circles and lines, black and gold, square 1:1, no text']]}
];
const css=document.createElement('style');css.textContent=`
#mbSt{width:100%;height:44px;border-radius:12px;border:1px solid rgba(255,210,63,.55);background:linear-gradient(180deg,#2a2012,#16110b);color:#ffd23f;font:800 14px/1 var(--f,Montserrat,sans-serif);cursor:pointer}
#st44{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.62)}
#st44[hidden]{display:none}
#st44 .s4{width:min(520px,100%);max-height:88vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#17120c,#0b0a0c);border-top:1px solid rgba(255,210,63,.35);border-radius:22px 22px 0 0;padding-bottom:env(safe-area-inset-bottom,0px);font-family:var(--f,Montserrat,sans-serif);color:#f4efe6}
#st44 .h4{padding:12px 16px 8px;display:flex;flex-direction:column;gap:9px}
#st44 .t4{display:flex;align-items:center;justify-content:space-between}
#st44 .t4 b{font:900 18px/1.2 inherit;color:#ffd23f}
#st44 .x4{width:34px;height:34px;border-radius:50%;border:1px solid #2a2622;background:#141217;color:#f4efe6;font-size:16px;cursor:pointer}
#st44 .tp4{font-size:12.5px;color:#a39a8c}#st44 .tp4 b{color:#f4efe6}
#st44 .c4{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:3px}#st44 .c4::-webkit-scrollbar{display:none}
#st44 .c4 button{flex:0 0 auto;display:flex;align-items:center;gap:8px;height:38px;padding:0 12px 0 5px;border-radius:19px;border:1px solid #2a2622;background:#141217;color:#f4efe6;font:800 12px/1 inherit;cursor:pointer;white-space:nowrap}
#st44 .c4 i{width:28px;height:28px;border-radius:50%}
#st44 .c4 button.on{border-color:#ffd23f;background:#231b10;color:#ffe08a}
#st44 .b4{overflow-y:auto;padding:4px 16px 18px;display:flex;flex-direction:column;gap:10px}
#st44 .v4{display:grid;grid-template-columns:58px 1fr;gap:12px;align-items:center;padding:9px;border-radius:15px;border:1px solid #2a2622;background:#141217;cursor:pointer;text-align:left;color:inherit;font:inherit;width:100%}
#st44 .v4 i{width:58px;height:58px;border-radius:13px}
#st44 .v4 b{display:block;font:800 14px/1.25 inherit}#st44 .v4 small{display:block;color:#a39a8c;font-size:12px;margin-top:2px}
#st44 .v4.on{border-color:#ffd23f;background:#1d170f}
#st44 .g4{width:100%;height:46px;border-radius:14px;border:0;background:linear-gradient(180deg,#ffe27a,#e9a23b);color:#1a1206;font:900 14px/1 inherit;cursor:pointer}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='st44';ov.hidden=true;ov.innerHTML='<div class="s4" role="dialog" aria-modal="true"><div class="h4"><div class="t4"><b>🎨 Стили</b><button type="button" class="x4" aria-label="Закрыть">✕</button></div><div class="tp4">Тема: <b></b></div><div class="c4"></div></div><div class="b4"></div></div>';
document.body.appendChild(ov);
let mode44=null,go44=null,cur44=0,sel44=-1;
const btn=document.createElement('button');btn.type='button';btn.id='mbSt';btn.textContent='🎨 Стили — выбрать готовый стиль';btn.hidden=true;
const mbA=document.querySelector('#myBox .mb-a');if(mbA)mbA.parentNode.insertBefore(btn,mbA);
const T44=()=>($('mbIn').value.trim().slice(0,80))||(mode44==='cv'?($('nmName').value.trim()||'мои цели'):(nm.value.trim()||'мои дела'));
const P44=i=>{const v=ST44[cur44].v[i];if(!v[2])return mode44==='cv'?CVPROMPT(T44()):ICPROMPT(T44());return v[2].split('{T}').join(T44())};
function draw44(){
  ov.querySelector('.tp4 b').textContent=T44();
  ov.querySelector('.c4').innerHTML=ST44.map((s,i)=>'<button type="button" data-s="'+i+'" class="'+(i===cur44?'on':'')+'"><i style="background:'+s.sw+'"></i>'+s.n+'</button>').join('');
  const s=ST44[cur44];let h='';
  s.v.forEach((v,i)=>{h+='<button type="button" class="v4'+(i===sel44?' on':'')+'" data-v="'+i+'"><i style="background:'+s.sw+'"></i><div><b>'+v[0]+'</b><small>'+v[1]+'</small></div></button>';
    if(i===sel44)h+='<button type="button" class="g4" data-go="1">✦ Открыть в LURE</button>'});
  ov.querySelector('.b4').innerHTML=h}
ov.addEventListener('click',e=>{
  if(e.target===ov||e.target.closest('.x4')){ov.hidden=true;return}
  const c=e.target.closest('[data-s]');if(c){cur44=+c.dataset.s;sel44=-1;try{LS('karty-st44',String(cur44))}catch(_){}draw44();return}
  const v=e.target.closest('[data-v]');if(v){const i=+v.dataset.v;sel44=sel44===i?-1:i;draw44();return}
  if(e.target.closest('[data-go]')&&sel44>=0&&go44){const pr=P44(sel44);ov.hidden=true;go44(pr)}});
btn.onclick=()=>{try{const k=+LS('karty-st44');if(k>=0&&k<ST44.length)cur44=k}catch(_){}sel44=-1;draw44();ov.hidden=false};
const _box44=box;
box=function(t,p,pr,go,fn,inp){_box44(t,p,pr,go,fn,inp);
  mode44=t==='Обложка в LURE'?'cv':t==='Создать иконку в LURE'?'ic':null;
  go44=mode44==='cv'?(pr2=>toLure(pr2,{t:'cv',ed:nmEdit,name:$('nmName').value,cv:nmCv,man:nmCvMan})):mode44==='ic'?(pr2=>toLure(pr2,retState())):null;
  btn.hidden=!mode44};
})()}catch(e){console.warn('KARTY v44',e)}
'''
s=s[:k]+JS+s[k:]
assert s.count('KARTY v44')==2
open(dst,'w',encoding='utf-8').write(s)
print('ГОТОВО karty v44 md5',hashlib.md5(s.encode('utf-8')).hexdigest())
