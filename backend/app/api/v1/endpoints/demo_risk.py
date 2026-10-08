import os
import pandas as pd
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter()

# Locate dataset
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
DEMO_CSV_CANDIDATES = [
    os.path.join(ROOT_DIR, "data", "civicpulse_demo_dataset.csv"),
    os.path.join(ROOT_DIR, "civicpulse_demo_dataset.csv"),
    os.path.join(ROOT_DIR, "backend", "civicpulse_demo_dataset.csv"),
    os.path.join(ROOT_DIR, "frontend", "public", "civicpulse_demo_dataset.csv")
]

def get_demo_df() -> pd.DataFrame:
    for path in DEMO_CSV_CANDIDATES:
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                return df
            except Exception as e:
                pass
    raise HTTPException(status_code=500, detail="civicpulse_demo_dataset.csv could not be loaded from project paths.")

class RiskAnalysisRequest(BaseModel):
    horizon_hours: int = Field(12, description="Forecast horizon in hours (12, 24, 48, 72)")
    rainfall_multiplier: float = Field(1.0, ge=0.0, le=5.0, description="Rainfall scenario multiplier")
    drainage_delta_pct: float = Field(0.0, ge=-50.0, le=50.0, description="Drainage capacity adjustment delta %")
    scenario_rainfall_mm: Optional[float] = Field(None, description="Direct scenario rainfall input in mm")

class OptimizeRequest(BaseModel):
    available_crews: int = Field(5, ge=1, le=50)
    available_budget: float = Field(85000.0, ge=0.0)
    available_time_hours: float = Field(30.0, ge=1.0)
    scenario_rainfall_mm: float = Field(30.0)
    forecast_horizon_hours: int = Field(12)
    cost_per_high_risk: float = Field(12000.0)
    cost_per_med_risk: float = Field(7000.0)
    cost_per_low_risk: float = Field(2500.0)

class SimulationRequest(BaseModel):
    rainfall_increase_pct: float = Field(0.0, ge=0.0, le=100.0)
    drainage_capacity_delta_pct: float = Field(0.0, ge=-50.0, le=50.0)

