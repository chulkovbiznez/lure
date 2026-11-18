// ===================== EYE CHAT v3 (2026-11-18) =====================
// Удаление сообщений в переписке EYE (просьба Андрея 18.11.2026): «Только у себя» и «У всех», в том числе чужие сообщения.
// «У всех»: текст строки в листе переписки c_<ID>_<ID> заменяется меткой [[del]] (строка остаётся, время и автор те же),
//   новая chat.html такие строки не показывает; голосовое — файл в бакете тоже удаляется.
// «Только у себя»: в лист hd_<мой ID> пишется строка (С кем, Время сообщения); новая chat.html эти сообщения прячет.
// В обоих случаях «последнее сообщение» в списке чатов (in_<ID>) пересчитывается.
// Действия (GET, через уже существующую строку диспетчера ec_* → eyeChat_):
//   ec_del&with=ID&at=ВРЕМЯ[&all=1]  → { ok }            all=1 — у всех, без него — только у себя
//   ec_hid&with=ID                   → { ok, hid:[время…] } что я спрятал у себя в переписке с ID
// В eyeChat_ в начало добавляется 1 строка: перед проверкой ec_seen — ec_del и ec_hid (замена в редакторе).
var EC_DEL = '[[del]]';
function ecHidSheet_(me) { return getSheet_('hd_' + me, ['Peer', 'At']); }
function ecHidSet_(me, peer) {
  var d = ecHidSheet_(me).getDataRange().getValues(), s = {};
  for (var i = 1; i < d.length; i++) if (normId_(d[i][0]) === peer) s[Number(d[i][1]) || 0] = 1;
  return s;
}
// пересчитать «последнее сообщение» в списке чатов owner для переписки с peer
function ecInboxFix_(owner, peer, rows, hid) {
  var x = inboxRow_(owner, peer);
  if (!x.row) return;
  var v = x.v.slice(), last = null;
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][2] || '') === EC_DEL || hid[Number(rows[i][0]) || 0]) continue;
    last = rows[i]; break;
  }
  if (last) {
    var t = String(last[2] || '');
    v[1] = Number(last[0]) || 0; v[2] = normId_(last[1]); v[3] = t.length > 120 ? t.slice(0, 117) + '…' : t;
  } else {
    v[3] = 'Сообщение удалено'; v[4] = Math.max(Number(v[4]) || 0, Number(v[1]) || 0);
  }
  inboxPut_(x, v);
}
function ecDel_(me, p) {
  var U = usersLite_(), peer = normId_(p['with']), at = Number(p.at) || 0, all = String(p.all || '') === '1';
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  if (!at) return jsonOut_({ ok: false, error: 'bad_at' });
  if (!inboxRow_(me, peer).row) return jsonOut_({ ok: false, error: 'not_found' });
  var sh = chatSheet_(me, peer), d = sh.getDataRange().getValues(), r = 0;
  for (var i = d.length - 1; i >= 1; i--) if ((Number(d[i][0]) || 0) === at) { r = i; break; }
  if (!r || String(d[r][2] || '') === EC_DEL) return jsonOut_({ ok: false, error: 'not_found' });
  if (all) {
    var vm = /^\[\[voice:(u\/[a-z0-9_]+\/v\/[0-9a-f]{16}\.(?:webm|ogg|m4a|mp3))\|/.exec(String(d[r][2] || ''));
    sh.getRange(r + 1, 1, 1, 3).setValues([[d[r][0], d[r][1], EC_DEL]]);
    d[r][2] = EC_DEL;
    if (vm) { try { Storage.del(vm[1]); } catch (e) {} }
    ecInboxFix_(me, peer, d, ecHidSet_(me, peer));
    ecInboxFix_(peer, me, d, ecHidSet_(peer, me));
  } else {
    var h = ecHidSet_(me, peer);
    if (!h[at]) ecHidSheet_(me).appendRow([peer, at]);
    h[at] = 1;
    ecInboxFix_(me, peer, d, h);
  }
  return jsonOut_({ ok: true, all: all });
}
function ecHid_(me, p) {
  var peer = normId_(p['with']);
  if (!peer || peer === me) return jsonOut_({ ok: false, error: 'bad_id' });
  return jsonOut_({ ok: true, hid: Object.keys(ecHidSet_(me, peer)).map(Number) });
}
// =================== end of block EYE CHAT v3 ===================
