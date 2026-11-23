// EAGLES Сторож — функция Yandex Cloud, запуск по таймеру раз в 5 минут.
// Проверяет сайт, LURE, ai, сервер EAGLES, сертификат ai, баланс Yandex Cloud
// и пишет Андрею в MAX ТОЛЬКО при смене состояния (упало / поднялось),
// плюс раз в день в 09:00 МСК короткая сводка «всё работает».
// Переменные: MAX_TOKEN (из Lockbox storozh-max), MAX_USER (необязательно), STATE_BUCKET, BILLING_ID (необязательно).
// Ключей в коде нет. Состояние хранится в бакете STATE_BUCKET (state.json), доступ по IAM-токену функции.
'use strict';
const tls = require('tls');
const ENV = process.env;
const SERVER = 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
const LOW_BALANCE = Number(ENV.LOW_BALANCE || 300);

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, ms = 15000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { signal: ac.signal, redirect: 'follow' }); const body = await r.text(); return { status: r.status, body }; }
  finally { clearTimeout(t); }
}
async function tryTwice(fn) {
  try { const r = await fn(); if (r === true) return true; } catch (e) {}
  await sleep(4000);
  try { return await fn(); } catch (e) { return String(e && e.message || e).slice(0, 80); }
}

const CHECKS = {
  'Сайт app.eaglesteam.ru': async () => { const r = await get('https://app.eaglesteam.ru/'); return r.status === 200 || 'код ' + r.status; },
  'LURE lure.eaglesteam.ru': async () => { const r = await get('https://lure.eaglesteam.ru/'); return r.status === 200 || 'код ' + r.status; },
  'Чат ai.eaglesteam.ru': async () => { const r = await get('https://ai.eaglesteam.ru/api/status'); return (r.status === 200 && /"success"\s*:\s*true/.test(r.body)) || 'код ' + r.status; },
  'Сервер EAGLES (база)': async () => { const r = await get(SERVER + '?action=login_request&login=99999990'); return /not_found/.test(r.body) || ('ответ: ' + r.body.slice(0, 60)); },
};

function certDays(host) {
  return new Promise(res => {
    const s = tls.connect({ host, port: 443, servername: host, timeout: 10000 }, () => {
      const c = s.getPeerCertificate(); s.end();
      res(c && c.valid_to ? Math.floor((new Date(c.valid_to) - Date.now()) / 86400000) : null);
    });
    s.on('error', () => res(null)); s.on('timeout', () => { s.destroy(); res(null); });
  });
}

async function balance(iam) {
  if (!ENV.BILLING_ID) return null;
  try {
    const r = await fetch('https://billing.api.cloud.yandex.net/billing/v1/billingAccounts/' + ENV.BILLING_ID, { headers: { Authorization: 'Bearer ' + iam } });
    if (!r.ok) return null; const j = await r.json(); return j.balance != null ? Number(j.balance) : null;
  } catch (e) { return null; }
}

async function loadState(iam) {
  try { const r = await fetch('https://storage.yandexcloud.net/' + ENV.STATE_BUCKET + '/state.json', { headers: { 'X-YaCloud-SubjectToken': iam } }); if (r.ok) return await r.json(); } catch (e) {}
  return {};
}
async function saveState(iam, st) {
  try { await fetch('https://storage.yandexcloud.net/' + ENV.STATE_BUCKET + '/state.json', { method: 'PUT', headers: { 'X-YaCloud-SubjectToken': iam, 'Content-Type': 'application/json' }, body: JSON.stringify(st) }); } catch (e) {}
}
// Сообщения идут в мессенджер MAX (бот «EAGLES Сторож» от ИП Чулкова).
// Telegram из Yandex Cloud не доходит (23.11.2026), а MAX — российский и отвечает стабильно.
// Кому писать: MAX_USER (если задан) или тот, кто первым нажал «Начать» у бота (запоминаем в state.json).
const MAX_API = 'https://platform-api.max.ru';
async function maxApi(method, path, body) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 10000);
  try {
    const r = await fetch(MAX_API + path, { method, signal: ac.signal,
      headers: Object.assign({ Authorization: ENV.MAX_TOKEN }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined });
    const txt = await r.text(); let j = {}; try { j = JSON.parse(txt); } catch (e) {}
    return { ok: r.ok, status: r.status, j };
  } catch (e) { return { ok: false, status: 0, j: {} }; } finally { clearTimeout(t); }
}
async function findUser(st) {
  if (ENV.MAX_USER) return ENV.MAX_USER;
  if (st.maxUser) return st.maxUser;
  const u = await maxApi('GET', '/updates?limit=100&timeout=0');
  for (const x of (u.j.updates || [])) {
    const id = (x.user && x.user.user_id) || (x.message && x.message.sender && x.message.sender.user_id);
    if (id) { st.maxUser = String(id); return st.maxUser; }
  }
  return null;
}
async function send(st, text) {
  if (!ENV.MAX_TOKEN) return false;
  const uid = await findUser(st); if (!uid) return false;
  const r = await maxApi('POST', '/messages?user_id=' + encodeURIComponent(uid), { text: text.slice(0, 3900) });
  return r.ok;
}

module.exports.handler = async (event, context) => {
  const iam = context && context.token && context.token.access_token;
  const st = await loadState(iam); st.down = st.down || {};
  const msk = new Date(Date.now() + 3 * 3600000); const hh = msk.getUTCHours(), mm = msk.getUTCMinutes(); const today = msk.toISOString().slice(0, 10);
  const test = event && (event.queryStringParameters || {}).test === '1';
  const out = [], bad = [];

  for (const [name, fn] of Object.entries(CHECKS)) {
    const r = await tryTwice(fn);
    if (r === true) { if (st.down[name]) { out.push('✅ Снова работает: ' + name); delete st.down[name]; } }
    else { bad.push(name + ' — ' + r); if (!st.down[name]) { out.push('🔴 Не работает: ' + name + ' (' + r + ')'); st.down[name] = Date.now(); }
           else if (Date.now() - st.down[name] > 3 * 3600000 && mm < 5) out.push('🔴 Всё ещё не работает: ' + name); }
  }
  const days = await certDays('ai.eaglesteam.ru');
  const bal = await balance(iam);
  const daily = (hh === 9 && st.day !== today) || test;
  if (days != null && days < 14 && (daily || st.certWarned !== today)) { out.push('⚠️ Сертификат ai.eaglesteam.ru кончится через ' + days + ' дн. Скажи Claude: «продлить сертификат ai».'); st.certWarned = today; }
  if (bal != null && bal < LOW_BALANCE && st.balWarned !== today) { out.push('⚠️ Баланс Yandex Cloud: ' + Math.round(bal) + ' ₽ — пополни, иначе сайт и LURE встанут.'); st.balWarned = today; }
  if (daily) {
    st.day = today;
    out.push((bad.length ? '📋 Сторож: есть проблемы — ' + bad.join('; ') : '📋 Сторож: всё работает (сайт, LURE, ai, сервер).') +
      (bal != null ? ' Баланс Яндекса: ' + Math.round(bal) + ' ₽.' : '') + (days != null ? ' Сертификат ai: ' + days + ' дн.' : ''));
  }
  let sent = false; if (out.length) sent = await send(st, out.join('\n'));
  await saveState(iam, st);
  return { statusCode: 200, body: JSON.stringify({ ok: true, msgs: out.length, delivered: sent, bad: bad.length, user: !!st.maxUser }) };
};
