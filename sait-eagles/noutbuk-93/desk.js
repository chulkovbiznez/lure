/* EAGLES DESK v5 (задания 90–93, 18.11.2026): на широком экране нижнее меню страницы (.tabbar или .ek-nav) становится левой панелью. Телефон не трогает. */
(function(){
 var mq=window.matchMedia('(min-width:1200px)');var R=document.documentElement;
 function ico(p){return '<svg viewBox="0 0 24 24">'+p+'</svg>'}
 var X=[['/karty.html','Карты',ico('<circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="20" r="2"/><path d="M7 7l3 3M17 7l-3 3M12 15v3"/>')],
  ['https://lure.eaglesteam.ru/','LURE',ico('<path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/>')],
  ['/binar.html','Моя команда',ico('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5"/>')],
  ['/marketing.html','Маркетинг-план',ico('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>')],
  ['/dokumenty.html','Документы',ico('<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6M9 13h8M9 17h6"/>')]];
 function findNav(){var c=document.querySelectorAll('nav.tabbar,div.tabbar,nav.ek-nav');for(var i=0;i<c.length;i++){if(getComputedStyle(c[i]).position==='fixed')return c[i]}return c[0]||null}
 function build(){var n=document.querySelector('.egd-nav')||findNav();if(!n)return false;
  if(n.querySelector('.egd-logo'))return true;
  n.classList.add('egd-nav');
  var its=n.querySelectorAll('.tab-item, :scope > div > a, :scope > div > button, :scope > a, :scope > button');
  for(var i=0;i<its.length;i++){its[i].classList.add('egd-it')}
  var l=document.createElement('img');l.className='egd-logo';l.alt='EAGLES';l.src='/egd/eagles-logo.webp';
  n.insertBefore(l,n.firstChild);
  var s=document.createElement('div');s.className='egd-sep egd-only';n.appendChild(s);
  var here=location.pathname;
  X.forEach(function(x){var a=document.createElement('a');a.className='egd-x egd-only'+(x[0]===here?' active':'');a.href=x[0];a.innerHTML=x[2]+'<span>'+x[1]+'</span>';n.appendChild(a)});
  /* 92: страница из нижнего списка (например Моя команда) — подсвечен только её пункт */
  if(X.some(function(x){return x[0]===here})){for(var k=0;k<its.length;k++){its[k].classList.remove('active');its[k].classList.remove('on')}}
  return true}
 function apply(){if(mq.matches){if(build())R.classList.add('egd')}else R.classList.remove('egd')}
 var st=document.createElement('style');st.textContent='.egd-nav .egd-only,.egd-nav .egd-logo{display:none}html.egd .egd-nav .egd-only{display:flex}html.egd .egd-nav .egd-sep{display:block}html.egd .egd-nav .egd-logo{display:block}';document.head.appendChild(st);
 apply();(mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply));
 var t=0,iv=setInterval(function(){apply();if(R.classList.contains('egd')||!mq.matches||++t>40)clearInterval(iv)},250);

 /* 91: EYE — подсветить открытый чат в списке слева */
 function eyeMark(){var l=document.getElementById('vChats');if(!l)return;var m=/[?&]to=([^&]+)/.exec(location.search);var id=m?decodeURIComponent(m[1]):'';var r=document.getElementById('chRoom');if(!r||!r.classList.contains('on'))id='';
  var b=l.querySelectorAll('.ch-item');for(var i=0;i<b.length;i++){b[i].classList.toggle('egd-on',!!id&&b[i].getAttribute('data-id')===id)}}
 if(document.getElementById('chRoom')){setInterval(eyeMark,400);document.addEventListener('click',function(){setTimeout(eyeMark,60)},true)}

 /* 92: Контакты — на широком экране две колонки (обёртки на телефоне не видны: display:contents) */
 function wrapKids(box,cls,split){if(!box||box.querySelector('.'+cls))return;var k=[].slice.call(box.children);if(!k.length)return;
  var w=document.createElement('div');w.className=cls;var a=document.createElement('div');a.className=cls+'-l';var b=document.createElement('div');b.className=cls+'-r';
  var cut=split(k);if(cut<1||cut>=k.length)return;k.forEach(function(c,i){(i<cut?a:b).appendChild(c)});w.appendChild(a);w.appendChild(b);box.appendChild(w)}
 function kont(){var tl=document.getElementById('tabList'),lz=document.getElementById('listZone');if(!tl||!lz)return;
  wrapKids(tl,'egd-kw',function(k){for(var i=0;i<k.length;i++){if(k[i].classList.contains('filter-row'))return i}return -1});
  wrapKids(document.getElementById('tabCal'),'egd-cw',function(){return 1})}
 /* 93: Мои ролики — слева «как добавить» и ссылка, справа библиотека */
 function rol(){wrapKids(document.getElementById('rlApp'),'egd-kw',function(k){for(var i=0;i<k.length;i++){if(k[i].classList.contains('rl-list-h'))return i}return -1})}
 rol();
 kont();
})();
