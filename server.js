// LURE — сервис нейросетей для участников EAGLES. Сервер без внешних библиотек (Node 22).
// Вход: аккаунт EAGLES (login_request → login_verify → me на сервере EAGLES).
// Нейросети: движок New API (ai.eaglesteam.ru) по одному служебному ключу.
// Деньги: свой кошелёк в рублях у каждого ID EAGLES. В бинар EAGLES ничего не уходит.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV = process.env;
const PORT = Number(ENV.PORT || 8080);
const DATA_DIR = ENV.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC = path.join(__dirname, 'public');
const EAGLES = ENV.EAGLES_API || 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip';
const NEWAPI = (ENV.NEWAPI_URL || 'http://new-api:3000').replace(/\/$/, '');
const NEWAPI_KEY = ENV.NEWAPI_KEY || '';
const OWNERS = String(ENV.OWNER_IDS || '11111').split(',').map(s => s.trim()).filter(Boolean);
const RUB_PER_UNIT = Number(ENV.RUB_PER_UNIT || 100);      // сколько рублей стоит 1 «$» движка New API
const DAY_LIMIT = Number(ENV.DAY_LIMIT_RUB || 1500);       // не больше стольких рублей в сутки на человека
const MAX_OUT = Number(ENV.MAX_OUTPUT_TOKENS || 4000);     // длина ответа
const MAX_IN_CHARS = Number(ENV.MAX_INPUT_CHARS || 120000);
const WELCOME = Number(ENV.WELCOME_RUB || 0);              // подарок новому человеку
const SESSION_DAYS = 30;                                   // как ключ входа EAGLES: после него снова код на почту
const LOCK_MIN = Number(ENV.LOCK_MIN || 30);               // без дела столько минут → снова ПИН
const QUOTA_PER_UNIT = 500000;
const TERMS_V = 1;                                        // версия правил LURE: поменяешь текст — подними число, все примут заново                             // так считает New API

// ---------------- база: один файл JSON ----------------
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'lure.json');
let db = { users: {}, sessions: {}, codes: {}, ops: [] };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
let saveT = null;
function save() {
  if (saveT) return;
  saveT = setTimeout(() => {
    saveT = null;
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, DB_FILE);
  }, 200);
}
function saveNow() { if (saveT) { clearTimeout(saveT); saveT = null; } fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db)); fs.renameSync(DB_FILE + '.tmp', DB_FILE); }
process.on('SIGTERM', () => { try { saveNow(); } catch (e) {} process.exit(0); });
process.on('SIGINT', () => { try { saveNow(); } catch (e) {} process.exit(0); });
// ночная копия рядом: lure-ГГГГ-ММ-ДД.json, хранится 14 дней
setInterval(() => {
  try {
    const d = msk().slice(0, 10), f = path.join(DATA_DIR, 'lure-' + d + '.json');
    if (!fs.existsSync(f)) fs.copyFileSync(DB_FILE, f);
    fs.readdirSync(DATA_DIR).filter(n => /^lure-\d{4}-\d\d-\d\d\.json$/.test(n)).sort().slice(0, -14).forEach(n => fs.unlinkSync(path.join(DATA_DIR, n)));
  } catch (e) {}
}, 3600 * 1000);

const r2 = x => Math.round(x * 100) / 100;
function msk(t) { return new Date((t || Date.now()) + 3 * 3600000).toISOString(); }
function today() { return msk().slice(0, 10); }

function user(id) { return db.users[id]; }
function op(u, kind, sum, note) {
  u.balance = r2((u.balance || 0) + sum);
  u.hist = u.hist || [];
  u.hist.unshift({ at: Date.now(), kind, sum: r2(sum), note: note || '', bal: u.balance });
  if (u.hist.length > 300) u.hist.length = 300;
  db.ops.push({ at: Date.now(), id: u.id, kind, sum: r2(sum), note: note || '' });
  if (db.ops.length > 20000) db.ops.splice(0, db.ops.length - 20000);
  save();
}
function spentToday(u) { return u.day && u.day.d === today() ? u.day.sum : 0; }
function addSpent(u, sum) { if (!u.day || u.day.d !== today()) u.day = { d: today(), sum: 0 }; u.day.sum = r2(u.day.sum + sum); }

