# -*- coding: utf-8 -*-
"""Карты EAGLES v40 (18.11.2026, просьба Андрея, задание 82).
1) Своя картинка для иконки острова/дела и для обложки карты: сначала окно кадра 1:1 (квадрат закреплён,
   по умолчанию картинка целиком, ничего не обрезано; пальцем можно сдвинуть и увеличить). Иконка сохраняется квадратной.
   Своё фото карты на карточке колоды стоит квадратом во всю ширину в верхней части карточки.
2) Под главным островом крупно название карты (без слова «Карта»). Шапка: вместо названия кнопки «Сегодня N» и «Со сроком M»
   (по всем картам); нажал — список дел, нажал дело — Карты открывают его. Ссылка снаружи: karty.html#delo=<карта>.<путь>.
3) «В LURE» / «Создать в LURE»: LURE открывается в этой же вкладке с формата 1:1 и кнопкой «Вернуться в карты».
   Перед уходом Карты запоминают, где ты был (карта, остров, что вписано в окне). По возвращении из LURE
   открывается то же окно на том же острове и кнопка «Загрузить картинку» (выбор файла с телефона).
Работает и на karty.html до задания 80, и после него (звук тапа). Запуск: python3 karty-v40.py ВХОД.html ВЫХОД.html
"""
import sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
if 'KARTY v40' in s:
    print('СТОП: v40 уже стоит'); sys.exit(1)
def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    if n != cnt:
        print('СТОП: якорь найден', n, 'раз:', a[:90]); sys.exit(1)
    s = s.replace(a, b)

# ---------- CSS
CSS = r'''
/* KARTY v40 (18.11.2026): кадр 1:1, подпись главного острова, возврат из LURE */
.mc-cov.sq{height:auto;aspect-ratio:1/1;background:#0d0b08}
.mc-cov.sq img.ph{width:100%;height:100%;object-fit:cover}
.nm-cov .pvw{width:64px;height:64px}
.lab.rootl{max-width:230px;pointer-events:none}
.lab.rootl b{font:900 17px/1.15 var(--f);color:var(--gold);letter-spacing:.01em;-webkit-line-clamp:2;text-shadow:0 2px 10px rgba(0,0,0,.85),0 0 18px rgba(255,170,40,.25)}
/* шапка Карт: только «Сегодня» и «Со сроком» (Андрей 18.11) */
.top .eyebrow,#crumb{display:none}
.demo:empty{display:none}
.dlc{display:flex;gap:6px;flex-wrap:nowrap;pointer-events:auto}
.top .crow{padding-right:92px}
.dlc button{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 9px 0 11px;white-space:nowrap;border-radius:99px;border:1px solid rgba(255,210,63,.35);background:rgba(20,16,10,.88);color:var(--fg);font:800 12.5px/1 var(--f);cursor:pointer}
.dlc button b{min-width:21px;height:21px;padding:0 6px;border-radius:99px;background:#3a3226;color:#fff;font:900 12px/21px var(--f);text-align:center;box-sizing:border-box}
.dlc button.hot b{background:var(--red)}
.dlc button.due b{background:#c98a1e;color:#1a1206}
.dl{position:fixed;inset:0;z-index:55;background:rgba(5,5,5,.95);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;flex-direction:column;padding:calc(14px + env(safe-area-inset-top,0px)) 14px 14px}
.dl[hidden]{display:none}
.dl-h{display:flex;gap:8px;align-items:center;margin-bottom:12px}
.dl-h .dlc{flex:1;flex-wrap:wrap}
.dl-h .dlc button[aria-pressed="true"]{border-color:var(--gold);background:#2a2216;color:var(--gold)}
.dl-x{border:1px solid rgba(255,255,255,.14);background:none;color:var(--fg);border-radius:12px;padding:9px 13px;font:700 13px var(--f);cursor:pointer}
.dl-l{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px}
.dl-l .sr-row em{display:block;font:800 11px/1.3 var(--f);font-style:normal;margin-top:3px;color:#f2c25a}
.dl-l .sr-row em.late{color:#ff7a66}
.dl-l .sr-row em.fut{color:#9cc7ff}
.crp{position:fixed;inset:0;z-index:70;background:#070605;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:calc(16px + env(safe-area-inset-top,0px)) 16px calc(16px + env(safe-area-inset-bottom,0px))}
.crp[hidden]{display:none}
.crp-t{font:800 16px/1.25 var(--f);color:var(--fg);text-align:center}
.crp-t small{display:block;font:600 12px/1.35 var(--f);color:var(--mut);margin-top:4px}
.crp-f{position:relative;width:min(86vw,58vh,380px);aspect-ratio:1/1;border-radius:14px;overflow:hidden;touch-action:none;cursor:grab;
  background:#000;box-shadow:0 0 0 2px var(--gold),0 0 0 6px rgba(255,210,63,.16),0 20px 50px rgba(0,0,0,.7)}
.crp-f canvas{position:absolute;inset:0;width:100%;height:100%}
.crp-f i{position:absolute;pointer-events:none;border:0 solid rgba(255,255,255,.18)}
.crp-f i.v{top:0;bottom:0;left:33.33%;right:33.33%;border-width:0 1px}
.crp-f i.h{left:0;right:0;top:33.33%;bottom:33.33%;border-width:1px 0}
.crp-z{display:flex;gap:10px}
.crp-z button,.crp-a button{border:1px solid rgba(255,255,255,.14);background:#15120e;color:var(--fg);border-radius:12px;padding:10px 16px;font:700 14px var(--f);cursor:pointer}
.crp-a{display:flex;gap:10px;width:min(86vw,380px)}
.crp-a button{flex:1;padding:13px}
.crp-a button.pri{background:linear-gradient(180deg,#ffd23f,#ff8c28);color:#1a1206;border:0}
.ic.add.glow{animation:icGlow 1.1s ease-in-out 4}
@keyframes icGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,210,63,0)}50%{box-shadow:0 0 0 4px rgba(255,210,63,.55),0 0 22px rgba(255,170,40,.6)}}
'''
rep('\n</style>\n<!-- ZAGRUZKA', CSS + '</style>\n<!-- ZAGRUZKA') if s.count('\n</style>\n<!-- ZAGRUZKA') == 1 else None
if 'KARTY v40' not in s:
    i = s.find('</style>')
    s = s[:i] + CSS + s[i:]

