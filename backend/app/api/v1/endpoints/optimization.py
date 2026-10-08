from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, Depends, Query, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services import optimization_service

router = APIRouter()

class OptimizationRequest(BaseModel):
    available_budget: float = Field(85000.0, ge=0.0, description="Available municipal budget in INR")
    available_hours: float = Field(30.0, ge=0.0, description="Available crew working hours")
    available_teams_count: int = Field(5, ge=0, le=10, description="Number of available maintenance teams")
    scenario_rainfall_mm: Optional[float] = Field(30.0, description="Active scenario rainfall in mm")
    horizon_hours: Optional[int] = Field(12, description="Active forecast horizon in hours")
    district: Optional[str] = Field("Chennai", description="Selected district name")
    place_id: Optional[str] = Field(None, description="Selected administrative place ID")
    ward_id: Optional[Union[int, str]] = Field(None, description="Selected ward number/ID")

@router.post(
    "/run",
    response_model=Dict[str, Any],
    summary="Run Google OR-Tools crew & budget optimization solver",
    description="Solves MILP knapsack/assignment problem allocating maintenance teams and budget across prioritized risk locations based on the active scenario."
)
def run_optimization_endpoint(
    request: OptimizationRequest = Body(...),
    db: Session = Depends(get_db)
):
    return optimization_service.solve_municipal_resource_optimization(
        available_budget=request.available_budget,
        available_hours=request.available_hours,
        team_count=request.available_teams_count,
        scenario_rainfall_mm=request.scenario_rainfall_mm if request.scenario_rainfall_mm is not None else 30.0,
        horizon_hours=request.horizon_hours if request.horizon_hours is not None else 12,
        district=request.district or "Chennai",
        place_id=request.place_id,
        ward_id=request.ward_id,
        db=db
    )

@router.get(
    "/latest",
    response_model=Dict[str, Any],
    summary="Get latest optimization plan",
    description="Returns the most recent recommended resource allocation plan."
)
def get_latest_optimization_endpoint(db: Session = Depends(get_db)):
    return optimization_service.solve_municipal_resource_optimization(
        available_budget=50000.0,
        available_hours=24.0,
        team_count=3,
        db=db
    )

@router.get(
    "/scenarios",
    response_model=List[Dict[str, Any]],
    summary="Get demo optimization benchmark scenarios",
    description="Returns predefined budget/team scenarios for quick what-if resource testing."
)
def get_optimization_scenarios_endpoint(db: Session = Depends(get_db)):
    s1 = optimization_service.solve_municipal_resource_optimization(available_budget=50000.0, available_hours=24.0, team_count=3, db=db)
    s2 = optimization_service.solve_municipal_resource_optimization(available_budget=25000.0, available_hours=12.0, team_count=2, db=db)
    s3 = optimization_service.solve_municipal_resource_optimization(available_budget=2000.0, available_hours=4.0, team_count=1, db=db)
    
    return [
        {"scenario_id": "S_01", "name": "Full Monsoon Budget (₹50,000 + 3 Teams)", "result": s1},
        {"scenario_id": "S_02", "name": "Constrained Budget (₹25,000 + 2 Teams)", "result": s2},
        {"scenario_id": "S_03", "name": "Severe Resource Deficit (₹2,000 + 1 Team)", "result": s3},
    ]
