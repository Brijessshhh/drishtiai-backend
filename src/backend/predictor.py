import torch
from PIL import Image
from torchvision import transforms

from src.training.model import create_model

device = torch.device("cpu")

MODEL_PATH = "models/focal_best_model.pth"

model = create_model(num_classes=5)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)
model.eval()

print("✅ DrishtiAI model loaded")
print(f"Device: {device}")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

GRADE_LABELS = {
    0: "No Diabetic Retinopathy",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative"
}

def predict_image(image: Image.Image):
    image = image.convert("RGB")

    tensor = transform(image)
    tensor = tensor.unsqueeze(0).to(device) # type: ignore

    with torch.no_grad():
        outputs = model(tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    grade = int(prediction.item())
    confidence = float(confidence.item())

    return {
        "grade": grade,
        "severity": GRADE_LABELS[grade],
        "confidence": round(confidence * 100, 2)
    }