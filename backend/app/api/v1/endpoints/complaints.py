import os
import uuid
import shutil
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintPublicMapItem,
    ComplaintTrackingResponse,
    ComplaintOperationsItem,
    ComplaintReviewUpdate,
)
from app.services import complaint_service

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "uploads", "complaints"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov"}

@router.post(
    "",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False
)
@router.post(
    "/",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a Citizen Waterlogging Complaint",
    description="Registers a real-world citizen waterlogging report. Validates geographic coordinates and generates a unique CivicPulse Complaint ID."
)
def submit_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db)
):
    try:
        complaint = complaint_service.create_complaint(db=db, data=complaint_in)
        return {
            "success": True,
            "complaint_id": complaint.complaint_id,
            "status": complaint.status,
            "verification_status": complaint.verification_status,
            "data_status": complaint.data_status,
            "priority": complaint.priority,
            "is_duplicate_flag": complaint.is_duplicate_flag,
            "cluster_ref_id": complaint.cluster_ref_id,
            "message": "Waterlogging complaint registered successfully. Track progress using your CivicPulse Complaint ID."
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to submit complaint: {str(e)}")

@router.post(
    "/upload-media",
    response_model=Dict[str, Any],
    summary="Upload Photo/Video for Complaint",
    description="Allows citizen to attach photo or short video evidence of waterlogging."
)
async def upload_complaint_media(
    file: UploadFile = File(...)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "success": True,
        "filename": unique_filename,
        "media_url": f"/uploads/complaints/{unique_filename}"
    }

@router.get(
    "/track/{complaint_id}",
    response_model=ComplaintTrackingResponse,
    summary="Citizen Complaint Status Tracking",
    description="Returns public status progression, actions taken, and local rainfall context for a citizen's complaint."
)
def track_complaint(
    complaint_id: str,
    db: Session = Depends(get_db)
):
    complaint = complaint_service.get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' not found. Please verify your CivicPulse Complaint ID."
        )
        
    risk_ctx = complaint_service.get_risk_context(db, complaint.latitude, complaint.longitude)
    timeline = complaint_service.build_status_timeline(complaint)
    
    return ComplaintTrackingResponse(
        complaint_id=complaint.complaint_id,
        area=complaint.area,
        street=complaint.street,
        severity=complaint.severity,
        water_depth=complaint.water_depth,
        duration=complaint.duration,
        description=complaint.description,
        road_blocked=complaint.road_blocked,
        emergency_access_affected=complaint.emergency_access_affected,
        status=complaint.status,
        verification_status=complaint.verification_status,
        data_status=complaint.data_status,
        priority=complaint.priority,
        assigned_crew=complaint.assigned_crew,
        action_taken=complaint.action_taken,
        photo_path=complaint.photo_path,
        created_at=complaint.created_at.isoformat(),
        updated_at=complaint.updated_at.isoformat(),
        is_duplicate_flag=complaint.is_duplicate_flag,
        cluster_ref_id=complaint.cluster_ref_id,
        risk_context=risk_ctx,
        status_timeline=timeline
    )

@router.get(
    "/public/map",
    response_model=List[ComplaintPublicMapItem],
    summary="Public Chennai Map Complaint Markers",
    description="Returns sanitized complaint markers for public map display. Citizen personal details are completely excluded."
)
def get_public_map_markers(db: Session = Depends(get_db)):
    return complaint_service.get_public_map_complaints(db)

@router.get(
    "/operations/queue",
    response_model=List[ComplaintOperationsItem],
    summary="GCC Municipal Operations Complaint Queue",
    description="Returns full complaint queue for authorized municipal operations staff, including contact details and dispatch status."
)
def get_operations_complaint_queue(
    status_filter: Optional[str] = Query("ALL"),
    severity_filter: Optional[str] = Query("ALL"),
    db: Session = Depends(get_db)
):
    return complaint_service.get_operations_queue(db, status_filter=status_filter, severity_filter=severity_filter)

@router.get(
    "/operations/summary",
    response_model=Dict[str, Any],
    summary="Operations Complaints Summary Metrics",
    description="Returns aggregate counts of citizen complaints across verification and resolution statuses."
)
def get_complaints_summary(db: Session = Depends(get_db)):
    from app.models.complaint import CitizenComplaint
    total = db.query(CitizenComplaint).count()
    unverified = db.query(CitizenComplaint).filter(CitizenComplaint.verification_status == "UNVERIFIED").count()
    under_review = db.query(CitizenComplaint).filter(CitizenComplaint.status == "UNDER REVIEW").count()
    assigned = db.query(CitizenComplaint).filter(CitizenComplaint.status.in_(["ASSIGNED", "ACTION IN PROGRESS"])).count()
    resolved = db.query(CitizenComplaint).filter(CitizenComplaint.status == "RESOLVED").count()
    critical = db.query(CitizenComplaint).filter(CitizenComplaint.priority == "CRITICAL", CitizenComplaint.status != "RESOLVED").count()
    
    return {
        "total_complaints": total,
        "unverified_count": unverified,
        "under_review_count": under_review,
        "assigned_action_count": assigned,
        "resolved_count": resolved,
        "active_critical_priority": critical,
        "data_status": "CITIZEN REPORTED (NO FABRICATED DATA)"
    }

@router.patch(
    "/operations/{complaint_id}/review",
    response_model=Dict[str, Any],
    summary="Review & Dispatch Complaint (Authorized Operations)",
    description="Update verification status, crew assignment, progress status, and resolution details."
)
def review_complaint_endpoint(
    complaint_id: str,
    update_in: ComplaintReviewUpdate,
    db: Session = Depends(get_db)
):
    updated = complaint_service.review_complaint(db, complaint_id, update_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint '{complaint_id}' not found."
        )
    return {
        "success": True,
        "complaint_id": updated.complaint_id,
        "status": updated.status,
        "verification_status": updated.verification_status,
        "priority": updated.priority,
        "assigned_crew": updated.assigned_crew,
        "action_taken": updated.action_taken,
        "updated_at": updated.updated_at.isoformat()
    }

@router.get(
    "/{complaint_id}",
    response_model=ComplaintTrackingResponse,
    summary="Citizen Complaint Status Tracking by ID",
    description="Direct alias for tracking a complaint by ID."
)
def get_complaint_direct(
    complaint_id: str,
    db: Session = Depends(get_db)
):
    return track_complaint(complaint_id=complaint_id, db=db)
