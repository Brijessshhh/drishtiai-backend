from pathlib import Path
import sys
import torch
import torch.nn as nn
from torch.optim import AdamW
from sklearn.metrics import f1_score
import numpy as np

ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(ROOT / "src" / "data"))
sys.path.insert(0, str(ROOT / "src" / "training"))

from dataloaders import train_loader, val_loader # type: ignore
from model import create_model

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)

model = create_model(num_classes=5).to(device)

train_labels = train_loader.dataset.df["grade"].values

class_counts = np.bincount(
    train_labels,
    minlength=5
)

class_weights = len(train_labels) / (
    5 * class_counts
)

class_weights = np.sqrt(class_weights)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(device)

print("Class weights:", class_weights)

class FocalLoss(nn.Module):

    def __init__(self, alpha, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, inputs, targets):
        ce_loss = nn.functional.cross_entropy(
            inputs,
            targets,
            weight=self.alpha,
            reduction="none"
        )

        pt = torch.exp(-ce_loss)

        focal_loss = (
            (1 - pt) ** self.gamma
        ) * ce_loss

        return focal_loss.mean()


criterion = FocalLoss(
    alpha=class_weights,
    gamma=2.0
)

optimizer = AdamW(
    model.parameters(),
    lr=1e-4,
    weight_decay=1e-4
)

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2
)

EPOCHS = 15

MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(exist_ok=True)

BEST_MODEL_PATH = (
    MODEL_DIR / "focal_best_model.pth"
)

best_macro_f1 = 0.0
patience = 4
no_improvement = 0

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

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()
        optimizer.step()

        train_loss += loss.item()

        predictions = outputs.argmax(dim=1)

        train_correct += (
            predictions == labels
        ).sum().item()

        train_total += labels.size(0)

    train_accuracy = (
        train_correct / train_total
    )

    average_train_loss = (
        train_loss / len(train_loader)
    )

    model.eval()

    val_loss = 0.0
    val_labels = []
    val_predictions = []

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            val_loss += loss.item()

            predictions = outputs.argmax(dim=1)

            val_labels.extend(
                labels.cpu().numpy()
            )

            val_predictions.extend(
                predictions.cpu().numpy()
            )

    average_val_loss = (
        val_loss / len(val_loader)
    )

    val_accuracy = (
        np.array(val_labels)
        == np.array(val_predictions)
    ).mean()

    val_macro_f1 = f1_score(
        val_labels,
        val_predictions,
        average="macro"
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
        no_improvement = 0

        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "val_macro_f1": val_macro_f1,
                "val_accuracy": val_accuracy,
                "epoch": epoch + 1
            },
            BEST_MODEL_PATH
        )

        print("💾 New best focal model saved!")

    else:

        no_improvement += 1

        print(
            f"No improvement "
            f"({no_improvement}/{patience})"
        )

        if no_improvement >= patience:

            print(
                "\n⏹️ Early stopping triggered."
            )

            break

print("\n========================================")
print("✅ FOCAL TRAINING COMPLETED")
print("========================================")
print(
    f"Best Validation Macro F1: "
    f"{best_macro_f1:.4f}"
)
print(
    f"Model saved at: "
    f"{BEST_MODEL_PATH}"
)