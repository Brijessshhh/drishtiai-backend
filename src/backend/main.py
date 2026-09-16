from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from PIL import Image
from io import BytesIO
from datetime import datetime
import base64

from src.backend.predictor import predict_image, model, device
from src.explainability.gradcam import generate_gradcam
from src.backend.database import Base, engine, get_db
from src.backend.models import User, Patient, Assessment
from src.backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="DrishtiAI",
    description="AI-powered Diabetic Retinopathy Analysis API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTH
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "DrishtiAI Backend is running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# ============================================================
# AI PREDICTION
# ============================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG or PNG retinal image.",
        )

    try:
        contents = await file.read()

        image = Image.open(
            BytesIO(contents)
        ).convert("RGB")

        result = predict_image(image)

        gradcam_bytes = generate_gradcam(
            image,
            result["grade"],
            model,
            device,
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
            ),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str


class AssessmentCreate(BaseModel):
    patient_id: int
    filename: str | None = None
    grade: int
    severity: str
    confidence: float


# ============================================================
# REGISTER
# ============================================================

@app.post(
    "/auth/register",
    response_model=UserResponse,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == data.email.lower()
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    if not data.full_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Full name is required.",
        )

    user = User(
        full_name=data.full_name.strip(),
        email=data.email.lower(),
        role=data.role,
        password_hash=hash_password(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ============================================================
# LOGIN
# ============================================================

@app.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.email == data.email.lower()
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        data.password,
        user.password_hash,  # type: ignore
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = create_access_token(
        user.id,  # type: ignore
        user.email,  # type: ignore
    )

    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    try:
        user_id = int(payload["sub"])
    except (
        KeyError,
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found.",
        )

    return user


@app.get(
    "/auth/me",
    response_model=UserResponse,
)
def get_me(
    user: User = Depends(get_current_user),
):
    return user


# ============================================================
# CREATE PATIENT
# ============================================================

@app.post("/patients")
def create_patient(
    data: PatientCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if data.age < 1 or data.age > 120:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid patient age.",
        )

    if not data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Patient name is required.",
        )

    if not data.gender.strip():
        raise HTTPException(
            status_code=400,
            detail="Patient gender is required.",
        )

    patient_code = (
        "DR-"
        + datetime.now().strftime(
            "%Y%m%d%H%M%S%f"
        )
    )

    patient = Patient(
        patient_code=patient_code,
        name=data.name.strip(),
        age=data.age,
        gender=data.gender,
        created_by_id=user.id,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {
        "success": True,
        "patient": {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "created_at": patient.created_at,
        },
    }


# ============================================================
# GET ALL PATIENTS
# ============================================================

@app.get("/patients")
def get_patients(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    patients = (
        db.query(Patient)
        .filter(
            Patient.created_by_id == user.id
        )
        .order_by(
            Patient.created_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "patients": [
            {
                "id": patient.id,
                "patient_code": patient.patient_code,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "created_at": patient.created_at,
            }
            for patient in patients
        ],
    }


# ============================================================
# GET SINGLE PATIENT
# ============================================================

@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.created_by_id == user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    return {
        "success": True,
        "patient": {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "created_at": patient.created_at,
            "assessments": [
                {
                    "id": assessment.id,
                    "filename": assessment.filename,
                    "grade": assessment.grade,
                    "severity": assessment.severity,
                    "confidence": assessment.confidence,
                    "created_at": assessment.created_at,
                }
                for assessment in patient.assessments
            ],
        },
    }


# ============================================================
# GET PATIENT ASSESSMENTS
# ============================================================

@app.get("/patients/{patient_id}/assessments")
def get_patient_assessments(
    patient_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.created_by_id == user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    assessments = (
        db.query(Assessment)
        .filter(
            Assessment.patient_id == patient_id
        )
        .order_by(
            Assessment.created_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "patient": {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
        },
        "assessments": [
            {
                "id": assessment.id,
                "patient_id": assessment.patient_id,
                "filename": assessment.filename,
                "grade": assessment.grade,
                "severity": assessment.severity,
                "confidence": assessment.confidence,
                "created_at": assessment.created_at,
            }
            for assessment in assessments
        ],
    }


# ============================================================
# SAVE ASSESSMENT
# ============================================================

@app.post("/assessments")
def create_assessment(
    data: AssessmentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == data.patient_id,
            Patient.created_by_id == user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    if data.grade < 0 or data.grade > 4:
        raise HTTPException(
            status_code=400,
            detail="Invalid diabetic retinopathy grade.",
        )

    if data.confidence < 0 or data.confidence > 100:
        raise HTTPException(
            status_code=400,
            detail="Invalid confidence value.",
        )

    assessment = Assessment(
        patient_id=patient.id,
        filename=data.filename,
        grade=data.grade,
        severity=data.severity,
        confidence=data.confidence,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "success": True,
        "message": "Assessment saved successfully.",
        "assessment": {
            "id": assessment.id,
            "patient_id": assessment.patient_id,
            "filename": assessment.filename,
            "grade": assessment.grade,
            "severity": assessment.severity,
            "confidence": assessment.confidence,
            "created_at": assessment.created_at,
        },
    }
