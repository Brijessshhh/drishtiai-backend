import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def generate_gradcam(
    image: Image.Image,
    predicted_class: int,
    model,
    device
):
    """
    Generate Grad-CAM visualization for a prediction.

    Model and device are passed as arguments to avoid
    circular imports with predictor.py.
    """

    image = image.convert("RGB")

    # Resize image for visualization
    resized = image.resize((224, 224))

    rgb_image = (
        np.array(resized).astype(np.float32) / 255.0
    )

    # Preprocess image
    input_tensor = transform(
        image
    ).unsqueeze(0).to(device)

    # Last convolutional layer of ResNet-50
    target_layers = [
        model.layer4[-1]
    ]

    # Generate Grad-CAM
    with GradCAM(
        model=model,
        target_layers=target_layers
    ) as cam:

        targets = [
            ClassifierOutputTarget(predicted_class)
        ]

        grayscale_cam = cam(
            input_tensor=input_tensor,
            targets=targets
        )[0]

    # Generate heatmap
    heatmap = cv2.applyColorMap(
        np.uint8(255 * grayscale_cam),
        cv2.COLORMAP_JET
    )

    heatmap = cv2.cvtColor(
        heatmap,
        cv2.COLOR_BGR2RGB
    )

    # Overlay Grad-CAM on original image
    overlay = show_cam_on_image(
        rgb_image,
        grayscale_cam,
        use_rgb=True
    )

    # Combine:
    # Original | Heatmap | Grad-CAM overlay
    combined = np.hstack([
        np.array(resized),
        heatmap,
        overlay
    ])

    # Encode as JPEG
    success, encoded = cv2.imencode(
        ".jpg",
        cv2.cvtColor(
            combined,
            cv2.COLOR_RGB2BGR
        )
    )

    if not success:
        raise RuntimeError(
            "Failed to encode Grad-CAM image"
        )

    return encoded.tobytes()