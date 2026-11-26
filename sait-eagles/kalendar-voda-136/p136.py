import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
assert 'egCnt136' not in s
# 1) кружок дня: водичка колышется (волна), уровень = касания
a=s.find('function egMini(k, sz){'); b=s.find('function egDayCard(',a); assert a>0 and b>a
NEW=r'''function egMini(k, sz){
  /* 136: водичка колышется — две волны, уровень = касания (0 = на донышке) */
  var r = sz / 2 - 3, c = sz / 2, lv = k <= 0 ? .1 : Math.min(1, .1 + .9 * k / EG_G), top = c + r - lv * 2 * r, id = 'egm' + (egMiniN++);
  var L = sz, am = Math.max(1.2, sz * .045), d = (Math.random() * 2.4).toFixed(2);
  function wv(y, op, dur, del){
    return '<path d="M0 ' + y + ' Q' + (L / 4) + ' ' + (y - am) + ' ' + (L / 2) + ' ' + y + ' T' + L + ' ' + y + ' T' + (1.5 * L) + ' ' + y + ' T' + (2 * L) + ' ' + y + ' V' + (sz + 2) + ' H0Z" fill="' + egWater(k) + '" opacity="' + op + '">'
      + '<animateTransform attributeName="transform" type="translate" from="0 0" to="' + (-L) + ' 0" dur="' + dur + 's" begin="-' + del + 's" repeatCount="indefinite"/></path>';
  }
  return '<svg viewBox="0 0 ' + sz + ' ' + sz + '" aria-hidden="true"><defs><clipPath id="' + id + '"><circle cx="' + c + '" cy="' + c + '" r="' + r + '"/></clipPath></defs>'
    + '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#14110f"/>'
    + '<g clip-path="url(#' + id + ')">' + wv(top - am * .6, .45, 3.1, d) + wv(top, .92, 2.2, d) + '</g>'
    + '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + (k > EG_G ? '#ffc53d' : k >= EG_G ? '#3ecf6c' : '#2c2620') + '" stroke-width="' + (k > EG_G ? 2.5 : 1.5) + '"/></svg>';
}
'''
s=s[:a]+NEW+s[b:]
# 2) белый кружок с числом касаний справа вверху (0 — не показываем)
old="egMini(t,40)+'<span>'+day+'</span>'+egOrdBadge(t)+'</div>'"
assert s.count(old)==1
s=s.replace(old,"egMini(t,40)+'<span>'+day+'</span>'+egOrdBadge(t)+(t>0?'<i class=\"eg-cnt\">'+t+'</i>':'')+'</div>'")
CSS='''<style id="egCnt136">.cal-cell .eg-cnt{position:absolute;right:-5px;top:-6px;z-index:3;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:#fff;color:#111;font:900 11px/18px "Montserrat",sans-serif;font-style:normal;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.55);pointer-events:none}
.cal-cell .eg-ord{top:auto!important;bottom:-6px!important;right:-5px!important;left:auto!important}
.mk-page .cal-cell{overflow:visible}</style>'''
h=s.find('</head>'); assert h>0
s=s[:h]+CSS+'\n'+s[h:]
s=s.replace('Цвет дня = твой круг касаний: норма 5, сверх нормы золотое кольцо.','Цвет и уровень водички = касания за день, цифра справа = сколько касаний. Норма 5, сверх нормы золотое кольцо.')
open(dst,'w',encoding='utf-8').write(s)
