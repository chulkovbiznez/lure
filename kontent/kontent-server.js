// ===================== KONTENT v1 (2026-11-17) =====================
// Задание 68: загрузка в Канал (kanal.html) и Обучение (obuchenie.html). Страничная часть — файл /eg-kontent.js.
// Места (place):
//   kanal, obuchenie, uroki — пишут только владельцы (11111, 23933), смотрят все (гости тоже);
//   ch-<ID> — свой канал Pro (kanal.html?u=ID): только сторис и «Актуальное», пишет только сам хозяин канала с активным Pro.
// Лист kc: Place, Kind (story | post | rolik | urok | hl), Id, Json, At, Del ('1' = удалено, строки не стираются).
// Сторис: только кружочек, снятый камерой в приложении (t=vid, circle=1), до 60 секунд (решение Андрея 17.11:
//   «чтобы это была реальная жизнь»). Живут 24 часа, потом архив: архив видит только хозяин места,
//   остальные — только сторис, положенные в «Актуальное».
// Уроки Pro: гость и FREE получают только обложку и название (без видео, фото и текста).
// Андрей 17.11 09:41: грузится ТОЛЬКО сторис. Посты, ролики и уроки — только ссылкой на VK Видео / Rutube
//   (на странице встроенный плеер с превью); загрузки фото и видео для них нет.
// Фото (обложка сторис): POST kc_img (base64 до 2,6 млн знаков) → Storage.put в бакет сайта, папка k/<место>/.
// Видео: GET kc_upurl — одноразовая подписанная ссылка (15 минут), браузер сам кладёт файл PUT прямо в бакет
//   app.eaglesteam.ru (через функцию видео не пройдёт: лимит запроса ~3,5 МБ). Подпись SigV4 считается здесь же
//   (свой SHA-256, без библиотек) статическим ключом сервисного аккаунта из переменных функции: имена переменных
//   ищутся сами, значения никуда не выводятся. Лимит размера: владелец 100 МБ, Pro 40 МБ (проверка при выдаче ссылки).
// Действия:
//   GET  kc_list&place=            → { stories, hl, posts, roliki, uroki }   (без входа; с sess — видно Pro-уроки, свой архив)
//   GET  kc_upurl&place=&mime=&size= → { put, url, mime }                   (вход; право писать в place)
//   GET  kc_diag                   → { proc, key, idn, skn, pub }           (только владелец: найден ли ключ — без значений)
//   POST type=kc_img  place, data, mime        → { url }   (обложка сторис)
//   POST type=kc_add  place, kind, json        → { item }
//   POST type=kc_del  id                       → {}
//   POST type=kc_hl   place, json {id,title,cover,items} → { hl }
//   POST type=kc_hldel id                      → {}
// В диспетчер добавлены 2 строки: GET — рядом с v_open (до проверки входа), POST — после img_put.
var KC_OWNERS = ['11111', '23933'], KC_DAY = 864e5, KC_BUCKET = 'app.eaglesteam.ru', KC_HOST = 'storage.yandexcloud.net';
var KC_IMG_MAX_B64 = 2600000, KC_VID_OWNER = 100e6, KC_VID_PRO = 40e6, KC_STORY_SEC = 60;
var KC_PRO_STORIES_DAY = 30, KC_PRO_UPLOADS_DAY = 60;
var KC_KINDS = { kanal: ['story', 'post', 'rolik'], obuchenie: ['story'], uroki: ['urok'] };
function kcSheet_() { return getSheet_('kc', ['Place', 'Kind', 'Id', 'Json', 'At', 'Del']); }
function kcOwner_(id) { return KC_OWNERS.indexOf(String(id || '')) >= 0; }
function kcPlace_(v) {
  v = String(v || '');
  if (v === 'kanal' || v === 'obuchenie' || v === 'uroki') return v;
  var m = /^ch-([0-9]{1,12})$/.exec(v);
  return m && validId_(m[1]) ? v : '';
}
function kcCan_(me, place, U) {
  if (!me || !place) return false;
  if (place === 'kanal' || place === 'obuchenie' || place === 'uroki') return kcOwner_(me);
  return place === 'ch-' + me && (kcOwner_(me) || active_(U, me));
}
function kcKindOk_(place, kind) { return (KC_KINDS[place] || ['story']).indexOf(kind) >= 0; }
function kcRate_(key, max, sec) {
  var cache = CacheService.getScriptCache(), n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), sec);
  return true;
}
function kcStr_(v, n) { return String(v == null ? '' : v).replace(/\r/g, '').slice(0, n); }
function kcMedia_(v) { v = String(v || ''); return v.indexOf(Storage.url('k/')) === 0 && /^[^\s"'<>]{1,400}$/.test(v) ? v : ''; }
function kcNum_(v, max) { v = Number(v) || 0; return v < 0 ? 0 : v > max ? max : Math.round(v); }
function kcLink_(v) { v = String(v || '').trim(); return /^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be))\/[^\s"'<>]{1,300}$/i.test(v) ? v : ''; }
function kcId_(v) { v = String(v || ''); return /^[a-z0-9]{4,40}$/.test(v) ? v : ''; }
function kcClean_(kind, x) {
  x = x && typeof x === 'object' ? x : {};
  if (kind === 'story') {
    var u = kcMedia_(x.u);
    if (!u || x.t !== 'vid' || Number(x.circle) !== 1) return null;
    return { t: 'vid', circle: 1, u: u, c: kcMedia_(x.c), d: kcNum_(x.d, KC_STORY_SEC + 1), r: 's', m: x.m ? 1 : 0, cap: kcStr_(x.cap, 120) };
  }
  if (kind === 'post') {
    var pl = kcLink_(x.link);
    return pl ? { text: kcStr_(x.text, 4000), link: pl } : null;
  }
  if (kind === 'rolik') {
    var rl = kcLink_(x.link);
    return rl ? { title: kcStr_(x.title, 120), link: rl, lenta: x.lenta ? 1 : 0 } : null;
  }
  if (kind === 'urok') {
    var ll = kcLink_(x.link), lt = kcStr_(x.title, 120);
    return ll && lt ? { title: lt, sub: kcStr_(x.sub, 120), cat: kcStr_(x.cat, 30), pro: x.pro ? 1 : 0, text: kcStr_(x.text, 6000), link: ll } : null;
  }
  return null;
}
function kcRows_() {
  var d = kcSheet_().getDataRange().getValues(), out = [];
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][5]) === '1' || !d[i][2]) continue;
    var j = null;
    try { j = JSON.parse(String(d[i][3] || '').replace(/^'/, '')); } catch (err) { continue; }
    if (!j || typeof j !== 'object') continue;
    out.push({ row: i + 1, place: String(d[i][0]), kind: String(d[i][1]), id: String(d[i][2]), at: Number(d[i][4]) || 0, j: j });
  }
  return out;
}
function kcFind_(id) { var r = kcRows_(); for (var i = 0; i < r.length; i++) if (r[i].id === id) return r[i]; return null; }

function kontent_(action, e, p) {
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }
  var U = me ? usersLite_() : {};
  if (me && (!U[me] || frozenAt_(me))) me = '';

  if (action === 'kc_list') return kcList_(p, me, U);

  if (!me) return noAuth_();

  if (action === 'kc_diag') {
    if (!kcOwner_(me)) return jsonOut_({ ok: false, error: 'owner' });
    var k = kcKey_(), pr = false;
    try { pr = typeof process !== 'undefined' && !!process.env; } catch (err) { pr = false; }
    return jsonOut_({ ok: true, proc: pr, key: !!k, idn: k ? k.idn : '', skn: k ? k.skn : '', pub: Storage.url('k/') });
  }
  if (action === 'kc_upurl') return kcUpUrl_(p, me, U);
  if (action === 'kc_img') return kcImg_(p, me, U);
  if (action === 'kc_add') return kcAdd_(p, me, U);
  if (action === 'kc_hl') return kcHl_(p, me, U);
  if (action === 'kc_del' || action === 'kc_hldel') {
    var id = kcId_(p.id), x = id ? kcFind_(id) : null;
    if (!x || (action === 'kc_hldel') !== (x.kind === 'hl')) return jsonOut_({ ok: false, error: 'not_found' });
    if (!kcCan_(me, x.place, U) && !kcOwner_(me)) return jsonOut_({ ok: false, error: 'owner' });   // Андрей может убрать и чужую сторис
    kcSheet_().getRange(x.row, 6).setValue('1');
    return jsonOut_({ ok: true });
  }
  return jsonOut_({ ok: false, error: 'unknown_action' });
}

