from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.models.practice import (
    CategoryScores,
    PracticeSessionCreate,
    SessionSummary,
    StudentAnswerSubmit,
)
from app.services.jd_service import get_jd_by_id
from app.services.practice_service import (
    add_evaluated_answer,
    add_skipped_question,
    complete_practice_session,
    get_practice_session,
    start_practice_session,
)
from app.services.resume_service import get_resume_by_id
from app.services.session_service import get_session_by_id, save_answer_suggestion
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.utils.llm import (
    evaluate_practice_answer,
    generate_answer_suggestion,
    generate_qualitative_summary,
)

practice_router = APIRouter(
    prefix="/api/v1/practice",
    tags=["Practice"],
    dependencies=[Depends(get_optional_current_user)],
)


class SkipRequest(BaseModel):
    question_id: str = Field(..., description="ID of the question to skip")


@practice_router.post("/start")
async def start_practice(
    payload: PracticeSessionCreate,
    current_user: dict = Depends(get_optional_current_user),
):
    """Start a new practice session linked to an existing interview session."""
    user_id = str(current_user["id"])

    # Verify the interview session exists
    interview_session = await get_session_by_id(payload.interview_session_id)
    if not interview_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview session '{payload.interview_session_id}' not found",
        )

    # Ensure questions have been generated
    if not interview_session.get("generated_questions"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview session has no generated questions. Generate questions first.",
        )

    practice_id = await start_practice_session(user_id=user_id, data=payload)

    return {
        "message": "Practice started",
        "practice_id": practice_id,
    }


