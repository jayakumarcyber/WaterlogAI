import os
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List

MODEL_DIR = os.path.abspath("ml/models")

EVIDENCE_CATEGORY_MAP = {
    'rainfall_last_1h': 'OBSERVED',
    'rainfall_last_6h': 'OBSERVED',
    'rainfall_last_24h': 'FORECAST',
    'rainfall_last_48h': 'FORECAST',
    'rainfall_last_72h': 'FORECAST',
    'incident_count_7d': 'HISTORICAL',
    'incident_count_30d': 'HISTORICAL',
    'incident_count_90d': 'HISTORICAL',
    'previous_waterlogging_count': 'HISTORICAL',
    'days_since_last_incident': 'HISTORICAL',
    'elevation_m': 'OBSERVED',
    'drainage_quality_score': 'DERIVED',
    'distance_to_drain_m': 'DERIVED',
    'distance_to_waterbody_m': 'DERIVED',
    'drainage_density_km_sqkm': 'DERIVED',
    'road_density_km_sqkm': 'DERIVED',
    'population_density_per_sqkm': 'DERIVED',
    'critical_facility_count': 'DERIVED',
    'historical_incident_density': 'DERIVED'
}

HUMAN_READABLE_FEATURE_NAMES = {
    'rainfall_last_24h': '24-Hour Accumulated Rainfall',
    'rainfall_last_48h': '48-Hour Accumulated Rainfall',
    'rainfall_last_72h': '72-Hour Accumulated Rainfall',
    'rainfall_last_1h': '1-Hour Rainfall Intensity',
    'rainfall_last_6h': '6-Hour Rainfall Intensity',
    'previous_waterlogging_count': 'Historical Waterlogging Events',
    'incident_count_30d': 'Recent 30-Day Incident Volume',
    'incident_count_90d': 'Recent 90-Day Incident Volume',
    'days_since_last_incident': 'Days Since Last Incident',
    'elevation_m': 'Terrain Elevation',
    'drainage_quality_score': 'Drainage Infrastructure Quality',
    'distance_to_drain_m': 'Distance to Primary Drain',
    'distance_to_waterbody_m': 'Distance to Waterbody',
    'drainage_density_km_sqkm': 'Drainage Network Density',
    'historical_incident_density': 'Incident Density Score',
    'population_density_per_sqkm': 'Population Exposure Density',
    'critical_facility_count': 'Nearby Critical Facilities'
}

def generate_deterministic_text_explanation(feature_name: str, shap_val: float, raw_val: float) -> str:
    """Generate deterministic human-readable text grounded strictly in actual SHAP sign."""
    display_name = HUMAN_READABLE_FEATURE_NAMES.get(feature_name, feature_name.replace('_', ' ').title())
    
    if shap_val > 0.0:
        if 'rainfall' in feature_name:
            return f"High accumulated rainfall ({raw_val} mm) is a key driver increasing predicted risk."
        elif 'waterlogging' in feature_name or 'incident' in feature_name:
            return f"Repeated historical incidents ({int(raw_val)}) increase the predicted risk."
        elif 'elevation' in feature_name:
            return f"Lower terrain elevation ({raw_val} m) contributes to higher risk."
        else:
            return f"{display_name} increases the predicted risk."
    elif shap_val < 0.0:
        if 'elevation' in feature_name:
            return f"Higher terrain elevation ({raw_val} m) mitigates waterlogging risk."
        elif 'drain' in feature_name:
            return f"Proximity or quality of drainage network helps lower predicted risk."
        elif 'days_since' in feature_name:
            return f"Longer interval since last incident ({int(raw_val)} days) decreases risk."
        else:
            return f"{display_name} decreases the predicted risk."
    else:
        return f"{display_name} has neutral effect on predicted risk."

