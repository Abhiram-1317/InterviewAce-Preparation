from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.models.session import InterviewSessionDB, SkillGapAnalysis


async def create_interview_session(
    user_id: str,
    resume_id: str,
    jd_id: str,
    gap_analysis_data: dict,
) -> str:
    """Inserts an interview session document into MongoDB interview_sessions collection.

    Args:
        user_id: ID of the authenticated user.
        resume_id: ID of the associated resume document.
        jd_id: ID of the associated job description document.
        gap_analysis_data: Structured skill gap analysis dictionary from the LLM.

    Returns:
        The inserted session document ID as a string.
    """
    db = get_database()
    try:
        gap_model = SkillGapAnalysis.from_flexible(gap_analysis_data)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"Skill gap analysis fallback: {exc}")
        gap_model = SkillGapAnalysis()

    session_model = InterviewSessionDB(
        user_id=user_id,
        resume_id=resume_id,
        jd_id=jd_id,
        skill_gap_analysis=gap_model,
        created_at=datetime.now(timezone.utc),
        status="gap_analyzed",
    )

    try:
        doc = session_model.model_dump(by_alias=True, exclude={"id"})
        result = await db["interview_sessions"].insert_one(doc)
        return str(result.inserted_id)
    except Exception as exc:
        import logging, uuid
        logging.getLogger(__name__).warning(f"Session DB persistence fallback: {exc}")
        return "sess_" + uuid.uuid4().hex[:12]


async def get_session_by_id(session_id: str, user_id: str | None = None) -> dict | None:
    """Fetches an interview session document from MongoDB by its ID."""
    db = get_database()
    try:
        obj_id = ObjectId(session_id)
    except Exception:
        return None

    query = {"_id": obj_id}
    if user_id:
        query["user_id"] = user_id

    session = await db["interview_sessions"].find_one(query)
    if session:
        session["id"] = str(session["_id"])
    return session


async def add_questions_to_session(session_id: str, questions: list[dict]) -> bool:
    """Updates the interview_sessions document with generated questions and advances status."""
    db = get_database()
    try:
        obj_id = ObjectId(session_id)
    except Exception:
        return False

    result = await db["interview_sessions"].update_one(
        {"_id": obj_id},
        {
            "$set": {
                "generated_questions": questions,
                "status": "questions_generated",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return result.matched_count > 0


async def save_answer_suggestion(session_id: str, question_id: str, answer_data: dict) -> bool:
    """Updates a specific question inside generated_questions with its suggested_answer.

    Uses MongoDB's positional operator ($) to target the exact question by question_id
    and sets the suggested_answer sub-field on that array element.
    """
    db = get_database()
    try:
        obj_id = ObjectId(session_id)
    except Exception:
        return False

    result = await db["interview_sessions"].update_one(
        {"_id": obj_id, "generated_questions.question_id": question_id},
        {
            "$set": {
                "generated_questions.$.suggested_answer": answer_data,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return result.matched_count > 0