@practice_router.get("/{practice_id}/next")
async def get_next_question(
    practice_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get the next unattempted question in the practice session."""
    user_id = str(current_user["id"])

    # 1. Fetch practice session and verify ownership
    practice = await get_practice_session(practice_id)
    if not practice or str(practice.get("user_id")) != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice session '{practice_id}' not found",
        )

    # 2. Check if already completed
    if practice.get("completed_at"):
        return {"message": "Session complete", "completed": True}

    # 3. Fetch the linked interview session to get all generated questions
    interview_session = await get_session_by_id(practice.get("interview_session_id"))
    if not interview_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Linked interview session not found",
        )

    all_questions = interview_session.get("generated_questions", [])

    # 4. Determine which questions have already been attempted
    attempted_ids = {
        attempt.get("question_id")
        for attempt in practice.get("questions_attempted", [])
    }

    # 5. Find the first unattempted question
    next_question = None
    for q in all_questions:
        if q.get("question_id") not in attempted_ids:
            next_question = q
            break

    if next_question is None:
        return {"message": "Session complete", "completed": True}

    return {
        "message": "Next question fetched",
        "question": next_question,
        "progress": {
            "attempted": len(attempted_ids),
            "total": len(all_questions),
        },
    }


@practice_router.post("/{practice_id}/skip")
async def skip_question(
    practice_id: str,
    payload: SkipRequest,
    current_user: dict = Depends(get_optional_current_user),
):
    """Skip a question in the practice session."""
    user_id = str(current_user["id"])

    # 1. Fetch practice session
    practice = await get_practice_session(practice_id)
    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice session '{practice_id}' not found",
        )

    # 2. Look up the question details from the interview session
    interview_session = await get_session_by_id(practice.get("interview_session_id"))
    question_text = ""
    category = ""
    difficulty = ""
    if interview_session:
        for q in interview_session.get("generated_questions", []):
            if q.get("question_id") == payload.question_id:
                question_text = q.get("question_text", "")
                category = q.get("category", "")
                difficulty = q.get("difficulty", "")
                break

    # 3. Record the skip
    await add_skipped_question(
        practice_id=practice_id,
        question_id=payload.question_id,
        question_text=question_text,
        category=category,
        difficulty=difficulty,
    )

    return {"message": "Question skipped"}


@practice_router.post("/{practice_id}/submit")
async def submit_answer(
    practice_id: str,
    payload: StudentAnswerSubmit,
    current_user: dict = Depends(get_optional_current_user),
):
    """Submit a student's answer for real-time AI evaluation and scoring."""
    user_id = str(current_user["id"])

    # 1. Fetch practice session
    practice = await get_practice_session(practice_id)
    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice session '{practice_id}' not found",
        )

    # 2. Fetch linked interview session
    interview_session_id = practice.get("interview_session_id")
    interview_session = await get_session_by_id(interview_session_id)
    if not interview_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Linked interview session not found",
        )

    # Find the target question in generated_questions
    target_question = None
    for q in interview_session.get("generated_questions", []):
        if q.get("question_id") == payload.question_id:
            target_question = q
            break

    if not target_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{payload.question_id}' not found in interview session",
        )

    # 3. Fetch linked resume and JD
    resume = await get_resume_by_id(interview_session.get("resume_id"))
    jd = await get_jd_by_id(interview_session.get("jd_id"))

    # 4. Ensure expected answer suggestion exists (generate on demand if missing)
    expected_answer = target_question.get("suggested_answer")
    if not expected_answer:
        expected_answer = await generate_answer_suggestion(
            question_text=target_question.get("question_text", ""),
            category=target_question.get("category", "technical"),
            parsed_resume=resume.get("parsed_data", {}) if resume else {},
            parsed_jd=jd.get("parsed_data", {}) if jd else {},
            related_skill=target_question.get("related_skill", ""),
        )
        # Cache the generated suggested answer into the interview session
        await save_answer_suggestion(
            session_id=str(interview_session["id"]),
            question_id=payload.question_id,
            answer_data=expected_answer,
        )

    # 5. Format candidate background summary from parsed resume
    candidate_background = ""
    if resume and resume.get("parsed_data"):
        p_data = resume["parsed_data"]
        personal = p_data.get("personal_info", {})
        skills = p_data.get("skills", {})
        tech_skills = skills.get("technical_skills", [])
        if isinstance(tech_skills, list):
            skill_names = [s.get("name") if isinstance(s, dict) else str(s) for s in tech_skills[:10]]
        else:
            skill_names = []
        experiences = p_data.get("experience", [])
        exp_summary = []
        for exp in experiences[:3]:
            if isinstance(exp, dict):
                exp_summary.append(f"{exp.get('title', '')} at {exp.get('company', '')}")
        projects = p_data.get("projects", [])
        proj_summary = []
        for proj in projects[:3]:
            if isinstance(proj, dict):
                proj_summary.append(f"{proj.get('title', '')}: {proj.get('technologies', '')}")

        candidate_background = (
            f"Name: {personal.get('full_name', '')}\n"
            f"Key Skills: {', '.join(skill_names)}\n"
            f"Experience: {'; '.join(exp_summary)}\n"
            f"Key Projects: {'; '.join(proj_summary)}"
        )

    # 6. Call AI evaluation engine
    evaluation_result = await evaluate_practice_answer(
        question_text=target_question.get("question_text", ""),
        expected_answer_data=expected_answer,
        student_answer=payload.student_answer,
        candidate_background=candidate_background,
    )

    # 7. Construct question attempt data
    question_attempt_data = {
        "question_id": payload.question_id,
        "question_text": target_question.get("question_text", ""),
        "category": target_question.get("category", ""),
        "difficulty": target_question.get("difficulty", ""),
        "student_answer": payload.student_answer,
        "time_taken_seconds": payload.time_taken_seconds,
        "was_skipped": False,
        "evaluation": evaluation_result,
    }

    # 8. Save attempt in MongoDB practice_sessions collection
    await add_evaluated_answer(
        practice_id=practice_id,
        question_attempt_data=question_attempt_data,
    )

    return {
        "message": "Answer evaluated",
        "evaluation": evaluation_result,
    }


