import subprocess, time, json, urllib.request, asyncio, websockets, base64, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        '--window-size=1280,1024',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000'
    ])

    time.sleep(3)

    try:
        with urllib.request.urlopen('http://127.0.0.1:9222/json') as r:
            tabs = json.loads(r.read())
            target_tab = next(t for t in tabs if 'localhost:3000' in t.get('url', ''))
            ws_url = target_tab['webSocketDebuggerUrl']
            print('Connected to CivicPulse tab:', target_tab['title'])

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

                print('Waiting for live weather telemetry to resolve and render...')
                for _ in range(20):
                    chk_res = await send_cmd('Runtime.evaluate', {
                        'expression': '!!document.querySelector("span.text-3xl")',
                        'returnByValue': True
                    })
                    if chk_res.get('result', {}).get('value'):
                        print('Live Weather component rendered successfully!')
                        break
                    await asyncio.sleep(0.5)

                # Check rendered weather telemetry in English
                eval_js = """
                (() => {
                    const section = document.querySelector('section[aria-label="Chennai Live Weather Telemetry and Numerical Forecast"]');
                    if (!section) return { found: false, error: 'Section not found' };
                    
                    const heading = section.querySelector('h2')?.innerText;
                    const temp = section.querySelector('.text-3xl')?.innerText;
                    const condition = section.querySelector('.text-amber-300')?.innerText;
                    const refreshBtn = document.getElementById('btn-refresh-weather')?.innerText;
                    const summaries = Array.from(section.querySelectorAll('.uppercase')).map(el => el.innerText).filter(t => t.includes('NEXT'));
                    const hourlyCount = section.querySelectorAll('.shrink-0.w-24').length;
                    const errorBanner = section.querySelector('[class*="bg-amber-950"]');

                    return {
                        found: true,
                        heading: heading,
                        temperature: temp,
                        condition: condition,
                        refreshButtonText: refreshBtn,
                        forecastPeriods: summaries,
                        hourlySlotsRendered: hourlyCount,
                        errorBannerVisible: !!errorBanner,
                        fullSectionText: section.innerText
                    };
                })()
                """

                res = await send_cmd('Runtime.evaluate', {'expression': eval_js, 'returnByValue': True})
                weather_state = res.get('result', {}).get('value', {})
                print('\n================== [ENGLISH LIVE WEATHER AUDIT] ==================')
                print('Heading:', weather_state.get('heading'))
                print('Temperature:', weather_state.get('temperature'))
                print('Condition:', weather_state.get('condition'))
                print('Refresh Button:', weather_state.get('refreshButtonText'))
                print('Forecast Periods:', weather_state.get('forecastPeriods'))
                print('Hourly Slots Rendered:', weather_state.get('hourlySlotsRendered'))
                print('Error Banner Visible:', weather_state.get('errorBannerVisible'))
                
                # Check for "Live weather temporarily unavailable"
                text = weather_state.get('fullSectionText', '')
                if 'Live weather temporarily unavailable' in text:
                    print('ERROR: "Live weather temporarily unavailable" is PRESENT in the DOM!')
                else:
                    print('SUCCESS: "Live weather temporarily unavailable" is ABSENT! Real weather telemetry is displayed.')

                # Test Refresh button click
                print('\n================== [TEST REFRESH BUTTON CLICK] ==================')
                click_res = await send_cmd('Runtime.evaluate', {
                    'expression': """
                    (() => {
                        const btn = document.getElementById('btn-refresh-weather');
                        if (btn) { btn.click(); return 'Clicked Refresh Button'; }
                        return 'Refresh Button Not Found';
                    })()
                    """,
                    'returnByValue': True
                })
                print('Click action:', click_res.get('result', {}).get('value'))
                await asyncio.sleep(2)

                res_after = await send_cmd('Runtime.evaluate', {'expression': eval_js, 'returnByValue': True})
                weather_after = res_after.get('result', {}).get('value', {})
                print('Post-Refresh Temperature:', weather_after.get('temperature'))
                print('Post-Refresh Condition:', weather_after.get('condition'))

                # Test Tamil toggle
                print('\n================== [TEST TAMIL LANGUAGE TOGGLE] ==================')
                tamil_toggle_res = await send_cmd('Runtime.evaluate', {
                    'expression': """
                    (() => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const taBtn = buttons.find(b => b.innerText.includes('தமிழ்'));
                        if (taBtn) { taBtn.click(); return 'Switched to Tamil'; }
                        return 'Tamil button not found';
                    })()
                    """,
                    'returnByValue': True
                })
                print('Language toggle action:', tamil_toggle_res.get('result', {}).get('value'))
                await asyncio.sleep(1)

                tamil_eval_js = """
                (() => {
                    const section = document.querySelector('section[aria-label="Chennai Live Weather Telemetry and Numerical Forecast"]');
                    if (!section) return { found: false };
                    
                    const heading = section.querySelector('h2')?.innerText;
                    const text = section.innerText;

                    return {
                        heading: heading,
                        has_நேரடி_வானிலை: text.includes('நேரடி வானிலை'),
                        has_வெப்பநிலை: text.includes('வெப்பநிலை'),
                        has_மழைப்பொழிவு: text.includes('மழைப்பொழிவு'),
                        has_ஈரப்பதம்: text.includes('ஈரப்பதம்'),
                        has_காற்று: text.includes('காற்று'),
                        has_வானிலை_முன்னறிவிப்பு: text.includes('வானிலை முன்னறிவிப்பு'),
                        snippet: text.slice(0, 400)
                    };
                })()
                """

                ta_res = await send_cmd('Runtime.evaluate', {'expression': tamil_eval_js, 'returnByValue': True})
                ta_state = ta_res.get('result', {}).get('value', {})
                heading_repr = repr(ta_state.get('heading'))
                print('Tamil Heading:', heading_repr)
                print('Contains நேரடி வானிலை (Live Weather):', ta_state.get('has_நேரடி_வானிலை'))
                print('Contains வெப்பநிலை (Temperature):', ta_state.get('has_வெப்பநிலை'))
                print('Contains மழைப்பொழிவு (Precipitation):', ta_state.get('has_மழைப்பொழிவு'))
                print('Contains ஈரப்பதம் (Humidity):', ta_state.get('has_ஈரப்பதம்'))
                print('Contains காற்று (Wind):', ta_state.get('has_காற்று'))
                print('Contains வானிலை முன்னறிவிப்பு (Forecast):', ta_state.get('has_வானிலை_முன்னறிவிப்பு'))

                # Capture full screenshot
                screenshot_res = await send_cmd('Page.captureScreenshot', {'format': 'png'})
                if 'data' in screenshot_res:
                    with open('browser_live_weather_verified.png', 'wb') as f:
                        f.write(base64.b64decode(screenshot_res['data']))
                    print('\nScreenshot saved to browser_live_weather_verified.png')

        asyncio.run(run_audit())

    finally:
        proc.terminate()

if __name__ == '__main__':
    run_test()
