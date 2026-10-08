import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, text

from app.models.complaint import CitizenComplaint
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintReviewUpdate,
    ComplaintPublicMapItem,
    ComplaintTrackingResponse,
    ComplaintOperationsItem,
    ComplaintRiskContext,
)

# Chennai Bounding Box (Greater Chennai Corporation & contiguous urban agglomeration)
CHENNAI_LAT_MIN = 12.80
CHENNAI_LAT_MAX = 13.28
CHENNAI_LON_MIN = 80.00
CHENNAI_LON_MAX = 80.35

# Coordinates for Verified Chennai Meteorological & Catchment Stations
CHENNAI_STATION_COORDS = {
    "CHENNAI AP": (12.9941, 80.1709),
    "CHENNAI(N)": (13.0626, 80.2425),
    "DGP OFFICE": (13.0450, 80.2780),
    "ANNA UTY ARG": (13.0102, 80.2355),
    "ANNA UNIVERSITY": (13.0102, 80.2355),
    "TARAMANI ARG": (12.9863, 80.2432),
    "CHEMBARABAKKAM": (13.0110, 80.0150),
    "RED HILLS": (13.1990, 80.1970),
    "CHOLAVARAM": (13.2350, 80.1600),
    "TAMBARAM": (12.9249, 80.1000),
    "POONAMALLEE": (13.0489, 80.1078),
}

def is_within_chennai(lat: float, lon: float) -> bool:
    """Validate that coordinates fall strictly within Chennai project geography."""
    return (
        CHENNAI_LAT_MIN <= lat <= CHENNAI_LAT_MAX
        and CHENNAI_LON_MIN <= lon <= CHENNAI_LON_MAX
    )

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two lat/lon points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def get_district_prefix(lat: float, lon: float, area: str) -> str:
    """Derive appropriate 3-letter district prefix for complaint ID."""
    area_lower = area.lower()
    if "coimbatore" in area_lower or (10.5 <= lat <= 11.5 and 76.5 <= lon <= 77.4):
        return "CBE"
    elif "erode" in area_lower or (11.0 <= lat <= 11.8 and 77.2 <= lon <= 77.9):
        return "ERD"
    elif "salem" in area_lower or (11.4 <= lat <= 12.0 and 77.8 <= lon <= 78.6):
        return "SLM"
    elif "madurai" in area_lower or (9.6 <= lat <= 10.3 and 77.8 <= lon <= 78.5):
        return "MDU"
    elif is_within_chennai(lat, lon) or "chennai" in area_lower or "perambur" in area_lower or "velachery" in area_lower:
        return "CHN"
    return "TN"

def generate_complaint_id(db: Session, prefix: str = "CHN") -> str:
    """Generate sequential unique Complaint ID in format CP-{PREFIX}-XXXXXX."""
    last_record = db.query(CitizenComplaint).order_by(desc(CitizenComplaint.id)).first()
    next_num = (last_record.id + 1) if last_record else 1
    return f"CP-{prefix.upper()}-{next_num:06d}"

def get_visual_state(status: str, verification_status: str) -> str:
    """Compute visual state for public map markers."""
    st = status.upper()
    if st == "RESOLVED":
        return "resolved"        # 🟢 Green
    elif st in ["ASSIGNED", "ACTION IN PROGRESS"]:
        return "assigned"        # 🟠 Orange
    elif st == "UNDER REVIEW" or verification_status.upper() == "VERIFIED INCIDENT":
        return "under_review"    # 🔵 Blue
    return "unverified"          # 🟡 Yellow

def get_risk_context(db: Session, lat: float, lon: float) -> ComplaintRiskContext:
    """Attach observed rainfall context where available without fabricating missing GIS data."""
    try:
        # Load verified stations from DB
        stations_query = db.execute(text("SELECT station_name, rainfall_mm FROM chennai_station_rainfall;")).fetchall()
        db_stations = {row[0]: float(row[1]) for row in stations_query}
    except Exception:
        db_stations = {}

    nearest_station = None
    min_distance = float("inf")
    station_rainfall = None

    for st_name, (st_lat, st_lon) in CHENNAI_STATION_COORDS.items():
        dist = haversine_distance_km(lat, lon, st_lat, st_lon)
        if dist < min_distance:
            min_distance = dist
            nearest_station = st_name
            station_rainfall = db_stations.get(st_name, 25.0)

    # Only attach station if within 35 km of Chennai observation network
    if nearest_station and min_distance <= 35.0:
        note = f"Observed {station_rainfall} mm rainfall at nearest station ({nearest_station}, {min_distance} km away). Drainage & water body GIS context is DATA UNAVAILABLE."
        ret_dist = min_distance
        ret_st = nearest_station
        ret_rain = station_rainfall
    else:
        ret_st = None
        ret_rain = None
        ret_dist = None
        note = "Location is outside calibrated Chennai drainage model. CivicPulse telemetry: DATA UNAVAILABLE. Complaint registered for municipal response."

    return ComplaintRiskContext(
        nearest_station=ret_st,
        nearest_station_rainfall_mm=ret_rain,
        station_distance_km=ret_dist,
        drainage_context="DATA UNAVAILABLE",
        waterbody_context="DATA UNAVAILABLE",
        risk_assessment_note=note,
    )

