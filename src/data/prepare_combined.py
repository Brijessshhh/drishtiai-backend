from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split


# ==================================================
# PROJECT PATHS
# ==================================================

ROOT = Path(__file__).resolve().parents[2]

IDRID_DIR = ROOT / "datasets" / "idrid"
APTOS_DIR = ROOT / "datasets" / "aptos"

OUTPUT_DIR = ROOT / "datasets" / "combined"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ==================================================
# IDRiD
# ==================================================

print("\nChecking IDRiD...")

idrid_csv = IDRID_DIR / "processed" / "train.csv"

if not idrid_csv.exists():
    raise FileNotFoundError(
        f"IDRiD CSV not found:\n{idrid_csv}"
    )

idrid_df = pd.read_csv(idrid_csv)

# Your existing IDRiD CSV uses these columns
idrid_df = idrid_df.rename(
    columns={
        "Image name": "image_name",
        "Retinopathy grade": "grade"
    }
)

idrid_df["source"] = "IDRiD"

# Convert image paths to absolute paths
idrid_df["image_path"] = idrid_df["image_name"].apply(
    lambda x: str(
        IDRID_DIR /
        "B.%20Disease%20Grading" /
        "B. Disease Grading" /
        "1. Original Images" /
        "a. Training Set" /
        f"{x}.jpg"
    )
)


# ==================================================
# APTOS
# ==================================================

print("Checking APTOS...")

aptos_csv = APTOS_DIR / "train.csv"
aptos_images = APTOS_DIR / "train_images"

if not aptos_csv.exists():
    raise FileNotFoundError(
        f"APTOS CSV not found:\n{aptos_csv}"
    )

if not aptos_images.exists():
    raise FileNotFoundError(
        f"APTOS image folder not found:\n{aptos_images}"
    )

aptos_df = pd.read_csv(aptos_csv)

aptos_df = aptos_df.rename(
    columns={
        "id_code": "image_name",
        "diagnosis": "grade"
    }
)

aptos_df["source"] = "APTOS"

aptos_df["image_path"] = aptos_df["image_name"].apply(
    lambda x: str(
        aptos_images / f"{x}.png"
    )
)


# ==================================================
# COMBINE
# ==================================================

combined_df = pd.concat(
    [
        idrid_df[["image_name", "grade", "source", "image_path"]],
        aptos_df[["image_name", "grade", "source", "image_path"]]
    ],
    ignore_index=True
)


# ==================================================
# VERIFY IMAGES
# ==================================================

print("\nVerifying images...")

combined_df["exists"] = combined_df["image_path"].apply(
    lambda x: Path(x).exists()
)

missing = combined_df[
    ~combined_df["exists"]
]

print(
    f"Total samples: {len(combined_df)}"
)

print(
    f"Images found: {combined_df['exists'].sum()}"
)

print(
    f"Missing images: {len(missing)}"
)

if len(missing) > 0:
    print("\nFirst missing images:")
    print(
        missing[
            ["image_name", "source", "image_path"]
        ].head(10)
    )

    raise FileNotFoundError(
        "Some images are missing. Fix paths before training."
    )


# ==================================================
# REMOVE CHECK COLUMN
# ==================================================

combined_df = combined_df.drop(
    columns=["exists"]
)


# ==================================================
# DATASET DISTRIBUTION
# ==================================================

print("\nCombined distribution:")

print(
    combined_df["grade"]
    .value_counts()
    .sort_index()
)

print("\nDistribution by source:")

print(
    pd.crosstab(
        combined_df["grade"],
        combined_df["source"]
    )
)


# ==================================================
# STRATIFIED TRAIN / VALIDATION SPLIT
# ==================================================

train_df, val_df = train_test_split(
    combined_df,
    test_size=0.20,
    random_state=42,
    stratify=combined_df["grade"]
)


# ==================================================
# SAVE
# ==================================================

train_path = OUTPUT_DIR / "train.csv"
val_path = OUTPUT_DIR / "val.csv"

train_df.to_csv(
    train_path,
    index=False
)

val_df.to_csv(
    val_path,
    index=False
)


print("\n========================================")
print("✅ COMBINED DATASET CREATED")
print("========================================")

print(
    f"Total samples: {len(combined_df)}"
)

print(
    f"Training samples: {len(train_df)}"
)

print(
    f"Validation samples: {len(val_df)}"
)

print(
    f"\nTrain CSV:\n{train_path}"
)

print(
    f"\nValidation CSV:\n{val_path}"
)