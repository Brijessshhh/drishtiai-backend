from pathlib import Path
import pandas as pd
from PIL import Image
from torch.utils.data import Dataset
import torch


class IDRiDDataset(Dataset):
    def __init__(self, csv_file, transform=None):
        self.df = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        image_path = self.df.iloc[idx]["image_path"]
        label = int(self.df.iloc[idx]["Retinopathy grade"])

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(label, dtype=torch.long)