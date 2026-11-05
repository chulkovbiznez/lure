// Переключает каналы Polza в New API на путь через функцию Яндекса polza-gw (или обратно).
// Запуск внутри контейнера lure. stdin: 1) логин 2) пароль администратора New API 3) адрес функции или слово revert.
// Старые адреса сохраняются в /data/polza-old-base.json, revert возвращает их.
const fs = require('fs');
const B = (process.env.NEWAPI_URL || 'http://new-api:3000').replace(/\/$/, '');
const SAVE = '/data/polza-old-base.json';
const say = m => console.log(m);
const fail = m => { say('ERR ' + m); process.exit(1); };
let cookie = '', bearer = '', uid = '';
async function call(method, path, body) {
  const h = { 'Content-Type': 'application/json' };
  if (cookie) h.Cookie = cookie;
  if (bearer) h.Authorization = 'Bearer ' + bearer;
  if (uid) h['New-Api-User'] = String(uid);
  const r = await fetch(B + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
  const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  if (sc.length) cookie = [cookie, ...sc.map(c => c.split(';')[0])].filter(Boolean).join('; ');
  const t = await r.text();
  try { return JSON.parse(t); } catch (e) { return { success: false, message: 'HTTP ' + r.status }; }
}
const items = d => Array.isArray(d) ? d : (d && Array.isArray(d.items) ? d.items : []);
(async () => {
  const L = fs.readFileSync(0, 'utf8').split(/\r?\n/);
  const username = (L[0] || '').trim(), password = L[1] || '', target = (L[2] || '').trim();
  if (!username || !password || !target) fail('нет логина, пароля или адреса функции');
  const revert = target === 'revert';
  const viaGw = /^https:\/\/[a-z0-9]+\.apigw\.yandexcloud\.net$/.test(target);
  if (!revert && !viaGw && !/^https:\/\/functions\.yandexcloud\.net\/[a-z0-9]+$/.test(target)) fail('адрес должен быть вида https://xxxx.apigw.yandexcloud.net');
  const lg = await call('POST', '/api/user/login', { username, password });
  if (!lg.success) fail('вход в New API: ' + (lg.message || 'не удалось'));
  const d = lg.data || {};
  if (d.access_token) bearer = d.access_token;
  uid = d.id || (d.user && d.user.id) || '';
  if (!uid && !bearer) fail('New API просит дополнительную проверку (2FA)');
  let list = items((await call('GET', '/api/channel/?p=1&page_size=100')).data);
  if (!list.length) list = items((await call('GET', '/api/channel/?p=0&page_size=100')).data);
  if (!list.length) fail('не нашёл каналов в New API');
  const saved = fs.existsSync(SAVE) ? JSON.parse(fs.readFileSync(SAVE, 'utf8')) : {};
  let n = 0;
  for (const c of list) {
    const base = String(c.base_url || '');
    let nb;
    if (revert) { if (!saved[c.id]) continue; nb = saved[c.id]; }
    else {
      if (/yandexcloud\.net/.test(base)) { say('Канал «' + c.name + '» уже идёт через функцию: ' + base); continue; }
      if (!/polza\.ai/.test(base)) continue;
      const u = new URL(base);
      if (u.hostname !== 'polza.ai') fail('канал «' + c.name + '» смотрит на ' + u.origin + ', а функция настроена на https://polza.ai — напиши Claude');
      saved[c.id] = base;
      const path = u.pathname.replace(/\/$/, '') || '';
      if (viaGw && !/^\/api(\/|$)/.test(path)) fail('путь канала «' + c.name + '» ' + path + ' не начинается с /api — напиши Claude');
      nb = viaGw ? target + path : target + '?p=' + path;
    }
    const full = await call('GET', '/api/channel/' + c.id);
    if (!full.success || !full.data) fail('не прочитал канал ' + c.id);
    const ch = full.data;
    delete ch.status; delete ch.key;
    ch.base_url = nb;
    const up = await call('PUT', '/api/channel/', ch);
    if (!up.success) fail('не смог изменить канал «' + c.name + '»: ' + (up.message || ''));
    say('Канал «' + c.name + '»: ' + base + '  →  ' + nb);
    n++;
  }
  if (!revert) fs.writeFileSync(SAVE, JSON.stringify(saved, null, 1));
  if (!n) say('Нечего менять.');
  // проверка: короткий вопрос через ключ LURE
  const key = process.env.NEWAPI_KEY;
  if (key) {
    const ms = await fetch(B + '/v1/models', { headers: { Authorization: 'Bearer ' + key } }).then(r => r.json()).catch(() => ({}));
    const ids = (ms.data || []).map(m => m.id);
    const m = ids.find(i => /sonnet/i.test(i)) || ids[0];
    const r = await fetch(B + '/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Ответь одним словом: работает?' }], max_tokens: 20 }), signal: AbortSignal.timeout(120000) }).then(r => r.json()).catch(e => ({ error: { message: e.message } }));
    const txt = r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content;
    say(txt ? 'ПРОВЕРКА ' + m + ': ОТВЕТИЛ «' + String(txt).trim().slice(0, 60) + '»' : 'ПРОВЕРКА ' + m + ': ОШИБКА ' + JSON.stringify(r.error || r).slice(0, 300));
  }
  say('ГОТОВО');
})().catch(e => fail(e.message));
