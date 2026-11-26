# Карты v50 (26.11.2026): кнопка «⏰ Будильник» на экране «Мои карты» (справа под поиском), не про дело.
# Запуск: python3 karty-v50.py karty.html   — ставится на karty.html ДО v49 (c494892a): окно дела как было, без «Напомнить» (решение Андрея 26.11 13:40).
# Будильники хранятся в Картах полем al: [{id, t, rf}] (rf — когда звонить, мс). Сервер (REM v2) шлёт «⏰ …» в срок.
# Ссылка karty.html#al=<id>&ok («Готово» в уведомлении) убирает будильник. Если Карты открыты — звонит и на странице.
import sys
f = sys.argv[1]
S = open(f, encoding='utf8').read()
if 'egAl50' in S: sys.exit('STOP: v50 уже стоит')
if 'rm49' in S: sys.exit('STOP: тут v49 — ставь на версию до неё')
def rep(old, new, name, n=1):
    global S
    c = S.count(old)
    if c != n: sys.exit('STOP: якорь "%s" найден %d раз (нужно %d)' % (name, c, n))
    S = S.replace(old, new)
# 1) кнопка в шапке «Мои карты»
rep('<button type="button" class="mp-sr" id="mpTr" aria-label="Корзина карт"',
    '<button type="button" class="al50b" id="al50b" aria-label="Будильник"><svg class="al50i" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><circle cx="12" cy="13" r="7.5" fill="#16130a"/><circle cx="12" cy="13" r="6" fill="#fff6d0"/><path d="M12 9.5V13l2.5 1.6" stroke="#16130a" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M4.5 6.5l3-2.5M19.5 6.5l-3-2.5" stroke="#16130a" stroke-width="2.2" stroke-linecap="round"/><path d="M7.5 20l-1.5 1.8M16.5 20l1.5 1.8" stroke="#16130a" stroke-width="1.8" stroke-linecap="round"/></svg><span class="al50t">будильник</span><i class="al50n" id="al50n" hidden></i></button>'
    '<button type="button" class="mp-sr" id="mpTr" aria-label="Корзина карт"', 'btn')
# 2) хранение: поле al в сохранении и при загрузке
rep("return{v:1,ics:", "return{v:1,al:(window.al50clean?window.al50clean():[]),ics:", 'serial')
rep("function applySaved(o){if(!o||!Array.isArray(o.maps)||!o.maps.length)return false;",
    "function applySaved(o){if(!o||!Array.isArray(o.maps)||!o.maps.length)return false;try{window.AL50=Array.isArray(o.al)?o.al.filter(function(a){return a&&a.id&&a.rf}):[];window.al50ui&&window.al50ui()}catch(e){}", 'apply')