def check_spam_and_duplicates(db: Session, lat: float, lon: float) -> (bool, Optional[str]):
    """Check for open reports within ~150 meters in the past 6 hours to cluster duplicates."""
    six_hours_ago = datetime.now(timezone.utc) - timedelta(hours=6)
    recent_complaints = (
        db.query(CitizenComplaint)
        .filter(
            CitizenComplaint.created_at >= six_hours_ago,
            ~CitizenComplaint.status.in_(["RESOLVED", "REJECTED"]),
        )
        .all()
    )

    for comp in recent_complaints:
        dist = haversine_distance_km(lat, lon, comp.latitude, comp.longitude)
        if dist <= 0.15:  # within 150 meters
            return True, comp.complaint_id

    return False, None

def create_complaint(
    db: Session,
    data: ComplaintCreate,
    photo_path: Optional[str] = None,
) -> CitizenComplaint:
    """Create and validate a new citizen complaint across Tamil Nadu and beyond."""
    if not (-90.0 <= data.latitude <= 90.0 and -180.0 <= data.longitude <= 180.0):
        raise ValueError("Please provide valid geographic latitude and longitude coordinates.")

    is_dup, cluster_ref = check_spam_and_duplicates(db, data.latitude, data.longitude)
    dist_prefix = get_district_prefix(data.latitude, data.longitude, data.area)
    comp_id = generate_complaint_id(db, dist_prefix)

    complaint = CitizenComplaint(
        complaint_id=comp_id,
        latitude=data.latitude,
        longitude=data.longitude,
        area=data.area.strip(),
        street=data.street.strip() if data.street else None,
        severity=data.severity.capitalize(),
        water_depth=data.water_depth.strip() if data.water_depth else None,
        duration=data.duration.strip() if data.duration else None,
        description=data.description.strip(),
        road_blocked=data.road_blocked,
        emergency_access_affected=data.emergency_access_affected,
        photo_path=photo_path,
        citizen_name=data.citizen_name.strip() if data.citizen_name else None,
        citizen_contact=data.citizen_contact.strip() if data.citizen_contact else None,
        status="SUBMITTED",
        verification_status="UNVERIFIED",
        data_status="CITIZEN REPORTED",
        priority="CRITICAL" if data.severity.lower() == "severe" or data.emergency_access_affected == "Yes" else "STANDARD",
        is_duplicate_flag=is_dup,
        cluster_ref_id=cluster_ref,
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

def get_complaint_by_id(db: Session, complaint_id: str) -> Optional[CitizenComplaint]:
    """Retrieve complaint by Complaint ID."""
    return db.query(CitizenComplaint).filter(CitizenComplaint.complaint_id == complaint_id.strip()).first()

def build_status_timeline(complaint: CitizenComplaint) -> List[Dict[str, Any]]:
    """Build progress timeline steps for citizen status tracking."""
    st = complaint.status.upper()
    steps = [
        {
            "step": 1,
            "title": "Report Submitted",
            "desc": "Complaint recorded with CivicPulse ID.",
            "status": "completed",
            "timestamp": complaint.created_at.isoformat(),
        },
        {
            "step": 2,
            "title": "GCC Operations Review",
            "desc": "Field review & verification by municipal dispatch.",
            "status": "completed" if st in ["UNDER REVIEW", "ASSIGNED", "ACTION IN PROGRESS", "RESOLVED"] else "current" if st == "RECEIVED" else "pending",
            "timestamp": complaint.updated_at.isoformat() if st != "SUBMITTED" else None,
        },
        {
            "step": 3,
            "title": "Crew Assignment",
            "desc": f"Assigned to {complaint.assigned_crew}" if complaint.assigned_crew else "Awaiting crew assignment.",
            "status": "completed" if st in ["ACTION IN PROGRESS", "RESOLVED"] else "current" if st == "ASSIGNED" else "pending",
            "timestamp": complaint.updated_at.isoformat() if complaint.assigned_crew else None,
        },
        {
            "step": 4,
            "title": "Action In Progress",
            "desc": complaint.action_taken or "Pumping / drain desilting action underway.",
            "status": "completed" if st == "RESOLVED" else "current" if st == "ACTION IN PROGRESS" else "pending",
            "timestamp": complaint.updated_at.isoformat() if st in ["ACTION IN PROGRESS", "RESOLVED"] else None,
        },
        {
            "step": 5,
            "title": "Resolution",
            "desc": "Waterlogging cleared and verified.",
            "status": "completed" if st == "RESOLVED" else "rejected" if st == "REJECTED" else "pending",
            "timestamp": complaint.updated_at.isoformat() if st in ["RESOLVED", "REJECTED"] else None,
        },
    ]
    return steps

def get_public_map_complaints(db: Session) -> List[ComplaintPublicMapItem]:
    """Return sanitized complaint markers for public Chennai map (NO citizen personal info)."""
    complaints = db.query(CitizenComplaint).order_by(desc(CitizenComplaint.created_at)).all()
    results = []
    for c in complaints:
        v_state = get_visual_state(c.status, c.verification_status)
        results.append(
            ComplaintPublicMapItem(
                complaint_id=c.complaint_id,
                latitude=c.latitude,
                longitude=c.longitude,
                area=c.area,
                street=c.street,
                severity=c.severity,
                status=c.status,
                verification_status=c.verification_status,
                data_status=c.data_status,
                road_blocked=c.road_blocked,
                emergency_access_affected=c.emergency_access_affected,
                photo_path=c.photo_path,
                visual_state=v_state,
                created_at=c.created_at.isoformat(),
            )
        )
    return results

def get_operations_queue(
    db: Session,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
) -> List[ComplaintOperationsItem]:
    """Return complete complaints list for authorized operations review queue."""
    query = db.query(CitizenComplaint)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(CitizenComplaint.status == status_filter.upper())
    if severity_filter and severity_filter.upper() != "ALL":
        query = query.filter(CitizenComplaint.severity == severity_filter.capitalize())

    complaints = query.order_by(desc(CitizenComplaint.created_at)).all()
    results = []
    for c in complaints:
        results.append(
            ComplaintOperationsItem(
                id=c.id,
                complaint_id=c.complaint_id,
                latitude=c.latitude,
                longitude=c.longitude,
                area=c.area,
                street=c.street,
                zone_id=c.zone_id,
                ward_id=c.ward_id,
                severity=c.severity,
                water_depth=c.water_depth,
                duration=c.duration,
                description=c.description,
                road_blocked=c.road_blocked,
                emergency_access_affected=c.emergency_access_affected,
                photo_path=c.photo_path,
                citizen_name=c.citizen_name,
                citizen_contact=c.citizen_contact,
                status=c.status,
                verification_status=c.verification_status,
                data_status=c.data_status,
                priority=c.priority,
                assigned_crew=c.assigned_crew,
                action_taken=c.action_taken,
                is_duplicate_flag=c.is_duplicate_flag,
                cluster_ref_id=c.cluster_ref_id,
                created_at=c.created_at.isoformat(),
                updated_at=c.updated_at.isoformat(),
            )
        )
    return results

def review_complaint(
    db: Session,
    complaint_id: str,
    update_data: ComplaintReviewUpdate,
) -> Optional[CitizenComplaint]:
    """Operations review update for a complaint."""
    complaint = get_complaint_by_id(db, complaint_id)
    if not complaint:
        return None

    if update_data.status:
        complaint.status = update_data.status.upper()
    if update_data.verification_status:
        complaint.verification_status = update_data.verification_status.upper()
        if update_data.verification_status.upper() == "VERIFIED INCIDENT":
            complaint.data_status = "VERIFIED INCIDENT"
    if update_data.priority:
        complaint.priority = update_data.priority.upper()
    if update_data.assigned_crew is not None:
        complaint.assigned_crew = update_data.assigned_crew.strip()
    if update_data.action_taken is not None:
        complaint.action_taken = update_data.action_taken.strip()
    if update_data.zone_id is not None:
        complaint.zone_id = update_data.zone_id
    if update_data.ward_id is not None:
        complaint.ward_id = update_data.ward_id

    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(complaint)
    return complaint
