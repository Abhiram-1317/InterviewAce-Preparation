"""InterviewAce Routes Package."""

from app.routes.analytics import analytics_router
from app.routes.auth import auth_router
from app.routes.jd import jd_router
from app.routes.practice import practice_router
from app.routes.resume import resume_router
from app.routes.session import session_router

__all__ = [
    "auth_router",
    "resume_router",
    "jd_router",
    "session_router",
    "practice_router",
    "analytics_router",
]