// ---------------- цены из движка New API ----------------
let PRICES = { at: 0, models: {}, group: 1 };
async function loadPrices(force) {
  if (!force && Date.now() - PRICES.at < 10 * 60000 && Object.keys(PRICES.models).length) return PRICES;
  try {
    const r = await fetch(NEWAPI + '/api/pricing', { signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    const list = j.data || [];
    const gr = (j.group_ratio && Number(j.group_ratio.default)) || 1;
    let avail = null;
    try {
      const m = await fetch(NEWAPI + '/v1/models', { headers: { Authorization: 'Bearer ' + NEWAPI_KEY }, signal: AbortSignal.timeout(8000) });
      const mj = await m.json(); if (mj && mj.data) avail = new Set(mj.data.map(x => x.id));
    } catch (e) {}
    const models = {};
    for (const x of list) {
      if (avail && !avail.has(x.model_name)) continue;
      if (x.enable_groups && x.enable_groups.length && x.enable_groups.indexOf('default') === -1) continue;
      models[x.model_name] = { perCall: x.quota_type === 1, mr: Number(x.model_ratio) || 0, cr: Number(x.completion_ratio) || 1, price: Number(x.model_price) || 0 };
    }
    PRICES = { at: Date.now(), models, group: gr };
  } catch (e) { console.error('pricing', e.message); }
  return PRICES;
}
// рубли за запрос: как считает New API, переведённое в рубли
function costRub(model, pin, pout) {
  const p = PRICES.models[model]; if (!p) return null;
  if (p.perCall) return r2(p.price * PRICES.group * RUB_PER_UNIT);
  return (pin + pout * p.cr) * p.mr * PRICES.group / QUOTA_PER_UNIT * RUB_PER_UNIT;
}
function per1M(model) {
  const p = PRICES.models[model]; if (!p || p.perCall) return null;
  return { in: r2(costRub(model, 1e6, 0)), out: r2(costRub(model, 0, 1e6)) };
}

// ---------------- сервер EAGLES ----------------
async function eagles(params) {
  const q = new URLSearchParams(Object.assign({}, params, { _: Date.now() })).toString();
  const r = await fetch(EAGLES + '?' + q, { signal: AbortSignal.timeout(20000) });
  return r.json();
}

// ---------------- HTTP ----------------
// ---------------- диалоги: на сервере, у каждого своя папка ----------------
// data/dialogs/<ID>/index.json — список, <dialogId>.json — сам диалог
const DLG_DIR = path.join(DATA_DIR, 'dialogs');
const DLG_MAX = Number(ENV.DIALOGS_MAX || 300);                 // диалогов на человека
const DLG_USER_BYTES = Number(ENV.DIALOGS_USER_MB || 15) * 1e6; // места на человека
const DLG_ONE_BYTES = 2e6;                                      // один диалог
const okId = s => /^[a-z0-9]{4,24}$/.test(s);
function udir(u) { return path.join(DLG_DIR, String(u.id).replace(/[^\w-]/g, '_')); }
function dlgIndex(u) { try { return JSON.parse(fs.readFileSync(path.join(udir(u), 'index.json'), 'utf8')); } catch (e) { return []; } }
function writeAtomic(f, data) { fs.writeFileSync(f + '.tmp', data); fs.renameSync(f + '.tmp', f); }
function dlgSaveIndex(u, list) { fs.mkdirSync(udir(u), { recursive: true }); writeAtomic(path.join(udir(u), 'index.json'), JSON.stringify(list)); }
function dlgClean(d) {
  const msgs = (Array.isArray(d.msgs) ? d.msgs : []).filter(x => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').map(x => {
    const o = { role: x.role, content: x.content };
    if (x.role === 'assistant') { if (typeof x.model === 'string') o.model = x.model.slice(0, 120); if (typeof x.cost === 'number' && isFinite(x.cost)) o.cost = x.cost; }
    return o;
  });
  return { id: d.id, title: String(d.title || '').slice(0, 80), msgs, at: Date.now() };
}

function send(res, code, obj, headers) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': typeof obj === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}));
  res.end(body);
}
function readBody(req, limit) {
  return new Promise((ok, bad) => {
    const parts = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > (limit || 2e6)) { bad(new Error('too_big')); req.destroy(); } else parts.push(c); });
    req.on('end', () => { try { ok(parts.length ? JSON.parse(Buffer.concat(parts).toString('utf8')) : {}); } catch (e) { bad(new Error('bad_json')); } });
    req.on('error', bad);
  });
}
function cookies(req) { const o = {}; String(req.headers.cookie || '').split(/;\s*/).forEach(c => { const i = c.indexOf('='); if (i > 0) o[c.slice(0, i)] = decodeURIComponent(c.slice(i + 1)); }); return o; }
function sessTok(req) { return cookies(req).lure_s || String(req.headers['x-lure-session'] || ''); }
function sessUser(req) {
  const t = sessTok(req);
  const s = t && db.sessions[t];
  if (!s) return null;
  if (Date.now() - s.at > SESSION_DAYS * 86400000) { delete db.sessions[t]; save(); return null; }
  const u = user(s.id);
  if (!u || u.blocked) return null;
  return u;
}
const isOwner = u => u && OWNERS.indexOf(u.id) !== -1;
// Доступ к LURE только с подпиской EAGLES Pro (решение Андрея 03.11). Владелец — всегда.
// Срок подписки берём из EAGLES при входе (me.paidUntil). Кончился — человек входит заново, и мы снова спрашиваем EAGLES.
function toTime(v) { if (v === '' || v == null) return 0; const n = Number(v); if (isFinite(n) && n > 1e11) return n; const t = Date.parse(v); return isFinite(t) ? t : 0; }
function proUntil(u) {
  if (u.plan !== 'pro') return 0;
  return u.paidUntil || (u.lastLogin || 0) + 30 * 86400000;   // срок не пришёл (подарок, навсегда) — перепроверка через 30 дней
}
function hasAccess(u) { return isOwner(u) || proUntil(u) > Date.now(); }
function pub(u) {
  return { id: u.id, name: u.name, plan: u.plan, balance: r2(u.balance || 0), spentToday: spentToday(u), dayLimit: DAY_LIMIT, owner: isOwner(u),
    access: hasAccess(u), proUntil: isOwner(u) ? 0 : proUntil(u), terms: (u.termsV || 0) >= TERMS_V };
}

