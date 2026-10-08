import os
import sys
sys.path.insert(0, os.path.abspath("backend"))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.incident_service import IncidentService

@pytest.fixture
def client():
    return TestClient(app)

def test_incident_summary_endpoint(client):
    """Test /api/v1/incidents/summary endpoint returns verified citywide incident statistics."""
    resp = client.get("/api/v1/incidents/summary")
    assert resp.status_code == 200
    data = resp.json()
    
    assert data["city"] == "Chennai"
    assert data["total_verified_incidents"] == 1325
    assert data["spatially_mapped_to_gcc_wards"] == 1323
    assert data["unmapped_records"] == 2
    assert data["total_gcc_wards"] == 200
    assert data["wards_with_verified_incidents"] == 185
    assert data["ward_incident_coverage_pct"] >= 90.0
    
    # Check events and years
    assert "2015" in data["incidents_by_year"]
    assert "2020" in data["incidents_by_year"]
    assert "Chennai Floods 2015" in data["incidents_by_event"]
    assert "Cyclone Nivar Flooding 2020" in data["incidents_by_event"]
    
    # Check severity distribution
    assert data["incidents_by_severity"]["critical"] > 0
    assert data["incidents_by_severity"]["high"] > 0
    assert data["incidents_by_severity"]["medium"] > 0
    
    # Verify non-fabrication policy
    assert data["data_policy"]["rainfall_converted_to_incident"] is False
    assert data["data_policy"]["fabrication_permitted"] is False

def test_incident_geojson_endpoint(client):
    """Test /api/v1/incidents/geojson endpoint returns verified GeoJSON within Chennai coordinates."""
    resp = client.get("/api/v1/incidents/geojson")
    assert resp.status_code == 200
    data = resp.json()
    
    assert data["type"] == "FeatureCollection"
    assert 1323 <= len(data["features"]) <= 1325
    
    # Check sample feature properties and coordinates
    sample = data["features"][0]
    assert sample["geometry"]["type"] == "Point"
    lon, lat = sample["geometry"]["coordinates"]
    
    # Valid Chennai geographic bounds: Lat ~ [12.85, 13.3], Lon ~ [80.05, 80.35]
    assert 12.85 <= lat <= 13.30
    assert 80.05 <= lon <= 80.35
    
    props = sample["properties"]
    assert props["incident_type"] == "waterlogging"
    assert props["evidence_level"] == "VERIFIED INCIDENT"
    assert "source" in props
    assert "event_date" in props

def test_incident_ward_summaries(client):
    """Test /api/v1/incidents/chennai/wards returns metrics for all 200 GCC wards."""
    resp = client.get("/api/v1/incidents/chennai/wards")
    assert resp.status_code == 200
    data = resp.json()
    
    assert len(data) == 200
    
    # Verify specific test wards
    ward_1 = next((w for w in data if w["ward_id"] == 1), None)
    assert ward_1 is not None
    assert ward_1["total_verified_incidents"] == 5
    
    ward_109 = next((w for w in data if w["ward_id"] == 109), None)
    assert ward_109 is not None
    assert ward_109["total_verified_incidents"] == 5
    
    ward_177 = next((w for w in data if w["ward_id"] == 177), None)
    assert ward_177 is not None
    assert ward_177["total_verified_incidents"] == 48
    assert ward_177["max_measured_depth_ft"] == "9.5"

def test_specific_ward_detail_endpoint(client):
    """Test /api/v1/incidents/chennai/wards/{ward_id} endpoint."""
    resp = client.get("/api/v1/incidents/chennai/wards/177")
    assert resp.status_code == 200
    data = resp.json()
    
    assert data["ward_id"] == 177
    assert data["total_verified_incidents"] == 48
    assert data["critical_incidents"] > 0
    assert data["max_measured_depth_ft"] == "9.5"
    assert data["data_status"] == "VERIFIED_OFFICIAL_INCIDENTS"

def test_secondary_evidence_geojson(client):
    """Test /api/v1/incidents/secondary/geojson returns secondary crowdsourced features."""
    resp = client.get("/api/v1/incidents/secondary/geojson")
    assert resp.status_code == 200
    data = resp.json()
    
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 7894
    assert data["features"][0]["geometry"]["type"] == "LineString"
    assert data["features"][0]["properties"]["evidence_level"] == "SECONDARY EVIDENCE"

def test_no_synthetic_mumbai_coordinates_in_official_flow(client):
    """Confirm no synthetic Mumbai records (lat ~19.0, lon ~72.8) appear in official API output."""
    resp = client.get("/api/v1/incidents?limit=500")
    assert resp.status_code == 200
    data = resp.json()
    
    for inc in data:
        lat = inc["latitude"]
        lon = inc["longitude"]
        # Must not be Mumbai
        assert not (18.8 <= lat <= 19.3 and 72.7 <= lon <= 73.0)
        # Must be in Chennai
        assert 12.85 <= lat <= 13.30
        assert 80.05 <= lon <= 80.35

def test_population_wards_156_200_preserved(client):
    """Ensure wards 156-200 still show Population: Data Unavailable."""
    resp = client.get("/api/v1/wards/180/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert data["population"] is None
    assert data["population_status"] == "POPULATION_DATA_UNAVAILABLE"
