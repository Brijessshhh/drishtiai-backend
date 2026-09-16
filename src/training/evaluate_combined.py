from pathlib import Path
import sys

import torch
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix
)

ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(ROOT / "src" / "data"))
sys.path.insert(0, str(ROOT / "src" / "training"))

from dataloaders import val_loader, device
from model import create_model

MODEL_PATH = ROOT / "models" / "combined_best_model.pth"

model = create_model(num_classes=5)
model = model.to(device)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.eval()

print("✅ Best combined model loaded")
print(
    f"Saved Macro F1: "
    f"{checkpoint.get('macro_f1', 'N/A')}"
)
print(
    f"Saved Validation Accuracy: "
    f"{checkpoint.get('val_accuracy', 'N/A')}"
)
print(
    f"Saved Epoch: "
    f"{checkpoint.get('epoch', 'N/A')}"
)

all_predictions = []
all_labels = []

with torch.no_grad():

    for images, labels in val_loader:

        images = images.to(device)

        outputs = model(images)

        predictions = outputs.argmax(dim=1)

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.numpy()
        )

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
print("DRISHTIAI COMBINED MODEL EVALUATION")
print("=" * 50)

print(
    f"\nAccuracy : {accuracy:.4f}"
)

print(
    f"Macro F1 : {macro_f1:.4f}"
)

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
            "Grade 4"
        ],
        zero_division=0
    )
)

print("\nConfusion Matrix:")

print(
    confusion_matrix(
        all_labels,
        all_predictions,
        labels=[0, 1, 2, 3, 4]
    )
)

print("\nRows = Actual")
print("Columns = Predicted")