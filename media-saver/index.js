// media-saver: функция Yandex Cloud Functions (Node.js 22) с сервисным аккаунтом (роль storage.uploader на бакет lure-media).
// Сервер LURE присылает адрес готовой картинки/видео на серверах Polza, функция скачивает файл
// и кладёт его в наше хранилище Яндекса — оттуда его видно и при «белых списках».
// Защита: заголовок X-Saver-Key должен совпадать с переменной SECRET. Качает только с *.polza.ai.
const BUCKET = process.env.BUCKET || 'lure-media';
const SECRET = process.env.SECRET || '';
const MAX = 300e6;
const AK = process.env.AK || '', SK = process.env.SK || '';   // статический ключ сервисного аккаунта — только для ссылок загрузки
const crypto = require('crypto');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const hmac = (k, x) => crypto.createHmac('sha256', k).update(x).digest();
const enc = x => encodeURIComponent(x).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
// подписанная ссылка S3 (SigV4, query string)
function presign({ method, host, path, region, ak, sk, expires, now }) {
  const d = (now || new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const day = d.slice(0, 8), scope = day + '/' + region + '/s3/aws4_request';
  const q = { 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': ak + '/' + scope, 'X-Amz-Date': d, 'X-Amz-Expires': String(expires), 'X-Amz-SignedHeaders': 'host' };
  const cq = Object.keys(q).sort().map(k => enc(k) + '=' + enc(q[k])).join('&');
  const cpath = path.split('/').map(enc).join('/');
  const creq = [method, cpath, cq, 'host:' + host + '\n', 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const sts = ['AWS4-HMAC-SHA256', d, scope, sha(creq)].join('\n');
  const key = hmac(hmac(hmac(hmac('AWS4' + sk, day), region), 's3'), 'aws4_request');
  return 'https://' + host + cpath + '?' + cq + '&X-Amz-Signature=' + crypto.createHmac('sha256', key).update(sts).digest('hex');
}
module.exports.presign = presign;
const json = (code, o) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });

module.exports.handler = async (event, context) => {
  const h = {};
  for (const k in (event.headers || {})) h[k.toLowerCase()] = event.headers[k];
  if (!SECRET || h['x-saver-key'] !== SECRET) return json(403, { error: 'forbidden' });
  let b = {};
  try { b = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '{}')); } catch (e) { return json(400, { error: 'bad_json' }); }
  if (b.presign) {   // ссылка, по которой браузер сам загрузит своё видео (15 минут)
    const key = String(b.key || '');
    if (!/^up\/[A-Za-z0-9_-]{1,40}\/[a-f0-9]{16}\.(mp4|mov|webm)$/.test(key)) return json(400, { error: 'bad_key' });
    if (!AK || !SK) return json(500, { error: 'no_static_key' });
    const put = presign({ method: 'PUT', host: 'storage.yandexcloud.net', path: '/' + BUCKET + '/' + key, region: 'ru-central1', ak: AK, sk: SK, expires: 900 });
    return json(200, { put, url: 'https://storage.yandexcloud.net/' + BUCKET + '/' + key });
  }
  let src;
  try { src = new URL(String(b.url || '')); } catch (e) { return json(400, { error: 'bad_url' }); }
  if (src.protocol !== 'https:' || !/(^|\.)polza\.ai$/.test(src.hostname)) return json(400, { error: 'bad_host' });
  const key = String(b.key || '');
  if (!/^[A-Za-z0-9_-]{1,40}\/[a-f0-9]{8,40}\.(png|jpg|jpeg|webp|gif|mp4|mov)$/.test(key)) return json(400, { error: 'bad_key' });
  const token = context && context.token && context.token.access_token;
  if (!token) return json(500, { error: 'no_service_account' });
  try {
    const r = await fetch(src, { signal: AbortSignal.timeout(150000) });
    if (!r.ok) return json(502, { error: 'download ' + r.status });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX) return json(413, { error: 'too_big' });
    const ext = key.split('.').pop();
    const ct = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', mov: 'video/quicktime' }[ext];
    const up = await fetch('https://storage.yandexcloud.net/' + BUCKET + '/' + key, {
      method: 'PUT', body: buf, signal: AbortSignal.timeout(150000),
      headers: { 'X-YaCloud-SubjectToken': token, 'Content-Type': ct, 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
    if (!up.ok) return json(502, { error: 'upload ' + up.status + ' ' + (await up.text()).slice(0, 200) });
    return json(200, { url: 'https://storage.yandexcloud.net/' + BUCKET + '/' + key, bytes: buf.length });
  } catch (e) {
    return json(502, { error: e.message });
  }
};
