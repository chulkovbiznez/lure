import asyncio, json, urllib.parse, websockets
U={}
async def h(ws):
    q=urllib.parse.parse_qs(urllib.parse.urlparse(ws.request.path).query); sid=q['sess'][0][:1]
    me={'id':sid,'name':'User '+sid}; U[sid]=ws
    await ws.send(json.dumps({'t':'hello','me':me,'ice':[]}))
    async for raw in ws:
        m=json.loads(raw); t=m.get('t')
        if t=='call':
            await ws.send(json.dumps({'t':'ringing','cid':'c1','peer':{'id':m['to'],'name':'User '+m['to']}}))
            await U[m['to']].send(json.dumps({'t':'ring','cid':'c1','from':me,'video':m.get('video',True)}))
        elif t=='accept':
            for k,w in U.items():
                if w is not ws: await w.send(json.dumps({'t':'accepted','cid':'c1','peer':me}))
        elif t in('sdp','ice'):
            m['from']=sid; to=m.pop('to'); await U[to].send(json.dumps(m))
asyncio.run((lambda: (lambda s: s)(None))() or websockets.serve(h,'localhost',8765).__aenter__()) if False else None
async def main():
    async with websockets.serve(h,'localhost',8765): await asyncio.Future()
asyncio.run(main())
