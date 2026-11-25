/* EAGLES приложение (PWA), шаг 1 — 25.11.2026.
   Ничего не кэширует, кроме страницы «Нет интернета»: сайт всегда свежий.
   Обработчики push/notificationclick — заготовка для шага 2 (уведомления). */
var V='egpwa-1', OFF='/egpwa/offline.html';
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll([OFF,'/egpwa/icon-192.png']);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==V;}).map(function(n){return caches.delete(n);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.mode!=='navigate')return;               /* картинки, сервер, видео — как обычно, мимо */
  e.respondWith(fetch(r).catch(function(){return caches.match(OFF);}));
});
/* v2 (25.11.2026): звонок EYE — «📞 Имя звонит» висит, пока не нажмёшь, и долго вибрирует; если EAGLES открыт на экране, не показываем
   (там уже экран звонка). Новое сообщение с тем же tag снова звенит (renotify), а не заменяет старое молча. */
self.addEventListener('push',function(e){
  var d={};try{d=e.data?e.data.json():{};}catch(x){d={body:e.data&&e.data.text()};}
  var ring=/^\u{1F4DE}/u.test(d.title||''), o={body:d.body||'',icon:'/egpwa/icon-192.png',badge:'/egpwa/favicon-48.png',data:{url:d.url||'/'},
    tag:d.tag||undefined,renotify:!!d.tag,vibrate:ring?[600,300,600,300,600,300,600,300,600]:[200,100,200]};
  if(ring)o.requireInteraction=true;
  e.waitUntil((ring?self.clients.matchAll({type:'window',includeUncontrolled:true}):Promise.resolve([])).then(function(cs){
    for(var i=0;i<cs.length;i++)if(cs[i].visibilityState==='visible')return;
    return self.registration.showNotification(d.title||'EAGLES',o);
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();var u=(e.notification.data&&e.notification.data.url)||'/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){if('focus' in cs[i]){cs[i].navigate(u);return cs[i].focus();}}
    return self.clients.openWindow(u);
  }));
});
