from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ComplaintCreate(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    area: str = Field(..., min_length=2, max_length=150, description="Area / Locality / Ward (Chennai, Coimbatore, Erode, Salem, etc.)")
    street: Optional[str] = Field(None, max_length=200, description="Street name or landmark")
    severity: str = Field(..., description="Waterlogging severity: Low, Moderate, Severe")
    water_depth: Optional[str] = Field(None, max_length=50, description="Approximate water depth (e.g., '1 ft', 'Knee deep')")
    duration: Optional[str] = Field(None, max_length=50, description="Duration of stagnation (e.g., '2 hours', 'Overnight')")
    description: str = Field(..., min_length=5, description="Citizen description of the waterlogging situation")
    road_blocked: str = Field("Unknown", description="Road blocked: Yes, No, Unknown")
    emergency_access_affected: str = Field("Unknown", description="Emergency access affected: Yes, No, Unknown")
    
    # Optional citizen contact info (privacy protected)
    citizen_name: Optional[str] = Field(None, max_length=100)
    citizen_contact: Optional[str] = Field(None, max_length=50)

class ComplaintPublicMapItem(BaseModel):
    complaint_id: str
    latitude: float
    longitude: float
    area: str
    street: Optional[str]
    severity: str
    status: str
    verification_status: str
    data_status: str
    road_blocked: str
    emergency_access_affected: str
    photo_path: Optional[str]
    visual_state: str  # unverified (yellow), under_review (blue), assigned (orange), resolved (green)
    created_at: str

class ComplaintRiskContext(BaseModel):
    nearest_station: Optional[str] = None
    nearest_station_rainfall_mm: Optional[float] = None
    station_distance_km: Optional[float] = None
    drainage_context: str = "DATA UNAVAILABLE"
    waterbody_context: str = "DATA UNAVAILABLE"
    risk_assessment_note: str = "Citizen report recorded. Comprehensive GIS drainage model is DATA UNAVAILABLE."

class ComplaintTrackingResponse(BaseModel):
    complaint_id: str
    area: str
    street: Optional[str]
    severity: str
    water_depth: Optional[str]
    duration: Optional[str]
    description: str
    road_blocked: str
    emergency_access_affected: str
    status: str
    verification_status: str
    data_status: str
    priority: str
    assigned_crew: Optional[str]
    action_taken: Optional[str]
    photo_path: Optional[str]
    created_at: str
    updated_at: str
    is_duplicate_flag: bool
    cluster_ref_id: Optional[str]
    risk_context: ComplaintRiskContext
    status_timeline: List[Dict[str, Any]]

class ComplaintOperationsItem(BaseModel):
    id: int
    complaint_id: str
    latitude: float
    longitude: float
    area: str
    street: Optional[str]
    zone_id: Optional[int]
    ward_id: Optional[int]
    severity: str
    water_depth: Optional[str]
    duration: Optional[str]
    description: str
    road_blocked: str
    emergency_access_affected: str
    photo_path: Optional[str]
    citizen_name: Optional[str]
    citizen_contact: Optional[str]
    status: str
    verification_status: str
    data_status: str
    priority: str
    assigned_crew: Optional[str]
    action_taken: Optional[str]
    is_duplicate_flag: bool
    cluster_ref_id: Optional[str]
    created_at: str
    updated_at: str

class ComplaintReviewUpdate(BaseModel):
    status: Optional[str] = None
    verification_status: Optional[str] = None
    priority: Optional[str] = None
    assigned_crew: Optional[str] = None
    action_taken: Optional[str] = None
    zone_id: Optional[int] = None
    ward_id: Optional[int] = None
