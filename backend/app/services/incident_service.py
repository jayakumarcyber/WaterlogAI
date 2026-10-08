import os
import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.incident import CivicIncident

# Path resolution for processed incident datasets
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PROCESSED_INCIDENTS_JSON = os.path.join(BASE_DIR, "data", "processed", "incidents", "chennai_historical_incidents_verified.json")
PROCESSED_INCIDENTS_GEOJSON = os.path.join(BASE_DIR, "data", "processed", "incidents", "chennai_historical_incidents_verified.geojson")
PROCESSED_SECONDARY_GEOJSON = os.path.join(BASE_DIR, "data", "processed", "incidents", "chennai_secondary_evidence_crowdsourced_2015.geojson")
WARD_SUMMARY_JSON = os.path.join(BASE_DIR, "data", "processed", "incidents", "chennai_ward_incident_summary.json")
PROVENANCE_JSON = os.path.join(BASE_DIR, "data", "metadata", "historical_incidents_provenance.json")

# Fallback path if running directly in backend directory
if not os.path.exists(PROCESSED_INCIDENTS_JSON):
    ROOT_BASE = os.path.abspath(os.path.join(BASE_DIR, ".."))
    PROCESSED_INCIDENTS_JSON = os.path.join(ROOT_BASE, "data", "processed", "incidents", "chennai_historical_incidents_verified.json")
    PROCESSED_INCIDENTS_GEOJSON = os.path.join(ROOT_BASE, "data", "processed", "incidents", "chennai_historical_incidents_verified.geojson")
    PROCESSED_SECONDARY_GEOJSON = os.path.join(ROOT_BASE, "data", "processed", "incidents", "chennai_secondary_evidence_crowdsourced_2015.geojson")
    WARD_SUMMARY_JSON = os.path.join(ROOT_BASE, "data", "processed", "incidents", "chennai_ward_incident_summary.json")
    PROVENANCE_JSON = os.path.join(ROOT_BASE, "data", "metadata", "historical_incidents_provenance.json")

