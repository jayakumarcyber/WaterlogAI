from sqlalchemy import Column, Integer, String, Float, Text, Index
from app.db.base import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False, index=True)  # district, taluk, corporation, zone, municipality, town_panchayat, block, ward, village, locality
    parent_id = Column(String, nullable=True, index=True)
    district_id = Column(String, nullable=False, index=True)
    district_name = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geometry = Column(Text, nullable=True)  # GeoJSON geometry string
    bounds = Column(Text, nullable=True)    # JSON string [[min_lat, min_lon], [max_lat, max_lon]]
    area_sq_km = Column(Float, nullable=True)
    population = Column(Integer, nullable=True)
    source = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    data_status = Column(String, nullable=False, default="REAL")
    last_updated = Column(String, nullable=True, default="2024-Q1")

    __table_args__ = (
        Index("idx_location_district_type", "district_id", "type"),
        Index("idx_location_parent", "parent_id"),
    )
