from fastapi import APIRouter, HTTPException, Path, Query
from typing import Dict, Any, List, Optional
from app.services.drainage_service import DrainageService

router = APIRouter()

@router.get("/chennai/summary", response_model=Dict[str, Any], summary="Get Chennai Stormwater Drainage & Road Network Summary")
def get_chennai_drainage_summary():
    """Returns city-wide stormwater drainage, canal, and road network statistics."""
    return DrainageService.get_chennai_drainage_summary()

@router.get("/chennai/wards", response_model=List[Dict[str, Any]], summary="Get All Chennai Wards Drainage Metrics")
def get_chennai_wards_drainage():
    """Returns verified drainage length, road length, culverts, outfalls, and waterbody proximity metrics for all 200 GCC wards."""
    return DrainageService.get_chennai_all_wards_drainage()

@router.get("/chennai/wards/{ward_id}", response_model=Dict[str, Any], summary="Get Single Ward Drainage Metrics")
def get_chennai_ward_drainage(
    ward_id: int = Path(..., description="Official Greater Chennai Corporation Ward ID (1-200)")
):
    """Returns verified stormwater drainage and road network metrics for a specific GCC ward."""
    data = DrainageService.get_chennai_ward_drainage(ward_id)
    if not data or data.get("data_status") == "DATA_UNAVAILABLE":
        if not data:
            raise HTTPException(status_code=404, detail=f"Ward ID {ward_id} not found in GCC boundaries.")
    return data

@router.get("/geojson", response_model=Dict[str, Any], summary="Get Official GCC Stormwater Drainage Network GeoJSON")
def get_drainage_geojson(
    ward_id: Optional[int] = Query(None, description="Filter by GCC Ward ID (1-200)")
):
    """Returns actual GeoJSON feature collection of Greater Chennai Corporation (GCC) stormwater drains (10,255 lines)."""
    return DrainageService.get_drains_network_geojson(ward_id=ward_id)

@router.get("/waterways/geojson", response_model=Dict[str, Any], summary="Get Chennai Major Waterways & Canals GeoJSON")
def get_waterways_geojson(
    ward_id: Optional[int] = Query(None, description="Filter by GCC Ward ID (1-200)")
):
    """Returns actual GeoJSON feature collection of major canals, macro/micro drains, and rivers (Buckingham Canal, Cooum, Adyar, etc.)."""
    return DrainageService.get_waterways_geojson(ward_id=ward_id)

@router.get("/roads/geojson", response_model=Dict[str, Any], summary="Get Chennai Arterial Road Network GeoJSON")
def get_roads_geojson(
    ward_id: Optional[int] = Query(None, description="Filter by GCC Ward ID (1-200)")
):
    """Returns actual GeoJSON feature collection of arterial and primary roads in Chennai."""
    return DrainageService.get_roads_network_geojson(ward_id=ward_id)

@router.get("/outfalls/geojson", response_model=Dict[str, Any], summary="Get Chennai CMWSSB Terminal Chambers & Outfalls GeoJSON")
def get_outfalls_geojson(
    ward_id: Optional[int] = Query(None, description="Filter by GCC Ward ID (1-200)")
):
    """Returns actual GeoJSON feature collection of CMWSSB terminal chambers and discharge outfalls."""
    return DrainageService.get_outfalls_geojson(ward_id=ward_id)

@router.get("/nodes/geojson", response_model=Dict[str, Any], summary="Get Drainage Junction Nodes GeoJSON")
def get_drainage_nodes_geojson(
    ward_id: Optional[int] = Query(None, description="Filter by GCC Ward ID (1-200)")
):
    """Returns topologically derived drainage junction nodes where 2+ stormwater drain segments intersect."""
    return DrainageService.get_drainage_nodes_geojson(ward_id=ward_id)

@router.get("/topology", response_model=Dict[str, Any], summary="Get Chennai Drainage Topology Summary")
def get_drainage_topology():
    """Returns topological summary and connectivity statistics of the Chennai drainage network."""
    return DrainageService.get_drainage_topology_summary()

# Backwards compatible alias endpoints
@router.get("/chennai/network/drains", response_model=Dict[str, Any], summary="Get Chennai Drainage Network GeoJSON (Alias)")
def get_drains_network():
    return DrainageService.get_drains_network_geojson()

@router.get("/chennai/network/roads", response_model=Dict[str, Any], summary="Get Chennai Road Network GeoJSON (Alias)")
def get_roads_network():
    return DrainageService.get_roads_network_geojson()

@router.get("/chennai/network/waterbodies", response_model=Dict[str, Any], summary="Get Chennai Waterbodies GeoJSON (Alias)")
def get_waterbodies_network():
    return DrainageService.get_waterbodies_network_geojson()

