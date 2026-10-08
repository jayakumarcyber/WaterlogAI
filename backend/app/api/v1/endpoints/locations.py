"""
FastAPI endpoints for Tamil Nadu Location Hierarchy & Dynamic Places.
Provides clean endpoints:
- GET /api/v1/locations/districts
- GET /api/v1/locations/districts/{district_id}/places
- GET /api/v1/locations/places/{place_id}
- GET /api/v1/locations/places/{place_id}/wards
- GET /api/v1/locations/search
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.services.location_service import LocationService

router = APIRouter()

@router.get(
    "/districts",
    response_model=List[Dict[str, Any]],
    summary="Get all Tamil Nadu districts",
    description="Returns all 38 official Tamil Nadu districts with headquarters, centroids, bounding boxes, and demographics."
)
def get_districts():
    return LocationService.get_all_districts()

@router.get(
    "/districts/{district_id}",
    response_model=Dict[str, Any],
    summary="Get district by ID or name",
    description="Returns details, bounds, centroid, and population for a specific district."
)
def get_district(district_id: str):
    dist = LocationService.get_district_by_id(district_id)
    if not dist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District '{district_id}' not found."
        )
    return dist

@router.get(
    "/districts/{district_id}/places",
    response_model=List[Dict[str, Any]],
    summary="Get places belonging to a district",
    description="Returns verified administrative areas, zones, taluks, or localities belonging to the selected district."
)
def get_district_places(district_id: str):
    dist = LocationService.get_district_by_id(district_id)
    if not dist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District '{district_id}' not found in Tamil Nadu."
        )
    places = LocationService.get_district_places(district_id)
    return places

@router.get(
    "/places/{place_id}",
    response_model=Dict[str, Any],
    summary="Get place details and metrics",
    description="Returns place name, type, district, parent, geometry polygon, centroid, and connected CivicPulse risk metrics."
)
def get_place(place_id: str):
    place = LocationService.get_place_by_id(place_id)
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Place '{place_id}' not found."
        )
    return place

@router.get(
    "/places/{place_id}/wards",
    response_model=List[Dict[str, Any]],
    summary="Get wards belonging to a place",
    description="Returns available administrative wards or local units belonging to the selected place."
)
def get_place_wards(place_id: str):
    wards = LocationService.get_place_wards(place_id)
    return wards

@router.get(
    "/search",
    response_model=List[Dict[str, Any]],
    summary="Search locations across districts, places, and wards",
    description="Fast auto-suggest geocoding across all Tamil Nadu administrative levels."
)
def search_locations(
    q: str = Query(..., min_length=2, description="Search term, e.g. Perambur, Gandhipuram, Ward 64"),
    district: Optional[str] = Query(None, description="Optional parent district filter")
):
    return LocationService.search_locations(q, district=district)

@router.get(
    "/reverse-geocode",
    response_model=Dict[str, Any],
    summary="Reverse geocode GPS coordinates to administrative hierarchy",
    description="Resolves latitude and longitude to District, Place, and Ward across Tamil Nadu and fallback regions."
)
def reverse_geocode_endpoint(
    lat: float = Query(..., description="Latitude coordinate"),
    lon: float = Query(..., description="Longitude coordinate")
):
    return LocationService.reverse_geocode(lat=lat, lon=lon)