# ---------- HTML окна кадра (рядом с окном «Мои иконки»)
rep('<div class="mybox" id="myBox" hidden>',
    '<div class="crp" id="crp" hidden role="dialog" aria-modal="true"><div class="crp-t" id="crpT">Кадр 1:1</div>'
    '<div class="crp-f" id="crpF"><canvas id="crpC" width="760" height="760"></canvas><i class="v"></i><i class="h"></i></div>'
    '<div class="crp-z"><button type="button" id="crpOut" aria-label="Меньше">−</button><button type="button" id="crpFit">Целиком</button><button type="button" id="crpIn" aria-label="Больше">+</button></div>'
    '<div class="crp-a"><button type="button" id="crpNo">Отмена</button><button type="button" class="pri" id="crpOk">Готово</button></div></div>\n'
    '<div class="mybox" id="myBox" hidden>')
rep('<section class="srch" id="srch" hidden aria-label="Поиск">',
    '<section class="dl" id="dl" hidden aria-label="Дела со сроком"><div class="dl-h"><div class="dlc" id="dlTabs"></div><button type="button" class="dl-x" id="dlX">Закрыть</button></div><div class="dl-l" id="dlList"></div></section>\n'
    '<section class="srch" id="srch" hidden aria-label="Поиск">')
# шапка: кнопки «Сегодня» и «Со сроком» рядом со стрелкой назад
rep('<div class="crumb" id="crumb">', '<div class="dlc" id="dlTop"></div><div class="crumb" id="crumb">')
rep('<div class="demo" id="svSt">Карты EAGLES</div>', '<div class="demo" id="svSt"></div>')
rep("e._t=setTimeout(()=>{e.textContent='Карты EAGLES';e.classList.remove('ok')},1800)}", "e._t=setTimeout(()=>{e.textContent='';e.classList.remove('ok')},1800)}")

