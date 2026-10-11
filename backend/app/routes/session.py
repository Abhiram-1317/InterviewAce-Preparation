from fastapi import APIRouter, Depends, HTTPException, status

from app.models.session import SessionCreateRequest
from app.services.jd_service import get_jd_by_id
from app.services.resume_service import get_resume_by_id
from app.services.session_service import (
    add_questions_to_session,
    create_interview_session,
    get_session_by_id,
    get_user_sessions,
    save_answer_suggestion,
)
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.utils.llm import (
    analyze_skill_gaps,
    generate_answer_suggestion,
    generate_interview_questions,
)

session_router = APIRouter(
    prefix="/api/v1/session",
    tags=["Session"],
    dependencies=[Depends(get_optional_current_user)],
)


@session_router.get("/user/all")
async def get_all_user_sessions(current_user: dict = Depends(get_current_user)):
    """Retrieve all saved interview preparation sessions for the current user."""
    user_id = str(current_user["id"])
    sessions = await get_user_sessions(user_id)
    return {"sessions": sessions}


@session_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreateRequest,
    current_user: dict = Depends(get_optional_current_user),
):
    """Create a new interview preparation session and execute skill gap analysis."""
    user_id = str(current_user["id"])

    # 1. Fetch resume document
    resume = await get_resume_by_id(payload.resume_id)
    if not resume:
        resume = {"parsed_data": {}}

    # 2. Fetch job description document
    jd = await get_jd_by_id(payload.jd_id)
    if not jd:
        jd = {"parsed_data": {}}

    # 3. Analyze skill gaps between resume and JD
    try:
        gap_data = await analyze_skill_gaps(
            parsed_resume=resume.get("parsed_data", {}),
            parsed_jd=jd.get("parsed_data", {}),
        )
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"Skill gap analysis warning: {exc}")
        gap_data = {}

    # 4. Create and persist session document in MongoDB
    session_id = await create_interview_session(
        user_id=user_id,
        resume_id=payload.resume_id,
        jd_id=payload.jd_id,
        gap_analysis_data=gap_data,
    )

    return {
        "message": "Session created",
        "session_id": session_id,
        "skill_gap_analysis": gap_data,
    }


@session_router.post("/{session_id}/generate-questions")
async def generate_questions_for_session(
    session_id: str,
    current_user: dict = Depends(get_optional_current_user),
):
    """Generate 15 personalized interview questions for an interview preparation session."""
    user_id = str(current_user["id"])

    # 1. Fetch session and verify ownership
    session = await get_session_by_id(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview session '{session_id}' not found",
        )

    # 2. Extract references
    resume_id = session.get("resume_id")
    jd_id = session.get("jd_id")
    gap_analysis = session.get("skill_gap_analysis", {})

    # 3. Fetch linked resume and JD documents
    resume = await get_resume_by_id(resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated resume '{resume_id}' not found",
        )

    jd = await get_jd_by_id(jd_id)
    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated job description '{jd_id}' not found",
        )

    parsed_resume = resume.get("parsed_data", {})
    parsed_jd = jd.get("parsed_data", {})

    # 4. Generate tailored questions via AI
    questions = await generate_interview_questions(
        parsed_resume=parsed_resume,
        parsed_jd=parsed_jd,
        gap_analysis=gap_analysis,
    )

    # 5. Save generated questions into the session document
    await add_questions_to_session(session_id=session_id, questions=questions)

    return {
        "message": "Questions generated successfully",
        "questions": questions,
    }


@session_router.get("/{session_id}/questions/{question_id}/answer")
async def get_answer_suggestion(
    session_id: str,
    question_id: str,
    current_user: dict = Depends(get_optional_current_user),
):
    """Generate or retrieve a cached AI answer suggestion for a specific interview question."""
    user_id = str(current_user["id"])

    # 1. Fetch session and verify ownership
    session = await get_session_by_id(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview session '{session_id}' not found",
        )

    # 2. Find the specific question in the session's generated_questions array
    questions = session.get("generated_questions", [])
    target_question = None
    for q in questions:
        if q.get("question_id") == question_id:
            target_question = q
            break

    if not target_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{question_id}' not found in session '{session_id}'",
        )

    # 3. Check cache — if answer already exists, return immediately
    existing_answer = target_question.get("suggested_answer")
    if existing_answer:
        return {
            "message": "Answer retrieved from cache",
            "suggested_answer": existing_answer,
        }

    # 4. Fetch resume and JD for LLM context
    resume = await get_resume_by_id(session.get("resume_id"))
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resume not found",
        )

    jd = await get_jd_by_id(session.get("jd_id"))
    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated job description not found",
        )

    # 5. Generate answer via LLM
    answer_data = await generate_answer_suggestion(
        question_text=target_question.get("question_text", ""),
        category=target_question.get("category", "technical"),
        parsed_resume=resume.get("parsed_data", {}),
        parsed_jd=jd.get("parsed_data", {}),
        related_skill=target_question.get("related_skill", ""),
    )

    # 6. Persist to database
    await save_answer_suggestion(
        session_id=session_id,
        question_id=question_id,
        answer_data=answer_data,
    )

    return {
        "message": "Answer generated successfully",
        "suggested_answer": answer_data,
    }

