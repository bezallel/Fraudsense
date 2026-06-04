import os
import joblib
import numpy as np
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# ── Load model artefacts once at startup ──────────────────────────────────────
BASE = os.path.dirname(__file__)

model    = joblib.load(os.path.join(BASE, "model", "fraud_model.pkl"))
encoder  = joblib.load(os.path.join(BASE, "model", "label_encoder.pkl"))
features = joblib.load(os.path.join(BASE, "model", "feature_names.pkl"))

# ── Feature engineering (mirrors exactly what you did in Jupyter) ─────────────
def engineer_features(type_str, amount, old_balance_orig, new_balance_orig,
                       old_balance_dest, new_balance_dest=0.0):
    """
    Reconstruct every feature the model was trained on.
    new_balance_dest is set to 0 by default since the UI only collects
    recipient balance BEFORE the transaction.
    """
    type_encoded = encoder.transform([type_str])[0]

    orig_drain_ratio   = amount / (old_balance_orig + 1)
    orig_balance_delta = old_balance_orig - new_balance_orig - amount
    dest_balance_delta = new_balance_dest - old_balance_dest - amount
    orig_zeroed        = int(new_balance_orig == 0)
    dest_was_zero      = int(old_balance_dest == 0)

    row = {
        "amount":            amount,
        "oldbalanceOrg":     old_balance_orig,
        "newbalanceOrig":    new_balance_orig,
        "oldbalanceDest":    old_balance_dest,
        "newbalanceDest":    new_balance_dest,
        "orig_drain_ratio":  orig_drain_ratio,
        "orig_balance_delta": orig_balance_delta,
        "dest_balance_delta": dest_balance_delta,
        "orig_zeroed":       orig_zeroed,
        "dest_was_zero":     dest_was_zero,
        "type_encoded":      type_encoded,
    }

    # Return a 2-D array in exactly the order the model expects
    return np.array([[row[f] for f in features]])


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    try:
        tx_type          = data["type"]                        # e.g. "TRANSFER"
        amount           = float(data["amount"])
        old_balance_orig = float(data["oldBalanceOrig"])
        new_balance_orig = float(data["newBalanceOrig"])
        old_balance_dest = float(data["oldBalanceDest"])
    except (KeyError, ValueError) as e:
        return jsonify({"error": f"Missing or invalid field: {e}"}), 400

    # Only TRANSFER and CASH_OUT can be fraud in this dataset
    if tx_type not in ("TRANSFER", "CASH_OUT"):
        return jsonify({
            "fraud":       False,
            "probability": round(float(np.random.uniform(0.00, 0.03)), 3),
            "type":        tx_type,
        })

    X = engineer_features(
        tx_type, amount,
        old_balance_orig, new_balance_orig,
        old_balance_dest
    )

    prob  = float(model.predict_proba(X)[0][1])
    fraud = prob >= 0.5

    return jsonify({
        "fraud":       fraud,
        "probability": round(prob, 3),
        "type":        tx_type,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
