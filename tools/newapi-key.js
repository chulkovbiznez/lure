// Создаёт (или находит) в движке New API токен «LURE» и печатает его ключ последней строкой.
// Запуск внутри контейнера lure: логин и пароль администратора New API приходят двумя строками на stdin.
// Ключ на экран не выводится: его забирает install-lure.sh --auto-key и пишет в lure.env.
const B = (process.env.NEWAPI_URL || 'http://new-api:3000').replace(/\/$/, '');
const fail = m => { console.log('ERR ' + m); process.exit(1); };
let cookie = '', bearer = '', uid = '';
async function call(method, path, body) {
  const h = { 'Content-Type': 'application/json' };
  if (cookie) h.Cookie = cookie;
  if (bearer) h.Authorization = 'Bearer ' + bearer;
  if (uid) h['New-Api-User'] = String(uid);
  const r = await fetch(B + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  if (sc.length) cookie = [cookie, ...sc.map(c => c.split(';')[0])].filter(Boolean).join('; ');
  const t = await r.text();
  try { return JSON.parse(t); } catch (e) { return { success: false, message: 'HTTP ' + r.status }; }
}
const items = d => Array.isArray(d) ? d : (d && Array.isArray(d.items) ? d.items : (d && Array.isArray(d.data) ? d.data : []));
(async () => {
  const lines = require('fs').readFileSync(0, 'utf8').split(/\r?\n/);
  const username = (lines[0] || '').trim(), password = lines[1] || '';
  if (!username || !password) fail('нет логина или пароля');
  const lg = await call('POST', '/api/user/login', { username, password });
  if (!lg.success) fail('вход в New API: ' + (lg.message || 'не удалось'));
  const d = lg.data || {};
  if (d.access_token) bearer = d.access_token;
  uid = d.id || (d.user && d.user.id) || '';
  if (!uid && !bearer) fail('New API просит дополнительную проверку (2FA). Сделаем днём через сайт.');
  let list = items((await call('GET', '/api/token/search?keyword=LURE')).data);
  let tok = list.find(t => t.name === 'LURE');
  if (!tok) {
    const add = await call('POST', '/api/token/', { name: 'LURE', remain_quota: 0, expired_time: -1, unlimited_quota: true });
    if (!add.success) fail('создание токена: ' + (add.message || 'ошибка'));
    list = items((await call('GET', '/api/token/search?keyword=LURE')).data);
    if (!list.length) list = items((await call('GET', '/api/token/?p=1&page_size=100')).data);
    tok = list.find(t => t.name === 'LURE');
  }
  if (!tok) fail('токен LURE не найден после создания');
  let key = '';
  const k = await call('POST', '/api/token/' + tok.id + '/key');
  if (k.success && k.data && k.data.key) key = k.data.key;
  if (!key && tok.key && !/\*/.test(tok.key)) key = tok.key;
  if (!key) fail('не удалось получить ключ токена');
  if (!key.startsWith('sk-')) key = 'sk-' + key;
  const m = await fetch(B + '/v1/models', { headers: { Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(15000) });
  if (!m.ok) fail('ключ не принят движком (HTTP ' + m.status + ')');
  console.log('KEY ' + key);
})().catch(e => fail(e.message));
