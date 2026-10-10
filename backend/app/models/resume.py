from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PersonalInfo(BaseModel):
    """Personal contact information extracted from a resume."""

    name: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedin: str | None = None
    github: str | None = None
    location: str | None = None


class Education(BaseModel):
    """Educational qualification details."""

    degree: str | None = None
    institution: str | None = None
    year: str | None = None
    gpa: Any = None
    relevant_coursework: list[str] = Field(default_factory=list)

    @field_validator("relevant_coursework", mode="before")
    @classmethod
    def normalize_coursework(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        if isinstance(v, list):
            return [str(item).strip() for item in v if item]
        return [str(v)]


class SkillItem(BaseModel):
    """Specific skill with proficiency level."""

    name: str
    level: str | None = "intermediate"

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, v: Any) -> str:
        if isinstance(v, dict):
            return str(v.get("name") or v.get("skill") or v.get("title") or "Skill")
        return str(v) if v is not None else "Skill"


class SkillData(BaseModel):
    """Categorized skill sets extracted from a resume."""

    programming_languages: list[SkillItem] = Field(default_factory=list)
    frameworks: list[SkillItem] = Field(default_factory=list)
    tools: list[SkillItem] = Field(default_factory=list)
    databases: list[SkillItem] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    other: list[str] = Field(default_factory=list)

    @field_validator("programming_languages", "frameworks", "tools", "databases", mode="before")
    @classmethod
    def normalize_skills(cls, v: Any) -> list[Any]:
        if not v:
            return []
        if isinstance(v, str):
            return [SkillItem(name=s.strip()) for s in v.split(",") if s.strip()]
        if not isinstance(v, list):
            return [SkillItem(name=str(v))]
        normalized = []
        for item in v:
            if isinstance(item, str):
                normalized.append(SkillItem(name=item.strip()))
            elif isinstance(item, dict):
                name = item.get("name") or item.get("skill") or item.get("title") or "Skill"
                level = item.get("level") or "intermediate"
                normalized.append(SkillItem(name=str(name), level=str(level)))
            else:
                normalized.append(SkillItem(name=str(item)))
        return normalized

    @field_validator("soft_skills", "other", mode="before")
    @classmethod
    def normalize_strings(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        if not isinstance(v, list):
            return [str(v)]
        normalized = []
        for item in v:
            if isinstance(item, str):
                normalized.append(item.strip())
            elif isinstance(item, dict):
                name = item.get("name") or item.get("skill") or item.get("title") or next(iter(item.values()), "")
                if name:
                    normalized.append(str(name).strip())
            else:
                normalized.append(str(item).strip())
        return [x for x in normalized if x]


class Project(BaseModel):
    """Academic or personal project details."""

    title: str | None = None
    description: str | None = None
    technologies: list[str] = Field(default_factory=list)
    key_achievements: list[str] = Field(default_factory=list)
    duration: str | None = None
    team_size: Any = None
    your_role: str | None = None

    @field_validator("technologies", "key_achievements", mode="before")
    @classmethod
    def normalize_proj_lists(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        if isinstance(v, list):
            res = []
            for item in v:
                if isinstance(item, str):
                    res.append(item.strip())
                elif isinstance(item, dict):
                    res.append(str(item.get("name") or item.get("title") or next(iter(item.values()), "")).strip())
                else:
                    res.append(str(item).strip())
            return [x for x in res if x]
        return [str(v)]


class Experience(BaseModel):
    """Professional work or internship experience."""

    company: str | None = None
    role: str | None = None
    duration: str | None = None
    responsibilities: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    technologies_used: list[str] = Field(default_factory=list)

    @field_validator("responsibilities", "achievements", "technologies_used", mode="before")
    @classmethod
    def normalize_exp_lists(cls, v: Any) -> list[str]:
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
                    res.append(str(item.get("name") or item.get("title") or next(iter(item.values()), "")).strip())
                else:
                    res.append(str(item).strip())
            return [x for x in res if x]
        return [str(v)]


class Certification(BaseModel):
    """Professional certification or license."""

    name: str | None = None
    issuer: str | None = None
    date: str | None = None


class ParsedResumeData(BaseModel):
    """Structured data payload extracted by the AI resume parser."""

    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    education: list[Education] = Field(default_factory=list)
    skills: SkillData = Field(default_factory=SkillData)
    projects: list[Project] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    extracurriculars: list[str] = Field(default_factory=list)

    @field_validator("certifications", mode="before")
    @classmethod
    def normalize_certs(cls, v: Any) -> list[Any]:
        if not v:
            return []
        if isinstance(v, str):
            return [Certification(name=v)]
        if not isinstance(v, list):
            return [Certification(name=str(v))]
        res = []
        for item in v:
            if isinstance(item, str):
                res.append(Certification(name=item))
            elif isinstance(item, dict):
                res.append(Certification(
                    name=item.get("name") or item.get("title") or "Certification",
                    issuer=item.get("issuer"),
                    date=item.get("date"),
                ))
            else:
                res.append(Certification(name=str(item)))
        return res

    @field_validator("achievements", "extracurriculars", mode="before")
    @classmethod
    def normalize_achievements(cls, v: Any) -> list[str]:
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
                    res.append(str(item.get("title") or item.get("name") or next(iter(item.values()), "")).strip())
                else:
                    res.append(str(item).strip())
            return [x for x in res if x]
        return [str(v)]


class ResumeDB(BaseModel):
    """MongoDB document representation for an uploaded and parsed resume."""

    id: str | None = Field(default=None, alias="_id")
    user_id: str
    file_name: str
    file_path: str
    file_type: str | None = None
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_text: str
    parsed_data: ParsedResumeData
    parsing_confidence: float = 1.0
    is_active: bool = True

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
