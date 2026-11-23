// =====================================================================
// ВЫВОД v1 (задание 114, 23.11.2026, Андрей «да»): «Вывести» → через покупку LURE или деньгами (только ИП/самозанятым)
// Лист wd: Wid | Id | Kind (lure|cash) | Sum (списано из заработанного) | Net (на баланс/к выплате) | Hold (удержано НДФЛ)
//          | Inn | St (lure — ждёт LURE, done — зачислено в LURE, new — заявка на деньги, paid — выплачено, cancel — отменено) | At | DoneAt | Note
// Выведенное (всё, кроме cancel) вычитается из «Можно вывести» (сначала ok, потом tax) — до Копилки.
// LURE забирает свои строки сам по ключу входа человека: wd_lure_pull → начисляет → wd_lure_ack.
// LURE_HOLD_PCT: удержание НДФЛ у тех, кто без статуса. 0 = на баланс вся сумма, Андрей сообщает в налоговую (п.5 ст.226 НК,
//   письмо ФНС 24.03.2016 № БС-4-11/5110@). Менять только по решению Андрея.
// =====================================================================
var LURE_HOLD_PCT = 0;
var WD_HEAD = ['Wid', 'Id', 'Kind', 'Sum', 'Net', 'Hold', 'Inn', 'St', 'At', 'DoneAt', 'Note'];
function wdSheet_() { return getSheet_('wd', WD_HEAD); }
function wdRows_(id) {
  var d = wdSheet_().getDataRange().getValues(), out = [];
  for (var i = 1; i < d.length; i++) {
    if (!d[i][0]) continue;
    var r = { row: i + 1, wid: String(d[i][0]), id: normId_(d[i][1]), kind: String(d[i][2] || ''), sum: Number(d[i][3]) || 0, net: Number(d[i][4]) || 0,
              hold: Number(d[i][5]) || 0, inn: String(d[i][6] || '').replace(/\D/g, ''), st: String(d[i][7] || ''), at: Number(d[i][8]) || 0, done: Number(d[i][9]) || 0, note: String(d[i][10] || '') };
    if (!id || r.id === id) out.push(r);
  }
  return out;
}
var r2w_ = function (v) { return Math.round(v * 100) / 100; };
// вычесть выведенное из сумм кабинета (зовётся из moneyFor_ перед Копилкой)
function wdApply_(me, tot) {
  var out = 0, pend = 0;
  wdRows_(me).forEach(function (r) { if (r.st !== 'cancel') out += r.sum; if (r.st === 'lure' || r.st === 'new') pend += r.net; });
  out = r2w_(out);
  var fromOk = Math.min(out, tot.ok); tot.ok = r2w_(tot.ok - fromOk);
  tot.tax = r2w_(Math.max(0, tot.tax - (out - fromOk)));
  return { out: out, pending: r2w_(pend), holdPct: LURE_HOLD_PCT };
}
// Касса: то же по каждому человеку
function wdKassa_(tot, list) {
  var by = {}, done = 0, pend = 0;
  wdRows_('').forEach(function (r) {
    if (r.st === 'cancel') return;
    by[r.id] = (by[r.id] || 0) + r.sum;
    if (r.st === 'done' || r.st === 'paid') done += r.sum; else pend += r.sum;
  });
  list.forEach(function (P) {
    var o = by[P.id] || 0; if (!o) return;
    var a = Math.min(o, P.ok); P.ok = r2w_(P.ok - a); var b = Math.min(o - a, P.tax0); P.tax0 = r2w_(P.tax0 - b);
    tot.ok = r2w_(tot.ok - a); tot.tax = r2w_(tot.tax - b); P.sum = r2w_(P.sum - a - b); P.out = r2w_(o);
  });
  return { done: r2w_(done), pending: r2w_(pend) };
}
function wd_(action, me, p) {
  if (action === 'wd_list') {
    return jsonOut_({ ok: true, min: MIN_WITHDRAW, holdPct: LURE_HOLD_PCT, cashOpen: WITHDRAW_OPEN,
      list: wdRows_(me).reverse().slice(0, 30).map(function (r) { return { wid: r.wid, kind: r.kind, sum: r.sum, net: r.net, hold: r.hold, st: r.st, at: r.at, done: r.done }; }) });
  }
  if (action === 'wd_lure_pull') {
    return jsonOut_({ ok: true, list: wdRows_(me).filter(function (r) { return r.kind === 'lure' && r.st === 'lure'; }).map(function (r) { return { wid: r.wid, net: r.net }; }) });
  }
  if (action === 'wd_lure_ack') {
    var want = {}; String(p.wids || '').split(',').forEach(function (w) { w = w.trim(); if (w) want[w] = 1; });
    var sh = wdSheet_(), n = 0, now = Date.now();
    wdRows_(me).forEach(function (r) { if (want[r.wid] && r.kind === 'lure' && r.st === 'lure') { sh.getRange(r.row, 8).setValue('done'); sh.getRange(r.row, 10).setValue(now); n++; } });
    return jsonOut_({ ok: true, n: n });
  }
  if (action !== 'wd_req') return jsonOut_({ ok: false, error: 'bad_action' });
  if (me === OWNER_ID) return jsonOut_({ ok: false, error: 'owner' });
  var kind = String(p.kind || ''), amt = Math.floor(Number(p.amt) || 0);
  if (kind !== 'lure' && kind !== 'cash') return jsonOut_({ ok: false, error: 'bad_kind' });
  var wsh = wdSheet_(), ush = usersSheet_();   // листы создаём до замка
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var now = Date.now(), m = moneyFor_(me, now), T = m.totals, tax = m.tax;
    if (kind === 'cash') {
      if (!tax) return jsonOut_({ ok: false, error: 'need_status' });
      if (!WITHDRAW_OPEN) return jsonOut_({ ok: false, error: 'cash_closed' });
    } else if (!m.active) return jsonOut_({ ok: false, error: 'need_pro' });
    var avail = kind === 'cash' ? T.ok : r2w_(T.ok + T.tax);
    if (amt < MIN_WITHDRAW) return jsonOut_({ ok: false, error: 'min', min: MIN_WITHDRAW });
    if (amt > avail) return jsonOut_({ ok: false, error: 'no_money', avail: avail });
    var u = findUserById_(me); if (!u) return noAuth_();
    var inn = String(u.inn || '').replace(/\D/g, '');
    if (kind === 'lure' && !tax) {
      if (String(p.agree || '') !== '1') return jsonOut_({ ok: false, error: 'need_agree' });
      if (!inn) {
        inn = String(p.inn || '').replace(/\D/g, '');
        if (!innOk_(inn)) return jsonOut_({ ok: false, error: 'bad_inn' });
        if (innOwner_(inn, me)) return jsonOut_({ ok: false, error: 'inn_taken' });
        ush.getRange(u.row, 17).setValue("'" + inn);
      }
    }
    var hold = kind === 'lure' && !tax && LURE_HOLD_PCT > 0 ? Math.round(amt * LURE_HOLD_PCT) / 100 : 0, net = r2w_(amt - hold);
    var wid = 'w' + now.toString(36) + Math.random().toString(36).slice(2, 7);
    wsh.appendRow([wid, me, kind, amt, net, hold, inn ? "'" + inn : '', kind === 'lure' ? 'lure' : 'new', now, '', kind === 'lure' ? (tax ? 'статус ' + tax : 'без статуса') : tax]);
    var m2 = moneyFor_(me, now);
    return jsonOut_({ ok: true, wid: wid, kind: kind, sum: amt, net: net, hold: hold, money: m2 });
  } finally { lock.releaseLock(); }
}
// Андрей: все заявки и отметка «выплачено» / «отменено» (отменить можно, пока LURE не забрал или деньги не выплачены)
function admWd_(action, p) {
  var U = usersLite_();
  if (action === 'adm_wd_list') {
    return jsonOut_({ ok: true, list: wdRows_('').reverse().slice(0, 300).map(function (r) {
      return { wid: r.wid, id: r.id, name: U[r.id] ? U[r.id].name : r.id, kind: r.kind, sum: r.sum, net: r.net, hold: r.hold, inn: r.inn, st: r.st, at: r.at, done: r.done, note: r.note }; }) });
  }
  var wid = String(p.wid || ''), st = String(p.st || ''), sh = wdSheet_(), hit = null;
  if (st !== 'paid' && st !== 'cancel') return jsonOut_({ ok: false, error: 'bad_st' });
  wdRows_('').forEach(function (r) { if (r.wid === wid) hit = r; });
  if (!hit) return jsonOut_({ ok: false, error: 'not_found' });
  if (!((hit.st === 'new') || (hit.st === 'lure' && st === 'cancel'))) return jsonOut_({ ok: false, error: 'bad_state', st: hit.st });
  sh.getRange(hit.row, 8).setValue(st); sh.getRange(hit.row, 10).setValue(Date.now());
  return jsonOut_({ ok: true });
}
// ===== /ВЫВОД v1 =====
