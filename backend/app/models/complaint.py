from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from app.db.base_class import Base

class CitizenComplaint(Base):
    __tablename__ = "citizen_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area = Column(String(150), nullable=False, index=True)
    street = Column(String(200), nullable=True)
    zone_id = Column(Integer, nullable=True)
    ward_id = Column(Integer, nullable=True)
    
    # Waterlogging Details
    severity = Column(String(20), nullable=False)  # Low, Moderate, Severe
    water_depth = Column(String(50), nullable=True)  # e.g., "1 ft", "Ankle deep"
    duration = Column(String(50), nullable=True)     # e.g., "2 hours", "Since morning"
    description = Column(Text, nullable=False)
    road_blocked = Column(String(10), nullable=False, default="Unknown")  # Yes, No, Unknown
    emergency_access_affected = Column(String(10), nullable=False, default="Unknown")  # Yes, No, Unknown
    photo_path = Column(String(255), nullable=True)
    
    # Privacy protected citizen contact info (accessible only to authorized ops)
    citizen_name = Column(String(100), nullable=True)
    citizen_contact = Column(String(50), nullable=True)
    
    # Operational & Verification Status
    status = Column(String(30), nullable=False, default="SUBMITTED", index=True)
    # SUBMITTED, RECEIVED, UNDER REVIEW, ASSIGNED, ACTION IN PROGRESS, RESOLVED, REJECTED
    
    verification_status = Column(String(30), nullable=False, default="UNVERIFIED")
    # UNVERIFIED, VERIFIED INCIDENT, REJECTED
    
    data_status = Column(String(30), nullable=False, default="CITIZEN REPORTED")
    # CITIZEN REPORTED
    
    priority = Column(String(20), nullable=False, default="STANDARD")
    # STANDARD, ELEVATED, CRITICAL
    
    assigned_crew = Column(String(150), nullable=True)
    action_taken = Column(Text, nullable=True)
    
    # Spam / Duplicate Flagging
    is_duplicate_flag = Column(Boolean, default=False)
    cluster_ref_id = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
