// polza-gw: функция Yandex Cloud Functions (Node.js 22). Посредник между движком New API и Polza.ai.
// Зачем: при «белых списках» сервер ai-chat не выходит в интернет, а функции Яндекса выходят.
// В New API у канала Polza адрес меняется на  https://functions.yandexcloud.net/<id>?p=/api
// и движок зовёт  ...?p=/api/v1/chat/completions  — функция пересылает это на  UP + p.
// Ходит только на UP (по умолчанию https://polza.ai). Ключ Polza приходит от New API в заголовке и нигде не хранится.
const UP = (process.env.UP || 'https://polza.ai').replace(/\/$/, '');
const PASS = ['authorization', 'content-type', 'accept', 'x-title', 'http-referer'];
const TEXT = /^(text\/|application\/(json|x-ndjson))/;

module.exports.handler = async (event) => {
  const h = {};
  for (const k in (event.headers || {})) h[k.toLowerCase()] = event.headers[k];
  const qs = event.queryStringParameters || {};
  const p = String(qs.p || '');
  if (!/^\/[A-Za-z0-9_.\/-]+$/.test(p) || p.includes('..')) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: '{"error":{"message":"bad path"}}' };
  }
  if (!h.authorization) return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: '{"error":{"message":"no key"}}' };
  const extra = Object.keys(qs).filter(k => k !== 'p').map(k => encodeURIComponent(k) + '=' + encodeURIComponent(qs[k])).join('&');
  const headers = {};
  for (const k of PASS) if (h[k]) headers[k] = h[k];
  const method = event.httpMethod || 'GET';
  let body;
  if (method !== 'GET' && method !== 'HEAD' && event.body) body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  try {
    const r = await fetch(UP + p + (extra ? '?' + extra : ''), { method, headers, body, signal: AbortSignal.timeout(290000) });
    const ct = r.headers.get('content-type') || 'application/json';
    const buf = Buffer.from(await r.arrayBuffer());
    const out = { statusCode: r.status, headers: { 'Content-Type': ct, 'Cache-Control': 'no-store' } };
    if (TEXT.test(ct)) { out.body = buf.toString('utf8'); } else { out.body = buf.toString('base64'); out.isBase64Encoded = true; }
    return out;
  } catch (e) {
    return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: { message: 'polza-gw: ' + e.message } }) };
  }
};
