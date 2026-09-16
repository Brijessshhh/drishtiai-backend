from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from src.backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patients = relationship(
        "Patient",
        back_populates="created_by"
    )


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_code = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)

    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    created_by = relationship(
        "User",
        back_populates="patients"
    )

    assessments = relationship(
        "Assessment",
        back_populates="patient",
        cascade="all, delete-orphan"
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    filename = Column(String, nullable=True)

    grade = Column(Integer, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="assessments"
    )