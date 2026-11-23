// EAGLES FINAL — сервер в Яндекс Облаке (Cloud Functions + YDB + Postbox).
// Логика сервера — тот же файл, что работал в Google (server.js, он же Eagles-final-backend-v17-5.gs.txt).
// Этот файл подменяет ему Google-сервисы:
//   Таблица        → YDB (документная таблица, Document API)
//   Свойства, кэш  → та же таблица (строки _props и _cache)
//   Письма         → Postbox
//   UrlFetchApp    → обычный fetch
// Переменные окружения функции:
//   KEY_ID, KEY_SECRET  статический ключ сервисного аккаунта (роли ydb.editor и postbox.sender)
//   DOCAPI              Document API эндпоинт базы (https://docapi.serverless.yandexcloud.net/ru-central1/…/…)
//   TABLE               имя документной таблицы (по умолчанию eagles)
//   MAIL_FROM           адрес отправителя, например kod@eaglesteam.ru
//   IMPORT_KEY          длинный пароль для переноса данных из Google (после переноса можно стереть)
//   BACKUP_BUCKET       закрытый бакет для ежедневной копии базы (её запускает триггер-таймер раз в сутки)
//   NS                  приставка разделов базы (по умолчанию n18_). 26.10.2026 новая система с чистого листа:
//                       старые данные лежат в той же таблице без приставки и не трогаются (NS='' вернёт их)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const zlib = require('zlib');
const { Worker } = require('worker_threads');

const REGION = 'ru-central1';
const ENV = process.env;
const TABLE = ENV.TABLE || 'eagles';
const NS = ENV.NS === undefined ? 'n18_' : ENV.NS;
const PART = 300000;              // строка длиннее — кладём кусками (у базы предел на размер записи)

// ---------- подпись запросов к Яндексу (AWS SigV4, ключи сервисного аккаунта) ----------
function hmac(k, s) { return crypto.createHmac('sha256', k).update(s).digest(); }
function sha(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function signedFetchArgs(url, service, body, extra) {
  const u = new URL(url);
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const day = now.slice(0, 8);
  const headers = Object.assign({ 'content-type': 'application/json', host: u.host, 'x-amz-date': now }, extra || {});
  const names = Object.keys(headers).map(h => h.toLowerCase()).sort();
  const lower = {}; for (const h in headers) lower[h.toLowerCase()] = String(headers[h]).trim();
  const canon = ['POST', u.pathname || '/', u.search.slice(1),
    names.map(h => h + ':' + lower[h] + '\n').join(''), names.join(';'), sha(body)].join('\n');
  const scope = day + '/' + REGION + '/' + service + '/aws4_request';
  const toSign = ['AWS4-HMAC-SHA256', now, scope, sha(canon)].join('\n');
  let k = hmac('AWS4' + ENV.KEY_SECRET, day); k = hmac(k, REGION); k = hmac(k, service); k = hmac(k, 'aws4_request');
  lower.authorization = 'AWS4-HMAC-SHA256 Credential=' + ENV.KEY_ID + '/' + scope +
    ', SignedHeaders=' + names.join(';') + ', Signature=' + crypto.createHmac('sha256', k).update(toSign).digest('hex');
  delete lower.host;
  return { method: 'POST', headers: lower, body };
}

// ---------- база: документная таблица YDB (id_shard — раздел, id_sort — ключ строки) ----------
const PK = 'id_shard', SK = 'id_sort';
async function db(op, req) {
  const body = JSON.stringify(Object.assign({ TableName: TABLE }, req));
  const r = await fetch(ENV.DOCAPI, signedFetchArgs(ENV.DOCAPI, 'dynamodb', body, {
    'content-type': 'application/x-amz-json-1.0', 'x-amz-target': 'DynamoDB_20120810.' + op }));
  const t = await r.text();
  if (!r.ok) throw new Error('db ' + op + ' ' + r.status + ' ' + t.slice(0, 300));
  return t ? JSON.parse(t) : {};
}
async function dbQuery(p) {
  const out = []; let start;
  do {
    const req = { KeyConditionExpression: '#p = :p', ExpressionAttributeNames: { '#p': PK },
      ExpressionAttributeValues: { ':p': { S: NS + p } } };
    if (start) req.ExclusiveStartKey = start;
    const r = await db('Query', req);
    (r.Items || []).forEach(it => out.push(it));
    start = r.LastEvaluatedKey;
  } while (start);
  return out;
}
function dbPut(p, s, v, e) {
  const Item = { [PK]: { S: NS + p }, [SK]: { S: s }, v: { S: v } };
  if (e) Item.e = { N: String(e) };
  return db('PutItem', { Item });
}
function dbDel(p, s) { return db('DeleteItem', { Key: { [PK]: { S: NS + p }, [SK]: { S: s } } }); }
async function pool(tasks, n) {
  let i = 0;
  const run = async () => { while (i < tasks.length) { const t = tasks[i++]; await t(); } };
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, run));
}

