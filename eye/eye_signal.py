#!/usr/bin/env python3
# EYE — сервер-соединитель видеозвонков EAGLES.
# Знакомит два браузера (WebRTC): передаёт приглашение, ответ и сетевые данные. Видео через него не идёт.
# Вход: ?sess=<ключ входа EAGLES>. Проверка ключа и права звонить — через сервер сайта EAGLES (action=me, action=eye_check:
# только взаимные друзья, без блокировки).
# Секретов в коде нет: TURN-секрет читается из /opt/eye/turn.secret.
import asyncio, base64, hashlib, hmac, json, os, ssl, sys, time, urllib.parse, urllib.request, uuid
from http import HTTPStatus
try:
    from websockets.legacy.server import serve as ws_serve   # одинаково на websockets 10.x–14.x
except ImportError:
    from websockets import serve as ws_serve

BACKEND = os.environ.get('EYE_BACKEND', 'https://functions.yandexcloud.net/d4e7hbmkhkj14dq3e8ip')
HOST = os.environ.get('EYE_HOST', 'eye.eaglesteam.ru')
PORT = int(os.environ.get('EYE_PORT', '443'))
TLS_DIR = os.environ.get('EYE_TLS', '/opt/eye/tls')
SECRET_FILE = os.environ.get('EYE_SECRET', '/opt/eye/turn.secret')
STATIC = os.environ.get('EYE_STATIC', '/opt/eye/static')
ORIGINS = set(os.environ.get('EYE_ORIGINS', 'https://app.eaglesteam.ru,https://lure.eaglesteam.ru').split(','))
OWNER_ID = '11111'
RING_SEC = 40
MAX_CONN_PER_USER = 4
CALLS_PER_MIN = 8

USERS = {}     # id -> set(ws)
INFO = {}      # ws -> {'id','name','sess'}
CALLS = {}     # cid -> {'a':ws,'b':ws or None,'aid','bid','state','t'}
RATE = {}      # id -> [timestamps]
ME_CACHE = {}  # sess -> (until, data)


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


def backend(params):
    url = BACKEND + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'eye-signal'})
    with urllib.request.urlopen(req, timeout=12) as r:
        return json.loads(r.read().decode('utf-8'))


async def bk(params):
    try:
        return await asyncio.get_running_loop().run_in_executor(None, backend, params)
    except Exception as e:
        log('backend error', type(e).__name__)
        return None


async def who(sess):
    c = ME_CACHE.get(sess)
    if c and c[0] > time.time():
        return c[1]
    r = await bk({'action': 'me', 'sess': sess})
    if r and r.get('ok') and r.get('id'):
        d = {'id': str(r['id']), 'name': r.get('name') or r.get('firstName') or ('ID ' + str(r['id'])), 'plan': r.get('plan', 'free')}
        ME_CACHE[sess] = (time.time() + 600, d)
        return d
    return None


def turn_ice(uid):
    try:
        secret = open(SECRET_FILE).read().strip()
    except Exception:
        secret = ''
    ice = [{'urls': ['stun:%s:3478' % HOST]}]
    if secret:
        user = '%d:%s' % (int(time.time()) + 6 * 3600, uid)
        cred = base64.b64encode(hmac.new(secret.encode(), user.encode(), hashlib.sha1).digest()).decode()
        ice.append({'urls': ['turn:%s:3478?transport=udp' % HOST, 'turn:%s:3478?transport=tcp' % HOST, 'turns:%s:5349?transport=tcp' % HOST],
                    'username': user, 'credential': cred})
    return ice


async def send(ws, obj):
    try:
        await ws.send(json.dumps(obj, ensure_ascii=False))
    except Exception:
        pass


async def to_user(uid, obj):
    for w in list(USERS.get(uid, ())):
        await send(w, obj)


def rate_ok(uid):
    now = time.time()
    q = [t for t in RATE.get(uid, []) if now - t < 60]
    if len(q) >= CALLS_PER_MIN:
        RATE[uid] = q
        return False
    q.append(now)
    RATE[uid] = q
    return True


def busy(uid):
    return any(c['state'] in ('ring', 'live') and uid in (c['aid'], c['bid']) for c in CALLS.values())


async def end_call(cid, why, by=None):
    c = CALLS.pop(cid, None)
    if not c:
        return
    msg = {'t': 'hangup', 'cid': cid, 'why': why}
    if c['state'] == 'ring':
        await to_user(c['bid'], msg)          # перестать звонить на всех устройствах
        if by is not c['a']:
            await send(c['a'], msg)
    else:
        for w in (c['a'], c['b']):
            if w is not None and w is not by:
                await send(w, msg)
    log('call end', cid[:6], why)


async def ring_timeout(cid):
    await asyncio.sleep(RING_SEC)
    c = CALLS.get(cid)
    if c and c['state'] == 'ring':
        await end_call(cid, 'noanswer')


