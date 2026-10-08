"""
Bootstrap script: Create citizen_complaints table in the SQLite fallback database.
Run this from D:\CivicPulse-Monsoon\backend with:
  venv\Scripts\python create_complaints_table.py
"""

import sys
import os

# Ensure the backend is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, inspect
from app.db.base_class import Base
from app.models.complaint import CitizenComplaint

# SQLite fallback database path
SQLITE_DB = os.path.abspath(os.path.join(os.path.dirname(__file__), "civicpulse_fallback.db"))
DB_URL = f"sqlite:///{SQLITE_DB}"

print(f"[BOOTSTRAP] Connecting to SQLite: {SQLITE_DB}")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False}, echo=True)

inspector = inspect(engine)
existing_tables = inspector.get_table_names()

if "citizen_complaints" in existing_tables:
    print("[BOOTSTRAP] ✓ Table 'citizen_complaints' already exists. No action needed.")
else:
    print("[BOOTSTRAP] Creating 'citizen_complaints' table...")
    CitizenComplaint.__table__.create(engine)
    print("[BOOTSTRAP] ✓ Table 'citizen_complaints' created successfully.")

print("[BOOTSTRAP] Done.")
