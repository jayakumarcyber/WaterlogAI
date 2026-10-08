import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, List

_module_models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_DIR = _module_models_dir if os.path.exists(_module_models_dir) else os.path.abspath("ml/models")

def map_probability_to_risk_level(prob: float) -> str:
    """Map predicted probability to risk categories using configurable validation thresholds."""
    if prob >= 0.75:
        return "CRITICAL"
    elif prob >= 0.50:
        return "HIGH"
    elif prob >= 0.25:
        return "MEDIUM"
    else:
        return "LOW"

class RiskPredictor:
    def __init__(self, horizon_hours: int = 24):
        self.horizon_hours = horizon_hours
        self.artifact_path = os.path.join(MODEL_DIR, f"waterlogging_risk_{horizon_hours}h_v1.joblib")
        self.artifact = None
        self.model = None
        self.feature_names = []
        self._load_model()

    def _load_model(self):
        if not os.path.exists(self.artifact_path):
            from ml.training.train_all_and_compare import run_model_comparison_pipeline
            run_model_comparison_pipeline()

        if os.path.exists(self.artifact_path):
            self.artifact = joblib.load(self.artifact_path)
            self.model = self.artifact["model"]
            self.feature_names = self.artifact["feature_names"]
        else:
            raise FileNotFoundError(f"Model artifact missing: {self.artifact_path}")

    def predict_risk(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Predict waterlogging probability and risk level for a single observation feature dict."""
        input_data = []
        for col in self.feature_names:
            val = feature_dict.get(col, 0.0)
            input_data.append(float(val) if val is not None else 0.0)

        df_input = pd.DataFrame([input_data], columns=self.feature_names)
        raw_prob = float(self.model.predict_proba(df_input)[0, 1])
        calibrated_prob = round(float(np.clip(raw_prob, 0.001, 0.999)), 4)
        risk_level = map_probability_to_risk_level(calibrated_prob)

        return {
            "ward_id": feature_dict.get("ward_id", 1),
            "prediction_timestamp": feature_dict.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "horizon_hours": self.horizon_hours,
            "predicted_probability": calibrated_prob,
            "risk_level": risk_level,
            "model_version": self.artifact.get("model_version", f"XGBoost_{self.horizon_hours}h_v1_DEMO"),
            "data_provenance": "DEMO MODEL — TRAINED ON SYNTHETIC DATA"
        }
