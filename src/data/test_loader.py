from dataloaders import train_loader
import torch

images, labels = next(iter(train_loader))

print("✅ Batch loaded successfully")
print("Image shape:", images.shape)
print("Label shape:", labels.shape)
print("Labels:", labels.tolist())
print("Image dtype:", images.dtype)
print("CUDA available:", torch.cuda.is_available())

if torch.cuda.is_available():
    images = images.cuda()
    labels = labels.cuda()

    print("Images moved to GPU:", images.device)
    print("Labels moved to GPU:", labels.device)