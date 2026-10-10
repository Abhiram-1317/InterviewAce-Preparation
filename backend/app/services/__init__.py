"""InterviewAce Services Package."""

from app.services.analytics_service import get_user_analytics_overview
from app.services.jd_service import get_jd_by_id, save_jd_to_db
from app.services.practice_service import (
    add_answered_question,
    add_evaluated_answer,
    add_skipped_question,
    complete_practice_session,
    get_practice_session,
    start_practice_session,
)
from app.services.resume_service import get_resume_by_id, save_resume_to_db
from app.services.session_service import (
    add_questions_to_session,
    create_interview_session,
    get_session_by_id,
    save_answer_suggestion,
)
from app.services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
)

__all__ = [
    "authenticate_user",
    "create_user",
    "get_user_by_email",
    "save_resume_to_db",
    "get_resume_by_id",
    "save_jd_to_db",
    "get_jd_by_id",
    "create_interview_session",
    "get_session_by_id",
    "add_questions_to_session",
    "save_answer_suggestion",
    "start_practice_session",
    "get_practice_session",
    "add_skipped_question",
    "add_answered_question",
    "add_evaluated_answer",
    "complete_practice_session",
    "get_user_analytics_overview",
]
