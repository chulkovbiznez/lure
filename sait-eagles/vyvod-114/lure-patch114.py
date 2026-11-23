# LURE: забирать вывод из EAGLES на баланс (задание 114, 23.11.2026). Запуск: python3 lure-patch114.py server.js server-new.js
import sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
if 'pullWd' in s: sys.exit('СТОП: уже есть pullWd')
FN = '''// ----- вывод из EAGLES (задание 114): заработанное приходит на баланс, когда человек открывает LURE -----
const wdLast = {};
async function pullWd(u, S) {
  if (!S || !S.es || Date.now() - (wdLast[u.id] || 0) < 20000) return;
  wdLast[u.id] = Date.now();
  try {
    const r = await eagles({ action: 'wd_lure_pull', sess: S.es });
    if (!r || !r.ok || !Array.isArray(r.list) || !r.list.length) return;
    db.wdDone = db.wdDone || {};
    const got = [];
    for (const x of r.list) {
      const wid = String(x.wid || ''), sum = r2(Number(x.net));
      if (!/^[A-Za-z0-9_-]{6,40}$/.test(wid) || !(sum > 0) || sum > 1000000) continue;
      if (!db.wdDone[wid]) { op(u, 'credit', sum, 'Вывод из EAGLES'); db.wdDone[wid] = Date.now(); }
      got.push(wid);
    }
    writeAtomic(DB_FILE, JSON.stringify(db));   // сначала записали у себя, потом говорим EAGLES «забрал»
    if (got.length) await eagles({ action: 'wd_lure_ack', sess: S.es, wids: got.join(',') });
  } catch (e) { console.log('pullWd', e && e.message); }
}

'''
R = [
 ("  if (p === '/api/me') return send(res, 200, { ok: true, me: pub(u) });", "  if (p === '/api/me') { await pullWd(u, S); return send(res, 200, { ok: true, me: pub(u) }); }"),
 ("async function api(req, res, url) {", FN + "async function api(req, res, url) {"),
]
for a, b in R:
    n = s.count(a)
    if n != 1: sys.exit('СТОП: нашлось %d раз: %s' % (n, a[:60]))
    s = s.replace(a, b)
for need in ('function writeAtomic(', 'const DB_FILE', 'function op(', 'async function eagles('):
    if need not in s: sys.exit('СТОП: нет ' + need)
open(dst, 'w', encoding='utf-8').write(s)
print('ГОТОВО md5', hashlib.md5(s.encode()).hexdigest(), 'байт', len(s.encode()))
