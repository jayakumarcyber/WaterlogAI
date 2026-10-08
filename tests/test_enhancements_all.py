import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(r"d:\CivicPulse-Monsoon\backend"))
sys.path.insert(0, r"d:\CivicPulse-Monsoon\backend")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ==============================================================================
# 1. PREDICTION SCENARIO TESTS (12h, 24h, 48h, 72h)
# ==============================================================================

def test_prediction_scenario_30mm_12h():
    """Verify 30 mm rainfall + 12 Hours scenario runs real ML inference."""
    payload = {
        "expected_rainfall_mm": 30.0,
        "horizon_hours": 12,
        "district": "Chennai"
    }
    response = client.post("/api/v1/predictions/scenario", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    
    assert data["scenario_rainfall_mm"] == 30.0
    assert data["horizon_hours"] == 12
    assert "SCENARIO" in data["data_provenance"]
    assert "WHAT-IF" in data["data_provenance"]
    
    # Check summary
    summary = data["summary"]
    assert summary["total_wards_evaluated"] == 200
    assert "critical_risk_wards" in summary
    assert "high_risk_wards" in summary
    assert "medium_risk_wards" in summary
    assert "low_risk_wards" in summary
    total_classified = (
        summary["critical_risk_wards"] +
        summary["high_risk_wards"] +
        summary["medium_risk_wards"] +
        summary["low_risk_wards"]
    )
    assert total_classified == 200
    
    # Check ward predictions
    assert len(data["ward_predictions"]) == 200
    sample = data["ward_predictions"][0]
    assert "ward_id" in sample
    assert "risk_level" in sample
    assert sample["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert "predicted_probability" in sample
    assert 0.0 <= sample["predicted_probability"] <= 1.0


def test_prediction_scenario_all_horizons():
    """Verify scenarios run successfully for all supported horizons (12, 24, 48, 72)."""
    for horizon in [12, 24, 48, 72]:
        payload = {
            "expected_rainfall_mm": 45.0,
            "horizon_hours": horizon,
            "district": "Chennai"
        }
        res = client.post("/api/v1/predictions/scenario", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["horizon_hours"] == horizon
        assert data["summary"]["total_wards_evaluated"] == 200


def test_prediction_scenario_invalid_horizon_rejected():
    """Verify unsupported horizon is rejected with clear error."""
    payload = {
        "expected_rainfall_mm": 30.0,
        "horizon_hours": 99,
        "district": "Chennai"
    }
    res = client.post("/api/v1/predictions/scenario", json=payload)
    assert res.status_code == 400


# ==============================================================================
# 2. LOCATION HIERARCHY & WARD POPULATION TESTS
# ==============================================================================

def test_chennai_perambur_and_wards():
    """Verify Chennai -> Perambur loads and returns Wards 64-78."""
    # Place details
    place_res = client.get("/api/v1/locations/places/perambur")
    assert place_res.status_code == 200
    place_data = place_res.json()
    assert place_data["name"] == "Perambur"
    assert place_data["has_geometry"] is True
    assert "bounds" in place_data
    
    # Child Wards
    wards_res = client.get("/api/v1/locations/places/perambur/wards")
    assert wards_res.status_code == 200
    wards = wards_res.json()
    assert len(wards) == 15
    ward_numbers = [w["ward_number"] for w in wards]
    assert 64 in ward_numbers
    assert 78 in ward_numbers


def test_chennai_sholinganallur_wards_populated():
    """Verify Sholinganallur (Zone 15) loads child wards 192-200 and NOT empty."""
    wards_res = client.get("/api/v1/locations/places/sholinganallur/wards")
    assert wards_res.status_code == 200
    wards = wards_res.json()
    assert len(wards) == 9, "Sholinganallur Zone 15 must contain 9 wards (192-200)"
    ward_numbers = [w["ward_number"] for w in wards]
    assert 192 in ward_numbers
    assert 200 in ward_numbers


def test_coimbatore_and_erode_places():
    """Verify non-Chennai districts load their respective places."""
    cbe_res = client.get("/api/v1/locations/districts/coimbatore/places")
    assert cbe_res.status_code == 200
    cbe_places = [p["name"] for p in cbe_res.json()]
    assert "Gandhipuram" in cbe_places
    assert "Perambur" not in cbe_places

    erd_res = client.get("/api/v1/locations/districts/erode/places")
    assert erd_res.status_code == 200
    erd_places = [p["name"] for p in erd_res.json()]
    assert "Bhavani" in erd_places
    assert "Gandhipuram" not in erd_places


# ==============================================================================
# 3. REVERSE GEOCODING (GPS CURRENT LOCATION)
# ==============================================================================

def test_reverse_geocode_chennai():
    """Verify GPS coords within Chennai GCC area resolve to Chennai and ward."""
    # Coords near Perambur / North Chennai: 13.11, 80.24
    res = client.get("/api/v1/locations/reverse-geocode?lat=13.11&lon=80.24")
    assert res.status_code == 200
    data = res.json()
    assert data["district"] == "Chennai"
    assert "latitude" in data
    assert "longitude" in data
    assert data["place"] is not None
    assert data["is_chennai"] is True
    assert data["telemetry_available"] is True


def test_reverse_geocode_coimbatore():
    """Verify GPS coords in Coimbatore resolve correctly to Coimbatore."""
    # Gandhipuram, Coimbatore coords: 11.0168, 76.9558
    res = client.get("/api/v1/locations/reverse-geocode?lat=11.0168&lon=76.9558")
    assert res.status_code == 200
    data = res.json()
    assert data["district"] == "Coimbatore"
    assert data["place"] is not None
    assert data["is_chennai"] is False


def test_reverse_geocode_outside_tamil_nadu():
    """Verify coords in Bengaluru (outside TN) resolve safely without crash."""
    # Bengaluru coords: 12.9716, 77.5946
    res = client.get("/api/v1/locations/reverse-geocode?lat=12.9716&lon=77.5946")
    assert res.status_code == 200
    data = res.json()
    assert "Bengaluru" in data["district"] or "Bengaluru" in data["place"]
    assert data["is_chennai"] is False


# ==============================================================================
# 4. COMPLAINT SUBMISSION & TRACKING (STATEWIDE / OUTSIDE CHENNAI)
# ==============================================================================

def test_complaint_submission_outside_chennai():
    """Verify complaint from Coimbatore is accepted and assigned a dynamic ID."""
    complaint_data = {
        "citizen_name": "Citizen User",
        "citizen_contact": "9876543210",
        "area": "Gandhipuram, Coimbatore",
        "street": "Cross Cut Road",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "severity": "Severe",
        "water_depth": "Knee deep",
        "description": "Heavy waterlogging near Gandhipuram bus stand after rainfall."
    }
    
    res = client.post("/api/v1/complaints/", json=complaint_data)
    assert res.status_code == 201, res.text
    complaint = res.json()
    
    assert "complaint_id" in complaint
    assert complaint["complaint_id"].startswith("CP-CBE-")
    assert complaint["status"] == "SUBMITTED"
    assert complaint["priority"] == "CRITICAL"  # Severe maps to CRITICAL priority


def test_complaint_tracking_full_lifecycle():
    """Verify complaint tracking: submit -> retrieve by ID -> status workflow."""
    # 1. Submit a complaint in Madurai
    payload = {
        "citizen_name": "Citizen Ramesh",
        "citizen_contact": "9123456789",
        "area": "Periyar Bus Stand, Madurai",
        "street": "West Tower Street",
        "latitude": 9.9195,
        "longitude": 78.1198,
        "severity": "Moderate",
        "water_depth": "Ankle deep",
        "description": "Water overflowing storm drain near bus stop."
    }
    create_res = client.post("/api/v1/complaints/", json=payload)
    assert create_res.status_code == 201, create_res.text
    created = create_res.json()
    complaint_id = created["complaint_id"]
    assert complaint_id.startswith("CP-MDU-")
    
    # 2. Retrieve complaint by ID (Track Complaint)
    get_res = client.get(f"/api/v1/complaints/{complaint_id}")
    assert get_res.status_code == 200
    tracked = get_res.json()
    assert tracked["complaint_id"] == complaint_id
    assert tracked["status"] == "SUBMITTED"
    assert tracked["area"] == "Periyar Bus Stand, Madurai"
    assert "created_at" in tracked
    assert "status_timeline" in tracked
    assert "risk_context" in tracked
    assert tracked["risk_context"]["drainage_context"] == "DATA UNAVAILABLE"
    
    # 3. Update status (e.g. Operations moves it to ASSIGNED)
    update_res = client.patch(
        f"/api/v1/complaints/operations/{complaint_id}/review",
        json={"status": "ASSIGNED", "action_taken": "Dispatched Field Team 3", "assigned_crew": "Crew Madurai-Central"}
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["complaint_id"] == complaint_id
    
    # 4. Check track endpoint again reflects updated status
    get_res_2 = client.get(f"/api/v1/complaints/{complaint_id}")
    assert get_res_2.status_code == 200
    assert get_res_2.json()["status"] == "ASSIGNED"
    assert get_res_2.json()["assigned_crew"] == "Crew Madurai-Central"
