import uuid
from typing import Any
from pydantic import BaseModel, Field, field_validator


class QuestionItem(BaseModel):
    """Schema for a single personalized interview question."""

    question_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_text: str
    category: str = Field(..., description="Category: technical, behavioral, situational, or hr")
    difficulty: str = Field(..., description="Difficulty: easy, medium, or hard")
    related_skill: str
    resume_reference: str
    jd_reference: str
    expected_duration_minutes: int = 2
    why_asked: str | None = None
    follow_up_questions: list[str] = Field(default_factory=list)

    @field_validator("question_id", mode="before")
    @classmethod
    def ensure_uuid(cls, v: Any) -> str:
        if not v:
            return str(uuid.uuid4())
        return str(v)

    @field_validator("category", mode="before")
    @classmethod
    def normalize_category(cls, v: Any) -> str:
        if isinstance(v, str):
            v_lower = v.lower()
            if "tech" in v_lower:
                return "technical"
            if "behav" in v_lower:
                return "behavioral"
            if "situat" in v_lower:
                return "situational"
            if "hr" in v_lower or "cultur" in v_lower:
                return "hr"
            return v_lower
        return "technical"

    @field_validator("difficulty", mode="before")
    @classmethod
    def normalize_difficulty(cls, v: Any) -> str:
        if isinstance(v, str):
            v_lower = v.lower()
            if "easy" in v_lower:
                return "easy"
            if "hard" in v_lower:
                return "hard"
            return "medium"
        return "medium"


class QuestionListResponse(BaseModel):
    """Schema for collection of generated interview questions."""

    questions: list[QuestionItem] = Field(default_factory=list)
