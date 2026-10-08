import os
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from ml.training.evaluate import compute_metrics, calibrate_probabilities

FEATURE_COLS = [
    'rainfall_last_1h', 'rainfall_last_6h', 'rainfall_last_24h', 'rainfall_last_48h', 'rainfall_last_72h',
    'incident_count_7d', 'incident_count_30d', 'incident_count_90d', 'previous_waterlogging_count',
    'days_since_last_incident', 'elevation_m', 'drainage_quality_score', 'distance_to_drain_m',
    'distance_to_waterbody_m', 'drainage_density_km_sqkm', 'road_density_km_sqkm',
    'population_density_per_sqkm', 'critical_facility_count', 'historical_incident_density'
]

def train_baseline_models(data_path: str = "ml/data/ml_features_with_targets.csv") -> dict:
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    total = len(df)
    train_end = int(total * 0.60)
    val_end = int(total * 0.80)
    
    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]
    
    scaler = StandardScaler()
    X_train = scaler.fit_transform(train_df[FEATURE_COLS])
    X_test = scaler.transform(test_df[FEATURE_COLS])
    
    results = {}
    
    for h in [24, 48, 72]:
        target_col = f'target_waterlogging_{h}h'
        y_train = train_df[target_col].values
        y_test = test_df[target_col].values
        
        clf = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
        clf.fit(X_train, y_train)
        
        y_prob = calibrate_probabilities(clf.predict_proba(X_test)[:, 1])
        y_pred = (y_prob >= 0.5).astype(int)
        
        metrics = compute_metrics(y_test, y_pred, y_prob)
        results[f"horizon_{h}h"] = metrics
        
    return results

if __name__ == "__main__":
    res = train_baseline_models()
    print("[BASELINE LOGISTIC REGRESSION RESULTS]:", res)
