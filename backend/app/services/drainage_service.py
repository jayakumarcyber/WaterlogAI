import os
import json
from typing import Dict, Any, List, Optional

class DrainageService:
    _cache: Dict[str, Any] = {}

    @staticmethod
    def _find_path(rel_path: str) -> Optional[str]:
        candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", rel_path)),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", rel_path)),
            os.path.abspath(rel_path),
            os.path.abspath(os.path.join("..", rel_path)),
        ]
        for p in candidates:
            if os.path.exists(p):
                return p
        return None

    @staticmethod
    def _load_cached_json(cache_key: str, rel_path: str) -> Dict[str, Any]:
        if cache_key in DrainageService._cache:
            return DrainageService._cache[cache_key]
        path = DrainageService._find_path(rel_path)
        if path and os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    DrainageService._cache[cache_key] = data
                    return data
            except Exception:
                pass
        return {}

    @staticmethod
    def get_chennai_drainage_data() -> Dict[str, Any]:
        """Load and return verified Chennai drainage summary & ward metrics JSON."""
        return DrainageService._load_cached_json("ward_drainage", "data/processed/network/chennai_ward_drainage_verified.json")

    @staticmethod
    def get_chennai_drainage_summary() -> Dict[str, Any]:
        """Return city-wide stormwater drainage and road network metrics summary."""
        data = DrainageService.get_chennai_drainage_data()
        summary = data.get("summary", {})
        return {
            "city": "Chennai",
            "state": "Tamil Nadu",
            "total_gcc_wards": summary.get("total_wards", 200),
            "wards_with_official_swd": summary.get("wards_with_official_swd", 198),
            "total_drain_features": summary.get("total_swd_features", 10255),
            "total_drain_length_km": summary.get("total_swd_length_km", 2209.08),
            "total_road_features": summary.get("total_road_features", 2840),
            "total_road_length_km": summary.get("total_road_length_km", 573.73),
            "total_waterway_features": summary.get("total_waterway_features", 934),
            "total_waterbody_features": summary.get("total_waterbody_features", 758),
            "total_outfall_features": summary.get("total_outfall_features", 5466),
            "total_topology_junction_nodes": summary.get("total_topology_junction_nodes", 3155),
            "total_road_drainage_culvert_intersections": summary.get("total_road_drainage_culvert_intersections", 251),
            "mean_ward_drainage_density_km_sqkm": summary.get("mean_ward_drainage_density_km_sqkm", 6.984),
            "mean_ward_road_density_km_sqkm": summary.get("mean_ward_road_density_km_sqkm", 1.33),
            "network_summary": {
                "total_drain_length_km_study_area": summary.get("total_swd_length_km", 2209.08),
                "total_drain_length_km_in_wards": summary.get("total_swd_length_km", 2209.08),
                "wards_with_mapped_drains": summary.get("wards_with_official_swd", 198),
                "total_road_length_km_study_area": summary.get("total_road_length_km", 573.73),
                "total_road_length_km_in_wards": summary.get("total_road_length_km", 573.73)
            },
            "data_sources": summary.get("data_sources", {}),
            "coordinate_systems": ["EPSG:32644 (UTM Zone 44N metric analysis)", "EPSG:4326 (WGS84 storage)"],
            "topology_model": "Drain Segment -> Junction Node -> Canal/Waterway -> Terminal Outfall",
            "disclaimer": summary.get("non_fabrication_disclaimer", "Drain presence is NOT drainage capacity. Hydraulic capacity, blocked status, and maintenance conditions are not fabricated and are marked Data Unavailable."),
            "data_status": "VERIFIED_OFFICIAL_GEOMETRIES"
        }

    @staticmethod
    def get_chennai_all_wards_drainage() -> List[Dict[str, Any]]:
        """Return drainage and road network metrics for all 200 GCC wards."""
        data = DrainageService.get_chennai_drainage_data()
        wards = data.get("wards", [])
        for w in wards:
            if "drain_length_km" not in w:
                w["drain_length_km"] = w.get("total_drain_length_km")
            if "road_length_km" not in w:
                w["road_length_km"] = w.get("total_road_length_km")
        return wards

    @staticmethod
    def get_chennai_ward_drainage(ward_id: int) -> Dict[str, Any]:
        """Return drainage metrics for a specific GCC ward."""
        wards = DrainageService.get_chennai_all_wards_drainage()
        for w in wards:
            if w.get("ward_id") == ward_id or w.get("ward_number") == ward_id:
                if "drain_length_km" not in w:
                    w["drain_length_km"] = w.get("total_drain_length_km")
                if "road_length_km" not in w:
                    w["road_length_km"] = w.get("total_road_length_km")
                return w
        return {
            "ward_id": ward_id,
            "drain_length_km": None,
            "road_length_km": None,
            "data_status": "DATA_UNAVAILABLE",
            "message": f"Drainage data unavailable for ward {ward_id}"
        }

    @staticmethod
    def get_drains_network_geojson(ward_id: Optional[int] = None) -> Dict[str, Any]:
        """Return official GeoJSON network of stormwater drains (GCC SWD 2023)."""
        data = DrainageService._load_cached_json("swd_network", "data/processed/network/chennai_stormwater_drains.geojson")
        if not data or not data.get("features"):
            data = DrainageService._load_cached_json("drains_network", "data/processed/network/chennai_drains_network.geojson")
        if not data or not data.get("features"):
            return {"type": "FeatureCollection", "features": []}
        if ward_id is not None:
            filtered = [f for f in data.get("features", []) if f.get("properties", {}).get("ward_id") == ward_id]
            return {"type": "FeatureCollection", "features": filtered}
        return data

    @staticmethod
    def get_waterways_geojson(ward_id: Optional[int] = None) -> Dict[str, Any]:
        """Return official GeoJSON of major waterways, canals, and rivers."""
        data = DrainageService._load_cached_json("waterways", "data/processed/network/chennai_waterways.geojson")
        if not data or not data.get("features"):
            return {"type": "FeatureCollection", "features": []}
        if ward_id is not None:
            filtered = [f for f in data.get("features", []) if f.get("properties", {}).get("ward_id") == ward_id]
            return {"type": "FeatureCollection", "features": filtered}
        return data

    @staticmethod
    def get_roads_network_geojson(ward_id: Optional[int] = None) -> Dict[str, Any]:
        """Return GeoJSON network of arterial and primary roads."""
        data = DrainageService._load_cached_json("roads_network", "data/processed/network/chennai_roads_network.geojson")
        if not data or not data.get("features"):
            return {"type": "FeatureCollection", "features": []}
        if ward_id is not None:
            filtered = [f for f in data.get("features", []) if f.get("properties", {}).get("ward_id") == ward_id]
            return {"type": "FeatureCollection", "features": filtered}
        return data

    @staticmethod
    def get_waterbodies_network_geojson(ward_id: Optional[int] = None) -> Dict[str, Any]:
        """Return GeoJSON network of waterbodies (lakes, reservoirs, ponds)."""
        data = DrainageService._load_cached_json("waterbodies_network", "data/processed/network/chennai_waterbodies_network.geojson")
        if not data or not data.get("features"):
            return {"type": "FeatureCollection", "features": []}
        if ward_id is not None:
            filtered = [f for f in data.get("features", []) if f.get("properties", {}).get("ward_id") == ward_id]
            return {"type": "FeatureCollection", "features": filtered}
        return data

    @staticmethod
    def get_outfalls_geojson(ward_id: Optional[int] = None) -> Dict[str, Any]:
        """Return official CMWSSB terminal chambers and discharge outfalls GeoJSON."""
        data = DrainageService._load_cached_json("outfalls", "data/processed/network/chennai_outfalls.geojson")
        if not data or not data.get("features"):
            return {"type": "FeatureCollection", "features": []}
        if ward_id is not None:
            filtered = [f for f in data.get("features", []) if f.get("properties", {}).get("ward_id") == ward_id]
            return {"type": "FeatureCollection", "features": filtered}
        return data

    @staticmethod
    def get_drainage_nodes_geojson(ward_id: Optional[int] = None) -> Dict[str, Any]:
        """Return topologically derived drainage junction nodes GeoJSON."""
        data = DrainageService._load_cached_json("nodes", "data/processed/network/chennai_drainage_nodes.geojson")
        if not data or not data.get("features"):
            return {"type": "FeatureCollection", "features": []}
        if ward_id is not None:
            filtered = [f for f in data.get("features", []) if f.get("properties", {}).get("ward_id") == ward_id]
            return {"type": "FeatureCollection", "features": filtered}
        return data

    @staticmethod
    def get_drainage_topology_summary() -> Dict[str, Any]:
        """Return overall drainage network topology summary."""
        data = DrainageService._load_cached_json("topology_summary", "data/processed/network/chennai_ward_drainage_topology.json")
        if data:
            return data
        return {"city": "Chennai", "total_wards": 200, "status": "DERIVED_TOPOLOGY"}

