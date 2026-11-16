#!/usr/bin/env python3
# EYE — сервер-соединитель видеозвонков EAGLES.
# v3 (16.11.2026): звонок до 4 человек (каждый с каждым), аудио или видео.
# Знакомит браузеры (WebRTC): передаёт приглашение, ответ и сетевые данные. Видео через него не идёт.
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
MAX_ROOM = 4          # решение Андрея 16.11.2026: до 4 человек в звонке

USERS = {}     # id -> set(ws)
INFO = {}      # ws -> {'id','name','sess'}
ROOMS = {}     # cid -> {'members':{id:ws}, 'invited':{id:t0}, 'video', 't'}  (v3: звонок до 4 человек)
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
    return any(uid in r['members'] or uid in r['invited'] for r in ROOMS.values())


def peer_of(r, uid):
    w = r['members'].get(uid)
    return {'id': uid, 'name': INFO[w]['name'] if w in INFO else ''}


async def end_room(cid, why, by=None):
    r = ROOMS.pop(cid, None)
    if not r:
        return
    msg = {'t': 'hangup', 'cid': cid, 'why': why}
    for uid in list(r['invited']):
        await to_user(uid, msg)               # перестать звонить на всех устройствах
    for w in r['members'].values():
        if w is not by:
            await send(w, msg)
    log('room end', cid[:6], why)


async def check_room(cid, why, by=None):
    # Звонок живёт, пока в нём двое, или один и кому-то ещё звоним.
    r = ROOMS.get(cid)
    if r and (not r['members'] or (len(r['members']) == 1 and not r['invited'])):
        await end_room(cid, why, by)
        return True
    return False


async def leave(cid, uid, why, by=None):
    r = ROOMS.get(cid)
    if not r or uid not in r['members']:
        return
    r['members'].pop(uid)
    if await check_room(cid, why, by):
        return
    for w in r['members'].values():
        await send(w, {'t': 'peer_left', 'cid': cid, 'id': uid})
    log('room leave', cid[:6], uid, len(r['members']))


async def drop_invite(cid, uid, why):
    r = ROOMS.get(cid)
    if not r or uid not in r['invited']:
        return
    r['invited'].pop(uid)
    await to_user(uid, {'t': 'hangup', 'cid': cid, 'why': why})
    if await check_room(cid, why):
        return
    for w in r['members'].values():
        await send(w, {'t': 'invite_end', 'cid': cid, 'id': uid, 'why': why})


async def ring_timeout(cid, uid, t0):
    await asyncio.sleep(RING_SEC)
    r = ROOMS.get(cid)
    if r and r['invited'].get(uid) == t0:
        await drop_invite(cid, uid, 'noanswer')


