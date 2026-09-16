import torch
import torch.nn as nn
from torchvision import models


def create_model(num_classes=5, weights=None):
    """
    Create ResNet-50 for 5-class diabetic retinopathy classification.

    For deployment/inference:
        weights=None

    This is important because our trained checkpoint is loaded separately.
    """

    model = models.resnet50(weights=weights)

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

    # Test model without downloading ImageNet weights
    model = create_model(
        num_classes=5,
        weights=None
    )

    model = model.to(device)

    print("Model created successfully")
    print("Device:", device)
    print("Output classes:", 5)