// простая защита от перебора кодов пополнения
const fails = {};
function tooManyFails(key) { const f = fails[key]; return f && f.n >= 5 && Date.now() - f.t < 3600000; }
function addFail(key) { const f = fails[key] = fails[key] && Date.now() - fails[key].t < 3600000 ? fails[key] : { n: 0, t: Date.now() }; f.n++; }

const busy = new Set(); // один запрос к нейросети на человека одновременно

async function api(req, res, url) {
  const p = url.pathname;
  const m = req.method;

  // ----- вход -----
  if (p === '/api/login/request' && m === 'POST') {
    const b = await readBody(req);
    const r = await eagles({ action: 'login_request', login: String(b.login || '').trim().toLowerCase() });
    return send(res, 200, { ok: !!r.ok, id: r.id, emailHint: r.emailHint, error: r.error, retryAfterMin: r.retryAfterMin });
  }
  if (p === '/api/login/verify' && m === 'POST') {
    const b = await readBody(req);
    const v = await eagles({ action: 'login_verify', id: String(b.id || ''), code: String(b.code || '').replace(/\D/g, '') });
    if (!v.ok) return send(res, 200, { ok: false, error: v.error, retryAfterMin: v.retryAfterMin });
    const me = await eagles({ action: 'me', sess: v.session });
    if (!me.ok) return send(res, 200, { ok: false, error: me.error || 'auth' });
    const id = String(me.id);
    let u = user(id);
    if (!u) { u = db.users[id] = { id, created: Date.now(), balance: 0, hist: [] }; if (WELCOME > 0) op(u, 'gift', WELCOME, 'Подарок от LURE'); }
    u.name = me.name || u.name || id; u.plan = me.plan || 'free'; u.paidUntil = toTime(me.paidUntil); u.email = me.email || ''; u.lastLogin = Date.now();
    if (u.blocked) return send(res, 200, { ok: false, error: 'blocked' });
    const tok = crypto.randomBytes(32).toString('hex');
    db.sessions[tok] = { id, at: Date.now(), es: v.session, ul: Date.now() }; // es: ключ EAGLES для ПИН, ul: когда последний раз был открыт
    save();
    return send(res, 200, { ok: true, me: pub(u), token: tok }, { 'Set-Cookie': 'lure_s=' + tok + '; Path=/; Max-Age=' + SESSION_DAYS * 86400 + '; HttpOnly; Secure; SameSite=Lax' });
  }
  if (p === '/api/logout' && m === 'POST') {
    const t = sessTok(req); if (t) { delete db.sessions[t]; save(); }
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'lure_s=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax' });
  }

  const u = sessUser(req);
  if (!u) return send(res, 200, { ok: false, error: 'auth' });
  const tok = sessTok(req), S = db.sessions[tok];

  // ----- ПИН: один на весь EAGLES, проверяет сервер EAGLES по ключу входа -----
  const endSess = () => { delete db.sessions[tok]; save(); return send(res, 200, { ok: false, error: 'auth' }, { 'Set-Cookie': 'lure_s=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax' }); };
  const locked = !S.ul || Date.now() - S.ul > LOCK_MIN * 60000;
  if (p.startsWith('/api/pin/') && m === 'POST') {
    if (!S.es) return endSess();
    const b = await readBody(req), pin = String(b.pin || '').replace(/\D/g, '');
    const map = { '/api/pin/state': ['pin_state'], '/api/pin/check': ['pin_check', { pin }], '/api/pin/set': ['pin_set', { pin }], '/api/pin/rec_request': ['pin_rec_request'], '/api/pin/rec_verify': ['pin_rec_verify', { pin, code: String(b.code || '').replace(/\D/g, '') }] };
    const a = map[p]; if (!a) return send(res, 404, { ok: false, error: 'not_found' });
    // задать ПИН можно и при закрытом LURE: если ПИН уже есть, EAGLES ответит pin_exists и не перезапишет
    const r = await eagles(Object.assign({ action: a[0], sess: S.es }, a[1] || {}));
    if (r.error === 'auth') return endSess();
    if (r.ok && (p === '/api/pin/check' || p === '/api/pin/rec_verify' || p === '/api/pin/set')) { S.ul = Date.now(); save(); }
    return send(res, 200, { ok: !!r.ok, error: r.error, left: r.left, has: r.has, blocked: r.blocked, recLeft: r.recLeft, emailHint: r.emailHint });
  }
  if (p === '/api/lock' && m === 'POST') { S.ul = 0; save(); return send(res, 200, { ok: true }); }
  if (locked) return send(res, 200, p === '/api/me' ? { ok: true, locked: true, me: { id: u.id, name: u.name } } : { ok: false, error: 'pin_locked' });
  if (Date.now() - S.ul > 60000) { S.ul = Date.now(); save(); }

  if (p === '/api/me') return send(res, 200, { ok: true, me: pub(u) });
  if (p === '/api/terms' && m === 'POST') { u.termsV = TERMS_V; u.termsAt = Date.now(); save(); return send(res, 200, { ok: true, me: pub(u) }); }

  if (p === '/api/models') {
    await loadPrices();
    const list = Object.keys(PRICES.models).sort().map(id => ({ id, perCall: PRICES.models[id].perCall, per1M: per1M(id), perCallRub: PRICES.models[id].perCall ? costRub(id, 0, 0) : null }));
    return send(res, 200, { ok: true, models: list });
  }

  if (p === '/api/wallet') return send(res, 200, { ok: true, me: pub(u), hist: (u.hist || []).slice(0, 100) });

  if (p === '/api/redeem' && m === 'POST') {
    if (tooManyFails(u.id)) return send(res, 200, { ok: false, error: 'too_many' });
    const b = await readBody(req);
    const code = String(b.code || '').trim().toUpperCase().replace(/\s+/g, '');
    const c = db.codes[code];
    if (!c || c.usedBy) { addFail(u.id); return send(res, 200, { ok: false, error: c ? 'used' : 'bad_code' }); }
    c.usedBy = u.id; c.usedAt = Date.now();
    op(u, 'gift', c.sum, 'Подарочный код ' + code.slice(0, 4) + '…');
    return send(res, 200, { ok: true, sum: c.sum, me: pub(u) });
  }

  // ----- диалоги -----
  if (p === '/api/dialogs') return send(res, 200, { ok: true, list: dlgIndex(u).map(x => ({ id: x.id, t: x.t, at: x.at })) });
  if (p === '/api/dialog' && m === 'GET') {
    const id = String(url.searchParams.get('id') || '');
    if (!okId(id)) return send(res, 200, { ok: false, error: 'not_found' });
    try { return send(res, 200, { ok: true, dialog: JSON.parse(fs.readFileSync(path.join(udir(u), id + '.json'), 'utf8')) }); }
    catch (e) { return send(res, 200, { ok: false, error: 'not_found' }); }
  }
  if (p === '/api/dialog' && m === 'POST') {
    const b = await readBody(req, 4e6);
    if (!okId(String(b.id || ''))) return send(res, 200, { ok: false, error: 'bad_id' });
    const d = dlgClean(b), data = JSON.stringify(d);
    if (Buffer.byteLength(data) > DLG_ONE_BYTES) return send(res, 200, { ok: false, error: 'dialog_full' });
    fs.mkdirSync(udir(u), { recursive: true });
    writeAtomic(path.join(udir(u), d.id + '.json'), data);
    let list = dlgIndex(u).filter(x => x.id !== d.id);
    list.unshift({ id: d.id, t: d.title, at: d.at, size: Buffer.byteLength(data) });
    // лишнее и самое старое удаляем, чтобы диск не переполнился
    let total = 0; const keep = [];
    list.forEach((x, i) => { total += x.size || 0; if (i === 0 || (keep.length < DLG_MAX && total <= DLG_USER_BYTES)) keep.push(x); else { try { fs.unlinkSync(path.join(udir(u), x.id + '.json')); } catch (e) {} } });
    dlgSaveIndex(u, keep);
    return send(res, 200, { ok: true, removed: list.length - keep.length });
  }
  if (p === '/api/dialog/delete' && m === 'POST') {
    const b = await readBody(req); const id = String(b.id || '');
    if (okId(id)) { try { fs.unlinkSync(path.join(udir(u), id + '.json')); } catch (e) {} dlgSaveIndex(u, dlgIndex(u).filter(x => x.id !== id)); }
    return send(res, 200, { ok: true });
  }

  if (p === '/api/chat' && m === 'POST') { if (!hasAccess(u)) return send(res, 200, { ok: false, error: 'need_pro' }); if ((u.termsV || 0) < TERMS_V) return send(res, 200, { ok: false, error: 'need_terms' }); return chat(req, res, u); }

  // ----- касса Андрея -----
  if (p.startsWith('/api/admin/')) {
    if (!isOwner(u)) return send(res, 200, { ok: false, error: 'not_owner' });
    if (p === '/api/admin/summary') {
      const us = Object.values(db.users), d = today(), mo = d.slice(0, 7);
      let spentDay = 0, spentMonth = 0, topMonth = 0;
      for (const o of db.ops) { const od = msk(o.at); if (o.kind === 'spend') { if (od.slice(0, 10) === d) spentDay -= o.sum; if (od.slice(0, 7) === mo) spentMonth -= o.sum; } if ((o.kind === 'topup' || o.kind === 'credit') && od.slice(0, 7) === mo) topMonth += o.sum; }
      const people = us.map(x => ({ id: x.id, name: x.name, balance: r2(x.balance || 0), today: spentToday(x), blocked: !!x.blocked })).sort((a, b) => b.balance - a.balance);
      const codes = Object.entries(db.codes).filter(([, c]) => !c.usedBy).map(([k, c]) => ({ code: k, sum: c.sum, created: c.created }));
      return send(res, 200, { ok: true, users: us.length, balances: r2(us.reduce((s, x) => s + (x.balance || 0), 0)), spentDay: r2(spentDay), spentMonth: r2(spentMonth), topMonth: r2(topMonth), people, codes, rubPerUnit: RUB_PER_UNIT });
    }
    const b = await readBody(req);
    if (p === '/api/admin/codes' && m === 'POST') {
      const sum = Math.round(Number(b.sum)), n = Math.min(50, Math.max(1, Math.round(Number(b.count) || 1)));
      if (!(sum >= 10 && sum <= 100000)) return send(res, 200, { ok: false, error: 'bad_sum' });
      const out = [];
      for (let i = 0; i < n; i++) {
        const code = 'LURE-' + crypto.randomBytes(6).toString('base64').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4) + '-' + crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 4);
        db.codes[code] = { sum, created: Date.now() }; out.push(code);
      }
      save();
      return send(res, 200, { ok: true, codes: out, sum });
    }
    if (p === '/api/admin/credit' && m === 'POST') {
      const t = user(String(b.id || '').trim()), sum = r2(Number(b.sum));
      if (!t) return send(res, 200, { ok: false, error: 'no_user' });
      if (!sum || Math.abs(sum) > 100000) return send(res, 200, { ok: false, error: 'bad_sum' });
      op(t, 'credit', sum, String(b.note || (sum > 0 ? 'Пополнение от Андрея' : 'Списание')).slice(0, 80));
      return send(res, 200, { ok: true, balance: t.balance });
    }
    if (p === '/api/admin/block' && m === 'POST') {
      const t = user(String(b.id || '').trim()); if (!t) return send(res, 200, { ok: false, error: 'no_user' });
      t.blocked = !!b.blocked; save();
      return send(res, 200, { ok: true });
    }
    if (p === '/api/admin/prices' && m === 'POST') { await loadPrices(true); return send(res, 200, { ok: true, models: Object.keys(PRICES.models).length }); }
  }
  return send(res, 404, { ok: false, error: 'not_found' });
}

