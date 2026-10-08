import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services import prediction_service, spatial_query_service
from ml.inference.predictor import RiskPredictor, map_probability_to_risk_level
from ml.inference.batch_predictor import run_batch_prediction

router = APIRouter()

SUPPORTED_HORIZONS = [12, 24, 48, 72]

class RiskRequest(BaseModel):
    ward_id: int
    horizon_hours: int = 24  # 12, 24, 48, 72
    rainfall_last_24h: Optional[float] = 0.0
    rainfall_last_72h: Optional[float] = 0.0
    elevation_m: Optional[float] = 5.0
    drainage_quality_score: Optional[float] = 0.5
    historical_incident_density: Optional[float] = 1.0

class RiskResponse(BaseModel):
    ward_id: int
    horizon_hours: int
    predicted_probability: float
    risk_level: str
    model_version: str
    data_provenance: str

class ScenarioRequest(BaseModel):
    expected_rainfall_mm: float = Field(30.0, ge=0.0, le=500.0, description="Expected scenario rainfall in mm (e.g. 30mm)")
    horizon_hours: int = Field(12, description="Forecast horizon in hours (12, 24, 48, 72)")
    district: Optional[str] = Field("Chennai", description="District for scenario prediction")
    ward_id: Optional[int] = Field(None, description="Optional specific ward filter")

class ScenarioResponse(BaseModel):
    status: str
    scenario_rainfall_mm: float
    horizon_hours: int
    district: str
    data_status: str
    data_provenance: str
    summary: Dict[str, Any]
    ward_predictions: List[Dict[str, Any]]

@router.post(
    "/risk",
    response_model=RiskResponse,
    summary="Predict waterlogging risk for ward & horizon",
    description="Returns live calibrated waterlogging probability and risk level (LOW, MEDIUM, HIGH, CRITICAL)."
)
def predict_risk_endpoint(request: RiskRequest):
    if request.horizon_hours not in SUPPORTED_HORIZONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"horizon_hours must be one of {SUPPORTED_HORIZONS}"
        )
    
    predictor = RiskPredictor(horizon_hours=request.horizon_hours)
    res = predictor.predict_risk(request.model_dump())
    return res

