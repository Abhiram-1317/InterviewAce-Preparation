from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.models.practice import PracticeSessionCreate, PracticeSessionDB, QuestionAttempt


async def start_practice_session(user_id: str, data: PracticeSessionCreate) -> str:
    """Initializes a new practice session document in MongoDB.

    Args:
        user_id: ID of the authenticated user.
        data: Practice session creation payload with interview_session_id and practice_type.

    Returns:
        The inserted practice session document ID as a string.
    """
    db = get_database()

    session_model = PracticeSessionDB(
        user_id=user_id,
        interview_session_id=data.interview_session_id,
        practice_type=data.practice_type,
        started_at=datetime.now(timezone.utc),
        questions_attempted=[],
    )

    doc = session_model.model_dump(by_alias=True, exclude={"id"})
    result = await db["practice_sessions"].insert_one(doc)
    return str(result.inserted_id)


async def get_practice_session(session_id: str) -> dict | None:
    """Retrieves a practice session document from MongoDB by its ID."""
    db = get_database()
    try:
        obj_id = ObjectId(session_id)
    except Exception:
        return None

    session = await db["practice_sessions"].find_one({"_id": obj_id})
    if session:
        session["id"] = str(session["_id"])
    return session


async def add_skipped_question(
    practice_id: str,
    question_id: str,
    question_text: str = "",
    category: str = "",
    difficulty: str = "",
) -> bool:
    """Pushes a skipped QuestionAttempt into the practice session's questions_attempted array."""
    db = get_database()
    try:
        obj_id = ObjectId(practice_id)
    except Exception:
        return False

    attempt = QuestionAttempt(
        question_id=question_id,
        question_text=question_text,
        category=category,
        difficulty=difficulty,
        student_answer="",
        time_taken_seconds=0,
        was_skipped=True,
    )

    result = await db["practice_sessions"].update_one(
        {"_id": obj_id},
        {
            "$push": {"questions_attempted": attempt.model_dump()},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
    )
    return result.matched_count > 0


async def add_answered_question(
    practice_id: str,
    question_id: str,
    question_text: str,
    category: str,
    difficulty: str,
    student_answer: str,
    time_taken_seconds: int,
    evaluation: dict | None = None,
) -> bool:
    """Pushes an answered QuestionAttempt into the practice session's questions_attempted array."""
    db = get_database()
    try:
        obj_id = ObjectId(practice_id)
    except Exception:
        return False

    attempt = QuestionAttempt(
        question_id=question_id,
        question_text=question_text,
        category=category,
        difficulty=difficulty,
        student_answer=student_answer,
        time_taken_seconds=time_taken_seconds,
        was_skipped=False,
        evaluation=evaluation,
    )

    result = await db["practice_sessions"].update_one(
        {"_id": obj_id},
        {
            "$push": {"questions_attempted": attempt.model_dump()},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
    )
    return result.matched_count > 0


async def add_evaluated_answer(practice_id: str, question_attempt_data: dict) -> bool:
    """Pushes an evaluated question attempt dictionary to the questions_attempted array."""
    db = get_database()
    try:
        obj_id = ObjectId(practice_id)
    except Exception:
        return False

    result = await db["practice_sessions"].update_one(
        {"_id": obj_id},
        {
            "$push": {"questions_attempted": question_attempt_data},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
    )
    return result.matched_count > 0


async def complete_practice_session(
    practice_id: str,
    summary_data: dict,
    total_duration_seconds: int = 0,
) -> bool:
    """Marks a practice session as completed and stores the session summary."""
    db = get_database()
    try:
        obj_id = ObjectId(practice_id)
    except Exception:
        return False

    update_fields = {
        "completed_at": datetime.now(timezone.utc),
        "session_summary": summary_data,
        "updated_at": datetime.now(timezone.utc),
    }
    if total_duration_seconds > 0:
        update_fields["total_duration_seconds"] = total_duration_seconds

    result = await db["practice_sessions"].update_one(
        {"_id": obj_id},
        {"$set": update_fields},
    )
    return result.matched_count > 0

