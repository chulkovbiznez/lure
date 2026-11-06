// admin-px: функция Yandex Cloud Functions (Node.js 22). Вход в админку New API при «белых списках».
// Шлюз admin-gw (*.apigw.yandexcloud.net) → эта функция → https://ai.eaglesteam.ru (UP).
// Передаёт все заголовки, включая куки входа, и возвращает Set-Cookie обратно в браузер.
const UP = (process.env.UP || 'https://ai.eaglesteam.ru').replace(/\/$/, '');
const DROP = new Set(['host', 'content-length', 'connection', 'accept-encoding', 'x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host', 'x-real-ip', 'x-envoy-external-address', 'x-request-id', 'uber-trace-id', 'x-trace-id', 'traceparent']);
const TEXT = /^(text\/|application\/(json|javascript|x-javascript|xml|manifest\+json)|image\/svg)/;

module.exports.handler = async (event) => {
  const pp = event.params || event.pathParams || event.pathParameters || {};
  const p = '/' + String(pp.path || '').replace(/^\/+/, '');
  if (p.includes('..')) return { statusCode: 400, body: 'bad path' };
  const mq = event.multiValueQueryStringParameters || {};
  const q = event.queryStringParameters || {};
  const parts = [];
  for (const k of Object.keys(Object.keys(mq).length ? mq : q)) {
    const vals = mq[k] || [q[k]];
    for (const v of vals) parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v == null ? '' : v));
  }
  const headers = {};
  const mh = event.multiValueHeaders || {};
  for (const k in (event.headers || {})) {
    const lk = k.toLowerCase(); if (DROP.has(lk)) continue;
    headers[lk] = mh[k] && mh[k].length > 1 ? mh[k].join(lk === 'cookie' ? '; ' : ', ') : event.headers[k];
  }
  const method = event.httpMethod || 'GET';
  let body;
  if (method !== 'GET' && method !== 'HEAD' && event.body) body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  try {
    const r = await fetch(UP + p + (parts.length ? '?' + parts.join('&') : ''), { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(55000) });
    const out = { statusCode: r.status, headers: {}, multiValueHeaders: {} };
    r.headers.forEach((v, k) => {
      if (['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive', 'set-cookie', 'strict-transport-security', 'alt-svc'].includes(k)) return;
      if (k === 'location') v = v.replace(UP, '');
      out.headers[k] = v;
    });
    const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    if (sc.length) out.multiValueHeaders['Set-Cookie'] = sc.map(c => c.replace(/;\s*Domain=[^;]*/i, ''));
    const ct = r.headers.get('content-type') || '';
    const buf = Buffer.from(await r.arrayBuffer());
    if (TEXT.test(ct)) out.body = buf.toString('utf8'); else { out.body = buf.toString('base64'); out.isBase64Encoded = true; }
    return out;
  } catch (e) {
    return { statusCode: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'admin-px: ' + e.message };
  }
};
