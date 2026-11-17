/* EAGLES · Загрузка контента в Канал и Обучение · eg-kontent.js v4 · 17.11.2026 (задание 68)
   Одна добавка на две страницы: kanal.html (канал Андрея) и obuchenie.html.
   Что даёт:
   - Сторис ТОЛЬКО съёмкой в приложении: кружочек с камеры до 60 с (из галереи нельзя — живая жизнь, не реклама).
     Висит 24 часа, потом в архив. Смотрят по аватарке по порядку, тап — следующая.
     Меню у сторис: «Поделиться ссылкой» (?s=ID, всем), «В Актуальное» и «Удалить» (владелец).
   - Старые картинки-заглушки страниц (сторис, кружки, посты, ролики, уроки) спрятаны: пусто, кроме стены из 5 уроков.
   - «Актуальное»: папки со сторис навсегда (и в Канале, и в Обучении — у каждой страницы свои).
   - Андрей 17.11 09:41: грузится ТОЛЬКО сторис. Посты, ролики и уроки — ссылкой на VK Видео или Rutube,
     на странице сразу их плеер с превью (встраивание vkvideo.ru/video_ext.php и rutube.ru/play/embed).
   - Канал · Лента: «Новый пост» — ссылка на ролик + текст.
   - Канал · Ролики: «＋ Ролик» — ссылка на ролик + название (можно и в Ленту).
   - Уроки (общие для Канала и Обучения): «＋ Урок» — видео или фото + текст, тема (Нейросети / Сетевой / Монтаж),
     «Открыт всем» или «Для EAGLES Pro». Pro-уроки у гостя и FREE с замком.
   Свой канал Pro (kanal.html?u=ID): только сторис-кружочки и «Актуальное» хозяина канала (место ch-ID); посты там
   по-прежнему ведёт kanal-posty.js. FREE и гости только смотрят (сторис видят все, и гости тоже).
   Добавлять и удалять в Канале Андрея и Обучении может только владелец (11111, 23933). Остальные только смотрят; лайки/комменты/Swoop
   у новых постов даёт kanal-posty.js (v3: window.EK_POSTS.refresh).
   Сервер: блок KONTENT v1 в eagles-server (kc_list, kc_img, kc_upurl, kc_add, kc_del, kc_hl, kc_hldel).
   Видео грузится прямо в бакет по одноразовой ссылке (kc_upurl), фото — через сервер (ужатое до 1440 px).
   Демо подменяет сервер: window.KC_API. */
(function(){
'use strict';
if(window.__kcOn) return; window.__kcOn = 1;
var BACKEND = 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
var OWNERS = ['11111', '23933'];
var PAGE = document.getElementById('eagles-kanal') ? 'kanal' : (document.querySelector('.learn-page') ? 'obuchenie' : '');
if(!PAGE) return;
/* свой канал Pro (kanal.html?u=ID) — не трогаем, там свои посты из kanal-posty.js */
var CHID = '';
try{ var qu = new URLSearchParams(location.search).get('u'); if(PAGE === 'kanal' && qu && OWNERS.indexOf(qu) < 0){ if(!/^[0-9]{1,12}$/.test(qu)) return; CHID = qu; } }catch(e){ return; }
var PLACE = CHID ? 'ch-' + CHID : PAGE;
document.documentElement.classList.add(CHID ? 'kc-pers' : 'kc-main');

var MAX_PHOTOS = 10, STORY_SEC = 60, VIDEO_MB = 500, DAY = 864e5;
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function ls(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function toast(m){ var t = el('div', 'kc-toast'); t.textContent = m; document.body.appendChild(t); setTimeout(function(){ t.style.opacity = '0'; }, 2400); setTimeout(function(){ t.remove(); }, 2900); }
function who(){
  if(window.KC_DEMO_WHO) return window.KC_DEMO_WHO();
  var id = ls('eaglesfree_id'), ss = ls('eaglesfree_session');
  if(!id || !ss) return {role:'guest'};
  return {id:id, owner:OWNERS.indexOf(id) >= 0, role:(OWNERS.indexOf(id) >= 0 || ls('eaglesfree_plan') === 'pro') ? 'pro' : 'free'};
}
var ME = who(), MOD = !!ME.owner, OWNER = CHID ? (ME.id === CHID && ME.role === 'pro') : MOD;
function when(ts){
  var s = (Date.now() - ts) / 1000;
  if(s < 60) return 'только что'; if(s < 3600) return Math.floor(s / 60) + ' мин назад';
  if(s < 86400) return Math.floor(s / 3600) + ' ч назад'; if(s < 172800) return 'вчера';
  var d = new Date(ts); return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2);
}
function dur(sec){ sec = Math.round(sec || 0); return sec ? Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2) : ''; }
function textHtml(t){ return esc(t).replace(/\n/g, '<br>').replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
var VID_RE = /^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be))\//i;
function vidName(u){ return /rutube/i.test(u) ? 'Rutube' : /youtu/i.test(u) ? 'YouTube' : 'VK Видео'; }
/* ссылка VK Видео / Rutube / YouTube → адрес встроенного плеера (превью и просмотр прямо на странице) */
function emb(u){
  u = String(u || ''); var m, q = '';
  try{ q = new URL(u).searchParams; }catch(e){ q = new URLSearchParams(''); }
  if((m = /rutube\.ru\/(video|shorts|play\/embed)\/(?:private\/)?([0-9a-f]{32})/i.exec(u))) return {src:'https://rutube.ru/play/embed/' + m[2] + (q.get('p') ? '/?p=' + encodeURIComponent(q.get('p')) : ''), v:m[1] === 'shorts'};
  if((m = /(?:video_ext\.php\?)/.exec(u)) && q.get('oid') && q.get('id')) return {src:'https://vkvideo.ru/video_ext.php?oid=' + encodeURIComponent(q.get('oid')) + '&id=' + encodeURIComponent(q.get('id')) + (q.get('hash') ? '&hash=' + encodeURIComponent(q.get('hash')) : '') + '&hd=2', v:false};
  if((m = /(?:vk\.com|vkvideo\.ru|vk\.ru)\/.*?(video|clip)(-?\d+)_(\d+)/i.exec(u))) return {src:'https://vkvideo.ru/video_ext.php?oid=' + m[2] + '&id=' + m[3] + '&hd=2', v:m[1] === 'clip'};
  if((m = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(u))) return {src:'https://www.youtube.com/embed/' + m[1], v:/shorts/.test(u)};
  return null;
}
function embHtml(u, vert){
  var e = emb(u); if(!e) return u ? '<a class="kc-link" href="' + esc(u) + '" target="_blank" rel="noopener">▶ Смотреть в ' + vidName(u) + '</a>' : '';
  return '<div class="kc-emb' + (e.v || vert ? ' v' : '') + '"><iframe src="' + esc(e.src) + '" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write" allowfullscreen frameborder="0" title="Видео"></iframe></div>';
}

/* ---------- сервер ---------- */
var API = window.KC_API || {
  call: function(action, data, post){
    var sess = ls('eaglesfree_session') || '', u = BACKEND + '?action=' + action + '&sess=' + encodeURIComponent(sess);
    var o = {method:'GET'};
    if(post){ u = BACKEND + '?type=' + action + '&sess=' + encodeURIComponent(sess); var f = new URLSearchParams(); for(var k in data) f.append(k, data[k]); o = {method:'POST', body:f}; }
    else for(var k2 in data) u += '&' + k2 + '=' + encodeURIComponent(data[k2]);
    return fetch(u, o).then(function(r){ return r.json(); }).then(function(r){ if(!r || !r.ok) throw r || {}; return r; });
  },
  list: function(place){ return API.call('kc_list', {place:place, arch:OWNER ? 1 : 0}); },
  photo: function(b64, mime){ return API.call('kc_img', {place:PLACE, data:b64, mime:mime}, true).then(function(r){ return r.url; }); },
  video: function(file, prog){
    return API.call('kc_upurl', {place:PLACE, mime:file.type || 'video/mp4', size:file.size}).then(function(r){
      return new Promise(function(ok, no){
        var x = new XMLHttpRequest(); x.open('PUT', r.put); x.setRequestHeader('Content-Type', r.mime);
        x.upload.onprogress = function(e){ if(e.lengthComputable && prog) prog(e.loaded / e.total); };
        x.onload = function(){ x.status >= 200 && x.status < 300 ? ok(r.url) : no({error:'put_' + x.status}); };
        x.onerror = function(){ no({error:'net'}); }; x.send(file);
      });
    });
  },
  add: function(place, kind, item){ return API.call('kc_add', {place:place, kind:kind, json:JSON.stringify(item)}, true).then(function(r){ return r.item; }); },
  del: function(id){ return API.call('kc_del', {id:id}, true); },
  hl: function(place, h){ return API.call('kc_hl', {place:place, json:JSON.stringify(h)}, true).then(function(r){ return r.hl; }); },
  hldel: function(id){ return API.call('kc_hldel', {id:id}, true); }
};

