import os
import json
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from ml.training.evaluate import compute_metrics, calibrate_probabilities
from ml.training.train_baseline import FEATURE_COLS

MODEL_DIR = os.path.abspath("ml/models")

def train_xgboost_models(data_path: str = "ml/data/ml_features_with_targets.csv") -> dict:
    print("[INFO] Training XGBoost multi-horizon models (24h, 48h, 72h)...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    total = len(df)
    train_end = int(total * 0.60)
    val_end = int(total * 0.80)
    
    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]
    
    X_train = train_df[FEATURE_COLS]
    X_val = val_df[FEATURE_COLS]
    X_test = test_df[FEATURE_COLS]
    
    results = {}
    
    for h in [12, 24, 48, 72]:
        target_col = f'target_waterlogging_{h}h'
        y_train = train_df[target_col].values
        y_val = val_df[target_col].values
        y_test = test_df[target_col].values
        
        # Calculate scale_pos_weight
        num_pos = sum(y_train)
        num_neg = len(y_train) - num_pos
        scale_pos = round(float(num_neg / max(1, num_pos)), 2)
        
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.05,
            scale_pos_weight=scale_pos,
            random_state=42,
            eval_metric="logloss"
        )
        
        model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        
        y_prob = calibrate_probabilities(model.predict_proba(X_test)[:, 1])
        y_pred = (y_prob >= 0.5).astype(int)
        
        metrics = compute_metrics(y_test, y_pred, y_prob)
        metrics["scale_pos_weight"] = scale_pos
        results[f"horizon_{h}h"] = metrics
        
        # Save model artifact
        artifact_path = os.path.join(MODEL_DIR, f"waterlogging_risk_{h}h_v1.joblib")
        artifact_data = {
            "model": model,
            "feature_names": FEATURE_COLS,
            "horizon_hours": h,
            "model_version": f"XGBoost_{h}h_v1_DEMO",
            "data_provenance": "DEMO MODEL — TRAINED ON SYNTHETIC DATA",
            "training_range": [train_df['timestamp'].min().isoformat(), train_df['timestamp'].max().isoformat()],
            "test_range": [test_df['timestamp'].min().isoformat(), test_df['timestamp'].max().isoformat()],
            "metrics": metrics
        }
        joblib.dump(artifact_data, artifact_path)
        print(f"  - Saved model artifact: {artifact_path}")
        
    return results

if __name__ == "__main__":
    res = train_xgboost_models()
    print("[XGBOOST EVALUATION METRICS]:", json.dumps(res, indent=2))
