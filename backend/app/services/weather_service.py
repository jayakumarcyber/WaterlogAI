"""
Chennai Live Weather Service
Fetches real, coordinate-based weather and forecast for Chennai from Open-Meteo API.
Includes:
- Single source of truth for Chennai coordinates
- Retry logic for upstream meteorological requests
- Short-lived caching (10 min TTL)
- Graceful stale-cache fallback (marked 'CACHED / STALE' - NEVER fake or synthetic data)
- Exact format required:
  location, latitude, longitude, status, source, current, forecast (12h, 24h, 48h, 72h)
- Asia/Kolkata timezone normalization
"""

import os
import time
import logging
import tempfile
import httpx
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Dict, Any, Optional, List
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger("civicpulse.weather")

# ── 1. Authoritative Coordinate Source of Truth ─────────────────────────────
CHENNAI_COORDINATES: Dict[str, Any] = {
    "location": "Chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "latitude": float(getattr(settings, "CHENNAI_LATITUDE", 13.0827)),
    "longitude": float(getattr(settings, "CHENNAI_LONGITUDE", 80.2707)),
    "timezone": getattr(settings, "CHENNAI_TIMEZONE", "Asia/Kolkata")
}

CHENNAI_LAT: float = CHENNAI_COORDINATES["latitude"]
CHENNAI_LON: float = CHENNAI_COORDINATES["longitude"]
TIMEZONE_STR: str = CHENNAI_COORDINATES["timezone"]
TZ: ZoneInfo = ZoneInfo(TIMEZONE_STR)

# ── 2. Cache Configuration ──────────────────────────────────────────────────
# Active cache TTL (10 minutes)
WEATHER_CACHE_TTL: int = 600

import json
from pathlib import Path

# Cache file on disk for graceful survival across server restarts & cold DNS blips
CACHE_FILE_PATH: Path = (
    Path(tempfile.gettempdir()) / ".weather_cache.json"
    if (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    else Path(__file__).resolve().parent.parent / ".weather_cache.json"
)

# In-memory caches
_weather_cache: Optional[Dict[str, Any]] = None
_last_successful_payload: Optional[Dict[str, Any]] = None
_last_successful_time: Optional[float] = None

def _save_persistent_cache(data: Dict[str, Any], timestamp: float) -> None:
    try:
        payload = {"timestamp": timestamp, "data": data}
        with open(CACHE_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f)
    except Exception as e:
        logger.warning(f"Could not persist weather cache: {e}")

def _load_persistent_cache() -> None:
    global _weather_cache, _last_successful_payload, _last_successful_time
    try:
        if CACHE_FILE_PATH.exists():
            with open(CACHE_FILE_PATH, "r", encoding="utf-8") as f:
                payload = json.load(f)
                if isinstance(payload, dict) and "data" in payload:
                    _last_successful_payload = payload["data"]
                    _last_successful_time = payload.get("timestamp", time.time())
                    _weather_cache = {
                        "timestamp": _last_successful_time,
                        "data": _last_successful_payload
                    }
    except Exception as e:
        logger.warning(f"Could not load persistent weather cache: {e}")

# Pre-load persistent cache on startup
_load_persistent_cache()

# WMO Weather Condition Interpretations
WMO_WEATHER_CODES: Dict[int, str] = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",
    61: "Slight Rain",
    62: "Rain (Moderate)",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
}

def degrees_to_cardinal(deg: Optional[float]) -> str:
    if deg is None:
        return "N/A"
    directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    val = int((deg / 22.5) + 0.5)
    return directions[val % 16]

# ── 3. Persistent Client & Upstream Provider Fetch with Retry ──────────────
_http_client: Optional[httpx.Client] = None

