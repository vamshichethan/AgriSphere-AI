import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import requests
from io import BytesIO
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

# ─── Class Labels (from kamal01 Kaggle Dataset) ──────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
CLASSES_PATH = os.path.join(MODEL_DIR, "disease_classes.json")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_disease_model.pth")

if os.path.exists(CLASSES_PATH):
    import json
    with open(CLASSES_PATH, "r") as f:
        CLASS_LABELS = json.load(f)
else:
    CLASS_LABELS = [
        "Corn_Common_Rust",
        "Corn_Gray_Leaf_Spot",
        "Corn_Northern_Leaf_Blight",
        "Potato_Early_Blight",
        "Potato_Late_Blight",
        "Rice_Brown_Spot",
        "Rice_Leaf_Blast",
        "Rice_Neck_Blast",
        "Tomato_Bacterial_Spot",
        "Tomato_Early_Blight",
        "Tomato_Late_Blight",
        "Tomato_Leaf_Mold",
        "Tomato_Target_Spot",
        "Wheat_Leaf_Rust",
        "Wheat_Stem_Rust",
        "Wheat_Stripe_Rust",
    ]

NUM_CLASSES = len(CLASS_LABELS)

# ─── Image preprocessing (must match training transforms) ────
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet mean
        std=[0.229, 0.224, 0.225]    # ImageNet std
    ),
])


def build_model() -> nn.Module:
    """Build EfficientNet-B0 with custom classifier head."""
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
    # Replace classifier head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, NUM_CLASSES)
    )
    return model


def load_model() -> nn.Module:
    """Load trained model weights if available, else return pretrained backbone."""
    model = build_model()
    if os.path.exists(MODEL_PATH):
        state_dict = torch.load(MODEL_PATH, map_location="cpu")
        model.load_state_dict(state_dict)
        print(f"✅ Disease model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️  No trained weights found at {MODEL_PATH}. Using backbone only. Train model first.")
    model.eval()
    return model


def predict_disease(image_url: str, model: nn.Module) -> dict:
    """Download image and run classification inference."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(image_url, headers=headers, timeout=10)
        image = Image.open(BytesIO(response.content)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to load image from URL: {str(e)}")

    tensor = transform(image).unsqueeze(0)  # Add batch dimension

    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, 1)

    label = CLASS_LABELS[predicted_idx.item()]
    parts = label.split("_", 1)
    crop = parts[0]
    disease = label

    return {
        "crop": crop,
        "disease": disease,
        "confidence": round(confidence.item(), 4),
        "all_probabilities": {
            CLASS_LABELS[i]: round(probabilities[0][i].item(), 4)
            for i in range(NUM_CLASSES)
        }
    }
