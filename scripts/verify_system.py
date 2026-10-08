import urllib.request
import json
import sys

def test_endpoint(name, url, method='GET', payload=None):
    try:
        data = json.dumps(payload).encode('utf-8') if payload else None
        headers = {'Content-Type': 'application/json'} if payload else {}
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=10) as res:
            body = json.loads(res.read().decode('utf-8'))
            print(f"[PASS] {name}: HTTP {res.status}")
            return body
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return None

print("=== CIVICPULSE MONSOON SYSTEM VERIFICATION ===")

# 1. Health
test_endpoint('Health', 'http://127.0.0.1:8000/health')

# 2. Wards GeoJSON
wards = test_endpoint('Wards GeoJSON', 'http://127.0.0.1:8000/api/v1/wards/geojson?district=Chennai')
if wards and 'features' in wards:
    print(f"   -> Features count: {len(wards['features'])}")

# 3. Ward metrics for Wards 1, 114, 170, 177, 198
for wid in [1, 114, 170, 177, 198]:
    m = test_endpoint(f'Ward {wid} Metrics', f'http://127.0.0.1:8000/api/v1/wards/{wid}/metrics')
    if m:
        pop = m.get('population')
        pop_status = m.get('population_status')
        elev = m.get('elevation_m')
        slope = m.get('slope_percent')
        terrain_status = m.get('terrain_status')
        incidents = m.get('historical_incident_count')
        print(f"   -> Ward {wid} ({m.get('name')}): Pop={pop}, PopStatus='{pop_status}', Elev={elev}m, Slope={slope}%, TerrainStatus='{terrain_status}', Incidents={incidents}")

# 4. Incidents summary & geojson
inc_sum = test_endpoint('Incidents Summary', 'http://127.0.0.1:8000/api/v1/incidents/summary')
if inc_sum:
    print(f"   -> Incidents: Total={inc_sum.get('total_incidents')}, Mapped={inc_sum.get('mapped_to_gcc_wards')}, Coverage={inc_sum.get('wards_with_historical_evidence')}/200")

inc_geo = test_endpoint('Incidents GeoJSON', 'http://127.0.0.1:8000/api/v1/incidents/geojson')
if inc_geo and 'features' in inc_geo:
    print(f"   -> Incidents Mapped Features: {len(inc_geo['features'])}")

# 5. Demo Risk Analysis
risk = test_endpoint('Demo Risk Analysis', 'http://127.0.0.1:8000/api/v1/demo/risk-analysis', method='POST', payload={'horizon_hours': 24, 'rainfall_multiplier': 1.0, 'drainage_delta_pct': 0.0})
if risk:
    summary = risk.get('summary', {})
    locs = risk.get('locations', [])
    print(f"   -> Risk Locations: {len(locs)}")
    print(f"   -> Summary: HighRisk={summary.get('high_risk_count')}, PopExposure={summary.get('total_population_exposure')}, Facilities={summary.get('total_critical_facilities')}, TopPriority='{summary.get('top_priority_location')}', TopScore={summary.get('top_priority_score')}")

# 6. Priority rankings
priority = test_endpoint('Priority Rankings', 'http://127.0.0.1:8000/api/v1/priority/rankings?district=Chennai')
if priority and isinstance(priority, list):
    print(f"   -> Priority Rankings Count: {len(priority)}")

# 7. Simulation scenarios
test_endpoint('Simulation Scenarios', 'http://127.0.0.1:8000/api/v1/simulation/scenarios')

# 8. Complaints map
test_endpoint('Complaints Public Map', 'http://127.0.0.1:8000/api/v1/complaints/public/map')
