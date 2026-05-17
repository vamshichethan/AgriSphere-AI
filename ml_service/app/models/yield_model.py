import pickle
import os
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "crop_yield_model.pkl")

def load_yield_model():
    """Load trained RandomForest yield predictor and encoders."""
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            data = pickle.load(f)
        print(f"✅ Yield model loaded from {MODEL_PATH}")
        return data['model'], data['encoders']
    print(f"⚠️ Yield model not trained yet. Run train_yield.py first.")
    return None, None

def predict_yield(state: str, district: str, crop: str, season: str, area_hectares: float, model, encoders) -> dict:
    if model is None or encoders is None:
        base_yield = {"Rice": 2.5, "Wheat": 3.1, "Sugarcane": 70.0, "Tomato": 25.0, "Potato": 20.0}.get(crop, 2.0)
        estimated_yield = base_yield * (1 + (area_hectares / 100) * 0.05)
        return {
            "yield_quintals_per_hectare": round(estimated_yield, 2),
            "estimated_production_quintals": round(estimated_yield * area_hectares, 2),
            "confidence": "low",
            "note": "Estimate based on historical averages. Train model for accurate predictions."
        }

    try:
        # Fallback if label not found in encoder
        def safe_transform(enc, val):
            if val in enc.classes_:
                return enc.transform([val])[0]
            return enc.transform([enc.classes_[0]])[0]
            
        state_enc = safe_transform(encoders["State_Name"], state)
        district_enc = safe_transform(encoders["District_Name"], district)
        crop_enc = safe_transform(encoders["Crop"], crop)
        season_enc = safe_transform(encoders["Season"], season)

        X = pd.DataFrame([[state_enc, district_enc, crop_enc, season_enc, area_hectares]], 
                         columns=['State_Name', 'District_Name', 'Crop', 'Season', 'Area'])
                         
        predicted_yield = float(model.predict(X)[0])
        estimated_production = round(predicted_yield * area_hectares, 2)

        return {
            "yield_quintals_per_hectare": round(predicted_yield, 2),
            "estimated_production_quintals": estimated_production,
            "confidence": "high",
            "inputs": {"state": state, "district": district, "crop": crop, "season": season, "area_hectares": area_hectares}
        }
    except Exception as e:
        raise ValueError(f"Prediction error: {str(e)}")
