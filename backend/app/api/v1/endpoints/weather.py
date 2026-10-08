"""
Live Weather API Endpoints
Provides real-time coordinate-based weather and forecast for Chennai and configured coordinates.
Connected to real weather provider (Open-Meteo) with in-memory caching and stale fallback.
Zero fake data; returns 503 only if provider is unreachable and no cached telemetry exists.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, Optional
from app.services import weather_service

router = APIRouter()

@router.get("/health", summary="Weather Provider Health Check")
def get_weather_health() -> Dict[str, Any]:
    """Returns provider connectivity, latency and last success status."""
    return weather_service.check_provider_health()

@router.get("/chennai/debug", summary="Safe Chennai Weather Diagnostics")
def get_chennai_weather_debug() -> Dict[str, Any]:
    """Returns safe diagnostics without exposing secrets."""
    return weather_service.get_chennai_debug_diagnostics()

@router.get("/chennai", summary="Get Live Chennai Weather & Multi-Horizon Forecast")
def get_chennai_weather(
    refresh: bool = Query(False, description="Force refresh cache from real weather API")
) -> Dict[str, Any]:
    """
    Returns current live weather and 12h/24h/48h/72h forecast for Chennai (Lat: 13.0827, Lon: 80.2707).
    Primary endpoint for CivicPulse dashboard live weather widget.
    """
    try:
        return weather_service.get_chennai_weather(force_refresh=refresh)
    except HTTPException:
        raise
    except Exception as e:
        code = getattr(e, "error_code", "WEATHER_SERVICE_ERROR")
        raise HTTPException(
            status_code=503,
            detail=f"[{code}] Live weather error: {str(e)}"
        )

@router.get("/chennai/current", summary="Get Current Real Chennai Weather (Legacy)")
def get_chennai_current(
    refresh: bool = Query(False, description="Force refresh cache from real weather API")
) -> Dict[str, Any]:
    """
    Returns current live weather for Chennai.
    Cached for 10 minutes unless refresh=True is supplied.
    """
    try:
        data = weather_service.get_current_weather(force_refresh=refresh)
        return {
            "location": "Chennai, Tamil Nadu",
            "latitude": data["latitude"],
            "longitude": data["longitude"],
            "timezone": data["timezone"],
            "current": data["current"],
            "hourly": data["hourly"],
            "source": data["source"],
            "fetched_at": data["fetched_at"],
            "status": data["status"],
            "is_live": data.get("is_live", True),
            "cached_age_seconds": data.get("cached_age_seconds", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Live weather temporarily unavailable: {str(e)}"
        )

@router.get("/chennai/forecast", summary="Get Chennai Hourly and Multi-day Forecast (Legacy)")
def get_chennai_forecast(
    refresh: bool = Query(False, description="Force refresh cache from real weather API")
) -> Dict[str, Any]:
    """
    Returns next 24-48 hours forecast and summaries for Chennai.
    """
    try:
        data = weather_service.get_forecast_weather(force_refresh=refresh)
        return {
            "location": data["location"],
            "latitude": data["latitude"],
            "longitude": data["longitude"],
            "timezone": data["timezone"],
            "current": data["current"],
            "forecast": data.get("forecast", []),
            "hourly": data["hourly"],
            "summaries": data["summaries"],
            "source": data["source"],
            "fetched_at": data["fetched_at"],
            "status": data["status"],
            "is_live": data.get("is_live", True),
            "cached_age_seconds": data.get("cached_age_seconds", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Live weather temporarily unavailable: {str(e)}"
        )

@router.get("/coordinates", summary="Get Live Weather for Specific Geographic Coordinates")
def get_coordinates_weather(
    lat: float = Query(..., description="Latitude of target location"),
    lon: float = Query(..., description="Longitude of target location"),
    location: Optional[str] = Query("Custom Location", description="Display name of target location"),
    refresh: bool = Query(False, description="Force refresh cache")
) -> Dict[str, Any]:
    """
    Retrieves live weather for any geographic coordinates in Tamil Nadu or globally.
    Supports location-aware weather for selected districts.
    """
    try:
        return weather_service.get_weather_for_coordinates(
            lat=lat,
            lon=lon,
            location_name=location or "Custom Location",
            force_refresh=refresh
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Live weather temporarily unavailable: {str(e)}"
        )

@router.get("", summary="Get Weather Telemetry")
def get_default_weather(
    lat: Optional[float] = Query(None, description="Optional latitude"),
    lon: Optional[float] = Query(None, description="Optional longitude"),
    location: Optional[str] = Query(None, description="Optional location name"),
    refresh: bool = Query(False, description="Force refresh")
) -> Dict[str, Any]:
    """
    Default weather endpoint. If coordinates are provided, queries them;
    otherwise defaults to Chennai GCC core coordinates.
    """
    if lat is not None and lon is not None:
        return get_coordinates_weather(lat=lat, lon=lon, location=location, refresh=refresh)
    return get_chennai_weather(refresh=refresh)
