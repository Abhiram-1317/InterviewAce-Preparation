from pydantic import BaseModel, Field


class AnalyticsOverview(BaseModel):
    """Aggregated preparation statistics and readiness metrics for a user."""

    total_sessions: int = Field(default=0, description="Total number of completed practice sessions")
    total_questions_practiced: int = Field(default=0, description="Total count of questions attempted across all sessions")
    average_overall_score: float = Field(default=0.0, description="Average overall score across all completed sessions")
    readiness_trend: str = Field(default="Stable", description="Readiness score trajectory: 'Improving', 'Declining', or 'Stable'")
