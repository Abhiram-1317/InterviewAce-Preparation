from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models.user import UserCreate, UserLogin, UserResponse
from app.services.user_service import authenticate_user, create_user
from app.utils.dependencies import get_current_user
from app.utils.security import create_access_token

auth_router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Auth"],
)


@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user account.

    Accepts email, password, and full_name. Returns the created user profile.
    """
    created_user = await create_user(user_data)
    return created_user


@auth_router.post("/login")
async def login(request: Request):
    """Authenticate user and return a JWT access token.

    Accepts both JSON payloads ({ "email": "...", "password": "..." })
    and standard form-encoded data (username and password).
    """
    content_type = request.headers.get("content-type", "")
    email = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed JSON body",
            )
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed form data",
            )

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password are required.",
        )

    user = await authenticate_user(email.strip(), password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user.get("full_name", ""),
        },
    }


@auth_router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile. Requires a valid JWT token."""
    return {
        "id": current_user.get("id") or str(current_user.get("_id", "")),
        "email": current_user.get("email"),
        "full_name": current_user.get("full_name", ""),
        "created_at": current_user.get("created_at"),
    }

