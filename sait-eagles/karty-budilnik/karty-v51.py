# Карты v51 (26.11.2026): повтор будильника — «Повтор: нет/2/3/5/10 раз» и «каждые 1/3/5/10 мин». Ставится поверх v50.
# В будильнике: rp (сколько повторов после первого звонка), ri (минуты между звонками). Сервер REM v3 раскладывает повторы.
import sys
f = sys.argv[1]; S = open(f, encoding='utf8').read()
if 'al51' in S: sys.exit('STOP: v51 уже стоит')
if 'egAl50' not in S: sys.exit('STOP: нет v50')
def rep(old, new, name, n=1):
    global S
    c = S.count(old)
    if c != n: sys.exit('STOP: якорь "%s" найден %d раз (нужно %d)' % (name, c, n))
    S = S.replace(old, new)
# UI: два ряда под датой/временем
rep('<div class="al50h" id="al50h"></div>',
    '<div class="al50h al51l">Повтор</div><div class="al50q al51" id="al51r"><button type="button" data-r="0" aria-pressed="true">Нет</button><button type="button" data-r="2">2 раза</button><button type="button" data-r="3">3 раза</button><button type="button" data-r="5">5 раз</button><button type="button" data-r="10">10 раз</button></div>'
    '<div class="al50q al51" id="al51i" hidden><button type="button" data-i="1">каждую минуту</button><button type="button" data-i="3" aria-pressed="true">каждые 3 мин</button><button type="button" data-i="5">каждые 5 мин</button><button type="button" data-i="10">каждые 10 мин</button></div>'
    '<div class="al50h" id="al50h"></div>', 'ui')
# последний звонок будильника (с повторами)
rep("window.al50clean=function(){var n=Date.now();window.AL50=(window.AL50||[]).filter(function(a){return a&&a.rf>n-6*3600e3}).slice(0,30);return window.AL50.map(function(a){return{id:a.id,t:a.t,rf:a.rf}})};",
    "function last(a){return a.rf+(a.rp||0)*(a.ri||3)*60000}\n"
    "window.al50clean=function(){var n=Date.now();window.AL50=(window.AL50||[]).filter(function(a){return a&&last(a)>n-6*3600e3}).slice(0,30);return window.AL50.map(function(a){var o={id:a.id,t:a.t,rf:a.rf};if(a.rp>0){o.rp=a.rp;o.ri=a.ri||3}return o})};", 'clean')
rep("var n=Date.now(),act=(window.AL50||[]).filter(function(a){return a.rf>n});", "var n=Date.now(),act=(window.AL50||[]).filter(function(a){return last(a)>n});", 'act')
rep("<span>'+nice(a.rf)+'</span>", "<span>'+nice(a.rf)+(a.rp>0?' · ×'+(a.rp+1)+' через '+(a.ri||3)+' мин':'')+'</span>", 'list')
# сброс выбора при открытии окна
rep("setF(new Date(Date.now()+15*60000));", "setF(new Date(Date.now()+15*60000));try{al51set(0,3)}catch(e){}", 'open')
# клавиатура не выскакивает при открытии окна (Андрей 26.11): фокус только когда сам нажмёшь в поле
rep(";setTimeout(function(){el('al50t').focus()},60)}", "}", 'nofocus')
# сохранить rp/ri
rep("window.AL50.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:txt,rf:f});",
    "var nw={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:txt,rf:f};if(AL51.r>0){nw.rp=AL51.r;nw.ri=AL51.i}window.AL50.push(nw);", 'push')
# звон на странице и при повторах: ближайший звонок, который наступил в последние 2 минуты
rep("setInterval(function(){var n=Date.now();(window.AL50||[]).forEach(function(a){if(a.rf<=n&&a.rf>n-120000&&!rung[a.id]&&!cur){rung[a.id]=1;ring(a);window.al50ui()}})},5000);",
    "setInterval(function(){var n=Date.now();(window.AL50||[]).forEach(function(a){for(var k=0;k<=(a.rp||0);k++){var t=a.rf+k*(a.ri||3)*60000,key=a.id+'_'+k;if(t<=n&&t>n-120000&&!rung[key]&&!cur){rung[key]=1;ring(a);window.al50ui();break}}})},5000);", 'tick')
# «Отложить» на странице: без повторов
rep("window.AL50.push({id:Date.now().toString(36)+'s',t:c.t,rf:Date.now()+600000});", "window.AL50.push({id:Date.now().toString(36)+'s',t:c.t,rf:Date.now()+600000});", 'snz')
BLOCK = r'''<style id="egAl51">.al51l{margin-top:2px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:10.5px}</style>
<script id="egAl51js">
var AL51={r:0,i:3};
function al51set(r,i){AL51.r=r;AL51.i=i;var R=document.getElementById('al51r'),I=document.getElementById('al51i');if(!R||!I)return;
  [].forEach.call(R.children,function(b){b.setAttribute('aria-pressed',String(+b.dataset.r===r))});[].forEach.call(I.children,function(b){b.setAttribute('aria-pressed',String(+b.dataset.i===i))});I.hidden=!r}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;var b=t.closest('#al51r button');if(b){al51set(+b.dataset.r,AL51.i);return}b=t.closest('#al51i button');if(b)al51set(AL51.r,+b.dataset.i)});
</script>
'''
S = S.rstrip('\n') + '\n' + BLOCK
open(f, 'w', encoding='utf8').write(S); print('v51 OK')
