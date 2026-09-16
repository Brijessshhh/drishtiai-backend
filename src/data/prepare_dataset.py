from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "datasets" / "idrid"

csv_files = list(DATASET.rglob("*Training*Labels*.csv"))

if not csv_files:
    raise FileNotFoundError("Training labels CSV not found.")

csv_path = csv_files[0]

image_dir = DATASET / "B.%20Disease%20Grading" / "B. Disease Grading" / "1. Original Images" / "a. Training Set"

if not image_dir.exists():
    raise FileNotFoundError(f"Image folder not found: {image_dir}")

df = pd.read_csv(csv_path)

df.columns = df.columns.str.strip()

df = df[["Image name", "Retinopathy grade"]].copy()

df["Image name"] = df["Image name"].astype(str).str.strip()

df["image_path"] = df["Image name"].apply(
    lambda x: str(image_dir / f"{x}.jpg")
)

df["exists"] = df["image_path"].apply(lambda x: Path(x).exists())

print("Total labels:", len(df))
print("Images found:", df["exists"].sum())
print("Missing images:", (~df["exists"]).sum())

df = df[df["exists"]].copy()

df = df.drop(columns=["exists"])

output_dir = DATASET / "processed"
output_dir.mkdir(exist_ok=True)

output_file = output_dir / "train.csv"
df.to_csv(output_file, index=False)

print("\n✅ Dataset CSV created!")
print("Saved to:", output_file)

print("\nGrade distribution:")
print(df["Retinopathy grade"].value_counts().sort_index())