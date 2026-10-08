import httpx
import time

print("=== 1. VERIFYING WEATHER PROVIDER (Open-Meteo) DIRECTLY ===")
url_provider = (
    "https://api.open-meteo.com/v1/forecast?"
    "latitude=13.0827&longitude=80.2707"
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m"
    "&hourly=temperature_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m"
    "&timezone=Asia%2FKolkata&forecast_days=4"
)
t0 = time.time()
r_prov = httpx.get(url_provider, timeout=10.0)
elapsed_prov = time.time() - t0
print(f"Provider HTTP Status: {r_prov.status_code} in {elapsed_prov:.2f}s")
data_prov = r_prov.json()
print("Location Coordinates: 13.0827 N, 80.2707 E")
print("Current Weather Fields:", list(data_prov.get("current", {}).keys()))
print("Forecast Hourly Fields:", list(data_prov.get("hourly", {}).keys()))

print("\n=== 2. VERIFYING CIVICPULSE BACKEND ENDPOINT (/api/v1/weather/chennai) ===")
t1 = time.time()
r_be = httpx.get("http://127.0.0.1:8000/api/v1/weather/chennai", timeout=10.0)
elapsed_be = time.time() - t1
print(f"Backend HTTP Status: {r_be.status_code} in {elapsed_be:.2f}s")
data_be = r_be.json()
print("Location:", data_be.get("location"))
print("Status:", data_be.get("status"), "| is_live:", data_be.get("is_live"))
print("Source:", data_be.get("source"))
print("Fetched At:", data_be.get("fetched_at"))
print("Current Telemetry:", data_be.get("current"))
print("Forecast Horizons (Count):", len(data_be.get("forecast", [])))
for fc in data_be.get("forecast", []):
    print(f"  - {fc['period']}: {fc['rainfall_mm']}mm rain (prob: {fc['rain_probability_pct']}%), avg temp: {fc.get('avg_temperature_c')}°C")

print("\n=== 3. VERIFYING NEXT.JS REWRITE PROXY (http://localhost:3000/api/v1/weather/chennai) ===")
t2 = time.time()
r_fe_api = httpx.get("http://localhost:3000/api/v1/weather/chennai", timeout=10.0)
elapsed_fe_api = time.time() - t2
print(f"Frontend Proxy HTTP Status: {r_fe_api.status_code} in {elapsed_fe_api:.2f}s")
data_fe = r_fe_api.json()
print("Proxy returned location:", data_fe.get("location"), "| Temp:", data_fe.get("current", {}).get("temperature_c"), "°C")

print("\n=== 4. VERIFYING NEXT.JS FRONTEND ROOT (http://localhost:3000/) ===")
t3 = time.time()
r_fe_root = httpx.get("http://localhost:3000/", timeout=20.0)
elapsed_fe_root = time.time() - t3
print(f"Frontend Root HTTP Status: {r_fe_root.status_code} in {elapsed_fe_root:.2f}s")
assert r_fe_root.status_code == 200
print("Frontend page delivered successfully!")