@router.post(
    "/scenario",
    response_model=ScenarioResponse,
    summary="Run interactive What-If Rainfall Prediction Scenario",
    description="Executes scenario risk predictions across GCC wards for user-defined rainfall (e.g. 30mm) and horizon (e.g. 12h)."
)
def run_scenario_endpoint(request: ScenarioRequest):
    if request.horizon_hours not in SUPPORTED_HORIZONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"horizon_hours must be one of {SUPPORTED_HORIZONS}"
        )

    # 1. Initialize predictor for the requested horizon
    predictor = RiskPredictor(horizon_hours=request.horizon_hours)

    # 2. Load official GCC wards
    gcc_wards_data = spatial_query_service.get_chennai_official_wards_geojson()
    features = gcc_wards_data.get("features", [])

    ward_results = []
    h_hours = request.horizon_hours
    rain_mm = float(request.expected_rainfall_mm)

    for feat in features:
        props = feat.get("properties", {})
        w_id = props.get("ward_number") or props.get("id") or 1
        
        if request.ward_id is not None and int(w_id) != int(request.ward_id):
            continue

        elev = float(props.get("elevation_m") or 6.5)
        incidents = int(props.get("historical_incident_count") or 0)
        drain_len = float(props.get("drain_length_km") or 14.5)
        road_len = float(props.get("road_length_km") or 22.0)
        pop = int(props.get("population") or 45000)
        area = float(props.get("area_sq_km") or 2.5)

        # Build feature dictionary reflecting scenario rainfall
        # Rain intensities scaled across horizon windows
        rain_1h = round(rain_mm / max(1.0, float(h_hours)), 2)
        rain_6h = round(rain_mm * min(1.0, 6.0 / max(1.0, float(h_hours))), 2)
        rain_24h = rain_mm
        rain_48h = round(rain_mm * (1.2 if h_hours >= 48 else 1.0), 2)
        rain_72h = round(rain_mm * (1.4 if h_hours >= 72 else 1.0), 2)

        drain_score = min(1.0, max(0.1, drain_len / max(road_len, 1.0)))

        feat_dict = {
            "ward_id": int(w_id),
            "rainfall_last_1h": rain_1h,
            "rainfall_last_6h": rain_6h,
            "rainfall_last_24h": rain_24h,
            "rainfall_last_48h": rain_48h,
            "rainfall_last_72h": rain_72h,
            "elevation_m": elev,
            "drainage_quality_score": drain_score,
            "historical_incident_density": float(incidents),
            "incident_count_7d": min(5, incidents // 3),
            "incident_count_30d": incidents,
            "incident_count_90d": incidents * 2,
            "previous_waterlogging_count": incidents,
            "road_density_km_sqkm": round(road_len / max(area, 0.5), 2),
            "drainage_density_km_sqkm": round(drain_len / max(area, 0.5), 2),
            "population_density_per_sqkm": round(pop / max(area, 0.5), 1),
            "critical_facility_count": props.get("critical_facilities", 3),
        }

        pred_res = predictor.predict_risk(feat_dict)
        prob = pred_res["predicted_probability"]

        # Water accumulation depth heuristic (derived purely for scenario planning)
        # Higher for low elevation + high rain
        depth_cm = round(max(0.0, (rain_mm / 10.0) * max(0.2, (15.0 - elev) / 10.0)), 1)

        ward_results.append({
            "ward_id": int(w_id),
            "ward_name": props.get("name", f"Ward {w_id}"),
            "zone_name": props.get("zone_name", f"Zone {props.get('zone_number', 0)}"),
            "zone_number": props.get("zone_number", 0),
            "predicted_probability": prob,
            "risk_level": pred_res["risk_level"],
            "expected_water_depth_cm": depth_cm,
            "elevation_m": elev,
            "historical_incidents": incidents,
            "data_status": "SCENARIO",
        })

    # Summary metrics across GCC wards
    high_count = sum(1 for w in ward_results if w["risk_level"] in ["HIGH", "CRITICAL"])
    med_count = sum(1 for w in ward_results if w["risk_level"] == "MEDIUM")
    low_count = sum(1 for w in ward_results if w["risk_level"] == "LOW")
    crit_count = sum(1 for w in ward_results if w["risk_level"] == "CRITICAL")

    summary = {
        "total_wards_evaluated": len(ward_results),
        "high_risk_wards": high_count,
        "medium_risk_wards": med_count,
        "low_risk_wards": low_count,
        "critical_risk_wards": crit_count,
        "scenario_rainfall_mm": rain_mm,
        "horizon_hours": h_hours,
        "average_probability": round(sum(w["predicted_probability"] for w in ward_results) / max(len(ward_results), 1), 4),
        "scenario_note": f"Evaluated What-If scenario with {rain_mm} mm expected precipitation over {h_hours} Hours across Greater Chennai Corporation."
    }

    return ScenarioResponse(
        status="success",
        scenario_rainfall_mm=rain_mm,
        horizon_hours=h_hours,
        district=request.district or "Chennai",
        data_status="SCENARIO",
        data_provenance="SCENARIO / WHAT-IF — USER DEFINED INPUT (NOT OBSERVED WEATHER)",
        summary=summary,
        ward_predictions=ward_results,
    )

@router.get(
    "/ward/{ward_id}",
    response_model=List[Dict[str, Any]],
    summary="Get predictions for a specific ward",
    description="Returns 12h, 24h, 48h, 72h waterlogging risk forecasts for the ward."
)
def get_ward_predictions_endpoint(ward_id: int, db: Session = Depends(get_db)):
    preds = prediction_service.get_ward_predictions(db, ward_id)
    if not preds:
        # Generate live predictions if not in DB yet
        results = []
        for h in SUPPORTED_HORIZONS:
            predictor = RiskPredictor(horizon_hours=h)
            res = predictor.predict_risk({"ward_id": ward_id})
            results.append(res)
        return results

    return [
        {
            "id": p.id,
            "ward_id": p.ward_id,
            "prediction_timestamp": p.prediction_timestamp.isoformat() if p.prediction_timestamp else None,
            "horizon_hours": p.horizon_hours,
            "predicted_probability": p.predicted_probability,
            "risk_level": p.risk_level,
            "model_version": p.model_version,
            "data_provenance": "DEMO MODEL — TRAINED ON SYNTHETIC DATA"
        }
        for p in preds
    ]

@router.get(
    "",
    response_model=List[Dict[str, Any]],
    summary="Get multi-horizon predictions",
    description="Returns predictions filtered by horizon (hours=12, 24, 48, or 72)."
)
def get_predictions_endpoint(
    hours: Optional[int] = Query(None, description="Horizon hours (12, 24, 48, 72)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    if hours is not None and hours not in SUPPORTED_HORIZONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"hours filter must be one of {SUPPORTED_HORIZONS}"
        )
    
    preds = prediction_service.get_predictions(db, horizon_hours=hours, skip=skip, limit=limit)
    if not preds:
        # Fallback batch simulation
        batch = run_batch_prediction()
        if hours is not None:
            batch = [p for p in batch if p['horizon_hours'] == hours]
        return batch

    return [
        {
            "id": p.id,
            "ward_id": p.ward_id,
            "prediction_timestamp": p.prediction_timestamp.isoformat() if p.prediction_timestamp else None,
            "horizon_hours": p.horizon_hours,
            "predicted_probability": p.predicted_probability,
            "risk_level": p.risk_level,
            "model_version": p.model_version,
            "data_provenance": "DEMO MODEL — TRAINED ON SYNTHETIC DATA"
        }
        for p in preds
    ]

@router.post(
    "/batch/run",
    response_model=Dict[str, Any],
    summary="Run batch risk prediction pipeline",
    description="Executes multi-horizon batch predictions for all wards and persists results to PostgreSQL."
)
def run_batch_prediction_endpoint():
    results = run_batch_prediction()
    return {
        "status": "success",
        "total_predictions_generated": len(results),
        "horizons_covered": SUPPORTED_HORIZONS,
        "model_version": "XGBoost_v1_DEMO",
        "data_provenance": "DEMO MODEL — TRAINED ON SYNTHETIC DATA"
    }