def get_http_client() -> httpx.Client:
    """Reusable HTTP client with connection pooling and SSL session reuse."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.Client(
            timeout=httpx.Timeout(connect=10.0, read=10.0, write=5.0, pool=10.0),
            follow_redirects=True,
            headers={"User-Agent": "CivicPulse-Monsoon/1.0"}
        )
    return _http_client

class WeatherError(Exception):
    """Custom exception capturing explicit root causes for meteorological integration."""
    def __init__(self, error_code: str, message: str, status_code: int = 503):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        super().__init__(f"[{error_code}] {message}")

def fetch_weather_from_provider(
    lat: float = CHENNAI_LAT,
    lon: float = CHENNAI_LON,
    max_retries: int = 2,
    timeout_secs: float = 10.0
) -> Dict[str, Any]:
    """
    Fetch raw 4-day forecast + current weather from Open-Meteo API.
    Retries up to max_retries on transient failure (network/5xx).
    Does NOT retry 400-level malformed requests.
    Logs each stage as required.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m,weather_code,cloud_cover,wind_direction_10m"
        f"&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,precipitation_probability,weather_code"
        f"&timezone=Asia%2FKolkata&forecast_days=4"
    )

    logger.info("Weather request started")
    logger.info(f"Weather provider URL: {url}")
    print(f"[WEATHER LOG] Weather request started")
    print(f"[WEATHER LOG] Weather provider URL: {url}")

    client = get_http_client()
    last_error: Optional[WeatherError] = None

    for attempt in range(max_retries + 1):
        try:
            resp = client.get(url, timeout=timeout_secs)
            logger.info(f"HTTP status: {resp.status_code}")
            print(f"[WEATHER LOG] HTTP status: {resp.status_code}")

            if resp.status_code == 200:
                logger.info("Response received")
                print(f"[WEATHER LOG] Response received")
                try:
                    data = resp.json()
                except Exception as json_err:
                    raise WeatherError("INVALID_JSON", f"Malformed JSON payload returned: {json_err}", status_code=502)
                logger.info("Parsing succeeded")
                print(f"[WEATHER LOG] Parsing succeeded")
                return data
            elif 400 <= resp.status_code < 500:
                # Malformed request — do not retry 4xx errors
                last_error = WeatherError("UPSTREAM_4XX", f"Open-Meteo client error HTTP {resp.status_code}: {resp.text[:120]}", status_code=502)
                logger.error(f"Provider request failed: {last_error}")
                print(f"[WEATHER LOG] Provider request failed: {last_error}")
                raise last_error
            else:
                last_error = WeatherError("UPSTREAM_5XX", f"Open-Meteo server error HTTP {resp.status_code}", status_code=502)
                logger.warning(f"Provider request failed (attempt {attempt + 1}/{max_retries + 1}): {last_error}")
                print(f"[WEATHER LOG] Provider request failed (attempt {attempt + 1}/{max_retries + 1}): {last_error}")
        except WeatherError as we:
            if we.error_code == "UPSTREAM_4XX":
                raise
            last_error = we
        except (httpx.TimeoutException, TimeoutError) as t_err:
            last_error = WeatherError("TIMEOUT", f"Open-Meteo connection timed out ({timeout_secs}s): {t_err}", status_code=504)
            logger.warning(f"Provider request timed out (attempt {attempt + 1}/{max_retries + 1}): {t_err}")
            print(f"[WEATHER LOG] Provider request timed out (attempt {attempt + 1}/{max_retries + 1}): {t_err}")
        except httpx.NetworkError as net_err:
            last_error = WeatherError("NETWORK_ERROR", f"Network connectivity error contacting Open-Meteo: {net_err}", status_code=502)
            logger.warning(f"Provider network error (attempt {attempt + 1}/{max_retries + 1}): {net_err}")
            print(f"[WEATHER LOG] Provider network error (attempt {attempt + 1}/{max_retries + 1}): {net_err}")
        except Exception as exc:
            last_error = WeatherError("NETWORK_ERROR", f"Unexpected error contacting Open-Meteo: {exc}", status_code=500)
            logger.warning(f"Provider request failed (attempt {attempt + 1}/{max_retries + 1}): {exc}")
            print(f"[WEATHER LOG] Provider request failed (attempt {attempt + 1}/{max_retries + 1}): {exc}")

        if attempt < max_retries:
            time.sleep(0.5)

    logger.error(f"Provider request failed: {last_error}")
    print(f"[WEATHER LOG] Provider request failed: {last_error}")
    raise last_error or WeatherError("NETWORK_ERROR", "Open-Meteo provider call failed after retries")