class ShapExplainerEngine:
    def __init__(self, horizon_hours: int = 24):
        self.horizon_hours = horizon_hours
        self.artifact_path = os.path.join(MODEL_DIR, f"waterlogging_risk_{horizon_hours}h_v1.joblib")
        self.artifact = None
        self.model = None
        self.feature_names = []
        self.explainer = None
        self._initialize()

    def _initialize(self):
        if not os.path.exists(self.artifact_path):
            from ml.training.train_all_and_compare import run_model_comparison_pipeline
            run_model_comparison_pipeline()

        if os.path.exists(self.artifact_path):
            self.artifact = joblib.load(self.artifact_path)
            self.model = self.artifact["model"]
            self.feature_names = self.artifact["feature_names"]
            self.explainer = shap.TreeExplainer(self.model)
        else:
            raise FileNotFoundError(f"Model artifact missing: {self.artifact_path}")

    def explain_prediction(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Compute local SHAP feature contributions and deterministic evidence breakdown for a single prediction."""
        input_data = []
        for col in self.feature_names:
            val = feature_dict.get(col, 0.0)
            input_data.append(float(val) if val is not None else 0.0)

        df_input = pd.DataFrame([input_data], columns=self.feature_names)
        raw_prob = float(self.model.predict_proba(df_input)[0, 1])
        calibrated_prob = round(float(np.clip(raw_prob, 0.001, 0.999)), 4)
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(df_input)
        if isinstance(shap_values, list):
            s_vals = shap_values[1][0]
        elif len(shap_values.shape) == 2:
            s_vals = shap_values[0]
        else:
            s_vals = shap_values

        contributions = []
        for i, col in enumerate(self.feature_names):
            val_val = float(df_input.iloc[0][col])
            s_val = float(s_vals[i])
            direction = "increases risk" if s_val > 0.0 else ("decreases risk" if s_val < 0.0 else "neutral")
            
            contributions.append({
                "feature_name": col,
                "display_name": HUMAN_READABLE_FEATURE_NAMES.get(col, col),
                "raw_value": val_val,
                "shap_value": round(s_val, 4),
                "effect_direction": direction,
                "category": EVIDENCE_CATEGORY_MAP.get(col, "DERIVED"),
                "text_summary": generate_deterministic_text_explanation(col, s_val, val_val)
            })

        # Sort contributions by absolute SHAP magnitude
        contributions = sorted(contributions, key=lambda x: abs(x["shap_value"]), reverse=True)
        top_factors = contributions[:5]

        # Check for data quality warnings
        missing_data_warnings = []
        if feature_dict.get("elevation_m") is None:
            missing_data_warnings.append("⚠️ Terrain elevation unavailable.")
        if feature_dict.get("drainage_quality_score") is None:
            missing_data_warnings.append("⚠️ Drainage blockage status requires field verification.")

        return {
            "prediction_summary": {
                "ward_id": feature_dict.get("ward_id", 1),
                "horizon_hours": self.horizon_hours,
                "predicted_probability": calibrated_prob,
                "risk_level": "CRITICAL" if calibrated_prob >= 0.75 else ("HIGH" if calibrated_prob >= 0.50 else ("MEDIUM" if calibrated_prob >= 0.25 else "LOW")),
                "model_version": self.artifact.get("model_version", f"XGBoost_{self.horizon_hours}h_v1_DEMO"),
                "data_provenance": "DEMO MODEL — TRAINED ON SYNTHETIC DATA"
            },
            "top_contributing_factors": top_factors,
            "all_feature_contributions": contributions,
            "data_quality_warnings": missing_data_warnings if missing_data_warnings else ["Data quality verified."],
            "prediction_limitations": [
                "Predictions indicate probabilistic risk, not confirmed flooding.",
                "Drainage blockage status requires field verification.",
                "Synthetic demo benchmark data used for prototype evaluation."
            ]
        }

    def get_global_feature_importance(self, features_csv: str = "data/processed/features.csv") -> List[Dict[str, Any]]:
        """Compute global SHAP feature importance across the processed dataset."""
        df = pd.read_csv(features_csv)
        df_input = df[self.feature_names]
        shap_values = self.explainer.shap_values(df_input)
        
        if isinstance(shap_values, list):
            s_vals = shap_values[1]
        else:
            s_vals = shap_values

        mean_abs_shap = np.mean(np.abs(s_vals), axis=0)
        
        result = []
        for i, col in enumerate(self.feature_names):
            result.append({
                "feature_name": col,
                "display_name": HUMAN_READABLE_FEATURE_NAMES.get(col, col),
                "global_importance_score": round(float(mean_abs_shap[i]), 4),
                "category": EVIDENCE_CATEGORY_MAP.get(col, "DERIVED")
            })

        return sorted(result, key=lambda x: x["global_importance_score"], reverse=True)
