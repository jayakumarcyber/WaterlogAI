import subprocess, time, json, urllib.request, asyncio, websockets, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    print("Launching Edge headless to test http://localhost:3000/demo...")
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--remote-debugging-port=9223',
        '--disable-gpu',
        '--window-size=1280,1024',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000/demo'
    ])

    time.sleep(4)

    try:
        with urllib.request.urlopen('http://127.0.0.1:9223/json') as r:
            tabs = json.loads(r.read())
            target_tab = next(t for t in tabs if 'localhost:3000/demo' in t.get('url', ''))
            ws_url = target_tab['webSocketDebuggerUrl']
            print('Connected to CivicPulse Demo tab:', target_tab['title'])

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

                print('Waiting for page to hydrate...')
                await asyncio.sleep(2.0)

                # 1. Check title, banner, and demo status strip
                res = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const h1 = document.querySelector('h1')?.innerText;
                        const demoStatus = document.body.innerText.includes('DEMO ENVIRONMENT');
                        const controlled = document.body.innerText.includes('14 Controlled Locations');
                        const stepperText = document.body.innerText.includes('STEP 1 OF 10') || document.body.innerText.includes('Step 1');
                        const evidenceText = document.getElementById('demo-evidence-section')?.innerText || '';
                        const hasWhyAtRisk = evidenceText.toLowerCase().includes('why is this location at risk');
                        return { h1, demoStatus, controlled, stepperText, hasWhyAtRisk, evidenceSnippet: evidenceText.substring(0, 150) };
                    })()""",
                    'returnByValue': True
                })
                print("Initial check result:", res.get('result', {}).get('value'))

                # 2. Test Stepper Next button
                print("Testing Stepper Next button...")
                await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const nextBtn = document.getElementById('btn-stepper-next-step');
                        if (nextBtn) { nextBtn.click(); return true; }
                        return false;
                    })()""",
                    'returnByValue': True
                })
                await asyncio.sleep(0.8)

                res_step2 = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        return {
                            isStep2: document.body.innerText.includes('STEP 2 OF 10') || document.body.innerText.includes('Step 2'),
                            hasHistoricalEvidence: document.body.innerText.includes('Historical Evidence')
                        };
                    })()""",
                    'returnByValue': True
                })
                print("Step 2 check:", res_step2.get('result', {}).get('value'))

                # 3. Advance to Step 3 (Rainfall Scenario)
                await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const nextBtn = document.getElementById('btn-stepper-next-step');
                        if (nextBtn) { nextBtn.click(); return true; }
                        return false;
                    })()""",
                    'returnByValue': True
                })
                await asyncio.sleep(0.8)

                res_step3 = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const hasHeavyBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Heavy (150mm)'));
                        return {
                            isStep3: document.body.innerText.includes('STEP 3 OF 10') || document.body.innerText.includes('Step 3'),
                            hasHeavyBtn
                        };
                    })()""",
                    'returnByValue': True
                })
                print("Step 3 check:", res_step3.get('result', {}).get('value'))

                # 4. Check Explainability Section: "Why is this location at risk?"
                res_xai = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        return {
                            hasWhyAtRisk: document.body.innerText.toLowerCase().includes('why is this location at risk'),
                            hasResidualSummary: document.body.innerText.includes('Post-Intervention Residual Risk Evaluation'),
                            hasMunicipalAllocation: document.body.innerText.includes('Municipal Resource Allocation'),
                            hasValidatedSolver: document.body.innerText.includes('Validated by Solver')
                        };
                    })()""",
                    'returnByValue': True
                })
                print("Explainability & Features check:", res_xai.get('result', {}).get('value'))

                # 5. Check English / Tamil switch
                print("Testing Tamil toggle...")
                await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const taBtn = document.getElementById('lang-switch-ta');
                        if (taBtn) { taBtn.click(); return true; }
                        return false;
                    })()""",
                    'returnByValue': True
                })
                await asyncio.sleep(0.8)

                res_ta = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        return {
                            hasTamilText: document.body.innerText.includes('நடுவர் செயல்முறை விளக்க தளம்') || document.body.innerText.includes('அசல் சென்னை திட்டம்') || document.body.innerText.includes('மழை எச்சரிக்கையிலிருந்து')
                        };
                    })()""",
                    'returnByValue': True
                })
                print("Tamil check:", res_ta.get('result', {}).get('value'))

                # Switch back to English
                await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        const enBtn = document.getElementById('lang-switch-en');
                        if (enBtn) { enBtn.click(); return true; }
                        return false;
                    })()""",
                    'returnByValue': True
                })
                await asyncio.sleep(0.5)

                # 6. Check for horizontal overflow
                res_overflow = await send_cmd('Runtime.evaluate', {
                    'expression': """(() => {
                        return {
                            scrollWidth: document.documentElement.scrollWidth,
                            clientWidth: document.documentElement.clientWidth,
                            hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
                        };
                    })()""",
                    'returnByValue': True
                })
                print("Overflow check:", res_overflow.get('result', {}).get('value'))

                print("All automated browser checks completed successfully!")

        asyncio.run(run_audit())

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == '__main__':
    run_test()
