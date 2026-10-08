import os
import sys
sys.path.insert(0, os.path.abspath("backend"))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.terrain_service import TerrainService

client = TestClient(app)

def test_terrain_service_summary():
    """Verify TerrainService loads the verified DEM terrain statistics."""
    summary = TerrainService.get_chennai_terrain_summary()
    assert summary["city"] == "Chennai"
    assert summary["total_gcc_wards"] == 200
    assert summary["verified_wards"] == 200
    assert summary["unavailable_wards"] == 0
    assert "Copernicus" in summary["dem_source"] or "SRTM" in summary["dem_source"]
    
    stats = summary["city_elevation_stats"]
    assert stats["min_elevation_m"] >= 0.0
    assert stats["max_elevation_m"] <= 100.0
    assert 5.0 <= stats["mean_elevation_m"] <= 15.0
    assert stats["low_lying_ward_count"] > 0

def test_terrain_service_wards():
    """Verify individual ward terrain retrieval."""
    # North coastal ward (low elevation)
    w1 = TerrainService.get_chennai_ward_terrain(1)
    assert w1["ward_id"] == 1
    assert w1["elevation_mean_m"] is not None
    assert 1.0 <= w1["elevation_mean_m"] <= 8.0
    assert w1["is_low_lying"] is True
    assert w1["terrain_status"] == "VERIFIED"

    # Central urban ward
    w114 = TerrainService.get_chennai_ward_terrain(114)
    assert w114["ward_id"] == 114
    assert w114["elevation_mean_m"] is not None
    assert 5.0 <= w114["elevation_mean_m"] <= 15.0
    assert w114["terrain_status"] == "VERIFIED"

def test_api_terrain_endpoints():
    """Verify FastAPI terrain endpoints."""
    # Summary endpoint
    res = client.get("/api/v1/terrain/chennai/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_gcc_wards"] == 200
    assert data["verified_wards"] == 200

    # Single ward endpoint
    res_w1 = client.get("/api/v1/terrain/chennai/wards/1")
    assert res_w1.status_code == 200
    w1 = res_w1.json()
    assert w1["ward_number"] == 1
    assert w1["elevation_mean_m"] is not None

def test_ward_metrics_terrain_and_population_coexistence():
    """Verify that ward metrics endpoint serves both verified terrain and verified Census population."""
    # Ward 1: Both Census population and terrain verified
    res1 = client.get("/api/v1/wards/1/metrics")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["population"] == 51163
    assert d1["elevation_m"] is not None
    assert d1["terrain_status"] == "VERIFIED"

    # Ward 170: Pre-merger ward with population UNAVAILABLE but terrain VERIFIED
    res170 = client.get("/api/v1/wards/170/metrics")
    assert res170.status_code == 200
    d170 = res170.json()
    assert d170["population"] is None
    assert d170["population_status"] == "POPULATION_DATA_UNAVAILABLE"
    assert d170["elevation_m"] is not None
    assert d170["terrain_status"] == "VERIFIED"
