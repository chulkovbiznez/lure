import sys
S=open(sys.argv[1],encoding='utf-8').read()
def rep(a,b,tag):
    global S
    assert S.count(a)==1,(tag,S.count(a)); S=S.replace(a,b)
rep("/* egPwa4: приложение EAGLES (PWA)","/* egPwa5 (26.11.2026, задание 142): пуш-уведомления ВЫКЛЮЧЕНЫ (Андрей: «убирай уведомления пуш… только внутри приложения»). Подписка снимается (push_off + unsubscribe), плашки и шага «Уведомления» нет, шага «Не усыплять» нет. Старый код: sait-eagles/bez-push-142/pwa-do-142.js.\n   egPwa4: приложение EAGLES (PWA)",'hdr')
rep("""function psync(){
  if(!canPush()||Notification.permission!=='granted'||!logged())return;""","""function psync(){
  /* 142: вместо подписки — снимаем её: сервер больше не шлёт пуши на этот телефон */
  if(!('serviceWorker' in navigator)||!('PushManager' in window))return;
  navigator.serviceWorker.getRegistration('/').then(function(reg){if(!reg||!reg.pushManager)return;
    return reg.pushManager.getSubscription().then(function(s){if(!s)return;
      var q=logged()?api('action=push_off&sub='+encodeURIComponent(JSON.stringify(s))).catch(function(){}):Promise.resolve();
      return q.then(function(){return s.unsubscribe();});});
  }).catch(function(){});
  try{localStorage.removeItem(PSYNC);}catch(e){}
  return;
  if(!canPush()||Notification.permission!=='granted'||!logged())return;""",'psync')
rep("function pshow(){\n","function pshow(){\n  return; /* 142: плашка «Включить уведомления» убрана */\n",'pshow')
rep("if(r[0]==='default')S.push('n');else res.n=r[0]==='granted';","/* 142: шага «Уведомления» нет */",'onbN')
rep("if(appV()>=12)S.push('b');","/* 142: шага «Не усыплять» нет (звонки только в открытом приложении) */",'onbB')
rep("<p>EAGLES настроен. Теперь всё приходит <b>сразу, со звуком и поверх экрана</b>.</p>","<p>EAGLES настроен. Звонки и сообщения EYE приходят, <b>пока EAGLES открыт</b>.</p>",'fin')
open(sys.argv[2],'w',encoding='utf-8').write(S)
