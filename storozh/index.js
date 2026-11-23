// EAGLES Сторож — функция Yandex Cloud, запуск по таймеру раз в 5 минут.
// Проверяет сайт, LURE, ai, сервер EAGLES, сертификат ai, баланс Yandex Cloud
// и пишет Андрею в Telegram ТОЛЬКО при смене состояния (упало / поднялось),
// плюс раз в день в 09:00 МСК короткая сводка «всё работает».
// Переменные: TG_TOKEN (из Lockbox), TG_CHAT, STATE_BUCKET, BILLING_ID (необязательно).
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
// api.telegram.org из Yandex Cloud не резолвится в IPv4 (только IPv6, который не ходит),
// поэтому подключаемся к известным IP Telegram напрямую, с правильным именем (SNI).
const https = require('https');
const TG_IPS = ['149.154.167.220', '149.154.167.99', '149.154.166.110'];
function tgApi(method, payload) {
  const body = JSON.stringify(payload || {});
  const tryIp = (i) => new Promise((resolve, reject) => {
    const req = https.request({ host: TG_IPS[i], servername: 'api.telegram.org', port: 443, method: 'POST',
      path: '/bot' + ENV.TG_TOKEN + '/' + method, timeout: 10000,
      headers: { Host: 'api.telegram.org', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ ok: false }); } });
    });
    req.on('timeout', () => req.destroy(new Error('timeout'))); req.on('error', reject); req.end(body);
  });
  return (async () => { for (let i = 0; i < TG_IPS.length; i++) { try { return await tryIp(i); } catch (e) {} } return { ok: false }; })();
}
async function tg(text) {
  if (!ENV.TG_TOKEN || !ENV.TG_CHAT || ENV.TG_CHAT === '0') return false;
  const r = await tgApi('sendMessage', { chat_id: ENV.TG_CHAT, text, disable_web_page_preview: true });
  return !!r.ok;
}

module.exports.handler = async (event, context) => {
  if (event && (event.queryStringParameters || {}).chatid === '1') {
    const u = await tgApi('getUpdates', {});
    const ids = (u.result || []).map(x => x.message && x.message.chat && x.message.chat.id).filter(Boolean);
    return { statusCode: 200, body: JSON.stringify({ ok: !!u.ok, chats: [...new Set(ids)] }) };
  }
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
  if (out.length) await tg(out.join('\n'));
  await saveState(iam, st);
  return { statusCode: 200, body: JSON.stringify({ ok: true, sent: out.length, bad: bad.length }) };
};
