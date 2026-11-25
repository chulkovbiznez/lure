# Задание 123 (25.11.2026): уведомление о звонке EYE («📞 Имя звонит» / «📵 Пропущенный звонок»).
# Меняет только server.js: одна строка диспетчера + ветка eye_ring в friends_. Запуск: python3 p123.py server.js
import sys
p = sys.argv[1]; s = open(p, encoding='utf8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, ('anchor', a[:60], s.count(a)); s = s.replace(a, b)
rep("if (action === 'eye_check' || String(action || '').indexOf('fr_') === 0) return friends_(action, me, p);",
    "if (action === 'eye_check' || action === 'eye_ring' || String(action || '').indexOf('fr_') === 0) return friends_(action, me, p);")
rep("""  if (action === 'eye_check') {
    var fr = frRow_(me, peer).st === 'yes',""",
"""  // eye_ring&with=ID&kind=ring|missed&video=1|0 — зовёт сервер звонков EYE (v3.5): уведомление другу на телефон.
  // Только взаимным друзьям без блокировки; одно уведомление каждого вида на пару не чаще раза в 12 с.
  if (action === 'eye_ring') {
    if (frRow_(me, peer).st !== 'yes' || U[peer].frozen || frBlock_(me, peer)) return jsonOut_({ ok: false, error: 'not_allowed' });
    var kind = String(p.kind) === 'missed' ? 'missed' : 'ring', rc = CacheService.getScriptCache(), rk = 'RING_' + kind + '_' + me + '_' + peer;
    if (rc.get(rk)) return jsonOut_({ ok: true, skipped: true });
    rc.put(rk, '1', 12);
    var rn = (U[me] && U[me].name) || ('ID ' + me);
    if (kind === 'missed') push_(peer, '📵 Пропущенный звонок', rn + ' звонил(а) тебе в EYE', '/chat.html?to=' + me, 'call-' + me);
    else push_(peer, '📞 ' + rn + ' звонит', (String(p.video) === '0' ? 'Аудиозвонок' : 'Видеозвонок') + ' EYE. Нажми, чтобы ответить', '/chat.html?to=' + me, 'call-' + me);
    return jsonOut_({ ok: true });
  }
  if (action === 'eye_check') {
    var fr = frRow_(me, peer).st === 'yes',""")
open(p, 'w', encoding='utf8').write(s); print('PATCH123 OK')