def compute_demo_risk(
    row: Dict[str, Any],
    horizon_hours: int = 12,
    rainfall_multiplier: float = 1.0,
    drainage_delta_pct: float = 0.0,
    scenario_rainfall_mm: Optional[float] = None
) -> Dict[str, Any]:
    # Horizon factor: 12h = 0.85, 24h = 1.0, 48h = 1.10, 72h = 1.20
    horizon_mult = 1.0
    if horizon_hours == 12:
        horizon_mult = 0.85
    elif horizon_hours == 48:
        horizon_mult = 1.10
    elif horizon_hours == 72:
        horizon_mult = 1.20

    base_forecast = float(row.get('forecast_24h_mm', 100.0))
    if scenario_rainfall_mm is not None and scenario_rainfall_mm > 0:
        effective_forecast = round((scenario_rainfall_mm * (base_forecast / 100.0)) * horizon_mult * rainfall_multiplier, 1)
    else:
        effective_forecast = round(base_forecast * horizon_mult * rainfall_multiplier, 1)

    incidents = float(row.get('historical_incidents_30d', 0.0))
    elevation = float(row.get('elevation_m', 5.0))
    slope = float(row.get('slope_percent', 1.5))
    base_drainage = float(row.get('drainage_capacity_percent', 50.0))
    effective_drainage = max(5.0, min(100.0, base_drainage + drainage_delta_pct))
    pop = int(row.get('population', 50000))
    facilities = int(row.get('critical_facilities', 3))

    # Normalized Factor Components (0 to 1)
    f_rain = min(1.0, max(0.0, effective_forecast / 180.0))
    f_incidents = min(1.0, max(0.0, incidents / 15.0))
    f_elevation = max(0.0, min(1.0, 1.0 - (elevation / 12.0)))
    f_slope = max(0.0, min(1.0, 1.0 - (slope / 3.5)))
    f_drainage = max(0.0, min(1.0, 1.0 - (effective_drainage / 100.0)))
    f_facilities = min(1.0, max(0.0, facilities / 6.0))

    # Weights: Rain 30%, Incidents 20%, Elevation 15%, Slope 10%, Drainage 20%, Facilities 5%
    w_rain = 0.30 * f_rain
    w_incidents = 0.20 * f_incidents
    w_elevation = 0.15 * f_elevation
    w_slope = 0.10 * f_slope
    w_drainage = 0.20 * f_drainage
    w_facilities = 0.05 * f_facilities

    raw_score = 100.0 * (w_rain + w_incidents + w_elevation + w_slope + w_drainage + w_facilities)
    risk_score = round(min(100.0, max(0.0, raw_score)), 1)

    # Risk Classification
    if risk_score >= 65.0:
        risk_class = "HIGH"
    elif risk_score >= 35.0:
        risk_class = "MEDIUM"
    else:
        risk_class = "LOW"

    # Factor contributions in points (sum to risk_score)
    contributions = [
        {"factor": "Forecast Rainfall", "contribution_points": round(w_rain * 100, 1), "weight_pct": 30, "observed": f"{effective_forecast} mm"},
        {"factor": "Historical Incidents (30d)", "contribution_points": round(w_incidents * 100, 1), "weight_pct": 20, "observed": f"{int(incidents)} reports"},
        {"factor": "Low Elevation Vulnerability", "contribution_points": round(w_elevation * 100, 1), "weight_pct": 15, "observed": f"{elevation} m MSL"},
        {"factor": "Low Topographical Slope", "contribution_points": round(w_slope * 100, 1), "weight_pct": 10, "observed": f"{slope}%"},
        {"factor": "Limited Drainage Capacity", "contribution_points": round(w_drainage * 100, 1), "weight_pct": 20, "observed": f"{round(effective_drainage, 1)}%"},
        {"factor": "Critical Facility Density", "contribution_points": round(w_facilities * 100, 1), "weight_pct": 5, "observed": f"{facilities} units"},
    ]
    contributions.sort(key=lambda x: x["contribution_points"], reverse=True)

    # Why Explanation text
    top_factors = [c for c in contributions if c["contribution_points"] >= 5.0][:4]
    why_reasons = []
    if effective_forecast >= 110:
        why_reasons.append(f"High forecast precipitation of {effective_forecast} mm over {horizon_hours}h window")
    if incidents >= 7:
        why_reasons.append(f"High recurring waterlogging history ({int(incidents)} incidents in 30d)")
    if elevation <= 3.5:
        why_reasons.append(f"Low natural terrain elevation ({elevation}m MSL) creating natural catchment basin")
    if effective_drainage <= 45:
        why_reasons.append(f"Severely constrained drainage capacity ({round(effective_drainage)}% operational)")
    if not why_reasons:
        if risk_class == "HIGH":
            why_reasons.append("Combined cumulative runoff exceeding stormwater capacity")
        elif risk_class == "MEDIUM":
            why_reasons.append("Moderate rainfall with localized catchment accumulation risk")
        else:
            why_reasons.append("Adequate natural elevation and functional drainage capacity")

    # Recommended Preventive Action
    if risk_class == "HIGH":
        actions = [
            "Inspect drainage inlet & clear culvert obstructions",
            "Deploy high-capacity mobile dewatering pumps (2000 LPM)",
            "Field verification & emergency sandbag staging required",
            "Inspect nearby road drainage culverts and outfalls"
        ]
        action = actions[hash(str(row.get('location'))) % len(actions)]
    elif risk_class == "MEDIUM":
        actions = [
            "Schedule drainage inlet inspection and desilting",
            "Monitor rainfall intensity and runoff accumulation",
            "Verify vulnerable micro-catchment locations"
        ]
        action = actions[hash(str(row.get('location'))) % len(actions)]
    else:
        action = "Routine municipal monitoring & standard maintenance"

    # Priority composite (Risk 40%, Population 30%, Critical Facilities 15%, Incidents 15%)
    norm_pop = min(1.0, pop / 75000.0)
    norm_fac = min(1.0, facilities / 6.0)
    priority_score = round(0.40 * (risk_score / 100.0) + 0.30 * norm_pop + 0.15 * norm_fac + 0.15 * f_incidents, 3)

    return {
        "location": str(row.get('location')),
        "latitude": float(row.get('latitude')),
        "longitude": float(row.get('longitude')),
        "rainfall_24h_mm": float(row.get('rainfall_24h_mm', 0.0)),
        "forecast_rainfall_mm": effective_forecast,
        "historical_incidents_30d": int(incidents),
        "elevation_m": elevation,
        "slope_percent": slope,
        "drainage_capacity_percent": round(effective_drainage, 1),
        "population": pop,
        "critical_facilities": facilities,
        "risk_score": risk_score,
        "risk_class": risk_class,
        "priority_score": priority_score,
        "recommended_action": action,
        "risk_factor_contributions": contributions,
        "why_reasons": why_reasons,
        "data_status_label": "DEMO DATA / SIMULATION"
    }

