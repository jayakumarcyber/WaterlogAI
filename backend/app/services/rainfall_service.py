import os
from typing import List, Optional, Dict, Any
import pandas as pd
from sqlalchemy.orm import Session
from app.models.rainfall import RainfallRecord

# Root and Data Directory resolution
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATA_RAW_DIR = os.path.join(ROOT_DIR, "data", "raw", "rainfall")
DATA_PROCESSED_DIR = os.path.join(ROOT_DIR, "data", "processed", "rainfall")

CHENNAI_STATIONS_CSV = "chennai_station_rainfall_processed.csv"
CHENNAI_DAILY_STATIONS_CSV = "chennai_daily_station_rainfall_1993_2023_processed.csv"
CHENNAI_MONTHLY_CSV = "chennai_monthly_rainfall_1901_2021_processed.csv"
CHENNAI_NEM_CSV = "chennai_nem_2017_rainfall_processed.csv"

def load_chennai_historical_rainfall_records() -> List[Dict[str, Any]]:
    """Load and normalize actual uploaded Chennai rainfall records without inventing missing values."""
    records = []

    # 1. Daily Rain Gauge Station Time Series (1993-2023)
    p_daily = os.path.join(DATA_PROCESSED_DIR, CHENNAI_DAILY_STATIONS_CSV)
    if os.path.exists(p_daily):
        df_daily = pd.read_csv(p_daily)
        # Include high-precipitation events & representative station observations
        top_events = df_daily.sort_values("rainfall_mm", ascending=False).head(50)
        for _, row in top_events.iterrows():
            st_name = str(row.get("station_clean", "")).strip()
            date_str = str(row.get("standard_date", "")).strip()
            rf = row.get("rainfall_mm")
            yr = str(row.get("year", ""))
            if pd.notna(rf):
                records.append({
                    "source_file": "chennai_daily_station_rainfall_1993_2023_raw.csv",
                    "year": yr,
                    "period_or_season": f"{st_name} ({date_str})",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": float(rf),
                    "normal_rainfall_mm": None,
                    "percentage_deviation": None,
                    "rainfall_type": "DAILY_STATION_GAUGE_OBSERVATION",
                    "data_source_type": "Tamil Nadu Open Data Portal (OGD Resource 3086f865-a04c-431e-815d-105ae658871f)",
                    "data_status": "OFFICIAL"
                })

    # 1. Station-Level Observed Event Rainfall (from uploaded chennai-rainfall.csv)
    p_stations = os.path.join(DATA_PROCESSED_DIR, CHENNAI_STATIONS_CSV)
    if os.path.exists(p_stations):
        df_stations = pd.read_csv(p_stations)
        for _, row in df_stations.iterrows():
            st_name = str(row.get("station_name", "")).strip()
            loc = str(row.get("location", "")).strip()
            rf = row.get("rainfall_mm")
            if pd.notna(rf):
                records.append({
                    "source_file": "chennai-rainfall.csv",
                    "year": "Historical Event",
                    "period_or_season": f"Station: {st_name} ({loc})",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": float(rf),
                    "normal_rainfall_mm": None,
                    "percentage_deviation": None,
                    "rainfall_type": "STATION_OBSERVED_EVENT",
                    "data_source_type": "PUBLIC / SOURCE UNVERIFIED",
                    "data_status": "PUBLIC / SOURCE UNVERIFIED"
                })

    # 2. Official North-East Monsoon 2017 District Rainfall
    p_nem = os.path.join(DATA_PROCESSED_DIR, CHENNAI_NEM_CSV)
    if os.path.exists(p_nem):
        df_nem = pd.read_csv(p_nem)
        for _, row in df_nem.iterrows():
            # October
            if pd.notna(row.get("october_actual_mm")):
                records.append({
                    "source_file": "rainfall_occurred_during_north-east_monsoon_by_districts_in_tamil_nadu_2017_18.csv",
                    "year": "2017",
                    "period_or_season": "October'17 (NEM)",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": float(row["october_actual_mm"]),
                    "normal_rainfall_mm": float(row["october_normal_mm"]) if pd.notna(row.get("october_normal_mm")) else None,
                    "percentage_deviation": float(row["october_departure_pct"]) if pd.notna(row.get("october_departure_pct")) else None,
                    "rainfall_type": "MONTHLY_DISTRICT_NE_MONSOON",
                    "data_source_type": "Official Government Record (Dept of Economics & Statistics, TN)",
                    "data_status": "OFFICIAL"
                })
            # November
            if pd.notna(row.get("november_actual_mm")):
                records.append({
                    "source_file": "rainfall_occurred_during_north-east_monsoon_by_districts_in_tamil_nadu_2017_18.csv",
                    "year": "2017",
                    "period_or_season": "November'17 (NEM)",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": float(row["november_actual_mm"]),
                    "normal_rainfall_mm": float(row["november_normal_mm"]) if pd.notna(row.get("november_normal_mm")) else None,
                    "percentage_deviation": float(row["november_departure_pct"]) if pd.notna(row.get("november_departure_pct")) else None,
                    "rainfall_type": "MONTHLY_DISTRICT_NE_MONSOON",
                    "data_source_type": "Official Government Record (Dept of Economics & Statistics, TN)",
                    "data_status": "OFFICIAL"
                })
            # December
            if pd.notna(row.get("december_actual_mm")):
                records.append({
                    "source_file": "rainfall_occurred_during_north-east_monsoon_by_districts_in_tamil_nadu_2017_18.csv",
                    "year": "2017",
                    "period_or_season": "December'17 (NEM)",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": float(row["december_actual_mm"]),
                    "normal_rainfall_mm": float(row["december_normal_mm"]) if pd.notna(row.get("december_normal_mm")) else None,
                    "percentage_deviation": float(row["december_departure_pct"]) if pd.notna(row.get("december_departure_pct")) else None,
                    "rainfall_type": "MONTHLY_DISTRICT_NE_MONSOON",
                    "data_source_type": "Official Government Record (Dept of Economics & Statistics, TN)",
                    "data_status": "OFFICIAL"
                })
            # Total NEM 2017
            if pd.notna(row.get("total_nem_actual_mm")):
                records.append({
                    "source_file": "rainfall_occurred_during_north-east_monsoon_by_districts_in_tamil_nadu_2017_18.csv",
                    "year": "2017",
                    "period_or_season": "Total North-East Monsoon 2017",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": float(row["total_nem_actual_mm"]),
                    "normal_rainfall_mm": float(row["total_nem_normal_mm"]) if pd.notna(row.get("total_nem_normal_mm")) else None,
                    "percentage_deviation": float(row["total_nem_departure_pct"]) if pd.notna(row.get("total_nem_departure_pct")) else None,
                    "rainfall_type": "SEASONAL_DISTRICT_TOTAL",
                    "data_source_type": "Official Government Record (Dept of Economics & Statistics, TN)",
                    "data_status": "OFFICIAL"
                })

    # 3. 121-Year Historical Monthly & Annual Rainfall (1901-2021)
    p_monthly = os.path.join(DATA_PROCESSED_DIR, CHENNAI_MONTHLY_CSV)
    if os.path.exists(p_monthly):
        df_monthly = pd.read_csv(p_monthly)
        # Select representative historical years including benchmark flood years (e.g. 2015, 2021, 2020, 2016, 2005)
        for _, row in df_monthly.sort_values("Year", ascending=False).iterrows():
            yr = int(row["Year"])
            tot = row["Total"]
            if pd.notna(tot):
                records.append({
                    "source_file": "chennai_monthly_rainfall_1901_2021_raw.csv",
                    "year": str(yr),
                    "period_or_season": f"Annual Total ({yr})",
                    "state": "Tamil Nadu",
                    "district_or_subdivision": "Chennai District",
                    "actual_rainfall_mm": round(float(tot), 2),
                    "normal_rainfall_mm": None,
                    "percentage_deviation": None,
                    "rainfall_type": "ANNUAL_TOTAL_TIME_SERIES",
                    "data_source_type": "Historical Public Dataset (IMD)",
                    "data_status": "HISTORICAL"
                })

    return records

