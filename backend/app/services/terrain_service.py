import os
import json
import sqlite3
from typing import Dict, Any, List, Optional

class TerrainService:
    @staticmethod
    def _find_json_path() -> Optional[str]:
        candidate_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "processed", "elevation", "chennai_ward_terrain_verified.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "elevation", "chennai_ward_terrain_verified.json")),
            os.path.abspath("data/processed/elevation/chennai_ward_terrain_verified.json"),
            os.path.abspath("../data/processed/elevation/chennai_ward_terrain_verified.json"),
        ]
        for p in candidate_paths:
            if os.path.exists(p):
                return p
        return None

    @staticmethod
    def get_chennai_terrain_data() -> Dict[str, Any]:
        """Load and return verified Chennai terrain dataset (Copernicus DEM / NASA SRTM 30m)."""
        path = TerrainService._find_json_path()
        if path and os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    @staticmethod
    def get_chennai_terrain_summary() -> Dict[str, Any]:
        """Return city-wide elevation and terrain statistics summary."""
        data = TerrainService.get_chennai_terrain_data()
        city_stats = data.get("city_elevation_stats", {})
        return {
            "city": "Chennai",
            "state": "Tamil Nadu",
            "total_gcc_wards": data.get("total_wards", 200),
            "verified_wards": data.get("verified_wards", 200),
            "unavailable_wards": data.get("unavailable_wards", 0),
            "dem_source": data.get("source", "Copernicus GLO-30 / NASA SRTM 30m (AWS Terrain Open Data)"),
            "source_version": data.get("source_version", "GLO-30 / SRTMGL1 v003"),
            "coordinate_systems": ["EPSG:32644 (UTM Zone 44N)", "EPSG:4326 (WGS84)"],
            "processing_method": data.get("processing_method", "Exact polygon zonal statistics (Horn's finite difference for slope) with terrestrial mask"),
            "city_elevation_stats": city_stats,
            "disclaimer": "Terrain elevation is one physical factor influencing drainage vulnerability; it does not replace hydrodynamic hydraulic modeling."
        }

    @staticmethod
    def get_chennai_all_wards_terrain() -> List[Dict[str, Any]]:
        """Return list of terrain records for all 200 GCC wards."""
        data = TerrainService.get_chennai_terrain_data()
        return data.get("wards", [])

    @staticmethod
    def get_chennai_ward_terrain(ward_id: int) -> Dict[str, Any]:
        """Return verified terrain statistics for a specific GCC ward."""
        wards = TerrainService.get_chennai_all_wards_terrain()
        for w in wards:
            if w.get("ward_id") == ward_id or w.get("ward_number") == ward_id:
                return w
        return {
            "ward_id": ward_id,
            "elevation_mean_m": None,
            "terrain_status": "DATA_UNAVAILABLE",
            "terrain_source": "None",
            "message": f"Terrain data unavailable for ward {ward_id}"
        }