// ---------------- чат ----------------
async function chat(req, res, u) {
  const b = await readBody(req, 4e6);
  await loadPrices();
  const model = String(b.model || '');
  if (!PRICES.models[model]) return send(res, 200, { ok: false, error: 'bad_model' });
  const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-40).map(x => ({ role: x.role === 'assistant' ? 'assistant' : x.role === 'system' ? 'system' : 'user', content: String(x.content || '') }));
  if (!msgs.length) return send(res, 200, { ok: false, error: 'empty' });
  const chars = msgs.reduce((s, x) => s + x.content.length, 0);
  if (chars > MAX_IN_CHARS) return send(res, 200, { ok: false, error: 'too_long' });
  if (busy.has(u.id)) return send(res, 200, { ok: false, error: 'busy' });

  // сколько можно потратить: баланс и суточный лимит
  const room = Math.min(u.balance || 0, DAY_LIMIT - spentToday(u));
  const estIn = Math.ceil(chars / 2.5) + 50;
  const inCost = costRub(model, estIn, 0);
  const outPer = costRub(model, 0, 1);
  if (room <= 0) return send(res, 200, { ok: false, error: (u.balance || 0) <= 0 ? 'no_money' : 'day_limit' });
  let maxTok = MAX_OUT;
  if (!PRICES.models[model].perCall) {
    maxTok = Math.floor((room - inCost) / (outPer || 1e-9));
    if (maxTok < 150) return send(res, 200, { ok: false, error: 'no_money' });
    maxTok = Math.min(MAX_OUT, maxTok);
  } else if (costRub(model, 0, 0) > room) return send(res, 200, { ok: false, error: 'no_money' });

  busy.add(u.id);
  let up;
  const ctl = new AbortController();
  req.on('close', () => { if (!res.writableEnded) ctl.abort(); });
  try {
    up = await fetch(NEWAPI + '/v1/chat/completions', {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + NEWAPI_KEY },
      body: JSON.stringify({ model, messages: msgs, stream: true, stream_options: { include_usage: true }, max_tokens: maxTok })
    });
  } catch (e) { busy.delete(u.id); return send(res, 200, { ok: false, error: 'engine_down' }); }
  if (!up.ok || !up.body) {
    busy.delete(u.id);
    const t = await up.text().catch(() => '');
    console.error('engine', up.status, t.slice(0, 300));
    return send(res, 200, { ok: false, error: up.status === 429 ? 'engine_busy' : 'engine_error' });
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
  let usage = null, outChars = 0, buf = '';
  const dec = new TextDecoder();
  try {
    for await (const chunk of up.body) {
      const s = dec.decode(chunk, { stream: true });
      res.write(s);
      buf += s;
      let i;
      while ((i = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim(); if (d === '[DONE]') continue;
        try { const j = JSON.parse(d); if (j.usage && (j.usage.prompt_tokens || j.usage.completion_tokens)) usage = j.usage; const c = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (c) outChars += c.length; } catch (e) {}
      }
    }
  } catch (e) { /* человек закрыл страницу — считаем то, что успело прийти */ }
  const pin = usage ? usage.prompt_tokens || 0 : estIn;
  const pout = usage ? usage.completion_tokens || 0 : Math.ceil(outChars / 2.5);
  let cost = costRub(model, pin, pout);
  cost = Math.max(0.01, r2(cost));
  addSpent(u, cost);
  op(u, 'spend', -cost, model + ' · ' + pin + '+' + pout + ' ток.');
  busy.delete(u.id);
  if (!res.writableEnded) { res.write('event: lure\ndata: ' + JSON.stringify({ cost, balance: u.balance, tokens: { in: pin, out: pout }, estimated: !usage }) + '\n\n'); res.end(); }
}

// ---------------- статика ----------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
function stat(req, res, url) {
  let f = decodeURIComponent(url.pathname);
  if (f === '/' || !path.extname(f)) f = '/index.html';
  const full = path.join(PUBLIC, path.normalize(f).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(PUBLIC)) return send(res, 403, 'no');
  fs.readFile(full, (e, data) => {
    if (e) return send(res, 404, 'not found');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream', 'Cache-Control': /\.(ttf|webp|png)$/.test(full) ? 'public, max-age=604800' : 'no-cache' });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return stat(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 200, { ok: false, error: e.message === 'too_big' ? 'too_long' : 'server_error' });
    else try { res.end(); } catch (x) {}
  }
}).listen(PORT, () => { console.log('LURE on ' + PORT); loadPrices(true); });
