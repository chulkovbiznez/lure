/* EAGLES · Канал (EYRIE) · kanal-posty.js v4 · 18.11.2026 (v4: свой комментарий можно изменить и удалить; хозяин канала может удалить чужой — сервер KANAL COMMENTS v1)
   v3: window.EK_POSTS.refresh — для постов, которые дорисовал eg-kontent.js
   Под каждым постом: 🔥 лайк, 💬 комментарии, Swoop, «Поделиться» (соцсети + «Скопировать ссылку»).
   v2: Swoop кладёт пост в свой канал человека (kanal.html?u=ID) с подписью «Swoop из канала …»; ссылки — только у «Поделиться».
   У каждого поста и вкладки своя ссылка:  /kanal.html?ref=ID&p=ПОСТ   или   /kanal.html?ref=ID&t=ВКЛАДКА
   Ссылка несёт ID того, кто делится (если он вошёл в EAGLES), иначе ref, по которому пришли (владелец канала).
   Права: гость — смотрит и делится; FREE — + лайк; PRO — + комментарий и Swoop.
   Счётчики: сервер EAGLES (блок KANAL POSTS v1: kp_get / kp_coms / kp_like / kp_com / kp_swoop / kp_cdel). Пока сервер их не знает,
   кнопки работают на этом устройстве, а счётчики не показываются (window.EK_POSTS_API задаёт свой источник). */
(function(){
'use strict';
var root = document.getElementById('eagles-kanal'); if(!root || root.dataset.kp) return; root.dataset.kp = '1';
var SITE = 'https://app.eaglesteam.ru/kanal.html';
var BACKEND = 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
var OWNERS = ['11111', '23933'];
var TABS = {lenta:'Лента', roliki:'Ролики', uroki:'Уроки', free:'Бесплатно'};
var CH_TITLE = 'канал Андрея';

function $(s, r){ return (r || root).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || root).querySelectorAll(s)); }
function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function toast(m){ var t = el('div', 'ek-toast'); t.textContent = m; document.body.appendChild(t); setTimeout(function(){ t.style.opacity = '0'; }, 2200); setTimeout(function(){ t.remove(); }, 2700); }
function okRef(r){ return r && /^[A-Za-z0-9_-]{1,32}$/.test(r); }
var Q = {}; try{ new URLSearchParams(location.search).forEach(function(v, k){ Q[k] = v; }); }catch(e){}
/* Чей канал: ?u=ID — свой канал Pro-пользователя; без u (или 11111/23933) — канал Андрея */
var CH = window.EK_CHANNEL || (Q.u && /^[A-Za-z0-9_]{4,16}$/.test(Q.u) && OWNERS.indexOf(Q.u) < 0 ? Q.u.toLowerCase() : '11111');
window.EK_CHANNEL = CH; var MINE_CH = CH !== '11111';

/* ---------- кто смотрит ---------- */
function me(){
  if(window.EK_DEMO_ROLE) return window.EK_DEMO_ROLE;
  var id = ls('eaglesfree_id'), ss = ls('eaglesfree_session');
  if(!id || !ss) return {role:'guest'};
  var pro = OWNERS.indexOf(id) >= 0 || ls('eaglesfree_plan') === 'pro';
  return {role: pro ? 'pro' : 'free', id: id, name: ls('eaglesfree_name') || ''};
}
function shareRef(){
  var m = me(); if(m.id) return m.id;
  if(okRef(Q.ref)) return Q.ref;
  if(MINE_CH) return CH;
  var s = ls('eagles_ref'); return okRef(s) ? s : '11111';
}
function linkFor(kind, val){
  var u = SITE + '?' + (MINE_CH ? 'u=' + encodeURIComponent(CH) + '&' : '') + 'ref=' + encodeURIComponent(shareRef());
  if(!me().id && (Q.s === 'L' || Q.s === 'R')) u += '&s=' + Q.s;
  return u + (kind === 'p' ? '&p=' : '&t=') + encodeURIComponent(val);
}

