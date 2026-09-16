from pathlib import Path
import sys

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import f1_score
from sklearn.utils.class_weight import compute_class_weight
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau

ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(ROOT / "src" / "data"))
sys.path.insert(0, str(ROOT / "src" / "training"))

from dataloaders import train_loader, val_loader
from model import create_model

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)

model = create_model(num_classes=5)
model = model.to(device)

train_labels = train_loader.dataset.df["grade"].values

classes = np.array([0, 1, 2, 3, 4])

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=train_labels
)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(device)

print("Class weights:", class_weights)

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)

optimizer = AdamW(
    model.parameters(),
    lr=1e-4,
    weight_decay=1e-4
)

scheduler = ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2
)

EPOCHS = 15
PATIENCE = 4

MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(exist_ok=True)

BEST_MODEL_PATH = MODEL_DIR / "combined_best_model.pth"

best_macro_f1 = 0.0
epochs_without_improvement = 0

for epoch in range(EPOCHS):

    model.train()

    train_loss = 0.0
    train_correct = 0
    train_total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        train_loss += loss.item()

        predictions = outputs.argmax(dim=1)

        train_correct += (
            predictions == labels
        ).sum().item()

        train_total += labels.size(0)

    train_accuracy = train_correct / train_total

    average_train_loss = (
        train_loss / len(train_loader)
    )

    model.eval()

    val_loss = 0.0
    val_correct = 0
    val_total = 0

    all_predictions = []
    all_labels = []

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss += loss.item()

            predictions = outputs.argmax(dim=1)

            val_correct += (
                predictions == labels
            ).sum().item()

            val_total += labels.size(0)

            all_predictions.extend(
                predictions.cpu().numpy()
            )

            all_labels.extend(
                labels.cpu().numpy()
            )

    val_accuracy = val_correct / val_total

    average_val_loss = (
        val_loss / len(val_loader)
    )

    val_macro_f1 = f1_score(
        all_labels,
        all_predictions,
        average="macro",
        zero_division=0
    )

    scheduler.step(val_macro_f1)

    current_lr = optimizer.param_groups[0]["lr"]

    print(
        f"\nEpoch [{epoch + 1}/{EPOCHS}]"
    )

    print(
        f"Train Loss: {average_train_loss:.4f} | "
        f"Train Accuracy: {train_accuracy:.4f}"
    )

    print(
        f"Val Loss: {average_val_loss:.4f} | "
        f"Val Accuracy: {val_accuracy:.4f}"
    )

    print(
        f"Val Macro F1: {val_macro_f1:.4f} | "
        f"Learning Rate: {current_lr:.6f}"
    )

    if val_macro_f1 > best_macro_f1:

        best_macro_f1 = val_macro_f1
        epochs_without_improvement = 0

        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "val_accuracy": val_accuracy,
                "macro_f1": val_macro_f1,
                "epoch": epoch + 1,
                "num_classes": 5,
            },
            BEST_MODEL_PATH
        )

        print("💾 New best model saved!")

    else:

        epochs_without_improvement += 1

        print(
            f"No improvement "
            f"({epochs_without_improvement}/{PATIENCE})"
        )

    if epochs_without_improvement >= PATIENCE:

        print("\n⏹️ Early stopping triggered.")
        break

print("\n========================================")
print("✅ COMBINED TRAINING COMPLETED")
print("========================================")

print(
    f"Best Validation Macro F1: "
    f"{best_macro_f1:.4f}"
)

print(
    f"Model saved at:\n{BEST_MODEL_PATH}"
)