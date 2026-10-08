import urllib.request
import urllib.parse
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import shapely.geometry
from app.services.spatial_query_service import ALL_TN_DISTRICTS_DATA

router = APIRouter()

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Cache of parsed district shapes
_district_shapes: Dict[str, shapely.geometry.Polygon] = {}

def get_district_shape(name: str, coords: List[List[List[float]]]) -> shapely.geometry.Polygon:
    """Helper to parse coordinates list into a Shapely Polygon."""
    if name not in _district_shapes:
        # coords is [[[lng, lat], [lng, lat], ...]]
        # Let's handle formatting safely
        poly_coords = coords[0]
        _district_shapes[name] = shapely.geometry.Polygon(poly_coords)
    return _district_shapes[name]

def resolve_parent_district(lat: float, lon: float, display_name: str) -> str:
    """Find which of the 38 TN districts this lat/lon lies in."""
    pt = shapely.geometry.Point(lon, lat)
    
    # 1. Spatial polygon intersection check (Primary)
    for name, hq, center, coords, pop in ALL_TN_DISTRICTS_DATA:
        try:
            poly = get_district_shape(name, coords)
            if poly.contains(pt):
                return name
        except Exception:
            continue
            
    # 2. Textual match fallback
    display_lower = display_name.lower()
    for name, hq, center, coords, pop in ALL_TN_DISTRICTS_DATA:
        if name.lower() in display_lower:
            return name
            
    # 3. Default to closest district center
    closest_dist = "Chennai"
    min_dist = float('inf')
    for name, hq, center, coords, pop in ALL_TN_DISTRICTS_DATA:
        c_lat, c_lon = center
        dist = (lat - c_lat) ** 2 + (lon - c_lon) ** 2
        if dist < min_dist:
            min_dist = dist
            closest_dist = name
            
    return closest_dist

@router.get(
    "/search",
    response_model=List[Dict[str, Any]],
    summary="Search for TN Districts, Towns, Villages and Localities",
    description="Uses OpenStreetMap Nominatim geocoding to search and resolve parent districts."
)
def search_locations(
    q: str = Query(..., description="Query string e.g. Sankarapuram, Attur"),
    district: Optional[str] = Query(None, description="Optional parent district filter")
):
    if not q or len(q.strip()) < 2:
        return []
        
    try:
        params = {
            "q": q,
            "format": "json",
            "countrycodes": "in",
            "state": "Tamil Nadu",
            "limit": 15
        }
        url = f"{NOMINATIM_URL}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'CivicPulse-Monsoon-SIH/2.0'})
        
        with urllib.request.urlopen(req, timeout=3.0) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        results = []
        for item in data:
            lat = float(item["lat"])
            lon = float(item["lon"])
            display_name = item["display_name"]
            place_type = item.get("type", "locality")
            
            parent = resolve_parent_district(lat, lon, display_name)
            
            # Apply district filter if requested
            if district and district != "ALL" and parent.lower() != district.lower():
                continue
                
            label = display_name.split(",")[0]
            results.append({
                "label": f"{label} ({parent})",
                "type": place_type,
                "feature": {
                    "id": f"osm-{item['osm_id']}",
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "properties": {
                        "name": label,
                        "display_name": display_name,
                        "type": place_type,
                        "district": parent,
                        "state": "Tamil Nadu",
                        "level": 13 if place_type in ["suburb", "locality", "neighbourhood"] else 11,
                        "data_source_type": "OpenStreetMap Geocoder",
                        "data_status": "Verified Public Data"
                    }
                }
            })
            
        return results
        
    except Exception as e:
        print(f"[SEARCH ERROR] Nominatim query failed: {e}")
        # Return fallback items locally matching search terms
        results = []
        term = q.lower()
        for name, hq, center, coords, pop in ALL_TN_DISTRICTS_DATA:
            if term in name.lower():
                results.append({
                    "label": f"{name} District (Tamil Nadu)",
                    "type": "district",
                    "feature": {
                        "id": f"dist-{name}",
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [center[1], center[0]]},
                        "properties": {
                            "name": name,
                            "district": name,
                            "state": "Tamil Nadu",
                            "level": 10.5,
                            "data_source_type": "Offline Bbox DB",
                            "data_status": "Verified Public Data"
                        }
                    }
                })
        return results
