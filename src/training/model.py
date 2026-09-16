import torch
import torch.nn as nn
from torchvision import models


def create_model(num_classes=5):

    """
    Create ResNet-50 architecture
    for 5-class diabetic retinopathy classification.

    Pretrained weights are NOT loaded here.
    The trained DrishtiAI checkpoint is loaded separately
    by predictor.py.
    """

    model = models.resnet50(weights=None)

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

    print("✅ Model architecture created")
    print("Device:", device)
    print("Output classes:", 5)

    dummy_input = torch.randn(
        1, 3, 224, 224
    ).to(device)

    with torch.no_grad():
        output = model(dummy_input)

    print("Input shape:", dummy_input.shape)
    print("Output shape:", output.shape)