function kcList_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!place) return jsonOut_({ ok: false, error: 'bad_place' });
  var mine = kcCan_(me, place, U), pro = !!me && (kcOwner_(me) || active_(U, me)), now = Date.now();
  var rows = kcRows_().filter(function (x) { return x.place === place; }), keep = {};
  var out = { ok: true, stories: [], hl: [], posts: [], roliki: [], uroki: [] };
  rows.forEach(function (x) {
    if (x.kind !== 'hl') return;
    var h = { id: x.id, at: x.at, title: kcStr_(x.j.title, 24), cover: kcId_(x.j.cover), items: (x.j.items || []).map(kcId_).filter(String) };
    h.items.forEach(function (i) { keep[i] = 1; });
    out.hl.push(h);
  });
  rows.forEach(function (x) {
    var it = x.j;
    it.id = x.id; it.at = x.at;
    if (x.kind === 'story') { if (mine || now - x.at < KC_DAY || keep[x.id]) out.stories.push(it); }
    else if (x.kind === 'post') out.posts.push(it);
    else if (x.kind === 'rolik') out.roliki.push(it);
    else if (x.kind === 'urok') out.uroki.push(it.pro && !pro ? { id: it.id, at: it.at, title: it.title, sub: it.sub, cat: it.cat, pro: 1, locked: 1 } : it);
  });
  return jsonOut_(out);
}