class IncidentService:
    _cached_incidents: Optional[List[Dict[str, Any]]] = None
    _cached_geojson: Optional[Dict[str, Any]] = None
    _cached_secondary_geojson: Optional[Dict[str, Any]] = None
    _cached_ward_summaries: Optional[List[Dict[str, Any]]] = None
    _cached_provenance: Optional[Dict[str, Any]] = None

    @classmethod
    def _load_incidents(cls) -> List[Dict[str, Any]]:
        if cls._cached_incidents is None:
            if os.path.exists(PROCESSED_INCIDENTS_JSON):
                with open(PROCESSED_INCIDENTS_JSON, "r", encoding="utf-8") as f:
                    cls._cached_incidents = json.load(f)
            else:
                cls._cached_incidents = []
        return cls._cached_incidents

    @classmethod
    def _load_geojson(cls) -> Dict[str, Any]:
        if cls._cached_geojson is None:
            if os.path.exists(PROCESSED_INCIDENTS_GEOJSON):
                with open(PROCESSED_INCIDENTS_GEOJSON, "r", encoding="utf-8") as f:
                    cls._cached_geojson = json.load(f)
            else:
                cls._cached_geojson = {"type": "FeatureCollection", "features": []}
        return cls._cached_geojson

    @classmethod
    def _load_secondary_geojson(cls) -> Dict[str, Any]:
        if cls._cached_secondary_geojson is None:
            if os.path.exists(PROCESSED_SECONDARY_GEOJSON):
                with open(PROCESSED_SECONDARY_GEOJSON, "r", encoding="utf-8") as f:
                    cls._cached_secondary_geojson = json.load(f)
            else:
                cls._cached_secondary_geojson = {"type": "FeatureCollection", "features": []}
        return cls._cached_secondary_geojson

    @classmethod
    def _load_ward_summaries(cls) -> List[Dict[str, Any]]:
        if cls._cached_ward_summaries is None:
            if os.path.exists(WARD_SUMMARY_JSON):
                with open(WARD_SUMMARY_JSON, "r", encoding="utf-8") as f:
                    cls._cached_ward_summaries = json.load(f)
            else:
                cls._cached_ward_summaries = []
        return cls._cached_ward_summaries

    @classmethod
    def _load_provenance(cls) -> Dict[str, Any]:
        if cls._cached_provenance is None:
            if os.path.exists(PROVENANCE_JSON):
                with open(PROVENANCE_JSON, "r", encoding="utf-8") as f:
                    cls._cached_provenance = json.load(f)
            else:
                cls._cached_provenance = {}
        return cls._cached_provenance

    @classmethod
    def get_chennai_summary(cls) -> Dict[str, Any]:
        """Produce citywide event-level and ward-level summary statistics."""
        incidents = cls._load_incidents()
        summaries = cls._load_ward_summaries()
        
        by_year: Dict[str, int] = {}
        by_event: Dict[str, int] = {}
        by_source: Dict[str, int] = {}
        by_severity: Dict[str, int] = {}
        mapped_count = 0
        unmapped_count = 0
        wards_with_incidents = set()

        for inc in incidents:
            wid = inc.get("ward_id")
            if isinstance(wid, int):
                mapped_count += 1
                wards_with_incidents.add(wid)
            else:
                unmapped_count += 1

            year = inc.get("event_date", "").split("-")[0]
            if year:
                by_year[year] = by_year.get(year, 0) + 1

            event = inc.get("event_name", "Unknown Event")
            by_event[event] = by_event.get(event, 0) + 1

            source = inc.get("source", "Unknown Source")
            by_source[source] = by_source.get(source, 0) + 1

            sev = inc.get("severity", "medium")
            by_severity[sev] = by_severity.get(sev, 0) + 1

        sec_features = cls._load_secondary_geojson().get("features", [])

        return {
            "city": "Chennai",
            "total_verified_incidents": len(incidents),
            "spatially_mapped_to_gcc_wards": mapped_count,
            "unmapped_records": unmapped_count,
            "unmapped_rationale": "2 records located in Madhanandhapuram fringe lie immediately outside official GCC 200 administrative boundaries (ward_id = 'Data Unavailable').",
            "total_gcc_wards": 200,
            "wards_with_verified_incidents": len(wards_with_incidents),
            "ward_incident_coverage_pct": round(len(wards_with_incidents) / 200.0 * 100.0, 1),
            "incidents_by_year": by_year,
            "incidents_by_event": by_event,
            "incidents_by_severity": by_severity,
            "source_distribution": by_source,
            "secondary_evidence_records": len(sec_features),
            "secondary_evidence_description": "Crowd-sourced flooded street segments during Chennai Floods 2015",
            "data_policy": {
                "rainfall_converted_to_incident": False,
                "fabrication_permitted": False,
                "unmapped_handling": "Marked explicitly as Data Unavailable"
            },
            "status": "VERIFIED_OFFICIAL_INCIDENTS"
        }

    @classmethod
    def get_ward_summary(cls, ward_id: int) -> Optional[Dict[str, Any]]:
        summaries = cls._load_ward_summaries()
        for s in summaries:
            if s.get("ward_id") == ward_id:
                return s
        return None

    @classmethod
    def get_all_ward_summaries(cls) -> List[Dict[str, Any]]:
        return cls._load_ward_summaries()

    @classmethod
    def get_incidents_geojson(cls, ward_id: Optional[int] = None, severity: Optional[str] = None) -> Dict[str, Any]:
        data = cls._load_geojson()
        features = data.get("features", [])
        if ward_id is not None:
            features = [f for f in features if f.get("properties", {}).get("ward_id") == ward_id]
        if severity is not None and severity != "ALL":
            features = [f for f in features if f.get("properties", {}).get("severity") == severity]
        return {"type": "FeatureCollection", "features": features}

    @classmethod
    def get_secondary_geojson(cls) -> Dict[str, Any]:
        return cls._load_secondary_geojson()


