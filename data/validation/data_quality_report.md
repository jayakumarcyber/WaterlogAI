# DATA QUALITY REPORT — CHENNAI ONLY

**Generated**: 2026-09-12T10:41:12.626133+00:00  
**Target Scope**: Chennai, Tamil Nadu  
**Validation Status**: STRICT NON-CHENNAI REJECTION ACTIVE  

| File | Field | Issue | Records Affected | Severity | Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `chennai_monthly_rainfall_1901_2021_raw.csv` | **HEADER** | Repeated CSV header line detected in raw text at line 123 | 1 | `MEDIUM` | Filtered out duplicate header row during ingestion |
| `chennai_monthly_rainfall_1901_2021_raw.csv` | **Year** | Found 121 duplicate annual records (the entire 1901-2021 series was pasted twice) | 121 | `HIGH` | Deduplicated on 'Year', preserving exactly 1 unique record per year (1901-2021) |
| `chennai-rainfall.csv` | **COLUMNS** | Verified columns exactly match required schema: ['WEATHER STATION', 'LOCATION', 'RAINFALL'] | 3 | `INFO` | Column schema validated successfully |
| `chennai-rainfall.csv` | **ROW_COUNT** | Raw row count verified: 119 station records | 119 | `INFO` | Ingested exactly 119 raw observation rows |
| `chennai-rainfall.csv` | **MISSING_VALUES** | 0 missing/null values detected across all columns (100% complete) | 0 | `INFO` | Verified zero missing values; retained actual data without interpolation |
| `chennai-rainfall.csv` | **DUPLICATE_ROWS** | 0 exact duplicate rows found across 119 records | 0 | `INFO` | Verified row uniqueness |
| `chennai-rainfall.csv` | **RAINFALL** | Rainfall values valid numeric range: 1.0 mm to 49.0 mm (0 negative values) | 119 | `INFO` | Verified all rainfall observations are positive and valid numeric depths |
| `chennai-rainfall.csv` | **WEATHER STATION** | Detected split station name token 'ANNA' with rainfall=22mm (corresponds to 'ANNA UNIVERSITY' split across lines) | 1 | `MEDIUM` | Flagged token and resolved into verified station 'ANNA UNIVERSITY' (22mm) |
| `chennai-rainfall.csv` | **WEATHER STATION** | Detected split station name token 'UNIVERSITY' with rainfall=22mm (corresponds to 'ANNA UNIVERSITY' split across lines) | 1 | `MEDIUM` | Flagged token and resolved into verified station 'ANNA UNIVERSITY' (22mm) |
| `chennai-rainfall.csv` | **GEOGRAPHIC_SCOPE** | Bulletin contained 107 stations from non-Chennai districts (Salem, Theni, Vellore, Thanjavur, Cuddalore, etc.) | 107 | `HIGH` | Rejected non-Chennai stations from Chennai tables; logged to validation/non_chennai_stations_rejected.csv |
| `rainfall_occurred_during_north-east_monsoon_by_districts_in_tamil_nadu_2017_18.csv` | **District** | State report contained 32 records for other 31 Tamil Nadu districts and State Total | 32 | `INFO` | Filtered strictly to District == 'Chennai'; non-Chennai rows excluded from Chennai tables |
| `PCA_CDB_3323_F_Census.xls` | **District_Name** | NOT CHENNAI DATA: Dataset belongs entirely to Theni District (Census 2011) | 1 | `CRITICAL` | Marked NOT CHENNAI DATA; strictly rejected from Chennai production tables |
| `PCA_CDB_3310_F_Census.xls` | **District_Name** | NOT CHENNAI DATA: Dataset belongs entirely to The Nilgiris District (Census 2011) | 1 | `CRITICAL` | Marked NOT CHENNAI DATA; strictly rejected from Chennai production tables |
| `chennai_daily_station_rainfall_1993_2023_raw.csv` | **DUPLICATES** | Found 1361 duplicate daily station readings | 1361 | `MEDIUM` | Deduplicated on (District, Station, Date, Rainfall) |
| `Clean15YearChennaiWeather.csv` | **FILE_PRESENCE** | Kaggle Croissant schema and metadata provided, but raw CSV file not yet placed in repository | 0 | `INFO` | Metadata registered with status 'DATA UNAVAILABLE (METADATA REGISTERED)' pending raw CSV upload |
