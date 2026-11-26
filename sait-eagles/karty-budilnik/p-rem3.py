# Будильник v3 (26.11.2026): повторы. server.js с REM v2. Будильник {id,t,rf,rp,ri} → звонки rf, rf+ri, … (rp повторов, до 10, ri 1–60 мин).
import sys
sv = sys.argv[1]; S = open(sv, encoding='utf8').read()
if 'REM v3' in S: sys.exit('STOP: уже v3')
if 'REM v2' not in S: sys.exit('STOP: нет REM v2')
old = """    if (/^[a-z0-9]{4,20}$/.test(id) && rf > from && rf < now + 400 * 86400000)
      out.push({ f: rf, t: String(x.t || 'Будильник').replace(/\\s+/g, ' ').slice(0, 60), u: '/karty.html#al=' + id, m: '', w: '', a: 1 });"""
if S.count(old) != 1: sys.exit('STOP: якорь collect')
S = S.replace(old, """    var rp = Math.max(0, Math.min(10, Math.floor(Number(x.rp) || 0))), ri = Math.max(1, Math.min(60, Math.floor(Number(x.ri) || 3)));   // REM v3: повторы
    if (!/^[a-z0-9]{4,20}$/.test(id)) return;
    for (var k = 0; k <= rp && out.length < REM_MAX; k++) {
      var fk = rf + k * ri * 60000;
      if (fk > from && fk < now + 400 * 86400000)
        out.push({ f: fk, t: String(x.t || 'Будильник').replace(/\\s+/g, ' ').slice(0, 60), u: '/karty.html#al=' + id, m: '', w: '', a: 1, k: k, n: rp });
    }""")
old = "  if (x.a && !x.s) { var d = new Date(Number(x.f) + 3 * 3600000); b = 'Будильник · ' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2); return b; }"
if S.count(old) != 1: sys.exit('STOP: якорь body')
S = S.replace(old, "  if (x.a && !x.s) { var d = new Date(Number(x.f) + 3 * 3600000); b = 'Будильник · ' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2); if (x.n) b += ' · повтор ' + x.k + ' из ' + x.n; if (x.n && !x.k) b = 'Будильник · ' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2) + ' · ещё ' + x.n + ' повт.'; return b; }")
S = S.replace("// REM v2 (26.11.2026 13:45): будильники al вместо сроков дел.", "// REM v2 (26.11.2026 13:45): будильники al вместо сроков дел.\n// REM v3 (26.11.2026 14:10): повторы rp/ri.")
open(sv, 'w', encoding='utf8').write(S); print('REM v3 OK')
