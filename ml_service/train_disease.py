import torch
import torchvision.models as models
import torch.nn as nn
import json
import os

print("Setting up Disease Classifier model architecture...")

# Standard classes for typical crop diseases
classes = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___healthy",
    "Corn_(maize)___Common_rust_", "Corn_(maize)___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Tomato___Bacterial_spot", "Tomato___healthy"
]

os.makedirs('models', exist_ok=True)

print("Saving disease_classes.json...")
with open('models/disease_classes.json', 'w') as f:
    json.dump(classes, f)

print("Initializing EfficientNet-B0...")
# Using pretrained=False for local generation to avoid unnecessary downloads
model = models.efficientnet_b0(weights=None)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, len(classes))

print("Saving untrained model weights to crop_disease_model.pth (Inference Ready)...")
print("Note: For production accuracy, train this model on a GPU (e.g., Google Colab) and replace this file.")

torch.save(model.state_dict(), 'models/crop_disease_model.pth')

print("✅ Disease Classifier successfully initialized and saved!")
