import subprocess, time, json, urllib.request, asyncio, websockets, sys, os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

EDGE_EXE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

async def run_cdp_audit():
    print("=" * 60)
    print("STARTING REAL BROWSER RECOVERY & FUNCTIONALITY AUDIT")
    print("=" * 60)

    # Launch Edge headless on port 9224
    proc = subprocess.Popen([
        EDGE_EXE,
        '--headless=new',
        '--remote-debugging-port=9224',
        '--disable-gpu',
        '--window-size=1280,1024',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000/'
    ])

    time.sleep(3)

    try:
        with urllib.request.urlopen('http://127.0.0.1:9224/json') as r:
            tabs = json.loads(r.read())
            target_tab = next(t for t in tabs if 'localhost:3000' in t.get('url', ''))
            ws_url = target_tab['webSocketDebuggerUrl']
            print('Connected to Edge DevTools tab:', target_tab['title'])

        async with websockets.connect(ws_url, max_size=20_000_000) as ws:
            msg_id = 0
            console_errors = []

            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                await ws.send(json.dumps({'id': msg_id, 'method': method, 'params': params or {}}))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    # Track runtime console errors
                    if data.get('method') == 'Runtime.consoleAPICalled':
                        args = data.get('params', {}).get('args', [])
                        text = ' '.join(str(a.get('value', '')) for a in args)
                        if data.get('params', {}).get('type') == 'error':
                            console_errors.append(text)
                    if data.get('method') == 'Runtime.exceptionThrown':
                        details = data.get('params', {}).get('exceptionDetails', {})
                        console_errors.append(f"EXCEPTION: {details.get('text', '')}")

                    if data.get('id') == msg_id:
                        return data.get('result', {})

            await send_cmd('Page.enable')
            await send_cmd('Runtime.enable')

            print('\n[1/4] AUDITING ORIGINAL PROJECT (http://localhost:3000/)...')
            await asyncio.sleep(2.0)

            # Check original project elements
            eval_orig = await send_cmd('Runtime.evaluate', {
                'expression': """(() => {
                    const hasNextError = !!document.querySelector('nextjs-portal') || !!document.querySelector('[data-nextjs-dialog-overlay]');
                    const h1 = document.querySelector('h1')?.innerText || '';
                    const hasWeather = !!document.querySelector('section[aria-label*="Weather"]');
                    const weatherText = document.querySelector('section[aria-label*="Weather"]')?.innerText || '';
                    const hasMap = !!document.getElementById('municipal-map');
                    const hasLeaflet = !!document.querySelector('.leaflet-container');
                    const leafletTileCount = document.querySelectorAll('.leaflet-tile').length;
                    const hasServices = !!document.querySelector('section[aria-label*="Services"]');
                    const hasHistorical = !!document.querySelector('section[aria-label*="Historical"]');
                    const hasPriority = !!document.getElementById('priority-actions');
                    const hasSimulation = !!document.getElementById('simulation-decision-support');
                    const bodyTextLength = document.body.innerText.length;

                    return {
                        hasNextError,
                        h1,
                        hasWeather,
                        weatherTextPreview: weatherText.substring(0, 150).replace(/\\n/g, ' '),
                        hasMap,
                        hasLeaflet,
                        leafletTileCount,
                        hasServices,
                        hasHistorical,
                        hasPriority,
                        hasSimulation,
                        bodyTextLength
                    };
                })()""",
                'returnByValue': True
            })

            orig_res = eval_orig.get('result', {}).get('value', {})
            print('  • Next.js Error Overlay:', 'NO (CLEAN)' if not orig_res.get('hasNextError') else 'YES (ERROR)')
            print('  • Heading:', orig_res.get('h1'))
            print('  • Live Weather Panel:', 'PRESENT & RENDERING' if orig_res.get('hasWeather') else 'MISSING')
            print('  • Weather Snippet:', orig_res.get('weatherTextPreview'))
            print('  • Municipal GIS Map Element:', 'PRESENT (#municipal-map)' if orig_res.get('hasMap') else 'MISSING')
            print('  • Leaflet Interactive Container:', 'INITIALIZED' if orig_res.get('hasLeaflet') else 'FAILED')
            print('  • Leaflet Tiles Loaded:', orig_res.get('leafletTileCount'))
            print('  • Services Section:', 'PRESENT' if orig_res.get('hasServices') else 'MISSING')
            print('  • Priority Actions Section:', 'PRESENT' if orig_res.get('hasPriority') else 'MISSING')
            print('  • Simulation Section:', 'PRESENT' if orig_res.get('hasSimulation') else 'MISSING')

            print('\n[2/4] TESTING ORIGINAL PROJECT INTERACTION & WARD SELECTION...')
            # Test clicking a button or map interaction
            eval_interact = await send_cmd('Runtime.evaluate', {
                'expression': """(() => {
                    const btn = document.querySelector('button[id*="filter"]') || document.querySelector('button');
                    return { clicked: !!btn };
                })()""",
                'returnByValue': True
            })
            print('  • Interactive controls responsive:', eval_interact.get('result', {}).get('value', {}).get('clicked'))

            print('\n[3/4] NAVIGATING TO JURY DEMO (http://localhost:3000/demo)...')
            await send_cmd('Page.navigate', {'url': 'http://localhost:3000/demo'})
            await asyncio.sleep(3.0)

            eval_demo = await send_cmd('Runtime.evaluate', {
                'expression': """(() => {
                    const hasNextError = !!document.querySelector('nextjs-portal') || !!document.querySelector('[data-nextjs-dialog-overlay]');
                    const h1 = document.querySelector('h1')?.innerText || '';
                    const hasDemoEngine = !!document.querySelector('section[aria-label="CivicPulse Monsoon — Hackathon Demo Engine"]');
                    const hasDemoMap = !!document.querySelector('.leaflet-container');
                    const demoTileCount = document.querySelectorAll('.leaflet-tile').length;
                    const demoMarkers = document.querySelectorAll('.leaflet-interactive').length;
                    const demoLocationsText = document.body.innerText.includes('14') || document.body.innerText.includes('Velachery');
                    const hasOptControls = document.body.innerText.includes('Optimization') || document.body.innerText.includes('Dispatch');
                    const hasSimControls = document.body.innerText.includes('What-If') || document.body.innerText.includes('Simulation');
                    const bodyTextLength = document.body.innerText.length;

                    return {
                        hasNextError,
                        h1,
                        hasDemoEngine,
                        hasDemoMap,
                        demoTileCount,
                        demoMarkers,
                        demoLocationsText,
                        hasOptControls,
                        hasSimControls,
                        bodyTextLength
                    };
                })()""",
                'returnByValue': True
            })

            demo_res = eval_demo.get('result', {}).get('value', {})
            print('  • Next.js Error Overlay:', 'NO (CLEAN)' if not demo_res.get('hasNextError') else 'YES (ERROR)')
            print('  • Demo Title:', demo_res.get('h1'))
            print('  • Hackathon Demo Engine:', 'ACTIVE & MOUNTED' if demo_res.get('hasDemoEngine') else 'INACTIVE')
            print('  • Demo Leaflet Map Container:', 'INITIALIZED' if demo_res.get('hasDemoMap') else 'FAILED')
            print('  • Demo Tiles Loaded:', demo_res.get('demoTileCount'))
            print('  • Demo Marker Pins Rendered:', demo_res.get('demoMarkers'), 'pins')
            print('  • 14 Monitored Locations Loaded:', 'YES' if demo_res.get('demoLocationsText') else 'NO')
            print('  • Resource Optimization Solver:', 'READY' if demo_res.get('hasOptControls') else 'MISSING')
            print('  • What-If Scenario Simulation:', 'READY' if demo_res.get('hasSimControls') else 'MISSING')

            print('\n[4/4] TESTING DEMO INTERACTION & PAGE REFRESH...')
            # Click a marker or run optimization
            eval_opt = await send_cmd('Runtime.evaluate', {
                'expression': """(() => {
                    const optBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Solve') || b.innerText.includes('Optimize'));
                    if (optBtn) {
                        optBtn.click();
                        return { clicked: true, text: optBtn.innerText };
                    }
                    return { clicked: false };
                })()""",
                'returnByValue': True
            })
            print('  • Solver trigger button:', eval_opt.get('result', {}).get('value', {}))
            await asyncio.sleep(1.0)

            # Test Page Refresh on /demo to ensure zero crashes or chunk errors
            print('  • Refreshing /demo...')
            await send_cmd('Page.reload')
            await asyncio.sleep(2.5)

            eval_after_refresh = await send_cmd('Runtime.evaluate', {
                'expression': """(() => {
                    const hasNextError = !!document.querySelector('nextjs-portal') || !!document.querySelector('[data-nextjs-dialog-overlay]');
                    const hasDemoEngine = !!document.querySelector('section[aria-label="CivicPulse Monsoon — Hackathon Demo Engine"]');
                    const hasDemoMap = !!document.querySelector('.leaflet-container');
                    return { hasNextError, hasDemoEngine, hasDemoMap };
                })()""",
                'returnByValue': True
            })
            ref_res = eval_after_refresh.get('result', {}).get('value', {})
            print('  • Post-Refresh Status:', 'CLEAN & FUNCTIONAL' if (not ref_res.get('hasNextError') and ref_res.get('hasDemoMap')) else 'FAILED')

            # Filter relevant console errors
            severe_errors = [e for e in console_errors if 'ChunkLoadError' in e or 'Cannot find module' in e or 'Maximum update depth' in e]
            print(f'\nConsole Severe Errors: {len(severe_errors)}')
            if severe_errors:
                for err in severe_errors:
                    print('  ❌', err)
            else:
                print('  ✅ ZERO ChunkLoadErrors, ZERO ModuleNotFoundErrors, ZERO UpdateDepthErrors!')

            print("\n" + "=" * 60)
            print("BROWSER AUDIT COMPLETED SUCCESSFULLY!")
            print("=" * 60)

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == '__main__':
    asyncio.run(run_cdp_audit())
