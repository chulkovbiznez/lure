# Будильник Карт v2 (26.11.2026 13:45): решение Андрея — будильник отдельной кнопкой, НЕ про дела.
# Правит server.js, где уже стоит блок REM v1 (p-rem.py). Запуск: python3 p-rem2.py pkg/server.js
# Теперь напоминания берутся только из будильников al:[{id,t,rf}] в Картах; сроки дел больше не звонят.
import sys, re
sv = sys.argv[1]
S = open(sv, encoding='utf8').read()
if 'REM v2' in S: sys.exit('STOP: уже v2')
if 'REM v1' not in S: sys.exit('STOP: нет REM v1')
a = S.index('function remCollect_(m, sentTo) {'); b = S.index('\nfunction remPut_(')
S = S[:a] + r"""function remCollect_(m, sentTo) {   // REM v2: только будильники (al), сроки дел не звонят
  var out = [], now = Date.now(), from = Math.max(now - 120000, Number(sentTo) || 0);
  (m && Array.isArray(m.al) ? m.al : []).forEach(function (x) {
    if (!x || typeof x !== 'object' || out.length >= REM_MAX) return;
    var rf = Number(x.rf) || 0, id = String(x.id || '');
    if (/^[a-z0-9]{4,20}$/.test(id) && rf > from && rf < now + 400 * 86400000)
      out.push({ f: rf, t: String(x.t || 'Будильник').replace(/\s+/g, ' ').slice(0, 60), u: '/karty.html#al=' + id, m: '', w: '', a: 1 });
  });
  out.sort(function (a, b) { return a.f - b.f; });
  return out;
}""" + S[b:]
old = "  if (x.s) b = 'Отложено на 10 минут';"
if S.count(old) != 1: sys.exit('STOP: remBody_')
S = S.replace(old, old + "\n  if (x.a && !x.s) { var d = new Date(Number(x.f) + 3 * 3600000); b = 'Будильник · ' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2); return b; }")
old = "!/^\\/karty\\.html#delo=[\\d.]{1,80}$/.test(u)"
if S.count(old) != 1: sys.exit('STOP: snooze regex')
S = S.replace(old, "!/^\\/karty\\.html#(delo=[\\d.]{1,80}|al=[a-z0-9]{4,20})$/.test(u)")
S = S.replace("// =================== end of block REM v1 ===================", "// REM v2 (26.11.2026 13:45): будильники al вместо сроков дел.\n// =================== end of block REM v1 ===================")
open(sv, 'w', encoding='utf8').write(S); print('REM v2 OK')