# ── 4. Normalization Engine ─────────────────────────────────────────────────
def normalize_weather_data(
    raw: Dict[str, Any],
    lat: float = CHENNAI_LAT,
    lon: float = CHENNAI_LON,
    location_name: str = "Chennai"
) -> Dict[str, Any]:
    """
    Transform raw Open-Meteo payload into structured, normalized schema.
    Conforms to both Section 5 backend schema and detailed dashboard component needs.
    """
    now_kolkata = datetime.now(TZ)
    fetched_at = now_kolkata.isoformat()

    curr_raw = raw.get("current", {})
    weather_code = int(curr_raw.get("weather_code", 0))
    wind_dir = curr_raw.get("wind_direction_10m")
    precip_val = float(curr_raw.get("precipitation", 0.0))
    rain_val = float(curr_raw.get("rain", precip_val))

    current_data = {
        "temperature_c": float(curr_raw.get("temperature_2m", 0.0)),
        "feels_like_c": float(curr_raw.get("apparent_temperature", curr_raw.get("temperature_2m", 0.0))),
        "humidity_pct": int(curr_raw.get("relative_humidity_2m", 0)),
        "precipitation_mm": precip_val,
        "rainfall_mm": rain_val,
        "rain_mm": rain_val,
        "wind_speed_kmh": float(curr_raw.get("wind_speed_10m", 0.0)),
        "wind_direction_deg": wind_dir,
        "wind_direction_cardinal": degrees_to_cardinal(wind_dir),
        "weather_code": weather_code,
        "weather_condition": WMO_WEATHER_CODES.get(weather_code, f"Code {weather_code}"),
        "cloud_cover_pct": int(curr_raw.get("cloud_cover", 0)),
        "last_updated": curr_raw.get("time", now_kolkata.strftime("%Y-%m-%dT%H:%M"))
    }

    # Extract hourly forecast
    hourly_raw = raw.get("hourly", {})
    times = hourly_raw.get("time", [])
    temps = hourly_raw.get("temperature_2m", [])
    precips = hourly_raw.get("precipitation", [])
    rains = hourly_raw.get("rain", precips)
    humidities = hourly_raw.get("relative_humidity_2m", [])
    probs = hourly_raw.get("precipitation_probability", [])
    codes = hourly_raw.get("weather_code", [])
    winds = hourly_raw.get("wind_speed_10m", [])

    # Find the current hour index
    current_hour_prefix = now_kolkata.strftime("%Y-%m-%dT%H")
    start_idx = 0
    for idx, t_str in enumerate(times):
        if t_str.startswith(current_hour_prefix):
            start_idx = idx
            break

    # Next 24-48 hourly points
    next_hourly: List[Dict[str, Any]] = []
    for i in range(start_idx, min(start_idx + 48, len(times))):
        c = codes[i] if i < len(codes) else 0
        t_val = times[i]
        try:
            dt_parsed = datetime.fromisoformat(t_val)
            display_time = dt_parsed.strftime("%I:%M %p")
            hour_label = dt_parsed.strftime("%H:00")
        except Exception:
            display_time = t_val
            hour_label = t_val

        next_hourly.append({
            "iso_time": t_val,
            "display_time": display_time,
            "hour_label": hour_label,
            "temperature_c": float(temps[i]) if i < len(temps) else 0.0,
            "precipitation_mm": float(precips[i]) if i < len(precips) else 0.0,
            "rain_mm": float(rains[i]) if i < len(rains) else (float(precips[i]) if i < len(precips) else 0.0),
            "humidity_pct": int(humidities[i]) if i < len(humidities) else 0,
            "rain_probability_pct": int(probs[i]) if i < len(probs) else 0,
            "wind_speed_kmh": float(winds[i]) if i < len(winds) else 0.0,
            "weather_condition": WMO_WEATHER_CODES.get(c, f"Code {c}"),
            "weather_code": c
        })

    # Helper for horizon statistics: 12h, 24h, 48h, 72h
    def get_horizon_stats(hours: int):
        end_idx = min(start_idx + hours, len(precips))
        window_p = precips[start_idx:end_idx]
        window_prob = probs[start_idx:end_idx] if len(probs) >= end_idx else []
        window_t = temps[start_idx:end_idx] if len(temps) >= end_idx else []
        
        total_p = round(sum(window_p), 1) if window_p else 0.0
        max_prob = max(window_prob) if window_prob else 0
        avg_temp = round(sum(window_t) / len(window_t), 1) if window_t else 0.0

        return total_p, max_prob, avg_temp

    p12, prob12, avg12 = get_horizon_stats(12)
    p24, prob24, avg24 = get_horizon_stats(24)
    p48, prob48, avg48 = get_horizon_stats(48)
    p72, prob72, avg72 = get_horizon_stats(72)

    # Standard forecast horizons array (12h, 24h, 48h, 72h)
    forecast_horizons = [
        {
            "horizon_hours": 12,
            "period": "12 Hours",
            "rainfall_mm": p12,
            "rain_probability_pct": prob12,
            "avg_temperature_c": avg12,
            "context_label": "Live Forecast Context - 12 Hours"
        },
        {
            "horizon_hours": 24,
            "period": "24 Hours",
            "rainfall_mm": p24,
            "rain_probability_pct": prob24,
            "avg_temperature_c": avg24,
            "context_label": "Live Forecast Context - 24 Hours"
        },
        {
            "horizon_hours": 48,
            "period": "48 Hours",
            "rainfall_mm": p48,
            "rain_probability_pct": prob48,
            "avg_temperature_c": avg48,
            "context_label": "Live Forecast Context - 48 Hours"
        },
        {
            "horizon_hours": 72,
            "period": "72 Hours",
            "rainfall_mm": p72,
            "rain_probability_pct": prob72,
            "avg_temperature_c": avg72,
            "context_label": "Live Forecast Context - 72 Hours"
        }
    ]

    summaries = {
        "next_24h": {
            "period": "Next 24 Hours",
            "rainfall_total_mm": p24,
            "max_rain_probability_pct": prob24,
            "context_label": "Live Weather Context - Atmospheric"
        },
        "next_48h": {
            "period": "Next 48 Hours",
            "rainfall_total_mm": p48,
            "max_rain_probability_pct": prob48,
            "context_label": "Forecast Context - 48 Hours"
        },
        "next_72h": {
            "period": "Next 72 Hours",
            "rainfall_total_mm": p72,
            "max_rain_probability_pct": prob72,
            "context_label": "Forecast Context - 72 Hours"
        }
    }

    return {
        "location": location_name,
        "latitude": round(lat, 4),
        "longitude": round(lon, 4),
        "status": "success",
        "is_live": True,
        "source": "Open-Meteo",
        "updated_at": fetched_at,
        "fetched_at": fetched_at,
        "timezone": TIMEZONE_STR,
        "current": current_data,
        "forecast": forecast_horizons,
        "hourly": next_hourly,
        "summaries": summaries
    }

