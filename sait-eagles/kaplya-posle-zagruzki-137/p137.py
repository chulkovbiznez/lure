import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egDrop137' not in s
old='''      var wait = Math.max(0, (go ? 600 : 1300) - (Date.now() - PAGE_START));
      setTimeout(function step(){
        if(curN >= to) return;
        oneDrop(curN, function(){ setTimeout(step, 180); });
      }, wait);'''
assert s.count(old)==1
new='''      /* 26.11 egDrop137: капли падают и звучат только когда экран загрузки и ПИН ушли и круг виден */
      function egBusy137(){ var z = document.getElementById('egpZ'), p = document.querySelector('.egpn');
        return !!((z && (!z.hidden || document.documentElement.classList.contains('egz0'))) || (p && !p.hidden && getComputedStyle(p).display !== 'none') || document.hidden); }
      function step(){
        if(curN >= to) return;
        oneDrop(curN, function(){ setTimeout(step, 180); });
      }
      (function waitFree(){
        if(egBusy137()) return setTimeout(waitFree, 150);
        setTimeout(step, go ? 450 : 700);
      })();'''
s=s.replace(old,new)
# 137b (Андрей): при каждом входе в Профиль показываем на одно касание меньше, через секунду падает капля и становится как есть
old2 = "      if(todayN > seen) startDrop(seen, todayN);\n      else setLabels(todayN);"
assert s.count(old2)==1
s=s.replace(old2, "      if(todayN > seen) startDrop(seen, todayN);\n      else startDrop(todayN - 1, todayN); /* 137b: последняя капля падает при каждом входе */")
s=s.replace("setTimeout(step, go ? 450 : 700);","setTimeout(step, go ? 450 : 1000);")
open(dst,'w',encoding='utf-8').write(s)