@practice_router.post("/{practice_id}/complete")
async def complete_session(
    practice_id: str,
    current_user: dict = Depends(get_optional_current_user),
):
    """Complete a practice session, calculating aggregate metrics and generating qualitative insights."""
    user_id = str(current_user["id"])

    # 1. Fetch practice session
    practice = await get_practice_session(practice_id)
    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice session '{practice_id}' not found",
        )

    # Fetch linked interview session to get total question count
    interview_session = await get_session_by_id(practice.get("interview_session_id"))
    total_questions = len(interview_session.get("generated_questions", [])) if interview_session else 0

    # 2. Calculate numeric metrics in Python
    questions_attempted_list = practice.get("questions_attempted", [])
    questions_attempted_count = len(questions_attempted_list)
    if total_questions == 0:
        total_questions = questions_attempted_count

    overall_scores = []
    category_scores_map = {
        "technical": [],
        "behavioral": [],
        "situational": [],
        "hr": [],
    }
    evaluated_attempts_summary = []
    total_time_taken = 0

    for attempt in questions_attempted_list:
        total_time_taken += attempt.get("time_taken_seconds", 0)
        evaluation = attempt.get("evaluation")
        if evaluation and isinstance(evaluation, dict) and "overall_score" in evaluation:
            score = float(evaluation["overall_score"])
            overall_scores.append(score)

            cat = str(attempt.get("category", "technical")).lower()
            if cat in category_scores_map:
                category_scores_map[cat].append(score)

            evaluated_attempts_summary.append({
                "question_id": attempt.get("question_id"),
                "question_text": attempt.get("question_text"),
                "category": attempt.get("category"),
                "difficulty": attempt.get("difficulty"),
                "student_answer": attempt.get("student_answer"),
                "score": score,
                "strengths": evaluation.get("strengths", []),
                "improvements_needed": evaluation.get("improvements_needed", []),
            })

    overall_score = round(sum(overall_scores) / len(overall_scores), 1) if overall_scores else 0.0

    category_scores_calculated = {}
    for cat, scores in category_scores_map.items():
        category_scores_calculated[cat] = (
            round(sum(scores) / len(scores), 1) if scores else 0.0
        )

    # 3. Determine readiness rating
    if overall_score >= 90:
        readiness_rating = "Interview Ready"
    elif overall_score >= 75:
        readiness_rating = "Almost Ready"
    elif overall_score >= 60:
        readiness_rating = "Needs Practice"
    else:
        readiness_rating = "Significant Preparation Needed"

    # 4. Generate qualitative summary from LLM
    numeric_scores = {
        "overall_score": overall_score,
        "total_questions": total_questions,
        "questions_attempted": questions_attempted_count,
        "category_scores": category_scores_calculated,
        "readiness_rating": readiness_rating,
    }

    qualitative_data = await generate_qualitative_summary(
        evaluations_list=evaluated_attempts_summary,
        numeric_scores=numeric_scores,
    )

    # 5. Merge numeric math and LLM insights into SessionSummary structure
    summary_data = {
        "overall_score": overall_score,
        "total_questions": total_questions,
        "questions_attempted": questions_attempted_count,
        "category_scores": category_scores_calculated,
        "readiness_rating": readiness_rating,
        "top_strengths": qualitative_data.get("top_strengths", []),
        "focus_areas": qualitative_data.get("focus_areas", []),
        "personalized_recommendations": qualitative_data.get("personalized_recommendations", []),
    }

    # 6. Save completed summary to MongoDB
    await complete_practice_session(
        practice_id=practice_id,
        summary_data=summary_data,
        total_duration_seconds=total_time_taken,
    )

    # 7. Return completed session summary
    return {
        "message": "Session completed",
        "summary": summary_data,
    }


@practice_router.get("/{practice_id}/summary")
async def get_session_summary(
    practice_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve the summary and analytics of a completed practice session."""
    user_id = str(current_user["id"])

    practice = await get_practice_session(practice_id)
    if not practice or str(practice.get("user_id")) != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice session '{practice_id}' not found",
        )

    summary = practice.get("session_summary")
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session summary not found. The practice session is not completed yet.",
        )

    return {
        "message": "Session summary retrieved successfully",
        "summary": summary,
    }

