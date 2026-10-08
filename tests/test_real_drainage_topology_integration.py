import os
import json
import sqlite3
import pytest
from shapely.geometry import shape

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

@pytest.fixture(scope="module")
def verified_drainage_data():
    path = os.path.join(ROOT_DIR, "data", "processed", "network", "chennai_ward_drainage_verified.json")
    assert os.path.exists(path), f"File {path} does not exist"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="module")
def official_wards():
    path = os.path.join(ROOT_DIR, "data", "geo", "chennai_wards_official.geojson")
    assert os.path.exists(path), f"File {path} does not exist"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="module")
def swd_geojson():
    path = os.path.join(ROOT_DIR, "data", "processed", "network", "chennai_stormwater_drains.geojson")
    assert os.path.exists(path), f"File {path} does not exist"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="module")
def waterways_geojson():
    path = os.path.join(ROOT_DIR, "data", "processed", "network", "chennai_waterways.geojson")
    assert os.path.exists(path), f"File {path} does not exist"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="module")
def outfalls_geojson():
    path = os.path.join(ROOT_DIR, "data", "processed", "network", "chennai_outfalls.geojson")
    assert os.path.exists(path), f"File {path} does not exist"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="module")
def db_conn():
    db_path = os.path.join(ROOT_DIR, "backend", "civicpulse_fallback.db")
    assert os.path.exists(db_path), f"Database {db_path} does not exist"
    conn = sqlite3.connect(db_path)
    yield conn
    conn.close()


def test_official_200_wards_intact(official_wards):
    """Ensure exactly 200 GCC wards exist and maintain their spatial integrity."""
    features = official_wards.get("features", [])
    assert len(features) == 200, f"Expected 200 wards, got {len(features)}"
    ward_numbers = {f["properties"]["ward_number"] for f in features}
    assert ward_numbers == set(range(1, 201)), "Ward numbers must be exactly 1 to 200"


def test_census_population_preserved(official_wards):
    """Ensure wards 1-155 have verified population and wards 156-200 are strictly DATA_UNAVAILABLE."""
    features = official_wards.get("features", [])
    for f in features:
        props = f["properties"]
        wn = props["ward_number"]
        if wn <= 155:
            assert props.get("population") is not None and props.get("population") > 0
            assert props.get("population_status") == "VERIFIED_CENSUS_2011"
        else:
            assert props.get("population") is None
            assert props.get("population_status") == "POPULATION_DATA_UNAVAILABLE"


def test_dem_elevation_preserved(official_wards):
    """Ensure DEM elevation and slope indicators remain mapped for all 200 wards."""
    features = official_wards.get("features", [])
    for f in features:
        props = f["properties"]
        assert props.get("elevation_m") is not None
        assert props.get("terrain_status") == "VERIFIED"
        assert props.get("slope_deg") is not None


def test_historical_incidents_preserved(official_wards):
    """Ensure verified historical incident counts remain attached to official wards."""
    features = official_wards.get("features", [])
    total_incidents = sum(f["properties"].get("historical_incident_count", 0) for f in features)
    assert total_incidents == 1323, f"Expected 1323 ward-mapped incidents, got {total_incidents}"


def test_swd_feature_count_and_geometry_validity(swd_geojson):
    """Validate GCC SWD 2023 lines count and geometry validity."""
    features = swd_geojson.get("features", [])
    assert len(features) == 10255, f"Expected 10,255 GCC SWD lines, got {len(features)}"
    for feat in features[:100]:  # check sample
        geom = shape(feat["geometry"])
        assert geom.is_valid, f"Invalid geometry in SWD line {feat['id']}"
        assert geom.geom_type in ["LineString", "MultiLineString"]


def test_waterways_feature_count(waterways_geojson):
    """Validate major waterways and canals count and geometry."""
    features = waterways_geojson.get("features", [])
    assert len(features) == 934, f"Expected 934 waterway lines, got {len(features)}"


