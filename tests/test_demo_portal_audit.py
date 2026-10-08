import subprocess, time, json, urllib.request, asyncio, websockets, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_demo_audit():
    print("Launching Headless Edge on http://localhost:3000/demo ...")
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--remote-debugging-port=9223',
        '--disable-gpu',
        '--window-size=1600,1200',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000/demo'
    ])

    time.sleep(3)

    try:
        with urllib.request.urlopen('http://127.0.0.1:9223/json') as r:
            tabs = json.loads(r.read())
            target_tab = next(t for t in tabs if 'demo' in t.get('url', ''))
            ws_url = target_tab['webSocketDebuggerUrl']
            print('Connected to CivicPulse /demo tab:', target_tab['title'])

        async def audit():
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

                print("Waiting for page hydration...")
                for _ in range(25):
                    chk = await send_cmd('Runtime.evaluate', {
                        'expression': '!!document.querySelector("h1")',
                        'returnByValue': True
                    })
                    if chk.get('result', {}).get('value'):
                        break
                    await asyncio.sleep(0.5)

                eval_js = """
                (() => {
                    const h1 = document.querySelector('h1')?.innerText;
                    const heroImg = document.querySelector('img[src="/images/chennai/hero-kathipara.jpg"]');
                    const badges = Array.from(document.querySelectorAll('span')).map(s => s.innerText.trim());
                    const hasJuryBadge = badges.includes('JURY DEMO');
                    const hasDemoDataBadge = badges.some(b => b.includes('DEMO DATA / SIMULATION'));

                    const quickActions = document.querySelector('section[aria-label="Civic Services and Quick Actions"]');
                    const quickButtons = quickActions ? Array.from(quickActions.querySelectorAll('button')).map(b => b.innerText.trim()) : [];

                    const stateSelector = document.getElementById('selector-state')?.innerText;
                    const districtSelector = document.getElementById('selector-district')?.value;
                    const placeSelector = document.getElementById('selector-place')?.value;
                    const wardSelector = document.getElementById('selector-ward')?.value;

                    const rainfallInput = document.getElementById('scenario-rainfall-input-field')?.value;
                    const runBtn = document.getElementById('btn-run-prediction-scenario')?.innerText;

                    const mapSection = document.getElementById('current-risk-map');
                    const placeInspector = document.getElementById('place-inspector');
                    const resourceOpt = document.getElementById('resource-optimization');
                    const whatIf = document.getElementById('simulation-decision-support');
                    const priorityQueue = document.getElementById('priority-actions');

                    return {
                        h1,
                        hasHeroImage: !!heroImg,
                        heroImageSrc: heroImg?.src,
                        hasJuryBadge,
                        hasDemoDataBadge,
                        quickButtons,
                        locationHierarchy: {
                            state: stateSelector,
                            district: districtSelector,
                            place: placeSelector,
                            ward: wardSelector
                        },
                        scenarioRainfall: rainfallInput,
                        runButtonText: runBtn,
                        sectionsPresent: {
                            riskMap: !!mapSection,
                            placeInspector: !!placeInspector,
                            resourceOptimization: !!resourceOpt,
                            whatIfSimulation: !!whatIf,
                            priorityQueue: !!priorityQueue
                        }
                    };
                })()
                """

                res = await send_cmd('Runtime.evaluate', {
                    'expression': eval_js,
                    'returnByValue': True
                })

                val = res.get('result', {}).get('value')
                print("\n===== /demo PAGE AUDIT RESULTS =====")
                print(json.dumps(val, indent=2))

                # Verify requirements
                assert val['h1'] == "Chennai Waterlogging Risk Intelligence", f"Unexpected H1: {val['h1']}"
                assert val['hasHeroImage'], "Kathipara hero image not found!"
                assert val['hasJuryBadge'], "JURY DEMO badge not found!"
                assert val['hasDemoDataBadge'], "DEMO DATA badge not found!"
                assert len(val['quickButtons']) >= 5, f"Expected 5 quick buttons, got {len(val['quickButtons'])}"
                assert val['scenarioRainfall'] == "30", f"Expected 30mm rainfall, got {val['scenarioRainfall']}"
                assert val['sectionsPresent']['riskMap'], "Risk map section missing!"
                assert val['sectionsPresent']['placeInspector'], "Place Inspector missing!"
                assert val['sectionsPresent']['resourceOptimization'], "Resource Optimization missing!"
                assert val['sectionsPresent']['whatIfSimulation'], "What-If Simulation missing!"
                assert val['sectionsPresent']['priorityQueue'], "Priority Queue missing!"

                print("\n[SUCCESS] All 8 Acceptance Criteria Verified Cleanly!")

        asyncio.run(audit())

    finally:
        proc.terminate()

if __name__ == '__main__':
    run_demo_audit()
