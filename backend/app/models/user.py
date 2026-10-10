from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    """Schema for user registration request."""

    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=1, description="User's full name")


class UserLogin(BaseModel):
    """Schema for user login request."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public user response schema returned to clients (never exposes password hash)."""

    id: str
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserInDB(UserResponse):
    """Internal user model including stored hashed password."""

    hashed_password: str
