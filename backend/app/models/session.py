from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class StrongMatch(BaseModel):
    skill: str
    resume_level: str | None = None
    jd_requirement: str | None = None
    match_quality: str | None = "high"

    model_config = ConfigDict(extra="ignore")


class PartialMatch(BaseModel):
    skill: str
    resume_level: str | None = None
    jd_requirement: str | None = None
    gap_description: str | None = None

    model_config = ConfigDict(extra="ignore")


class GapItem(BaseModel):
    skill: str
    jd_requirement: str | None = None
    importance: str | None = "must_have"
    preparation_suggestion: str | None = None

    model_config = ConfigDict(extra="ignore")


class PreparationPriority(BaseModel):
    topic: str
    priority: Any = 1
    estimated_prep_time: str | None = None
    reason: str | None = None

    model_config = ConfigDict(extra="ignore")


class SkillGapAnalysis(BaseModel):
    """Detailed skill comparison between resume and job description."""

    overall_match_percentage: float = 0.0
    strong_matches: list[Any] = Field(default_factory=list)
    partial_matches: list[Any] = Field(default_factory=list)
    gaps: list[Any] = Field(default_factory=list)
    preparation_priorities: list[Any] = Field(default_factory=list)
    bonus_skills: list[Any] = Field(default_factory=list)
    category_scores: dict[str, float] = Field(default_factory=dict)

    model_config = ConfigDict(extra="ignore")

    @classmethod
    def from_flexible(cls, data: Any) -> "SkillGapAnalysis":
        if not isinstance(data, dict):
            return cls()
        match_pct = data.get("overall_match_percentage") or data.get("match_percentage") or 0.0
        try:
            match_pct = float(str(match_pct).replace("%", "").strip())
        except Exception:
            match_pct = 0.0
        return cls(
            overall_match_percentage=match_pct,
            strong_matches=data.get("strong_matches") or data.get("matching_skills") or [],
            partial_matches=data.get("partial_matches") or [],
            gaps=data.get("gaps") or data.get("missing_skills") or [],
            preparation_priorities=data.get("preparation_priorities") or [],
            bonus_skills=data.get("bonus_skills") or [],
            category_scores=data.get("category_scores") or {},
        )


class SessionCreateRequest(BaseModel):
    """Payload to create a new interview preparation session."""

    resume_id: str = Field(..., description="ID of the uploaded resume document")
    jd_id: str = Field(..., description="ID of the uploaded or pasted job description document")


class InterviewSessionDB(BaseModel):
    """MongoDB document representation for an interview preparation session."""

    id: str | None = Field(default=None, alias="_id")
    user_id: str
    resume_id: str
    jd_id: str
    skill_gap_analysis: SkillGapAnalysis
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "gap_analyzed"

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
