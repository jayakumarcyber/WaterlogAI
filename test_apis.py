import urllib.request
import json

endpoints = [
    ("GET", "/health", None),
    ("GET", "/api/v1/wards", None),
    ("GET", "/api/v1/wards/geojson?district=Chennai", None),
    ("GET", "/api/v1/roads/geojson?district=Chennai", None),
    ("GET", "/api/v1/drains/geojson?district=Chennai", None),
    ("GET", "/api/v1/waterbodies/geojson?district=Chennai", None),
    ("GET", "/api/v1/facilities/geojson?district=Chennai", None),
    ("GET", "/api/v1/incidents/geojson", None),
    ("GET", "/api/v1/incidents/summary", None),
    ("GET", "/api/v1/districts/geojson", None),
    ("GET", "/api/v1/state/geojson", None),
    ("GET", "/api/v1/complaints/public/map", None),
    ("GET", "/api/v1/complaints/operations/summary", None),
    ("GET", "/api/v1/complaints/operations/queue", None),
    ("POST", "/api/v1/demo/risk-analysis", {"horizon_hours": 24, "rainfall_multiplier": 1.0, "drainage_delta_pct": 0.0}),
    ("POST", "/api/v1/demo/optimize", {"available_crews": 3, "available_budget": 50000}),
    ("POST", "/api/v1/demo/simulate", {"rainfall_increase_pct": 20.0, "drainage_capacity_delta_pct": -10.0}),
    ("GET", "/api/v1/priority/rankings?district=Chennai", None),
    ("GET", "/api/v1/simulation/scenarios", None),
    ("POST", "/api/v1/simulation/run", {"rainfall_multiplier": 1.0, "available_budget": 50000, "available_hours": 24, "available_teams": 3}),
    ("POST", "/api/v1/optimization/run", {"available_budget": 50000, "available_hours": 24, "available_teams": 3}),
    ("GET", "/api/v1/rainfall/historical/district/Chennai", None),
    ("GET", "/api/v1/wards/1/metrics", None),
    ("GET", "/api/v1/explanations/ward/1?horizon_hours=24", None),
    ("GET", "/api/v1/explanations/model/feature-importance?horizon_hours=24", None),
    ("GET", "/api/v1/graph/risk-chain/1", None),
    ("GET", "/api/v1/search?q=Mylapore&district=Chennai", None),
]

print("=== CIVICPULSE MONSOON COMPREHENSIVE ENDPOINT AUDIT ===")
base = "http://127.0.0.1:8000"
for method, path, body in endpoints:
    url = base + path
    try:
        data = json.dumps(body).encode('utf-8') if body else None
        headers = {"Content-Type": "application/json"} if body else {}
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            content = resp.read()
            res_json = json.loads(content.decode('utf-8'))
            sample = ""
            if isinstance(res_json, dict):
                sample = f"keys: {list(res_json.keys())[:4]}"
                if "total" in res_json:
                    sample += f" total={res_json['total']}"
                if "features" in res_json:
                    sample += f" features_len={len(res_json['features'])}"
            elif isinstance(res_json, list):
                sample = f"list_len={len(res_json)}"
            print(f"[{status} OK] {method} {path} -> {sample}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')[:150]
        print(f"[{e.code} FAIL] {method} {path} -> {err_body}")
    except Exception as e:
        print(f"[ERROR] {method} {path} -> {e}")