async def on_msg(ws, me, m):
    t = m.get('t')
    if t == 'ping':
        return await send(ws, {'t': 'pong'})
    if t == 'call':
        to = str(m.get('to') or '').strip()
        if not to.isdigit() or to == me['id']:
            return await send(ws, {'t': 'error', 'why': 'bad_id'})
        if not rate_ok(me['id']):
            return await send(ws, {'t': 'error', 'why': 'too_often'})
        # Правило Андрея 16.11.2026: звонить можно только взаимным друзьям EAGLES. Решает сервер сайта (eye_check).
        r = await bk({'action': 'eye_check', 'with': to, 'sess': INFO[ws]['sess']})
        if not r or not r.get('ok'):
            return await send(ws, {'t': 'error', 'why': (r or {}).get('error', 'not_allowed')})
        if not r.get('can'):
            return await send(ws, {'t': 'error', 'why': r.get('why') or 'not_friends'})
        if not USERS.get(to):
            return await send(ws, {'t': 'error', 'why': 'offline'})
        if busy(to):
            return await send(ws, {'t': 'error', 'why': 'busy'})
        cid = uuid.uuid4().hex
        CALLS[cid] = {'a': ws, 'b': None, 'aid': me['id'], 'bid': to, 'state': 'ring', 't': time.time()}
        await to_user(to, {'t': 'ring', 'cid': cid, 'from': {'id': me['id'], 'name': me['name']}, 'video': bool(m.get('video', True))})
        await send(ws, {'t': 'ringing', 'cid': cid, 'peer': {'id': to, 'name': (r.get('peer') or {}).get('name', '')}})
        asyncio.ensure_future(ring_timeout(cid))
        log('call ring', cid[:6], me['id'], '->', to)
        return
    cid = str(m.get('cid') or '')
    c = CALLS.get(cid)
    if not c:
        return await send(ws, {'t': 'hangup', 'cid': cid, 'why': 'gone'})
    mine_a = ws is c['a']
    mine_b = INFO[ws]['id'] == c['bid'] and (c['b'] is None or ws is c['b'])
    if not (mine_a or mine_b):
        return
    if t == 'accept' and mine_b and c['state'] == 'ring':
        c['b'] = ws
        c['state'] = 'live'
        await send(c['a'], {'t': 'accepted', 'cid': cid})
        for w in list(USERS.get(c['bid'], ())):        # другие устройства перестают звонить
            if w is not ws:
                await send(w, {'t': 'hangup', 'cid': cid, 'why': 'elsewhere'})
        log('call live', cid[:6])
    elif t == 'decline' and mine_b:
        await end_call(cid, 'declined', by=ws)
    elif t == 'hangup':
        await end_call(cid, 'hangup', by=ws)
    elif t in ('sdp', 'ice') and c['state'] == 'live':
        other = c['b'] if mine_a else c['a']
        if other is not None:
            out = {'t': t, 'cid': cid}
            if t == 'sdp':
                out['sdp'] = m.get('sdp')
            else:
                out['c'] = m.get('c')
            await send(other, out)


async def handler(ws, path=None):
    path = path or getattr(ws, 'path', '')
    q = urllib.parse.parse_qs(urllib.parse.urlparse(path).query)
    sess = (q.get('sess') or [''])[0]
    me = await who(sess) if len(sess) >= 40 else None
    if not me:
        await send(ws, {'t': 'error', 'why': 'no_login'})
        return await ws.close()
    if len(USERS.get(me['id'], ())) >= MAX_CONN_PER_USER:
        await send(ws, {'t': 'error', 'why': 'too_many'})
        return await ws.close()
    USERS.setdefault(me['id'], set()).add(ws)
    INFO[ws] = {'id': me['id'], 'name': me['name'], 'sess': sess}
    await send(ws, {'t': 'hello', 'me': {'id': me['id'], 'name': me['name']}, 'ice': turn_ice(me['id'])})
    try:
        async for raw in ws:
            if len(raw) > 20000:
                continue
            try:
                m = json.loads(raw)
            except Exception:
                continue
            if isinstance(m, dict):
                await on_msg(ws, me, m)
    except Exception:
        pass
    finally:
        USERS.get(me['id'], set()).discard(ws)
        if not USERS.get(me['id']):
            USERS.pop(me['id'], None)
        INFO.pop(ws, None)
        for cid, c in list(CALLS.items()):
            if ws is c['a'] or ws is c['b']:
                await end_call(cid, 'gone', by=ws)


def process_request(path, headers):
    p = urllib.parse.urlparse(path).path
    if p == '/ws':
        origin = headers.get('Origin', '')
        if origin and origin not in ORIGINS:
            return (HTTPStatus.FORBIDDEN, [], b'origin\n')
        return None
    if p == '/health':
        body = json.dumps({'ok': True, 'online': len(USERS), 'calls': len(CALLS)}).encode()
        return (HTTPStatus.OK, [('Content-Type', 'application/json'), ('Access-Control-Allow-Origin', '*')], body)
    if p == '/eye.js':
        try:
            body = open(os.path.join(STATIC, 'eye.js'), 'rb').read()
        except Exception:
            return (HTTPStatus.NOT_FOUND, [], b'')
        return (HTTPStatus.OK, [('Content-Type', 'application/javascript; charset=utf-8'), ('Cache-Control', 'no-cache'),
                                ('Access-Control-Allow-Origin', '*')], body)
    return (HTTPStatus.NOT_FOUND, [], b'EYE\n')


async def main():
    ctx = None
    if PORT == 443 or os.environ.get('EYE_FORCE_TLS'):
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ctx.load_cert_chain(os.path.join(TLS_DIR, 'fullchain.pem'), os.path.join(TLS_DIR, 'privkey.pem'))
    async with ws_serve(handler, '0.0.0.0', PORT, ssl=ctx, process_request=process_request,
                                max_size=32768, ping_interval=25, ping_timeout=20):
        log('EYE signal on', PORT, 'tls' if ctx else 'plain')
        await asyncio.Future()


if __name__ == '__main__':
    asyncio.run(main())