/* ---------- id постов ---------- */
function slug(src){ return String(src || '').split('/').pop().replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-'); }
function pidOf(card, i){
  if(card.dataset.post) return card.dataset.post;
  if(card.classList.contains('ek-poll')) return 'opros';
  if(card.classList.contains('ek-ref')) return 'druzyam';
  var v = card.querySelector('[data-video]'); if(v) return slug(v.dataset.video);
  var c = card.querySelector('.ek-cv video'); if(c) return 'krug-' + slug(c.getAttribute('src')).replace(/^k/, '');
  var l = card.querySelector('[data-lesson]'); if(l) return 'urok-' + (+l.dataset.lesson + 1);
  return i === 0 ? 'start' : 'post-' + (i + 1);
}
function titleOf(card){
  var h = card.querySelector('h3, .ek-cap, .ek-meta b'), p = card.querySelector('p');
  var t = ((h && h.textContent.trim()) || (p && p.textContent.trim()) || 'Пост').replace(/^\d+\.\s*/, '');
  t = t.replace(/\s+/g, ' '); return t.length > 70 ? t.slice(0, 67) + '…' : t;
}

/* ---------- данные: сервер EAGLES или это устройство ---------- */
var LOCAL = 'ek_kp_v1';
function localDb(){ try{ return JSON.parse(ls(LOCAL) || '{}'); }catch(e){ return {}; } }
function localSave(d){ ls(LOCAL, JSON.stringify(d)); }
var API = window.EK_POSTS_API || {
  live: false,
  call: function(action, data){
    var sess = ls('eaglesfree_session') || '', chq = data.ch || window.EK_CHANNEL || '11111';
    var q = BACKEND + '?action=' + action + '&ch=' + encodeURIComponent(chq) + (sess ? '&sess=' + encodeURIComponent(sess) : '') + '&_=' + Date.now();
    for(var k in data) if(k !== 'ch') q += '&' + k + '=' + encodeURIComponent(data[k]);
    return fetch(q).then(function(r){ return r.json(); }).then(function(r){ if(!r || !r.ok) throw r; API.live = true; return r; });
  },
  get: function(ids){ return API.call('kp_get', {ids: ids.join(',')}).then(function(r){ return r.posts || {}; }); },
  like: function(p, on){ return API.call('kp_like', {p: p, on: on ? 1 : 0}); },
  com: function(p, text){ return API.call('kp_com', {p: p, text: text}); },
  coms: function(p){ return API.call('kp_coms', {p: p}).then(function(r){ return r.items || []; }); },
  cedit: function(p, k, text){ return API.call('kp_cedit', {p: p, k: k, text: text}); },
  cdel: function(p, k){ return API.call('kp_cdel', {p: p, k: k}); },
  swoop: function(src, on, snap){ var d = {ch: src.ch, p: src.p, on: on ? 1 : 0}; if(snap){ d.t = snap.t; d.x = snap.x; d.i = snap.i; } return API.call('kp_swoop', d); }
};
var S = {}; /* p -> {l, c, s, my, sw} */
function st(p){ return S[p] || (S[p] = {l:0, c:0, s:0, my:false, sw:false}); }

/* ---------- значки ---------- */
var IC = {
  fire: '<svg viewBox="0 0 24 24"><path d="M12 2.5c.8 3.2 4.8 5.4 4.8 10.2A4.8 4.8 0 0 1 12 21.5a4.8 4.8 0 0 1-4.8-4.8c0-2.4 1.3-3.6 2.3-4.9.3 1.5 1 2.3 1.9 2.6-.6-3.4.2-7.2.6-11.9z"/></svg>',
  com: '<svg viewBox="0 0 24 24"><path d="M4 5.5h16v10H9l-5 4z"/></svg>',
  swoop: '<svg viewBox="0 0 24 24"><path d="M3 6c4 0 6.5 2 8.2 5.6C13 15.4 15.6 18 21 18"/><path d="M17.5 14.5 21 18l-3.5 3.5"/><path d="M3 6l3.6-2.4M3 6l2.4 3.4"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>'
};

/* ---------- стили ---------- */
var css = el('style'); css.id = 'kpCss'; css.textContent = [
'#eagles-kanal .ek-act{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:11px;border-top:1px solid rgba(255,210,63,.13)}',
'#eagles-kanal .ek-act>button{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:36px;min-width:36px;padding:0 10px;border-radius:999px;border:1px solid #2a2622;background:#0d0c0f;color:#e9e3d9;font:800 13px "Montserrat",sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .15s,border-color .2s,color .2s}',
'#eagles-kanal .ek-act>button:active{transform:scale(.92)}',
'#eagles-kanal .ek-act svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}',
'#eagles-kanal .ek-act b:empty{display:none}#eagles-kanal .ek-act b{font-weight:800}',
'#eagles-kanal .ek-act .kp-like.on{color:#ffb547;border-color:rgba(255,181,71,.55);background:rgba(255,140,40,.12)}',
'#eagles-kanal .ek-act .kp-like.on svg{fill:url(#kpFire);stroke:#ff9a3c}',
'#eagles-kanal .ek-act .kp-like.pop svg{animation:kpPop .5s cubic-bezier(.2,1.6,.4,1)}',
'@keyframes kpPop{0%{transform:scale(1)}40%{transform:scale(1.45) rotate(-8deg)}100%{transform:scale(1)}}',
'#eagles-kanal .ek-act .kp-sw.on{color:#ffd23f;border-color:rgba(255,210,63,.55)}',
'#eagles-kanal .ek-act .kp-sp{flex:1}',
'#eagles-kanal .ek-act .kp-sh{background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;border:0;padding:0;width:40px;height:40px;box-shadow:0 6px 16px rgba(255,190,40,.25)}',
'#eagles-kanal .ek-act .kp-sh svg{stroke-width:2.4}',
'#eagles-kanal .ek-act.mini{border:0;margin-top:8px;padding-top:0}',
'#eagles-kanal .kp-wrap{position:relative}',
'#eagles-kanal .kp-mini{position:absolute;top:8px;right:8px;z-index:2;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,210,63,.45);background:rgba(10,9,8,.72);color:#ffd23f;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}',
'#eagles-kanal .kp-mini svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}',
'#eagles-kanal .kp-tlink{display:flex;align-items:center;gap:8px;margin:2px 2px 12px;color:#a29b90;font:700 12.5px "Montserrat",sans-serif}',
'#eagles-kanal .kp-tlink button{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,210,63,.3);background:rgba(255,210,63,.06);color:#ffd23f;border-radius:999px;padding:7px 12px;font:800 12.5px "Montserrat",sans-serif;cursor:pointer}',
'#eagles-kanal .kp-tlink svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}',
'#eagles-kanal .ek-hl{position:relative}',
'#eagles-kanal .ek-hl::after{content:"";position:absolute;inset:-2px;border-radius:24px;pointer-events:none;animation:kpHl 3.4s ease-out forwards}',
'@keyframes kpHl{0%,45%{box-shadow:0 0 0 3px #ffd23f,0 0 46px rgba(255,210,63,.6)}100%{box-shadow:0 0 0 3px rgba(255,210,63,0),0 0 46px rgba(255,210,63,0)}}',
'#eagles-kanal .kp-sheet h2{display:flex;align-items:center;gap:8px}',
'#eagles-kanal .kp-url{display:flex;gap:8px;align-items:center;background:#0d0c0f;border:1px solid #2a2622;border-radius:14px;padding:6px 6px 6px 12px;margin:4px 0 14px}',
'#eagles-kanal .kp-url span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e9e3d9;font:600 13px ui-monospace,Menlo,monospace}',
'#eagles-kanal .kp-url button{flex:none;border:0;border-radius:10px;padding:10px 14px;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;font:900 13.5px "Montserrat",sans-serif;cursor:pointer}',
'#eagles-kanal .kp-url button.ok{background:#2f7d43;color:#fff}',
'#eagles-kanal .kp-soc{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}',
'#eagles-kanal .kp-soc a,#eagles-kanal .kp-soc button{display:flex;flex-direction:column;align-items:center;gap:6px;color:#e9e3d9;font:700 11.5px "Montserrat",sans-serif;text-decoration:none;background:none;border:0;cursor:pointer;padding:0}',
'#eagles-kanal .kp-soc i{width:50px;height:50px;border-radius:16px;display:flex;align-items:center;justify-content:center;font:900 15px "Montserrat",sans-serif;color:#fff;font-style:normal}',
'#eagles-kanal .kp-soc svg{width:24px;height:24px}',
'#eagles-kanal .kp-note{font:600 12.5px/1.45 "Montserrat",sans-serif;color:#a29b90;margin:0}',
'#eagles-kanal .kp-note b{color:#ffd23f}',
'#eagles-kanal .kp-coms{max-height:46vh;overflow:auto;margin:0 -4px 12px;padding:0 4px}',
'#eagles-kanal .kp-c{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #221f1b}',
'#eagles-kanal .kp-c .av{flex:none;width:36px;height:36px;border-radius:50%;border:2px solid #ffd23f;display:flex;align-items:center;justify-content:center;background:#1d1912;color:#ffd23f;font:900 13px "Montserrat",sans-serif}',
'#eagles-kanal .kp-c b{display:block;color:#f4f4f2;font:800 13px "Montserrat",sans-serif}#eagles-kanal .kp-c b small{color:#8a837a;font-weight:600;margin-left:6px}',
'#eagles-kanal .kp-c p{margin:2px 0 0!important;color:#dcd5c9!important;font:600 14px/1.4 "Montserrat",sans-serif!important}',
'#eagles-kanal .kp-empty{color:#8a837a;font:600 13.5px "Montserrat",sans-serif;padding:14px 0;text-align:center}',
'#eagles-kanal .kp-in{display:flex;gap:8px}',
'#eagles-kanal .kp-in input{flex:1;min-width:0;background:#0d0c0f;border:1px solid #2a2622;border-radius:14px;padding:12px 14px;color:#f4f4f2;font:600 15px "Montserrat",sans-serif;outline:none}',
'#eagles-kanal .kp-in input:focus{border-color:#ffd23f}',
'#eagles-kanal .kp-in button{flex:none;border:0;border-radius:14px;padding:0 16px;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;font:900 14px "Montserrat",sans-serif;cursor:pointer}',
'#eagles-kanal .kp-lockmsg{display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(255,210,63,.06);border:1px solid rgba(255,210,63,.25);border-radius:14px;padding:12px 14px;color:#e9e3d9;font:700 13.5px/1.35 "Montserrat",sans-serif}',
'#eagles-kanal .kp-lockmsg a{flex:none;color:#1a1205;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);border-radius:10px;padding:9px 12px;text-decoration:none;font:900 13px "Montserrat",sans-serif}',
'#eagles-kanal .kp-c>div{flex:1;min-width:0}',
'#eagles-kanal .kp-c p{word-wrap:break-word}',
'#eagles-kanal .kp-c .kp-cm{flex:none;align-self:flex-start;width:32px;height:32px;margin:-4px -4px 0 0;border:0;border-radius:50%;background:none;color:#8a837a;font:900 18px/1 "Montserrat",sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}',
'#eagles-kanal .kp-c .kp-cm:active,#eagles-kanal .kp-c.open .kp-cm{background:#1d1a16;color:#ffd23f}',
'#eagles-kanal .kp-c .kp-ed{color:#8a837a;font:600 11.5px "Montserrat",sans-serif;margin-left:4px}',
'#eagles-kanal .kp-cmenu{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}',
'#eagles-kanal .kp-cmenu button{border:1px solid #2a2622;background:#0d0c0f;color:#e9e3d9;border-radius:999px;padding:8px 14px;font:800 13px "Montserrat",sans-serif;cursor:pointer}',
'#eagles-kanal .kp-cmenu button.red{border-color:rgba(255,90,70,.45);color:#ff8a76}',
'#eagles-kanal .kp-cmenu button.redf{border:0;background:#c8412e;color:#fff}',
'#eagles-kanal .kp-cmenu span{width:100%;color:#dcd5c9;font:700 13px "Montserrat",sans-serif}',
'#eagles-kanal .kp-edbar{display:flex;align-items:center;gap:8px;margin:0 0 8px;padding:8px 10px 8px 12px;border-left:3px solid #ffd23f;background:rgba(255,210,63,.06);border-radius:10px;color:#ffd23f;font:800 12.5px "Montserrat",sans-serif}',
'#eagles-kanal .kp-edbar[hidden]{display:none}',
'#eagles-kanal .kp-edbar span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#a29b90;font-weight:600}',
'#eagles-kanal .kp-edbar button{flex:none;width:28px;height:28px;border-radius:50%;border:1px solid #2a2622;background:#0d0c0f;color:#a29b90;font-size:15px;cursor:pointer}',
'#eagles-kanal .kp-x{margin-left:auto;width:34px;height:34px;border-radius:50%;border:1px solid #2a2622;background:#0d0c0f;color:#a29b90;font-size:18px;cursor:pointer}'
,
'#ek-dim.on{z-index:55!important}',
'#eagles-kanal .ek-sheet{z-index:60!important}',
'#eagles-kanal .kp-my{margin-left:auto;flex:none;border:1px solid rgba(255,210,63,.45);border-radius:999px;padding:7px 12px;color:#ffd23f;font:800 12.5px "Montserrat",sans-serif;text-decoration:none;white-space:nowrap}',
'#eagles-kanal .kp-ini{display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#3a2a12,#14100b);color:#ffd23f;font:900 20px "Montserrat",sans-serif}',
'#eagles-kanal .kp-ava{flex:none;width:36px;height:36px;border-radius:50%;overflow:hidden;border:1.5px solid #ffd23f}',
'#eagles-kanal .kp-ava img{width:100%;height:100%;object-fit:cover}',
'#eagles-kanal .kp-ava.kp-ini{font-size:14px}',
'#eagles-kanal .kp-new{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}',
'#eagles-kanal .kp-new b{color:#ffd23f;font:900 15px "Montserrat",sans-serif}',
'#eagles-kanal .kp-new textarea,#eagles-kanal .kp-new input,#eagles-kanal .kp-col textarea{width:100%;box-sizing:border-box;background:#0d0c0f;border:1px solid #2a2622;border-radius:14px;padding:12px 14px;color:#f4f4f2;font:600 15px/1.4 "Montserrat",sans-serif;outline:none;resize:vertical}',
'#eagles-kanal .kp-new textarea:focus,#eagles-kanal .kp-new input:focus,#eagles-kanal .kp-col textarea:focus{border-color:#ffd23f}',
'#eagles-kanal .kp-new button{align-self:flex-end;border:0;border-radius:14px;padding:12px 18px;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;font:900 14px "Montserrat",sans-serif;cursor:pointer}',
'#eagles-kanal .kp-new button:disabled{opacity:.5}',
'#eagles-kanal .kp-col{flex-direction:column}',
'#eagles-kanal .kp-col button{padding:12px}',
'#eagles-kanal .kp-own{color:#dcd5c9;font:600 13.5px/1.45 "Montserrat",sans-serif;border-style:dashed!important}',
'#eagles-kanal .kp-own b{color:#ffd23f}',
'#eagles-kanal .kp-del{margin-left:auto;min-width:34px;height:30px;border-radius:999px;border:1px solid #2a2622;background:#0d0c0f;color:#a29b90;font:800 13px "Montserrat",sans-serif;padding:0 10px}',
'#eagles-kanal .kp-del.sure{color:#ff8a70;border-color:#ff8a70}',
'#eagles-kanal .kp-vid{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:10px 14px;border-radius:12px;background:rgba(255,210,63,.08);border:1px solid rgba(255,210,63,.35);color:#ffd23f;font:800 13.5px "Montserrat",sans-serif;text-decoration:none}',
'#eagles-kanal .kp-vrow{display:flex;gap:12px;align-items:center;text-decoration:none;color:#e9e3d9;font:700 14px/1.35 "Montserrat",sans-serif}',
'#eagles-kanal .kp-vrow i{flex:none;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,210,63,.12);color:#ffd23f;font-style:normal}',
'#eagles-kanal .kp-vrow small{display:block;color:#8a837a;font-weight:600;margin-top:3px}',
'#eagles-kanal .kp-swok{display:flex;gap:12px;align-items:center;background:rgba(255,210,63,.07);border:1px solid rgba(255,210,63,.3);border-radius:16px;padding:12px;margin:6px 0 12px}',
'#eagles-kanal .kp-swok img,#eagles-kanal .kp-swok i{flex:none;width:58px;height:58px;border-radius:12px;object-fit:cover;background:#1d1912;display:flex;align-items:center;justify-content:center;color:#ffd23f;font:900 22px "Montserrat",sans-serif;font-style:normal}',
'#eagles-kanal .kp-swok b{display:block;color:#ffd23f;font:900 15px "Montserrat",sans-serif}',
'#eagles-kanal .kp-swok span{display:block;color:#e9e3d9;font:700 13px/1.35 "Montserrat",sans-serif;margin-top:3px}',
'#eagles-kanal .kp-gold{display:block;text-align:center;margin:14px 0 8px;border:0;border-radius:14px;padding:14px;background:linear-gradient(180deg,#fff0b8,#ffd23f 50%,#c8901c);color:#1a1205;font:900 15px "Montserrat",sans-serif;text-decoration:none;cursor:pointer}',
'#eagles-kanal .kp-undo{display:block;width:100%;border:0;background:none;color:#8a837a;font:700 13px "Montserrat",sans-serif;padding:8px;cursor:pointer}',
'#eagles-kanal .kp-swh{display:flex;align-items:center;gap:6px;margin:0 0 10px;color:#ffd23f;font:800 12.5px "Montserrat",sans-serif}',
'#eagles-kanal .kp-swh svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}',
'#eagles-kanal .kp-swc{display:block;border:1px solid #2a2622;border-radius:16px;overflow:hidden;background:#0d0c0f;text-decoration:none;color:inherit}',
'#eagles-kanal .kp-swc img{display:block;width:100%;max-height:340px;object-fit:cover}',
'#eagles-kanal .kp-swc div{padding:12px 14px}',
'#eagles-kanal .kp-swc b{display:block;color:#f4f4f2;font:900 15.5px/1.3 "Montserrat",sans-serif}',
'#eagles-kanal .kp-swc span{display:block;color:#cfc7ba;font:600 13.5px/1.45 "Montserrat",sans-serif;margin-top:5px}',
'#eagles-kanal .kp-swc em{display:inline-block;margin-top:10px;color:#ffd23f;font:800 13px "Montserrat",sans-serif;font-style:normal}'].join('\n');
document.head.appendChild(css);
var defs = el('div'); defs.innerHTML = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="kpFire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs></svg>';
document.body.appendChild(defs.firstChild);

/* ---------- окна ---------- */
var dim = document.getElementById('ek-dim');
function mkSheet(id){ var s = el('div', 'ek-sheet kp-sheet'); s.id = id; s.setAttribute('role', 'dialog'); s.innerHTML = '<div><div class="ek-grab"></div><div class="kp-b"></div></div>'; root.appendChild(s); return s; }
var shSheet = mkSheet('kp-share'), coSheet = mkSheet('kp-coms');
function open(s){ closeAll(); s.classList.add('on'); if(dim) dim.classList.add('on'); }
function closeAll(){ [shSheet, coSheet].forEach(function(s){ s.classList.remove('on'); }); if(dim && !$('#ek-reg.on')) dim.classList.remove('on'); }
if(dim) dim.addEventListener('click', closeAll);
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAll(); });
function regSheet(why, from){
  var w = $('#ek-regwhy'), g = $('#ek-reggo'), r = $('#ek-reg');
  if(!r){ location.href = '/?ref=' + encodeURIComponent(shareRef()) + '&from=kanal-' + from; return; }
  closeAll(); if(w) w.textContent = why;
  if(g) g.href = '/?ref=' + encodeURIComponent(okRef(Q.ref) ? Q.ref : shareRef()) + (Q.s === 'L' || Q.s === 'R' ? '&s=' + Q.s : '') + '&from=kanal-' + from;
  r.classList.add('on'); if(dim) dim.classList.add('on');
}
function proOnly(what){ toast(what + ' — для EAGLES Pro'); }