/* ---------- файлы: фото ужимаем, у видео берём обложку ---------- */
function readImg(file){ return new Promise(function(ok, no){ var u = URL.createObjectURL(file), i = new Image(); i.onload = function(){ ok(i); }; i.onerror = function(){ no({error:'bad_photo'}); }; i.src = u; }); }
function toB64(canvas, q){
  var d = canvas.toDataURL('image/webp', q), m = 'image/webp';
  if(d.indexOf('data:image/webp') !== 0){ d = canvas.toDataURL('image/jpeg', q); m = 'image/jpeg'; }
  return {b64:d.split(',')[1], mime:m, url:d};
}
function shrink(src, max, q){
  var w = src.videoWidth || src.naturalWidth || src.width, h = src.videoHeight || src.naturalHeight || src.height, k = Math.min(1, max / Math.max(w, h));
  var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return toB64(c, q || 0.82);
}
function upPhoto(file){
  return readImg(file).then(function(i){ var x = shrink(i, 1440, .82); if(x.b64.length > 2400000) x = shrink(i, 1080, .7); return API.photo(x.b64, x.mime).then(function(u){ return {u:u, w:i.naturalWidth, h:i.naturalHeight}; }); });
}
function probeVideo(file){
  return new Promise(function(ok, no){
    var v = document.createElement('video'), u = URL.createObjectURL(file), done = false;
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = u;
    v.onloadedmetadata = function(){ try{ v.currentTime = Math.min(0.6, (v.duration || 1) / 3); }catch(e){} };
    v.onseeked = function(){ if(done) return; done = true; var c = null; try{ c = shrink(v, 720, .78); }catch(e){} ok({dur:v.duration || 0, w:v.videoWidth, h:v.videoHeight, cover:c}); };
    v.onerror = function(){ no({error:'bad_video'}); };
    setTimeout(function(){ if(!done){ done = true; ok({dur:v.duration || 0, w:v.videoWidth, h:v.videoHeight, cover:null}); } }, 8000);
  });
}
/* общий загрузчик: фото → {t:'img',u}, видео → {t:'vid',u,c,d} */
function upMedia(file, prog, maxSec){
  if(/^image\//.test(file.type)) return upPhoto(file).then(function(x){ prog && prog(1); return {t:'img', u:x.u, r:x.h > x.w ? 'v' : 'h'}; });
  if(!/^video\//.test(file.type)) return Promise.reject({error:'type'});
  if(file.size > VIDEO_MB * 1048576) return Promise.reject({error:'big'});
  return probeVideo(file).then(function(p){
    if(maxSec && p.dur > maxSec + 0.5) throw {error:'long'};
    var cov = p.cover ? API.photo(p.cover.b64, p.cover.mime) : Promise.resolve('');
    return cov.then(function(cu){ return API.video(file, prog).then(function(u){ return {t:'vid', u:u, c:cu, d:Math.round(p.dur), r:p.h > p.w ? 'v' : 'h'}; }); });
  });
}
function errText(r){
  r = r || {};
  return r.error === 'long' ? 'Сторис — до ' + STORY_SEC + ' секунд. Обрежь видео или добавь его постом' :
    r.error === 'big' ? 'Видео больше ' + VIDEO_MB + ' МБ. Сожми его и попробуй ещё раз' :
    r.error === 'type' ? 'Подходит только фото или видео' :
    r.error === 'bad_photo' || r.error === 'bad_video' ? 'Файл не открылся. Попробуй другой' :
    r.error === 'auth' ? 'Войди в EAGLES и попробуй ещё раз' :
    r.error === 'owner' ? (CHID ? 'Сторис снимают участники EAGLES Pro в своём канале' : 'Добавлять может только Андрей') :
    r.error === 'limit' ? 'На сегодня хватит, попробуй завтра' :
    'Не получилось загрузить. Проверь интернет и попробуй ещё раз';
}
function pick(accept, multi){
  return new Promise(function(ok){
    var i = el('input'); i.type = 'file'; i.accept = accept; if(multi) i.multiple = true; i.style.display = 'none';
    i.onchange = function(){ ok(Array.prototype.slice.call(i.files || [])); i.remove(); };
    document.body.appendChild(i); i.click();
  });
}

/* ---------- стили ---------- */
var css = el('style'); css.id = 'kcCss'; css.textContent = [
'.kc-toast{position:fixed;z-index:400;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:88vw;background:#22190e;border:1px solid #e9a23b;color:#f4f4f2;font:700 13px/1.4 Montserrat,sans-serif;padding:10px 14px;border-radius:12px;transition:opacity .4s;text-align:center}',
'.kc-gold{background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205}',
/* сторис */
'.kc-sto{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px;width:74px;background:none;border:0;padding:0;color:#e9e4da;font:700 11.5px/1.2 Montserrat,sans-serif;cursor:pointer;text-align:center}',
'.kc-sto .kc-rg{width:68px;height:68px;border-radius:50%;padding:2.5px;background:conic-gradient(from 200deg,#fff3c4,#ffd23f,#e9a23b,#ff6a2b,#ffd23f,#fff3c4)}',
'.kc-sto.seen .kc-rg{background:#3a332b}',
'.kc-sto .kc-rg>span{display:block;width:100%;height:100%;border-radius:50%;border:2.5px solid #070708;background:#1a1612 center/cover no-repeat;position:relative;overflow:hidden}',
'.kc-sto .kc-rg>span i{position:absolute;right:4px;bottom:4px;font-style:normal;font-size:12px}',
'.kc-sto span.kc-t{max-width:74px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 11.5px/1.2 Montserrat,sans-serif!important;color:#e9e4da!important;letter-spacing:0!important}',
'.kc-sto.kc-plus .kc-rg{background:none!important;border:2px dashed #8a7240!important;padding:0!important;box-sizing:border-box}',
'.kc-sto.kc-plus .kc-rg>span{border:0;display:flex;align-items:center;justify-content:center;color:#ffd23f;font-size:28px;font-weight:600;background:#120f0b}',
'.kc-sto.kc-plus .kc-rg>span i{position:static!important;font-size:28px!important;font-weight:600;color:#ffd23f}',
/* актуальное */
'.kc-hlw{margin:2px 0 12px}',
'.kc-hlw h4{margin:0 0 8px;font:900 13px Montserrat,sans-serif;color:#a29b90;letter-spacing:.06em;text-transform:uppercase;display:flex;align-items:center;gap:8px}',
'.kc-hlw h4 small{font:700 11px Montserrat,sans-serif;color:#6d675f;text-transform:none;letter-spacing:0}',
'.kc-hls{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding:2px}',
'.kc-hls::-webkit-scrollbar{display:none}',
'.kc-hls .kc-sto .kc-rg{background:linear-gradient(180deg,#5a4a2c,#2a2218);padding:2px}',
'.kc-hls .kc-sto .kc-rg>span{border-width:3px}',
/* кнопки владельца */
'.kc-own{display:flex!important;align-items:center;gap:10px;width:100%!important;box-sizing:border-box;margin:0 0 12px!important;padding:14px!important;border-radius:18px!important;border:1.5px dashed rgba(255,210,63,.5)!important;background:rgba(255,210,63,.06)!important;color:#ffd23f!important;font:800 14px Montserrat,sans-serif!important;cursor:pointer;text-align:left;box-shadow:none!important}',
'.kc-own b{width:34px;height:34px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600}',
'.kc-own small{display:block;color:#a29b90;font:600 11.5px/1.35 Montserrat,sans-serif;margin-top:2px}',
'.kc-tile-add{aspect-ratio:9/16;border-radius:12px!important;border:1.5px dashed rgba(255,210,63,.55)!important;background:rgba(255,210,63,.06)!important;color:#ffd23f;font:800 12px Montserrat,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;width:100%}',
'.kc-tile-add b{font-size:30px;font-weight:600;line-height:1}',
'.kc-empty{color:#6d675f;font:600 13px/1.5 Montserrat,sans-serif;padding:6px 2px 12px}',
/* пост */
'.kc-post .kc-ph{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
'.kc-post .kc-ph img.kc-av,.kc-post .kc-ph .kc-av{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:none;border:1.5px solid rgba(255,210,63,.55)}',
'.kc-post .kc-ph b{display:block;font:800 14px Montserrat,sans-serif;color:#f4f4f2}',
'.kc-post .kc-ph small{color:#6d675f;font:600 11.5px Montserrat,sans-serif}',
'.kc-post p{margin:0 0 10px;color:#e9e4da;font:500 14.5px/1.55 Montserrat,sans-serif;word-wrap:break-word}',
'.kc-post p a{color:#ffd23f}',
'.kc-del{margin-left:auto;border:1px solid #2a2622;background:#0d0c0f;color:#a29b90;border-radius:999px;min-width:34px;height:30px;padding:0 10px;font:800 13px Montserrat,sans-serif;cursor:pointer}',
'.kc-del.sure{border-color:#e8321a;color:#ff8a70}',
'.kc-car{position:relative;margin:0 -2px 10px;border-radius:16px;overflow:hidden;background:#0b0a0c}',
'.kc-car .kc-sl{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}',
'.kc-car .kc-sl::-webkit-scrollbar{display:none}',
'.kc-car .kc-sl img{flex:none;width:100%;max-height:520px;object-fit:cover;scroll-snap-align:center;display:block}',
'.kc-car .kc-n{position:absolute;right:10px;top:10px;background:rgba(0,0,0,.6);color:#fff;border-radius:999px;padding:3px 9px;font:800 11.5px Montserrat,sans-serif}',
'.kc-car .kc-dots{position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;gap:5px}',
'.kc-car .kc-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.45)}',
'.kc-car .kc-dots i.on{background:#ffd23f}',
'.kc-vid{position:relative;display:block;width:100%;margin:0 0 10px;border:0;padding:0;border-radius:16px;overflow:hidden;background:#0b0a0c;cursor:pointer}',
'.kc-vid img{display:block;width:100%;max-height:520px;object-fit:cover}',
'.kc-vid.v img{aspect-ratio:9/16;max-height:480px}',
'.kc-vid .kc-pl{position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;background:rgba(0,0,0,.55);border:2px solid #ffd23f;display:flex;align-items:center;justify-content:center}',
'.kc-vid .kc-pl:after{content:"";margin-left:5px;border-left:18px solid #ffd23f;border-top:11px solid transparent;border-bottom:11px solid transparent}',
'.kc-vid em{position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.65);color:#fff;border-radius:8px;padding:3px 7px;font:800 11.5px Montserrat,sans-serif;font-style:normal}',
'.kc-link{display:flex;align-items:center;gap:8px;margin:0 0 10px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,210,63,.35);color:#ffd23f;text-decoration:none;font:800 13.5px Montserrat,sans-serif;background:rgba(255,210,63,.05)}',
/* урок в Обучении */
'.learn-page .kc-les .cov img.egph{object-fit:cover}',
'.learn-page .kc-les.kc-lock .cov img{filter:grayscale(1) brightness(.55)}',
'.learn-page .kc-old{display:none!important}',
'html.kc-main #eagles-kanal .ek-stories>.ek-sto[data-s],html.kc-main .learn-page .stories>.sto[data-s],html.kc-main #eagles-kanal .ek-circles,html.kc-main #ek-lenta>article,html.kc-main #ek-roliki .ek-grid>.ek-rl,html.kc-main #ek-open>.ek-l,html.kc-main #ek-closed>.ek-l{display:none!important}',
'.kc-prow{margin:4px 0 6px}',
'.kc-stempty{align-self:center;color:#8d857a;font:700 12.5px Montserrat,sans-serif;padding:0 6px;white-space:nowrap}',
'.kc-sto.kc-live .kc-rg>span i{left:50%;right:auto!important;bottom:3px!important;transform:translateX(-50%);background:#ffd23f;color:#111;border-radius:9px;padding:1px 7px;font:900 10.5px/1.35 Montserrat,sans-serif!important}',
'.kc-sto.kc-live .kc-rg>span i em{font-style:normal}',
'.kc-sto.kc-recb .kc-rg>span i{color:#ff3b30!important;font-size:26px!important}',
'.kc-sto.kc-recb .kc-rg{border-color:#ff3b30!important;border-style:solid!important}',
'.kc-wall{margin:4px 0 16px}',
'.kc-wall h4{font:900 12.5px Montserrat,sans-serif;letter-spacing:.1em;color:#ffd23f;text-transform:uppercase;margin:6px 2px 10px}',
'.kc-wall .ek-ls{display:grid;gap:12px}',
'#eagles-kanal .kc-plan .ek-th{position:relative}',
'#eagles-kanal .kc-soon,.learn-page .kc-soon{position:absolute;right:10px;top:10px;z-index:3;padding:6px 12px;border-radius:30px;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;font:900 12px Montserrat,sans-serif;letter-spacing:.06em;box-shadow:0 4px 14px rgba(0,0,0,.45)}',
'#eagles-kanal .kc-lk2{position:absolute;right:10px;top:10px;z-index:3;padding:5px 10px;border-radius:30px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.25);color:#cfc8bd;font:800 11px Montserrat,sans-serif}',
'#eagles-kanal .kc-plan.kc-off{opacity:.62}',
'#eagles-kanal .kc-plan.kc-off img{filter:grayscale(1) brightness(.5)}',
'.kc-rlempty{grid-column:1/-1}',
'.kc-emb{position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#0d0b09;margin:10px 0 4px}',
'.kc-emb.v{aspect-ratio:9/16;max-width:340px;margin-left:auto;margin-right:auto}',
'.kc-emb iframe{position:absolute;inset:0;width:100%;height:100%;border:0}',
'.kc-rlv{grid-column:1/-1;display:block;background:none;border:0;padding:0;color:#f4f4f2;font:800 14px Montserrat,sans-serif;text-align:left}',
'.kc-rlv b{display:block;margin:2px 2px 0}',
'.kc-lcard{display:block;background:#120f0b;border:1px solid rgba(255,210,63,.25);border-radius:18px;padding:12px;margin:0 0 14px;color:#f4f4f2;font-family:Montserrat,sans-serif;text-align:left}',
'.kc-lcard .kc-lh{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
'.kc-lcard .kc-lh b{font:900 16px/1.25 Montserrat,sans-serif;flex:1 1 100%}',
'.kc-lcard .kc-lh small{font:700 12px Montserrat,sans-serif;color:#b8ae9f}',
'.kc-lcard .kc-tg{padding:3px 9px;border-radius:20px;background:#ffd23f;color:#1a1205;font:900 10.5px Montserrat,sans-serif;letter-spacing:.05em;text-transform:uppercase}',
'.kc-lcard .kc-tg.pro{background:#2a2218;color:#ffd23f;border:1px solid #6a5426}',
'.kc-lcard p{margin:8px 2px 0;color:#d9d2c6;font:500 13.5px/1.5 Montserrat,sans-serif}',
'.kc-lockbox{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;border-radius:14px;margin:10px 0 4px;background:linear-gradient(160deg,#2a2218,#0d0b09);color:#ffd23f;font:900 15px Montserrat,sans-serif;cursor:pointer}',
'.kc-sheet input[type=url]{display:block}',
'#kcRec{position:fixed;inset:0;z-index:360;background:radial-gradient(90% 60% at 50% 35%,#1d1408,#000 70%);display:flex;flex-direction:column;align-items:center;color:#fff;font-family:Montserrat,sans-serif;padding:calc(12px + env(safe-area-inset-top,0px)) 16px calc(20px + env(safe-area-inset-bottom,0px));box-sizing:border-box;overflow:auto}',
'#kcRec[hidden]{display:none}',
'#kcRec .kr-top{width:100%;display:flex;align-items:center;justify-content:space-between;min-height:44px}',
'#kcRec .kr-top button{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font:700 22px Montserrat,sans-serif;cursor:pointer}',
'#kcRec .kr-live{visibility:hidden;display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:30px;background:#e0241b;font:900 16px Montserrat,sans-serif;letter-spacing:.06em;animation:krp 1.2s infinite}',
'#kcRec .kr-live i{width:11px;height:11px;border-radius:50%;background:#fff}',
'#kcRec[data-st=rec] .kr-live{visibility:visible}',
'#kcRec[data-st=rec] .kr-flip,#kcRec[data-st=done] .kr-flip{visibility:hidden}',
'@keyframes krp{0%{box-shadow:0 0 0 0 rgba(224,36,27,.7)}70%{box-shadow:0 0 0 16px rgba(224,36,27,0)}100%{box-shadow:0 0 0 0 rgba(224,36,27,0)}}',
'#kcRec .kr-c{position:relative;flex:none;width:min(80vw,50vh,420px);height:min(80vw,50vh,420px);margin:22px 0 8px}',
'#kcRec svg{position:absolute;left:-9px;top:-9px;width:calc(100% + 18px);height:calc(100% + 18px);transform:rotate(-90deg)}',
'#kcRec svg circle{fill:none;stroke-width:3.4}',
'#kcRec .kr-bg{stroke:rgba(255,255,255,.14)}',
'#kcRec .kr-pr{stroke:#ffd23f;stroke-linecap:round;stroke-dasharray:0 100}',
'#kcRec[data-st=rec] .kr-pr{stroke:#ff3b30}',
'#kcRec .kr-v{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#111}',
'#kcRec[data-st=rec] .kr-v{box-shadow:0 0 50px rgba(255,59,48,.55)}',
'#kcRec video{width:100%;height:100%;object-fit:cover;display:block}',
'#kcRec video[hidden]{display:none}',
'#kcRec video.mir,#kcView video.mir{transform:scaleX(-1)}',
'#kcRec .kr-t{font:900 42px/1 Montserrat,sans-serif;font-variant-numeric:tabular-nums;margin-top:8px}',
'#kcRec .kr-t small{font-size:18px;color:rgba(255,255,255,.5)}',
'#kcRec[data-st=rec] .kr-t b{color:#ff4b40}',
'#kcRec .kr-h{min-height:40px;max-width:340px;text-align:center;color:rgba(255,255,255,.75);font:600 13.5px/1.45 Montserrat,sans-serif;margin:10px 0 14px}',
'#kcRec .kr-btns{margin-top:auto}',
'#kcRec .kr-btns[hidden],#kcRec .kr-done[hidden]{display:none}',
'#kcRec .kr-rec{width:86px;height:86px;border-radius:50%;border:5px solid #fff;background:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer}',
'#kcRec .kr-rec i{width:64px;height:64px;border-radius:50%;background:#ff3b30;transition:all .2s}',
'#kcRec[data-st=rec] .kr-rec i{width:30px;height:30px;border-radius:8px}',
'#kcRec .kr-rec:disabled{opacity:.35}',
'#kcRec .kr-done{margin-top:auto;display:flex;gap:10px;width:100%;max-width:420px}',
'#kcRec .kr-done button{flex:1;height:56px;border-radius:16px;border:0;font:900 16px Montserrat,sans-serif;cursor:pointer}',
'#kcRec .kr-again{background:#1f1b16;color:#fff;border:1px solid rgba(255,255,255,.18)!important}',
'#kcRec .kr-send{background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205}',
'#kcRec .kr-bar{width:100%;max-width:420px;height:5px;border-radius:5px;background:rgba(255,255,255,.12);margin-top:12px;overflow:hidden;visibility:hidden;flex:none}',
'#kcRec .kr-bar.on{visibility:visible}',
'#kcRec .kr-bar b{display:block;height:100%;width:0;background:#ffd23f}',
'#kcView .kv-circ{position:relative;z-index:1;width:min(88vw,60vh,460px);height:min(88vw,60vh,460px);border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px #ffd23f,0 20px 60px rgba(0,0,0,.6);background:#111}',
'#kcView .kv-circ video{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;display:block}',
'#kcView .kv-bg{position:absolute;inset:-40px;background:center/cover no-repeat;filter:blur(30px) brightness(.35);z-index:0}',
'.learn-page .kc-lk{position:absolute;right:10px;top:10px;background:rgba(0,0,0,.72);border:1px solid rgba(255,210,63,.5);color:#ffd23f;border-radius:30px;padding:6px 11px;font:800 12px Montserrat,sans-serif;z-index:3}',
'.kc-lesdel{display:block;margin:-6px 0 14px auto}',
'.learn-page .kc-soon{position:absolute;right:10px;top:10px;z-index:3;padding:6px 12px;border-radius:30px;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;font:900 12px Montserrat,sans-serif;letter-spacing:.06em;box-shadow:0 4px 14px rgba(0,0,0,.45)}',
'.learn-page .kc-plan.kc-off{opacity:.62}',
'.learn-page .kc-plan.kc-off .cov img{filter:grayscale(1) brightness(.5)}',
'.learn-page .kc-plan.kc-off .cov b,.learn-page .kc-plan.kc-off .cov i{color:#bdb7ae!important;-webkit-text-fill-color:#bdb7ae}',
'.learn-page .kc-plan.kc-off .tag{background:#555!important;color:#ddd!important}',
'.learn-page .kc-plan.kc-off .lt b{color:#8d857a}',
'.learn-page .kc-plan .kc-lk{border-color:rgba(255,255,255,.25);color:#cfc8bd}',
/* листы (снизу) */
'.kc-dim{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.6);opacity:0;pointer-events:none;transition:opacity .2s}',
'.kc-dim.on{opacity:1;pointer-events:auto}',
'.kc-sheet{position:fixed;z-index:301;left:0;right:0;bottom:0;max-height:92vh;overflow:auto;transform:translateY(105%);transition:transform .25s;background:#141217;border-top:1px solid rgba(255,210,63,.35);border-radius:22px 22px 0 0;padding:10px 16px calc(18px + env(safe-area-inset-bottom,0px));color:#f4f4f2;font-family:Montserrat,sans-serif;max-width:560px;margin:0 auto}',
'.kc-sheet.on{transform:none}',
'.kc-sheet .kc-grab{width:44px;height:5px;border-radius:9px;background:#3a332b;margin:0 auto 12px}',
'.kc-sheet h2{display:flex;align-items:center;margin:0 0 6px;font:900 19px Montserrat,sans-serif}',
'.kc-sheet h2 button{margin-left:auto;width:34px;height:34px;border-radius:50%;border:1px solid #2a2622;background:#0d0c0f;color:#a29b90;font-size:18px;cursor:pointer}',
'.kc-sheet p.kc-sub{margin:0 0 12px;color:#a29b90;font:600 12.5px/1.5 Montserrat,sans-serif}',
'.kc-sheet textarea,.kc-sheet input[type=text],.kc-sheet input[type=url],.kc-sheet select{width:100%;box-sizing:border-box;margin:0 0 10px;padding:12px 13px;border-radius:14px;border:1px solid #2a2622;background:#0d0c0f;color:#f4f4f2;font:600 14px/1.45 Montserrat,sans-serif;outline:none}',
'.kc-sheet textarea:focus,.kc-sheet input:focus{border-color:rgba(255,210,63,.6)}',
'.kc-row{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px}',
'.kc-chip{flex:1 1 auto;min-width:0;padding:11px 10px;border-radius:13px;border:1px solid #2a2622;background:#0d0c0f;color:#e9e4da;font:800 13px Montserrat,sans-serif;cursor:pointer;text-align:center}',
'.kc-chip.on{border-color:#ffd23f;background:rgba(255,210,63,.12);color:#ffd23f}',
'.kc-big{display:block;width:100%;padding:14px;border:0;border-radius:15px;font:900 15px Montserrat,sans-serif;cursor:pointer;margin-top:4px}',
'.kc-big[disabled]{opacity:.55}',
'.kc-prev{display:flex;gap:8px;overflow-x:auto;margin:0 0 10px;scrollbar-width:none}',
'.kc-prev>div{position:relative;flex:none;width:84px;height:110px;border-radius:12px;overflow:hidden;background:#0d0c0f center/cover no-repeat;border:1px solid #2a2622}',
'.kc-prev>div b{position:absolute;right:4px;top:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;font-size:14px;line-height:22px;text-align:center;cursor:pointer}',
'.kc-prev>div i{position:absolute;left:0;right:0;bottom:0;padding:3px;background:rgba(0,0,0,.6);font:800 10.5px Montserrat,sans-serif;font-style:normal;text-align:center;color:#ffd23f}',
'.kc-bar{height:6px;border-radius:9px;background:#2a2622;overflow:hidden;margin:6px 0 4px;display:none}',
'.kc-bar.on{display:block}',
'.kc-bar b{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd23f,#ff6a2b);transition:width .2s}',
'.kc-note{color:#6d675f;font:600 11.5px/1.45 Montserrat,sans-serif;margin:4px 0 0}',
'.kc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 10px}',
'.kc-grid button{position:relative;aspect-ratio:9/16;border-radius:10px;border:2px solid transparent;background:#0d0c0f center/cover no-repeat;cursor:pointer;padding:0}',
'.kc-grid button.on{border-color:#ffd23f}',
'.kc-grid button.on:after{content:"✓";position:absolute;right:4px;top:4px;width:20px;height:20px;border-radius:50%;background:#ffd23f;color:#1a1205;font:900 12px/20px Montserrat,sans-serif}',
'.kc-grid button i{position:absolute;left:4px;bottom:4px;font-style:normal;font-size:12px}',
/* просмотр сторис */
'#kcView{position:fixed;inset:0;z-index:350;background:#000;display:flex;flex-direction:column;color:#fff;font-family:Montserrat,sans-serif}',
'#kcView[hidden]{display:none}',
'#kcView .kv-bars{display:flex;gap:4px;padding:calc(10px + env(safe-area-inset-top,0px)) 10px 6px}',
'#kcView .kv-bars i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.3);overflow:hidden}',
'#kcView .kv-bars b{display:block;height:100%;width:0;background:#fff}',
'#kcView .kv-h{display:flex;align-items:center;gap:10px;padding:4px 12px 8px;font:800 13.5px Montserrat,sans-serif}',
'#kcView .kv-h img{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid #ffd23f}',
'#kcView .kv-h small{display:block;color:rgba(255,255,255,.65);font:600 11.5px Montserrat,sans-serif}',
'#kcView .kv-h button{background:rgba(255,255,255,.12);border:0;color:#fff;height:34px;min-width:34px;border-radius:999px;font:800 14px Montserrat,sans-serif;cursor:pointer;padding:0 10px}',
'#kcView .kv-h .kv-x{margin-left:auto;font-size:22px;background:none}',
'#kcView .kv-b{position:relative;flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden}',
'#kcView .kv-b img,#kcView .kv-b video{max-width:100%;max-height:100%;object-fit:contain}',
'#kcView .kv-cap{position:absolute;left:14px;right:14px;bottom:calc(22px + env(safe-area-inset-bottom,0px));text-align:center;font:800 16px/1.4 Montserrat,sans-serif;text-shadow:0 2px 10px rgba(0,0,0,.9);z-index:2}',
'#kcView .kv-tap{position:absolute;top:0;bottom:0;width:35%;background:none;border:0;z-index:1}',
'#kcView .kv-tap.l{left:0}#kcView .kv-tap.r{right:0;width:65%}',
'#kcView .kv-m{position:absolute;right:12px;top:calc(96px + env(safe-area-inset-top,0px));z-index:5;display:flex;flex-direction:column;gap:6px;background:#141217;border:1px solid rgba(255,210,63,.35);border-radius:14px;padding:6px}',
'#kcView .kv-m[hidden]{display:none}',
'#kcView .kv-m button{background:none;border:0;color:#f4f4f2;text-align:left;padding:10px 12px;font:800 13.5px Montserrat,sans-serif;cursor:pointer;border-radius:10px}',
'#kcView .kv-m button.red{color:#ff8a70}',
/* плеер (Обучение) */
'#kcPlayer{position:fixed;inset:0;z-index:340;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center}',
'#kcPlayer[hidden]{display:none}',
'#kcPlayer video{max-width:100%;max-height:100%}',
'#kcPlayer button{position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top,0px));width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.5);color:#fff;font-size:20px;cursor:pointer}',
/* урок-статья */
'.kc-read img{display:block;width:100%;border-radius:14px;margin:0 0 10px}',
'.kc-read p{color:#e9e4da;font:500 14.5px/1.6 Montserrat,sans-serif;margin:0 0 12px}'
].join('\n');
document.head.appendChild(css);

/* ---------- лист снизу ---------- */
var dim = el('div', 'kc-dim'), sheet = el('div', 'kc-sheet');
sheet.setAttribute('role', 'dialog');
document.body.appendChild(dim); document.body.appendChild(sheet);
var busy = false;
function openSheet(title, sub, body){
  sheet.innerHTML = '<div class="kc-grab"></div><h2>' + esc(title) + '<button type="button" aria-label="Закрыть">×</button></h2>' + (sub ? '<p class="kc-sub">' + sub + '</p>' : '') + '<div class="kc-body"></div>';
  var b = $('.kc-body', sheet); if(typeof body === 'string') b.innerHTML = body; else b.appendChild(body);
  $('h2 button', sheet).onclick = closeSheet;
  requestAnimationFrame(function(){ sheet.classList.add('on'); dim.classList.add('on'); });
  return b;
}
function closeSheet(){ if(busy && !confirm('Загрузка ещё идёт. Прервать?')) return; busy = false; sheet.classList.remove('on'); dim.classList.remove('on'); }
dim.onclick = closeSheet;
function progBar(b){ var p = $('.kc-bar', b); return function(f){ p.classList.add('on'); $('b', p).style.width = Math.round(f * 100) + '%'; }; }

/* ---------- данные ---------- */
var D = {stories:[], arch:[], hl:[], posts:[], roliki:[], uroki:[]};
var UR = {uroki:[]};
function chName(){ if(!CHID) return 'Андрей Чулков'; var h = $('.ek-chhead h1'); return (h && h.textContent.trim()) || 'Канал'; }
function firstN(){ return chName().split(/\s+/)[0]; }
function avatar(){ var i = $('.ek-chhead .ek-ava2 img, .ek-ph img'); return i ? i.getAttribute('src') : ''; }
function storyAll(){ return D.stories.concat(D.arch); }
function byId(id){ var a = storyAll(); for(var i = 0; i < a.length; i++) if(a[i].id === id) return a[i]; return null; }

/* ---------- сторис и «Актуальное» ---------- */
var stoBox = null, hlBox = null;
function seenKey(){ return 'kc_seen_' + PLACE; }
function seen(){ try{ return JSON.parse(ls(seenKey()) || '{}'); }catch(e){ return {}; } }
function markSeen(id){ var s = seen(); s[id] = 1; try{ localStorage.setItem(seenKey(), JSON.stringify(s)); }catch(e){} }
function thumb(x){ return x.t === 'vid' ? (x.c || '') : x.u; }
function stoBtn(cls, img, title, icon){
  return '<button type="button" class="kc-sto ' + cls + '"><span class="kc-rg"><span style="' + (img ? 'background-image:url(\'' + esc(img) + '\')' : '') + '">' + (icon ? '<i>' + icon + '</i>' : '') + '</span></span><span class="kc-t">' + esc(title) + '</span></button>';
}
function storyRow(){
  if(PAGE === 'obuchenie') return $('.learn-page .stories');
  if(!CHID) return $('#eagles-kanal .ek-stories');
  /* свой канал Pro: kanal-posty.js прячет ряд Андрея, ставим свой ряд сразу после него */
  var r = $('.kc-prow'); if(r) return r;
  var base = $('#eagles-kanal .ek-stories') || $('.ek-chhead'); if(!base) return null;
  r = el('div', 'ek-stories kc-prow'); r.setAttribute('aria-label', 'Сторис'); base.parentNode.insertBefore(r, base.nextSibling); return r;
}
function mountStories(){
  var row = storyRow();
  if(!row) return;
  stoBox = $('.kc-stos', row);
  if(!stoBox){ stoBox = el('span', 'kc-stos'); stoBox.style.display = 'contents'; var add = $('#ek-add', row); row.insertBefore(stoBox, add ? add.nextSibling : row.firstChild); }
  var h = '';
  if(OWNER && (PAGE === 'obuchenie' || CHID)) h += stoBtn('kc-plus kc-recb', '', 'Снять', '●');
  if(D.stories.length){
    var s = seen(), all = D.stories.every(function(x){ return s[x.id]; });
    h += stoBtn((all ? 'seen ' : '') + 'kc-live', avatar() || thumb(D.stories[0]), firstN(), '<em>' + D.stories.length + '</em>');
  } else if(!OWNER && !CHID) h += '<span class="kc-stempty">Сторис пока нет</span>';
  stoBox.innerHTML = h;
  if(CHID) row.hidden = !h;
  var p = $('.kc-recb', stoBox); if(p) p.onclick = openRec;
  var l = $('.kc-live', stoBox);
  if(l) l.onclick = function(){ var s = seen(), i0 = 0; for(var i = 0; i < D.stories.length; i++) if(!s[D.stories[i].id]){ i0 = i; break; } view(D.stories, null, null, i0); };
  /* «＋» канала (#ek-add) — у Андрея становится «● Снять» */
  var ka = $('#ek-add', row);
  if(ka){
    if(OWNER){ ka.hidden = false; ka.style.removeProperty('display'); ka.innerHTML = '<span class="rg"><span style="color:#ff3b30;font-size:26px">●</span></span>Снять'; }
    if(!ka.dataset.kc){ ka.dataset.kc = '1'; ka.addEventListener('click', function(e){ e.stopImmediatePropagation(); e.preventDefault(); openRec(); }, true); }
  }
  var up = $('#ek-upl');
  if(up){ up.textContent = 'Сторис снимаются только здесь, в приложении: живой кружочек до 1 минуты. Видны 24 часа, важное сохрани в «Актуальное».'; if(OWNER){ up.hidden = false; up.style.removeProperty('display'); } }
}
function mountHl(){
  if(!hlBox){
    var row = storyRow();
    if(!row) return;
    hlBox = el('div', 'kc-hlw'); var after = PAGE === 'kanal' && !CHID ? ($('#ek-upl') || row) : row;
    after.parentNode.insertBefore(hlBox, after.nextSibling);
  }
  if(!D.hl.length && !OWNER){ hlBox.hidden = true; return; }
  hlBox.hidden = false;
  var h = '<h4>Актуальное' + (OWNER && !D.hl.length ? '<small>пока пусто</small>' : '') + '</h4><div class="kc-hls">';
  if(OWNER) h += stoBtn('kc-plus kc-hlnew', '', 'Новое', '＋');
  D.hl.forEach(function(x, i){ var f = byId(x.cover) || byId((x.items || [])[0]); h += '<button type="button" class="kc-sto kc-hl" data-i="' + i + '"><span class="kc-rg"><span style="' + (f ? 'background-image:url(\'' + esc(thumb(f)) + '\')' : '') + '"></span></span><span class="kc-t">' + esc(x.title) + '</span></button>'; });
  hlBox.innerHTML = h + '</div>';
  var n = $('.kc-hlnew', hlBox); if(n) n.onclick = function(){ hlEdit(null); };
  $$('.kc-hl', hlBox).forEach(function(b){ b.onclick = function(){ var x = D.hl[+b.dataset.i], it = (x.items || []).map(byId).filter(Boolean); if(!it.length) return OWNER ? hlEdit(x) : toast('Тут пока пусто'); view(it, x.title, x, 0); }; });
}
/* ---------- запись кружочка: только камера приложения, без галереи ---------- */
var R = el('div'); R.id = 'kcRec'; R.hidden = true; R.setAttribute('role', 'dialog');
R.innerHTML = '<div class="kr-top"><button type="button" class="kr-x" aria-label="Закрыть">×</button><span class="kr-live"><i></i>ИДЁТ ЗАПИСЬ</span><button type="button" class="kr-flip" aria-label="Сменить камеру">⟲</button></div>' +
  '<div class="kr-c"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="kr-bg"/><circle cx="50" cy="50" r="48" class="kr-pr" pathLength="100"/></svg><div class="kr-v"><video class="kr-cam" muted playsinline autoplay></video><video class="kr-out" playsinline loop hidden></video></div></div>' +
  '<div class="kr-t"><b>0:00</b><small> / 1:00</small></div><p class="kr-h"></p>' +
  '<div class="kr-btns"><button type="button" class="kr-rec" aria-label="Начать запись"><i></i></button></div>' +
  '<div class="kr-done" hidden><button type="button" class="kr-again">↺ Переснять</button><button type="button" class="kr-send">Отправить ➤</button></div>' +
  '<div class="kr-bar"><b></b></div>';
document.body.appendChild(R);
var rs = null, rr = null, rch = [], rt0 = 0, rraf = 0, rto = 0, rblob = null, rdur = 0, rface = 'user', rcover = null, rstate = '';
function rMime(){
  var l = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for(var i = 0; i < l.length; i++) if(MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(l[i])) return l[i];
  return '';
}
/* демо: если браузер не даёт камеру (окно предпросмотра), рисуем «демо-камеру» */
function rFake(){
  var c = document.createElement('canvas'); c.width = c.height = 480; var g = c.getContext('2d'), t0 = performance.now();
  var st = c.captureStream(30); st.__fake = 1;
  (function f(){ if(rs !== st && rs) return; var t = (performance.now() - t0) / 1000;
    var gr = g.createRadialGradient(240 + Math.sin(t) * 90, 220 + Math.cos(t * .8) * 70, 20, 240, 240, 340); gr.addColorStop(0, '#ffd23f'); gr.addColorStop(.45, '#a8641c'); gr.addColorStop(1, '#120c06');
    g.fillStyle = gr; g.fillRect(0, 0, 480, 480); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 290, 480, 100);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '900 36px Montserrat,sans-serif'; g.fillText('ДЕМО-КАМЕРА', 240, 335); g.font = '700 21px Montserrat,sans-serif'; g.fillText('на телефоне тут будет твоё лицо', 240, 370);
    setTimeout(f, 33); })();
  return st;
}
function rStop(){ if(rs){ rs.getTracks().forEach(function(t){ t.stop(); }); rs = null; } }
function rCam(){
  rStop(); var cam = $('.kr-cam', R), hint = $('.kr-h', R), btn = $('.kr-rec', R);
  hint.textContent = 'Включаю камеру…'; btn.disabled = true;
  var md = navigator.mediaDevices;
  var p = md && md.getUserMedia ? md.getUserMedia({video:{facingMode:rface, width:{ideal:720}, height:{ideal:720}}, audio:{echoCancellation:true, noiseSuppression:true}}) : Promise.reject({name:'NoApi'});
  if(window.KC_DEMO_CAM) p = Promise.race([p, new Promise(function(_, no){ setTimeout(function(){ no({name:'Timeout'}); }, 4000); })]).catch(function(){ return rFake(); });
  p.then(function(st){
    if(R.hidden){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
    rs = st; cam.srcObject = st; cam.classList.toggle('mir', rface === 'user' && !st.__fake);
    var q = cam.play(); if(q && q.catch) q.catch(function(){});
    hint.textContent = st.__fake ? 'Здесь камера браузера недоступна, поэтому показываю демо-камеру. На телефоне будет твоя фронталка.' : 'Нажми красную кнопку и говори. До 1 минуты.';
    btn.disabled = false;
  }, function(){
    hint.innerHTML = '<b>Нет доступа к камере.</b> Разреши камеру и микрофон для сайта: значок 🔒 рядом с адресом → Камера и Микрофон → Разрешить.';
  });
}
function rSet(st){
  rstate = st; R.dataset.st = st;
  $('.kr-done', R).hidden = st !== 'done'; $('.kr-btns', R).hidden = st === 'done' || st === 'wait';
  $('.kr-cam', R).hidden = st === 'done'; $('.kr-out', R).hidden = st !== 'done';
  $('.kr-rec', R).setAttribute('aria-label', st === 'rec' ? 'Остановить запись' : 'Начать запись');
}
function rTime(sec){ $('.kr-t b', R).textContent = Math.floor(sec / 60) + ':' + ('0' + Math.floor(sec % 60)).slice(-2); $('.kr-pr', R).style.strokeDasharray = (sec / STORY_SEC * 100) + ' 100'; }
function openRec(){
  if(!OWNER) return;
  if(!window.MediaRecorder){ toast('Этот браузер не умеет снимать видео. Обнови Chrome или Safari'); return; }
  R.hidden = false; document.documentElement.style.overflow = 'hidden'; rblob = null; rSet('ready'); rTime(0);
  $('.kr-bar', R).classList.remove('on'); $('.kr-send', R).disabled = false; $('.kr-send', R).textContent = 'Отправить ➤';
  rCam();
}
function rFrame(){
  var v = $('.kr-cam', R), w = v.videoWidth, h = v.videoHeight; if(!w) return null;
  var s = Math.min(w, h), c = document.createElement('canvas'); c.width = c.height = 480; var g = c.getContext('2d');
  if(v.classList.contains('mir')){ g.translate(480, 0); g.scale(-1, 1); }
  g.drawImage(v, (w - s) / 2, (h - s) / 2, s, s, 0, 0, 480, 480); return toB64(c, .8);
}
function rStart(){
  if(!rs) return; var mt = rMime(); rch = [];
  try{ rr = new MediaRecorder(rs, mt ? {mimeType:mt, videoBitsPerSecond:1600000, audioBitsPerSecond:96000} : undefined); }
  catch(e){ try{ rr = new MediaRecorder(rs); }catch(e2){ toast('Запись не запустилась. Обнови браузер'); return; } }
  rr.ondataavailable = function(e){ if(e.data && e.data.size) rch.push(e.data); };
  rr.onstop = rDone;
  rr.start(500); rt0 = performance.now(); rcover = null; rSet('rec');
  $('.kr-h', R).textContent = 'Нажми ещё раз, чтобы закончить. В 1:00 запись остановится сама.';
  clearTimeout(rto); rto = setTimeout(rEnd, STORY_SEC * 1000 + 150);
  (function tick(){ if(rstate !== 'rec') return; var s = (performance.now() - rt0) / 1000; rTime(Math.min(s, STORY_SEC)); if(!rcover && s > 0.8) rcover = rFrame(); if(s >= STORY_SEC) return rEnd(); rraf = requestAnimationFrame(tick); })();
}
function rEnd(){
  if(rstate !== 'rec') return; clearTimeout(rto); cancelAnimationFrame(rraf);
  rdur = Math.min(STORY_SEC, (performance.now() - rt0) / 1000); if(!rcover) rcover = rFrame();
  rSet('wait'); try{ rr.stop(); }catch(e){ rDone(); }
}
function rDone(){
  if(R.hidden) return;
  if(rdur < 1 || !rch.length){ toast('Слишком коротко. Сними хотя бы секунду'); rSet('ready'); rTime(0); $('.kr-h', R).textContent = 'Нажми красную кнопку и говори. До 1 минуты.'; return; }
  var type = ((rr && rr.mimeType) || (rch[0] && rch[0].type) || 'video/webm').split(';')[0];
  rblob = new Blob(rch, {type:type});
  var o = $('.kr-out', R); o.src = URL.createObjectURL(rblob); o.classList.toggle('mir', $('.kr-cam', R).classList.contains('mir')); o.muted = false;
  rSet('done'); var q = o.play(); if(q && q.catch) q.catch(function(){ o.muted = true; o.play().catch(function(){}); });
  $('.kr-h', R).textContent = 'Посмотри. Если нравится, жми «Отправить». Сторис будет видна 24 часа.';
}
function rSend(){
  if(!rblob || busy) return; var go = $('.kr-send', R), bar = $('.kr-bar', R);
  busy = true; go.disabled = true; go.textContent = 'Отправляю…'; bar.classList.add('on'); $('b', bar).style.width = '0';
  var ext = /mp4/.test(rblob.type) ? 'mp4' : 'webm', f = new File([rblob], 'story-' + Date.now() + '.' + ext, {type:rblob.type});
  var mir = $('.kr-out', R).classList.contains('mir') ? 1 : 0;
  var cv = rcover ? API.photo(rcover.b64, rcover.mime) : Promise.resolve('');
  cv.then(function(cu){ return API.video(f, function(x){ $('b', bar).style.width = Math.round(x * 100) + '%'; }).then(function(u){ return API.add(PLACE, 'story', {t:'vid', circle:1, u:u, c:cu, d:Math.max(1, Math.round(rdur)), r:'s', m:mir}); }); })
    .then(function(){ busy = false; rClose(); toast('Сторис опубликована'); reload(); }, function(r){ busy = false; go.disabled = false; go.textContent = 'Отправить ➤'; toast(errText(r)); });
}
function rClose(){
  if(busy) return;
  clearTimeout(rto); cancelAnimationFrame(rraf);
  try{ if(rr && rr.state !== 'inactive'){ rr.onstop = null; rr.stop(); } }catch(e){}
  rSet(''); rStop(); var o = $('.kr-out', R); o.pause(); o.removeAttribute('src'); rblob = null;
  R.hidden = true; document.documentElement.style.overflow = '';
}
$('.kr-x', R).onclick = rClose;
$('.kr-rec', R).onclick = function(){ if(rstate === 'rec') rEnd(); else if(rstate === 'ready') rStart(); };
$('.kr-again', R).onclick = function(){ var o = $('.kr-out', R); o.pause(); rblob = null; rSet('ready'); rTime(0); $('.kr-h', R).textContent = 'Нажми красную кнопку и говори. До 1 минуты.'; };
$('.kr-send', R).onclick = rSend;
$('.kr-flip', R).onclick = function(){ if(rstate !== 'ready') return; rface = rface === 'user' ? 'environment' : 'user'; rCam(); };

function hlAddItems(id, ids){
  var x = D.hl.filter(function(h){ return h.id === id; })[0]; if(!x) return Promise.resolve();
  var h = {id:x.id, title:x.title, cover:x.cover, items:(x.items || []).concat(ids)};
  return API.hl(PLACE, h);
}
function hlEdit(x){
  var src = storyAll().slice().sort(function(a, b){ return b.at - a.at; });
  var on = {}; ((x && x.items) || []).forEach(function(id){ on[id] = 1; });
  var b = openSheet(x ? 'Изменить «' + x.title + '»' : 'Новое «Актуальное»', 'Выбери сторис, которые останутся навсегда. Первая отмеченная станет обложкой.' + (src.length ? '' : '<br><b style="color:#ffd23f">Сначала сними хотя бы одну сторис кнопкой «● Снять».</b>'),
    '<input type="text" maxlength="24" placeholder="Название, например «Отзывы» или «Старт»">' +
    '<div class="kc-grid">' + src.map(function(s){ return '<button type="button" data-id="' + esc(s.id) + '" style="background-image:url(\'' + esc(thumb(s)) + '\')"' + (on[s.id] ? ' class="on"' : '') + '>' + (s.t === 'vid' ? '<i>▶</i>' : '') + '</button>'; }).join('') + '</div>' +
    '<button type="button" class="kc-big kc-gold">Сохранить</button>' + (x ? '<button type="button" class="kc-big kc-hldel" style="background:#1b1416;color:#ff8a70;border:1px solid #4a2620;margin-top:10px">Удалить папку</button>' : ''));
  var ti = $('input', b); ti.value = x ? x.title : '';
  var order = ((x && x.items) || []).slice();
  $$('.kc-grid button', b).forEach(function(g){ g.onclick = function(){ var id = g.dataset.id; g.classList.toggle('on'); if(g.classList.contains('on')) order.push(id); else order = order.filter(function(o){ return o !== id; }); }; });
  $('.kc-big.kc-gold', b).onclick = function(){
    var t = ti.value.trim(); if(!t) return toast('Напиши название');
    if(!order.length) return toast('Отметь хотя бы одну сторис');
    API.hl(PLACE, {id:x ? x.id : '', title:t, cover:order[0], items:order}).then(function(){ closeSheet(); toast('Сохранено в «Актуальное»'); reload(); }, function(r){ toast(errText(r)); });
  };
  var dl = $('.kc-hldel', b);
  if(dl) dl.onclick = function(){ if(dl.dataset.sure !== '1'){ dl.dataset.sure = '1'; dl.textContent = 'Точно удалить? Сами сторис останутся в архиве'; return; } API.hldel(x.id).then(function(){ closeSheet(); toast('Папка удалена'); reload(); }); };
}

/* просмотр сторис / «Актуального» */
var V = el('div'); V.id = 'kcView'; V.hidden = true; V.setAttribute('role', 'dialog');
V.innerHTML = '<div class="kv-bars"></div><div class="kv-h"><img alt=""><div><span class="kv-n">Андрей Чулков</span><small class="kv-w"></small></div><button type="button" class="kv-o" aria-label="Меню">⋯</button><button type="button" class="kv-x" aria-label="Закрыть">×</button></div><div class="kv-b"></div><div class="kv-m" hidden></div>';
document.body.appendChild(V);
var vl = [], vi = 0, vt = 0, vraf = 0, vhl = null, vpaused = false;
function view(list, title, hl, start){
  vl = list.slice(); if(!vl.length) return; vi = Math.max(0, Math.min(start || 0, vl.length - 1)); vhl = hl;
  $('img', V).src = avatar() || thumb(vl[0]); $('.kv-n', V).textContent = chName(); $('.kv-m', V).hidden = true;
  V.hidden = false; document.documentElement.style.overflow = 'hidden'; vShow();
}
function vShow(){
  cancelAnimationFrame(vraf); var x = vl[vi]; markSeen(x.id); vpaused = false; $('.kv-m', V).hidden = true;
  $('.kv-bars', V).innerHTML = vl.map(function(_, i){ return '<i><b style="width:' + (i < vi ? 100 : 0) + '%"></b></i>'; }).join('');
  $('.kv-w', V).textContent = (vhl ? vhl.title + ' · ' : '') + when(x.at);
  var b = $('.kv-b', V), med;
  if(x.circle) med = '<div class="kv-bg" style="background-image:url(\'' + esc(x.c || '') + '\')"></div><div class="kv-circ"><video playsinline autoplay src="' + esc(x.u) + '"' + (x.c ? ' poster="' + esc(x.c) + '"' : '') + (x.m ? ' class="mir"' : '') + '></video></div>';
  else med = x.t === 'vid' ? '<video playsinline autoplay src="' + esc(x.u) + '"' + (x.c ? ' poster="' + esc(x.c) + '"' : '') + '></video>' : '<img alt="" src="' + esc(x.u) + '">';
  b.innerHTML = med + (x.cap ? '<div class="kv-cap">' + esc(x.cap) + '</div>' : '') + '<button class="kv-tap l" type="button" aria-label="Назад"></button><button class="kv-tap r" type="button" aria-label="Дальше"></button>';
  $('.kv-tap.l', b).onclick = function(){ if(vi > 0) vi--; vShow(); };
  $('.kv-tap.r', b).onclick = vNext;
  var bar = $$('.kv-bars b', V)[vi], v = $('video', b);
  if(v){
    var p = v.play(); if(p && p.catch) p.catch(function(){ v.muted = true; v.play().catch(function(){}); });
    v.onended = vNext;
    (function st(){ if(V.hidden) return; var dd = isFinite(v.duration) && v.duration > 0 ? v.duration : (x.d || STORY_SEC); bar.style.width = Math.min(100, v.currentTime / dd * 100) + '%'; vraf = requestAnimationFrame(st); })();
  } else {
    vt = performance.now(); var D0 = 6000, acc = 0;
    (function st(){ if(V.hidden) return; var now = performance.now(); if(!vpaused) acc += now - vt; vt = now; var f = Math.min(1, acc / D0); bar.style.width = f * 100 + '%'; if(f >= 1) return vNext(); vraf = requestAnimationFrame(st); })();
  }
}
function vNext(){ if(vi < vl.length - 1){ vi++; vShow(); } else vClose(); }
function vClose(){ cancelAnimationFrame(vraf); var v = $('.kv-b video', V); if(v) v.pause(); $('.kv-b', V).innerHTML = ''; V.hidden = true; document.documentElement.style.overflow = ''; mountStories(); }
$('.kv-x', V).onclick = vClose;
document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ if(!R.hidden) rClose(); else if(!V.hidden) vClose(); else if(!$('#kcPlayer').hidden) closePlayer(); else if(sheet.classList.contains('on')) closeSheet(); } });
function copyText(t){
  if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).catch(function(){ return copy2(t); });
  return copy2(t);
  function copy2(t){ return new Promise(function(ok, no){ var a = el('textarea'); a.value = t; a.style.cssText = 'position:fixed;left:0;top:0;opacity:0'; document.body.appendChild(a); a.select(); var r = false; try{ r = document.execCommand('copy'); }catch(e){} a.remove(); r ? ok() : no(); }); }
}
function storyLink(x){ return location.origin + location.pathname + '?' + (CHID ? 'u=' + CHID + '&' : '') + (ME.id ? 'ref=' + encodeURIComponent(ME.id) + '&' : '') + 's=' + encodeURIComponent(x.id); }
function shareStory(x){
  var u = storyLink(x);
  if(navigator.share) return navigator.share({title:'Сторис · ' + chName() + ' · EAGLES', url:u}).catch(function(){});
  return copyText(u).then(function(){ toast('Ссылка на сторис скопирована'); }, function(){ toast(u); });
}
function hlQuick(x){
  var b = openSheet('В «Актуальное»', 'Сторис останется навсегда, даже когда пройдут 24 часа.', '<input type="text" maxlength="24" placeholder="Название папки, например «Отзывы» или «Старт»"><button type="button" class="kc-big kc-gold">Сохранить</button>');
  var ti = $('input', b); setTimeout(function(){ try{ ti.focus(); }catch(e){} }, 60);
  $('.kc-big', b).onclick = function(){ var t = ti.value.trim(); if(!t) return toast('Напиши название папки');
    API.hl(PLACE, {id:'', title:t, cover:x.id, items:[x.id]}).then(function(){ closeSheet(); toast('Добавлено в «' + t + '»'); reload(); }, function(r){ toast(errText(r)); }); };
}
function vResume(){ vpaused = false; var v0 = $('.kv-b video', V); if(v0) v0.play().catch(function(){}); }
$('.kv-o', V).onclick = function(){
  var m = $('.kv-m', V), x = vl[vi]; if(!m.hidden){ m.hidden = true; return vResume(); }
  vpaused = true; var v = $('.kv-b video', V); if(v) v.pause();
  var h = '<button type="button" data-share="1">🔗 Поделиться ссылкой</button>';
  if(OWNER){
    var free = D.hl.filter(function(g){ return (g.items || []).indexOf(x.id) < 0; });
    if(!D.hl.length) h += '<button type="button" data-new="1">⭐ Добавить в «Актуальное»</button>';
    else { free.forEach(function(g){ h += '<button type="button" data-add="' + esc(g.id) + '">⭐ В «' + esc(g.title) + '»</button>'; }); h += '<button type="button" data-new="1">⭐ Новая папка «Актуального»</button>'; }
    if(vhl) h += '<button type="button" data-out="1">Убрать из «' + esc(vhl.title) + '»</button>';
    h += '<button type="button" class="red" data-del="1">🗑 Удалить сторис</button>';
  } else if(MOD) h += '<button type="button" class="red" data-del="1">🗑 Убрать сторис (модерация)</button>';
  m.innerHTML = h; m.hidden = false;
  m.onclick = function(e){
    var t = e.target.closest('button'); if(!t) return;
    if(t.dataset.share){ m.hidden = true; vResume(); return shareStory(x); }
    if(t.dataset.add) return hlAddItems(t.dataset.add, [x.id]).then(function(){ toast('Добавлено в «Актуальное»'); vClose(); reload(); });
    if(t.dataset.new){ vClose(); return hlQuick(x); }
    if(t.dataset.out){ var g = vhl; return API.hl(PLACE, {id:g.id, title:g.title, cover:g.cover === x.id ? '' : g.cover, items:g.items.filter(function(i){ return i !== x.id; })}).then(function(){ toast('Убрано'); vClose(); reload(); }); }
    if(t.dataset.del){ if(t.dataset.sure !== '1'){ t.dataset.sure = '1'; t.textContent = 'Точно удалить? Нажми ещё раз'; return; } return API.del(x.id).then(function(){ toast('Сторис удалена'); vClose(); reload(); }); }
  };
};

