// ===================== KONTENT v2 (2026-11-17) =====================
// Задание 68: загрузка в Канал (kanal.html) и Обучение (obuchenie.html). Страничная часть — файл /eg-kontent.js.
// Места (place):
//   kanal, obuchenie, uroki — пишут только владельцы (11111, 23933), смотрят все (гости тоже);
//   ch-<ID> — свой канал Pro (kanal.html?u=ID): сторис и папки, пишет только сам хозяин канала с активным Pro.
// Лист kc: Place, Kind (story | post | rolik | urok | folder), Id, Json, At, Del ('1' = удалено, строки не стираются).
// Сторис: только кружочек, снятый камерой в приложении (t=vid, circle=1), до 60 секунд, 480p.
//   Живут 24 часа и потом не видны НИКОМУ (архива и «Актуального» нет — решение Андрея 17.11 11:02).
//   Файлы сторис лежат в папке бакета k/s/ — правило бакета само стирает их через 2 дня.
// «Актуальное» (kind folder) = карта темы («Похудение») с островками-роликами со стены (Андрей 17.11 11:18):
//   { title, cover: обложка кружка (с телефона, k/p/), items: [{ l: ссылка, t: название, th: превью, p: id поста на стене }] }.
//   Превью — с Rutube / VK / Яндекс Диска или своё (k/p/).
// Посты, ролики и уроки — только ссылкой на VK Видео / Rutube / Яндекс Диск (+ своё превью th, не обязательно).
// Уроки Pro: гость и FREE получают только обложку и название (без видео и текста).
// Фото (обложка сторис k/s/, своё превью k/p/): POST kc_img (base64 до 2,6 млн знаков) → Storage.put в бакет сайта.
// Видео сторис: GET kc_upurl — одноразовая подписанная ссылка (15 минут), браузер сам кладёт файл PUT прямо в бакет
//   app.eaglesteam.ru (через функцию видео не пройдёт: лимит запроса ~3,5 МБ). Подпись SigV4 считается здесь же
//   (свой SHA-256, без библиотек) статическим ключом сервисного аккаунта из переменных функции: имена переменных
//   ищутся сами, значения никуда не выводятся. Лимит размера: владелец 100 МБ, Pro 40 МБ (проверка при выдаче ссылки).
// Действия:
//   GET  kc_list&place=            → { stories, folders, posts, roliki, uroki }  (без входа; с sess — видно Pro-уроки)
//   GET  kc_upurl&place=&mime=&size= → { put, url, mime }                   (вход; право писать в place)
//   GET  kc_meta&u=                → { img, title, d, kind }                 (вход, Pro; превью и название ролика по ссылке)
//   GET  kc_diag                   → { proc, key, idn, skn, pub }           (только владелец: найден ли ключ — без значений)
//   POST type=kc_img  place, data, mime, use(s|p) → { url }   (s — обложка сторис, p — своё превью)
//   POST type=kc_add  place, kind, json        → { item }
//   POST type=kc_del  id                       → {}
//   POST type=kc_fold place, json {id,title,items} → { folder }
//   POST type=kc_folddel id                    → {}
// В диспетчер добавлены 2 строки: GET — рядом с v_open (до проверки входа), POST — после img_put.
var KC_OWNERS = ['11111', '23933'], KC_DAY = 864e5, KC_BUCKET = 'app.eaglesteam.ru', KC_HOST = 'storage.yandexcloud.net';
var KC_IMG_MAX_B64 = 2600000, KC_VID_OWNER = 100e6, KC_VID_PRO = 40e6, KC_STORY_SEC = 60;
var KC_PRO_STORIES_DAY = 30, KC_PRO_UPLOADS_DAY = 60, KC_META_DAY = 100, KC_FOLDERS = 30, KC_FOLDER_ITEMS = 40;
var KC_KINDS = { kanal: ['story', 'post', 'rolik', 'folder'], obuchenie: ['story'], uroki: ['urok'] };
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
function kcKindOk_(place, kind) { return (KC_KINDS[place] || ['story', 'folder']).indexOf(kind) >= 0; }
function kcRate_(key, max, sec) {
  var cache = CacheService.getScriptCache(), n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), sec);
  return true;
}
function kcStr_(v, n) { return String(v == null ? '' : v).replace(/\r/g, '').slice(0, n); }
function kcMedia_(v) { v = String(v || ''); return v.indexOf(Storage.url('k/')) === 0 && /^[^\s"'<>]{1,400}$/.test(v) ? v : ''; }
// превью: своё (из бакета) или картинка Rutube / VK / Яндекса / YouTube
function kcThumb_(v) {
  v = String(v || '').trim();
  if (kcMedia_(v)) return v;
  return /^https:\/\/([a-z0-9-]+\.)*(rutube\.ru|rutubelist\.ru|userapi\.com|vkuserphoto\.ru|vk\.com|vkvideo\.ru|yandex\.net|yandex\.ru|ytimg\.com)\/[^\s"'<>\\]{1,700}$/i.test(v) ? v : '';
}
function kcNum_(v, max) { v = Number(v) || 0; return v < 0 ? 0 : v > max ? max : Math.round(v); }
var KC_LINK_RE = /^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be)|disk\.yandex\.(ru|com|kz|by)|yadi\.sk|disk\.360\.yandex\.ru)\/[^\s"'<>]{1,300}$/i;
function kcLink_(v) { v = String(v || '').trim(); return KC_LINK_RE.test(v) ? v : ''; }
function kcId_(v) { v = String(v || ''); return /^[a-z0-9]{4,40}$/.test(v) ? v : ''; }
function kcClean_(kind, x) {
  x = x && typeof x === 'object' ? x : {};
  if (kind === 'story') {
    var u = kcMedia_(x.u);
    if (!u || x.t !== 'vid' || Number(x.circle) !== 1 || u.indexOf(Storage.url('k/s/')) !== 0) return null;
    return { t: 'vid', circle: 1, u: u, c: kcMedia_(x.c), d: kcNum_(x.d, KC_STORY_SEC + 1), r: 's', m: x.m ? 1 : 0, cap: kcStr_(x.cap, 120) };
  }
  if (kind === 'post') {
    var pl = kcLink_(x.link);
    return pl ? { text: kcStr_(x.text, 4000), link: pl, th: kcThumb_(x.th) } : null;
  }
  if (kind === 'rolik') {
    var rl = kcLink_(x.link);
    return rl ? { title: kcStr_(x.title, 120), link: rl, lenta: x.lenta ? 1 : 0, th: kcThumb_(x.th) } : null;
  }
  if (kind === 'urok') {
    var ll = kcLink_(x.link), lt = kcStr_(x.title, 120);
    return ll && lt ? { title: lt, sub: kcStr_(x.sub, 120), cat: kcStr_(x.cat, 30), pro: x.pro ? 1 : 0, text: kcStr_(x.text, 6000), link: ll, th: kcThumb_(x.th) } : null;
  }
  return null;
}
function kcFoldClean_(x) {
  x = x && typeof x === 'object' ? x : {};
  var title = kcStr_(x.title, 24).replace(/\s+/g, ' ').trim(), seen = {};
  var items = (Array.isArray(x.items) ? x.items : []).map(function (i) {
    i = i && typeof i === 'object' ? i : {};
    var l = kcLink_(i.l);
    var pid = String(i.p || '');
    return l ? { l: l, t: kcStr_(i.t, 80).replace(/\s+/g, ' ').trim(), th: kcThumb_(i.th), p: /^[A-Za-z0-9_-]{1,48}$/.test(pid) ? pid : '' } : null;
  }).filter(function (i) { if (!i || seen[i.l]) return false; seen[i.l] = 1; return true; }).slice(0, KC_FOLDER_ITEMS);
  return title ? { title: title, cover: kcThumb_(x.cover), items: items } : null;
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
  if (action === 'kc_meta') return kcMeta_(p, me, U);
  if (action === 'kc_img') return kcImg_(p, me, U);
  if (action === 'kc_add') return kcAdd_(p, me, U);
  if (action === 'kc_fold') return kcFold_(p, me, U);
  if (action === 'kc_del' || action === 'kc_folddel') {
    var id = kcId_(p.id), x = id ? kcFind_(id) : null;
    if (!x || (action === 'kc_folddel') !== (x.kind === 'folder')) return jsonOut_({ ok: false, error: 'not_found' });
    if (!kcCan_(me, x.place, U) && !kcOwner_(me)) return jsonOut_({ ok: false, error: 'owner' });   // Андрей может убрать и чужое (модерация)
    kcSheet_().getRange(x.row, 6).setValue('1');
    return jsonOut_({ ok: true });
  }
  return jsonOut_({ ok: false, error: 'unknown_action' });
}

function kcList_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!place) return jsonOut_({ ok: false, error: 'bad_place' });
  var pro = !!me && (kcOwner_(me) || active_(U, me)), now = Date.now();
  var out = { ok: true, stories: [], folders: [], posts: [], roliki: [], uroki: [] };
  kcRows_().forEach(function (x) {
    if (x.place !== place) return;
    var it = x.j;
    it.id = x.id; it.at = x.at;
    if (x.kind === 'story') { if (now - x.at < KC_DAY) out.stories.push(it); }
    else if (x.kind === 'folder') out.folders.push({ id: x.id, at: x.at, title: kcStr_(it.title, 24), cover: it.cover || '', items: Array.isArray(it.items) ? it.items : [] });
    else if (x.kind === 'post') out.posts.push(it);
    else if (x.kind === 'rolik') out.roliki.push(it);
    else if (x.kind === 'urok') out.uroki.push(it.pro && !pro ? { id: it.id, at: it.at, title: it.title, sub: it.sub, cat: it.cat, th: it.th || '', pro: 1, locked: 1 } : it);
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
  var key = 'k/s/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + '.' + ext;
  return jsonOut_({ ok: true, put: kcPresign_(key, k), url: Storage.url(key), mime: mime });
}

function kcImg_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var b64 = String(p.data || ''), mime = String(p.mime || ''), use = p.use === 'p' ? 'p' : 's';
  if (!/^image\/(webp|jpeg|png)$/.test(mime) || !b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (b64.length > KC_IMG_MAX_B64) return jsonOut_({ ok: false, error: 'photo_big' });
  var head = Utilities.base64Decode(b64.slice(0, 16)).map(function (x) { return (x + 256) % 256; });
  var okSig = mime === 'image/png' ? head[0] === 0x89 && head[1] === 0x50 : mime === 'image/jpeg' ? head[0] === 0xFF && head[1] === 0xD8 : head[0] === 0x52 && head[8] === 0x57;
  if (!okSig) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (!kcOwner_(me) && !kcRate_('KCU_' + me, KC_PRO_UPLOADS_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var key = 'k/' + use + '/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + (mime === 'image/png' ? '.png' : mime === 'image/jpeg' ? '.jpg' : '.webp');
  var r = Storage.put(key, b64, mime);
  if (!r || !r.ok) return jsonOut_({ ok: false, error: 'storage' });
  return jsonOut_({ ok: true, url: Storage.url(key) });
}

function kcAdd_(p, me, U) {
  var place = kcPlace_(p.place), kind = String(p.kind || '');
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  if (kind === 'folder' || !kcKindOk_(place, kind)) return jsonOut_({ ok: false, error: 'bad_kind' });
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

function kcFold_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  if (!kcKindOk_(place, 'folder')) return jsonOut_({ ok: false, error: 'bad_kind' });
  var x = null;
  try { x = JSON.parse(String(p.json || '')); } catch (err) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  var f = kcFoldClean_(x);
  if (!f) return jsonOut_({ ok: false, error: 'empty' });
  var id = kcId_(x && x.id), at = Date.now();
  if (id) {
    var old = kcFind_(id);
    if (!old || old.kind !== 'folder' || old.place !== place) return jsonOut_({ ok: false, error: 'not_found' });
    kcSheet_().getRange(old.row, 4).setValue(JSON.stringify(f));
    at = old.at;
  } else {
    var n = kcRows_().filter(function (r) { return r.place === place && r.kind === 'folder'; }).length;
    if (n >= KC_FOLDERS) return jsonOut_({ ok: false, error: 'limit' });
    id = 'f' + at.toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 4).toLowerCase();
    kcSheet_().appendRow([place, 'folder', id, JSON.stringify(f), at, '']);
  }
  f.id = id; f.at = at;
  return jsonOut_({ ok: true, folder: f });
}

// ---- превью и название ролика по ссылке (Rutube API, Яндекс Диск API, страница VK Видео) ----
function kcJson_(t) { try { return JSON.parse(t); } catch (err) { return {}; } }
function kcMeta_(p, me, U) {
  if (!kcOwner_(me) && !active_(U, me)) return jsonOut_({ ok: false, error: 'owner' });
  var u = kcLink_(p.u);
  if (!u) return jsonOut_({ ok: false, error: 'bad_link' });
  var cache = CacheService.getScriptCache(), key = 'KCM_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, u)).slice(0, 22);
  var hit = cache.get(key);
  if (hit) return jsonOut_(kcJson_(hit));
  if (!kcOwner_(me) && !kcRate_('KCMN_' + me, KC_META_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var out = { ok: true, img: '', title: '', d: 0, kind: '' }, m, r;
  try {
    if ((m = /rutube\.ru\/(?:video|shorts|play\/embed)\/(?:private\/)?([0-9a-f]{32})/i.exec(u))) {
      out.kind = 'rutube';
      r = UrlFetchApp.fetch('https://rutube.ru/api/video/' + m[1].toLowerCase() + '/?format=json', { muteHttpExceptions: true });
      if (r.getResponseCode() === 200) { var rj = kcJson_(r.getContentText()); out.img = String(rj.thumbnail_url || ''); out.title = String(rj.title || ''); out.d = Math.round(Number(rj.duration) || 0); }
    } else if (/^https:\/\/(disk\.yandex\.|yadi\.sk|disk\.360\.yandex\.ru)/i.test(u)) {
      out.kind = 'yadisk';
      r = UrlFetchApp.fetch('https://cloud-api.yandex.net/v1/disk/public/resources?fields=name,preview,media_type&preview_size=XXL&public_key=' + encodeURIComponent(u), { muteHttpExceptions: true });
      if (r.getResponseCode() === 200) { var yj = kcJson_(r.getContentText()); out.img = String(yj.preview || ''); out.title = String(yj.name || '').replace(/\.[a-z0-9]{2,4}$/i, '').replace(/_+/g, ' '); }
    } else if ((m = /[?&]oid=(-?\d{1,12})&(?:amp;)?id=(\d{1,12})/i.exec(u) || /(?:video|clip)(-?\d{1,12})_(\d{1,12})/i.exec(u))) {
      out.kind = 'vk';
      r = UrlFetchApp.fetch('https://vkvideo.ru/video' + m[1] + '_' + m[2], { muteHttpExceptions: true });
      var t = r.getResponseCode() === 200 ? String(r.getContentText() || '') : '';
      var og = function (n) { var x = new RegExp('<meta[^>]+property=["\']og:' + n + '["\'][^>]*content=["\']([^"\']+)["\']', 'i').exec(t); return x ? x[1].replace(/&amp;/g, '&') : ''; };
      out.img = og('image'); out.title = og('title');
    } else if ((m = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(u))) {
      out.kind = 'youtube'; out.img = 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg';
    }
  } catch (err) { }
  out.img = kcThumb_(out.img); out.title = kcStr_(out.title, 80).replace(/\s+/g, ' ').trim();
  cache.put(key, JSON.stringify(out), 43200);
  return jsonOut_(out);
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
// =================== end of block KONTENT v2 ===================
