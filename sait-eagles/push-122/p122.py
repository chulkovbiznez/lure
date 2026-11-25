# Задание 122 (25.11.2026): уведомления на телефон (Web Push). Правит index.js и server.js функции eagles-server.
# Запуск: python3 p122.py pkg/index.js pkg/server.js webpush.js   (каждая замена проверяется: якорь ровно 1 раз)
import sys
ix, sv, wp = sys.argv[1], sys.argv[2], sys.argv[3]
def rep(s, old, new, name):
    n = s.count(old)
    if n != 1: sys.exit('STOP: якорь "%s" найден %d раз' % (name, n))
    return s.replace(old, new)
I = open(ix, encoding='utf8').read()
if 'pushWork' in I: sys.exit('STOP: index.js уже с уведомлениями')
I = rep(I, "// Оповещения Андрею в MAX (бот «EAGLES Сторож»)", open(wp, encoding='utf8').read() + "\n// Оповещения Андрею в MAX (бот «EAGLES Сторож»)", 'max')
I = rep(I, "    Notify: { send(t) { if (R.notes && R.notes.length < 5) R.notes.push(String(t || '').slice(0, 1500)); } },\n",
  "    Notify: { send(t) { if (R.notes && R.notes.length < 5) R.notes.push(String(t || '').slice(0, 1500)); } },\n"
  "    // уведомления на телефон (задание 122): копим здесь, отправляем после записи в базу (см. pushWork)\n"
  "    Push: { key() { return ENV.VAPID_PUBLIC || ''; },\n"
  "      send(to, t, b, u, g) { if (R.pushes && R.pushes.length < 10 && to) R.pushes.push({ to: String(to), title: String(t || '').slice(0, 80), body: String(b || '').slice(0, 180), url: String(u || '/').slice(0, 200), tag: String(g || '').slice(0, 40) }); },\n"
  "      save(id, s) { if (R.pushSave && R.pushSave.length < 2) R.pushSave.push({ id: String(id), sub: s }); },\n"
  "      off(id, ep) { if (R.pushOff && R.pushOff.length < 2) R.pushOff.push({ id: String(id), endpoint: String(ep) }); } },\n", 'notify')
I = rep(I, "cacheChanged: {}, notes: [] };", "cacheChanged: {}, notes: [], pushes: [], pushSave: [], pushOff: [] };", 'R')
I = rep(I, "  if (R.notes && R.notes.length) await sendNotes(R.notes);\n",
  "  if (R.notes && R.notes.length) await sendNotes(R.notes);\n"
  "  if (R.pushes.length || R.pushSave.length || R.pushOff.length) { try { await pushWork(R); } catch (eP) { console.error('push ' + (eP && eP.message)); } }\n", 'send')
open(ix, 'w', encoding='utf8').write(I)

S = open(sv, encoding='utf8').read()
if 'pushApi_' in S: sys.exit('STOP: server.js уже с уведомлениями')
S = rep(S, "  if (action === 'chat_block') return chatBlock_(me, p);\n",
  "  if (action === 'chat_block') return chatBlock_(me, p);\n"
  "  if (action === 'push_key' || action === 'push_sub' || action === 'push_off') return pushApi_(action, me, p);\n", 'disp')
S = rep(S, "  inboxPut_(theirs, [me, now, me, short, Number(theirs.v[4]) || 0, String(theirs.v[5] || '')]);\n",
  "  inboxPut_(theirs, [me, now, me, short, Number(theirs.v[4]) || 0, String(theirs.v[5] || '')]);\n"
  "  push_(peer, (U[me] && U[me].name) || ('ID ' + me), /^\\[\\[voice:/.test(text) ? '🎤 Голосовое сообщение' : short, '/chat.html?to=' + me, 'chat-' + me);\n", 'chat')
S = rep(S, "      frPut_(mine, peer, 'yes', now); frPut_(theirs, me, 'yes', now);\n",
  "      frPut_(mine, peer, 'yes', now); frPut_(theirs, me, 'yes', now);\n"
  "      push_(peer, 'EYE · друзья', ((U[me] && U[me].name) || ('ID ' + me)) + ' принял(а) твою заявку в друзья', '/chat.html', 'fr-' + me);\n", 'fryes')
S = rep(S, "    frPut_(mine, peer, 'out', now); frPut_(theirs, me, 'in', now);\n",
  "    frPut_(mine, peer, 'out', now); frPut_(theirs, me, 'in', now);\n"
  "    push_(peer, 'EYE · заявка в друзья', ((U[me] && U[me].name) || ('ID ' + me)) + ' хочет дружить с тобой', '/chat.html', 'fr-' + me);\n", 'frout')
S = rep(S, "    notify_('🦅 Новый партнёр: ID ' + rId",
  "    if (rRef) push_(rRef, '🦅 Новый партнёр в команде', String(pd[row][1] || '').slice(0, 40) + ' (ID ' + rId + ') зарегистрировался по твоей ссылке', '/binar.html', 'reg-' + rId);\n"
  "    notify_('🦅 Новый партнёр: ID ' + rId", 'reg')
S += r"""

// ===================== PUSH v1 (2026-11-25, задание 122) =====================
// Уведомления на телефон: новое сообщение EYE, заявка в друзья, новый партнёр по ссылке.
// Подписки телефонов хранит index.js в разделе базы push_<ID> (до 5 последних). Отправка — после ответа базы (pushWork).
//   push_key            → { key }        открытый ключ VAPID для подписки
//   push_sub&sub=JSON   → { ok }         сохранить подписку этого телефона (endpoint + keys.p256dh + keys.auth)
//   push_off&sub=JSON   → { ok }         убрать подписку
function push_(to, title, body, url, tag) { try { if (typeof Push !== 'undefined' && to) Push.send(String(to), title, body, url, tag); } catch (eP) {} }
function pushApi_(action, me, p) {
  if (typeof Push === 'undefined') return jsonOut_({ ok: false, error: 'no_push' });
  if (action === 'push_key') return jsonOut_({ ok: true, key: Push.key() });
  var s; try { s = JSON.parse(String(p.sub || '')); } catch (e) { return jsonOut_({ ok: false, error: 'bad_sub' }); }
  var ep = String((s && s.endpoint) || '');
  if (!/^https:\/\/\S{10,700}$/.test(ep)) return jsonOut_({ ok: false, error: 'bad_sub' });
  if (action === 'push_off') { Push.off(me, ep); return jsonOut_({ ok: true }); }
  var k = (s && s.keys) || {}, p256 = String(k.p256dh || ''), au = String(k.auth || '');
  if (!/^[A-Za-z0-9_-]{80,100}$/.test(p256) || !/^[A-Za-z0-9_-]{16,32}$/.test(au)) return jsonOut_({ ok: false, error: 'bad_sub' });
  Push.save(me, { endpoint: ep, p256dh: p256, auth: au, at: Date.now() });
  return jsonOut_({ ok: true });
}
// =================== end of block PUSH v1 ===================
"""
open(sv, 'w', encoding='utf8').write(S)
print('PATCH OK')
