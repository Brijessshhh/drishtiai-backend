from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "datasets" / "idrid"
INPUT_FILE = DATASET / "processed" / "train.csv"

# Load dataset
df = pd.read_csv(INPUT_FILE)

print("Total samples:", len(df))

# Stratified 80/20 split
train_df, val_df = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["Retinopathy grade"]
)

# Save splits
train_file = DATASET / "processed" / "train_split.csv"
val_file = DATASET / "processed" / "val_split.csv"

train_df.to_csv(train_file, index=False)
val_df.to_csv(val_file, index=False)

print("\n✅ Dataset split completed!")
print("Training samples:", len(train_df))
print("Validation samples:", len(val_df))

print("\nTraining distribution:")
print(train_df["Retinopathy grade"].value_counts().sort_index())

print("\nValidation distribution:")
print(val_df["Retinopathy grade"].value_counts().sort_index())