def check_provider_health() -> Dict[str, Any]:
    """Check connectivity to Open-Meteo provider."""
    global _last_successful_payload, _last_successful_time
    now = time.time()
    # If fresh fetch occurred recently (< 120s), report reachable immediately
    if _last_successful_payload and _last_successful_time and (now - _last_successful_time < 120):
        return {
            "provider": "Open-Meteo",
            "reachable": True,
            "latency_ms": 120,
            "last_success": _last_successful_payload.get("fetched_at")
        }

    start = time.time()
    try:
        fetch_weather_from_provider(lat=CHENNAI_LAT, lon=CHENNAI_LON, max_retries=1, timeout_secs=10.0)
        latency_ms = int((time.time() - start) * 1000)
        last_success = _last_successful_payload.get("fetched_at") if _last_successful_payload else datetime.now(TZ).isoformat()
        return {
            "provider": "Open-Meteo",
            "reachable": True,
            "latency_ms": latency_ms,
            "last_success": last_success
        }
    except Exception as e:
        latency_ms = int((time.time() - start) * 1000)
        return {
            "provider": "Open-Meteo",
            "reachable": False,
            "latency_ms": latency_ms,
            "last_success": _last_successful_payload.get("fetched_at") if _last_successful_payload else None,
            "error": str(e)
        }

