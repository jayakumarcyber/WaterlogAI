import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_endpoints_isolated():
    """Ensure /api/v1/demo/ returns synthetic demo data from CSV without altering official database."""
    res = client.get("/api/v1/demo/dataset")
    assert res.status_code == 200
    demo_data = res.json()
    assert "records" in demo_data
    assert demo_data["data_status"] == "DEMO DATA / SIMULATION"
    assert len(demo_data["records"]) == 14

    # Run demo risk analysis
    analysis_res = client.post("/api/v1/demo/risk-analysis", json={"horizon_hours": 24, "rainfall_multiplier": 1.5, "drainage_delta_pct": -10.0})
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    assert analysis["data_status_label"] == "DEMO DATA / SIMULATION"
    assert len(analysis["locations"]) == 14

def test_original_project_apis_do_not_return_demo_labels():
    """Ensure verified original project endpoints maintain authentic Chennai GCC data."""
    # Live weather endpoint
    weather_res = client.get("/api/v1/weather/chennai/current")
    assert weather_res.status_code == 200
    w_data = weather_res.json()
    assert w_data["location"] == "Chennai, Tamil Nadu"
    assert "Open-Meteo" in w_data["source"]
    assert "demo" not in w_data["source"].lower()
