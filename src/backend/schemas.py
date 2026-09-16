from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True