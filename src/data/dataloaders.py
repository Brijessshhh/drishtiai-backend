import pandas as pd
import numpy as np
import torch

from pathlib import Path
from PIL import Image
from torch.utils.data import (
    Dataset,
    DataLoader,
    WeightedRandomSampler
)
from torchvision import transforms


# ==================================================
# PATHS
# ==================================================

ROOT = Path(__file__).resolve().parents[2]

TRAIN_CSV = ROOT / "datasets" / "combined" / "train.csv"
VAL_CSV = ROOT / "datasets" / "combined" / "val.csv"


# ==================================================
# DATASET
# ==================================================

class DRDataset(Dataset):

    def __init__(self, csv_path, transform=None):

        self.df = pd.read_csv(csv_path)
        self.transform = transform

        required_columns = {
            "image_name",
            "grade",
            "source"
        }

        missing = required_columns - set(self.df.columns)

        if missing:
            raise ValueError(
                f"Missing columns in {csv_path}: {missing}"
            )

    def __len__(self):
        return len(self.df)

    def __getitem__(self, index):

        row = self.df.iloc[index]

        image_name = str(row["image_name"])
        source = str(row["source"])
        label = int(row["grade"])

        image_path = None

        # ==================================================
        # APTOS
        # ==================================================

        if source == "APTOS":

            image_dir = (
                ROOT
                / "datasets"
                / "aptos"
                / "train_images"
            )

            for ext in [".png", ".jpg", ".jpeg"]:

                candidate = image_dir / f"{image_name}{ext}"

                if candidate.exists():
                    image_path = candidate
                    break

        # ==================================================
        # IDRiD
        # ==================================================

        elif source == "IDRiD":

            image_dirs = [

                ROOT
                / "datasets"
                / "idrid"
                / "B.%20Disease%20Grading"
                / "B. Disease Grading"
                / "1. Original Images"
                / "a. Training Set",

                ROOT
                / "datasets"
                / "idrid"
                / "B.%20Disease%20Grading"
                / "B. Disease Grading"
                / "1. Original Images"
                / "b. Testing Set"
            ]

            for image_dir in image_dirs:

                for ext in [".jpg", ".png", ".jpeg"]:

                    candidate = image_dir / f"{image_name}{ext}"

                    if candidate.exists():
                        image_path = candidate
                        break

                if image_path is not None:
                    break

        else:

            raise ValueError(
                f"Unknown source: {source}"
            )

        # ==================================================
        # FILE CHECK
        # ==================================================

        if image_path is None:

            raise FileNotFoundError(
                f"Image not found: "
                f"{image_name} | Source: {source}"
            )

        # ==================================================
        # LOAD IMAGE
        # ==================================================

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return (
            image,
            torch.tensor(
                label,
                dtype=torch.long
            )
        )


# ==================================================
# TRANSFORMS
# ==================================================

train_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        10
    ),

    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ==================================================
# DATASETS
# ==================================================

train_dataset = DRDataset(
    TRAIN_CSV,
    transform=train_transform
)

val_dataset = DRDataset(
    VAL_CSV,
    transform=val_transform
)


# ==================================================
# BALANCED SAMPLER
# ==================================================

train_labels = (
    train_dataset.df["grade"]
    .astype(int)
    .values
)

class_counts = np.bincount(
    train_labels, # type: ignore
    minlength=5
)

print("\nClass counts:")

for grade in range(5):

    print(
        f"Grade {grade}: {class_counts[grade]}"
    )


# Inverse-frequency weights

class_weights = 1.0 / class_counts

sample_weights = np.array([
    class_weights[label]
    for label in train_labels
])


sampler = WeightedRandomSampler(
    weights=torch.tensor(
        sample_weights,
        dtype=torch.double
    ), # type: ignore
    num_samples=len(sample_weights),
    replacement=True
)


# ==================================================
# DATALOADERS
# ==================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=16,
    sampler=sampler,
    num_workers=0
)


val_loader = DataLoader(
    val_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)


# ==================================================
# DEVICE
# ==================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ==================================================
# READY
# ==================================================

print("\n✅ Balanced DataLoaders ready")
print("Training samples:", len(train_dataset))
print("Validation samples:", len(val_dataset))
print("Device:", device)