def test_outfalls_feature_count(outfalls_geojson):
    """Validate CMWSSB terminal outfalls count and point geometry."""
    features = outfalls_geojson.get("features", [])
    assert len(features) == 5466, f"Expected 5466 outfalls, got {len(features)}"
    for feat in features[:100]:
        geom = shape(feat["geometry"])
        assert geom.is_valid
        assert geom.geom_type == "Point"


def test_non_fabrication_rules(verified_drainage_data, official_wards):
    """Verify strictly NO fake drainage capacity, flow rate, or blockage score is generated."""
    wards = verified_drainage_data.get("wards", [])
    assert len(wards) == 200
    for w in wards:
        assert w["drainage_capacity"] == "Data Unavailable"
        assert w["blockage_percentage"] == "Data Unavailable"
        assert w["maintenance_condition"] == "Data Unavailable"
        assert w["hydraulic_flow_rate"] == "Data Unavailable"

    for f in official_wards.get("features", []):
        assert f["properties"].get("drainage_capacity") == "Data Unavailable"
        assert f["properties"].get("maintenance_condition") == "Data Unavailable"


def test_sqlite_database_tables(db_conn):
    """Verify SQLite database contains all required drainage and topology tables with correct row counts."""
    cur = db_conn.cursor()
    cur.execute("SELECT count(*) FROM stormwater_drains")
    assert cur.fetchone()[0] == 10255
    cur.execute("SELECT count(*) FROM drainage_nodes")
    assert cur.fetchone()[0] == 3155
    cur.execute("SELECT count(*) FROM waterways")
    assert cur.fetchone()[0] == 934
    cur.execute("SELECT count(*) FROM outfalls")
    assert cur.fetchone()[0] == 5466
    cur.execute("SELECT count(*) FROM ward_drainage_metrics")
    assert cur.fetchone()[0] == 200


def test_specific_wards_verification(verified_drainage_data):
    """Test required specific wards: Ward 1, Ward 114, Ward 177, Ward 198."""
    wards_map = {w["ward_id"]: w for w in verified_drainage_data["wards"]}

    # Ward 1 (Thiruvottiyur)
    w1 = wards_map[1]
    assert w1["drain_feature_count"] == 69
    assert w1["total_drain_length_km"] == 11.86
    assert w1["drainage_density_km_sqkm"] > 5.0
    assert w1["road_drainage_intersection_count"] == 4
    assert w1["outfall_count"] == 74
    assert w1["connected_drain_nodes_count"] == 20

    # Ward 114 (Teynampet)
    w114 = wards_map[114]
    assert w114["drain_feature_count"] == 27
    assert w114["total_drain_length_km"] == 6.578
    assert w114["waterway_count"] == 1
    assert w114["waterbody_count"] == 9
    assert w114["outfall_count"] == 1

    # Ward 177 (Adyar)
    w177 = wards_map[177]
    assert w177["drain_feature_count"] == 111
    assert w177["total_drain_length_km"] == 25.613
    assert w177["drainage_density_km_sqkm"] > 8.0
    assert w177["road_feature_count"] == 52
    assert w177["road_drainage_intersection_count"] == 4
    assert w177["outfall_count"] == 131

    # Ward 198 (Sholinganallur)
    w198 = wards_map[198]
    assert w198["drain_feature_count"] == 34
    assert w198["total_drain_length_km"] == 7.402
    assert w198["road_drainage_intersection_count"] == 2
    assert w198["waterbody_count"] == 18
    assert w198["outfall_count"] == 0
    assert w198["distance_to_nearest_outfall_m"] > 4000


def test_no_mumbai_infrastructure_leakage(verified_drainage_data, swd_geojson):
    """Ensure no Mumbai/test-city infrastructure leaks into Chennai official layers."""
    for w in verified_drainage_data["wards"]:
        assert "mumbai" not in w["ward_name"].lower()
        assert "dadar" not in w["ward_name"].lower()

    for f in swd_geojson["features"][:200]:
        assert "mumbai" not in f["properties"].get("location", "").lower()
        assert "dadar" not in f["properties"].get("street_name", "").lower()