@router.get("/dataset", summary="Load Demo CSV Dataset")
def get_demo_dataset():
    df = get_demo_df()
    return {
        "total_records": len(df),
        "columns": df.columns.tolist(),
        "data_status": "DEMO DATA / SIMULATION",
        "records": df.to_dict(orient="records")
    }

@router.post("/risk-analysis", summary="Run Full Risk Prediction Analysis")
def run_risk_analysis(req: RiskAnalysisRequest):
    df = get_demo_df()
    results = []
    for _, row in df.iterrows():
        res = compute_demo_risk(
            row.to_dict(),
            horizon_hours=req.horizon_hours,
            rainfall_multiplier=req.rainfall_multiplier,
            drainage_delta_pct=req.drainage_delta_pct,
            scenario_rainfall_mm=req.scenario_rainfall_mm
        )
        results.append(res)

    # Sort by priority score descending
    results.sort(key=lambda x: (x["priority_score"], x["risk_score"]), reverse=True)

    # Assign Priority 1, 2, 3...
    for idx, item in enumerate(results):
        item["priority_rank"] = idx + 1

    # Summary Statistics
    high_count = sum(1 for r in results if r["risk_class"] == "HIGH")
    med_count = sum(1 for r in results if r["risk_class"] == "MEDIUM")
    low_count = sum(1 for r in results if r["risk_class"] == "LOW")
    total_pop_exposure = sum(r["population"] for r in results if r["risk_class"] in ["HIGH", "MEDIUM"])
    total_facilities_exposure = sum(r["critical_facilities"] for r in results if r["risk_class"] in ["HIGH", "MEDIUM"])

    top_priority = results[0] if results else None

    return {
        "model_name": "Demo Risk Model (Transparent Deterministic)",
        "data_status_label": "DEMO DATA / SIMULATION",
        "horizon_hours": req.horizon_hours,
        "scenario_label": f"Demo Forecast Scenario ({req.horizon_hours} Hours)",
        "summary": {
            "high_risk_count": high_count,
            "medium_risk_count": med_count,
            "low_risk_count": low_count,
            "total_population_exposure": total_pop_exposure,
            "total_critical_facilities": total_facilities_exposure,
            "top_priority_location": top_priority["location"] if top_priority else None,
            "top_priority_score": top_priority["risk_score"] if top_priority else None,
            "top_priority_rank": 1
        },
        "locations": results
    }

@router.get("/risk-analysis", summary="Run Full Risk Prediction Analysis (GET)")
def run_risk_analysis_get(
    horizon_hours: int = Query(24, description="Forecast horizon in hours (24, 48, 72)"),
    rainfall_multiplier: float = Query(1.0, ge=0.0, le=3.0),
    drainage_delta_pct: float = Query(0.0, ge=-50.0, le=50.0)
):
    req = RiskAnalysisRequest(
        horizon_hours=horizon_hours,
        rainfall_multiplier=rainfall_multiplier,
        drainage_delta_pct=drainage_delta_pct
    )
    return run_risk_analysis(req)