# ---------- 1) кадр 1:1: общий модуль (после cutIcon)
CROP = r'''
// KARTY v40: окно кадра 1:1 — квадрат закреплён, сначала картинка целиком (ничего не обрезано), пальцем двигаем и увеличиваем
const CRP={im:null,s:1,s0:1,x:0,y:0,cb:null,P:new Map(),d0:0,k0:1};
function crpDraw(){const c=$('crpC'),g=c.getContext('2d'),S=c.width,im=CRP.im;g.fillStyle='#000';g.fillRect(0,0,S,S);if(!im)return;
  const w=im.width*CRP.s,h=im.height*CRP.s;g.imageSmoothingQuality='high';g.drawImage(im,S/2-w/2+CRP.x,S/2-h/2+CRP.y,w,h)}
function crpClamp(){const S=$('crpC').width,w=CRP.im.width*CRP.s,h=CRP.im.height*CRP.s,mx=Math.abs(w-S)/2,my=Math.abs(h-S)/2;
  CRP.x=Math.max(-mx,Math.min(mx,CRP.x));CRP.y=Math.max(-my,Math.min(my,CRP.y));if(w<=S)CRP.x=Math.max(-mx,Math.min(mx,CRP.x));crpDraw()}
function crpZoom(k){const mn=CRP.s0,mxs=CRP.s0*6;CRP.s=Math.max(mn,Math.min(mxs,CRP.s*k));crpClamp()}
function openCrop(file,title,sub,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{
    CRP.im=im;CRP.cb=cb;const S=$('crpC').width;CRP.s0=CRP.s=S/Math.max(im.width,im.height);CRP.x=CRP.y=0;
    $('crpT').innerHTML=esc(title)+'<small>'+esc(sub||'Квадрат 1:1. Сдвинь пальцем, «+» — крупнее. «Целиком» — вся картинка.')+'</small>';$('crp').hidden=false;crpDraw()};
    im.onerror=()=>toast('Это не картинка, выбери PNG или JPG');im.src=r.result};r.readAsDataURL(file)}
function crpOut(sz){const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d'),k=sz/$('crpC').width,im=CRP.im,w=im.width*CRP.s*k,h=im.height*CRP.s*k;
  g.fillStyle='#000';g.fillRect(0,0,sz,sz);g.imageSmoothingQuality='high';g.drawImage(im,sz/2-w/2+CRP.x*k,sz/2-h/2+CRP.y*k,w,h);return c}
(()=>{const F=$('crpF'),pos=e=>{const r=F.getBoundingClientRect();return{x:e.clientX,y:e.clientY,k:$('crpC').width/r.width}};
  F.addEventListener('pointerdown',e=>{F.setPointerCapture(e.pointerId);CRP.P.set(e.pointerId,pos(e));if(CRP.P.size===2){const [a,b]=[...CRP.P.values()];CRP.d0=Math.hypot(a.x-b.x,a.y-b.y);CRP.k0=CRP.s}});
  F.addEventListener('pointermove',e=>{const o=CRP.P.get(e.pointerId);if(!o||!CRP.im)return;const n=pos(e);
    if(CRP.P.size===2){CRP.P.set(e.pointerId,n);const [a,b]=[...CRP.P.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(CRP.d0>0){CRP.s=Math.max(CRP.s0,Math.min(CRP.s0*6,CRP.k0*d/CRP.d0));crpClamp()}return}
    CRP.x+=(n.x-o.x)*n.k;CRP.y+=(n.y-o.y)*n.k;CRP.P.set(e.pointerId,n);crpClamp()});
  const up=e=>{CRP.P.delete(e.pointerId)};F.addEventListener('pointerup',up);F.addEventListener('pointercancel',up);
  F.addEventListener('wheel',e=>{e.preventDefault();crpZoom(Math.exp(-e.deltaY*.0015))},{passive:false});
  $('crpIn').onclick=()=>crpZoom(1.25);$('crpOut').onclick=()=>crpZoom(1/1.25);$('crpFit').onclick=()=>{CRP.s=CRP.s0;CRP.x=CRP.y=0;crpDraw()};
  $('crpNo').onclick=()=>{$('crp').hidden=true;CRP.im=null};
  $('crpOk').onclick=()=>{const f=CRP.cb;$('crp').hidden=true;try{if(f)f()}finally{CRP.im=null}}})();
// иконка всегда квадрат: вырезанный предмет ставим по центру квадрата
function sqIcon(res){return new Promise(ok=>{const im=new Image();im.onload=()=>{const S=Math.max(im.width,im.height),c=document.createElement('canvas');c.width=c.height=S;
  c.getContext('2d').drawImage(im,(S-im.width)/2,(S-im.height)/2);let o=c.toDataURL('image/webp',.9);if(o.indexOf('data:image/webp')!==0)o=c.toDataURL('image/png');ok({src:o,a:1})};im.onerror=()=>ok(res);im.src=res.src})}
'''
rep("$('myFile').addEventListener('change',e=>{", CROP + "$('myFile').addEventListener('change',e=>{")

