from pathlib import Path
import sys

import torch
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)

# --------------------------------------------------
# Project paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(ROOT / "src" / "data"))
sys.path.insert(0, str(ROOT / "src" / "training"))

from dataloaders import val_loader # type: ignore
from model import create_model


# --------------------------------------------------
# Device
# --------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)


# --------------------------------------------------
# Load best model
# --------------------------------------------------
model_path = ROOT / "models" / "focal_best_model.pth"

if not model_path.exists():
    raise FileNotFoundError(
        f"Model not found:\n{model_path}"
    )

model = create_model(num_classes=5)

checkpoint = torch.load(
    model_path,
    map_location=device,
    weights_only=False
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)
model.eval()

print("✅ Best model loaded")
print(
    f"Saved validation accuracy: "
    f"{checkpoint['val_accuracy']:.4f}"
)


# --------------------------------------------------
# Generate predictions
# --------------------------------------------------

all_labels = []
all_predictions = []

with torch.no_grad():

    for images, labels in val_loader:

        images = images.to(device)

        outputs = model(images)

        predictions = outputs.argmax(dim=1)

        all_labels.extend(
            labels.numpy()
        )

        all_predictions.extend(
            predictions.cpu().numpy()
        )


all_labels = np.array(all_labels)
all_predictions = np.array(all_predictions)


# --------------------------------------------------
# Overall metrics
# --------------------------------------------------

accuracy = accuracy_score(
    all_labels,
    all_predictions
)

macro_f1 = f1_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0
)


print("\n" + "=" * 50)
print("DRISHTIAI BASELINE EVALUATION")
print("=" * 50)

print(
    f"\nAccuracy : {accuracy:.4f}"
)

print(
    f"Macro F1 : {macro_f1:.4f}"
)


# --------------------------------------------------
# Classification report
# --------------------------------------------------

print("\nClassification Report:")
print(
    classification_report(
        all_labels,
        all_predictions,
        labels=[0, 1, 2, 3, 4],
        target_names=[
            "Grade 0",
            "Grade 1",
            "Grade 2",
            "Grade 3",
            "Grade 4",
        ],
        zero_division=0
    )
)


# --------------------------------------------------
# Confusion matrix
# --------------------------------------------------

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=[0, 1, 2, 3, 4]
)

print("\nConfusion Matrix:")
print(cm)

print("\nRows = Actual")
print("Columns = Predicted")