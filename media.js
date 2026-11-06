// LURE: картинки и видео через Polza (/api/v1/media).
// Путь: сервер LURE → шлюз Яндекса polza-api → Polza. Готовый файл функция media-saver кладёт в наше хранилище Яндекса,
// иначе при «белых списках» люди не увидят картинку с серверов Polza.
// Деньги: до запуска резервируем оценку (u.held), списываем только за готовый результат по точной цене Polza × наценка.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = function media(ctx) {
  const { db, ENV, DATA_DIR, op, save, send, readBody, addSpent, spentToday, r2, DAY_LIMIT } = ctx;
  const POLZA = (ENV.POLZA_URL || 'https://d5dlktk1t7njgiu965hg.764nr5vy.apigw.yandexcloud.net/api/v1').replace(/\/$/, '');
  const POLZA_KEY = ENV.POLZA_KEY || '';
  const SAVER = ENV.SAVER_URL || '';             // функция media-saver
  const SAVER_KEY = ENV.SAVER_KEY || '';
  // наценка своя у каждой модели (так LURE не дороже Syntx и Higgsfield); можно поменять в lure.env: MARKUP_NB21=1.8
  const MK = { nb21: 1.66, nbpro: 1.5, gpt26: 1.5, veof: 1.5, veo: 1.5, sd25: 1.5, sd2: 1.5, omni: 1.5, kl3: 1.5, kl26: 1.5 };
  const MAX_JOBS = 3;                            // одновременно у одного человека
  const REF_CHARS = 2.7e6;                       // все фото-референсы вместе, символов base64 (лимит шлюзов Яндекса ~3,5 МБ)

  // ---------- каталог: что показываем людям ----------
  // tiers — запасные цены Polza (₽) на 06.11.2026, свежие подтягиваются из каталога Polza раз в час.
  const CAT = {
    img: [
      { k: 'nb21', eta: 25, id: 'google/gemini-nano-banana-2.1', n: 'Nano Banana 2.1', d: 'Google · быстрая, лучшая цена', refs: 10,
        ar: ['auto', '1:1', '9:16', '16:9', '4:5', '3:4', '4:3', '2:3', '3:2', '21:9'], res: ['1K', '2K', '4K'],
        tiers: [{ c: [], r: 6.75 }, { c: ['image_resolution=1K'], r: 3 }, { c: ['image_resolution=2K'], r: 4.5 }, { c: ['image_resolution=4K'], r: 6.75 }] },
      { k: 'nbpro', eta: 45, id: 'google/gemini-3-pro-image-preview', n: 'Nano Banana Pro', d: 'Google · лучшая для фото и текста на картинке', refs: 8,
        ar: ['auto', '1:1', '9:16', '16:9', '4:5', '3:4', '4:3', '2:3', '3:2', '21:9'], res: ['1K', '2K', '4K'],
        tiers: [{ c: [], r: 13.5 }, { c: ['image_resolution=4K'], r: 18 }] },
      { k: 'gpt26', eta: 70, id: 'openai/gpt-image-2.6-flare', n: 'GPT Image 2.6', d: 'OpenAI · точно следует описанию', refs: 16,
        ar: ['auto', '1:1', '9:16', '16:9', '3:4', '4:3', '2:3', '3:2', '21:9'], q: ['medium', 'high'],
        tok: true, est: { medium: 9, high: 30 } }
    ],
    video: [
      { k: 'veof', eta: 100, id: 'google/veo3_fast', n: 'Veo 3.1 Fast', d: 'Google · кино со звуком, быстро', refs: 3,
        ar: ['16:9', '9:16'], dur: [8], fixed: 45 },
      { k: 'veo', eta: 200, id: 'google/veo3', n: 'Veo 3.1', d: 'Google · лучшее кино-качество со звуком и речью', refs: 2,
        ar: ['16:9', '9:16'], dur: [4, 6, 8], res: ['720p', '1080p', '4k'],
        tiers: [{ c: ['resolution=720p'], r: 187.5 }, { c: ['resolution=1080p'], r: 197.5 }, { c: ['resolution=4k'], r: 277.5 }] },
      { k: 'sd25', eta: 240, id: 'bytedance/seedance-2-5', n: 'Seedance 2.5', d: 'ByteDance · новейшая, длинные ролики до 30 сек', refs: 2,
        ar: ['9:16', '16:9', '1:1', '4:3', '3:4', '21:9'], dur: [5, 10, 15, 20, 30], res: ['480p', '720p'], audio: true, perSec: true,
        tiers: [{ c: ['resolution=480p', 'has_video=false'], r: 18.9 }, { c: ['resolution=720p', 'has_video=false'], r: 42.525 }] },
      { k: 'sd2', eta: 180, id: 'bytedance/seedance-2', n: 'Seedance 2', d: 'ByteDance · живые движения людей', refs: 2,
        ar: ['9:16', '16:9', '1:1', '4:3', '3:4', '21:9'], dur: [5, 10, 15], res: ['480p', '720p', '1080p'], audio: true, perSec: true,
        tiers: [{ c: ['resolution=480p', 'has_video=false'], r: 12.825 }, { c: ['resolution=720p', 'has_video=false'], r: 27.675 }, { c: ['resolution=1080p', 'has_video=false'], r: 68.85 }] },
      { k: 'kl3', eta: 200, id: 'kling/v3', n: 'Kling 3.0', d: 'Kuaishou · лучшая для движения и кино, до 15 сек', refs: 2,
        ar: ['16:9', '9:16', '1:1'], dur: [5, 10, 15], res: ['std', 'pro', '4K'], resKey: 'mode', audio: true, audioKey: 'sound', audioDef: false, perSec: true,
        tiers: [{ c: [], r: 45 }, { c: ['mode=std', 'sound=false'], r: 10 }, { c: ['mode=std', 'sound=true'], r: 14 }, { c: ['mode=pro', 'sound=false'], r: 12 }, { c: ['mode=pro', 'sound=true'], r: 18 }, { c: ['mode=4K'], r: 45 }] },
      { k: 'kl26', eta: 150, id: 'kling/v2.6', n: 'Kling 2.6', d: 'Kuaishou · качественно и дешевле', refs: 1,
        ar: ['16:9', '9:16', '1:1'], dur: [5, 10], audio: true, audioKey: 'sound', audioDef: false,
        tiers: [{ c: [], r: 42 }, { c: ['duration=5', 'sound=false'], r: 42 }, { c: ['duration=10', 'sound=false'], r: 82.5 }, { c: ['duration=5', 'sound=true'], r: 82.5 }, { c: ['duration=10', 'sound=true'], r: 165 }] },
      { k: 'omni', eta: 120, id: 'google/gemini-omni-1.1-flash', n: 'Gemini Omni Flash', d: 'Google · быстро и недорого', refs: 7,
        ar: ['16:9', '9:16'], dur: [4, 6, 8, 10], res: ['720p', '1080p', '4k'], durStr: true,
        tiers: [{ c: ['duration=4', 'has_video=false'], r: 48 }, { c: ['duration=6', 'has_video=false'], r: 63 }, { c: ['duration=8', 'has_video=false'], r: 79 }, { c: ['duration=10', 'has_video=false'], r: 95 },
          { c: ['resolution=4k', 'duration=4', 'has_video=false'], r: 111 }, { c: ['resolution=4k', 'duration=6', 'has_video=false'], r: 126 }, { c: ['resolution=4k', 'duration=8', 'has_video=false'], r: 142 }, { c: ['resolution=4k', 'duration=10', 'has_video=false'], r: 158 }] }
    ]
  };
  const BY = {};
  for (const kind of ['img', 'video']) for (const m of CAT[kind]) { m.kind = kind; BY[m.k] = m; }

  // свежие цены из каталога Polza
  let pricesAt = 0;
  async function refreshPrices() {
    if (Date.now() - pricesAt < 3600e3) return;
    pricesAt = Date.now();
    for (const t of ['image', 'video']) {
      try {
        const r = await fetch(POLZA + '/models?type=' + t, { signal: AbortSignal.timeout(15000) });
        const j = await r.json();
        for (const x of j.data || []) {
          const m = Object.values(BY).find(z => z.id === x.id); if (!m) continue;
          const pr = (x.top_provider && x.top_provider.pricing) || x.pricing || {};
          if (Array.isArray(pr.tiers) && pr.tiers.length) m.tiers = pr.tiers.map(z => ({ c: z.conditions || [], r: Number(z.cost_rub) })).filter(z => isFinite(z.r));
          else if (pr.per_request && isFinite(Number(pr.per_request))) m.fixed = Number(pr.per_request);
          if (pr.unitParam === 'duration') m.perSec = true;
        }
      } catch (e) { pricesAt = Date.now() - 3300e3; }  // не вышло — попробуем через 5 минут
    }
  }
  refreshPrices();

  function polzaInput(m, o) {
    const inp = { prompt: o.prompt };
    if (o.ar && m.ar.includes(o.ar) && o.ar !== 'auto') inp.aspect_ratio = o.ar;
    if (m.kind === 'img') {
      if (m.res && m.res.includes(o.res)) inp.image_resolution = o.res;
      if (m.q && m.q.includes(o.q)) inp.quality = o.q;
    } else {
      if (m.dur.length > 1 || !m.fixed) inp.duration = m.durStr ? String(o.dur) : Number(o.dur);
      if (m.res && m.res.includes(o.res)) inp[m.resKey || 'resolution'] = o.res;
      if (m.audio) inp[m.audioKey || 'generate_audio'] = o.audio !== false;
    }
    return inp;
  }
  // себестоимость Polza по условиям тарифа
  function baseCost(m, o) {
    if (m.tok) return m.est[o.q] || m.est.high;
    if (m.fixed && !m.tiers) return m.fixed;
    const r0 = o.res || (m.res && m.res[0]), snd = String(o.audio !== false && !!m.audio);
    const vals = { image_resolution: r0, resolution: r0, mode: r0, duration: String(o.dur), has_video: 'false', sound: snd, generate_audio: snd, audio: snd };
    if (m.k === 'omni' && !o.res) vals.resolution = '720p';
    let best = null, bestN = -1;
    for (const t of m.tiers || []) {
      const ok = t.c.every(c => { const i = c.indexOf('='); return String(vals[c.slice(0, i)]) === c.slice(i + 1); });
      if (ok && t.c.length > bestN) { best = t; bestN = t.c.length; }
    }
    // Omni: в 1080p цена как 720p (так в тарифе: без условия на разрешение)
    let r = best ? best.r : (m.tiers && m.tiers.length ? Math.max(...m.tiers.map(t => t.r)) : (m.fixed || 0));
    if (m.perSec) r *= Number(o.dur) || 5;
    return r;
  }
  const markup = m => Number(ENV['MARKUP_' + m.k.toUpperCase()] || MK[m.k] || 1.3);
  function price(m, o) { return Math.max(1, Math.ceil(baseCost(m, o) * markup(m))); }

  function clean(m, b) {
    const o = { prompt: String(b.prompt || '').trim().slice(0, 4000) };
    o.ar = m.ar.includes(b.ar) ? b.ar : m.ar[0];
    if (m.res) o.res = m.res.includes(b.res) ? b.res : m.res[0];
    if (m.q) o.q = m.q.includes(b.q) ? b.q : m.q[0];
    if (m.dur) o.dur = m.dur.includes(Number(b.dur)) ? Number(b.dur) : m.dur[0];
    if (m.audio) o.audio = b.audio === undefined ? m.audioDef !== false : b.audio !== false;
    return o;
  }

  // ---------- хранение: задания и галерея ----------
  db.jobs = db.jobs || {};
  const GAL_DIR = path.join(DATA_DIR, 'media');
  fs.mkdirSync(GAL_DIR, { recursive: true });
  const gfile = id => path.join(GAL_DIR, String(id).replace(/[^\w-]/g, '_') + '.json');
  function gal(id) { try { return JSON.parse(fs.readFileSync(gfile(id), 'utf8')); } catch (e) { return []; } }
  function galSave(id, list) { const f = gfile(id); fs.writeFileSync(f + '.tmp', JSON.stringify(list.slice(0, 500))); fs.renameSync(f + '.tmp', f); }
  const heldOf = u => r2(u.held || 0);
  const pubJob = j => ({ id: j.id, kind: j.kind, model: j.n, k: j.k, prompt: j.o.prompt, ar: j.o.ar, dur: j.o.dur, res: j.o.res, status: j.status, price: j.price, cost: j.cost, url: j.url, at: j.at, err: j.err });

  async function polza(method, p, body) {
    const r = await fetch(POLZA + p, { method, headers: { Authorization: 'Bearer ' + POLZA_KEY, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(120000) });
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = { error: { message: 'HTTP ' + r.status } }; }
    if (!r.ok && !j.error) j.error = { message: 'HTTP ' + r.status };
    return j;
  }
  async function keep(src, key) {   // копия готового файла в наше хранилище
    if (!SAVER) return src;
    const r = await fetch(SAVER, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Saver-Key': SAVER_KEY },
      body: JSON.stringify({ url: src, key }), signal: AbortSignal.timeout(180000) });
    const j = await r.json().catch(() => ({}));
    if (!j.url) throw new Error('saver: ' + (j.error || r.status));
    return j.url;
  }

  function finish(j, status, extra) {
    const u = db.users[j.uid]; if (!u) { delete db.jobs[j.id]; return; }
    u.held = r2(Math.max(0, heldOf(u) - j.hold));
    j.status = status; Object.assign(j, extra || {});
    if (status === 'done') {
      addSpent(u, j.cost);
      op(u, 'spend', -j.cost, j.n + ' · ' + (j.kind === 'img' ? 'картинка' : 'видео ' + j.o.dur + ' сек'));
    }
    const list = gal(u.id); const i = list.findIndex(x => x.id === j.id);
    if (status === 'failed') { if (i >= 0) list.splice(i, 1); } else if (i >= 0) list[i] = pubJob(j); else list.unshift(pubJob(j));
    galSave(u.id, list);
    delete db.jobs[j.id];
    if (status === 'failed') {
      db.failed = db.failed || {}; db.failed[j.id] = { uid: j.uid, err: j.err, at: Date.now() };
      const ks = Object.keys(db.failed); if (ks.length > 300) ks.slice(0, ks.length - 300).forEach(k => delete db.failed[k]);
    }
    save();
  }

  const checking = new Set();
  async function check(j) {
    if (checking.has(j.id) || j.status !== 'run') return;
    checking.add(j.id);
    try {
      const r = await polza('GET', '/media/' + encodeURIComponent(j.pid));
      if (r.status === 'completed') {
        const src = r.data && (r.data.url || (Array.isArray(r.data) && r.data[0] && (r.data[0].url || r.data[0])));
        if (!src) return finish(j, 'failed', { err: 'Нет файла в ответе' });
        const ext = (String(src).match(/\.(png|jpe?g|webp|gif|mp4|mov)(\?|$)/i) || [, j.kind === 'img' ? 'png' : 'mp4'])[1].toLowerCase();
        const url = await keep(src, j.uid.replace(/[^\w-]/g, '_') + '/' + j.id + '.' + ext);
        const polzaCost = Number(r.usage && (r.usage.cost_rub ?? r.usage.cost));
        const m = BY[j.k];
        const cost = isFinite(polzaCost) && polzaCost > 0 ? r2(Math.ceil(polzaCost * markup(m) * 100) / 100) : j.price;
        return finish(j, 'done', { url, cost, polzaCost: isFinite(polzaCost) ? polzaCost : null, doneAt: Date.now() });
      }
      if (r.status === 'failed' || r.status === 'cancelled') return finish(j, 'failed', { err: (r.error && r.error.message) || 'Не получилось' });
      if (Date.now() - j.at > (j.kind === 'img' ? 6 : 30) * 60e3) return finish(j, 'failed', { err: 'нейросеть не успела, попробуй ещё раз' });
    } catch (e) {
      j.tries = (j.tries || 0) + 1;
      if (j.tries <= 3 || j.tries % 10 === 0) console.error('media check', j.id, j.k, 'try', j.tries, e.message);
      if (j.tries > 60) finish(j, 'failed', { err: 'Нет связи с Polza' });
    } finally { checking.delete(j.id); }
  }
  setInterval(() => { for (const j of Object.values(db.jobs)) check(j); }, 8000);

  // ---------- API ----------
  return async function route(req, res, p, m, u, gate) {
    if (p === '/api/media/catalog') {
      await refreshPrices().catch(() => {});
      const out = {};
      for (const kind of ['img', 'video']) out[kind] = CAT[kind].map(x => ({ k: x.k, n: x.n, d: x.d, refs: x.refs, ar: x.ar, res: x.res || null, q: x.q || null, dur: x.dur || null, audio: !!x.audio, eta: x.eta || 60, audioDef: x.audioDef !== false,
        table: priceTable(x) }));
      return send(res, 200, { ok: true, cat: out, ready: !!POLZA_KEY });
    }
    if (p === '/api/media/list') {
      const list = gal(u.id);
      const live = Object.values(db.jobs).filter(j => j.uid === u.id).map(pubJob);
      const ids = new Set(live.map(x => x.id));
      return send(res, 200, { ok: true, list: live.concat(list.filter(x => !ids.has(x.id))).slice(0, 300), held: heldOf(u) });
    }
    if (p === '/api/media/delete' && m === 'POST') {
      const b = await readBody(req);
      galSave(u.id, gal(u.id).filter(x => x.id !== String(b.id || '')));
      return send(res, 200, { ok: true });
    }
    if (p === '/api/media/create' && m === 'POST') {
      const g = gate(); if (g) return send(res, 200, { ok: false, error: g });
      if (!POLZA_KEY) return send(res, 200, { ok: false, error: 'media_off' });
      const b = await readBody(req, 4e6);
      const mod = BY[String(b.k || '')];
      if (!mod) return send(res, 200, { ok: false, error: 'bad_model' });
      const o = clean(mod, b);
      if (o.prompt.length < 2) return send(res, 200, { ok: false, error: 'no_prompt' });
      const refs = (Array.isArray(b.refs) ? b.refs : []).slice(0, mod.refs).filter(x => typeof x === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(x));
      if (refs.reduce((s, x) => s + x.length, 0) > REF_CHARS) return send(res, 200, { ok: false, error: 'refs_big' });
      if (Object.values(db.jobs).filter(j => j.uid === u.id).length >= MAX_JOBS) return send(res, 200, { ok: false, error: 'jobs_busy' });
      await refreshPrices().catch(() => {});
      const pr = price(mod, o);
      const hold = mod.tok ? Math.ceil(pr * 2) : pr;   // у GPT Image точная цена зависит от картинки — держим с запасом
      const free = r2((u.balance || 0) - heldOf(u));
      const dayRoom = DAY_LIMIT - spentToday(u) - heldOf(u);
      if (free < hold) return send(res, 200, { ok: false, error: 'no_money', need: hold });
      if (dayRoom < hold) return send(res, 200, { ok: false, error: 'day_limit' });
      const inp = polzaInput(mod, o);
      if (refs.length) inp.images = refs.map(x => ({ type: 'base64', data: x }));
      const id = crypto.randomBytes(9).toString('hex');
      u.held = r2(heldOf(u) + hold); save();
      let r;
      try { r = await polza('POST', '/media', { model: mod.id, input: inp, async: true, user: 'lure-' + u.id }); }
      catch (e) { r = { error: { message: e.message } }; }
      if (!r.id || r.error) {
        u.held = r2(Math.max(0, heldOf(u) - hold)); save();
        console.error('media create', mod.id, JSON.stringify(r).slice(0, 300));
        return send(res, 200, { ok: false, error: 'engine_error', msg: (r.error && r.error.message || '').slice(0, 200) });
      }
      const j = { id, uid: u.id, pid: r.id, k: mod.k, n: mod.n, kind: mod.kind, o, price: pr, hold, at: Date.now(), status: 'run' };
      db.jobs[id] = j; save();
      return send(res, 200, { ok: true, job: pubJob(j), held: heldOf(u) });
    }
    if (p === '/api/media/status') {
      const ids = String(new URL(req.url, 'http://x').searchParams.get('ids') || '').split('.').slice(0, 10);
      const out = [];
      for (const id of ids) {
        const j = db.jobs[id];
        if (j && j.uid === u.id) check(j);   // не ждём: копирование видео идёт в фоне
        const live = db.jobs[id];
        if (live && live.uid === u.id) out.push(pubJob(live));
        else { const g = gal(u.id).find(x => x.id === id); if (g) out.push(g); else if (db.failed && db.failed[id] && db.failed[id].uid === u.id) out.push({ id, status: 'failed', err: db.failed[id].err }); }
      }
      return send(res, 200, { ok: true, jobs: out, balance: u.balance, held: heldOf(u) });
    }
    return null;
  };

  // таблица цен для витрины: человек видит цену до нажатия
  function priceTable(m) {
    const t = {};
    const rs = m.res || [null], qs = m.q || [null], ds = m.dur || [null], as = m.audio ? [true, false] : [null];
    for (const res of rs) for (const q of qs) for (const dur of ds) for (const audio of as) {
      const o = { res, q, dur, audio: audio !== false };
      t[[res || '', q || '', dur || '', audio === null ? '' : audio ? 1 : 0].join('|')] = price(m, o);
    }
    return t;
  }
};
