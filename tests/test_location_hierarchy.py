import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(r"d:\CivicPulse-Monsoon\backend"))
sys.path.insert(0, r"d:\CivicPulse-Monsoon\backend")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_districts_endpoint_returns_valid_data():
    """Verify districts endpoint returns all 38 Tamil Nadu districts."""
    response = client.get("/api/v1/locations/districts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 38
    
    # Verify Chennai and Coimbatore are present
    names = [d["name"] for d in data]
    assert "Chennai" in names
    assert "Coimbatore" in names
    assert "Salem" in names
    assert "Erode" in names
    assert "Madurai" in names
    
    # Check district fields
    chennai = next(d for d in data if d["name"] == "Chennai")
    assert chennai["state"] == "Tamil Nadu"
    assert "centroid_lat" in chennai
    assert "centroid_lon" in chennai
    assert "bounds" in chennai
    assert chennai["data_status"] == "REAL"

def test_dependent_dropdown_places_by_district():
    """Verify selecting Chennai returns Chennai places, selecting Coimbatore returns Coimbatore places."""
    # 1. Chennai
    chn_res = client.get("/api/v1/locations/districts/chennai/places")
    assert chn_res.status_code == 200
    chn_places = chn_res.json()
    assert len(chn_places) >= 15
    chn_place_names = [p["name"] for p in chn_places]
    assert "Perambur" in chn_place_names
    assert any("Zone VI" in n for n in chn_place_names)
    
    # 2. Coimbatore
    cbe_res = client.get("/api/v1/locations/districts/coimbatore/places")
    assert cbe_res.status_code == 200
    cbe_places = cbe_res.json()
    assert len(cbe_places) >= 5
    cbe_place_names = [p["name"] for p in cbe_places]
    assert "Gandhipuram" in cbe_place_names
    assert "RS Puram" in cbe_place_names
    
    # Ensure Coimbatore places do not contain Chennai places
    assert "Perambur" not in cbe_place_names

def test_place_perambur_geometry_and_metrics():
    """Verify selecting Perambur returns geometry, centroid, and real CivicPulse metrics."""
    res = client.get("/api/v1/locations/places/perambur")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Perambur"
    assert data["district_id"] == "chennai"
    assert "centroid_lat" in data
    assert "centroid_lon" in data
    assert data["has_geometry"] is True
    assert data["geometry"]["type"] in ["Polygon", "MultiPolygon"]
    assert "bounds" in data
    
    # Verify metrics
    metrics = data["metrics"]
    assert metrics["waterlogging_risk"] in ["HIGH", "MODERATE", "LOW"]
    assert "rainfall_mm" in metrics
    assert "historical_incidents" in metrics
    assert "population" in metrics
    assert data["data_status"] == "REAL"

def test_place_wards_for_perambur():
    """Verify wards endpoint for Perambur returns Wards 64-78."""
    res = client.get("/api/v1/locations/places/perambur/wards")
    assert res.status_code == 200
    wards = res.json()
    assert len(wards) == 15
    ward_numbers = [w["ward_number"] for w in wards]
    assert 64 in ward_numbers
    assert 70 in ward_numbers
    
    # Verify Ward 64 details
    ward_64 = next(w for w in wards if w["ward_number"] == 64)
    assert "Ward 64" in ward_64["name"]
    assert ward_64["has_geometry"] is True
    assert ward_64["geometry"]["type"] == "Polygon"
    assert ward_64["population"] == 72144

def test_data_safety_for_non_chennai_unmapped_place():
    """Verify unmapped places return 'Data Unavailable' and do NOT fabricate fake values."""
    res = client.get("/api/v1/locations/places/rs-puram")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "RS Puram"
    assert data["district_id"] == "coimbatore"
    
    metrics = data["metrics"]
    assert metrics["rainfall_mm"] == "Data Unavailable"
    assert metrics["waterlogging_risk"] == "Data Unavailable"
    assert metrics["terrain"] == "Data Unavailable"
    assert metrics["historical_incidents"] == "Data Unavailable"
    assert metrics["population"] == "Data Unavailable"
    assert metrics["risk_score"] is None
    assert "DATA UNAVAILABLE" in metrics["risk_status"]

def test_locations_search():
    """Verify search endpoint suggests matching places and wards."""
    res = client.get("/api/v1/locations/search?q=Perambur")
    assert res.status_code == 200
    results = res.json()
    assert len(results) > 0
    labels = [r["label"] for r in results]
    assert any("Perambur" in l for l in labels)

def test_erode_places_load_dynamically():
    """Verify selecting Erode loads Bhavani, Perundurai, Gobichettipalayam."""
    res = client.get("/api/v1/locations/districts/erode/places")
    assert res.status_code == 200
    places = res.json()
    assert len(places) >= 10
    names = [p["name"] for p in places]
    assert "Bhavani" in names
    assert "Perundurai" in names
    assert "Gobichettipalayam" in names
    assert "Perambur" not in names
    assert "Gandhipuram" not in names

def test_salem_places_load_dynamically():
    """Verify selecting Salem loads Hasthampatti, Ammapet, Suramangalam, Mettur."""
    res = client.get("/api/v1/locations/districts/salem/places")
    assert res.status_code == 200
    places = res.json()
    assert len(places) >= 10
    names = [p["name"] for p in places]
    assert "Hasthampatti" in names
    assert "Ammapet" in names
    assert "Suramangalam" in names
    assert "Mettur" in names
    assert "Perambur" not in names

def test_district_isolation_strict():
    """Verify complete isolation between districts."""
    chennai_places = {p["name"] for p in client.get("/api/v1/locations/districts/chennai/places").json()}
    cbe_places = {p["name"] for p in client.get("/api/v1/locations/districts/coimbatore/places").json()}
    erode_places = {p["name"] for p in client.get("/api/v1/locations/districts/erode/places").json()}
    
    # Assert zero overlap between different district administrative units
    assert len(chennai_places.intersection(cbe_places)) == 0
    assert len(chennai_places.intersection(erode_places)) == 0
    assert len(cbe_places.intersection(erode_places)) == 0

def test_search_across_complete_hierarchy():
    """Verify search finds places across Tamil Nadu with hierarchy context."""
    for term in ["Gandhipuram", "Bhavani", "Peelamedu", "Perambur"]:
        res = client.get(f"/api/v1/locations/search?q={term}")
        assert res.status_code == 200
        results = res.json()
        assert len(results) > 0
        match = next(r for r in results if term.lower() in r["name"].lower())
        assert "Tamil Nadu" in match["state"]
        assert "label" in match

def test_statewide_coverage_summary():
    """Verify statewide coverage exceeds 1,200 administrative places across all 38 districts."""
    from app.services.location_service import LocationService
    stats = LocationService.get_summary_statistics()
    assert stats["total_districts"] == 38
    assert stats["total_places"] >= 1200
    assert stats["total_locations"] >= 1500