/* ---------- копирование ---------- */
function copy(text){
  if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(function(){ return fallback(text); });
  return Promise.resolve(fallback(text));
}
function fallback(text){ var t = el('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:-100px;opacity:0'; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); }catch(e){} t.remove(); }

/* ---------- окно «Поделиться» ---------- */
function shareBox(o){ /* o: {kind:'p'|'t', val, title, swoop} */
  var url = linkFor(o.kind, o.val), m = me();
  var text = o.title + ' — ' + CH_TITLE + ' в EAGLES';
  var U = encodeURIComponent(url), T = encodeURIComponent(text);
  var soc = [
    ['Telegram', 'https://t.me/share/url?url=' + U + '&text=' + T, '#2aa3e0', '<svg viewBox="0 0 24 24" fill="#fff"><path d="M21.5 4.2 2.9 11.4c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM9.7 14l8.5-7.7-6.6 9-.3 3.2z"/></svg>'],
    ['WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '#25d366', '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.7L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2zm5.6 13.7c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-3.3-1.1-5.5-4.4-5.7-4.6-.2-.2-1.4-1.8-1.4-3.4s.8-2.4 1.1-2.8c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.5 1.6.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2.2 1c.3.2.5.2.6.4.1.1.1.8-.2 1.5z"/></svg>'],
    ['ВКонтакте', 'https://vk.com/share.php?url=' + U + '&title=' + T, '#0077ff', '<b style="font:900 14px Montserrat,sans-serif">VK</b>'],
    ['Одноклассники', 'https://connect.ok.ru/offer?url=' + U + '&title=' + T, '#f7931e', '<b style="font:900 14px Montserrat,sans-serif">OK</b>']
  ];
  var b = shSheet.querySelector('.kp-b');
  b.innerHTML = '<h2>Поделиться<button class="kp-x" type="button" aria-label="Закрыть">×</button></h2>' +
    '<p>' + esc(o.title) + '</p>' +
    '<div class="kp-url"><span>' + esc(url.replace(/^https:\/\//, '')) + '</span><button type="button" class="kp-copy">Скопировать</button></div>' +
    '<div class="kp-soc">' + soc.map(function(x){ return '<a href="' + x[1] + '" target="_blank" rel="noopener"><i style="background:' + x[2] + '">' + x[3] + '</i>' + x[0] + '</a>'; }).join('') +
    '<button type="button" class="kp-more"><i style="background:#2a2622">' + IC.share.replace('<svg', '<svg fill="none" stroke="#ffd23f" stroke-width="2.2" stroke-linecap="round"') + '</i>Ещё</button></div>' +
    '<p class="kp-note">' + (m.id ? 'В ссылке твой ID <b>' + esc(m.id) + '</b>: кто зарегистрируется по ней, попадёт к тебе в команду.' : 'Ссылка откроет канал прямо на этом ' + (o.kind === 'p' ? 'посте' : 'разделе') + '.') + '</p>';
  b.querySelector('.kp-x').onclick = closeAll;
  var cb = b.querySelector('.kp-copy');
  cb.onclick = function(){ copy(url).then(function(){ cb.textContent = 'Готово ✓'; cb.classList.add('ok'); toast('Ссылка скопирована'); setTimeout(function(){ cb.textContent = 'Скопировать'; cb.classList.remove('ok'); }, 2200); }); };
  var mb = b.querySelector('.kp-more');
  if(navigator.share) mb.onclick = function(){ navigator.share({title: o.title, text: text, url: url}).catch(function(){}); };
  else mb.onclick = function(){ cb.click(); };
  if(window.EK_DEMO_HOOK) window.EK_DEMO_HOOK(b, o, url);
  open(shSheet);
}

/* ---------- окно комментариев ---------- */
function initials(n, id){ n = String(n || '').trim(); return n ? n.split(/\s+/).map(function(w){ return w[0]; }).join('').slice(0, 2).toUpperCase() : String(id || '?').slice(-2); }
function ago(ts){ var s = (Date.now() - ts) / 1000; if(s < 60) return 'только что'; if(s < 3600) return Math.floor(s / 60) + ' мин'; if(s < 86400) return Math.floor(s / 3600) + ' ч'; return Math.floor(s / 86400) + ' дн'; }
function comsBox(p, title){
  var m = me(), b = coSheet.querySelector('.kp-b'), items = [], editing = null;
  b.innerHTML = '<h2>Комментарии<button class="kp-x" type="button" aria-label="Закрыть">×</button></h2><p>' + esc(title) + '</p><div class="kp-coms"><div class="kp-empty">Загружаю…</div></div>' +
    (m.role === 'pro' ? '<div class="kp-edbar" hidden>✎ Изменение<span></span><button type="button" aria-label="Отменить">×</button></div><form class="kp-in"><input maxlength="500" placeholder="Напиши комментарий" enterkeyhint="send"><button type="submit">➤</button></form>'
     : m.role === 'free' ? '<div class="kp-lockmsg">Писать комментарии могут участники EAGLES Pro.<a href="/obuchenie.html">Про Pro</a></div>'
     : '<div class="kp-lockmsg">Комментировать можно после регистрации. Это бесплатно.<a href="#" class="kp-reg">Войти</a></div>');
  b.querySelector('.kp-x').onclick = closeAll;
  var rg = b.querySelector('.kp-reg'); if(rg) rg.onclick = function(e){ e.preventDefault(); regSheet('Комментарии и лайки открываются после бесплатной регистрации.', 'comment'); };
  var list = b.querySelector('.kp-coms'), f = b.querySelector('.kp-in'), eb = b.querySelector('.kp-edbar');
  var inp = f ? f.querySelector('input') : null;
  /* сервер отдаёт own (мой — можно править) и del (можно удалить: мой, или я хозяин канала) */
  function canEdit(c){ return API.live ? !!c.own : (!!m.id && c.id === m.id); }
  function canDel(c){ return API.live ? !!(c.del || c.own) : (!!m.id && c.id === m.id); }
  function draw(arr){
    items = arr || [];
    list.innerHTML = items.length ? items.map(function(c, i){
      var tools = canEdit(c) || canDel(c);
      return '<div class="kp-c" data-i="' + i + '"><span class="av">' + esc(initials(c.name, c.id)) + '</span><div><b>' + esc(c.name || ('ID ' + c.id)) + '<small>ID ' + esc(c.id) + ' · ' + ago(c.ts) + (c.ed ? '<span class="kp-ed">· изменено</span>' : '') + '</small></b><p>' + esc(c.text) + '</p></div>' +
        (tools ? '<button type="button" class="kp-cm" aria-label="Действия с комментарием">⋯</button>' : '') + '</div>';
    }).join('') : '<div class="kp-empty">Пока тихо. Будь первым.</div>';
  }
  function reload(){ return loadComs(p).then(draw); }
  function closeMenus(){
    $$('.kp-cmenu', list).forEach(function(x){ if(x.parentNode) x.parentNode.removeChild(x); });
    $$('.kp-c.open', list).forEach(function(x){ x.classList.remove('open'); });
  }
  function menu(row, c){
    var was = row.classList.contains('open'); closeMenus(); if(was) return;
    row.classList.add('open');
    var mm = el('div', 'kp-cmenu');
    mm.innerHTML = (canEdit(c) ? '<button type="button" data-a="ed">✎ Изменить</button>' : '') + (canDel(c) ? '<button type="button" class="red" data-a="del">Удалить</button>' : '');
    row.querySelector('div').appendChild(mm);
    mm.onclick = function(e){
      var a = e.target.closest('button'); if(!a) return; e.stopPropagation();
      if(a.dataset.a === 'ed'){ closeMenus(); startEdit(c); }
      else if(a.dataset.a === 'del'){
        mm.innerHTML = '<span>' + (canEdit(c) ? 'Удалить комментарий?' : 'Удалить чужой комментарий из своего канала?') + '</span><button type="button" class="redf" data-a="yes">Удалить</button><button type="button" data-a="no">Отмена</button>';
      }
      else if(a.dataset.a === 'no') closeMenus();
      else if(a.dataset.a === 'yes'){
        a.disabled = true;
        delCom(p, c).then(function(){ if(editing === c) stopEdit(); st(p).c = Math.max(0, st(p).c - 1); paint(p); toast('Комментарий удалён'); return reload(); }).catch(function(){ a.disabled = false; });
      }
    };
  }
  list.onclick = function(e){
    var btn = e.target.closest('.kp-cm'); if(!btn) return;
    var row = btn.closest('.kp-c'), c = items[+row.dataset.i]; if(c) menu(row, c);
  };
  function startEdit(c){
    if(!f) return;
    editing = c; eb.hidden = false; eb.querySelector('span').textContent = c.text;
    inp.value = c.text; inp.placeholder = 'Измени комментарий'; f.querySelector('button').textContent = '✓';
    try{ inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }catch(e){}
  }
  function stopEdit(){
    editing = null; if(!f) return;
    eb.hidden = true; inp.value = ''; inp.placeholder = 'Напиши комментарий'; f.querySelector('button').textContent = '➤';
  }
  if(eb) eb.querySelector('button').onclick = stopEdit;
  reload();
  if(f) f.onsubmit = function(e){
    e.preventDefault(); var t = inp.value.trim(); if(!t) return;
    if(editing){
      var c = editing;
      if(t === c.text){ stopEdit(); return; }
      inp.value = '';
      editCom(p, c, t).then(function(){ stopEdit(); toast('Комментарий изменён'); return reload(); }).catch(function(){ inp.value = t; });
      return;
    }
    inp.value = '';
    var nc = {id: m.id, name: m.name, text: t, ts: Date.now()};
    saveCom(p, nc).then(function(){ reload(); st(p).c++; paint(p); list.scrollTop = 1e6; }).catch(function(){ inp.value = t; });
  };
  open(coSheet);
}
function loadComs(p){
  if(API.live) return API.coms(p).catch(function(){ return []; });
  var d = localDb(); return Promise.resolve(((d.com || {})[p]) || []);
}
function saveCom(p, c){
  if(API.live) return API.com(p, c.text).catch(function(r){ toast(r && r.error === 'limit' ? 'Слишком часто. Попробуй через час' : r && r.error === 'need_pro' ? 'Комментарии — для EAGLES Pro' : 'Не отправилось, попробуй ещё раз'); throw r; });
  var d = localDb(); d.com = d.com || {}; (d.com[p] = d.com[p] || []).push(c); localSave(d); return Promise.resolve();
}
function comErr(r, what){
  toast(r && r.error === 'limit' ? 'Слишком часто. Попробуй позже' : r && r.error === 'forbidden' ? 'Можно менять только свои комментарии' : r && r.error === 'bad_k' ? 'Комментарий уже удалён' : r && r.error === 'unknown_action' ? 'Скоро будет доступно' : 'Не ' + what + ', попробуй ещё раз');
  throw r;
}
function editCom(p, c, text){
  if(API.live) return API.cedit(p, c.k, text).catch(function(r){ comErr(r, 'сохранилось'); });
  var d = localDb(), a = ((d.com || {})[p]) || [];
  a.forEach(function(x){ if(x.ts === c.ts && x.id === c.id){ x.text = text; x.ed = Date.now(); } }); localSave(d); return Promise.resolve();
}
function delCom(p, c){
  if(API.live) return API.cdel(p, c.k).catch(function(r){ comErr(r, 'удалилось'); });
  var d = localDb(); if(d.com && d.com[p]) d.com[p] = d.com[p].filter(function(x){ return !(x.ts === c.ts && x.id === c.id); }); localSave(d); return Promise.resolve();
}

/* ---------- кнопки под постами ---------- */
var CARDS = {}; /* p -> {card, title, tab} */
function bar(p){
  var a = el('div', 'ek-act'); a.dataset.p = p;
  a.innerHTML = '<button type="button" class="kp-like" aria-label="Огонёк">' + IC.fire + '<b></b></button>' +
    '<button type="button" class="kp-com" aria-label="Комментарии">' + IC.com + '<b></b></button>' +
    '<button type="button" class="kp-sw" aria-label="Swoop">' + IC.swoop + '<span>Swoop</span><b></b></button>' +
    '<span class="kp-sp"></span>' +
    '<button type="button" class="kp-sh" aria-label="Поделиться или скопировать ссылку">' + IC.share + '</button>';
  return a;
}
function paint(p){
  var s = st(p), n = function(x){ return x > 0 ? (x > 999 ? (x / 1000).toFixed(1).replace('.0', '') + 'K' : String(x)) : ''; };
  $$('.ek-act[data-p="' + p + '"]').forEach(function(a){
    var l = a.querySelector('.kp-like'), c = a.querySelector('.kp-com'), w = a.querySelector('.kp-sw');
    if(!l) return;
    l.classList.toggle('on', s.my); l.querySelector('b').textContent = n(s.l);
    c.querySelector('b').textContent = n(s.c);
    w.classList.toggle('on', s.sw); w.querySelector('b').textContent = n(s.s);
  });
}
function paintAll(){ Object.keys(CARDS).forEach(paint); }

function onLike(p, btn){
  var m = me();
  if(m.role === 'guest') return regSheet('Огоньки ставят зарегистрированные. Регистрация бесплатная.', 'like');
  var s = st(p); s.my = !s.my; s.l = Math.max(0, s.l + (s.my ? 1 : -1)); paint(p);
  if(s.my){ btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
  if(API.live) API.like(p, s.my).then(function(r){ s.l = r.l | 0; s.my = !!r.my; paint(p); }).catch(function(){});
  else { var d = localDb(); d.my = d.my || {}; d.my[p] = s.my; localSave(d); }
}
/* Swoop = забрать пост в СВОЙ канал. Ссылки и соцсети — только у «Поделиться». */
function snapOf(p){
  var x = CARDS[p], c = x.card, im = null, pp = null;
  $$('img', c).some(function(i){ if(!i.closest('.ek-ph') && !/avatar/i.test(i.getAttribute('src') || '')){ im = i; return true; } return false; });
  var v = !im && c.querySelector('video[poster]');
  var src = im ? im.src : v ? v.poster : '';
  if(src.indexOf(location.origin + '/') === 0) src = src.slice(location.origin.length).split(/[?#]/)[0];
  if(!/^\/[A-Za-z0-9_\/-]{1,100}\.(webp|jpe?g|png)$/i.test(src) && !/^data:image\//.test(src)) src = '';
  $$('p', c).some(function(e){ if(!e.closest('.ek-ph') && !e.closest('.ek-act') && e.textContent.trim()){ pp = e; return true; } return false; });
  var tx = pp ? pp.textContent.replace(/\s+/g, ' ').trim() : '';
  if(tx === x.title) tx = '';
  return {t: x.title, x: tx.length > 400 ? tx.slice(0, 397) + '…' : tx, i: src};
}
function swoopSave(src, on, snap){
  if(window.EK_CH_DEMO) return window.EK_CH_DEMO.swoop(src, on, snap);
  return API.swoop(src, on, snap);
}
function myChanHref(id){ return '/kanal.html?u=' + encodeURIComponent(id); }
function swoopBox(p, src, already){
  var m = me(), x = CARDS[p], snap = snapOf(p), b = shSheet.querySelector('.kp-b'), s = st(p);
  b.innerHTML = '<h2>' + IC.swoop.replace('<svg', '<svg width="24" height="24" fill="none" stroke="#ffd23f" stroke-width="2.2" stroke-linecap="round"') + 'Swoop<button class="kp-x" type="button" aria-label="Закрыть">×</button></h2>' +
    '<div class="kp-swok">' + (snap.i ? '<img src="' + esc(snap.i) + '" alt="">' : '<i>✓</i>') + '<div><b>' + (already ? 'Уже в твоём канале' : 'Готово! Пост в твоём канале') + '</b><span>' + esc(x.title) + '</span></div></div>' +
    '<p class="kp-note">Его видят все, кто заходит в <b>твой канал</b>. Кто зарегистрируется оттуда, попадёт к тебе в команду.</p>' +
    '<a class="kp-gold" href="' + myChanHref(m.id) + '">Открыть мой канал</a>' +
    '<button type="button" class="kp-undo">Убрать из моего канала</button>';
  b.querySelector('.kp-x').onclick = closeAll;
  var go = b.querySelector('.kp-gold');
  if(window.EK_DEMO_NAV) go.onclick = function(e){ e.preventDefault(); window.EK_DEMO_NAV(m.id); };
  var u = b.querySelector('.kp-undo');
  u.onclick = function(){
    u.disabled = true;
    swoopSave(src, false).then(function(r){ s.sw = false; s.s = r && r.s != null && src.ch === CH && src.p === p ? r.s | 0 : Math.max(0, s.s - 1); paint(p); closeAll(); toast('Убрано из твоего канала'); }, function(){ u.disabled = false; toast('Не получилось, попробуй ещё раз'); });
  };
  open(shSheet);
}
function onSwoop(p){
  var m = me();
  if(m.role === 'guest') return regSheet('Swoop — это забрать пост в свой канал и звать людей к себе. Открывается после регистрации.', 'swoop');
  if(m.role !== 'pro') return proOnly('Swoop');
  var x = CARDS[p], src = x.src || {ch: CH, p: p};
  if(m.id === src.ch || (OWNERS.indexOf(m.id) >= 0 && src.ch === '11111')) return toast('Это твой пост. Swoop делают другие, а ты жми «Поделиться»');
  if(x.src && MINE_CH && m.id === CH) return toast('Этот пост уже в твоём канале');
  var s = st(p);
  if(s.sw) return swoopBox(p, src, true);
  s.sw = true; s.s++; paint(p);
  swoopSave(src, true, snapOf(p)).then(function(r){
    if(r && r.s != null && src.ch === CH && src.p === p){ s.s = r.s | 0; paint(p); }
    swoopBox(p, src, false);
  }, function(r){
    s.sw = false; s.s = Math.max(0, s.s - 1); paint(p);
    toast(r && r.error === 'need_pro' ? 'Swoop — для EAGLES Pro' : r && r.error === 'limit' ? 'Слишком часто, попробуй через минуту' : 'Не получилось, попробуй ещё раз');
  });
}

/* ---------- свой канал Pro (?u=ID) ---------- */
function firstName(n){ return String(n || '').trim().split(/\s+/)[0] || 'друг'; }
function fmtDate(ts){ if(!ts) return ''; var d = new Date(ts), s = (Date.now() - ts) / 1000; if(s < 86400 && d.getDate() === new Date().getDate()) return 'сегодня'; if(s < 172800) return 'вчера'; return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2); }
function vidName(u){ return /rutube/i.test(u) ? 'Rutube' : /youtu/i.test(u) ? 'YouTube' : 'VK Видео'; }
function textHtml(t){ return esc(t).replace(/\n/g, '<br>'); }
var CHD = null;
function chLoad(){
  if(window.EK_CH_DATA) return Promise.resolve(window.EK_CH_DATA());
  return API.call('kp_ch', {}).then(function(r){ return {ch: r.ch, posts: r.posts || []}; });
}
function avaHtml(ch, cls){
  return ch.av ? '<span class="' + cls + '"><img src="' + esc(ch.av) + '" alt=""></span>' : '<span class="' + cls + ' kp-ini">' + esc(firstName(ch.name).slice(0, 1).toUpperCase()) + '</span>';
}
function helloText(ch){
  return ch.hello || ('Привет! Я ' + firstName(ch.name) + '. Это мой канал в EAGLES: здесь мои ролики, мысли и всё, чем я делюсь каждый день. Регистрируйся бесплатно по ссылке с этой страницы, и будем в одной команде.');
}
function personal(){
  CH_TITLE = 'канал';
  /* убираем то, что есть только у Андрея */
  ['.ek-stories', '#ek-upl', '.ek-circles', '#ek-uroki', '#ek-free'].forEach(function(q){ var x = $(q); if(x){ x.hidden = true; x.style.setProperty('display', 'none', 'important'); } });
  $$('.ek-tabs button[data-tab="uroki"], .ek-tabs button[data-tab="free"]').forEach(function(b){ b.remove(); });
  /* регистрация и вход — по ссылке владельца канала */
  var ref = okRef(Q.ref) ? Q.ref : CH;
  $$('a[data-reg="cta"], a[data-reg="vhod"]').forEach(function(a){ a.removeAttribute('data-reg'); a.href = '/?ref=' + encodeURIComponent(ref) + '&from=kanal-' + CH; });
  $('#ek-lenta').innerHTML = '<div class="kp-empty">Загружаю канал…</div>';
  return chLoad().then(function(d){ CHD = d; drawPersonal(); }, function(){
    $('#ek-lenta').innerHTML = '<div class="kp-empty">Канал не найден или ещё не открыт.</div>'; throw 0;
  });
}
function drawPersonal(){
  var ch = CHD.ch, mine = me().id === CH, m = me();
  CH_TITLE = 'канал ' + firstName(ch.name);
  var h = $('.ek-chhead');
  if(h){
    var old = h.querySelector('.ek-ava2'); if(old) old.outerHTML = avaHtml(ch, 'ek-ava2');
    h.querySelector('h1').textContent = ch.name || firstName(ch.name);
    h.querySelector('p').textContent = 'Канал в EAGLES';
  }
  myChannelChip();
  var L = $('#ek-lenta'), html = '';
  if(mine && !ch.pro) html += '<div class="ek-card kp-own"><b>Канал на паузе.</b> Продли EAGLES Pro, и снова сможешь публиковать.</div>';
  if(mine && ch.pro) html += '<form class="ek-card kp-new"><b>Новый пост</b><textarea maxlength="2000" rows="3" placeholder="О чём расскажешь сегодня?"></textarea><input type="url" inputmode="url" placeholder="Ссылка на ролик: VK Видео, Rutube или YouTube (не обязательно)"><button type="submit">Опубликовать</button></form>';
  html += '<article class="ek-card" data-post="start"><div class="ek-ph">' + avaHtml(ch, 'kp-ava') + '<div><b>' + esc(firstName(ch.name)) + '</b><small>закреплено</small></div><span class="ek-tg g">📌 Начни здесь</span></div><p>' + textHtml(helloText(ch)) + '</p>' +
    (mine ? '<div class="ek-bar"><button class="ek-ic kp-edit" type="button">✎ ' + (ch.hello ? 'Изменить приветствие' : 'Это заготовка. Написать своё') + '</button></div>' : '') + '</article>';
  if(!CHD.posts.length && mine) html += '<div class="ek-card kp-own">Канал готов и уже открыт всем. Добавь первый пост: пару слов или ссылку на ролик. Потом нажми «Ссылка на «Лента»» и поставь её в соцсети: кто зарегистрируется по ней, попадёт к тебе в команду.</div>';
  CHD.posts.forEach(function(x){
    if(x.sw){
      var w = x.sw, from = w.n || 'канал EAGLES';
      var href = SITE.replace(/^https:\/\/[^/]+/, '') + '?' + (w.c !== '11111' ? 'u=' + encodeURIComponent(w.c) + '&' : '') + 'ref=' + encodeURIComponent(shareRef()) + '&p=' + encodeURIComponent(w.p);
      html += '<article class="ek-card" data-post="' + esc(x.p) + '" data-swc="' + esc(w.c) + '" data-swp="' + esc(w.p) + '"><div class="ek-ph">' + avaHtml(ch, 'kp-ava') + '<div><b>' + esc(firstName(ch.name)) + '</b><small>' + fmtDate(x.ts) + '</small></div>' +
        (mine ? '<button class="kp-del" type="button" data-del="' + esc(x.p) + '" aria-label="Убрать пост">⋯</button>' : '') + '</div>' +
        '<div class="kp-swh">' + IC.swoop + 'Swoop · ' + esc(from) + '</div>' +
        '<a class="kp-swc" href="' + esc(href) + '">' + (w.i ? '<img src="' + esc(w.i) + '" alt="" loading="lazy">' : '') + '<div><b>' + esc(w.t || 'Пост') + '</b>' + (w.x ? '<span>' + esc(w.x) + '</span>' : '') + '<em>Открыть пост →</em></div></a></article>';
      return;
    }
    html += '<article class="ek-card" data-post="' + esc(x.p) + '"><div class="ek-ph">' + avaHtml(ch, 'kp-ava') + '<div><b>' + esc(firstName(ch.name)) + '</b><small>' + fmtDate(x.ts) + '</small></div>' + (x.url ? '<span class="ek-tg">Ролик</span>' : '') +
      (mine ? '<button class="kp-del" type="button" data-del="' + esc(x.p) + '" aria-label="Убрать пост">⋯</button>' : '') + '</div>' +
      (x.text ? '<p>' + textHtml(x.text) + '</p>' : '') + (x.url ? '<a class="kp-vid" href="' + esc(x.url) + '" target="_blank" rel="noopener">▶ Смотреть в ' + vidName(x.url) + '</a>' : '') + '</article>';
  });
  L.innerHTML = html;
  /* Ролики: только посты с видео */
  var vids = CHD.posts.filter(function(x){ return x.url; }), R = $('#ek-roliki');
  if(R) R.innerHTML = '<div class="ek-h">Ролики</div>' + (vids.length ? vids.map(function(x){ return '<a class="ek-card kp-vrow" href="' + esc(x.url) + '" target="_blank" rel="noopener"><i>▶</i><span>' + esc((x.text || 'Ролик').slice(0, 80)) + '<small>' + vidName(x.url) + ' · ' + fmtDate(x.ts) + '</small></span></a>'; }).join('') : '<div class="kp-empty">Роликов пока нет.</div>');
  var f = L.querySelector('.kp-new');
  if(f) f.onsubmit = function(e){
    e.preventDefault(); var t = f.querySelector('textarea').value.trim(), u = f.querySelector('input').value.trim(), btn = f.querySelector('button');
    if(!t && !u) return toast('Напиши текст или вставь ссылку на ролик');
    if(u && !/^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be))\//i.test(u)) return toast('Ссылка только на VK Видео, Rutube или YouTube');
    btn.disabled = true;
    chAdd(t, u).then(function(x){ CHD.posts.unshift(x); redraw(); toast('Опубликовано'); }, function(r){ btn.disabled = false; toast(r && r.error === 'limit' ? 'На сегодня хватит: до 20 постов в день' : r && r.error === 'need_pro' ? 'Публиковать можно с EAGLES Pro' : 'Не получилось, попробуй ещё раз'); });
  };
  var ed = L.querySelector('.kp-edit');
  if(ed) ed.onclick = function(){
    var b = coSheet.querySelector('.kp-b');
    b.innerHTML = '<h2>Приветствие<button class="kp-x" type="button" aria-label="Закрыть">×</button></h2><p>Первый пост канала, его видят все. Расскажи, кто ты и зачем сюда приходить.</p><form class="kp-in kp-col"><textarea maxlength="2000" rows="6"></textarea><button type="submit">Сохранить</button></form>';
    b.querySelector('textarea').value = helloText(ch);
    b.querySelector('.kp-x').onclick = closeAll;
    b.querySelector('form').onsubmit = function(e){ e.preventDefault(); var t = b.querySelector('textarea').value.trim(); chHello(t).then(function(){ ch.hello = t; closeAll(); redraw(); toast('Сохранено'); }, function(){ toast('Не получилось, попробуй ещё раз'); }); };
    open(coSheet);
  };
  $$('.kp-del', L).forEach(function(b){ b.onclick = function(){
    if(b.dataset.sure !== '1'){ b.dataset.sure = '1'; b.textContent = 'Убрать?'; b.classList.add('sure'); setTimeout(function(){ b.dataset.sure = ''; b.textContent = '⋯'; b.classList.remove('sure'); }, 3000); return; }
    var id = b.dataset.del; chDel(id).then(function(){ CHD.posts = CHD.posts.filter(function(x){ return x.p !== id; }); delete CARDS[id]; redraw(); toast('Пост убран'); }, function(){ toast('Не получилось'); });
  }; });
}
function redraw(){ drawPersonal(); bars(); counts(); }
function chAdd(t, u){ if(window.EK_CH_DEMO) return window.EK_CH_DEMO.add(t, u); return API.call('kp_add', {text: t, url: u}).then(function(r){ return r.post; }); }
function chHello(t){ if(window.EK_CH_DEMO) return window.EK_CH_DEMO.hello(t); return API.call('kp_hello', {text: t}); }
function chDel(id){ if(window.EK_CH_DEMO) return window.EK_CH_DEMO.del(id); return API.call('kp_del', {p: id}); }
/* кнопка «Мой канал» в шапке: Pro — открыть свой, FREE — подсказка про Pro */
function myChannelChip(){
  var m = me(), h = $('.ek-chhead'); if(!h || h.querySelector('.kp-my')) return;
  if(m.role === 'guest') return;
  h.style.flexWrap = 'wrap';
  var a = el('a', 'kp-my');
  if(m.id === CH){ a.href = SITE.replace(/^https:\/\/[^/]+/, ''); a.textContent = 'Канал Андрея'; }
  else { a.href = '/kanal.html?u=' + encodeURIComponent(m.id); a.textContent = 'Мой канал'; }
  if(m.role !== 'pro' && m.id !== CH) a.onclick = function(e){ e.preventDefault(); toast('Свой канал открывается с EAGLES Pro'); };
  if(window.EK_DEMO_NAV) a.onclick = function(e){ e.preventDefault(); window.EK_DEMO_NAV(m.id === CH ? '11111' : m.id, m.role); };
  h.appendChild(a);
}

function setup(){
  if(MINE_CH) return personal().then(core, function(){ core(); });
  /* «Добавить» сторис видит только Андрей (на сайте [hidden] перебивался стилем) */
  if(OWNERS.indexOf(me().id || '') < 0) ['#ek-add', '#ek-upl'].forEach(function(q){ var x = $(q); if(x) x.style.setProperty('display', 'none', 'important'); });
  myChannelChip(); core();
}
function bars(){
  /* Лента: все посты */
  $$('#ek-lenta article').forEach(function(card, i){
    if(card.querySelector('.ek-act')) return;
    var p = pidOf(card, i); card.dataset.post = p; card.id = 'post-' + p;
    CARDS[p] = {card: card, title: titleOf(card), tab: 'lenta'};
    if(card.dataset.swc){ CARDS[p].src = {ch: card.dataset.swc, p: card.dataset.swp}; var sb = card.querySelector('.kp-swc b'); if(sb) CARDS[p].title = sb.textContent; }
    /* старые серые «🔥» и «Комментировать» заменяет новая полоса */
    $$('.ek-bar [data-reg="like"], .ek-bar [data-reg="comment"]', card).forEach(function(b){ b.remove(); });
    $$('.ek-bar', card).forEach(function(b){ if(!b.children.length) b.remove(); });
    card.appendChild(bar(p));
  });
}
function counts(){
  var d = localDb(); Object.keys(CARDS).forEach(function(p){ var s = st(p); s.my = !!(d.my || {})[p]; s.sw = !!(d.sw || {})[p]; s.c = ((d.com || {})[p] || []).length; s.l = s.my ? 1 : 0; s.s = s.sw ? 1 : 0; });
  if(window.EK_DEMO_SEED) window.EK_DEMO_SEED(S);
  paintAll();
  if(!window.EK_DEMO_ROLE) API.get(Object.keys(CARDS)).then(function(posts){
    for(var p in posts){ var r = posts[p], s = st(p); s.l = r.l | 0; s.c = r.c | 0; s.s = r.s | 0; s.my = !!r.my; s.sw = !!r.sw; }
    paintAll();
  }).catch(function(){});
}
function core(){
  bars();
  /* Ролики и Уроки: маленькая кнопка «поделиться» на карточке */
  function mini(btn, p, title, tab){
    if(btn.parentNode.classList.contains('kp-wrap')) return;
    var w = el('div', 'kp-wrap'); btn.parentNode.insertBefore(w, btn); w.appendChild(btn);
    var s = el('button', 'kp-mini', IC.share); s.type = 'button'; s.setAttribute('aria-label', 'Поделиться'); s.dataset.kpShare = p; w.appendChild(s);
    if(!CARDS[p]) CARDS[p] = {card: w, title: title, tab: tab};
    else if(!CARDS[p].alt) CARDS[p].alt = {card: w, tab: tab};
    w.id = w.id || ('post-' + tab + '-' + p);
  }
  minis = function(){
    $$('#ek-roliki .ek-grid .ek-rl').forEach(function(b){ mini(b, b.dataset.kcid ? 'k-' + b.dataset.kcid : slug(b.dataset.video), (b.querySelector('span') || b).textContent.trim(), 'roliki'); });
    $$('#ek-open .ek-l, #ek-closed .ek-l').forEach(function(b){ var t = b.querySelector('.ek-meta b'); mini(b, b.dataset.kcles ? 'k-' + b.dataset.kcles : 'urok-' + (+b.dataset.lesson + 1), t ? t.textContent.replace(/^\d+\.\s*/, '') : 'Урок', 'uroki'); });
  };
  minis();
  /* Ссылка на вкладку */
  var tl = el('div', 'kp-tlink'); tl.innerHTML = '<button type="button">' + IC.link + '<span>Ссылка на «Лента»</span></button>';
  var tabsNav = $('.ek-tabs'); tabsNav.parentNode.insertBefore(tl, tabsNav.nextSibling);
  function curTab(){ var b = $('.ek-tabs button.on'); return b ? b.dataset.tab : 'lenta'; }
  function syncTl(){ tl.querySelector('span').textContent = 'Ссылка на «' + (TABS[curTab()] || 'Канал') + '»'; }
  $$('.ek-tabs button').forEach(function(b){ b.addEventListener('click', function(){ setTimeout(syncTl, 0); }); });
  tl.querySelector('button').onclick = function(){ var t = curTab(); shareBox({kind:'t', val:t, title:CH_TITLE.replace(/^к/, 'К') + ' · ' + (TABS[t] || '')}); };

  root.addEventListener('click', function(e){
    var b = e.target.closest('.ek-act > button, .kp-mini'); if(!b || !root.contains(b)) return;
    var p = b.dataset.kpShare || b.parentNode.dataset.p, x = CARDS[p];
    if(b.classList.contains('kp-mini') || b.classList.contains('kp-sh')) return shareBox({kind:'p', val:p, title:x.title});
    if(b.classList.contains('kp-like')) return onLike(p, b);
    if(b.classList.contains('kp-com')) return comsBox(p, x.title);
    if(b.classList.contains('kp-sw')) return onSwoop(p);
  });

  counts();
  root.dataset.kpReady = '1';
  deep(Q.p, Q.t);
}

/* ---------- открыть по ссылке ---------- */
function deep(p, t){
  var x = p && CARDS[p];
  if(p && !x){ toast('Этот пост уже убрали. Вот свежие'); }
  var tab = x ? x.tab : (TABS[t] ? t : '');
  if(!tab) return;
  var tb = $('.ek-tabs button[data-tab="' + tab + '"]'); if(tb && !tb.classList.contains('on')) tb.click();
  setTimeout(function(){
    if(x){ x.card.scrollIntoView({block: 'center', behavior: 'smooth'}); x.card.classList.remove('ek-hl'); void x.card.offsetWidth; x.card.classList.add('ek-hl'); }
    else { var n = $('.ek-tabs'); if(n) n.scrollIntoView({block: 'start', behavior: 'smooth'}); }
  }, 350);
}
var minis = function(){};
/* v3: eg-kontent.js дорисовал новые посты/ролики/уроки — повесить на них кнопки и подтянуть счётчики */
function refresh(){
  Object.keys(CARDS).forEach(function(p){ if(!CARDS[p].card.isConnected) delete CARDS[p]; });
  bars(); minis(); counts();
}
window.EK_POSTS = {open: deep, cards: CARDS, link: linkFor, paint: paintAll, refresh: function(){ if(root.dataset.kpReady) refresh(); }};

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
