import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

cv2.setNumThreads(1)

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
    Lightweight Grad-CAM using raw PyTorch forward/backward hooks.
    No pytorch-grad-cam / matplotlib / ttach dependency needed.
    """

    image = image.convert("RGB")
    resized = image.resize((224, 224))
    rgb_image = np.array(resized).astype(np.float32) / 255.0

    input_tensor = transform(image).unsqueeze(0).to(device) # type: ignore
    input_tensor.requires_grad_(True)

    activations = {}
    gradients = {}

    target_layer = model.layer4[-1]

    def forward_hook(module, inp, out):
        activations["value"] = out

    def backward_hook(module, grad_in, grad_out):
        gradients["value"] = grad_out[0]

    fh = target_layer.register_forward_hook(forward_hook)
    bh = target_layer.register_full_backward_hook(backward_hook)

    try:
        model.zero_grad(set_to_none=True)
        output = model(input_tensor)
        score = output[0, predicted_class]
        score.backward()

        acts = activations["value"].detach()[0]   # (C, H, W)
        grads = gradients["value"].detach()[0]     # (C, H, W)

        weights = grads.mean(dim=(1, 2))            # (C,)
        cam = torch.zeros(acts.shape[1:], dtype=torch.float32)

        for i, w in enumerate(weights):
            cam += w * acts[i]

        cam = F.relu(cam)
        cam = cam / (cam.max() + 1e-8)
        cam = cam.cpu().numpy()

    finally:
        fh.remove()
        bh.remove()
        model.zero_grad(set_to_none=True)

    cam_resized = cv2.resize(cam, (224, 224))

    heatmap = cv2.applyColorMap(
        np.uint8(255 * cam_resized),
        cv2.COLORMAP_JET
    )
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)

    overlay = (
        0.5 * heatmap.astype(np.float32)
        + 0.5 * (rgb_image * 255)
    ).astype(np.uint8)

    combined = np.hstack([
        np.array(resized),
        heatmap,
        overlay
    ])

    success, encoded = cv2.imencode(
        ".jpg",
        cv2.cvtColor(combined, cv2.COLOR_RGB2BGR)
    )

    if not success:
        raise RuntimeError("Failed to encode Grad-CAM image")

    return encoded.tobytes()
