# Будильник Карт (26.11.2026): сервер eagles-server. Правит index.js и server.js.
# Запуск: python3 p-rem.py pkg/index.js pkg/server.js   (каждая замена: якорь ровно 1 раз, иначе STOP)
# Нужно после задания 122 (уведомления на телефон). Плюс таймер-триггер раз в минуту с payload «rem» (делает КВХ/Claude в консоли).
import sys
ix, sv = sys.argv[1], sys.argv[2]
def rep(s, old, new, name):
    n = s.count(old)
    if n != 1: sys.exit('STOP: якорь "%s" найден %d раз' % (name, n))
    return s.replace(old, new)
I = open(ix, encoding='utf8').read()
if 'rem_tick' in I: sys.exit('STOP: index.js уже с будильником')
if 'pushWork' not in I: sys.exit('STOP: нет уведомлений (задание 122) — сначала их')
# таймер с payload «rem» → внутренний запрос type=rem_tick (снаружи его не подделать: флаг ставит только этот код)
I = rep(I, "module.exports.handler = async function (event) {\n",
  "module.exports.handler = async function (event) {\n"
  "  // будильник Карт: таймер раз в минуту с payload «rem» → внутренний запрос rem_tick\n"
  "  if (event && Array.isArray(event.messages) && !event.httpMethod) {\n"
  "    const m0 = event.messages[0] || {}, pl = String((m0.details && m0.details.payload) || m0.payload || '');\n"
  "    if (pl === 'rem') event = { httpMethod: 'POST', queryStringParameters: { type: 'rem_tick' }, body: '', headers: {}, _rem: true };\n"
  "  }\n", 'handler')
I = rep(I, "const e = { payVerified, parameter: p,", "const e = { payVerified, internal: event._rem === true, parameter: p,", 'e')
# за один тик будильник может прислать до 30 уведомлений (обычный запрос — до 10, как было)
I = rep(I, "if (R.pushes && R.pushes.length < 10 && to)", "if (R.pushes && R.pushes.length < (R.pushMax || 10) && to)", 'pushmax')
I = rep(I, "notes: [], pushes: [], pushSave: [], pushOff: [] };", "notes: [], pushes: [], pushSave: [], pushOff: [] }; if (event._rem) R.pushMax = 30;", 'R')
open(ix, 'w', encoding='utf8').write(I)

S = open(sv, encoding='utf8').read()
if 'remApi_' in S: sys.exit('STOP: server.js уже с будильником')
if 'function push_(' not in S: sys.exit('STOP: нет push_ (задание 122)')
S = rep(S, "  var me = sessionId_(e);\n  if (!me) return noAuth_();\n  var p = e.parameter;\n  var type = p.type;\n",
  "  if (e && e.parameter && (e.parameter.type === 'rem_tick' || e.parameter.type === 'rem_snooze')) return remApi_(e);\n"
  "  var me = sessionId_(e);\n  if (!me) return noAuth_();\n  var p = e.parameter;\n  var type = p.type;\n", 'doPost')
