import os
import sys
sys.path.insert(0, os.path.abspath("backend"))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.drainage_service import DrainageService

client = TestClient(app)

def test_drainage_service_summary():
    """Verify DrainageService loads the verified drainage and road network statistics."""
    summary = DrainageService.get_chennai_drainage_summary()
    assert summary["city"] == "Chennai"
    assert summary["total_gcc_wards"] == 200
    assert summary["total_drain_features"] == 10255
    assert summary["total_road_features"] == 2840
    assert summary["total_waterbody_features"] == 758
    
    net = summary["network_summary"]
    assert net["total_drain_length_km_study_area"] > 500.0
    assert net["total_drain_length_km_in_wards"] > 250.0
    assert net["wards_with_mapped_drains"] > 140
    assert net["total_road_length_km_study_area"] > 500.0
    assert net["total_road_length_km_in_wards"] > 500.0

def test_drainage_service_wards():
    """Verify ward-level drainage metrics retrieval."""
    # North coastal ward (Ward 1)
    w1 = DrainageService.get_chennai_ward_drainage(1)
    assert w1["ward_id"] == 1
    assert w1["drain_length_km"] > 2.0
    assert w1["road_length_km"] > 1.0
    assert w1["drainage_capacity"] == "Data Unavailable"
    assert w1["maintenance_condition"] == "Data Unavailable"
    assert w1["data_status"] in ["VERIFIED_GEOMETRY", "VERIFIED_OFFICIAL_GEOMETRIES"]

    # Central urban ward (Ward 114 - T. Nagar / Teynampet)
    w114 = DrainageService.get_chennai_ward_drainage(114)
    assert w114["ward_id"] == 114
    assert w114["drain_length_km"] > 1.5
    assert w114["road_length_km"] > 2.0
    assert w114["waterbody_count"] >= 5

def test_api_drainage_network_endpoints():
    """Verify network GeoJSON endpoints."""
    # Drains network
    res_d = client.get("/api/v1/drainage/chennai/network/drains")
    assert res_d.status_code == 200
    d_data = res_d.json()
    assert d_data["type"] == "FeatureCollection"
    assert len(d_data["features"]) == 10255
    assert d_data["features"][0]["geometry"]["type"] == "LineString"

    # Roads network
    res_r = client.get("/api/v1/drainage/chennai/network/roads")
    assert res_r.status_code == 200
    r_data = res_r.json()
    assert r_data["type"] == "FeatureCollection"
    assert len(r_data["features"]) == 2840
    assert r_data["features"][0]["geometry"]["type"] == "LineString"

    # Waterbodies network
    res_w = client.get("/api/v1/drainage/chennai/network/waterbodies")
    assert res_w.status_code == 200
    w_data = res_w.json()
    assert len(w_data["features"]) == 758

def test_ward_metrics_drainage_population_elevation_coexistence():
    """Verify that ward metrics serves authentic population, elevation, and drainage metrics simultaneously."""
    # Ward 1: All verified
    res1 = client.get("/api/v1/wards/1/metrics")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["population"] == 51163
    assert d1["elevation_m"] == 3.7
    assert d1["drain_length_km"] > 2.0
    assert d1["road_length_km"] > 1.0
    assert d1["drainage_capacity"] == "Data Unavailable"

    # Ward 170: Pre-merger ward with Population UNAVAILABLE, but Elevation and Drainage VERIFIED
    res170 = client.get("/api/v1/wards/170/metrics")
    assert res170.status_code == 200
    d170 = res170.json()
    assert d170["population"] is None
    assert d170["population_status"] == "POPULATION_DATA_UNAVAILABLE"
    assert d170["elevation_m"] == 8.7
    assert d170["drain_length_km"] > 1.0
    assert d170["road_length_km"] > 5.0
    assert d170["drainage_capacity"] == "Data Unavailable"
