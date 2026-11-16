// ===================== EYE FRIENDS v1 (2026-11-16) =====================
// Друзья EAGLES для видеозвонков EYE. Правило Андрея 16.11.2026: звонить можно ТОЛЬКО взаимным друзьям,
// независимо от своей структуры и перелива. Дружба = запрос + подтверждение второго человека.
// У каждого человека свой лист fr_<ID>: Peer (с кем), State, At (когда).
// State: out — я отправил запрос, in — мне прислали запрос, yes — друзья, пусто — ничего.
// Действия (GET, нужен sess):
//   fr_list                 → { friends:[], incoming:[], outgoing:[] }  (каждый: id, name, av, pro, at)
//   fr_add&with=ID          → отправить запрос; если он уже звал меня — сразу друзья. { state: 'out'|'yes' }
//   fr_del&with=ID          → отменить запрос / отклонить / убрать из друзей (у обоих). { state: '' }
//   fr_state&with=ID        → { state, peer }
//   eye_check&with=ID       → для сервера звонков EYE: { can, why, friend, peer }
// Блок вставляется в самый конец server.js; в диспетчер добавлена одна строка после chat_open.
var FR_NEW_PER_DAY = 20, FR_MAX = 500, EYE_NEED_PRO = false;
function frSheet_(id) { return getSheet_('fr_' + id, ['Peer', 'State', 'At']); }
function frRow_(id, peer) {
  var sh = frSheet_(id), d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) if (normId_(d[i][0]) === peer) return { sh: sh, row: i + 1, st: String(d[i][1] || ''), at: Number(d[i][2]) || 0 };
  return { sh: sh, row: 0, st: '', at: 0 };
}
function frPut_(x, peer, st, at) {
  if (x.row) x.sh.getRange(x.row, 1, 1, 3).setValues([[peer, st, at]]);
  else if (st) x.sh.appendRow([peer, st, at]);
}
function frPeer_(U, id) {
  return { id: id, name: U[id] ? U[id].name : id, av: U[id] ? U[id].av : '', pro: active_(U, id) };
}
// заблокировал ли кто-то из двоих другого в «Сообщениях»
function frBlock_(me, peer) {
  return String(inboxRow_(me, peer).v[5]) === '1' || String(inboxRow_(peer, me).v[5]) === '1';
}
function frList_(me, U) {
  var d = frSheet_(me).getDataRange().getValues(), out = { friends: [], incoming: [], outgoing: [] };
  for (var i = 1; i < d.length; i++) {
    var id = normId_(d[i][0]), st = String(d[i][1] || '');
    if (!id || !U[id] || U[id].frozen) continue;
    var x = frPeer_(U, id); x.at = Number(d[i][2]) || 0;
    if (st === 'yes') out.friends.push(x); else if (st === 'in') out.incoming.push(x); else if (st === 'out') out.outgoing.push(x);
  }
  out.friends.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  out.incoming.sort(function (a, b) { return b.at - a.at; });
  out.outgoing.sort(function (a, b) { return b.at - a.at; });
  return jsonOut_({ ok: true, friends: out.friends, incoming: out.incoming, outgoing: out.outgoing });
}
function friends_(action, me, p) {
  var U = usersLite_();
  if (action === 'fr_list') return frList_(me, U);
  var peer = normId_(p['with']);
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  if (action === 'fr_state') return jsonOut_({ ok: true, state: frRow_(me, peer).st, peer: frPeer_(U, peer) });
  if (action === 'eye_check') {
    var fr = frRow_(me, peer).st === 'yes', pro = active_(U, me) || me === OWNER_ID;
    var why = !fr ? 'not_friends' : (U[peer].frozen || frBlock_(me, peer)) ? 'blocked' : (EYE_NEED_PRO && !pro) ? 'need_pro' : '';
    return jsonOut_({ ok: true, can: !why, why: why, friend: fr, peer: frPeer_(U, peer) });
  }
  if (action !== 'fr_add' && action !== 'fr_del') return jsonOut_({ ok: false, error: 'unknown_action' });
  frSheet_(me); frSheet_(peer);                // листы создаются ДО замка (getSheet_ сам берёт замок)
  var blocked = U[peer].frozen || frBlock_(me, peer);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var now = Date.now(), mine = frRow_(me, peer), theirs = frRow_(peer, me);
    if (action === 'fr_del') {
      frPut_(mine, peer, '', now);
      if (theirs.st) frPut_(theirs, me, '', now);
      return jsonOut_({ ok: true, state: '' });
    }
    if (mine.st === 'yes' || mine.st === 'out') return jsonOut_({ ok: true, state: mine.st });
    if (blocked) return jsonOut_({ ok: false, error: 'blocked' });
    if (mine.st === 'in') {
      frPut_(mine, peer, 'yes', now); frPut_(theirs, me, 'yes', now);
      return jsonOut_({ ok: true, state: 'yes' });
    }
    if (me !== OWNER_ID) {
      var cache = CacheService.getScriptCache(), ck = 'FRN_' + me + '_' + new Date(now + 3 * 3600000).toISOString().slice(0, 10);
      var used = Number(cache.get(ck) || 0);
      if (used >= FR_NEW_PER_DAY) return jsonOut_({ ok: false, error: 'limit' });
      cache.put(ck, String(used + 1), 21600);
      if (frSheet_(me).getDataRange().getValues().length > FR_MAX) return jsonOut_({ ok: false, error: 'too_many' });
    }
    frPut_(mine, peer, 'out', now); frPut_(theirs, me, 'in', now);
    return jsonOut_({ ok: true, state: 'out' });
  } finally {
    lock.releaseLock();
  }
}
// =================== end of block EYE FRIENDS v1 ===================
