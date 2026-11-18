/* EAGLES DESK v1 (задание 88, 18.11.2026): на широком экране нижнее меню становится левой панелью. Телефон не трогает. */
(function(){
 var mq=window.matchMedia('(min-width:1200px)');var R=document.documentElement;
 function ico(p){return '<svg viewBox="0 0 24 24">'+p+'</svg>'}
 var X=[['/karty.html','Карты',ico('<circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="20" r="2"/><path d="M7 7l3 3M17 7l-3 3M12 15v3"/>')],
  ['https://lure.eaglesteam.ru/','LURE',ico('<path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/>')],
  ['/binar.html','Моя команда',ico('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5"/>')],
  ['/marketing.html','Маркетинг-план',ico('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>')],
  ['/dokumenty.html','Документы',ico('<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6M9 13h8M9 17h6"/>')]];
 function build(){var n=document.querySelector('nav.tabbar');if(!n||n.querySelector('.egd-logo'))return !!n;
  var l=document.createElement('img');l.className='egd-logo';l.alt='EAGLES';
  l.src='/egd/eagles-logo.webp';
  n.insertBefore(l,n.firstChild);
  var s=document.createElement('div');s.className='egd-sep egd-only';n.appendChild(s);
  var here=location.pathname;
  X.forEach(function(x){var a=document.createElement('a');a.className='egd-x egd-only'+(here===x[0]?' active':'');a.href=x[0];a.innerHTML=x[2]+'<span>'+x[1]+'</span>';n.appendChild(a)});
  return true}
 function apply(){if(mq.matches){R.classList.add('egd');build()}else R.classList.remove('egd')}
 var st=document.createElement('style');st.textContent='nav.tabbar .egd-only,nav.tabbar .egd-logo{display:none}html.egd nav.tabbar .egd-only{display:flex}html.egd nav.tabbar .egd-sep{display:block}html.egd nav.tabbar .egd-logo{display:block}';document.head.appendChild(st);
 apply();(mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply));
 var t=0,iv=setInterval(function(){apply();if(document.querySelector('nav.tabbar .egd-logo')||!mq.matches||++t>40)clearInterval(iv)},250);
})();
