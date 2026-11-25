// ---------- уведомления на телефон (Web Push, RFC 8291 aes128gcm + VAPID RFC 8292), 25.11.2026 ----------
// ENV.VAPID_PUBLIC (base64url, 65 байт) — открытый ключ; ENV.VAPID_PRIVATE (base64url, 32 байта) — из Lockbox eagles-push-vapid.
const wpB64u = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const wpUnB64u = s => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
function hkdf1(salt, ikm, info, len) {
  const prk = crypto.createHmac('sha256', salt).update(ikm).digest();
  return crypto.createHmac('sha256', prk).update(Buffer.concat([info, Buffer.from([1])])).digest().subarray(0, len);
}
function wpEncrypt(payload, p256dh, auth, fixed) {
  const ua = wpUnB64u(p256dh), au = wpUnB64u(auth);
  const ecdh = crypto.createECDH('prime256v1');
  if (fixed && fixed.asPriv) ecdh.setPrivateKey(wpUnB64u(fixed.asPriv)); else ecdh.generateKeys();
  const asPub = ecdh.getPublicKey(), secret = ecdh.computeSecret(ua);
  const ikm = hkdf1(au, secret, Buffer.concat([Buffer.from('WebPush: info\0'), ua, asPub]), 32);
  const salt = fixed && fixed.salt ? wpUnB64u(fixed.salt) : crypto.randomBytes(16);
  const cek = hkdf1(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = hkdf1(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);
  const c = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const ct = Buffer.concat([c.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPub.length]), asPub, ct]);
}
function vapidAuth(endpoint) {
  const pub = wpUnB64u(ENV.VAPID_PUBLIC), d = ENV.VAPID_PRIVATE;
  const key = crypto.createPrivateKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', d,
    x: wpB64u(pub.subarray(1, 33)), y: wpB64u(pub.subarray(33, 65)) } });
  const head = wpB64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = wpB64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://app.eaglesteam.ru' }));
  const sig = crypto.sign('sha256', Buffer.from(head + '.' + body), { key, dsaEncoding: 'ieee-p1363' });
  return 'vapid t=' + head + '.' + body + '.' + wpB64u(sig) + ', k=' + ENV.VAPID_PUBLIC;
}
// разрешаем слать только на известные сервисы уведомлений (а не на любой адрес из подписки)
function pushHostOk(u) {
  let x; try { x = new URL(u); } catch (e) { return false; }
  return x.protocol === 'https:' && /(^|\.)(googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com|push\.yandex\.ru|hmspush\.com)$/i.test(x.hostname);
}
async function wpSend(sub, data) {
  const r = await fetch(sub.endpoint, { method: 'POST', signal: AbortSignal.timeout(5000), body: wpEncrypt(JSON.stringify(data), sub.p256dh, sub.auth),
    headers: { 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'high', Authorization: vapidAuth(sub.endpoint) } });
  return r.status;
}
// R.pushSave: [{id, sub}] · R.pushOff: [{id, endpoint}] · R.pushes: [{to, title, body, url, tag}]
async function pushWork(R) {
  const w = [];
  for (const s of R.pushSave || []) w.push(() => dbPut('push_' + s.id, sha(s.sub.endpoint).slice(0, 24), JSON.stringify(s.sub), Date.now() + 120 * 864e5));
  for (const s of R.pushOff || []) w.push(() => dbDel('push_' + s.id, sha(s.endpoint).slice(0, 24)));
  await pool(w, 4);
  if (!(R.pushes || []).length || !ENV.VAPID_PUBLIC || !ENV.VAPID_PRIVATE) return;
  const byTo = {};
  for (const m of R.pushes) (byTo[m.to] = byTo[m.to] || []).push(m);
  await Promise.all(Object.keys(byTo).map(async to => {
    let subs = [];
    try { subs = (await dbQuery('push_' + to)).slice(-5); } catch (e) { console.error('push q ' + (e && e.message)); return; }
    for (const it of subs) {
      let sub; try { sub = JSON.parse(it.v.S); } catch (e) { continue; }
      if (!pushHostOk(sub.endpoint)) continue;
      for (const m of byTo[to]) {
        try {
          const st = await wpSend(sub, { title: m.title, body: m.body, url: m.url, tag: m.tag });
          if (st === 404 || st === 410) { await dbDel('push_' + to, it[SK].S); break; }
          if (st >= 400) console.error('push ' + st);
        } catch (e) { console.error('push ' + (e && e.message)); }
      }
    }
  }));
}
