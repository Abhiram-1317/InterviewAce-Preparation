from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class PracticeSessionCreate(BaseModel):
    """Payload to start a new practice session."""

    interview_session_id: str = Field(..., description="ID of the interview session with generated questions")
    practice_type: str = Field(default="quick", description="Practice type: quick, full, category_focus, weak_areas")


class StudentAnswerSubmit(BaseModel):
    """Payload for submitting a candidate's answer to a practice question."""

    question_id: str = Field(..., description="ID of the question being answered")
    student_answer: str = Field(..., description="Candidate's typed or spoken answer")
    time_taken_seconds: int = Field(default=0, description="Time taken to answer the question in seconds")


class QuestionAttempt(BaseModel):
    """Record of a single question attempt during practice."""

    question_id: str
    question_text: str | None = ""
    category: str | None = ""
    difficulty: str | None = ""
    student_answer: str | None = ""
    time_taken_seconds: int = 0
    was_skipped: bool = False
    evaluation: dict[str, Any] | None = None


class CategoryScores(BaseModel):
    """Category-wise average scores across attempted questions."""

    technical: float = 0.0
    behavioral: float = 0.0
    situational: float = 0.0
    hr: float = 0.0


class SessionSummary(BaseModel):
    """Aggregate summary and qualitative evaluation of a completed practice session."""

    overall_score: float = 0.0
    total_questions: int = 0
    questions_attempted: int = 0
    category_scores: CategoryScores = Field(default_factory=CategoryScores)
    readiness_rating: str = "Needs Practice"
    top_strengths: list[str] = Field(default_factory=list)
    focus_areas: list[str] = Field(default_factory=list)
    personalized_recommendations: list[str] = Field(default_factory=list)


class PracticeSessionDB(BaseModel):
    """MongoDB document representation for a practice session."""

    id: str | None = Field(default=None, alias="_id")
    user_id: str
    interview_session_id: str
    practice_type: str = "quick"
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None
    total_duration_seconds: int = 0
    questions_attempted: list[QuestionAttempt] = Field(default_factory=list)
    session_summary: SessionSummary | dict | None = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
