import asyncio, websockets, urllib.request, json

async def check():
    with urllib.request.urlopen('http://127.0.0.1:9222/json') as r:
        tabs = json.loads(r.read())
    target = next(t for t in tabs if 'localhost:3000' in t.get('url', ''))
    async with websockets.connect(target['webSocketDebuggerUrl']) as ws:
        # Check console logs or network or DOM
        await ws.send(json.dumps({'id': 1, 'method': 'Runtime.evaluate', 'params': {'expression': 'document.querySelector("#live-chennai-weather-card")?.innerText'}}))
        res = json.loads(await ws.recv())
        print('Section text:')
        print(res.get('result', {}).get('result', {}).get('value'))

asyncio.run(check())