/* ---------- плеер ---------- */
var P = el('div'); P.id = 'kcPlayer'; P.hidden = true; P.innerHTML = '<video playsinline controls></video><button type="button" aria-label="Закрыть">✕</button>';
document.body.appendChild(P);
function play(u){ var pv = document.getElementById('ek-pv'), pl = document.getElementById('ek-player');
  if(PAGE === 'kanal' && pv && pl){ pv.src = u; pl.classList.add('on'); var q = pv.play(); if(q && q.catch) q.catch(function(){}); return; }
  var v = $('video', P); v.src = u; P.hidden = false; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
function closePlayer(){ var v = $('video', P); v.pause(); v.removeAttribute('src'); v.load(); P.hidden = true; }
$('button', P).onclick = closePlayer; P.addEventListener('click', function(e){ if(e.target === P) closePlayer(); });

/* ---------- удалить (две нажатия) ---------- */
function delBtn(id, label){ return OWNER ? '<button type="button" class="kc-del" data-kcdel="' + esc(id) + '" aria-label="Удалить">' + (label || '⋯') + '</button>' : ''; }
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-kcdel]'); if(!b) return;
  e.preventDefault(); e.stopPropagation();
  if(b.dataset.sure !== '1'){ b.dataset.sure = '1'; b.dataset.old = b.textContent; b.textContent = 'Удалить?'; b.classList.add('sure'); setTimeout(function(){ if(b.isConnected){ b.dataset.sure = ''; b.textContent = b.dataset.old; b.classList.remove('sure'); } }, 3000); return; }
  API.del(b.dataset.kcdel).then(function(){ toast('Удалено'); reload(); }, function(r){ toast(errText(r)); });
}, true);

