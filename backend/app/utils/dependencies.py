from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.services.user_service import get_user_by_email
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Decodes the JWT token and returns the authenticated user from MongoDB.

    Raises:
        HTTPException 401 if the token is invalid or the user does not exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    email: str | None = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception

    # Return user data without the password hash
    return {
        "_id": user["_id"],
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "created_at": user.get("created_at"),
    }


oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_optional_current_user(token: str | None = Depends(oauth2_scheme_optional)) -> dict:
    """Returns authenticated user if token is present and valid, otherwise fallback anonymous profile."""
    if not token:
        return {"_id": "guest_user", "id": "guest_user", "email": "candidate@interviewace.ai", "full_name": "Candidate"}
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        if email:
            user = await get_user_by_email(email)
            if user:
                return {
                    "_id": user["_id"],
                    "id": str(user["_id"]),
                    "email": user["email"],
                    "full_name": user.get("full_name", ""),
                    "created_at": user.get("created_at"),
                }
    except Exception:
        pass
    return {"_id": "guest_user", "id": "guest_user", "email": "candidate@interviewace.ai", "full_name": "Candidate"}