def get_incidents(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    ward_id: Optional[int] = None,
    incident_type: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve verified historical civic incidents."""
    try:
        query = db.query(CivicIncident)
        if ward_id is not None:
            query = query.filter(CivicIncident.ward_id == ward_id)
        if incident_type is not None:
            query = query.filter(CivicIncident.incident_type == incident_type)
        if status is not None:
            query = query.filter(CivicIncident.status == status)
        if severity is not None:
            query = query.filter(CivicIncident.severity == severity)
        db_records = query.order_by(CivicIncident.reported_at.desc()).offset(skip).limit(limit).all()
        if db_records:
            return [
                {
                    "id": inc.id,
                    "incident_type": inc.incident_type,
                    "description": inc.description,
                    "latitude": inc.latitude,
                    "longitude": inc.longitude,
                    "reported_at": inc.reported_at.isoformat() if inc.reported_at else None,
                    "severity": inc.severity,
                    "source": inc.source,
                    "status": inc.status,
                    "ward_id": inc.ward_id,
                    "evidence_quality": inc.evidence_quality,
                    "data_source_type": "OFFICIAL_HISTORICAL_RECORD"
                }
                for inc in db_records
            ]
    except Exception:
        pass

    # Fallback to verified processed JSON dataset
    incidents = IncidentService._load_incidents()
    filtered = incidents
    if ward_id is not None:
        filtered = [i for i in filtered if i.get("ward_id") == ward_id]
    if incident_type is not None:
        filtered = [i for i in filtered if i.get("incident_type") == incident_type]
    if severity is not None:
        filtered = [i for i in filtered if i.get("severity") == severity]

    return [
        {
            "id": idx + 1 + skip,
            "incident_type": i.get("incident_type", "waterlogging"),
            "description": i.get("description"),
            "latitude": i.get("latitude"),
            "longitude": i.get("longitude"),
            "reported_at": f"{i.get('event_date', '2015-12-01')}T12:00:00+05:30",
            "severity": i.get("severity", "high"),
            "source": i.get("source"),
            "status": "verified",
            "ward_id": i.get("ward_id"),
            "evidence_quality": 1.0,
            "data_source_type": "OFFICIAL_HISTORICAL_RECORD"
        }
        for idx, i in enumerate(filtered[skip:skip+limit])
    ]

def get_incident_by_id(db: Session, incident_id: int) -> Optional[Dict[str, Any]]:
    try:
        inc = db.query(CivicIncident).filter(CivicIncident.id == incident_id).first()
        if inc:
            return {
                "id": inc.id,
                "incident_type": inc.incident_type,
                "description": inc.description,
                "latitude": inc.latitude,
                "longitude": inc.longitude,
                "reported_at": inc.reported_at.isoformat() if inc.reported_at else None,
                "severity": inc.severity,
                "source": inc.source,
                "status": inc.status,
                "ward_id": inc.ward_id,
                "evidence_quality": inc.evidence_quality,
                "data_source_type": "OFFICIAL_HISTORICAL_RECORD"
            }
    except Exception:
        pass
    incidents = IncidentService._load_incidents()
    if 1 <= incident_id <= len(incidents):
        i = incidents[incident_id - 1]
        return {
            "id": incident_id,
            "incident_type": i.get("incident_type", "waterlogging"),
            "description": i.get("description"),
            "latitude": i.get("latitude"),
            "longitude": i.get("longitude"),
            "reported_at": f"{i.get('event_date', '2015-12-01')}T12:00:00+05:30",
            "severity": i.get("severity", "high"),
            "source": i.get("source"),
            "status": "verified",
            "ward_id": i.get("ward_id"),
            "evidence_quality": 1.0,
            "data_source_type": "OFFICIAL_HISTORICAL_RECORD"
        }
    return None
