from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field, field_validator


class SkillRequirement(BaseModel):
    """Skill requirement specification in a job description."""

    name: str = "Skill"
    level: str | None = "intermediate"
    priority: str | None = "must_have"

    model_config = ConfigDict(extra="ignore")

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, v: Any) -> str:
        if isinstance(v, dict):
            return str(v.get("name") or v.get("skill") or v.get("title") or "Skill")
        return str(v) if v else "Skill"


class ParsedJDData(BaseModel):
    """Structured data payload extracted by the AI JD parser."""

    job_title: str | None = None
    company_name: str | None = None
    required_skills: list[Any] = Field(default_factory=list)
    preferred_skills: list[Any] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    role_type: str | None = "technical"
    seniority_level: str | None = "mid"

    model_config = ConfigDict(extra="ignore")

    @field_validator("required_skills", "preferred_skills", mode="before")
    @classmethod
    def normalize_skills(cls, v: Any) -> list[Any]:
        if not isinstance(v, list):
            if isinstance(v, str):
                return [SkillRequirement(name=s.strip()) for s in v.split(",") if s.strip()]
            return []
        normalized = []
        for item in v:
            if isinstance(item, str):
                normalized.append(SkillRequirement(name=item.strip()))
            elif isinstance(item, dict):
                skill_name = item.get("name") or item.get("skill") or item.get("title") or "Skill"
                skill_level = item.get("level") or "intermediate"
                skill_priority = item.get("priority") or "must_have"
                normalized.append(SkillRequirement(name=str(skill_name), level=str(skill_level), priority=str(skill_priority)))
            else:
                normalized.append(SkillRequirement(name=str(item)))
        return normalized

    @field_validator("responsibilities", mode="before")
    @classmethod
    def normalize_responsibilities(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            return [s.strip() for s in v.split("\n") if s.strip()]
        if isinstance(v, list):
            res = []
            for item in v:
                if isinstance(item, str):
                    res.append(item.strip())
                elif isinstance(item, dict):
                    res.append(str(item.get("description") or item.get("text") or next(iter(item.values()), "")).strip())
                else:
                    res.append(str(item).strip())
            return [x for x in res if x]
        return [str(v)]


class JobDescriptionDB(BaseModel):
    """MongoDB document representation for a stored Job Description."""

    id: str | None = Field(default=None, alias="_id")
    user_id: str
    raw_text: str
    parsed_data: ParsedJDData
    title: str | None = None
    company: str | None = None
    file_name: str | None = None
    input_method: str = "paste"
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
