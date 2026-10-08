import subprocess, time, json, urllib.request, asyncio, websockets, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    print("Launching Edge headless at 375x812 (mobile viewport)...")
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--remote-debugging-port=9224',
        '--disable-gpu',
        '--window-size=375,812',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000/demo'
    ])

    time.sleep(3)

    try:
        with urllib.request.urlopen('http://127.0.0.1:9224/json') as r:
            tabs = json.loads(r.read())
            target_tab = next(t for t in tabs if 'localhost:3000/demo' in t.get('url', ''))
            ws_url = target_tab['webSocketDebuggerUrl']
            print('Connected to CivicPulse Demo Mobile tab:', target_tab['title'])

        async def run_audit():
            async with websockets.connect(ws_url, max_size=20_000_000) as ws:
                msg_id = 0
                async def send_cmd(method, params=None):
                    nonlocal msg_id
                    msg_id += 1
                    await ws.send(json.dumps({'id': msg_id, 'method': method, 'params': params or {}}))
                    while True:
                        raw = await ws.recv()
                        data = json.loads(raw)
                        if data.get('id') == msg_id:
                            return data.get('result', {})

                await send_cmd('Page.enable')
                await send_cmd('Runtime.enable')

                await asyncio.sleep(2.0)

                # Check mobile stepper rendering and horizontal scroll
                res = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const stepText = document.body.innerText.includes('STEP 1 OF 10') || document.body.innerText.includes('Step 1');
                        const hasNextBtn = !!document.getElementById('btn-stepper-next-step');
                        const hasPrevBtn = !!document.getElementById('btn-stepper-prev-step');
                        
                        // Check if 10-column desktop pill bar is hidden on mobile
                        const desktopStepper = document.querySelector('.lg\\\\:grid-cols-10');
                        const desktopHidden = desktopStepper ? window.getComputedStyle(desktopStepper).display === 'none' : true;
                        
                        return {
                            stepText,
                            hasNextBtn,
                            hasPrevBtn,
                            desktopHidden,
                            scrollWidth: document.documentElement.scrollWidth,
                            clientWidth: document.documentElement.clientWidth,
                            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
                        };
                    })()""",
                    'returnByValue': True
                })
                print("Mobile audit result:", res.get('result', {}).get('value'))

        asyncio.run(run_audit())

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == '__main__':
    run_test()
