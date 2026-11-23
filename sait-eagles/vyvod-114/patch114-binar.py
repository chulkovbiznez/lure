import sys, hashlib
src, dst, blk = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding='utf-8').read()
if 'ВЫВОД v1' in s: sys.exit('СТОП: вывод уже подключён')
R = [
 ("tax:['Нужен статус','ИП или самозанятый','t']", "tax:['Без статуса','можно вывести в LURE','t']"),
 ("var lockWhy = !M.active ? 'Оплати подписку, чтобы получить эти деньги.' : !M.tax ? 'Вывод доступен после оформления самозанятости или ИП в России.' : T.ok < (M.minWithdraw || 500) ? 'Вывод от ' + rub(M.minWithdraw || 500) + '.' : 'Вывод денег подключим вместе с оплатой.';",
  "var lockWhy = !M.active ? 'Оплати подписку, чтобы получить эти деньги.' : 'Вывод от ' + rub(wdMin(M)) + '. Сейчас можно вывести ' + rub(wdAll(M)) + '.';"),
 ("'<button class=\"bn-btn ' + (M.canWithdraw ? 'gold' : 'lock') + '\" id=\"bnOut\">' + (M.canWithdraw ? 'Вывести ' + rub(T.ok) : '🔒 Вывести') + '</button>'",
  "'<button class=\"bn-btn ' + (wdCan(M) ? 'gold' : 'lock') + '\" id=\"bnOut\">' + (wdCan(M) ? 'Вывести' : '🔒 Вывести') + '</button>' + (M.wd && M.wd.out ? '<div class=\"bn-line\"><span>Уже выведено</span><b>' + rub(M.wd.out) + '</b></div>' : '')"),
 ("""    $('bnOut').onclick = function(){
      var m = $('bnOutMsg'); m.style.display = 'block';
      if(M.canWithdraw){ m.textContent = 'Заявка на вывод скоро появится здесь.'; return; }
      m.innerHTML = esc(lockWhy) + (!M.active ? ' <a href="/profile.html" style="color:#ffd23f;font-weight:800">Профиль →</a>' : '');
    };""", "    $('bnOut').onclick = function(){ wdOpen(M, lockWhy); };"),
 ("  function showItems(list){", open(blk, encoding='utf-8').read() + "  function showItems(list){"),
]
for a, b in R:
    n = s.count(a)
    if n != 1: sys.exit('СТОП: нашлось %d раз: %s' % (n, a[:70]))
    s = s.replace(a, b)
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО md5', hashlib.md5(s.encode()).hexdigest(), 'байт', len(s.encode()))