# «Своя PNG»: сначала кадр 1:1, потом вырезаем фон, иконка квадратная
rep("""  const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{let res=null;try{res=cutIcon(im)}catch(er){res=null}if(!res){toast('Не получилось прочитать картинку, попробуй другую');return}
    const c={id:Date.now().toString(36),n:(nm.value.trim()||'Моя '+(MYIC.length+1)).slice(0,24),img:res.src,a:Math.round(res.a*1000)/1000};
    MYIC.push(c);addMy(c);THUMB['my_'+c.id]=c.img;iconSel='my_'+c.id;iconManual=true;renderIcons();save();toast('Готово: иконка в «Моих иконках» ✓')};
    im.onerror=()=>toast('Это не картинка, выбери PNG');im.src=r.result};r.readAsDataURL(f)});""",
"""  openCrop(f,'Иконка · кадр 1:1','',async()=>{let res=null;try{res=cutIcon(crpOut(1024))}catch(er){res=null}if(!res){toast('Не получилось прочитать картинку, попробуй другую');return}
    res=await sqIcon(res);
    const c={id:Date.now().toString(36),n:(nm.value.trim()||'Моя '+(MYIC.length+1)).slice(0,24),img:res.src,a:1};
    MYIC.push(c);addMy(c);THUMB['my_'+c.id]=c.img;iconSel='my_'+c.id;iconManual=true;renderIcons();save();toast('Готово: иконка в «Моих иконках» ✓')})});""")

# «Своё фото» карты: кадр 1:1, квадрат 720
rep("""$('nmFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const W2=360,H2=504,cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const g=cv.getContext('2d');
  const sc=Math.max(W2/im.width,H2/im.height);g.drawImage(im,(W2-im.width*sc)/2,(H2-im.height*sc)/2,im.width*sc,im.height*sc);nmCover=cv.toDataURL('image/jpeg',.8);nmPrev();URL.revokeObjectURL(im.src)};im.src=URL.createObjectURL(f);e.target.value=''});""",
"""$('nmFile').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  openCrop(f,'Фото карты · кадр 1:1','Квадрат 1:1, встанет в верхней части карточки. Сдвинь пальцем, «+» — крупнее.',()=>{nmCover=crpOut(720).toDataURL('image/jpeg',.85);nmPrev()})});""")

# карточка колоды: своё фото — квадрат во всю ширину сверху
rep("""<div class="mc-cov${cv?' cvw':''}">${m.cover?""", """<div class="mc-cov${m.cover?' sq':cv?' cvw':''}">${m.cover?""")

