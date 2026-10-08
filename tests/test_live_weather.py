import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.services import weather_service

client = TestClient(app)

# ── 1. LIVE INTEGRATION TESTS (Calls real Open-Meteo provider) ──────────────

def test_chennai_unified_weather_endpoint_live():
    """
    Live Integration Test:
    GET /api/v1/weather/chennai
    Verifies HTTP 200, status=success, location=Chennai, current data and 12/24/48/72h forecast.
    """
    response = client.get("/api/v1/weather/chennai")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert data["location"] == "Chennai"
    assert data["latitude"] == pytest.approx(13.0827, abs=0.01)
    assert data["longitude"] == pytest.approx(80.2707, abs=0.01)
    assert data["status"] == "success"
    assert data["source"] == "Open-Meteo"
    assert data.get("is_live") is True
    assert "fetched_at" in data

    # Verify 'current' weather structure
    curr = data["current"]
    assert "temperature_c" in curr and isinstance(curr["temperature_c"], (int, float))
    assert "humidity_pct" in curr and isinstance(curr["humidity_pct"], (int, float))
    assert "precipitation_mm" in curr and isinstance(curr["precipitation_mm"], (int, float))
    assert "rainfall_mm" in curr and isinstance(curr["rainfall_mm"], (int, float))
    assert "wind_speed_kmh" in curr and isinstance(curr["wind_speed_kmh"], (int, float))
    assert "weather_code" in curr and isinstance(curr["weather_code"], int)
    assert "weather_condition" in curr
    assert "last_updated" in curr

    # Verify 'forecast' array structure (12h, 24h, 48h, 72h)
    assert "forecast" in data and isinstance(data["forecast"], list)
    assert len(data["forecast"]) >= 4

    horizons = {item["horizon_hours"]: item for item in data["forecast"]}
    for h in [12, 24, 48, 72]:
        assert h in horizons, f"Horizon {h}h missing from forecast"
        item = horizons[h]
        assert "rainfall_mm" in item and isinstance(item["rainfall_mm"], (int, float))
        assert "rain_probability_pct" in item and isinstance(item["rain_probability_pct"], (int, float))
        assert "period" in item

    # Verify hourly breakdown
    assert "hourly" in data and len(data["hourly"]) > 0

def test_chennai_live_weather_current_legacy():
    """Verify legacy GET /api/v1/weather/chennai/current endpoint."""
    response = client.get("/api/v1/weather/chennai/current")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "temperature_c" in data["current"]
    assert "humidity_pct" in data["current"]

def test_chennai_live_weather_forecast_legacy():
    """Verify legacy GET /api/v1/weather/chennai/forecast endpoint."""
    response = client.get("/api/v1/weather/chennai/forecast")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "forecast" in data
    assert "summaries" in data


# ── 2. OFFLINE UNIT TEST (Uses mock fixture to test parsing resilience) ─────

MOCK_OPEN_METEO_PAYLOAD = {
    "latitude": 13.08,
    "longitude": 80.28,
    "generationtime_ms": 0.12,
    "utc_offset_seconds": 19800,
    "timezone": "Asia/Kolkata",
    "timezone_abbreviation": "IST",
    "elevation": 7.0,
    "current": {
        "time": "2026-10-07T10:30",
        "interval": 900,
        "temperature_2m": 31.8,
        "relative_humidity_2m": 62,
        "apparent_temperature": 37.5,
        "precipitation": 1.2,
        "rain": 1.2,
        "weather_code": 61,
        "cloud_cover": 75,
        "wind_speed_10m": 14.5,
        "wind_direction_10m": 120
    },
    "hourly": {
        "time": [f"2026-10-07T{h:02d}:00" for h in range(24)] + [f"2026-10-08T{h:02d}:00" for h in range(24)] + [f"2026-10-09T{h:02d}:00" for h in range(24)] + [f"2026-10-10T{h:02d}:00" for h in range(24)],
        "temperature_2m": [30.0 + (i % 5) for i in range(96)],
        "precipitation": [0.5 if i % 6 == 0 else 0.0 for i in range(96)],
        "precipitation_probability": [40 if i % 6 == 0 else 10 for i in range(96)],
        "weather_code": [61 if i % 6 == 0 else 1 for i in range(96)],
        "wind_speed_10m": [12.0 for _ in range(96)]
    }
}

def test_weather_offline_parsing():
    """Offline unit test: tests normalization without external network calls."""
    normalized = weather_service.normalize_weather_data(
        MOCK_OPEN_METEO_PAYLOAD,
        lat=13.0827,
        lon=80.2707,
        location_name="Chennai"
    )

    assert normalized["location"] == "Chennai"
    assert normalized["current"]["temperature_c"] == 31.8
    assert normalized["current"]["humidity_pct"] == 62
    assert normalized["current"]["precipitation_mm"] == 1.2
    assert normalized["current"]["rainfall_mm"] == 1.2
    assert normalized["current"]["wind_speed_kmh"] == 14.5
    assert normalized["current"]["weather_code"] == 61
    assert normalized["current"]["weather_condition"] == "Slight Rain"
    assert normalized["current"]["wind_direction_cardinal"] == "ESE"

    # Verify forecast horizons
    horizons = {f["horizon_hours"]: f for f in normalized["forecast"]}
    assert 12 in horizons
    assert 24 in horizons
    assert 48 in horizons
    assert 72 in horizons
    assert horizons[12]["rainfall_mm"] >= 0.0

def test_weather_stale_cache_graceful_fallback():
    """
    Offline unit test:
    Verifies that when upstream provider fails after a successful fetch,
    stale cache is served with status="CACHED", is_live=False, and NEVER fake synthetic data.
    """
    # Prime cache with mock
    weather_service._weather_cache = None
    weather_service._last_successful_payload = weather_service.normalize_weather_data(
        MOCK_OPEN_METEO_PAYLOAD,
        lat=13.0827,
        lon=80.2707,
        location_name="Chennai"
    )
    weather_service._last_successful_time = 1000000.0

    # Force upstream failure
    with patch("app.services.weather_service.fetch_weather_from_provider", side_effect=RuntimeError("Connection timeout")):
        result = weather_service.get_chennai_weather(force_refresh=True)
        assert result["status"] == "CACHED"
        assert result["is_live"] is False
        assert "Upstream provider momentarily unreachable" in result.get("warning", "")
        assert result["current"]["temperature_c"] == 31.8
