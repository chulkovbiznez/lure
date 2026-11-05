// Пульт EAGLES — помощник Андрея. Видит только владелец (OWNER_IDS).
// Читает цифры EAGLES, LURE, New API и Polza, отвечает на вопросы и каждое утро делает сводку (текст + голос).
// ВАЖНО: Пульт ничего не меняет. С сервером EAGLES он вызывает ТОЛЬКО действия из READ_ONLY ниже.
'use strict';
const fs = require('fs');
const path = require('path');

// единственные действия сервера EAGLES, которые Пульт может вызывать (все только читают)
const READ_ONLY = new Set(['adm_kassa', 'adm_users', 'adm_pays']);

module.exports = function makePult(ctx) {
  const { db, eagles, NEWAPI, NEWAPI_KEY, msk, today, r2, readBody, send, DATA_DIR, loadPrices, prices, costRub, ENV } = ctx;
  const DIR = path.join(DATA_DIR, 'pult');
  fs.mkdirSync(DIR, { recursive: true });
  const STATE = path.join(DIR, 'state.json');
  let st = { es: '', esAt: 0, seen: {}, seenStart: '', pays: {}, reports: {}, log: [] };
  try { st = Object.assign(st, JSON.parse(fs.readFileSync(STATE, 'utf8'))); } catch (e) {}
  let saveT = null;
  const saveSt = () => { if (saveT) return; saveT = setTimeout(() => { saveT = null; fs.writeFileSync(STATE + '.tmp', JSON.stringify(st)); fs.renameSync(STATE + '.tmp', STATE); }, 300); };

  const REPORT_HOUR = Number(ENV.PULT_REPORT_HOUR || 9);           // утренняя сводка, час по Москве
  const NA_TOKEN = ENV.NEWAPI_ADMIN_TOKEN || '', NA_USER = ENV.NEWAPI_ADMIN_ID || '1';
  const POLZA_KEY = ENV.POLZA_KEY || '', POLZA_BAL = ENV.POLZA_BALANCE_URL || 'https://polza.ai/api/v1/balance';
  const RUB_PER_UNIT = Number(ENV.RUB_PER_UNIT || 100), QPU = 500000;
  const day = t => msk(t).slice(0, 10);
  const dmy = t => t ? day(t) : '';

  // ---------- EAGLES: только чтение, ключом входа Андрея ----------
  async function eRead(action, extra) {
    if (!READ_ONLY.has(action)) throw new Error('not_read_only');
    if (!st.es) return { ok: false, error: 'no_session' };
    const r = await eagles(Object.assign({ action, sess: st.es }, extra || {}));
    if (r && r.error === 'auth') { st.es = ''; saveSt(); }
    return r || { ok: false };
  }
  async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const x = items[i++]; try { await fn(x); } catch (e) {} } })); }

  async function eaglesData() {
    if (!st.es) return { error: 'Нет входа Андрея: открой LURE и Пульт, тогда Пульт снова увидит EAGLES.' };
    const [k, us] = await Promise.all([eRead('adm_kassa'), eRead('adm_users')]);
    if (!k.ok || !us.ok) return { error: 'EAGLES не ответил: ' + ((k.error || us.error) || 'нет связи') };
    // когда человек впервые появился (у EAGLES нет даты в списке, поэтому ведём сами)
    const t = today(); let first = !st.seenStart;
    if (first) st.seenStart = t;
    for (const x of us.list) if (!st.seen[x.id]) st.seen[x.id] = first ? 'до ' + t : t;
    // оплаты каждого, кто хоть раз платил; перечитываем, когда меняется срок или раз в сутки
    const need = us.list.filter(x => x.until > 0 && x.id !== '11111' && (!st.pays[x.id] || st.pays[x.id].until !== x.until || Date.now() - st.pays[x.id].at > 86400000));
    await pool(need.slice(0, 150), 4, async x => { const r = await eRead('adm_pays', { id: x.id }); if (r.ok) st.pays[x.id] = { until: x.until, at: Date.now(), list: r.list || [] }; });
    saveSt();
    const name = {}; us.list.forEach(x => name[x.id] = x.name);
    const pays = [];
    for (const id in st.pays) for (const p of st.pays[id].list) pays.push({ id, name: name[id] || id, date: day(p.at), sum: p.sum, pkg: p.pkg, status: p.st === 'refund' ? 'возврат ' + p.part : 'оплачено', test: !p.prod });
    pays.sort((a, b) => a.date < b.date ? 1 : -1);
    const now = Date.now();
    return {
      kassa: { incomeToday: k.income.day, incomeMonth: k.income.month, incomeYear: k.income.year, incomeAll: k.income.all, refunds: k.income.refunds, paymentsCount: k.income.payments,
        owedToPartners: k.owe, maybeOwed: k.maybe, freeMoney: k.free, payoutNextSaturday: k.payNext, payoutPeople: k.payPeople, statuses: k.totals,
        ausnYear: k.ausn, usersTotal: k.users, proActive: k.pro, incomeByDay30: k.days, unlockByDay: k.unlock,
        partnersTop: (k.people || []).slice(0, 30).map(p => ({ id: p.id, name: p.name, total: p.sum, ready: p.ok, hold: p.wait, noTaxStatus: p.tax0, needSub: p.sub, tax: p.tax || 'нет' })) },
      users: us.list.filter(x => x.id !== '11111').map(x => ({ id: x.id, name: x.name, pro: x.pro, paidUntil: dmy(x.until), stoppedPaying: !x.pro && x.until > 0 && x.until < now, frozen: !!x.fz, sponsor: x.sponsor, side: x.s, firstSeen: st.seen[x.id] })),
      payments: pays.slice(0, 400),
      note: 'Пакеты: E1 199 ₽ (1 мес), E6 999 ₽ (6 мес), E12 1690 ₽ (12 мес). firstSeen — день, когда Пульт впервые увидел человека (Пульт ведёт учёт с ' + st.seenStart + '). test=true — тестовая оплата.'
    };
  }

  // ---------- LURE: свой журнал ----------
  function lureData() {
    const us = Object.values(db.users), from = Date.now() - 30 * 86400000;
    const days = {}, models = {}, people = {};
    for (const o of db.ops) {
      if (o.at < from) continue;
      const d = day(o.at), D = days[d] || (days[d] = { bought: 0, spent: 0 });
      if (o.kind === 'spend') { D.spent -= o.sum; const m = String(o.note || '').split(' · ')[0]; models[m] = (models[m] || 0) - o.sum; people[o.id] = (people[o.id] || 0) - o.sum; }
      if (o.kind === 'gift' || o.kind === 'credit' || o.kind === 'topup') D.bought += o.sum;
    }
    for (const d in days) { days[d].bought = r2(days[d].bought); days[d].spent = r2(days[d].spent); }
    for (const m in models) models[m] = r2(models[m]);
    const gr = prices().group || 1;
    return {
      users: us.length, newByDay: us.reduce((a, x) => { if (x.created > from) { const d = day(x.created); a[d] = (a[d] || 0) + 1; } return a; }, {}),
      balancesTotal: r2(us.reduce((s, x) => s + (x.balance || 0), 0)), byDay30: days, spentByModel30: models,
      topSpenders30: Object.entries(people).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([id, s]) => ({ id, name: (db.users[id] || {}).name || id, spent: r2(s) })),
      unusedCodes: Object.values(db.codes).filter(c => !c.usedBy).reduce((s, c) => s + c.sum, 0),
      note: 'bought — пополнения (проданные коды и ручные). spent — списано с людей по цене LURE. Себестоимость у Polza примерно spent / ' + gr + ' (наценка группы ' + gr + ').'
    };
  }

  // ---------- New API: расход по движку ----------
  async function newapiData() {
    if (!NA_TOKEN) return { error: 'не подключено (нужен системный токен New API)' };
    const H = { Authorization: NA_TOKEN, 'New-Api-User': NA_USER };
    const now = Math.floor(Date.now() / 1000), dayStart = Math.floor(Date.parse(today() + 'T00:00:00+03:00') / 1000);
    const per = { today: [dayStart, now], yesterday: [dayStart - 86400, dayStart], days7: [now - 7 * 86400, now], days30: [now - 30 * 86400, now] };
    const out = {};
    for (const k in per) {
      try {
        const r = await fetch(NEWAPI + '/api/log/stat?type=2&start_timestamp=' + per[k][0] + '&end_timestamp=' + per[k][1], { headers: H, signal: AbortSignal.timeout(10000) });
        const j = await r.json();
        out[k] = j.success ? { rub: r2((j.data.quota || 0) / QPU * RUB_PER_UNIT), rpm: j.data.rpm, tpm: j.data.tpm } : { error: j.message || 'ошибка' };
      } catch (e) { out[k] = { error: 'нет связи' }; }
    }
    out.note = 'rub — расход по ценам New API (с наценкой группы), переведённый в рубли.';
    return out;
  }
  async function polzaData() {
    if (!POLZA_KEY) return { error: 'не подключено (нужен ключ Polza)' };
    try {
      const r = await fetch(POLZA_BAL, { headers: { Authorization: 'Bearer ' + POLZA_KEY }, signal: AbortSignal.timeout(10000) });
      const j = await r.json();
      return { balance: j, note: 'ответ Polza как есть, в рублях' };
    } catch (e) { return { error: 'Polza не ответила' }; }
  }

  let cache = null, cacheAt = 0;
  async function collect(force) {
    if (!force && cache && Date.now() - cacheAt < 10 * 60000) return cache;
    const [e, na, pz] = await Promise.all([eaglesData().catch(x => ({ error: x.message })), newapiData(), polzaData()]);
    cache = { now: msk().slice(0, 16).replace('T', ' ') + ' МСК', eagles: e, lure: lureData(), newapi: na, polza: pz, yandex: { error: 'пока не подключено' } };
    cacheAt = Date.now();
    return cache;
  }

  // ---------- мозг: Claude через New API ----------
  async function pickModel() {
    await loadPrices();
    if (ENV.PULT_MODEL) return ENV.PULT_MODEL;
    const ids = Object.keys(prices().models);
    return ids.find(x => /claude.*sonnet|sonnet/i.test(x)) || ids.find(x => /claude/i.test(x)) || ids[0];
  }
  const SYS = 'Ты — Пульт EAGLES, личный помощник Андрея Чулкова, владельца EAGLES (сайт app.eaglesteam.ru, сетевой бизнес с бинаром) и LURE (сервис нейросетей для его партнёров). ' +
    'Отвечай по-русски, коротко и по делу, живым разговорным языком: ответ часто слушают голосом, поэтому без таблиц, звёздочек и markdown, числа пиши словами-понятно (например «12 400 рублей»). ' +
    'Опирайся ТОЛЬКО на данные ниже. Если нужных данных нет или источник не подключён — честно скажи, чего не хватает. Не выдумывай цифры. Даты — по Москве. ' +
    'Ты ничего не можешь менять ни на сайте, ни в деньгах. Если видишь, что стоит что-то сделать (оплатить, написать человеку, поправить цену), предложи это словами «Предлагаю: …», решает Андрей. ' +
    'Можешь давать идеи по росту, рекламе и удержанию людей, но отделяй их от фактов.';
  async function llm(messages, maxTok) {
    const model = await pickModel();
    if (!model) throw new Error('no_model');
    const r = await fetch(NEWAPI + '/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + NEWAPI_KEY },
      body: JSON.stringify({ model, messages, max_tokens: maxTok || 1500 }), signal: AbortSignal.timeout(180000)
    });
    const j = await r.json().catch(() => ({}));
    const text = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!text) throw new Error('engine_error');
    const u = j.usage || {};
    const cost = r2(costRub(model, u.prompt_tokens || 0, u.completion_tokens || 0) || 0);
    return { text: String(text).trim(), model, cost };
  }
  function ctxMsg(data) { return 'ДАННЫЕ на ' + data.now + ' (JSON):\n' + JSON.stringify(data); }

  async function ask(q, hist) {
    const data = await collect();
    const msgs = [{ role: 'system', content: SYS + '\n\n' + ctxMsg(data) }];
    (hist || []).slice(-10).forEach(h => msgs.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '').slice(0, 4000) }));
    msgs.push({ role: 'user', content: q });
    const r = await llm(msgs);
    st.log.unshift({ at: Date.now(), q: q.slice(0, 500), a: r.text.slice(0, 2000), cost: r.cost });
    if (st.log.length > 300) st.log.length = 300;
    saveSt();
    return r;
  }

  // ---------- голос ----------
  async function audioModels() {
    try {
      const m = await fetch(NEWAPI + '/v1/models', { headers: { Authorization: 'Bearer ' + NEWAPI_KEY }, signal: AbortSignal.timeout(8000) });
      return ((await m.json()).data || []).map(x => x.id);
    } catch (e) { return []; }
  }
  async function tts(text) {
    const ids = await audioModels();
    const model = ENV.PULT_TTS_MODEL || ids.find(x => /eleven/i.test(x) && !/effect|sound|stt|scribe/i.test(x)) || ids.find(x => /tts/i.test(x));
    if (!model) return null;
    const r = await fetch(NEWAPI + '/v1/audio/speech', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + NEWAPI_KEY },
      body: JSON.stringify({ model, input: text.slice(0, 4000), voice: ENV.PULT_VOICE || 'onyx', response_format: 'mp3' }), signal: AbortSignal.timeout(120000)
    });
    if (!r.ok || !/audio|octet/.test(r.headers.get('content-type') || '')) { console.error('pult tts', r.status, (await r.text().catch(() => '')).slice(0, 200)); return null; }
    return Buffer.from(await r.arrayBuffer());
  }
  async function stt(b64, mime) {
    const ids = await audioModels();
    const model = ENV.PULT_STT_MODEL || ids.find(x => /whisper|transcri|scribe|stt/i.test(x));
    if (!model) return null;
    const fd = new FormData();
    fd.append('file', new Blob([Buffer.from(b64, 'base64')], { type: mime || 'audio/webm' }), 'q.' + (/mp4|m4a|aac/.test(mime) ? 'm4a' : /ogg/.test(mime) ? 'ogg' : 'webm'));
    fd.append('model', model); fd.append('language', 'ru');
    const r = await fetch(NEWAPI + '/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: 'Bearer ' + NEWAPI_KEY }, body: fd, signal: AbortSignal.timeout(60000) });
    const j = await r.json().catch(() => ({}));
    return j.text ? String(j.text).trim() : null;
  }

  // ---------- утренняя сводка ----------
  let making = false;
  async function makeReport() {
    if (making) return; making = true;
    try {
      const data = await collect(true);
      const r = await llm([{ role: 'system', content: SYS + '\n\n' + ctxMsg(data) }, { role: 'user', content:
        'Сделай утреннюю голосовую сводку для Андрея на полторы-две минуты чтения. Порядок: 1) деньги EAGLES: доход вчера, за месяц, возвраты, сколько должен партнёрам и сколько выплата в субботу; ' +
        '2) люди: сколько всего, сколько PRO, кто новый за сутки и за неделю, кто перестал платить; 3) LURE: сколько купили и потратили вчера, какие модели, остаток у людей; ' +
        '4) расходы: New API, Polza, что скоро надо оплатить; 5) проблемы и что не подключено; 6) одна-две идеи на сегодня. Начни с «Доброе утро, Андрей».' }], 1800);
      const d = today();
      st.reports[d] = { at: Date.now(), text: r.text, cost: r.cost, audio: false };
      const keep = Object.keys(st.reports).sort().slice(-30); for (const k in st.reports) if (keep.indexOf(k) < 0) { delete st.reports[k]; try { fs.unlinkSync(path.join(DIR, 'report-' + k + '.mp3')); } catch (e) {} }
      saveSt();
      const a = await tts(r.text).catch(() => null);
      if (a) { fs.writeFileSync(path.join(DIR, 'report-' + d + '.mp3'), a); st.reports[d].audio = true; saveSt(); }
    } catch (e) { console.error('pult report', e.message); }
    finally { making = false; }
  }
  setInterval(() => {
    const h = Number(msk().slice(11, 13));
    if (NEWAPI_KEY && h >= REPORT_HOUR && !st.reports[today()] && !making) makeReport();
  }, 60000);

  // ---------- API /api/pult/* (вызывается только для владельца) ----------
  async function handle(p, m, req, res, S) {
    if (S && S.es && S.es !== st.es) { st.es = S.es; st.esAt = Date.now(); saveSt(); }   // ключ входа Андрея для чтения EAGLES
    if (p === '/api/pult/state') {
      const d = Object.keys(st.reports).sort().pop();
      const rep = d ? Object.assign({ date: d }, st.reports[d]) : null;
      return send(res, 200, { ok: true, report: rep, making, engine: !!NEWAPI_KEY, sources: { eagles: !!st.es, newapi: !!NA_TOKEN, polza: !!POLZA_KEY, yandex: false }, log: st.log.slice(0, 20) });
    }
    if (p === '/api/pult/ask' && m === 'POST') {
      if (!NEWAPI_KEY) return send(res, 200, { ok: false, error: 'no_engine' });
      const b = await readBody(req, 2e6), q = String(b.q || '').trim().slice(0, 2000);
      if (!q) return send(res, 200, { ok: false, error: 'empty' });
      const r = await ask(q, Array.isArray(b.hist) ? b.hist : []);
      return send(res, 200, { ok: true, answer: r.text, cost: r.cost });
    }
    if (p === '/api/pult/tts' && m === 'POST') {
      const b = await readBody(req), a = await tts(String(b.text || '')).catch(() => null);
      return send(res, 200, a ? { ok: true, audio: a.toString('base64'), mime: 'audio/mpeg' } : { ok: false, error: 'no_tts' });
    }
    if (p === '/api/pult/stt' && m === 'POST') {
      const b = await readBody(req, 3e6), t = await stt(String(b.audio || ''), String(b.mime || '')).catch(() => null);
      return send(res, 200, t ? { ok: true, text: t } : { ok: false, error: 'no_stt' });
    }
    if (p === '/api/pult/report' && m === 'POST') {
      if (!NEWAPI_KEY) return send(res, 200, { ok: false, error: 'no_engine' });
      makeReport();
      return send(res, 200, { ok: true, making: true });
    }
    if (p === '/api/pult/audio') {
      const d = String(new URL(req.url, 'http://x').searchParams.get('d') || '');
      if (!/^\d{4}-\d\d-\d\d$/.test(d)) return send(res, 200, { ok: false });
      try { return send(res, 200, { ok: true, audio: fs.readFileSync(path.join(DIR, 'report-' + d + '.mp3')).toString('base64'), mime: 'audio/mpeg' }); }
      catch (e) { return send(res, 200, { ok: false, error: 'no_audio' }); }
    }
    if (p === '/api/pult/data') return send(res, 200, { ok: true, data: await collect(true) });
    return send(res, 404, { ok: false, error: 'not_found' });
  }
  return { handle };
};
