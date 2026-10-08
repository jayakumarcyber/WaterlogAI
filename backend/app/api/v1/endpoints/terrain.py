from fastapi import APIRouter, HTTPException, Path
from typing import Dict, Any, List
from app.services.terrain_service import TerrainService

router = APIRouter()

@router.get("/chennai/summary", response_model=Dict[str, Any], summary="Get Chennai Terrain & Elevation Summary")
def get_chennai_terrain_summary():
    """Returns verified city-wide elevation and terrain statistics (min, max, mean, slope, low-lying count)."""
    return TerrainService.get_chennai_terrain_summary()

@router.get("/chennai/wards", response_model=List[Dict[str, Any]], summary="Get All Chennai Wards Terrain Data")
def get_chennai_wards_terrain():
    """Returns verified terrain and elevation records for all 200 GCC wards."""
    return TerrainService.get_chennai_all_wards_terrain()

@router.get("/chennai/wards/{ward_id}", response_model=Dict[str, Any], summary="Get Single Chennai Ward Terrain Data")
def get_chennai_ward_terrain(
    ward_id: int = Path(..., description="Official Greater Chennai Corporation Ward ID (1-200)")
):
    """Returns verified DEM terrain metrics (elevation, slope, relief, low-lying status) for a specific GCC ward."""
    data = TerrainService.get_chennai_ward_terrain(ward_id)
    if not data or data.get("terrain_status") == "DATA_UNAVAILABLE":
        if not data:
            raise HTTPException(status_code=404, detail=f"Ward ID {ward_id} not found in GCC boundaries.")
    return data