def get_chennai_debug_diagnostics() -> Dict[str, Any]:
    """Return safe diagnostics for Open-Meteo connectivity."""
    reachable = False
    provider_status = 503
    parser_ok = False
    try:
        raw = fetch_weather_from_provider(lat=CHENNAI_LAT, lon=CHENNAI_LON, max_retries=1, timeout_secs=10.0)
        reachable = True
        provider_status = 200
        norm = normalize_weather_data(raw, lat=CHENNAI_LAT, lon=CHENNAI_LON, location_name="Chennai")
        parser_ok = bool(norm and "current" in norm and "temperature_c" in norm["current"])
    except Exception as exc:
        logger.warning(f"Diagnostics probe error: {exc}")

    return {
        "provider": "Open-Meteo",
        "provider_reachable": reachable,
        "provider_http_status": provider_status,
        "location": "Chennai",
        "latitude": CHENNAI_LAT,
        "longitude": CHENNAI_LON,
        "parser_ok": parser_ok,
        "cache_available": _last_successful_payload is not None
    }

# ── 5. Cache Access & Stale Fallback Logic ──────────────────────────────────
def get_chennai_weather(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Retrieve live weather for Chennai.
    Behavior:
    1. If cached within 10 min TTL and not force_refresh: return cached live payload.
    2. Attempt to fetch fresh telemetry from Open-Meteo with retries.
    3. If Open-Meteo succeeds: cache and return with status="success", is_live=True.
    4. If Open-Meteo fails but previous telemetry exists: return stale cache with
       status="CACHED", is_live=False, exact previous fetched_at timestamp.
       NEVER return fake or synthetic values.
    5. If Open-Meteo fails and NO previous telemetry exists: raise HTTP 503.
    """
    global _weather_cache, _last_successful_payload, _last_successful_time
    now = time.time()

    # Serve valid in-TTL cache if available
    if not force_refresh and _weather_cache is not None:
        cached_age = now - _weather_cache["timestamp"]
        if cached_age < WEATHER_CACHE_TTL:
            cached_payload = dict(_weather_cache["data"])
            cached_payload["cached_age_seconds"] = int(cached_age)
            return cached_payload

    # Fetch from Open-Meteo
    try:
        raw = fetch_weather_from_provider(lat=CHENNAI_LAT, lon=CHENNAI_LON)
        normalized = normalize_weather_data(raw, lat=CHENNAI_LAT, lon=CHENNAI_LON, location_name="Chennai")

        _weather_cache = {
            "timestamp": now,
            "data": normalized
        }
        _last_successful_payload = normalized
        _last_successful_time = now
        _save_persistent_cache(normalized, now)

        result = dict(normalized)
        result["cached_age_seconds"] = 0
        return result

    except Exception as exc:
        error_code = getattr(exc, "error_code", "NETWORK_ERROR")
        logger.error(f"[LiveWeather] [{error_code}] Upstream Open-Meteo fetch failed: {exc}")

        # Check if we have a stale cached response to serve gracefully
        if _last_successful_payload is not None:
            stale_age = int(now - (_last_successful_time or now))
            logger.info(f"[LiveWeather] Serving STALE cached payload (age: {stale_age}s) due to upstream {error_code}.")
            stale_payload = dict(_last_successful_payload)
            stale_payload["status"] = "CACHED"
            stale_payload["is_live"] = False
            stale_payload["cached_age_seconds"] = stale_age
            stale_payload["warning"] = f"Upstream provider momentarily unreachable ({error_code}). Serving cached data from {_last_successful_payload.get('fetched_at')}"
            stale_payload["error_code"] = error_code
            return stale_payload

        # No cache available — surface honest error with real root cause
        raise HTTPException(
            status_code=503,
            detail=f"[{error_code}] Live weather temporarily unavailable: {str(exc)}"
        )

def get_current_weather(force_refresh: bool = False) -> Dict[str, Any]:
    """Compatibility method for legacy /chennai/current endpoint."""
    return get_chennai_weather(force_refresh=force_refresh)

def get_forecast_weather(force_refresh: bool = False) -> Dict[str, Any]:
    """Compatibility method for legacy /chennai/forecast endpoint."""
    return get_chennai_weather(force_refresh=force_refresh)

def get_weather_for_coordinates(
    lat: float,
    lon: float,
    location_name: str = "Custom Location",
    force_refresh: bool = False
) -> Dict[str, Any]:
    """Retrieve live weather for specified coordinates (for statewide location support)."""
    raw = fetch_weather_from_provider(lat=lat, lon=lon)
    return normalize_weather_data(raw, lat=lat, lon=lon, location_name=location_name)