# ---------- 2) подпись главного острова снизу
rep("function placeLabels(){\n", """function rootLab(){if(!root||!root.obj.visible||root.s<=.35||!root.sc){if(rootLab.el)rootLab.el.style.opacity=0;return null}
  let e=rootLab.el;if(!e){e=rootLab.el=document.createElement('div');e.className='lab rootl';labelsEl.appendChild(e)}
  const nm=(MAPS[curMap]&&MAPS[curMap].name)||root.d.name||'Карта',h=`<b>${esc(nm)}</b>`;
  if(e._h!==h){e._h=h;e.innerHTML=h;e._w=0}if(!e._w){e._w=e.offsetWidth;e._hh=e.offsetHeight}
  const sc=Math.max(.5,Math.min(1.1,root.sr/46)),w=e._w*sc,hh=e._hh*sc,c=root.sc,x=c.x-w/2,y=c.y+root.sr+10*sc;
  e.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;e.style.opacity=Math.min(1,(root.s-.35)*2.5);
  return{n:root,l:x-2,r:x+w+2,t:y-2,b:y+hh+2}}
function placeLabels(){
""")
rep("  const placed=[];const hit=(a,list,self)=>", "  const placed=[];{const rb=rootLab();if(rb)placed.push(rb)}const hit=(a,list,self)=>")
rep("function loadMap(i,fly=true){const m=MAPS[i];\n", "function loadMap(i,fly=true){const m=MAPS[i];if(rootLab.el)rootLab.el._h='';\n")

# ---------- 3) LURE в этой же вкладке + возврат на то же место
RET = r'''
// KARTY v40: уход в LURE и возврат на то же место (Андрей 18.11)
const RETK=()=>'karty-ret-'+MYID,LUREU='https://lure.eaglesteam.ru/';
async function toLure(pr,st){st.at=Date.now();try{LS(RETK(),JSON.stringify(st))}catch(e){}copyTxt(pr);toast('Открываю LURE…');
  clearTimeout(saveT);saveNow();for(let i=0;i<25&&busy;i++)await new Promise(r=>setTimeout(r,120));
  location.href=LUREU+'#img&ar=1:1&back=karty&p='+encodeURIComponent(pr)}
function retState(){const f={nm:nm.value,kind:kindSel,tt:tType,urg,due:$('due').value,dueT:$('dueT').value,desc:descEl.value,url:urlEl.value};
  return{t:'ic',map:curMap,to:addTo?ipath(MAPS[curMap].data,addTo.d):[],ed:editN?ipath(MAPS[curMap].data,editN.d):null,f}}
function nodeAt(path){const d=path&&ires(MAPS[curMap].data,path);return d?nodes.find(n=>n.d===d)||null:null}
function backFromLure(){let st=null;try{st=JSON.parse(LS(RETK())||'null')}catch(e){}
  const fromHash=/iz-lure/.test(location.hash);if(fromHash)history.replaceState(null,'',location.pathname);
  if(!st||!st.at)return;const age=Date.now()-st.at;if(!(fromHash?age<6*3600e3:age<20*60e3))return;LS(RETK(),null);
  if(st.t==='cv'){if(st.ed>=0&&MAPS[st.ed])openEditMap(st.ed);else{if(LIM&&MAPS.length>=LIM.maps)return;openNew()}
    $('nmName').value=st.name||$('nmName').value;if(st.cv!==undefined){nmCv=st.cv;nmCvMan=!!st.man}nmPrev();
    setTimeout(()=>box('Вернулся из LURE','Картинку скачал? Нажми «Загрузить фото» и выбери её. Потом поставь кадр 1:1.','','Загрузить фото',()=>$('nmFile').click()),350);return}
  if(!(st.map>=0&&MAPS[st.map]))return;openFromDeck(st.map);
  setTimeout(()=>{const p=nodeAt(st.to)||root;if(!p)return;if(p!==root)go(p);const ed=st.ed?nodeAt(st.ed):null;
    setTimeout(()=>{openSheet(p,ed);const f=st.f||{};nm.value=f.nm||nm.value;
      if(!ed){setKind(f.kind||'multi');if((f.kind||'multi')==='task')setTType(f.tt||'task');descEl.value=f.desc||'';urlEl.value=f.url||'';
        if(f.due){$('due').value=f.due;$('dueT').value=f.dueT||''}urg=+f.urg||0;document.querySelectorAll('#urg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.u===String(urg)));dueBtn()}
      renderIcons();const t=iconsEl.querySelector('[data-act="png"]');if(t)t.classList.add('glow');
      setTimeout(()=>box('Вернулся из LURE','Картинку скачал? Нажми «Загрузить картинку» и выбери её с телефона. Чёрный фон вырежется сам, иконка будет квадратной.','','Загрузить картинку',()=>$('myFile').click()),300)},p!==root?650:350)},950)}
'''
rep("$('mbIn').addEventListener('keydown',e=>{", RET + "$('mbIn').addEventListener('keydown',e=>{")

