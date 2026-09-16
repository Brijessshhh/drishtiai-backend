import torch
import torch.nn as nn
from torchvision import models


def create_model(num_classes=5):
    """
    Create a pretrained ResNet-50 for
    5-class diabetic retinopathy classification.
    """

    # Load pretrained ResNet-50
    model = models.resnet50(
        weights=models.ResNet50_Weights.DEFAULT
    )

    # Replace the original ImageNet classifier
    # (1000 classes) with our 5 DR classes.
    input_features = model.fc.in_features

    model.fc = nn.Linear(
        input_features,
        num_classes
    )

    return model


if __name__ == "__main__":

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model = create_model(num_classes=5)
    model = model.to(device)

    print("✅ Model created successfully")
    print("Device:", device)
    print("Output classes:", 5)

    # Test with one batch-shaped input
    dummy_input = torch.randn(
        2, 3, 224, 224
    ).to(device)

    with torch.no_grad():
        output = model(dummy_input)

    print("Input shape:", dummy_input.shape)
    print("Output shape:", output.shape)