def get_rainfall_records(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    ward_id: Optional[int] = None,
    is_forecast: Optional[bool] = None,
    forecast_hours: Optional[int] = None
) -> List[RainfallRecord]:
    query = db.query(RainfallRecord)
    if ward_id is not None:
        query = query.filter(RainfallRecord.ward_id == ward_id)
    if is_forecast is not None:
        query = query.filter(RainfallRecord.is_forecast == is_forecast)
    if forecast_hours is not None:
        query = query.filter(RainfallRecord.forecast_hours == forecast_hours)
    return query.order_by(RainfallRecord.recorded_at.desc()).offset(skip).limit(limit).all()

def get_historical_rainfall_by_district(
    db: Session,
    district_name: str
) -> Dict[str, Any]:
    """Retrieve cleaned historical rainfall strictly for Chennai District."""
    # Scope check: Only allow Chennai
    norm = district_name.strip().lower()
    if norm not in ["chennai", "chennai district", "all"]:
        # Do NOT return data for other districts like Namakkal
        return {
            "district_or_subdivision": f"{district_name} (UNSUPPORTED)",
            "total_records": 0,
            "available_years": [],
            "sources_used": [],
            "min_rainfall_mm": 0.0,
            "max_rainfall_mm": 0.0,
            "avg_rainfall_mm": 0.0,
            "data_source_label": "NOT CHENNAI DATA — Project is restricted strictly to Chennai",
            "historical_records": []
        }

    all_records = load_chennai_historical_rainfall_records()

    if not all_records:
        return {
            "district_or_subdivision": "Chennai District",
            "total_records": 0,
            "available_years": [],
            "sources_used": [],
            "min_rainfall_mm": 0.0,
            "max_rainfall_mm": 0.0,
            "avg_rainfall_mm": 0.0,
            "data_source_label": "PUBLIC / SOURCE UNVERIFIED",
            "historical_records": []
        }

    rain_vals = [r["actual_rainfall_mm"] for r in all_records]
    years = sorted(list(set(r["year"] for r in all_records)))
    sources = sorted(list(set(r["source_file"] for r in all_records)))

    return {
        "district_or_subdivision": "Chennai District",
        "total_records": len(all_records),
        "available_years": years,
        "sources_used": sources,
        "min_rainfall_mm": round(min(rain_vals), 2),
        "max_rainfall_mm": round(max(rain_vals), 2),
        "avg_rainfall_mm": round(sum(rain_vals) / len(rain_vals), 2),
        "data_source_label": "PUBLIC / SOURCE UNVERIFIED",
        "historical_records": all_records[:35]  # Top records including stations and seasonal totals
    }

def get_historical_rainfall_summary(db: Session) -> Dict[str, Any]:
    """Summary statistics for Chennai historical datasets."""
    all_records = load_chennai_historical_rainfall_records()
    sources = sorted(list(set(r["source_file"] for r in all_records)))
    years = sorted(list(set(r["year"] for r in all_records)))

    return {
        "total_datasets": len(sources),
        "total_records": len(all_records),
        "data_source_label": "PUBLIC / SOURCE UNVERIFIED",
        "districts_covered": ["Chennai District"],
        "years_covered": years,
        "source_files": sources,
    }