// ---------- лист таблицы: строки в разделе 'sh_<имя>' ----------
async function loadSheet(name) {
  const items = await dbQuery('sh_' + name);
  const rows = [], parts = {};
  for (const it of items) {
    const s = it[SK].S, i = s.indexOf('~');
    if (i === -1) rows.push({ k: s, raw: it.v.S, n: 1 });
    else (parts[s.slice(0, i)] = parts[s.slice(0, i)] || [])[Number(s.slice(i + 1))] = it.v.S;
  }
  rows.sort((a, b) => a.k < b.k ? -1 : a.k > b.k ? 1 : 0);
  for (const r of rows) if (parts[r.k]) { r.n = parts[r.k].length; r.raw += parts[r.k].slice(1).join(''); }
  return { exists: rows.length > 0, rows: rows.map(r => ({ k: r.k, v: JSON.parse(r.raw), n: r.n })) };
}
function rowWrites(name, row) {
  const raw = JSON.stringify(row.v), p = 'sh_' + name, w = [];
  const n = Math.max(1, Math.ceil(raw.length / PART));
  w.push(() => dbPut(p, row.k, raw.slice(0, PART)));
  for (let i = 1; i < n; i++) w.push(() => dbPut(p, row.k + '~' + i, raw.slice(i * PART, (i + 1) * PART)));
  for (let i = n; i < (row.n || 1); i++) w.push(() => dbDel(p, row.k + '~' + i));
  return w;
}

// ---------- ключи строк: по времени, чтобы порядок был как в таблице ----------
let lastKey = '';
function newKey(t) {
  let k = String(t).padStart(15, '0') + String(crypto.randomInt(1e6)).padStart(6, '0');
  if (k <= lastKey) k = lastKey.slice(0, 15) + String(Number(lastKey.slice(15)) + 1).padStart(6, '0');
  return (lastKey = k);
}

