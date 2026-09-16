import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import gc
import torch
torch.set_num_threads(1)

from PIL import Image
from torchvision import transforms

from src.training.model import create_model


# ============================================================
# DEVICE
# ============================================================

device = torch.device("cpu")


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "focal_best_model.pth"
)


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading DrishtiAI model...")
print(f"Model path: {MODEL_PATH}")
print(f"Device: {device}")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model file not found: {MODEL_PATH}"
    )

# IMPORTANT:
# weights=None prevents downloading ResNet pretrained
# ImageNet weights during deployment.
model = create_model(
    num_classes=5,
    weights=None
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False
)

# Support checkpoint containing model_state_dict
if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    state_dict = checkpoint["model_state_dict"]
else:
    state_dict = checkpoint

model.load_state_dict(state_dict)

# Free the checkpoint dict — weights are already copied into the
# model, no need to keep this second full copy in memory.
del checkpoint, state_dict
gc.collect()

model = model.to(device)
model.eval()

# Freeze all parameter gradients — inference only, never need
# weight gradients. Saves significant memory during Grad-CAM's
# backward() pass (activation gradients still work fine).
for p in model.parameters():
    p.requires_grad_(False)

print("DrishtiAI model loaded successfully.")


# ============================================================
# IMAGE TRANSFORMATION
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# DIABETIC RETINOPATHY LABELS
# ============================================================

GRADE_LABELS = {
    0: "No Diabetic Retinopathy",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative"
}


# ============================================================
# PREDICTION
# ============================================================

def predict_image(image: Image.Image):

    image = image.convert("RGB")

    tensor = transform(image)
    tensor = tensor.unsqueeze(0).to(device)  # type: ignore

    with torch.no_grad():

        outputs = model(tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    grade = int(prediction.item())
    confidence_value = float(confidence.item())

    return {
        "grade": grade,
        "severity": GRADE_LABELS.get(
            grade,
            "Unknown"
        ),
        "confidence": round(
            confidence_value * 100,
            2
        )
    }
