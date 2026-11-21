
// ======================================================================
// СТАРТ ПРОЕКТА v1 (задание 107, 21.11.2026, Андрей): время старта + общая статистика проекта.
//  • START_AT (свойство скрипта) ставит только Андрей (11111) кнопкой «СТАРТ», один раз.
//    В первые 30 минут после старта Андрей может «переснять» (сбросить и нажать снова) — для видео.
//  • start_info — открытое действие (страница регистрации без входа):
//      до старта: { at: 0 }; Андрею с preview=1 — статистика за всё время с пометкой preview (проверка до старта);
//      после старта: регистрации на пакеты E1/E6/E12 с момента старта, сколько начислено партнёрам,
//      сколько людей достигли каждого звания (лучший месяц с момента старта), последние 5 оплат.
//  • Только чтение: ничего, кроме START_AT, не пишет. Ответ кэшируется на 15 секунд.
//  • Имена в ленте: только при START_NAMES = true (нужно согласие людей). Иначе имя пустое — страница пишет «Новый орёл».
// ======================================================================
var START_NAMES = false;
var START_RESET_MS = 30 * 60000;
function startAt_() { return Number(PropertiesService.getScriptProperties().getProperty('START_AT') || 0) || 0; }
function startStats_(since, now) {
  var X = moneyCalc_(now), D = X.D, R = X.R;
  var pk = { E1: 0, E6: 0, E12: 0 }, feed = [], earned = 0;
  D.pays.forEach(function (p) {
    if (p.gift || p.prod || p.ref || !(p.sum > 0) || p.at < since || p.at > now) return;
    var k = PKGS[p.pkg] ? p.pkg : 'E1';
    pk[k]++;
    feed.push({ at: p.at, pkg: k, id: p.payer });
  });
  (R.E || []).forEach(function (e) {
    if (e.to === OWNER_ID || e.k === 'move' || e.next || !(e.at >= since)) return;
    earned += e.full != null ? e.full : (e.sum || 0);
  });
  var ranks = null;
  if (R.MV) {
    ranks = [0, 0, 0, 0, 0, 0];
    var best = {}, mk0 = monthKey_(since);
    for (var mk in R.MV) {
      if (mk < mk0) continue;
      var mm = R.MV[mk];
      for (var y in mm) {
        if (y === OWNER_ID) continue;
        var ri = rankIdx_(Math.min(mm[y].L, mm[y].R));
        if (ri > (best[y] == null ? -1 : best[y])) best[y] = ri;
      }
    }
    for (var b in best) if (best[b] >= 0 && best[b] < ranks.length) ranks[best[b]]++;
  }
  feed.sort(function (a, c) { return c.at - a.at; });
  feed = feed.slice(0, 5).map(function (f) {
    var nm = START_NAMES && D.U[f.id] ? String(D.U[f.id].name || '').split(' ')[0] : '';
    return { at: f.at, pkg: f.pkg, name: nm };
  });
  return { pk: pk, total: pk.E1 + pk.E6 + pk.E12, earned: Math.round(earned), ranks: ranks,
           rankNames: RANKS.map(function (r) { return [r[0], r[1]]; }), feed: feed };
}
function startInfo_(e, p) {
  var at = startAt_(), now = Date.now(), me = sessionId_(e), preview = !at && me === OWNER_ID && String(p.preview || '') === '1';
  if (!at && !preview) return jsonOut_({ ok: true, at: 0, now: now, owner: me === OWNER_ID });
  var since = at || 0, cache = CacheService.getScriptCache(), key = 'START_ST_' + since, hit = cache.get(key), st = null;
  if (hit) { try { st = JSON.parse(hit); } catch (x) { st = null; } }
  if (!st) { st = startStats_(since, now); cache.put(key, JSON.stringify(st), 15); }
  return jsonOut_(Object.assign({ ok: true, at: at, now: now, preview: preview ? 1 : 0, owner: me === OWNER_ID,
                                  canReset: me === OWNER_ID && at > 0 && now - at < START_RESET_MS }, st));
}
function startGo_(e, p) {
  if (sessionId_(e) !== OWNER_ID) return jsonOut_({ ok: false, error: 'owner' });
  var props = PropertiesService.getScriptProperties(), at = startAt_(), now = Date.now();
  if (String(p.reset || '') === '1') {
    if (!at) return jsonOut_({ ok: true, at: 0 });
    if (now - at >= START_RESET_MS) return jsonOut_({ ok: false, error: 'too_late', at: at });
    props.setProperty('START_AT', '');
    return jsonOut_({ ok: true, at: 0, reset: 1 });
  }
  if (at) return jsonOut_({ ok: true, at: at, already: 1, now: now });
  props.setProperty('START_AT', String(now));
  return jsonOut_({ ok: true, at: now, now: now });
}
// ===== /СТАРТ ПРОЕКТА v1 =====
