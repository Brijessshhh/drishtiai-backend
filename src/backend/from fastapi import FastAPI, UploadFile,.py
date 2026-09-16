from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
from io import BytesIO
import base64

from src.backend.predictor import predict_image
from src.explainability.gradcam import generate_gradcam

app = FastAPI(
    title="DrishtiAI",
    description="AI-powered Diabetic Retinopathy Analysis API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "DrishtiAI Backend is running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG or PNG retinal image."
        )

    try:
        contents = await file.read()

        image = Image.open(
            BytesIO(contents)
        ).convert("RGB")

        result = predict_image(image)

        gradcam_bytes = generate_gradcam(
            image,
            result["grade"]
        )

        gradcam_base64 = base64.b64encode(
            gradcam_bytes
        ).decode("utf-8")

        return {
            "success": True,
            "filename": file.filename,
            "grade": result["grade"],
            "severity": result["severity"],
            "confidence": result["confidence"],
            "gradcam_image": (
                "data:image/jpeg;base64,"
                + gradcam_base64
            )
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )