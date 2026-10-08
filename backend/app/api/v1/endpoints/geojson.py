from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services import spatial_query_service
from app.services.osm_service import OsmService
from app.services.population_service import PopulationService

router = APIRouter()

@router.get(
    "/districts/geojson",
    response_model=Dict[str, Any],
    summary="Get Tamil Nadu Districts as GeoJSON",
    description="Returns GeoJSON FeatureCollection of Tamil Nadu administrative district boundaries."
)
def get_districts_geojson():
    return spatial_query_service.get_tamil_nadu_districts_geojson()

@router.get(
    "/state/geojson",
    response_model=Dict[str, Any],
    summary="Get Tamil Nadu State Boundary as GeoJSON",
    description="Returns GeoJSON FeatureCollection of Tamil Nadu state boundary."
)
def get_state_geojson():
    return spatial_query_service.get_tamil_nadu_state_geojson()

@router.get(
    "/zones/geojson",
    response_model=Dict[str, Any],
    summary="Get Chennai Official Zones as GeoJSON",
    description="Returns GeoJSON FeatureCollection of Greater Chennai Corporation (GCC) official 15 zone boundary polygons."
)
def get_zones_geojson():
    return spatial_query_service.get_chennai_official_zones_geojson()

@router.get(
    "/wards/geojson",
    response_model=Dict[str, Any],
    summary="Get Wards as GeoJSON",
    description="Returns GeoJSON FeatureCollection of ward boundary polygons."
)
def get_wards_geojson(
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Official GCC Chennai boundaries priority
    if not district or district == "ALL" or district.lower() == "chennai":
        gcc_wards = spatial_query_service.get_chennai_official_wards_geojson()
        if gcc_wards.get("features"):
            return gcc_wards

    if district and district != "ALL":
        res = OsmService.get_district_features(district, "places")
        if res.get("features"):
            return res
    return spatial_query_service.get_wards_geojson(db, district=district, state=state)

@router.get(
    "/roads/geojson",
    response_model=Dict[str, Any],
    summary="Get Roads as GeoJSON",
    description="Returns GeoJSON FeatureCollection of municipal road segments."
)
def get_roads_geojson(
    ward_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if district and district != "ALL":
        res = OsmService.get_district_features(district, "roads")
        if res.get("features"):
            return res
    return spatial_query_service.get_roads_geojson(db, ward_id=ward_id, district=district)

@router.get(
    "/drains/geojson",
    response_model=Dict[str, Any],
    summary="Get Drains as GeoJSON",
    description="Returns GeoJSON FeatureCollection of drainage network lines."
)
def get_drains_geojson(
    ward_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if district and district != "ALL":
        res = OsmService.get_district_features(district, "drains")
        if res.get("features"):
            return res
    return spatial_query_service.get_drains_geojson(db, ward_id=ward_id, status=status, district=district)

@router.get(
    "/drainage/geojson",
    response_model=Dict[str, Any],
    summary="Get Chennai Official Stormwater Drainage as GeoJSON",
    description="Returns official GCC stormwater drainage network (10,255 lines)."
)
def get_chennai_drainage_geojson(
    ward_id: Optional[int] = Query(None)
):
    from app.services.drainage_service import DrainageService
    return DrainageService.get_drains_network_geojson(ward_id=ward_id)

@router.get(
    "/waterways/geojson",
    response_model=Dict[str, Any],
    summary="Get Chennai Major Waterways & Canals as GeoJSON",
    description="Returns official GeoJSON of Buckingham Canal, macro/micro drains, and rivers."
)
def get_waterways_geojson(
    ward_id: Optional[int] = Query(None)
):
    from app.services.drainage_service import DrainageService
    return DrainageService.get_waterways_geojson(ward_id=ward_id)

@router.get(
    "/outfalls/geojson",
    response_model=Dict[str, Any],
    summary="Get Chennai CMWSSB Terminal Chambers & Outfalls as GeoJSON",
    description="Returns official CMWSSB terminal chambers and discharge outfalls."
)
def get_outfalls_geojson(
    ward_id: Optional[int] = Query(None)
):
    from app.services.drainage_service import DrainageService
    return DrainageService.get_outfalls_geojson(ward_id=ward_id)

@router.get(
    "/waterbodies/geojson",
    response_model=Dict[str, Any],
    summary="Get Waterbodies as GeoJSON",
    description="Returns GeoJSON FeatureCollection of lakes, ponds, and rivers."
)
def get_waterbodies_geojson(
    ward_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if district and district != "ALL":
        res = OsmService.get_district_features(district, "waterbodies")
        if res.get("features"):
            return res
    return spatial_query_service.get_waterbodies_geojson(db, ward_id=ward_id, district=district)

@router.get(
    "/incidents/geojson",
    response_model=Dict[str, Any],
    summary="Get Incidents as GeoJSON",
    description="Returns GeoJSON FeatureCollection of historical civic incidents."
)
def get_incidents_geojson(
    ward_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return spatial_query_service.get_incidents_geojson(
        db,
        ward_id=ward_id,
        district=district,
        state=state,
        incident_type=incident_type,
        severity=severity,
        status=status
    )

@router.get(
    "/facilities/geojson",
    response_model=Dict[str, Any],
    summary="Get Critical Facilities as GeoJSON",
    description="Returns GeoJSON FeatureCollection of hospitals, schools, and emergency facilities."
)
def get_facilities_geojson(
    ward_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    facility_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if district and district != "ALL":
        res = OsmService.get_district_features(district, "facilities")
        if res.get("features"):
            return res
    return spatial_query_service.get_facilities_geojson(db, ward_id=ward_id, district=district, state=state, facility_type=facility_type)

@router.get(
    "/population-zones/geojson",
    response_model=Dict[str, Any],
    summary="Get Population Zones as GeoJSON",
    description="Returns GeoJSON FeatureCollection of population density zones."
)
def get_population_zones_geojson(
    ward_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if district and district != "ALL":
        res = OsmService.get_district_features(district, "population")
        if res.get("features"):
            return res
    return spatial_query_service.get_population_zones_geojson(db, ward_id=ward_id, district=district)

@router.get(
    "/population/geojson",
    response_model=Dict[str, Any],
    summary="Get Census Population Exposure Layer as GeoJSON",
    description="Returns GeoJSON FeatureCollection of Census 2011 population data mapped to geographic locations."
)
def get_population_exposure_geojson(
    district: Optional[str] = Query(None)
):
    if district == "The Nilgiris":
        return PopulationService.get_nilgiris_population_geojson()
    if district == "Theni":
        return PopulationService.get_theni_population_geojson()
    return {"type": "FeatureCollection", "features": []}

@router.get(
    "/wards/{ward_id}/metrics",
    response_model=Dict[str, Any],
    summary="Get Ward Detailed Metrics",
    description="Returns real database metrics for a selected ward."
)
def get_ward_metrics(ward_id: int, db: Session = Depends(get_db)):
    metrics = spatial_query_service.get_ward_detailed_metrics(db, ward_id)
    if not metrics:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
    return metrics
