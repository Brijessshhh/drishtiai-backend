from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "datasets" / "idrid"

# Find training labels CSV
csv_files = list(DATASET.rglob("*Training*Labels*.csv"))

if not csv_files:
    print("❌ Training labels CSV not found.")
    exit()

csv_path = csv_files[0]

# Find JPG images
images = list(DATASET.rglob("*.jpg"))

print("CSV:", csv_path)
print("Images found:", len(images))

# Read labels
df = pd.read_csv(csv_path)

print("\nColumns:")
print(df.columns.tolist())

df.columns = df.columns.str.strip()

image_col = df.columns[0]
grade_col = df.columns[1]

# Image names without extension
image_names = {img.stem for img in images}

df["Image name"] = df[image_col].astype(str).str.strip()

matched = df["Image name"].isin(image_names)

print("\nTraining samples:", len(df))
print("Matched images:", matched.sum())
print("Missing images:", (~matched).sum())

print("\nRetinopathy Grade Distribution:")
print(df[grade_col].value_counts().sort_index())

if matched.all():
    print("\n✅ ALL TRAINING LABELS HAVE MATCHING IMAGES!")
else:
    print("\n⚠️ Some labels do not have matching images.")