rep("""box('Создать иконку в LURE','Напиши, что должно быть на иконке. Откроется LURE → Изображения с готовым промптом в стиле Карт EAGLES: останется выбрать модель и нажать «Создать картинку».\\nПотом скачай картинку, вернись сюда и нажми «＋ Своя PNG». Чёрный фон вырежется сам.',
    '','Открыть LURE',()=>{const w=$('mbIn').value.trim().slice(0,80)||nm.value.trim()||'мои дела';const pr=ICPROMPT(w);copyTxt(pr);
      window.open('https://lure.eaglesteam.ru/#img&p='+encodeURIComponent(pr),'_blank','noopener');toast('Открываю LURE с готовым промптом')},nm.value.trim());""",
"""box('Создать иконку в LURE','Напиши, что должно быть на иконке. Откроется LURE → Изображения с готовым промптом, формат 1:1: выбери модель и нажми «Создать картинку».\\nПотом «Скачать» и вверху слева «Вернуться в карты» — вернёшься сюда же, останется загрузить картинку.',
    '','Открыть LURE',()=>{const w=$('mbIn').value.trim().slice(0,80)||nm.value.trim()||'мои дела';toLure(ICPROMPT(w),retState())},nm.value.trim());""")

rep("""  box('Обложка в LURE','Напиши, что должно быть на обложке. Откроется LURE → Изображения с готовым промптом в стиле Карт EAGLES: останется выбрать модель и нажать «Создать картинку».\\nПотом скачай картинку, вернись сюда и нажми «Своё фото».',
    '','Открыть LURE',()=>{const w=$('mbIn').value.trim().slice(0,80)||$('nmName').value.trim()||'мои цели';const pr=CVPROMPT(w);copyTxt(pr);
      window.open('https://lure.eaglesteam.ru/#img&p='+encodeURIComponent(pr),'_blank','noopener');toast('Открываю LURE с готовым промптом')},$('nmName').value.trim());""",
"""  box('Обложка в LURE','Напиши, что должно быть на обложке. Откроется LURE → Изображения с готовым промптом, формат 1:1: выбери модель и нажми «Создать картинку».\\nПотом «Скачать» и вверху слева «Вернуться в карты» — вернёшься в это же окно карты, останется загрузить фото.',
    '','Открыть LURE',()=>{const w=$('mbIn').value.trim().slice(0,80)||$('nmName').value.trim()||'мои цели';toLure(CVPROMPT(w),{t:'cv',ed:nmEdit,name:$('nmName').value,cv:nmCv,man:nmCvMan})},$('nmName').value.trim());""")

# квадратная обложка из LURE: промпт больше не про «вертикальную карточку»
rep("Всё важное — строго по центру кадра, с запасом по краям: обложка потом обрезается в вертикальную карточку.",
    "Всё важное — строго по центру кадра, с небольшим запасом по краям: обложка квадратная и стоит в верхней части карточки.")

