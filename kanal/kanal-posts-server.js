// ===================== KANAL POSTS v1 (2026-11-16) =====================
// Огоньки, комментарии и Swoop под постами канала EYRIE (kanal.html). Счётчики общие для всех.
// Правила Андрея 06.11/16.11: гость только смотрит и читает; зарегистрированный — огонёк;
// Pro (и Андрей) — комментарий и Swoop. Пост = канал (ID владельца) + имя поста, например 11111 / klod-k-hromu.
// Листы: kp_act (Ch, Post, Id, Kind l|s|-l, At) и kp_com (Ch, Post, Id, Name, Text, At, Del).
// Действия (GET). Без входа: kp_get, kp_coms. С входом (sess): kp_like, kp_com, kp_swoop, kp_cdel.
//   kp_get&ch=11111&ids=a,b,c      → { posts: { a:{l,c,s,my,sw} } }   (my/sw — только если передан sess)
//   kp_coms&ch=11111&p=a           → { items:[{k,id,name,text,ts,mine}] } (до 200 последних)
//   kp_like&ch=&p=&on=1|0          → { l, my }
//   kp_com&ch=&p=&text=            → { ok, item }   (Pro; до 500 знаков; не чаще 20 в час)
//   kp_swoop&ch=&p=                → { s, sw }      (Pro; один раз на пост)
//   kp_cdel&ch=&p=&k=              → удалить комментарий (автор или владелец канала)
// Свой канал у каждого Pro (Андрей 16.11: «для Pro сразу канал пустой с заготовкой и открывается»):
//   kp_ch&ch=ID                    → { ch:{id,name,av,pro,hello}, posts:[{p,text,url,ts}] } (без входа)
//   kp_add&text=&url=              → новый пост в СВОЁМ канале (Pro; до 2000 знаков; видео — ссылка VK Видео/Rutube/YouTube)
//   kp_del&p=                      → убрать свой пост
//   kp_hello&text=                 → свой текст приветствия (закреплённый первый пост)
// Лист kp_ch: (Ch, Post, Text, Url, At, Del); приветствие хранится как пост 'start'.
// В диспетчер добавлена одна строка рядом с v_open (до проверки входа).
var KP_COM_MAX = 500, KP_COM_PER_HOUR = 20, KP_LIKE_PER_MIN = 30;
function kpActSheet_() { return getSheet_('kp_act', ['Ch', 'Post', 'Id', 'Kind', 'At']); }
function kpChSheet_() { return getSheet_('kp_ch', ['Ch', 'Post', 'Text', 'Url', 'At', 'Del']); }
var KP_TEXT_MAX = 2000, KP_POSTS_PER_DAY = 20;
function kpUrl_(v) {
  v = String(v || '').trim();
  if (!v) return '';
  return /^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be))\/[^\s"'<>]{1,300}$/i.test(v) ? v : null;
}
function kpComSheet_() { return getSheet_('kp_com', ['Ch', 'Post', 'Id', 'Name', 'Text', 'At', 'Del']); }
function kpPost_(v) { v = String(v || '').trim().toLowerCase(); return /^[a-z0-9-]{1,40}$/.test(v) ? v : ''; }
function kpCh_(v) { var c = normRef_(v) || OWNER_ID; return validId_(c) ? c : ''; }
function kpRate_(key, max, sec) {
  var cache = CacheService.getScriptCache(), n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), sec);
  return true;
}
function kanalPosts_(action, e, p) {
  var ch = kpCh_(p.ch);
  if (!ch) return jsonOut_({ ok: false, error: 'bad_ch' });
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }

  if (action === 'kp_ch') {
    var UU = usersLite_();
    if (!UU[ch] || UU[ch].frozen) return jsonOut_({ ok: false, error: 'not_found' });
    var rows = kpChSheet_().getDataRange().getValues(), posts = [], hello = '';
    for (var q = 1; q < rows.length; q++) {
      if (String(rows[q][0]) !== ch || String(rows[q][5]) === '1') continue;
      var pt = { p: String(rows[q][1]), text: String(rows[q][2] || '').replace(/^'/, ''), url: String(rows[q][3] || ''), ts: Number(rows[q][4]) || 0 };
      if (pt.p === 'start') hello = pt.text; else posts.push(pt);
    }
    posts.sort(function (x, y) { return y.ts - x.ts; });
    return jsonOut_({ ok: true, ch: { id: ch, name: UU[ch].name, av: UU[ch].av, pro: ch === OWNER_ID || active_(UU, ch), hello: hello }, posts: posts.slice(0, 200) });
  }

  if (action === 'kp_get') {
    var ids = String(p.ids || '').split(',').map(kpPost_).filter(String).slice(0, 80), want = {}, out = {};
    ids.forEach(function (x) { want[x] = 1; out[x] = { l: 0, c: 0, s: 0, my: false, sw: false }; });
    var a = kpActSheet_().getDataRange().getValues();
    for (var i = 1; i < a.length; i++) {
      if (String(a[i][0]) !== ch || !want[a[i][1]]) continue;
      var o = out[a[i][1]], who = normId_(a[i][2]);
      if (a[i][3] === 'l') { o.l++; if (who === me) o.my = true; }
      else if (a[i][3] === 's') { o.s++; if (who === me) o.sw = true; }
    }
    var c = kpComSheet_().getDataRange().getValues();
    for (var j = 1; j < c.length; j++) if (String(c[j][0]) === ch && want[c[j][1]] && String(c[j][6]) !== '1') out[c[j][1]].c++;
    return jsonOut_({ ok: true, posts: out });
  }

  if (action === 'kp_add' || action === 'kp_hello' || action === 'kp_del') return kpChEdit_(action, e, p);

  var post = kpPost_(p.p);
  if (!post) return jsonOut_({ ok: false, error: 'bad_post' });

  if (action === 'kp_coms') {
    var d = kpComSheet_().getDataRange().getValues(), items = [];
    for (var k = 1; k < d.length; k++) {
      if (String(d[k][0]) !== ch || String(d[k][1]) !== post || String(d[k][6]) === '1') continue;
      var cid = normId_(d[k][2]);
      items.push({ k: k + 1, id: cid, name: String(d[k][3] || ''), text: String(d[k][4] || '').replace(/^'/, ''), ts: Number(d[k][5]) || 0, mine: !!me && (cid === me || me === ch) });
    }
    return jsonOut_({ ok: true, items: items.slice(-200) });
  }

  if (!me) return noAuth_();
  if (frozenAt_(me)) return frozenOut_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  var pro = me === OWNER_ID || active_(U, me);

  if (action === 'kp_like' || action === 'kp_swoop') {
    var kind = action === 'kp_like' ? 'l' : 's', on = action === 'kp_swoop' || String(p.on) === '1';
    if (kind === 's' && !pro) return jsonOut_({ ok: false, error: 'need_pro' });
    if (!kpRate_('KPL_' + me, KP_LIKE_PER_MIN, 60)) return jsonOut_({ ok: false, error: 'limit' });
    var sh = kpActSheet_();
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      // строки не удаляются: снятый огонёк помечается '-l' и при новом нажатии возвращается в 'l'
      var v = sh.getDataRange().getValues(), row = 0, old = 0, n = 0;
      for (var r = 1; r < v.length; r++) {
        if (String(v[r][0]) !== ch || String(v[r][1]) !== post) continue;
        var mine = normId_(v[r][2]) === me;
        if (v[r][3] === kind) { n++; if (mine) row = r + 1; }
        else if (v[r][3] === '-' + kind && mine) old = r + 1;
      }
      if (on && !row) { if (old) sh.getRange(old, 4, 1, 2).setValues([[kind, Date.now()]]); else sh.appendRow([ch, post, me, kind, Date.now()]); n++; }
      else if (!on && row) { sh.getRange(row, 4).setValue('-' + kind); n--; }
      return jsonOut_(kind === 'l' ? { ok: true, l: n, my: on } : { ok: true, s: n, sw: true });
    } finally {
      lock.releaseLock();
    }
  }

  if (action === 'kp_com') {
    if (!pro) return jsonOut_({ ok: false, error: 'need_pro' });
    var text = String(p.text || '').replace(/\s+/g, ' ').trim().slice(0, KP_COM_MAX);
    if (!text) return jsonOut_({ ok: false, error: 'empty' });
    if (me !== OWNER_ID && !kpRate_('KPC_' + me, KP_COM_PER_HOUR, 3600)) return jsonOut_({ ok: false, error: 'limit' });
    var now = Date.now(), name = U[me].name || me;
    kpComSheet_().appendRow([ch, post, me, safe_(name), safe_(text), now, '']);
    return jsonOut_({ ok: true, item: { id: me, name: name, text: text, ts: now, mine: true } });
  }

  if (action === 'kp_cdel') {
    var csh = kpComSheet_(), krow = Number(p.k) || 0;
    if (krow < 2) return jsonOut_({ ok: false, error: 'bad_k' });
    var cv = csh.getRange(krow, 1, 1, 7).getValues()[0];
    if (String(cv[0]) !== ch || String(cv[1]) !== post) return jsonOut_({ ok: false, error: 'bad_k' });
    if (normId_(cv[2]) !== me && me !== ch && me !== OWNER_ID) return jsonOut_({ ok: false, error: 'forbidden' });
    csh.getRange(krow, 7).setValue('1');
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}
// свой канал: писать может только сам владелец (Pro)
function kpChEdit_(action, e, p) {
  var me = sessionId_(e);
  if (!me) return noAuth_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  if (me !== OWNER_ID && !active_(U, me)) return jsonOut_({ ok: false, error: 'need_pro' });
  var sh = kpChSheet_();
  if (action === 'kp_del') {
    var post = kpPost_(p.p), d = sh.getDataRange().getValues();
    for (var i = 1; i < d.length; i++) if (String(d[i][0]) === me && String(d[i][1]) === post) { sh.getRange(i + 1, 6).setValue('1'); return jsonOut_({ ok: true }); }
    return jsonOut_({ ok: false, error: 'not_found' });
  }
  var text = String(p.text || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, KP_TEXT_MAX);
  if (action === 'kp_hello') {
    var h = sh.getDataRange().getValues();
    for (var j = 1; j < h.length; j++) if (String(h[j][0]) === me && String(h[j][1]) === 'start') { sh.getRange(j + 1, 3, 1, 4).setValues([[safe_(text), '', Date.now(), text ? '' : '1']]); return jsonOut_({ ok: true }); }
    if (text) sh.appendRow([me, 'start', safe_(text), '', Date.now(), '']);
    return jsonOut_({ ok: true });
  }
  var url = kpUrl_(p.url);
  if (url === null) return jsonOut_({ ok: false, error: 'bad_url' });
  if (!text && !url) return jsonOut_({ ok: false, error: 'empty' });
  if (me !== OWNER_ID && !kpRate_('KPA_' + me, KP_POSTS_PER_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var now = Date.now(), id = 'p' + now.toString(36);
  sh.appendRow([me, id, safe_(text), url, now, '']);
  return jsonOut_({ ok: true, post: { p: id, text: text, url: url, ts: now } });
}
// =================== end of block KANAL POSTS v1 ===================
