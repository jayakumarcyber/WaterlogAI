import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(r"d:\CivicPulse-Monsoon\backend"))
sys.path.insert(0, r"d:\CivicPulse-Monsoon\backend")

from app.main import app
from app.services.optimization_service import (
    solve_municipal_resource_optimization,
    get_candidate_actions_for_context,
)

client = TestClient(app)

def test_scenario_propagation_to_optimizer():
    """Verify 30 mm + 12h + Ward 64 scenario inputs flow directly into optimizer."""
    res = solve_municipal_resource_optimization(
        available_budget=85000.0,
        available_hours=30.0,
        team_count=5,
        scenario_rainfall_mm=30.0,
        horizon_hours=12,
        district="Chennai",
        place_id="perambur",
        ward_id=64
    )
    assert res["optimization_status"] == "OPTIMAL"
    assert res["active_scenario"]["scenario_rainfall_mm"] == 30.0
    assert res["active_scenario"]["horizon_hours"] == 12
    assert res["active_scenario"]["ward_id"] == 64
    assert "SCENARIO / WHAT-IF" in res["active_scenario"]["data_status"]
    
    # Selected actions must be for Ward 64 and Zone 6 Perambur
    selected = res["selected_actions"]
    assert len(selected) > 0
    ward_names = [a["ward_name"] for a in selected]
    assert any("Ward 64" in wn for wn in ward_names)
    
    # Baseline vs optimized calculations
    comp = res["comparison"]
    assert comp["unplanned_baseline_benefit"] > 0
    assert comp["optimized_plan_benefit"] > 0
    assert comp["optimized_plan_benefit"] >= comp["unplanned_baseline_benefit"]

def test_budget_constraint_is_computational():
    """Verify changing budget from 85k to 50k dynamically alters the optimization plan."""
    res_85k = solve_municipal_resource_optimization(
        available_budget=85000.0,
        available_hours=30.0,
        team_count=5,
        scenario_rainfall_mm=30.0,
        horizon_hours=12,
        ward_id=64
    )
    res_50k = solve_municipal_resource_optimization(
        available_budget=50000.0,
        available_hours=30.0,
        team_count=5,
        scenario_rainfall_mm=30.0,
        horizon_hours=12,
        ward_id=64
    )
    
    assert res_85k["optimization_status"] == "OPTIMAL"
    assert res_50k["optimization_status"] == "OPTIMAL"
    assert res_50k["used_budget_inr"] <= 50000.0
    assert res_85k["used_budget_inr"] <= 85000.0
    # 85k budget allows more investment and higher benefit than 50k
    assert res_85k["comparison"]["optimized_plan_benefit"] > res_50k["comparison"]["optimized_plan_benefit"]
    assert res_85k["comparison"]["unplanned_baseline_benefit"] > res_50k["comparison"]["unplanned_baseline_benefit"]

def test_location_synchronization_perambur_vs_sholinganallur():
    """Verify selecting Sholinganallur gives Sholinganallur actions with zero stale Perambur data."""
    res_shol = solve_municipal_resource_optimization(
        available_budget=85000.0,
        available_hours=30.0,
        team_count=5,
        scenario_rainfall_mm=30.0,
        horizon_hours=12,
        place_id="sholinganallur",
        ward_id=197
    )
    assert res_shol["optimization_status"] == "OPTIMAL"
    assert res_shol["active_scenario"]["place_id"] == "sholinganallur"
    
    # Actions must be Sholinganallur / OMR specific
    act_names = [a["name"] for a in res_shol["selected_actions"]]
    assert any("OMR" in name or "Sholinganallur" in name or "Semmancheri" in name or "Okkiyam" in name for name in act_names)
    assert not any("Perambur" in name or "Sembium" in name for name in act_names)

def test_rainfall_benefit_scaling():
    """Verify higher rainfall scenario dynamically yields higher preventive intervention benefit."""
    res_30mm = solve_municipal_resource_optimization(
        available_budget=85000.0,
        available_hours=30.0,
        team_count=5,
        scenario_rainfall_mm=30.0,
        horizon_hours=12,
        ward_id=64
    )
    res_100mm = solve_municipal_resource_optimization(
        available_budget=85000.0,
        available_hours=30.0,
        team_count=5,
        scenario_rainfall_mm=100.0,
        horizon_hours=24,
        ward_id=64
    )
    assert res_100mm["comparison"]["optimized_plan_benefit"] > res_30mm["comparison"]["optimized_plan_benefit"]

def test_optimization_endpoint_post_run():
    """Test API POST /api/v1/optimization/run receives scenario parameters and returns computed plan."""
    payload = {
        "available_budget": 85000.0,
        "available_hours": 30.0,
        "available_teams_count": 5,
        "scenario_rainfall_mm": 30.0,
        "horizon_hours": 12,
        "district": "Chennai",
        "place_id": "perambur",
        "ward_id": 64
    }
    response = client.post("/api/v1/optimization/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["optimization_status"] == "OPTIMAL"
    assert data["active_scenario"]["scenario_rainfall_mm"] == 30.0
    assert data["comparison"]["optimized_plan_benefit"] > 0
    assert data["comparison"]["unplanned_baseline_benefit"] > 0
