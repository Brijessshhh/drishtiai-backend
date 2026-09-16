from pathlib import Path
import sys
import torch
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix
)

ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(ROOT / "src" / "data"))
sys.path.insert(0, str(ROOT / "src" / "training"))

from dataloaders import val_loader # type: ignore
from model import create_model # type: ignore

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = create_model(num_classes=5)

model_path = ROOT / "models" / "augmented_focal_best_model.pth"

checkpoint = torch.load(
    model_path,
    map_location=device,
    weights_only=False
)


model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

all_labels = []
all_predictions = []

with torch.no_grad():
    for images, labels in val_loader:
        images = images.to(device)
        outputs = model(images)
        predictions = outputs.argmax(dim=1)

        all_labels.extend(labels.cpu().numpy())
        all_predictions.extend(predictions.cpu().numpy())

all_labels = np.array(all_labels)
all_predictions = np.array(all_predictions)

accuracy = accuracy_score(
    all_labels,
    all_predictions
)

macro_f1 = f1_score(
    all_labels,
    all_predictions,
    average="macro"
)

weighted_f1 = f1_score(
    all_labels,
    all_predictions,
    average="weighted"
)

print("\n========================================")
print("DRISHTIAI MODEL EVALUATION")
print("========================================")

print(f"Validation Samples: {len(all_labels)}")
print(f"Accuracy: {accuracy:.4f}")
print(f"Macro F1: {macro_f1:.4f}")
print(f"Weighted F1: {weighted_f1:.4f}")

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
        digits=4,
        zero_division=0
    )
)

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=[0, 1, 2, 3, 4]
)

print("\nConfusion Matrix:")
print(cm)

print("\nPer-Grade Results:")

for grade in range(5):
    mask = all_labels == grade
    total = mask.sum()
    correct = (all_predictions[mask] == grade).sum()

    grade_accuracy = correct / total if total > 0 else 0

    print(
        f"Grade {grade}: "
        f"{correct}/{total} correct "
        f"({grade_accuracy:.2%})"
    )

print("\n========================================")
print("✅ Evaluation completed")
print("========================================")