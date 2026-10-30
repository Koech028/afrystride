from pydantic import BaseModel, EmailStr


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "admin"  # admin | super_admin


class AdminResponse(BaseModel):
    id: str
    email: str
    role: str
    last_login: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str