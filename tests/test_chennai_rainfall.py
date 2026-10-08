import sys
import os
import pytest
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chennai_rainfall_raw_validation():
    """Validate chennai-rainfall.csv properties."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_csv = os.path.join(base_dir, "data", "raw", "rainfall", "chennai-rainfall.csv")
    assert os.path.exists(raw_csv), "chennai-rainfall.csv must exist in data/raw/rainfall/"
    
    df = pd.read_csv(raw_csv)
    # 1. Columns
    assert list(df.columns) == ['WEATHER STATION', 'LOCATION', 'RAINFALL'], "Columns must match ['WEATHER STATION', 'LOCATION', 'RAINFALL']"
    
    # 2. Row count
    assert len(df) == 119, f"Expected 119 rows, got {len(df)}"
    
    # 3. Missing values
    assert df.isnull().sum().sum() == 0, "No missing or NaN values allowed"
    
    # 4. Duplicate rows
    assert df.duplicated().sum() == 0, "No exact duplicate rows allowed"
    
    # 5. Rainfall values
    assert (df['RAINFALL'] >= 0).all(), "No negative rainfall allowed"
    assert df['RAINFALL'].min() >= 1, "Min rainfall must be valid"
    assert df['RAINFALL'].max() <= 100, "Max rainfall must be within reasonable observational bound"

def test_chennai_rainfall_processed_stations():
    """Verify Chennai station segregation and non-Chennai rejection."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    processed_stations_csv = os.path.join(base_dir, "data", "processed", "rainfall", "chennai_station_rainfall_processed.csv")
    rejected_csv = os.path.join(base_dir, "data", "validation", "non_chennai_stations_rejected.csv")
    
    assert os.path.exists(processed_stations_csv), "Processed Chennai stations must exist"
    assert os.path.exists(rejected_csv), "Non-Chennai rejected stations must exist"
    
    df_chennai = pd.read_csv(processed_stations_csv)
    df_rejected = pd.read_csv(rejected_csv)
    
    assert len(df_chennai) == 11, f"Expected 11 verified Chennai/CMA stations, got {len(df_chennai)}"
    assert len(df_rejected) == 107, f"Expected 107 non-Chennai stations rejected, got {len(df_rejected)}"
    
    # Verify Chennai stations list
    st_names = set(df_chennai['station_name'].tolist())
    assert "CHENNAI AP" in st_names
    assert "TAMBARAM" in st_names
    assert "CHEMBARABAKKAM" in st_names
    assert "ANNA UNIVERSITY" in st_names

def test_chennai_historical_rainfall_api_endpoint():
    """Verify GET /api/v1/rainfall/historical/district/Chennai returns verified data."""
    response = client.get("/api/v1/rainfall/historical/district/Chennai")
    assert response.status_code == 200
    data = response.json()
    
    assert data["district_or_subdivision"] == "Chennai District"
    assert data["total_records"] > 0
    assert data["data_source_label"] == "PUBLIC / SOURCE UNVERIFIED"
    assert "LIVE" not in data["data_source_label"].upper()
    assert len(data["historical_records"]) > 0

def test_non_chennai_district_rejected():
    """Ensure Namakkal or other districts return 0 records and unsupported status."""
    response = client.get("/api/v1/rainfall/historical/district/Namakkal")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 0
    assert "UNSUPPORTED" in data["district_or_subdivision"]