@router.post("/optimize", summary="Optimize Crew & Budget Allocation")
def optimize_crews_and_budget(req: OptimizeRequest):
    df = get_demo_df()
    analyzed = []
    for _, row in df.iterrows():
        analyzed.append(compute_demo_risk(row.to_dict()))

    # Sort by priority score descending
    analyzed.sort(key=lambda x: x["priority_score"], reverse=True)

    selected_locations = []
    current_budget = req.available_budget
    crews_left = req.available_crews
    total_cost = 0.0

    for idx, loc in enumerate(analyzed):
        r_class = loc["risk_class"]
        cost = req.cost_per_high_risk if r_class == "HIGH" else (req.cost_per_med_risk if r_class == "MEDIUM" else req.cost_per_low_risk)
        needed_crew = 1.0 if r_class in ["HIGH", "MEDIUM"] else 0.5

        if current_budget >= cost and crews_left >= needed_crew:
            selected_locations.append({
                "priority_rank": idx + 1,
                "location": loc["location"],
                "risk_class": r_class,
                "risk_score": loc["risk_score"],
                "population": loc["population"],
                "critical_facilities": loc["critical_facilities"],
                "recommended_action": loc["recommended_action"],
                "action_cost_inr": cost,
                "crew_assigned": needed_crew
            })
            current_budget -= cost
            crews_left -= needed_crew
            total_cost += cost

    unserviced_high_risk = sum(1 for loc in analyzed if loc["risk_class"] == "HIGH" and not any(s["location"] == loc["location"] for s in selected_locations))

    baseline_benefit = round(sum(loc["risk_score"] * 0.45 for loc in selected_locations[:3]), 1)
    opt_benefit = round(sum(loc["risk_score"] * 0.95 for loc in selected_locations), 1)

    return {
        "status": "OPTIMIZATION_COMPLETE",
        "optimization_engine": "Greedy Knapsack Priority Dispatch (Demo Engine)",
        "available_budget": req.available_budget,
        "available_crews": req.available_crews,
        "available_time_hours": req.available_time_hours,
        "scenario_rainfall_mm": req.scenario_rainfall_mm,
        "forecast_horizon_hours": req.forecast_horizon_hours,
        "baseline_unplanned_benefit": baseline_benefit,
        "optimized_benefit": opt_benefit,
        "benefit_delta": round(opt_benefit - baseline_benefit, 1),
        "total_cost_inr": total_cost,
        "remaining_budget_inr": current_budget,
        "crews_dispatched": req.available_crews - crews_left,
        "remaining_crews": crews_left,
        "selected_locations_count": len(selected_locations),
        "unserviced_high_risk_count": unserviced_high_risk,
        "selected_locations": selected_locations
    }

@router.post("/simulate", summary="What-If Scenario Simulation")
def run_what_if_simulation(req: SimulationRequest):
    df = get_demo_df()
    rain_mult = 1.0 + (req.rainfall_increase_pct / 100.0)
    drain_delta = req.drainage_capacity_delta_pct

    baseline_results = [compute_demo_risk(row.to_dict()) for _, row in df.iterrows()]
    simulated_results = [
        compute_demo_risk(row.to_dict(), rainfall_multiplier=rain_mult, drainage_delta_pct=drain_delta)
        for _, row in df.iterrows()
    ]

    comparisons = []
    for base, sim in zip(baseline_results, simulated_results):
        score_diff = round(sim["risk_score"] - base["risk_score"], 1)
        comparisons.append({
            "location": base["location"],
            "current_risk_score": base["risk_score"],
            "current_risk_class": base["risk_class"],
            "simulated_risk_score": sim["risk_score"],
            "simulated_risk_class": sim["risk_class"],
            "risk_change": score_diff,
            "status": "INCREASED" if score_diff > 0 else ("DECREASED" if score_diff < 0 else "NO_CHANGE")
        })

    comparisons.sort(key=lambda x: x["simulated_risk_score"], reverse=True)

    base_high = sum(1 for r in baseline_results if r["risk_class"] == "HIGH")
    sim_high = sum(1 for r in simulated_results if r["risk_class"] == "HIGH")

    return {
        "scenario_label": f"Scenario Simulation — Demo (+{req.rainfall_increase_pct}% Rainfall, {req.drainage_capacity_delta_pct:+} Drainage)",
        "rainfall_increase_pct": req.rainfall_increase_pct,
        "drainage_capacity_delta_pct": req.drainage_capacity_delta_pct,
        "baseline_high_risk_count": base_high,
        "simulated_high_risk_count": sim_high,
        "high_risk_delta": sim_high - base_high,
        "comparisons": comparisons
    }
