from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services import incident_service
from app.services.incident_service import IncidentService

router = APIRouter()

@router.get(
    "/incidents",
    response_model=List[Dict[str, Any]],
    summary="Get verified civic incidents",
    description="Returns verified historical Chennai civic incidents (waterlogging, flood inundation points)."
)
def read_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=2000),
    ward_id: Optional[int] = Query(None),
    incident_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return incident_service.get_incidents(
        db=db,
        skip=skip,
        limit=limit,
        ward_id=ward_id,
        incident_type=incident_type,
        status=status,
        severity=severity
    )

@router.get(
    "/incidents/summary",
    response_model=Dict[str, Any],
    summary="Get Chennai historical incident summary",
    description="Returns citywide incident summary, statistics by year, event, severity, ward coverage, and source provenance."
)
def get_incident_summary():
    return IncidentService.get_chennai_summary()

@router.get(
    "/incidents/chennai/wards",
    response_model=List[Dict[str, Any]],
    summary="Get ward-level incident metrics",
    description="Returns ward-by-ward historical waterlogging incident counts and depth metrics for all 200 GCC wards."
)
def get_ward_incident_summaries():
    return IncidentService.get_all_ward_summaries()

@router.get(
    "/incidents/chennai/wards/{ward_id}",
    response_model=Dict[str, Any],
    summary="Get ward incident summary",
    description="Returns historical waterlogging metrics and details for a specific GCC ward."
)
def get_ward_incident_detail(ward_id: int):
    summary = IncidentService.get_ward_summary(ward_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Ward {ward_id} not found in GCC 200 ward dataset")
    return summary

@router.get(
    "/incidents/geojson",
    response_model=Dict[str, Any],
    summary="Get verified incidents as GeoJSON",
    description="Returns GeoJSON FeatureCollection of verified historical Chennai waterlogging points."
)
def get_incidents_geojson(
    ward_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None)
):
    return IncidentService.get_incidents_geojson(ward_id=ward_id, severity=severity)

@router.get(
    "/incidents/secondary/geojson",
    response_model=Dict[str, Any],
    summary="Get secondary crowdsourced flood features as GeoJSON",
    description="Returns GeoJSON FeatureCollection of crowdsourced flooded street segments from Chennai Floods 2015."
)
def get_secondary_incidents_geojson():
    return IncidentService.get_secondary_geojson()
