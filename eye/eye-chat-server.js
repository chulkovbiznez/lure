// ===================== EYE CHAT v2 (2026-11-17) =====================
// Переписка EYE: галочки «доставлено / прочитано» и голосовые сообщения до 1 минуты (просьба Андрея 17.11.2026).
// Галочки: сервер уже хранит у каждого человека в in_<ID> столбец ReadAt — до какого времени он прочитал переписку.
//   Своё сообщение прочитано, если его время <= ReadAt собеседника. Ничего нового в базу не пишется.
// Голосовые: телефон записывает звук (webm/opus, на iPhone mp4/aac), присылает сюда base64, сервер кладёт файл
//   в бакет сайта в папку u/<ID>/v/ и пишет в переписку обычное сообщение-метку [[voice:<ключ файла>|<секунды>]].
//   Старые страницы покажут метку текстом, новая chat.html — плеер.
// Действия:
//   GET  ec_seen&with=ID        → { ok, seen }            до какого времени ID прочитал мою переписку с ним
//   GET  ec_seenlist            → { ok, seen:{ID:время} } то же для чатов, где последнее сообщение моё (до 40)
//   POST type=ec_voice  with, data (base64), mime, sec [, dry=1]  → { ok, at, key }
//        dry=1 — только проверка хранилища: файл кладётся и сразу удаляется, в переписку ничего не пишется.
// В диспетчер добавлены 2 строки: GET — после friends_ (ec_*), POST — после img_put (ec_voice).
var EC_VOICE_MAX_B64 = 1000000, EC_VOICE_SEC = 60, EC_VOICE_PER_DAY = 200;
function eyeChat_(action, me, p) {
  if (action === 'ec_seen') {
    var peer = normId_(p['with']);
    if (!peer || peer === me) return jsonOut_({ ok: false, error: 'bad_id' });
    return jsonOut_({ ok: true, seen: Number(inboxRow_(peer, me).v[4]) || 0 });
  }
  if (action === 'ec_seenlist') {
    var d = inboxSheet_(me).getDataRange().getValues(), rows = [], out = {};
    for (var i = 1; i < d.length; i++) {
      var pr = normId_(d[i][0]);
      if (!pr || String(d[i][0]) === '#ann' || normId_(d[i][2]) !== me) continue;
      rows.push({ id: pr, at: Number(d[i][1]) || 0 });
    }
    rows.sort(function (a, b) { return b.at - a.at; });
    rows.slice(0, 40).forEach(function (x) { out[x.id] = Number(inboxRow_(x.id, me).v[4]) || 0; });
    return jsonOut_({ ok: true, seen: out });
  }
  return jsonOut_({ ok: false, error: 'unknown_action' });
}
function ecVoice_(me, p) {
  var U = usersLite_(), peer = normId_(p['with']), dry = String(p.dry || '') === '1';
  var b64 = String(p.data || '').replace(/\s/g, ''), mime = String(p.mime || '').split(';')[0].trim().toLowerCase();
  var sec = Math.round(Number(p.sec) || 0);
  if (!dry && (!peer || peer === me || !U[peer])) return jsonOut_({ ok: false, error: 'bad_id' });
  if (!/^audio\/(webm|ogg|mp4|aac|mpeg)$/.test(mime) || !b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_audio' });
  if (b64.length > EC_VOICE_MAX_B64) return jsonOut_({ ok: false, error: 'audio_big' });
  if (sec < 1 || sec > EC_VOICE_SEC + 2) return jsonOut_({ ok: false, error: 'bad_len' });
  var h = Utilities.base64Decode(b64.slice(0, 16)).map(function (x) { return (x + 256) % 256; });
  var sig = (h[0] === 0x1A && h[1] === 0x45 && h[2] === 0xDF && h[3] === 0xA3) ? 'webm'
    : (h[0] === 0x4F && h[1] === 0x67 && h[2] === 0x67 && h[3] === 0x53) ? 'ogg'
    : (h[4] === 0x66 && h[5] === 0x74 && h[6] === 0x79 && h[7] === 0x70) ? 'm4a'
    : ((h[0] === 0x49 && h[1] === 0x44 && h[2] === 0x33) || (h[0] === 0xFF && (h[1] & 0xE0) === 0xE0)) ? 'mp3' : '';
  if (!sig) return jsonOut_({ ok: false, error: 'bad_audio' });
  var put = { webm: 'audio/webm', ogg: 'audio/ogg', m4a: 'audio/mp4', mp3: 'audio/mpeg' }[sig];
  if (!dry) {
    if (!(active_(U, me) || me === OWNER_ID)) return jsonOut_({ ok: false, error: 'need_pro' });
    if (String(inboxRow_(peer, me).v[5]) === '1') return jsonOut_({ ok: false, error: 'blocked' });
    var cache = CacheService.getScriptCache(), ck = 'ECV_' + me + '_' + new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
    var used = Number(cache.get(ck) || 0);
    if (me !== OWNER_ID && used >= EC_VOICE_PER_DAY) return jsonOut_({ ok: false, error: 'limit' });
    cache.put(ck, String(used + 1), 21600);
  }
  var key = 'u/' + me + '/v/' + Utilities.getUuid().replace(/-/g, '').slice(0, 16) + '.' + sig;
  var r = Storage.put(key, b64, put);
  if (!r || !r.ok) return jsonOut_({ ok: false, error: 'storage' });
  if (dry) { Storage.del(key); return jsonOut_({ ok: true, dry: true, key: key, type: put }); }
  // дальше обычная отправка: те же правила (кому можно писать, лимит новых переписок), что у текста
  var res = chatSend_(me, { 'with': peer, text: '[[voice:' + key + '|' + Math.min(sec, EC_VOICE_SEC) + ']]' });
  return res;
}
// =================== end of block EYE CHAT v2 ===================