/* ---------- пост (Лента канала) ---------- */
function mediaHtml(m, kanal){
  var h = '';
  if(m.imgs && m.imgs.length){
    h += '<div class="kc-car"><div class="kc-sl">' + m.imgs.map(function(u){ return '<img loading="lazy" alt="" src="' + esc(u) + '">'; }).join('') + '</div>' +
      (m.imgs.length > 1 ? '<span class="kc-n">1/' + m.imgs.length + '</span><div class="kc-dots">' + m.imgs.map(function(_, i){ return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') + '</div>';
  }
  if(m.vid) h += '<button type="button" class="kc-vid' + (m.vid.r === 'v' ? ' v' : '') + '" ' + (kanal ? 'data-video' : 'data-kv') + '="' + esc(m.vid.u) + '"><img alt="" src="' + esc(m.vid.c || '') + '"><span class="kc-pl"></span>' + (m.vid.d ? '<em>' + dur(m.vid.d) + '</em>' : '') + '</button>';
  if(m.link) h += embHtml(m.link, m.v);
  return h;
}
function postHtml(x){
  return '<article class="ek-card kc-post" data-post="k-' + esc(x.id) + '"><div class="kc-ph ek-ph"><img class="kc-av" alt="" src="' + esc(avatar()) + '"><div><b>Андрей</b><small>' + when(x.at) + '</small></div>' +
    (x.link || x.vid ? '<span class="ek-tg">Видео</span>' : '') + delBtn(x.id) + '</div>' +
    (x.text ? '<p>' + textHtml(x.text) + '</p>' : '') + mediaHtml(x, true) + '</article>';
}
function carousels(r){
  $$('.kc-car', r).forEach(function(c){ var sl = $('.kc-sl', c), n = $('.kc-n', c), dots = $$('.kc-dots i', c); if(!n) return;
    sl.onscroll = function(){ var i = Math.round(sl.scrollLeft / sl.clientWidth); n.textContent = (i + 1) + '/' + dots.length; dots.forEach(function(d, k){ d.classList.toggle('on', k === i); }); }; });
}
var postBox = null;
function mountPosts(){
  var L = $('#ek-lenta'); if(!L) return;
  if(!postBox){ postBox = el('div', 'kc-posts'); postBox.style.display = 'contents'; var first = $('article', L); L.insertBefore(postBox, first && /закреплено/.test(first.textContent) ? first.nextSibling : first); }
  var h = OWNER ? '<button type="button" class="kc-own kc-newpost"><b class="kc-gold">＋</b><span>Новый пост<small>Ссылка на ролик VK Видео или Rutube и пара слов</small></span></button>' : '';
  postBox.innerHTML = h + (D.feed || D.posts).map(postHtml).join('') + wallHtml();
  var n = $('.kc-newpost', postBox); if(n) n.onclick = newPost;
  carousels(postBox);
}
function newPost(){
  var b = openSheet('Новый пост', 'Вставь ссылку на ролик в VK Видео или Rutube: в Ленте сразу будет его плеер с превью. Под постом огонёк, комментарии, Swoop и «Поделиться».',
    '<input type="url" inputmode="url" placeholder="Ссылка: vkvideo.ru/… или rutube.ru/video/…"><div class="kc-pv"></div>' +
    '<textarea maxlength="4000" rows="3" placeholder="Пара слов к ролику (не обязательно)"></textarea>' +
    '<button type="button" class="kc-big kc-gold">Опубликовать</button>');
  linkPreview(b);
  var go = $('.kc-big', b);
  go.onclick = function(){
    var text = $('textarea', b).value.trim(), link = $('input[type=url]', b).value.trim();
    if(!link) return toast('Вставь ссылку на ролик VK Видео или Rutube');
    if(!VID_RE.test(link)) return toast('Ссылка только на VK Видео или Rutube');
    go.disabled = true; go.textContent = 'Публикую…';
    API.add(PLACE, 'post', {text:text, link:link})
      .then(function(){ closeSheet(); toast('Пост опубликован'); reload(); }, function(r){ go.disabled = false; go.textContent = 'Опубликовать'; toast(errText(r)); });
  };
}
/* живое превью ссылки в окне добавления */
function linkPreview(b){
  var i = $('input[type=url]', b), pv = $('.kc-pv', b), last = '';
  i.oninput = function(){ var v = i.value.trim(); if(v === last) return; last = v; pv.innerHTML = VID_RE.test(v) && emb(v) ? embHtml(v) : (v ? '<p class="kc-note">Не вижу ролик по этой ссылке. Нужна ссылка на видео VK Видео или Rutube.</p>' : ''); };
}

/* ---------- ролики (вкладка «Ролики» канала) ---------- */
var rlBox = null;
function mountRoliki(){
  var g = $('#ek-roliki .ek-grid'); if(!g) return;
  if(!rlBox){ rlBox = el('span', 'kc-rls'); rlBox.style.display = 'contents'; g.insertBefore(rlBox, g.firstChild); }
  var h = OWNER ? '<button type="button" class="kc-tile-add kc-newrl"><b>＋</b>Ролик</button>' : '';
  h += D.roliki.map(function(x){ return x.link ? '<div class="ek-rl kc-rlv" data-kcid="' + esc(x.id) + '">' + embHtml(x.link) + '<b>' + esc(x.title || 'Ролик') + '</b></div>' : '<button class="ek-rl" type="button" data-video="' + esc(x.u) + '" data-kcid="' + esc(x.id) + '"><img src="' + esc(x.c || '') + '" alt="" loading="lazy">' + (x.d ? '<i>' + dur(x.d) + '</i>' : '') + '<span>' + esc(x.title || 'Ролик') + '</span></button>'; }).join('');
  if(!D.roliki.length && !OWNER) h += '<p class="kc-empty kc-rlempty">Скоро здесь будут ролики</p>';
  rlBox.innerHTML = h;
  var n = $('.kc-newrl', rlBox); if(n) n.onclick = newRolik;
  /* удалить ролик: у Андрея кнопка под сеткой */
  var old = $('#kc-rldel'); if(old) old.remove();
  if(OWNER && D.roliki.length){ var d = el('div', 'kc-empty'); d.id = 'kc-rldel'; d.innerHTML = 'Убрать ролик: ' + D.roliki.map(function(x){ return delBtn(x.id, '× ' + esc((x.title || 'Ролик').slice(0, 18))); }).join(' '); g.parentNode.insertBefore(d, g.nextSibling); }
}
function newRolik(){
  var b = openSheet('Новый ролик', 'Вставь ссылку на ролик в VK Видео или Rutube (клипы и шортсы тоже). Плеер с превью появится во вкладке «Ролики».',
    '<input type="url" inputmode="url" placeholder="Ссылка: vkvideo.ru/clip… или rutube.ru/shorts/…"><div class="kc-pv"></div>' +
    '<input type="text" maxlength="60" placeholder="Название ролика"><label class="kc-note" style="display:flex;gap:8px;align-items:center;margin:0 0 10px"><input type="checkbox" checked> Показать и в Ленте</label>' +
    '<button type="button" class="kc-big kc-gold">Опубликовать</button>');
  linkPreview(b);
  var go = $('.kc-big', b);
  go.onclick = function(){
    var link = $('input[type=url]', b).value.trim(), title = $('input[type=text]', b).value.trim(), toLenta = $('input[type=checkbox]', b).checked;
    if(!VID_RE.test(link)) return toast('Вставь ссылку на ролик VK Видео или Rutube');
    go.disabled = true; go.textContent = 'Публикую…';
    API.add(PLACE, 'rolik', {title:title, link:link, lenta:toLenta ? 1 : 0})
      .then(function(){ closeSheet(); toast('Ролик опубликован'); reload(); }, function(r){ go.disabled = false; go.textContent = 'Опубликовать'; toast(errText(r)); });
  };
}

/* ---------- уроки (общие: Обучение + вкладка «Уроки» канала) ---------- */
var CATS = ['Нейросети', 'Сетевой', 'Монтаж'];
function canSee(x){ return !x.pro || ME.role === 'pro'; }
function lesOpen(x){
  if(!canSee(x)) return toast('Этот урок для EAGLES Pro');
  if(x.link) return;
  if(x.u) return play(x.u);
  var b = openSheet(x.title, x.sub ? esc(x.sub) : '', '<div class="kc-read">' + (x.imgs || []).map(function(u){ return '<img alt="" loading="lazy" src="' + esc(u) + '">'; }).join('') + (x.text ? '<p>' + textHtml(x.text) + '</p>' : '') + '</div>');
}
/* Витрина Обучения (Андрей 17.11): 5 карточек-заготовок. 1–3 яркие с плашкой «СКОРО», 4–5 серые.
   Нажатие — маленькое объявление, урок не открывается. Когда урок готов — Андрей грузит его через «＋ Новый урок»,
   а заготовку отсюда убираем. Обложки — кадры роликов Андрея, лежат в /media/plan-N.webp. */
var PLAN = [
  {t:'Клод к Хрому', k:'ИИ кликает за тебя', c:'Нейросети', i:'/media/plan-1.webp', soon:1},
  {t:'Рилс за вечер', k:'монтаж с Claude', c:'Монтаж', i:'/media/plan-2.webp', soon:1},
  {t:'Как пользоваться EAGLES', k:'профиль, контакты, касания', c:'Сетевой', i:'/media/plan-3.webp', soon:1},
  {t:'Первые 10 касаний', k:'как вести кандидата', c:'Сетевой', i:'/media/plan-4.webp'},
  {t:'LURE без VPN', k:'картинки и видео ИИ', c:'Нейросети', i:'/media/plan-5.webp'}
];
var urBox = null, urBox2 = null;
function planCardK(x, i){
  return '<button class="ek-l kc-l kc-plan' + (x.soon ? '' : ' kc-off') + '" type="button" data-plan="' + i + '"><div class="ek-th"><img src="' + esc(x.i) + '" alt=""><div class="tt">' + esc(x.t) + '<em>' + esc(x.k) + '</em></div><span class="cat">' + esc(x.c) + '</span>' +
    (x.soon ? '<span class="kc-soon">СКОРО</span>' : '<span class="kc-lk2">🔒 ПОЗЖЕ</span>') + '</div><div class="ek-meta"><b>' + esc(x.t) + '</b><span class="free">' + (x.soon ? 'скоро выйдет' : 'откроется позже') + '</span></div></button>';
}
function wallHtml(){ return '<div class="kc-wall"><h4>Скоро в канале</h4><div class="ek-ls">' + PLAN.map(planCardK).join('') + '</div></div>'; }
function lesCard(x, lock){
  return '<div class="les kc-les kc-lcard" data-cat="' + esc(x.cat || '') + '"><div class="kc-lh"><span class="kc-tg">' + esc(x.cat || 'Урок') + '</span>' + (x.pro ? '<span class="kc-tg pro">PRO</span>' : '') + '<small>' + (x.pro ? 'для EAGLES Pro' : 'открыт всем') + '</small><b>' + esc(x.title) + (x.sub ? ' <small>' + esc(x.sub) + '</small>' : '') + '</b></div>' +
    (lock ? '<div class="kc-lockbox" data-kcles="' + esc(x.id) + '">🔒 Урок для EAGLES Pro</div>' : embHtml(x.link)) + (!lock && x.text ? '<p>' + textHtml(x.text) + '</p>' : '') +
    (OWNER ? '<div style="text-align:right;margin-top:6px">' + delBtn(x.id, 'Удалить урок') + '</div>' : '') + '</div>';
}
function mountUrokiObuch(){
  var first = $('.learn-page .les'); var host = first ? first.parentNode : $('#learnMain'); if(!host) return;
  if(!urBox){ urBox = el('div', 'kc-urs'); urBox.style.display = 'contents'; host.insertBefore(urBox, first || null); }
  var h = OWNER ? '<button type="button" class="kc-own kc-newles"><b class="kc-gold">＋</b><span>Новый урок<small>Ссылка на VK Видео или Rutube · всем или только Pro</small></span></button>' : '';
  D.uroki.forEach(function(x){
    var lock = !canSee(x);
    if(x.link || x.locked){ h += lesCard(x, lock); return; }
    h += '<button type="button" class="les kc-les' + (lock ? ' kc-lock' : '') + '" data-kcles="' + esc(x.id) + '" data-cat="' + esc(x.cat || '') + '"><span class="cov"><img class="egph" src="' + esc(x.c || (x.imgs || [])[0] || '') + '" alt=""><span class="hero-shade"></span><b>' + esc((x.title || '').toUpperCase()) + '</b>' + (x.sub ? '<i>' + esc(x.sub.toUpperCase()) + '</i>' : '') + '<span class="tag">' + esc((x.cat || 'Урок').toUpperCase()) + '</span><span class="dur">' + (x.u ? (x.d ? dur(x.d) : '▶') : 'читать') + '</span>' + (lock ? '<span class="kc-lk">🔒 PRO</span>' : '') + '</span><span class="lt"><b>' + esc(x.title) + '</b><small>' + (x.pro ? 'Для EAGLES Pro' : 'Открыт всем') + '</small></span></button>' + (OWNER ? '<span class="kc-lesdel" style="display:block;text-align:right">' + delBtn(x.id, 'Удалить урок') + '</span>' : '');
  });
  PLAN.forEach(function(x, i){
    h += '<button type="button" class="les kc-plan' + (x.soon ? '' : ' kc-off') + '" data-plan="' + i + '" data-cat="' + esc(x.c) + '"><span class="cov"><img class="egph" src="' + esc(x.i) + '" alt=""><span class="hero-shade"></span><b>' + esc(x.t.toUpperCase()) + '</b><i>' + esc(x.k.toUpperCase()) + '</i><span class="tag">' + esc(x.c.toUpperCase()) + '</span>' + (x.soon ? '<span class="kc-soon">СКОРО</span>' : '<span class="kc-lk">🔒 ПОЗЖЕ</span>') + '</span><span class="lt"><b>' + esc(x.t) + '</b><small>' + (x.soon ? 'Скоро выйдет' : 'Откроется позже') + '</small></span></button>';
  });
  urBox.innerHTML = h;
  /* старые карточки страницы прячем — вместо них витрина */
  $$('.learn-page .les:not(.kc-les):not(.kc-plan)').forEach(function(l){ l.style.display = 'none'; l.classList.add('kc-old'); });
  var n = $('.kc-newles', urBox); if(n) n.onclick = newLesson;
  var cnt = $('.learn-page .lchip'); if(cnt){ var k = $$('.learn-page .les:not(.kc-old)').length; cnt.textContent = k + ' ' + (k % 10 === 1 && k % 100 !== 11 ? 'урок' : (k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 10 || k % 100 >= 20)) ? 'урока' : 'уроков'); }
  segWire();
}
/* «Все / Нейросети / Сетевой» — теперь работают */
function segWire(){
  var seg = $('.learn-page .seg'); if(!seg || seg.dataset.kc) return; seg.dataset.kc = '1';
  if(!$('[data-cat="Монтаж"]', seg)){ var m = el('button', '', 'Монтаж'); m.type = 'button'; seg.appendChild(m); }
  $$('button', seg).forEach(function(b){ b.removeAttribute('data-soon'); b.onclick = null; b.dataset.cat = b.textContent.trim() === 'Все' ? '' : b.textContent.trim(); });
  seg.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return; e.stopImmediatePropagation();
    $$('button', seg).forEach(function(x){ x.classList.toggle('on', x === b); });
    var c = b.dataset.cat;
    $$('.learn-page .les:not(.kc-old)').forEach(function(l){
      var t = l.dataset.cat || (($('.tag', l) || {}).textContent || '');
      var hit = !c || t.toLowerCase().indexOf(c.toLowerCase().slice(0, 5)) >= 0;
      l.style.display = hit ? '' : 'none';
      var nx = l.nextElementSibling; if(nx && nx.classList.contains('kc-lesdel')) nx.style.display = hit ? '' : 'none';
    });
  }, true);
}
function mountUrokiKanal(){
  var op = $('#ek-open'), cl = $('#ek-closed'); if(!op || !cl) return;
  function card(x){
    var lock = !canSee(x);
    if(x.link || x.locked) return lesCard(x, lock);
    return '<button class="ek-l kc-l' + (lock ? ' lock' : '') + '" type="button" data-kcles="' + esc(x.id) + '"><div class="ek-th"><img src="' + esc(x.c || (x.imgs || [])[0] || '') + '" alt=""><div class="tt">' + esc(x.title) + (x.sub ? '<em>' + esc(x.sub) + '</em>' : '') + '</div><span class="cat">' + esc(x.cat || 'Урок') + '</span><span class="du">' + (x.u ? dur(x.d) || '▶' : 'читать') + '</span><span class="lk">🔒 PRO</span></div><div class="ek-meta"><b>' + esc(x.title) + '</b>' + (x.pro ? '<span>PRO</span>' : '<span class="free">открыт всем</span>') + '</div></button>';
  }
  var a = $('.kc-uo', op) || op.insertBefore(el('span', 'kc-uo'), op.firstChild), z = $('.kc-uc', cl) || cl.insertBefore(el('span', 'kc-uc'), cl.firstChild);
  a.style.display = z.style.display = 'contents';
  a.innerHTML = (OWNER ? '<button type="button" class="kc-own kc-newles"><b class="kc-gold">＋</b><span>Новый урок<small>Появится и здесь, и в «Обучении»</small></span></button>' : '') + D.uroki.filter(function(x){ return !x.pro; }).map(card).join('') + PLAN.map(planCardK).join('');
  z.innerHTML = D.uroki.filter(function(x){ return x.pro; }).map(card).join('');
  var n = $('.kc-newles', a); if(n) n.onclick = newLesson;
}
document.addEventListener('click', function(e){
  var pl = e.target.closest('[data-plan]'); if(pl){ e.preventDefault(); e.stopImmediatePropagation(); var px = PLAN[+pl.dataset.plan]; toast(px.soon ? '«' + px.t + '» скоро выйдет. Следи за сторис, анонс будет там' : 'Этот урок откроется позже'); return; }
  var b = e.target.closest('[data-kcles]'); if(b){ e.preventDefault(); e.stopImmediatePropagation(); var x = D.uroki.filter(function(u){ return u.id === b.dataset.kcles; })[0]; if(x) lesOpen(x); return; }
  var v = e.target.closest('[data-kv]'); if(v){ e.preventDefault(); play(v.dataset.kv); }
}, true);
function newLesson(){
  var b = openSheet('Новый урок', 'Урок появится в «Обучении» и во вкладке «Уроки» канала. Видео — ссылкой на VK Видео или Rutube, плеер с превью будет прямо в карточке.',
    '<input type="text" class="kc-t1" maxlength="60" placeholder="Название, например «Клод к Хрому»"><input type="text" class="kc-t2" maxlength="60" placeholder="Подзаголовок (не обязательно)">' +
    '<div class="kc-row kc-cat">' + CATS.map(function(c, i){ return '<button type="button" class="kc-chip' + (i ? '' : ' on') + '">' + c + '</button>'; }).join('') + '</div>' +
    '<div class="kc-row kc-acc"><button type="button" class="kc-chip on" data-pro="0">Открыт всем</button><button type="button" class="kc-chip" data-pro="1">🔒 Только Pro</button></div>' +
    '<input type="url" inputmode="url" placeholder="Ссылка на урок: vkvideo.ru/… или rutube.ru/video/…"><div class="kc-pv"></div>' +
    '<textarea maxlength="6000" rows="3" placeholder="Описание урока (не обязательно)"></textarea>' +
    '<button type="button" class="kc-big kc-gold">Опубликовать урок</button><p class="kc-note">Pro-урок гости и FREE видят с замком: без видео и описания.</p>');
  function one(row){ $$('.kc-chip', row).forEach(function(c){ c.onclick = function(){ $$('.kc-chip', row).forEach(function(x){ x.classList.toggle('on', x === c); }); }; }); }
  one($('.kc-cat', b)); one($('.kc-acc', b)); linkPreview(b);
  var go = $('.kc-big', b);
  go.onclick = function(){
    var title = $('.kc-t1', b).value.trim(), sub = $('.kc-t2', b).value.trim(), text = $('textarea', b).value.trim(), link = $('input[type=url]', b).value.trim();
    var cat = $('.kc-cat .on', b).textContent, pro = $('.kc-acc .on', b).dataset.pro === '1';
    if(!title) return toast('Напиши название урока');
    if(!VID_RE.test(link)) return toast('Вставь ссылку на урок в VK Видео или Rutube');
    go.disabled = true; go.textContent = 'Публикую…';
    API.add('uroki', 'urok', {title:title, sub:sub, cat:cat, pro:pro ? 1 : 0, text:text, link:link})
      .then(function(){ closeSheet(); toast('Урок опубликован'); reload(); }, function(r){ go.disabled = false; go.textContent = 'Опубликовать урок'; toast(errText(r)); });
  };
}