DLJS = r"""
// KARTY v40: шапка «Сегодня» / «Со сроком» по всем картам (Андрей 18.11). Сегодня = срок сегодня или просрочено, не сделано.
function dlAll(){const out=[];MAPS.forEach((m,mi)=>{const walk=(d,path)=>{(d.kids||[]).forEach(k=>{const isT=!k.kids;
    if(k.due&&!(isT?k.done:(dcnt(k).a>0&&dcnt(k).a===dcnt(k).d)))out.push({mi,kind:isT?'task':'multi',d:k,name:isT?k.t:k.name,icon:k.icon||(isT?null:'goal'),path:[m.name,...path].join(' › '),due:k.due,tm:k.tm||''});
    if(k.kids)walk(k,[...path,k.name])})};walk(m.data,[])});
  return out.sort((a,b)=>(a.due+(a.tm||'99')).localeCompare(b.due+(b.tm||'99')))}
let DLT='today',DLL=[];
function dlBtns(t,cur){const L=dlAll(),n1=L.filter(x=>x.due<=TODAY).length,n2=L.length;
  return `<button type="button" data-t="today" class="${n1?'hot':''}"${cur?` aria-pressed="${cur==='today'}"`:''}>Сегодня <b>${n1}</b></button><button type="button" data-t="due" class="${n2?'due':''}"${cur?` aria-pressed="${cur==='due'}"`:''}>Со сроком <b>${n2}</b></button>`}
function dlUpd(){const e=$('dlTop');if(e)e.innerHTML=dlBtns();if(!$('dl').hidden)dlDraw()}
function dlDraw(){const L=dlAll();DLL=DLT==='today'?L.filter(x=>x.due<=TODAY):L;$('dlTabs').innerHTML=dlBtns(0,DLT);
  $('dlList').innerHTML=DLL.length?DLL.map((x,i)=>{const ic=x.kind==='task'?icOfD(x.d):(LIB[x.icon]?x.icon:'goal');const lt=late(x.d),td=x.due===TODAY;
    const when=lt?'⏰ просрочено · '+(td?'сегодня '+x.tm:ddmm(x.due)+(x.tm?' '+x.tm:'')):td?'⏳ сегодня'+(x.tm?' до '+x.tm:''):'📅 '+ddmm(x.due)+(x.tm?' '+x.tm:'');
    return `<button type="button" class="sr-row" data-i="${i}"><img alt="" src="${LIB[ic].src}"><div><b>${esc(x.name)}</b><small>${esc(x.path)}</small><em class="${lt?'late':td?'':'fut'}">${when}</em></div><span class="tg">${x.kind==='multi'?'остров':'дело'}</span></button>`}).join('')
    :`<div class="sr-emp">${DLT==='today'?'На сегодня дел нет 🎉<br>Загляни в «Со сроком» — можно сделать заранее.':'Дел со сроком нет.<br>Срок ставится в окне дела.'}</div>`}
function dlOpen(t){DLT=t||'today';if(cardOpen)closeCard();if(sheetOpen)closeSheet();$('dl').hidden=false;dlDraw()}
$('dlTop').addEventListener('click',e=>{const b=e.target.closest('button');if(b)dlOpen(b.dataset.t)});
$('dlTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b){DLT=b.dataset.t;dlDraw()}});
$('dlX').onclick=()=>{$('dl').hidden=true};
$('dlList').addEventListener('click',e=>{const b=e.target.closest('.sr-row');if(!b)return;const x=DLL[+b.dataset.i];$('dl').hidden=true;if(x){SR=[x];pickSR(0)}});
// ссылка на дело снаружи (для колокольчика): karty.html#delo=<карта>.<путь через точку>
function deloLink(){const m=/#delo=([\d.]+)/.exec(location.hash);if(!m)return;history.replaceState(null,'',location.pathname);
  const p=m[1].split('.').map(Number),mi=p.shift(),d=MAPS[mi]&&ires(MAPS[mi].data,p);if(!d||d===MAPS[mi].data)return;
  setTimeout(()=>{SR=[{mi,kind:d.kids?'multi':'task',d}];pickSR(0)},400)}
"""
rep("let SR=[];\n", "let SR=[];\n" + DLJS)
rep("let saveT=0;function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,600)}", "let saveT=0;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{saveNow();try{dlUpd()}catch(e){}},600)}")

# после загрузки — вернуть на место
rep("  loadMap(curMap,false);mtCount();showMaps();READY=true;zgrDone();\n",
    "  loadMap(curMap,false);mtCount();showMaps();READY=true;zgrDone();try{dlUpd();deloLink();backFromLure()}catch(e){}\n")

open(dst, 'w', encoding='utf-8', newline='').write(s)
print('ГОТОВО', dst, len(s.encode('utf-8')), 'байт, md5', hashlib.md5(s.encode('utf-8')).hexdigest())
