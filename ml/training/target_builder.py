import os
import pandas as pd
import numpy as np
from datetime import datetime, timezone, timedelta

def build_multi_horizon_targets(
    features_csv: str = "data/processed/features.csv",
    incidents_csv: str = "data/synthetic/synthetic_incidents.csv",
    output_csv: str = "ml/data/ml_features_with_targets.csv"
) -> pd.DataFrame:
    """Generate forward-looking waterlogging event targets for 24h, 48h, 72h prediction horizons."""
    print("[INFO] Loading feature dataset and incident ground truth records...")
    df_feat = pd.read_csv(features_csv)
    df_feat['timestamp'] = pd.to_datetime(df_feat['timestamp'], utc=True)
    
    if os.path.exists(incidents_csv):
        df_inc = pd.read_csv(incidents_csv)
        df_inc['timestamp'] = pd.to_datetime(df_inc['timestamp'], utc=True)
    else:
        df_inc = pd.DataFrame()

    t12_list, t24_list, t48_list, t72_list = [], [], [], []

    for idx, row in df_feat.iterrows():
        w_id = row['ward_id']
        t_curr = row['timestamp']

        if not df_inc.empty:
            w_inc = df_inc[(df_inc['ward_id'] == w_id) & (df_inc['incident_type'] == 'waterlogging')]
            inc_12 = w_inc[(w_inc['timestamp'] >= t_curr) & (w_inc['timestamp'] <= t_curr + timedelta(hours=12))]
            inc_24 = w_inc[(w_inc['timestamp'] >= t_curr) & (w_inc['timestamp'] <= t_curr + timedelta(hours=24))]
            inc_48 = w_inc[(w_inc['timestamp'] >= t_curr) & (w_inc['timestamp'] <= t_curr + timedelta(hours=48))]
            inc_72 = w_inc[(w_inc['timestamp'] >= t_curr) & (w_inc['timestamp'] <= t_curr + timedelta(hours=72))]

            t12 = 1 if len(inc_12) > 0 else 0
            t24 = 1 if len(inc_24) > 0 else 0
            t48 = 1 if len(inc_48) > 0 else 0
            t72 = 1 if len(inc_72) > 0 else 0
        else:
            # Domain heuristic fallback based on heavy rainfall + low elevation
            rain24 = row['rainfall_last_24h']
            elev = row['elevation_m']
            prob = min(0.9, (rain24 / 150.0) * ((20.0 - elev) / 20.0))
            t12 = 1 if prob > 0.45 else 0
            t24 = 1 if prob > 0.4 else 0
            t48 = 1 if prob > 0.3 else 0
            t72 = 1 if prob > 0.25 else 0

        t12_list.append(t12)
        t24_list.append(t24)
        t48_list.append(t48)
        t72_list.append(t72)

    df_feat['target_waterlogging_12h'] = t12_list
    df_feat['target_waterlogging_24h'] = t24_list
    df_feat['target_waterlogging_48h'] = t48_list
    df_feat['target_waterlogging_72h'] = t72_list

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df_feat.to_csv(output_csv, index=False)
    print(f"[SUCCESS] Multi-horizon target labels compiled: {output_csv}")
    print(f"  - 12h Positive Events: {sum(t12_list)} / {len(t12_list)} ({round(sum(t12_list)/len(t12_list)*100, 1)}%)")
    print(f"  - 24h Positive Events: {sum(t24_list)} / {len(t24_list)} ({round(sum(t24_list)/len(t24_list)*100, 1)}%)")
    print(f"  - 48h Positive Events: {sum(t48_list)} / {len(t48_list)} ({round(sum(t48_list)/len(t48_list)*100, 1)}%)")
    print(f"  - 72h Positive Events: {sum(t72_list)} / {len(t72_list)} ({round(sum(t72_list)/len(t72_list)*100, 1)}%)")

    return df_feat

if __name__ == "__main__":
    build_multi_horizon_targets()
