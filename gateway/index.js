// LURE-шлюз: функция Yandex Cloud Functions (Node.js 22).
// Браузер ходит сюда (адрес functions.yandexcloud.net проходит через «белые списки»),
// функция передаёт запрос на сервер LURE внутри Яндекса и возвращает ответ.
// Переменные: BACK (по умолчанию https://ai.eaglesteam.ru/lure-gw), ORIGINS (откуда можно звать).
const BACK = (process.env.BACK || 'https://ai.eaglesteam.ru/lure-gw').replace(/\/$/, '');
const ORIGINS = String(process.env.ORIGINS || 'https://lure.eaglesteam.ru').split(',').map(s => s.trim());

module.exports.handler = async (event) => {
  const h = {};
  for (const k in (event.headers || {})) h[k.toLowerCase()] = event.headers[k];
  const origin = h.origin || '';
  const cors = {
    'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type, X-Lure-Session',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  const method = event.httpMethod || 'GET';
  if (method === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  const p = String((event.queryStringParameters || {}).p || '');
  if (!/^\/api\/[A-Za-z0-9_\/-]*(\?[A-Za-z0-9_=&%.-]*)?$/.test(p)) {
    return { statusCode: 400, headers: Object.assign({ 'Content-Type': 'application/json' }, cors), body: '{"ok":false,"error":"bad_path"}' };
  }
  let body = event.body || '';
  if (body && event.isBase64Encoded) body = Buffer.from(body, 'base64').toString('utf8');
  const ip = (event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp) || '';
  try {
    const r = await fetch(BACK + p, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Lure-Session': h['x-lure-session'] || '', 'X-Forwarded-For': ip },
      body: method === 'POST' ? (body || '{}') : undefined,
      signal: AbortSignal.timeout(280000),
    });
    const text = await r.text();
    return { statusCode: r.status, headers: Object.assign({ 'Content-Type': r.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' }, cors), body: text };
  } catch (e) {
    return { statusCode: 502, headers: Object.assign({ 'Content-Type': 'application/json' }, cors), body: '{"ok":false,"error":"gateway"}' };
  }
};
