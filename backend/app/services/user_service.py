from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.database import get_database
from app.models.user import UserCreate, UserResponse
from app.utils.security import hash_password, verify_password


async def get_user_by_email(email: str) -> dict | None:
    """Takes an email string, queries the users collection, returns the user document or None."""
    db = get_database()
    if db is None:
        return None
    user = await db["users"].find_one({"email": email})
    return user


async def create_user(user_data: UserCreate) -> UserResponse:
    """Creates a new user, hashes password, inserts into MongoDB, and returns UserResponse.

    Raises HTTPException 400 if email is already registered.
    """
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    hashed_pwd = hash_password(user_data.password)
    now = datetime.now(timezone.utc)

    user_document = {
        "email": str(user_data.email),
        "full_name": user_data.full_name,
        "hashed_password": hashed_pwd,
        "created_at": now,
    }

    result = await db["users"].insert_one(user_document)

    return UserResponse(
        id=str(result.inserted_id),
        email=user_document["email"],
        full_name=user_document["full_name"],
        created_at=user_document["created_at"],
    )


async def authenticate_user(email: str, password: str) -> dict | None:
    """Authenticates a user by email and password using bcrypt verify.

    Returns the user document if valid, None if invalid.
    """
    user = await get_user_by_email(email)
    if not user:
        return None

    if not verify_password(password, user.get("hashed_password", "")):
        return None

    return user
