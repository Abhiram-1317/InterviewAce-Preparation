import os
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.models.resume import ParsedResumeData, ResumeDB


async def save_resume_to_db(
    user_id: str,
    file_name: str,
    file_path: str,
    raw_text: str,
    parsed_data: dict,
) -> str:
    """Saves parsed resume information into the MongoDB resumes collection.

    Args:
        user_id: The ID of the authenticated user.
        file_name: Original filename of the uploaded resume.
        file_path: Saved file path on server storage.
        raw_text: Extracted raw text.
        parsed_data: Structured resume dictionary from the LLM.

    Returns:
        The string representation of the inserted MongoDB document ID.
    """
    db = get_database()
    _, ext = os.path.splitext(file_name)
    file_type = ext.lstrip(".").lower() if ext else "unknown"

    # Validate structured data with Pydantic safely
    try:
        parsed_model = ParsedResumeData.model_validate(parsed_data)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"Resume validation warning: {exc}. Attempting flexible recovery.")
        try:
            # Fallback with empty/default attributes if LLM returned mismatched structure
            clean_data = {
                "personal_info": parsed_data.get("personal_info") if isinstance(parsed_data.get("personal_info"), dict) else {},
                "education": parsed_data.get("education") if isinstance(parsed_data.get("education"), list) else [],
                "skills": parsed_data.get("skills") if isinstance(parsed_data.get("skills"), dict) else {},
                "projects": parsed_data.get("projects") if isinstance(parsed_data.get("projects"), list) else [],
                "experience": parsed_data.get("experience") if isinstance(parsed_data.get("experience"), list) else [],
                "certifications": parsed_data.get("certifications") if isinstance(parsed_data.get("certifications"), list) else [],
                "achievements": parsed_data.get("achievements") if isinstance(parsed_data.get("achievements"), list) else [],
            }
            parsed_model = ParsedResumeData.model_validate(clean_data)
        except Exception:
            parsed_model = ParsedResumeData()

    resume_db_model = ResumeDB(
        user_id=user_id,
        file_name=file_name,
        file_path=file_path,
        file_type=file_type,
        upload_date=datetime.now(timezone.utc),
        raw_text=raw_text,
        parsed_data=parsed_model,
        parsing_confidence=1.0,
        is_active=True,
    )

    doc = resume_db_model.model_dump(by_alias=True, exclude={"id"})
    result = await db["resumes"].insert_one(doc)
    return str(result.inserted_id)


async def get_resume_by_id(resume_id: str, user_id: str | None = None) -> dict | None:
    """Retrieves a resume document from MongoDB by its ID."""
    db = get_database()
    try:
        obj_id = ObjectId(resume_id)
    except Exception:
        return None

    query = {"_id": obj_id}
    if user_id:
        query["user_id"] = user_id

    resume = await db["resumes"].find_one(query)
    if resume:
        resume["id"] = str(resume["_id"])
    return resume
