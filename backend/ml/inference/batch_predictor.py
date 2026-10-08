import os
import sys
import pandas as pd
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend"))

from ml.inference.predictor import RiskPredictor

def run_batch_prediction(features_csv: str = "data/processed/features.csv") -> list:
    print("================ RUNNING BATCH ML RISK PREDICTION PIPELINE ================")
    if not os.path.exists(features_csv):
        from pipeline.generate_features import run_feature_generation_pipeline
        run_feature_generation_pipeline()

    df = pd.read_csv(features_csv)
    
    # Instantiate predictors for 24h, 48h, 72h
    predictors = {
        24: RiskPredictor(horizon_hours=24),
        48: RiskPredictor(horizon_hours=48),
        72: RiskPredictor(horizon_hours=72),
    }

    # Extract latest feature row per ward
    latest_per_ward = df.groupby('ward_id').last().reset_index()

    predictions_batch = []

    for idx, row in latest_per_ward.iterrows():
        feat_dict = row.to_dict()
        w_id = int(row['ward_id'])

        for h in [24, 48, 72]:
            pred_res = predictors[h].predict_risk(feat_dict)
            predictions_batch.append({
                "ward_id": w_id,
                "prediction_timestamp": pred_res["prediction_timestamp"],
                "horizon_hours": h,
                "predicted_probability": pred_res["predicted_probability"],
                "risk_level": pred_res["risk_level"],
                "model_version": pred_res["model_version"],
                "data_provenance": pred_res["data_provenance"]
            })

    print(f"[SUCCESS] Batch predictions compiled: {len(predictions_batch)} multi-horizon predictions generated.")
    for p in predictions_batch[:6]:
        print(f"  - Ward #{p['ward_id']} | Horizon: {p['horizon_hours']}h | Risk: {p['risk_level']} (Prob: {p['predicted_probability']})")

    return predictions_batch

if __name__ == "__main__":
    run_batch_prediction()