/* ---------- загрузка и отрисовка ---------- */
function norm(r){
  r = r || {};
  var now = Date.now(), st = (r.stories || []).filter(function(x){ return now - x.at < DAY; }).sort(function(a, b){ return a.at - b.at; });
  var arch = (r.arch || []).concat((r.stories || []).filter(function(x){ return now - x.at >= DAY; }));
  return {stories:st, arch:arch, hl:r.hl || [], posts:(r.posts || []).slice().sort(function(a, b){ return b.at - a.at; }),
    roliki:(r.roliki || []).slice().sort(function(a, b){ return b.at - a.at; }), uroki:(r.uroki || []).slice().sort(function(a, b){ return b.at - a.at; })};
}
function draw(){
  mountStories(); mountHl();
  if(CHID) return;
  if(PAGE === 'kanal'){
    /* ролики с галочкой «и в Ленте» становятся постами-видео */
    D.feed = D.posts.concat(D.roliki.filter(function(x){ return x.lenta; }).map(function(x){ return x.link ? {id:x.id, text:x.title || '', link:x.link, at:x.at} : {id:x.id, text:x.title || '', vid:{u:x.u, c:x.c, d:x.d, r:x.r}, at:x.at}; })).sort(function(a, b){ return b.at - a.at; });
    mountPosts(); mountRoliki(); mountUrokiKanal();
  } else mountUrokiObuch();
  if(window.EK_POSTS && window.EK_POSTS.refresh) window.EK_POSTS.refresh();
}
function reload(){
  var a = API.list(PLACE), u = CHID ? Promise.resolve({}) : API.list('uroki');
  return Promise.all([a, u]).then(function(r){ D = norm(r[0]); D.uroki = norm(r[1]).uroki; draw(); }, function(){ draw(); });
}
var deep = (function(){ try{ return new URLSearchParams(location.search).get('s') || ''; }catch(e){ return ''; } })();
function openDeep(){
  if(!deep) return; var id = deep; deep = '';
  var i = D.stories.map(function(x){ return x.id; }).indexOf(id);
  if(i >= 0) return view(D.stories, null, null, i);
  for(var k = 0; k < D.hl.length; k++){ var it = (D.hl[k].items || []).map(byId).filter(Boolean), j = it.map(function(x){ return x.id; }).indexOf(id); if(j >= 0) return view(it, D.hl[k].title, D.hl[k], j); }
  toast('Эта сторис уже исчезла: сторис живут 24 часа');
}
function start(){ D = norm({}); draw(); reload().then(openDeep); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
window.KC = {reload:reload};
})();