async def invite(ws, me, r, to, first):
    # Правило Андрея 16.11.2026: звать можно только взаимных друзей EAGLES. Решает сервер сайта (eye_check).
    rr = await bk({'action': 'eye_check', 'with': to, 'sess': INFO[ws]['sess']})
    if not rr or not rr.get('ok'):
        return (rr or {}).get('error', 'not_allowed'), None
    if not rr.get('can'):
        return rr.get('why') or 'not_friends', None
    if not USERS.get(to):
        return 'offline', None
    if busy(to):
        return 'busy', None
    return '', (rr.get('peer') or {}).get('name', '')


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
        if busy(me['id']):
            return await send(ws, {'t': 'error', 'why': 'self_busy'})
        why, name = await invite(ws, me, None, to, True)
        if why:
            return await send(ws, {'t': 'error', 'why': why})
        cid = uuid.uuid4().hex
        t0 = time.time()
        video = bool(m.get('video', True))
        ROOMS[cid] = {'members': {me['id']: ws}, 'invited': {to: t0}, 'video': video, 't': t0}
        await to_user(to, {'t': 'ring', 'cid': cid, 'from': {'id': me['id'], 'name': me['name']}, 'video': video, 'group': []})
        await send(ws, {'t': 'ringing', 'cid': cid, 'peer': {'id': to, 'name': name}})
        asyncio.ensure_future(ring_timeout(cid, to, t0))
        log('call ring', cid[:6], me['id'], '->', to)
        return
    cid = str(m.get('cid') or '')
    r = ROOMS.get(cid)
    if not r:
        if t in ('accept', 'hangup', 'add'):
            await send(ws, {'t': 'hangup', 'cid': cid, 'why': 'gone'})
        return
    uid = me['id']
    member = r['members'].get(uid) is ws
    if t == 'accept':
        if uid not in r['invited'] or uid in r['members']:
            return
        if len(r['members']) >= 2 and INFO[ws].get('v', 2) < 3:
            return await drop_invite(cid, uid, 'old_app')
        r['invited'].pop(uid)
        peers = [peer_of(r, x) for x in r['members']]
        for w in r['members'].values():           # каждый, кто уже в звонке, сам шлёт приглашение новенькому
            await send(w, {'t': 'accepted', 'cid': cid, 'peer': {'id': uid, 'name': me['name']}})
        r['members'][uid] = ws
        await send(ws, {'t': 'joined', 'cid': cid, 'peers': peers})
        for w in list(USERS.get(uid, ())):        # другие устройства перестают звонить
            if w is not ws:
                await send(w, {'t': 'hangup', 'cid': cid, 'why': 'elsewhere'})
        log('room join', cid[:6], uid, len(r['members']))
    elif t == 'decline':
        if uid in r['invited']:
            await drop_invite(cid, uid, 'declined')
    elif t == 'hangup':
        if member:
            await leave(cid, uid, 'hangup', by=ws)
    elif t == 'add' and member:
        to = str(m.get('to') or '').strip()
        if not to.isdigit() or to == uid or to in r['members'] or to in r['invited']:
            return await send(ws, {'t': 'error', 'why': 'bad_id', 'cid': cid})
        if len(r['members']) + len(r['invited']) >= MAX_ROOM:
            return await send(ws, {'t': 'error', 'why': 'full', 'cid': cid})
        if any(INFO.get(w, {}).get('v', 2) < 3 for w in r['members'].values()):
            return await send(ws, {'t': 'error', 'why': 'old_app', 'cid': cid})
        if not rate_ok(uid):
            return await send(ws, {'t': 'error', 'why': 'too_often', 'cid': cid})
        why, name = await invite(ws, me, r, to, False)
        if why:
            return await send(ws, {'t': 'error', 'why': why, 'cid': cid})
        if ROOMS.get(cid) is not r or r['members'].get(uid) is not ws:
            return
        t0 = time.time()
        r['invited'][to] = t0
        group = [peer_of(r, x)['name'] for x in r['members'] if x != uid]
        await to_user(to, {'t': 'ring', 'cid': cid, 'from': {'id': uid, 'name': me['name']}, 'video': r['video'], 'group': group})
        for w in r['members'].values():
            await send(w, {'t': 'adding', 'cid': cid, 'peer': {'id': to, 'name': name}, 'by': uid})
        asyncio.ensure_future(ring_timeout(cid, to, t0))
        log('room add', cid[:6], uid, '->', to)
    elif t in ('sdp', 'ice') and member:
        to = str(m.get('to') or '')
        if not to:
            others = [x for x in r['members'] if x != uid]
            to = others[0] if len(others) == 1 else ''
        w = r['members'].get(to)
        if w is None or to == uid:
            return
        out = {'t': t, 'cid': cid, 'from': uid}
        if t == 'sdp':
            out['sdp'] = m.get('sdp')
        else:
            out['c'] = m.get('c')
        await send(w, out)


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
    try:
        ver = int((q.get('v') or ['2'])[0])
    except ValueError:
        ver = 2
    INFO[ws] = {'id': me['id'], 'name': me['name'], 'sess': sess, 'v': ver}
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
        for cid, r in list(ROOMS.items()):
            if r['members'].get(me['id']) is ws:
                await leave(cid, me['id'], 'gone', by=ws)
        INFO.pop(ws, None)


def process_request(path, headers):
    p = urllib.parse.urlparse(path).path
    if p == '/ws':
        origin = headers.get('Origin', '')
        if origin and origin not in ORIGINS:
            return (HTTPStatus.FORBIDDEN, [], b'origin\n')
        return None
    if p == '/health':
        body = json.dumps({'ok': True, 'online': len(USERS), 'calls': len(ROOMS)}).encode()
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
