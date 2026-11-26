import sys,hashlib
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if 'egFast142' in s: sys.exit('already patched')
# 1) loader: do not wait for all requests; hide after page is ready + first "me" answer (max 2.5 s)
a="var t0=Date.now(),n=0,last=t0,on=1,of=window.fetch;if(of)window.fetch=function(){if(!on)return of.apply(this,arguments);n++;last=Date.now();var p=of.apply(this,arguments);function d(){n--;last=Date.now()}p.then(d,d);return p};function chk(){var now=Date.now();if((document.readyState==='complete'&&n<=0&&now-last>450&&now-t0>800)||now-t0>8000){on=0;try{zgrDone()}catch(e){}}else setTimeout(chk,120)}chk();"
b="/*egFast142: не ждём все запросы — убираем экран, как только страница готова и пришёл ответ «me» (макс. 2,5 с)*/var t0=Date.now(),me=0,on=1,of=window.fetch;if(of)window.fetch=function(u){var p=of.apply(this,arguments);if(on&&/[?&]action=me&/.test(String(u&&u.url||u))){function d(){me=1}p.then(d,d)}return p};function chk(){var now=Date.now();if((document.readyState!=='loading'&&now-t0>600&&(me||now-t0>1500))||now-t0>2500){on=0;try{zgrDone()}catch(e){}}else setTimeout(chk,100)}chk();"
assert s.count(a)==1; s=s.replace(a,b)
# 2) circle: if server is slow (cold start), draw from data saved on the phone after 2 s
c="    Promise.all([candReq, actReq]).then(function(vals){"
d="    /* egFast142: сервер долго просыпается — через 2 с рисуем круг по данным, сохранённым на телефоне */\n    function egT142(p){ return Promise.race([p, new Promise(function(r){ setTimeout(function(){ r(null); }, 2000); })]); }\n    Promise.all([egT142(candReq), egT142(actReq)]).then(function(vals){"
assert s.count(c)==1; s=s.replace(c,d)
open(dst,'w',encoding='utf-8').write(s)
print(len(s.encode()),hashlib.md5(s.encode()).hexdigest())
# 3) PIN: if we know the account has a PIN, show the keypad at once (don't wait for the sleeping server)
s=open(dst,encoding='utf-8').read()
e="""  function start(){
    api('pin_state').then(function(r){
      if(!r || r.ok === false && r.error === 'auth'){ return; }
      if(r.ok && typeof r.has === 'boolean'){
        ST = r;
        if(unlocked()) return;
        if(!r.has){ show('new'); return; }
        show('enter'); if(r.blocked) blocked();"""
f="""  function start(){
    /* egFast142: ПИН у аккаунта уже был — клавиатура сразу, сервер проверяем фоном */
    var egHk = 'egPinHas-' + ID, egEarly = false;
    try{ if(!unlocked() && localStorage.getItem(egHk) === '1'){ egEarly = true; show('enter'); } }catch(e){}
    api('pin_state').then(function(r){
      if(!r || r.ok === false && r.error === 'auth'){ return; }
      if(r.ok && typeof r.has === 'boolean'){
        ST = r;
        try{ localStorage.setItem(egHk, r.has ? '1' : '0'); }catch(e){}
        if(unlocked()) return;
        if(!r.has){ show('new'); return; }
        if(!(egEarly && mode === 'enter')) show('enter'); if(r.blocked) blocked();"""
assert s.count(e)==1; s=s.replace(e,f)
open(dst,'w',encoding='utf-8').write(s)
print(len(s.encode()),hashlib.md5(s.encode()).hexdigest())
