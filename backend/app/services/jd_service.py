from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.models.jd import JobDescriptionDB, ParsedJDData


async def save_jd_to_db(
    user_id: str,
    raw_text: str,
    parsed_data: dict,
    file_name: str | None = None,
    input_method: str = "paste",
) -> str:
    """Inserts a structured job description into MongoDB job_descriptions collection.

    Args:
        user_id: ID of the authenticated user.
        raw_text: Original plain text of the job description.
        parsed_data: Structured JD dictionary from the LLM.
        file_name: Optional original filename if uploaded.
        input_method: "upload" or "paste".

    Returns:
        The inserted document's ID string.
    """
    db = get_database()
    try:
        parsed_model = ParsedJDData.model_validate(parsed_data)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"JD validation warning: {exc}. Attempting flexible recovery.")
        try:
            clean_data = {
                "job_title": parsed_data.get("job_title"),
                "company_name": parsed_data.get("company_name"),
                "required_skills": parsed_data.get("required_skills") if isinstance(parsed_data.get("required_skills"), list) else [],
                "preferred_skills": parsed_data.get("preferred_skills") if isinstance(parsed_data.get("preferred_skills"), list) else [],
                "responsibilities": parsed_data.get("responsibilities") if isinstance(parsed_data.get("responsibilities"), list) else [],
            }
            parsed_model = ParsedJDData.model_validate(clean_data)
        except Exception:
            parsed_model = ParsedJDData()

    jd_db_model = JobDescriptionDB(
        user_id=user_id,
        raw_text=raw_text,
        parsed_data=parsed_model,
        title=parsed_model.job_title,
        company=parsed_model.company_name,
        file_name=file_name,
        input_method=input_method,
        upload_date=datetime.now(timezone.utc),
        is_active=True,
    )

    doc = jd_db_model.model_dump(by_alias=True, exclude={"id"})
    result = await db["job_descriptions"].insert_one(doc)
    return str(result.inserted_id)


async def get_jd_by_id(jd_id: str, user_id: str | None = None) -> dict | None:
    """Fetches a job description document from MongoDB by its ID."""
    db = get_database()
    try:
        obj_id = ObjectId(jd_id)
    except Exception:
        return None

    query = {"_id": obj_id}
    if user_id:
        query["user_id"] = user_id

    jd = await db["job_descriptions"].find_one(query)
    if jd:
        jd["id"] = str(jd["_id"])
    return jd