function kcUpUrl_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var mime = String(p.mime || '').split(';')[0].trim().toLowerCase();
  var ext = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }[mime];
  if (!ext) return jsonOut_({ ok: false, error: 'type' });
  var size = Math.floor(Number(p.size) || 0), max = kcOwner_(me) ? KC_VID_OWNER : KC_VID_PRO;
  if (size < 1) return jsonOut_({ ok: false, error: 'type' });
  if (size > max) return jsonOut_({ ok: false, error: 'big', max: max });
  if (!kcOwner_(me) && !kcRate_('KCU_' + me, KC_PRO_UPLOADS_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var k = kcKey_();
  if (!k) return jsonOut_({ ok: false, error: 'no_key' });
  var key = 'k/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + '.' + ext;
  return jsonOut_({ ok: true, put: kcPresign_(key, k), url: Storage.url(key), mime: mime });
}

function kcImg_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var b64 = String(p.data || ''), mime = String(p.mime || '');
  if (!/^image\/(webp|jpeg|png)$/.test(mime) || !b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (b64.length > KC_IMG_MAX_B64) return jsonOut_({ ok: false, error: 'photo_big' });
  var head = Utilities.base64Decode(b64.slice(0, 16)).map(function (x) { return (x + 256) % 256; });
  var okSig = mime === 'image/png' ? head[0] === 0x89 && head[1] === 0x50 : mime === 'image/jpeg' ? head[0] === 0xFF && head[1] === 0xD8 : head[0] === 0x52 && head[8] === 0x57;
  if (!okSig) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (!kcOwner_(me) && !kcRate_('KCU_' + me, KC_PRO_UPLOADS_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var key = 'k/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + (mime === 'image/png' ? '.png' : mime === 'image/jpeg' ? '.jpg' : '.webp');
  var r = Storage.put(key, b64, mime);
  if (!r || !r.ok) return jsonOut_({ ok: false, error: 'storage' });
  return jsonOut_({ ok: true, url: Storage.url(key) });
}

function kcAdd_(p, me, U) {
  var place = kcPlace_(p.place), kind = String(p.kind || '');
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  if (!kcKindOk_(place, kind)) return jsonOut_({ ok: false, error: 'bad_kind' });
  var x = null;
  try { x = JSON.parse(String(p.json || '')); } catch (err) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  var it = kcClean_(kind, x);
  if (!it) return jsonOut_({ ok: false, error: 'bad_item' });
  if (kind === 'story' && !kcOwner_(me) && !kcRate_('KCS_' + me, KC_PRO_STORIES_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var at = Date.now(), id = kind.charAt(0) + at.toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 4).toLowerCase();
  kcSheet_().appendRow([place, kind, id, JSON.stringify(it), at, '']);
  it.id = id; it.at = at;
  return jsonOut_({ ok: true, item: it });
}

function kcHl_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var x = null;
  try { x = JSON.parse(String(p.json || '')); } catch (err) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  x = x && typeof x === 'object' ? x : {};
  var items = (Array.isArray(x.items) ? x.items : []).map(kcId_).filter(String).slice(0, 100);
  var title = kcStr_(x.title, 24).replace(/\s+/g, ' ').trim();
  if (!title) return jsonOut_({ ok: false, error: 'empty' });
  var h = { title: title, cover: items.indexOf(kcId_(x.cover)) >= 0 ? kcId_(x.cover) : (items[0] || ''), items: items };
  var id = kcId_(x.id), at = Date.now();
  if (id) {
    var old = kcFind_(id);
    if (!old || old.kind !== 'hl' || old.place !== place) return jsonOut_({ ok: false, error: 'not_found' });
    kcSheet_().getRange(old.row, 4).setValue(JSON.stringify(h));
    at = old.at;
  } else {
    id = 'h' + at.toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 4).toLowerCase();
    kcSheet_().appendRow([place, 'hl', id, JSON.stringify(h), at, '']);
  }
  h.id = id; h.at = at;
  return jsonOut_({ ok: true, hl: h });
}

// ---- статический ключ сервисного аккаунта: ищем в переменных функции (значения не выводятся никогда) ----
function kcEnv_() { try { return (typeof process !== 'undefined' && process && process.env) || {}; } catch (err) { return {}; } }
function kcKey_() {
  var env = kcEnv_(), id = '', sk = '', idn = '', skn = '';
  ['KC_AK', 'AK', 'AWS_ACCESS_KEY_ID', 'ACCESS_KEY_ID', 'S3_ACCESS_KEY_ID', 'S3_KEY_ID', 'S3_ACCESS_KEY', 'STORAGE_KEY_ID', 'STORAGE_ACCESS_KEY', 'SA_KEY_ID', 'YC_ACCESS_KEY_ID'].forEach(function (n) {
    var v = String(env[n] || ''); if (!id && /^[A-Za-z0-9_-]{16,80}$/.test(v)) { id = v; idn = n; }
  });
  ['KC_SK', 'SK', 'AWS_SECRET_ACCESS_KEY', 'SECRET_ACCESS_KEY', 'S3_SECRET_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_SECRET', 'STORAGE_SECRET_KEY', 'STORAGE_SECRET', 'SA_SECRET_KEY', 'YC_SECRET_ACCESS_KEY'].forEach(function (n) {
    var v = String(env[n] || ''); if (!sk && /^[A-Za-z0-9_+\/=-]{24,100}$/.test(v)) { sk = v; skn = n; }
  });
  Object.keys(env).forEach(function (n) {
    var v = String(env[n] || '');
    if (!id && /KEY|ID|ACCESS/i.test(n) && !/SECRET/i.test(n) && /^YCA[A-Za-z0-9_-]{10,60}$/.test(v)) { id = v; idn = n; }
    if (!sk && /SECRET/i.test(n) && /^YC[A-Za-z0-9_+\/=-]{24,100}$/.test(v)) { sk = v; skn = n; }
  });
  return id && sk ? { id: id, sk: sk, idn: idn, skn: skn } : null;
}
// ---- подпись ссылки S3 (SigV4, query string, как у LURE media-saver), свой SHA-256 без библиотек ----
function kcU8_(s) { s = unescape(encodeURIComponent(s)); var a = []; for (var i = 0; i < s.length; i++) a.push(s.charCodeAt(i)); return a; }
function kcHex_(a) { var h = ''; for (var i = 0; i < a.length; i++) h += (a[i] < 16 ? '0' : '') + a[i].toString(16); return h; }
var KC_K256 = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
function kcSha_(m) {
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], l = m.length, b = m.slice(), w = [], i, j;
  b.push(0x80); while (b.length % 64 !== 56) b.push(0);
  var bits = l * 8; for (i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (bits >>> (i * 8)) & 255);
  var r = function (x, n) { return (x >>> n) | (x << (32 - n)); };
  for (i = 0; i < b.length; i += 64) {
    for (j = 0; j < 64; j++) {
      if (j < 16) w[j] = (b[i + j * 4] << 24) | (b[i + j * 4 + 1] << 16) | (b[i + j * 4 + 2] << 8) | b[i + j * 4 + 3];
      else { var s0 = r(w[j - 15], 7) ^ r(w[j - 15], 18) ^ (w[j - 15] >>> 3), s1 = r(w[j - 2], 17) ^ r(w[j - 2], 19) ^ (w[j - 2] >>> 10); w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0; }
    }
    var a = H[0], c1 = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (j = 0; j < 64; j++) {
      var t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + KC_K256[j] + w[j]) | 0;
      var t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & c1) ^ (a & c) ^ (c1 & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = c1; c1 = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + c1) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  var out = []; for (i = 0; i < 8; i++) out.push((H[i] >>> 24) & 255, (H[i] >>> 16) & 255, (H[i] >>> 8) & 255, H[i] & 255);
  return out;
}
function kcHmac_(k, m) {
  if (k.length > 64) k = kcSha_(k);
  var ik = [], ok = [], i;
  for (i = 0; i < 64; i++) { var x = k[i] || 0; ik.push(x ^ 0x36); ok.push(x ^ 0x5c); }
  return kcSha_(ok.concat(kcSha_(ik.concat(m))));
}
function kcPresign_(key, k, now) {
  var d = (now || new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), day = d.slice(0, 8), scope = day + '/ru-central1/s3/aws4_request';
  var enc = function (x) { return encodeURIComponent(x).replace(/[!'()*]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); }); };
  var q = 'X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + enc(k.id + '/' + scope) + '&X-Amz-Date=' + d + '&X-Amz-Expires=900&X-Amz-SignedHeaders=host';
  var path = ('/' + KC_BUCKET + '/' + key).split('/').map(enc).join('/');
  var creq = ['PUT', path, q, 'host:' + KC_HOST + '\n', 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  var sts = ['AWS4-HMAC-SHA256', d, scope, kcHex_(kcSha_(kcU8_(creq)))].join('\n');
  var sig = kcHmac_(kcHmac_(kcHmac_(kcHmac_(kcHmac_(kcU8_('AWS4' + k.sk), kcU8_(day)), kcU8_('ru-central1')), kcU8_('s3')), kcU8_('aws4_request')), kcU8_(sts));
  return 'https://' + KC_HOST + path + '?' + q + '&X-Amz-Signature=' + kcHex_(sig);
}
// =================== end of block KONTENT v1 ===================
