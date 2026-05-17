import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import os

print("Loading dataset...")
df = pd.read_csv('datasets/Indian_crop_production_yield_dataset.csv')

# The dataset contains columns: 'State', 'District', 'Crop', 'Season', 'Area', 'Production', 'Yield'
df = df.dropna()

# Predict Yield based on State_Name, District_Name, Crop, Season, Area
features = ['State_Name', 'District_Name', 'Crop', 'Season', 'Area']
X = df[features].copy()
y = df['yield'].copy()

# Label Encoding for categorical vars
encoders = {}
for col in ['State_Name', 'District_Name', 'Crop', 'Season']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

print("Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest Regression model...")
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

score = model.score(X_test, y_test)
print(f"Model R^2 Score: {score:.4f}")

print("Saving models and encoders...")
os.makedirs('models', exist_ok=True)
with open('models/crop_yield_model.pkl', 'wb') as f:
    pickle.dump({'model': model, 'encoders': encoders}, f)

print("✅ Yield Predictor successfully trained and saved!")
