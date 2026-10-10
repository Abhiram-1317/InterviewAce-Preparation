from pydantic import BaseModel, Field


class AnswerFramework(BaseModel):
    """Structured answer framework with opening, evidence, and conclusion."""

    opening: str | None = None
    core_content: list[str] = Field(default_factory=list)
    evidence_from_resume: str | None = None
    connection_to_role: str | None = None
    conclusion: str | None = None


class STARFormat(BaseModel):
    """STAR interview answer format for behavioral questions."""

    situation: str | None = None
    task: str | None = None
    action: str | None = None
    result: str | None = None


class AnswerSuggestion(BaseModel):
    """Complete AI-generated answer suggestion for an interview question."""

    answer_framework: AnswerFramework = Field(default_factory=AnswerFramework)
    star_format: STARFormat | None = None
    full_sample_answer: str | None = None
    key_points_to_hit: list[str] = Field(default_factory=list)
    power_phrases_to_use: list[str] = Field(default_factory=list)
    common_mistakes_to_avoid: list[str] = Field(default_factory=list)
    how_interviewer_will_judge: str | None = None
    follow_up_preparation: list[str] = Field(default_factory=list)
