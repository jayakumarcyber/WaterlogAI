import numpy as np
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc,
    confusion_matrix, brier_score_loss
)
from typing import Dict, Any

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> Dict[str, Any]:
    """Compute comprehensive evaluation metrics for risk models."""
    prec = round(float(precision_score(y_true, y_pred, zero_division=0)), 4)
    rec = round(float(recall_score(y_true, y_pred, zero_division=0)), 4)
    f1 = round(float(f1_score(y_true, y_pred, zero_division=0)), 4)
    
    try:
        roc = round(float(roc_auc_score(y_true, y_prob)), 4)
    except Exception:
        roc = 0.5

    try:
        p_curve, r_curve, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = round(float(auc(r_curve, p_curve)), 4)
    except Exception:
        pr_auc = 0.5

    try:
        brier = round(float(brier_score_loss(y_true, y_prob)), 4)
    except Exception:
        brier = 0.25

    cm = confusion_matrix(y_true, y_pred).tolist() if len(np.unique(y_true)) > 1 else [[len(y_true), 0], [0, 0]]
    
    fn = cm[1][0] if len(cm) > 1 and len(cm[1]) > 0 else 0
    fp = cm[0][1] if len(cm) > 0 and len(cm[0]) > 1 else 0

    return {
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": roc,
        "pr_auc": pr_auc,
        "brier_score": brier,
        "confusion_matrix": cm,
        "false_negatives": int(fn),
        "false_positives": int(fp)
    }

def calibrate_probabilities(y_prob: np.ndarray) -> np.ndarray:
    """Clip and normalize probabilities into [0.0, 1.0] calibrated range."""
    return np.clip(y_prob, 0.001, 0.999)