S += r"""

// ===================== REM v1 (2026-11-26) — будильник Карт =====================
// В деле Карт страница хранит rm (за сколько минут напомнить) и rf (когда звонить, мс, по часам телефона).
// При каждом сохранении Карт список ближайших напоминаний человека кладётся в лист rem_all: ID, Json, At, Sent
// (Sent — до какого времени уже всё отправлено: повторное сохранение Карт не пришлёт то же напоминание ещё раз).
// Таймер раз в минуту (index.js → type=rem_tick, только изнутри) шлёт уведомление «⏰ …» тем, кому пора.
// Уведомление: тап → дело в Картах; «Готово» → karty.html#delo=…&ok; «Отложить 10 мин» → type=rem_snooze (без входа, по ключу).
var REM_MAX = 60, REM_TICK_MAX = 30, REM_LATE = 3 * 3600000;
function remSheet_() { return getSheet_('rem_all', ['ID', 'Json', 'At', 'Sent']); }
function remSalt_() {
  var pr = PropertiesService.getScriptProperties(), s = pr.getProperty('REM_SALT');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); pr.setProperty('REM_SALT', s); }
  return s;
}
function remKey_(id, u, t) {   // короткая подпись напоминания: без неё «Отложить» не примут
  var s = remSalt_() + '|' + id + '|' + u + '|' + t, h1 = 0x811c9dc5, h2 = 0x01000193 ^ 0x5bd1e995;
  for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 2246822519) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0; }
  return ('0000000' + h1.toString(16)).slice(-8) + ('0000000' + h2.toString(16)).slice(-8);
}
function remCollect_(m, sentTo) {
  var out = [], now = Date.now(), from = Math.max(now - 120000, Number(sentTo) || 0);
  (m && Array.isArray(m.maps) ? m.maps : []).forEach(function (mp, mi) {
    (function go(d, path, depth) {
      if (!d || typeof d !== 'object' || depth > 40 || out.length >= REM_MAX) return;
      var rf = Number(d.rf) || 0;
      if (path.length && rf > from && rf < now + 400 * 86400000 && !d.done)
        out.push({ f: rf, t: String(d.t || d.name || 'Дело').replace(/\s+/g, ' ').slice(0, 60), u: '/karty.html#delo=' + [mi].concat(path).join('.'),
          m: String((mp && mp.name) || '').slice(0, 30), w: String(d.tm || '') });
      (Array.isArray(d.kids) ? d.kids : []).forEach(function (k, i) { go(k, path.concat([i]), depth + 1); });
    })(mp && mp.data, [], 0);
  });
  out.sort(function (a, b) { return a.f - b.f; });
  return out;
}
function remPut_(id, list) {
  var sh = remSheet_(), d = sh.getDataRange().getValues(), js = JSON.stringify(list || []);
  for (var r = 1; r < d.length; r++) if (String(d[r][0]) === String(id)) {
    if (String(d[r][1] || '[]') !== js) sh.getRange(r + 1, 2, 1, 2).setValues([[js, Date.now()]]);
    return;
  }
  if (list && list.length) sh.appendRow([String(id), js, Date.now()]);
}
function remBody_(x) {
  var b = x.w ? 'В ' + x.w : 'Сегодня';
  if (x.s) b = 'Отложено на 10 минут';
  return b + (x.m ? ' · карта «' + x.m + '»' : '');
}
function remTick_() {
  var sh = remSheet_(), d = sh.getDataRange().getValues(), now = Date.now(), sent = 0;
  for (var r = 1; r < d.length && sent < REM_TICK_MAX; r++) {
    var L; try { L = JSON.parse(String(d[r][1] || '[]')); } catch (e) { continue; }
    if (!Array.isArray(L) || !L.length || !(L[0].f <= now + 30000)) continue;   // список отсортирован
    var id = String(d[r][0]), keep = [];
    for (var i = 0; i < L.length; i++) {
      var x = L[i];
      if (x.f <= now + 30000 && sent < REM_TICK_MAX) {
        if (x.f > now - REM_LATE) { push_(id, '⏰ ' + x.t, remBody_(x), x.u, 'rem-' + id + '-' + remKey_(id, x.u, x.t)); sent++; }
      } else keep.push(x);
    }
    sh.getRange(r + 1, 2, 1, 3).setValues([[JSON.stringify(keep), now, sent < REM_TICK_MAX ? now + 30000 : Number(d[r][3]) || 0]]);
  }
  return jsonOut_({ ok: true, sent: sent });
}
function remApi_(e) {
  var p = e.parameter || {};
  if (p.type === 'rem_tick') {
    if (e.internal !== true) return jsonOut_({ ok: false, error: 'no' });
    return remTick_();
  }
  // «Отложить 10 мин» из уведомления: id, u (ссылка на дело), t (название), k (подпись из tag уведомления)
  var id = String(p.id || ''), u = String(p.u || ''), t = String(p.t || '').slice(0, 60), k = String(p.k || '');
  if (!/^\d{1,9}$/.test(id) || !/^\/karty\.html#delo=[\d.]{1,80}$/.test(u) || k !== remKey_(id, u, t)) return jsonOut_({ ok: false, error: 'bad' });
  var sh = remSheet_(), d = sh.getDataRange().getValues(), L = [], row = -1;
  for (var r = 1; r < d.length; r++) if (String(d[r][0]) === id) { row = r; try { L = JSON.parse(String(d[r][1] || '[]')) || []; } catch (e2) { L = []; } break; }
  L = L.filter(function (x) { return !(x.s && x.u === u); });
  L.push({ f: Date.now() + 600000, t: t, u: u, m: '', w: '', s: 1 });
  L.sort(function (a, b) { return a.f - b.f; });
  L = L.slice(0, REM_MAX);
  if (row > 0) sh.getRange(row + 1, 2, 1, 2).setValues([[JSON.stringify(L), Date.now()]]); else sh.appendRow([id, JSON.stringify(L), Date.now()]);
  return jsonOut_({ ok: true });
}
// после удачного сохранения Карт обновляем список напоминаний человека
kartySave_ = (function (orig) {
  return function (me, p) {
    var out = orig(me, p);
    try {
      var txt = out && out.getContent ? String(out.getContent()) : '';
      if (/"ok":true/.test(txt)) {
        var sh = remSheet_(), d = sh.getDataRange().getValues(), old = [], sentTo = 0;
        for (var r = 1; r < d.length; r++) if (String(d[r][0]) === String(me)) { try { old = JSON.parse(String(d[r][1] || '[]')) || []; } catch (e2) {} sentTo = Number(d[r][3]) || 0; break; }
        var L = remCollect_(JSON.parse(String(p.data || '')), sentTo);
        old.forEach(function (x) { if (x.s && x.f > Date.now()) L.push(x); });   // отложенные не теряем
        L.sort(function (a, b) { return a.f - b.f; });
        remPut_(me, L.slice(0, REM_MAX));
      }
    } catch (eR) {}
    return out;
  };
})(kartySave_);
// =================== end of block REM v1 ===================
"""
open(sv, 'w', encoding='utf8').write(S)
print('REM PATCH OK')
