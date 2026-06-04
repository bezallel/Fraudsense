# FraudSense — AML Transaction Intelligence

A live fraud detection system powered by XGBoost trained on PaySim synthetic mobile money data.
Built by Peace Valari.

---

## Folder structure

```
fraudsense_app/
├── app.py                  ← Flask server
├── requirements.txt
├── render.yaml             ← Render deployment config
├── .gitignore
├── model/
│   ├── fraud_model.pkl     ← your trained XGBoost model  ← YOU ADD THIS
│   ├── label_encoder.pkl   ← your LabelEncoder           ← YOU ADD THIS
│   └── feature_names.pkl   ← your feature list           ← YOU ADD THIS
└── templates/
    └── index.html          ← the frontend
```

---

## Step 1 — Copy your model files in

From wherever you saved them in Jupyter, copy these three files into the `model/` folder:

- `fraud_model.pkl`
- `label_encoder.pkl`
- `feature_names.pkl`

---

## Step 2 — Run locally

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

Open your browser at `http://localhost:5000`

---

## Step 3 — Deploy to Render

1. Push this entire folder to a GitHub repository (public or private).

2. Go to https://render.com and sign in.

3. Click **New > Web Service**.

4. Connect your GitHub repo.

5. Render will detect `render.yaml` automatically and configure everything.

6. Click **Deploy**. Your live URL will appear at the top of the dashboard in about 2 minutes.

---

## How the prediction works

The frontend sends a POST request to `/predict` with this JSON body:

```json
{
  "type":           "TRANSFER",
  "amount":         181000,
  "oldBalanceOrig": 181000,
  "newBalanceOrig": 0,
  "oldBalanceDest": 0
}
```

The server engineers the same features used during training (drain ratio, balance deltas,
zero-balance flags, type encoding) and runs them through the saved XGBoost model.

It returns:

```json
{
  "fraud":       true,
  "probability": 0.987,
  "type":        "TRANSFER"
}
```

The frontend uses the probability and fraud flag to render the full results panel,
typology card, model reasoning, and SAR draft.

---

## Notes

- PAYMENT and DEBIT are returned immediately as low-risk without hitting the model,
  since these types have zero fraud incidence in the training data.
- The model runs on 2 Gunicorn workers. Render's free tier is sufficient for demo use.
- Model files are not committed to GitHub. Add them manually to the `model/` folder
  before deploying, or use Render's environment file upload.