// ---------- синхронные вызовы (письмо, Яндекс Диск) через отдельный поток ----------
// Логика сервера писалась под Google, где UrlFetchApp и MailApp ждут ответа. Здесь так же: поток делает
// запрос, а основной ждёт его (до 25 секунд).
const WORKER_CODE = `
const { workerData } = require('worker_threads');
const m = require(workerData.file);
m._task(workerData.task, workerData.args).then(r => r, e => ({ error: String(e && e.message || e) })).then(r => {
  const b = Buffer.from(JSON.stringify(r)), buf = new Uint8Array(workerData.sab, 8);
  const n = Math.min(b.length, buf.length); buf.set(b.subarray(0, n));
  const h = new Int32Array(workerData.sab, 0, 2); h[1] = n; Atomics.store(h, 0, 1); Atomics.notify(h, 0);
});`;
function callSync(task, args) {
  const sab = new SharedArrayBuffer(8 + 4 * 1024 * 1024), h = new Int32Array(sab, 0, 2);
  const w = new Worker(WORKER_CODE, { eval: true, workerData: { file: __filename, task, args, sab } });
  const st = Atomics.wait(h, 0, 0, 25000);
  w.terminate();
  if (st === 'timed-out') return { error: 'timeout' };
  return JSON.parse(Buffer.from(new Uint8Array(sab, 8, h[1])).toString());
}
// Чужие ссылки (превью для Карты): только http(s) на обычные адреса в интернете, не во внутреннюю сеть облака;
// переадресации проверяем сами, ждём до 6 секунд и читаем не больше 300 КБ.
function publicHost(u) {
  let x; try { x = new URL(u); } catch (e) { return false; }
  if (!/^https?:$/.test(x.protocol) || x.username || x.password) return false;
  const h = x.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h.includes('.') || /^(localhost|metadata)|\.(local|internal|localdomain)$/.test(h)) return false;
  if (/^[\d.]+$/.test(h) || h.includes(':')) return false; // адреса цифрами (в т. ч. 169.254.169.254) не берём
  return true;
}
async function safeFetch(a) {
  let url = a.url;
  for (let i = 0; i < 4; i++) {
    if (!publicHost(url)) return { code: 400, text: '' };
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EaglesPreview/1.0)', 'Accept': 'text/html,*/*' } });
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { url = new URL(r.headers.get('location'), url).href; continue; }
    if (!/html/i.test(r.headers.get('content-type') || '')) return { code: r.status, text: '', type: r.headers.get('content-type') || '', url };
    const rd = r.body.getReader(), parts = []; let n = 0;
    while (n < 300000) { const c = await rd.read(); if (c.done) break; parts.push(Buffer.from(c.value)); n += c.value.length; }
    try { rd.cancel(); } catch (e) {}
    return { code: r.status, text: Buffer.concat(parts).toString('utf8').slice(0, 300000), url };
  }
  return { code: 400, text: '' };
}
async function task(name, a) {
  if (name === 'fetch') {
    if (a.safe) return safeFetch(a);
    const r = await fetch(a.url, { method: (a.method || 'get').toUpperCase(), headers: a.headers, body: a.payload });
    return { code: r.status, text: await r.text() };
  }
  if (name === 'put') {   // своя картинка в карте → бакет сайта, папка u/<ID>/
    const r = await s3Put(ENV.IMG_BUCKET || 'app.eaglesteam.ru', a.key, Buffer.from(a.b64, 'base64'), a.type);
    return r.ok ? { ok: true } : { ok: false, error: 'storage ' + r.status + ' ' + (await r.text()).slice(0, 200) };
  }
  if (name === 'del') {
    const r = await s3Put(ENV.IMG_BUCKET || 'app.eaglesteam.ru', a.key, Buffer.alloc(0), '', 'DELETE');
    return { ok: r.ok || r.status === 404 };
  }
  if (name === 'mail') {
    const url = (ENV.POSTBOX || 'https://postbox.cloud.yandex.net') + '/v2/email/outbound-emails';
    const from = a.name ? '=?UTF-8?B?' + Buffer.from(a.name).toString('base64') + '?= <' + ENV.MAIL_FROM + '>' : ENV.MAIL_FROM;
    const body = JSON.stringify({ FromEmailAddress: from, Destination: { ToAddresses: [a.to] },
      Content: { Simple: { Subject: { Data: a.subject, Charset: 'UTF-8' },
        Body: Object.assign({ Text: { Data: a.body || '', Charset: 'UTF-8' } }, a.htmlBody ? { Html: { Data: a.htmlBody, Charset: 'UTF-8' } } : {}) } } });
    const r = await fetch(url, signedFetchArgs(url, 'ses', body));
    const t = await r.text();
    return r.ok ? { ok: true } : { error: 'postbox ' + r.status + ' ' + t.slice(0, 300) };
  }
  throw new Error('unknown task ' + name);
}
module.exports._task = task;

// ---------- Google-сервисы для логики сервера ----------
class NeedSheet { constructor(n) { this.name = n; } }

function cell(x) {
  if (x === undefined || x === null) return '';
  if (x instanceof Date || Object.prototype.toString.call(x) === '[object Date]') return isNaN(x) ? '' : x.toISOString();
  if (typeof x === 'string' && x[0] === "'") return x.slice(1); // как в Таблице: апостроф впереди не хранится
  if (typeof x === 'number' && !isFinite(x)) return '';
  return x;
}

// Готовый расчёт денег (server.js → moneyCalc_) живёт в памяти, пока функция «тёплая»: один расчёт на всех,
// новый — когда поменялись данные (оплата, возврат, заморозка, перестановка) или прошло 10 минут.
const moneyMem = new Map();
const MoneyCache = {
  key(s) { return crypto.createHash('sha1').update(String(s)).digest('hex'); },
  get(k) { const x = moneyMem.get(k); return x && x.e > Date.now() ? x.v : null; },
  put(k, v) { if (moneyMem.size >= 4) moneyMem.clear(); moneyMem.set(k, { v, e: Date.now() + 15 * 60000 }); }
};

function makeServices(R) {
  // R — состояние одного прохода запроса
  function sheetObj(name) {
    const S = R.sheets[name];
    function row(r) {
      while (S.rows.length < r) S.rows.push({ k: newKey(R.t0), v: [], dirty: true, n: 0 });
      return S.rows[r - 1];
    }
    function width() { let w = 0; S.rows.forEach(x => { if (x.v.length > w) w = x.v.length; }); return w; }
    function range(r, c, nr, nc) {
      nr = nr || 1; nc = nc || 1;
      const rg = {
        getValue() { const x = S.rows[r - 1]; const v = x ? x.v[c - 1] : ''; return v === undefined ? '' : v; },
        getValues() {
          const out = [];
          for (let i = 0; i < nr; i++) {
            const x = S.rows[r - 1 + i], line = [];
            for (let j = 0; j < nc; j++) { const v = x ? x.v[c - 1 + j] : ''; line.push(v === undefined ? '' : v); }
            out.push(line);
          }
          return out;
        },
        setValue(v) { const x = row(r); while (x.v.length < c - 1) x.v.push(''); x.v[c - 1] = cell(v); x.dirty = true; return rg; },
        setValues(vals) {
          for (let i = 0; i < vals.length; i++) {
            const x = row(r + i);
            while (x.v.length < c - 1) x.v.push('');
            for (let j = 0; j < vals[i].length; j++) x.v[c - 1 + j] = cell(vals[i][j]);
            x.dirty = true;
          }
          return rg;
        },
        setNumberFormat() { return rg; },
        getRow() { return r; }, getColumn() { return c; }, getNumRows() { return nr; }, getNumColumns() { return nc; }
      };
      return rg;
    }
    return {
      getName() { return name; },
      getLastRow() { return S.rows.length; },
      getLastColumn() { return width(); },
      getDataRange() { return range(1, 1, S.rows.length, width()); },
      getRange(r, c, nr, nc) {
        if (typeof r === 'string') return range(1, 1, S.rows.length, 1); // 'A:A' — только для формата, он не нужен
        return range(r, c, nr, nc);
      },
      appendRow(vals) { S.rows.push({ k: newKey(R.t0), v: vals.map(cell), dirty: true, n: 0 }); return this; }
    };
  }
  const ss = {
    getId() { return 'ydb'; },
    getSheetByName(name) {
      if (!R.sheets[name]) { R.need.push(name); throw new NeedSheet(name); }
      return R.sheets[name].exists ? sheetObj(name) : null;
    },
    insertSheet(name) {
      if (!R.sheets[name]) { R.need.push(name); throw new NeedSheet(name); }
      R.sheets[name].exists = true;
      return sheetObj(name);
    }
  };
  const props = {
    getProperty(k) { return Object.prototype.hasOwnProperty.call(R.props, k) ? R.props[k] : null; },
    setProperty(k, v) { R.props[k] = String(v); R.propsChanged[k] = true; return props; },
    deleteProperty(k) { delete R.props[k]; R.propsChanged[k] = true; return props; },
    getProperties() { return Object.assign({}, R.props); },
    setProperties(o) { for (const k in o) props.setProperty(k, o[k]); return props; }
  };
  const cache = {
    get(k) { const x = R.cache[k]; return x && x.e > R.t0 ? x.v : null; },
    put(k, v, sec) { R.cache[k] = { v: String(v), e: R.t0 + Math.min(Number(sec) || 600, 21600) * 1000 }; R.cacheChanged[k] = true; },
    remove(k) { delete R.cache[k]; R.cacheChanged[k] = true; }
  };
  const lock = { waitLock() {}, tryLock() { return true; }, releaseLock() {}, hasLock() { return true; } };
  function sync(taskName, args) {
    const key = JSON.stringify([taskName, args]);
    if (!(key in R.memo)) R.memo[key] = callSync(taskName, args);
    return R.memo[key];
  }
  function bytes(x) {
    if (Array.isArray(x)) return Buffer.from(x.map(b => b & 0xff));
    return Buffer.from(String(x), 'utf8');
  }
  function signed(buf) { return Array.from(buf, b => b > 127 ? b - 256 : b); }
  return {
    SpreadsheetApp: { openById() { return ss; }, create() { return ss; }, getActiveSpreadsheet() { return ss; } },
    PropertiesService: { getScriptProperties() { return props; } },
    CacheService: { getScriptCache() { return cache; } },
    LockService: { getScriptLock() { return lock; } },
    MailApp: {
      getRemainingDailyQuota() { return 1000; },
      sendEmail(o) {
        const r = sync('mail', { to: o.to, name: o.name || '', subject: o.subject, body: o.body, htmlBody: o.htmlBody || '' });
        if (r.error) { console.error('mail', r.error); throw new Error(r.error); }
      }
    },
    // оповещения Андрею в MAX: копим здесь, отправляем после записи в базу (см. sendNotes)
    Notify: { send(t) { if (R.notes && R.notes.length < 5) R.notes.push(String(t || '').slice(0, 1500)); } },
    // переменные функции, которые можно читать серверу (ключ ИИ для тренажёра)
    Env: { get(k) { return /^YAGPT_/.test(k) ? (ENV[k] || '') : ''; } },
    Storage: {
      put(key, b64, type) { const r = sync('put', { key, b64, type }); if (!r.ok) console.error('img put', r.error); return r; },
      del(key) { return sync('del', { key }); },
      url(key) { return (ENV.IMG_URL || 'https://app.eaglesteam.ru/') + key; }, presign(key, sec) { key = String(key || ''); if (!/^k\/[sa]\/[A-Za-z0-9_.\/-]{1,200}$/.test(key) || /\.\./.test(key) || !ENV.KEY_ID || !ENV.KEY_SECRET) return ''; const host = ENV.S3_HOST || 'storage.yandexcloud.net', b = ENV.IMG_BUCKET || 'app.eaglesteam.ru', now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), day = now.slice(0, 8), scope = day + '/ru-central1/s3/aws4_request', en = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()), pth = '/' + en(b) + '/' + key.split('/').map(en).join('/'), q = 'X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + en(ENV.KEY_ID + '/' + scope) + '&X-Amz-Date=' + now + '&X-Amz-Expires=' + Math.min(900, Math.max(60, Math.floor(+sec) || 900)) + '&X-Amz-SignedHeaders=host', H = (k, d) => crypto.createHmac('sha256', k).update(d).digest(), cr = ['PUT', pth, q, 'host:' + host, '', 'host', 'UNSIGNED-PAYLOAD'].join('\n'), ts = ['AWS4-HMAC-SHA256', now, scope, crypto.createHash('sha256').update(cr).digest('hex')].join('\n'); let k = H('AWS4' + ENV.KEY_SECRET, day); k = H(k, 'ru-central1'); k = H(k, 's3'); k = H(k, 'aws4_request'); return 'https://' + host + pth + '?' + q + '&X-Amz-Signature=' + crypto.createHmac('sha256', k).update(ts).digest('hex'); }
    },
    UrlFetchApp: {
      fetch(url, o) {
        o = o || {};
        const r = sync('fetch', { url, method: o.method, headers: o.headers, payload: o.payload, safe: !!o.safe });
        if (r.error) throw new Error(r.error);
        if (r.code >= 400 && !o.muteHttpExceptions) throw new Error('Request failed ' + r.code);
        return { getResponseCode() { return r.code; }, getContentText() { return r.text; }, getFinalUrl() { return r.url || url; }, getType() { return r.type || ''; } };
      }
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256', MD5: 'md5', SHA_1: 'sha1', SHA_512: 'sha512' },
      computeDigest(alg, v) { return signed(crypto.createHash(alg).update(bytes(v)).digest()); },
      getUuid() { // в повторном проходе — те же значения, чтобы код из письма не поменялся
        const i = R.uuidN++;
        if (!R.uuids[i]) R.uuids[i] = crypto.randomUUID();
        return R.uuids[i];
      },
      base64Encode(v) { return bytes(v).toString('base64'); },
      base64EncodeWebSafe(v) { return bytes(v).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'); },
      base64Decode(s) { return signed(Buffer.from(String(s), 'base64')); },
      base64DecodeWebSafe(s) { return signed(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64')); },
      sleep() {}
    },
    ContentService: {
      MimeType: { JSON: 'application/json', TEXT: 'text/plain' },
      createTextOutput(s) {
        const o = { _text: String(s), _mime: 'text/plain' };
        o.setMimeType = m => { o._mime = m; return o; };
        o.getContent = () => o._text;
        return o;
      }
    },
    Logger: { log() { console.log.apply(console, arguments); } },
    MoneyCache
  };
}

// ---------- логика сервера ----------
const SERVER_FILE = path.join(__dirname, 'server.js');
const script = new vm.Script(fs.readFileSync(SERVER_FILE, 'utf8'), { filename: 'server.js' });
// время в одном запросе одно и то же (повторный проход должен дать тот же результат)
const FREEZE_TIME = `(function (t0) {
  var RD = Date;
  function D() {
    if (!new.target) return RD();
    var a = Array.prototype.slice.call(arguments);
    return a.length ? new (Function.prototype.bind.apply(RD, [null].concat(a)))() : new RD(t0);
  }
  D.prototype = RD.prototype; D.now = function () { return t0; }; D.UTC = RD.UTC; D.parse = RD.parse;
  Date = D;
})`;

// какие листы нужны какому запросу (запоминаем, чтобы грузить сразу)
const hints = {};
const ALWAYS = ['users'];

function parseParams(event) {
  const p = {};
  const q = event.queryStringParameters || {};
  for (const k in q) p[k] = String(q[k]);
  let body = event.body || '';
  if (body && event.isBase64Encoded) body = Buffer.from(body, 'base64').toString('utf8');
  const hd = {}; for (const k in (event.headers || {})) hd[k.toLowerCase()] = event.headers[k];
  const ct = String(hd['content-type'] || '');
  if (body && /multipart\/form-data/i.test(ct)) {
    const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    const b = '--' + (m[1] || m[2]);
    body.split(b).forEach(part => {
      const i = part.indexOf('\r\n\r\n');
      if (i === -1) return;
      const head = part.slice(0, i), nm = head.match(/name="([^"]*)"/i);
      if (!nm) return;
      let val = part.slice(i + 4);
      if (val.endsWith('\r\n')) val = val.slice(0, -2);
      if (!(nm[1] in p)) p[nm[1]] = val;
    });
  } else if (body && !/json/i.test(ct)) {
    new URLSearchParams(body).forEach((v, k) => { if (!(k in p)) p[k] = v; });
  }
  return { p, body, method: String(event.httpMethod || 'GET').toUpperCase() };
}

function out(code, obj, mime) {
  return { statusCode: code, headers: { 'Content-Type': (mime || 'application/json') + '; charset=utf-8',
    'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
    body: typeof obj === 'string' ? obj : JSON.stringify(obj) };
}

async function loadKV(p) {
  const items = await dbQuery(p), o = {};
  for (const it of items) o[it[SK].S] = { v: it.v.S.slice(1), e: it.e ? Number(it.e.N) : 0 };
  return o;
}

// ---------- ежедневная копия базы ----------
// Триггер-таймер раз в сутки вызывает функцию. Вся таблица целиком (все разделы) сжимается и кладётся
// в закрытый бакет BACKUP_BUCKET файлом eagles-ГГГГ-ММ-ДД.json.gz. Старые копии удаляет правило бакета.
function s3Put(bucket, key, buf, ctype, method) {
  const host = (ENV.S3_HOST || 'storage.yandexcloud.net');
  const pathName = '/' + encodeURIComponent(bucket) + '/' + key.split('/').map(encodeURIComponent).join('/');
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''), day = now.slice(0, 8);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  const h = { 'content-type': ctype || 'application/gzip', host, 'x-amz-content-sha256': hash, 'x-amz-date': now };
  const names = Object.keys(h).sort();
  const canon = [method || 'PUT', pathName, '', names.map(n => n + ':' + h[n] + '\n').join(''), names.join(';'), hash].join('\n');
  const scope = day + '/' + REGION + '/s3/aws4_request';
  const toSign = ['AWS4-HMAC-SHA256', now, scope, sha(canon)].join('\n');
  let k = hmac('AWS4' + ENV.KEY_SECRET, day); k = hmac(k, REGION); k = hmac(k, 's3'); k = hmac(k, 'aws4_request');
  const headers = Object.assign({}, h, { authorization: 'AWS4-HMAC-SHA256 Credential=' + ENV.KEY_ID + '/' + scope +
    ', SignedHeaders=' + names.join(';') + ', Signature=' + crypto.createHmac('sha256', k).update(toSign).digest('hex') });
  delete headers.host;
  const proto = /^(localhost|127\.)/.test(host) ? 'http://' : 'https://';
  return fetch(proto + host + pathName, { method: method || 'PUT', headers, body: method === 'DELETE' ? undefined : buf });
}
async function backup() {
  if (!ENV.BACKUP_BUCKET) return { ok: false, error: 'no_backup_bucket' };
  const items = []; let start;
  do {
    const req = { Limit: 500 };
    if (start) req.ExclusiveStartKey = start;
    const r = await db('Scan', req);
    (r.Items || []).forEach(it => items.push(it));
    start = r.LastEvaluatedKey;
  } while (start);
  const at = new Date().toISOString();
  const gz = zlib.gzipSync(Buffer.from(JSON.stringify({ table: TABLE, at, count: items.length, items })));
  const name = 'eagles-' + new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10) + '.json.gz';
  const r = await s3Put(ENV.BACKUP_BUCKET, name, gz);
  if (!r.ok) return { ok: false, error: 'storage ' + r.status + ' ' + (await r.text()).slice(0, 300) };
  return { ok: true, file: name, rows: items.length, bytes: gz.length };
}

// Оповещения Андрею в MAX (бот «EAGLES Сторож»). MAX_TOKEN — из Lockbox storozh-max, MAX_USER — его ID в MAX.
// Не больше 5 с на сообщение; любая ошибка только в лог, ответ сайту не ломает.
async function sendNotes(list) {
  if (!ENV.MAX_TOKEN || !ENV.MAX_USER) return;
  for (const text of list) {
    try {
      const r = await fetch('https://platform-api.max.ru/messages?user_id=' + encodeURIComponent(ENV.MAX_USER), {
        method: 'POST', signal: AbortSignal.timeout(5000),
        headers: { Authorization: ENV.MAX_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (!r.ok) console.error('notify ' + r.status);
    } catch (e) { console.error('notify ' + (e && e.message)); }
  }
}

module.exports.handler = async function (event) {
  // вызов от триггера-таймера (не из браузера): делаем копию базы
  if (event && Array.isArray(event.messages) && !event.httpMethod) {
    const r = await backup();
    console.log('backup ' + JSON.stringify(r));
    return r;
  }
  if (String(event.httpMethod).toUpperCase() === 'OPTIONS') return out(204, '');
  const { p, body, method } = parseParams(event);
  if (p.action === '__import') return importData(p, body);

  const t0 = Date.now();
  const hintKey = method + ':' + (method === 'POST' ? p.type : p.action);
  const want = new Set(ALWAYS.concat(hints[hintKey] || []));
  const loaded = {};
  const [propsKV, cacheKV] = await Promise.all([loadKV('_props'), loadKV('_cache'),
    ...[...want].map(async n => { loaded[n] = await loadSheet(n); })]);
  const props0 = {}; for (const k in propsKV) props0[k] = propsKV[k].v;
  const cache0 = {}, expired = [];
  for (const k in cacheKV) { if (cacheKV[k].e > t0) cache0[k] = cacheKV[k]; else expired.push(k); }

  const memo = {}, uuids = [];
  let R, result;
  for (let pass = 0; pass < 20; pass++) {
    R = { t0, memo, uuids, uuidN: 0, need: [], sheets: {}, props: Object.assign({}, props0), propsChanged: {},
      cache: JSON.parse(JSON.stringify(cache0)), cacheChanged: {}, notes: [] };
    for (const n in loaded) R.sheets[n] = { exists: loaded[n].exists, rows: loaded[n].rows.map(r => ({ k: r.k, v: r.v.slice(), n: r.n })) };
    const ctx = makeServices(R);
    ctx.console = console;
    vm.createContext(ctx);
    vm.runInContext(FREEZE_TIME, ctx)(t0);
    script.runInContext(ctx);
    const e = { parameter: p, parameters: Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [v]])),
      postData: method === 'POST' ? { contents: body, type: 'application/octet-stream' } : undefined };
    let fail = null;
    try { result = method === 'POST' ? ctx.doPost(e) : ctx.doGet(e); } catch (err) { fail = err; }
    // нужен лист, которого ещё нет в памяти: загружаем и проходим запрос заново (ничего ещё не записано)
    if (R.need.length) {
      await Promise.all([...new Set(R.need)].map(async n => { loaded[n] = await loadSheet(n); }));
      continue;
    }
    if (fail) { console.error(fail && fail.stack || fail); return out(200, { ok: false, error: 'server_error' }); }
    break;
  }
  if (R.need.length) return out(200, { ok: false, error: 'server_error' });
  // листы переписки (c_…, in_…) и личные карты (map_…) у каждого свои — их не запоминаем, иначе тёплая функция копила бы чужие
  hints[hintKey] = Object.keys(loaded).filter(n => ALWAYS.indexOf(n) === -1 && !/^(c|in|map|img|kop)_|^lure_(?!day$)/.test(n));

  // записываем изменения
  const writes = [];
  for (const n in R.sheets) for (const r of R.sheets[n].rows) if (r.dirty) writes.push(...rowWrites(n, r));
  for (const k in R.propsChanged) {
    if (k in R.props) writes.push(() => dbPut('_props', k, '=' + R.props[k]));
    else writes.push(() => dbDel('_props', k));
  }
  for (const k in R.cacheChanged) {
    if (k in R.cache) writes.push(() => dbPut('_cache', k, '=' + R.cache[k].v, R.cache[k].e));
    else writes.push(() => dbDel('_cache', k));
  }
  expired.slice(0, 20).forEach(k => { if (!R.cacheChanged[k]) writes.push(() => dbDel('_cache', k)); });
  await pool(writes, 8);
  if (R.notes && R.notes.length) await sendNotes(R.notes);

  if (result && typeof result.getContent === 'function') return out(200, result.getContent(), result._mime);
  return out(200, result === undefined ? '' : String(result), 'text/plain');
};

// ---------- перенос данных из Google ----------
// POST ?action=__import, тело JSON: { key, sheet, rows:[[...]...], first:true } или { key, props:{...} }
async function importData(p, body) {
  let d;
  try { d = JSON.parse(body); } catch (e) { return out(200, { ok: false, error: 'bad_json' }); }
  if (!ENV.IMPORT_KEY || ENV.IMPORT_KEY.length < 20 || d.key !== ENV.IMPORT_KEY) return out(200, { ok: false, error: 'auth' });
  if (d.props) {
    await pool(Object.keys(d.props).map(k => () => dbPut('_props', k, '=' + String(d.props[k]))), 8);
    return out(200, { ok: true, props: Object.keys(d.props).length });
  }
  const name = String(d.sheet || '');
  if (!/^[a-z_]{2,20}$/.test(name)) return out(200, { ok: false, error: 'bad_sheet' });
  if (d.first) {
    const old = await dbQuery('sh_' + name);
    await pool(old.map(it => () => dbDel('sh_' + name, it[SK].S)), 8);
  }
  const base = Number(d.offset || 0);
  const writes = [];
  (d.rows || []).forEach((v, i) => {
    // ключ = номер строки в таблице, порядок тот же; новые строки после переноса пойдут по времени (они больше)
    const k = String(base + i + 1).padStart(21, '0');
    writes.push(...rowWrites(name, { k, v: v.map(cell), n: 1 }));
  });
  await pool(writes, 8);
  return out(200, { ok: true, sheet: name, rows: writes.length && (d.rows || []).length });
}