# 3) «Готово» из уведомления: #al=<id>&ok — после загрузки (там же, где deloLink)
rep("try{dlUpd();deloLink();backFromLure()}catch(e){}", "try{dlUpd();deloLink();backFromLure()}catch(e){}try{window.al50hash&&window.al50hash(save,toast)}catch(e){}", 'boot')
BLOCK = r'''<style id="egAl50">
.al50b{overflow:visible;position:absolute;right:16px;top:calc(60px + env(safe-area-inset-top,0px));width:52px;height:52px;padding:0;border-radius:50%;border:0;cursor:pointer;
  display:grid;place-items:center;color:#16130a;background:radial-gradient(circle at 35% 30%,#fff6c8,#ffd23f 50%,#b9801a);box-shadow:0 0 0 2px rgba(255,210,63,.25),0 0 22px rgba(255,170,40,.5)}
.al50b .al50i{display:block;transform-origin:50% 60%;animation:al50w 6s ease-in-out infinite}
@keyframes al50w{0%,88%,100%{transform:rotate(0)}90%{transform:rotate(-14deg)}92%{transform:rotate(14deg)}94%{transform:rotate(-10deg)}96%{transform:rotate(10deg)}98%{transform:rotate(-4deg)}}
.al50b::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 45%,transparent 60%);background-size:250% 100%;animation:al50g 4s linear infinite;pointer-events:none}
@keyframes al50g{0%{background-position:150% 0}100%{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.al50b .al50i,.al50b::after{animation:none}}
.al50b .al50t{position:absolute;top:56px;left:50%;transform:translateX(-50%);font:800 9.5px var(--f);letter-spacing:.06em;color:#ffd23f;white-space:nowrap;text-transform:uppercase}
.al50b .al50n{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:99px;background:#e8321a;color:#fff;font:900 10.5px/18px var(--f);font-style:normal;text-align:center;padding:0 4px;box-sizing:border-box}
.al50b.ring{animation:al50s .5s ease 3}
@keyframes al50s{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
.al50w{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}
.al50w[hidden]{display:none}
.al50c{width:100%;max-width:480px;background:#121014;border:1px solid rgba(255,210,63,.25);border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:12px;max-height:88vh;overflow:auto}
.al50c h3{margin:0;font:900 18px var(--f);color:#ffd23f}
.al50c .inp{width:100%;box-sizing:border-box}
.al50q{display:flex;flex-wrap:wrap;gap:6px}
.al50q button{border:1px solid rgba(255,255,255,.16);background:transparent;color:var(--fg);border-radius:999px;padding:8px 12px;font:700 12px var(--f);cursor:pointer}
.al50q button[aria-pressed="true"]{border-color:#ffd23f;background:#ffd23f;color:#16130a}
.al50r{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.al50r input{background:#0b0b0d;color:var(--fg);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:8px 10px;font:600 13px var(--f)}
.al50h{font-size:12px;color:var(--mut)}.al50h b{color:#ffd23f}
.al50go{border:0;border-radius:14px;padding:13px;font:900 14px var(--f);color:#16130a;background:linear-gradient(180deg,#fff0b8,#ffd23f 45%,#c8901c);cursor:pointer}
.al50x{border:1px solid rgba(255,255,255,.16);background:transparent;color:var(--fg);border-radius:14px;padding:11px;font:700 13px var(--f);cursor:pointer}
.al50l{display:flex;flex-direction:column;gap:6px}
.al50it{display:flex;align-items:center;gap:10px;background:#0b0b0d;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 12px}
.al50it b{flex:1;min-width:0;font:700 13px var(--f);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.al50it span{font:800 12px var(--f);color:#ffd23f;white-space:nowrap}
.al50it button{border:0;background:none;color:#cfc6b6;font-size:16px;cursor:pointer;padding:2px 4px}
.al50rg{position:fixed;inset:0;z-index:90;background:radial-gradient(circle at 50% 35%,rgba(255,170,40,.35),rgba(0,0,0,.96) 55%);display:flex;align-items:center;justify-content:center;padding:24px}
.al50rg[hidden]{display:none}
.al50rc{width:100%;max-width:380px;display:flex;flex-direction:column;gap:12px;text-align:center}
.al50rb{font-size:84px;line-height:1;animation:al50s .45s ease-in-out infinite}
.al50rt{font:900 24px var(--f);color:#fff;overflow-wrap:anywhere}
.al50rh{font:700 14px var(--f);color:#ffd23f;margin-bottom:10px}
</style>
<div class="al50w" id="al50w" hidden role="dialog" aria-modal="true" aria-label="Будильник"><div class="al50c">
  <h3>⏰ Будильник</h3>
  <input class="inp" id="al50t" maxlength="60" autocomplete="off" placeholder="Что напомнить? Например: обучение Альфы">
  <div class="al50q" id="al50q"><button type="button" data-q="15">Через 15 мин</button><button type="button" data-q="60">Через час</button><button type="button" data-q="e20">Сегодня в 20:00</button><button type="button" data-q="m9">Завтра в 9:00</button></div>
  <div class="al50r"><input type="date" id="al50d" aria-label="Дата"><input type="time" id="al50tm" aria-label="Время"></div>
  <div class="al50h" id="al50h"></div>
  <button type="button" class="al50go" id="al50go">Поставить будильник</button>
  <div class="al50l" id="al50l"></div>
  <button type="button" class="al50x" id="al50cl">Закрыть</button>
</div></div>
<div class="al50rg" id="al50ring" hidden role="alertdialog" aria-label="Будильник"><div class="al50rc"><div class="al50rb">⏰</div><div class="al50rt" id="al50rt"></div><div class="al50rh" id="al50rh"></div>
  <button type="button" class="al50go" id="al50off">Выключить</button><button type="button" class="al50x" id="al50snz">Отложить 10 мин</button></div></div>
<script id="egAl50js">
(function(){
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function el(id){return document.getElementById(id)}
function p2(n){return String(n).padStart(2,'0')}
function ymd(x){return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate())}
function nice(f){var x=new Date(f),t=new Date(),tm=new Date(t.getTime()+864e5),hm=p2(x.getHours())+':'+p2(x.getMinutes());
  if(ymd(x)===ymd(t))return 'сегодня в '+hm;if(ymd(x)===ymd(tm))return 'завтра в '+hm;return x.getDate()+' '+MON[x.getMonth()]+' в '+hm}
window.AL50=window.AL50||[];
window.al50clean=function(){var n=Date.now();window.AL50=(window.AL50||[]).filter(function(a){return a&&a.rf>n-6*3600e3}).slice(0,30);return window.AL50.map(function(a){return{id:a.id,t:a.t,rf:a.rf}})};
window.al50ui=function(){var n=Date.now(),act=(window.AL50||[]).filter(function(a){return a.rf>n});var b=el('al50n');if(b){b.hidden=!act.length;b.textContent=act.length}
  var L=el('al50l');if(!L)return;act.sort(function(a,b){return a.rf-b.rf});
  L.innerHTML=act.length?act.map(function(a){return '<div class="al50it"><b></b><span>'+nice(a.rf)+'</span><button type="button" data-id="'+a.id+'" aria-label="Убрать">✕</button></div>'}).join(''):'';
  [].forEach.call(L.querySelectorAll('.al50it b'),function(e,i){e.textContent=act[i].t||'Будильник'})};
var SAVE=null,TOAST=function(t){try{var e=el('toast');e.textContent=t;e.classList.add('on');setTimeout(function(){e.classList.remove('on')},2400)}catch(_){}};
function persist(){window.al50ui();try{if(SAVE)SAVE();else if(typeof save==='function')save()}catch(e){}}
function fval(){var d=el('al50d').value,t=el('al50tm').value;if(!d||!t)return 0;var x=new Date(d+'T'+t);return isNaN(x)?0:x.getTime()}
function hint(){var f=fval(),h=el('al50h');if(!f){h.textContent='Выбери время';return}h.innerHTML=f<Date.now()?'Это время уже прошло':'Позвоню <b>'+nice(f)+'</b> со звуком будильника'}
function setF(x){el('al50d').value=ymd(x);el('al50tm').value=p2(x.getHours())+':'+p2(x.getMinutes());hint()}
function open(){var w=el('al50w');w.hidden=false;el('al50t').value='';[].forEach.call(el('al50q').children,function(b){b.setAttribute('aria-pressed','false')});
  setF(new Date(Date.now()+15*60000));el('al50q').children[0].setAttribute('aria-pressed','true');window.al50ui();setTimeout(function(){el('al50t').focus()},60)}
function close(){el('al50w').hidden=true;el('al50t').blur()}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
  if(t.closest('#al50b')){open();return}
  if(t.closest('#al50cl')||t===el('al50w')){close();return}
  var q=t.closest('#al50q button');if(q){[].forEach.call(el('al50q').children,function(b){b.setAttribute('aria-pressed',String(b===q))});
    var x=new Date(),k=q.dataset.q;if(k==='15')x=new Date(Date.now()+15*60000);else if(k==='60')x=new Date(Date.now()+3600e3);else if(k==='e20'){x.setHours(20,0,0,0);if(x<new Date())x.setDate(x.getDate()+1)}else{x.setDate(x.getDate()+1);x.setHours(9,0,0,0)}
    setF(x);return}
  var d=t.closest('#al50l button');if(d){window.AL50=window.AL50.filter(function(a){return a.id!==d.dataset.id});persist();TOAST('Будильник убран');return}
  if(t.closest('#al50go')){var f=fval();if(!f||f<Date.now()-30000){TOAST('Выбери время в будущем');return}
    var txt=(el('al50t').value||'').trim().slice(0,60)||'Будильник';
    window.AL50.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:txt,rf:f});persist();close();
    TOAST('⏰ Поставлен: '+nice(f));try{navigator.vibrate&&navigator.vibrate(30)}catch(_){}}
});
['al50d','al50tm'].forEach(function(id){var x=el(id);if(x)x.addEventListener('input',function(){[].forEach.call(el('al50q').children,function(b){b.setAttribute('aria-pressed','false')});hint()})});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!el('al50w').hidden)close()});
// «Готово» из уведомления
window.al50hash=function(save,toast){SAVE=save;if(toast)TOAST=toast;var m=/#al=([a-z0-9]{4,20})/.exec(location.hash);if(!m)return;history.replaceState(null,'',location.pathname);
  var had=window.AL50.some(function(a){return a.id===m[1]});window.AL50=window.AL50.filter(function(a){return a.id!==m[1]});if(had)persist();TOAST('Готово ✓ Будильник выключен')};
// Карты открыты в момент будильника: экран будильника, звук по кругу, пока не нажмёшь «Выключить»
var rung={},snd=null,cur=null;
function closeNotes(id){try{navigator.serviceWorker&&navigator.serviceWorker.ready.then(function(r){return r.getNotifications()}).then(function(ns){(ns||[]).forEach(function(n){var u=(n.data&&n.data.url)||'';if(/^rem-/.test(n.tag||'')&&(!id||u.indexOf('al='+id)>=0))n.close()})}).catch(function(){})}catch(_){}}
function stopRing(){closeNotes(cur&&cur.id);try{snd&&snd.pause()}catch(_){}var r=el('al50ring');if(r)r.hidden=true;cur=null;try{navigator.vibrate&&navigator.vibrate(0)}catch(_){}}
function ring(a){cur=a;var r=el('al50ring');el('al50rt').textContent=a.t||'Будильник';el('al50rh').textContent=nice(a.rf);r.hidden=false;
  try{if(!snd){snd=new Audio('/karty-stili/eagles-budilnik.mp3');snd.loop=true}snd.currentTime=0;snd.play().catch(function(){})}catch(_){}
  try{navigator.vibrate&&navigator.vibrate([600,300,600,300,600,300,600,300,600,300,600])}catch(_){}}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
  if(t.closest('#al50off')){var id=cur&&cur.id;stopRing();if(id){window.AL50=window.AL50.filter(function(a){return a.id!==id});persist()}TOAST('Будильник выключен');return}
  if(t.closest('#al50snz')){var c=cur;stopRing();if(c){window.AL50=window.AL50.filter(function(a){return a.id!==c.id});window.AL50.push({id:Date.now().toString(36)+'s',t:c.t,rf:Date.now()+600000});persist()}TOAST('⏰ Напомню через 10 минут');return}});
setInterval(function(){var n=Date.now();(window.AL50||[]).forEach(function(a){if(a.rf<=n&&a.rf>n-120000&&!rung[a.id]&&!cur){rung[a.id]=1;ring(a);window.al50ui()}})},5000);
})();
</script>
'''
S = S.rstrip('\n') + '\n' + BLOCK
open(f, 'w', encoding='utf8').write(S)
print('v50 OK')
