import os
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.config import settings
from app.services.jd_service import save_jd_to_db
from app.utils.dependencies import get_optional_current_user
from app.utils.file_handler import ALLOWED_EXTENSIONS, process_uploaded_file, save_upload_file
from app.utils.llm import parse_jd_with_llm

jd_router = APIRouter(
    prefix="/api/v1/jd",
    tags=["Job Description"],
    dependencies=[Depends(get_optional_current_user)],
)



class JDPasteRequest(BaseModel):
    raw_text: str = Field(..., description="Raw text of the job description", min_length=1)
    job_title: str | None = None
    company_name: str | None = None


@jd_router.post("/upload")
async def upload_jd(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_optional_current_user),
):
    """Upload a job description file (PDF or DOCX), extract text, parse with AI, and persist to MongoDB."""
    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext or 'unknown'}. Only PDF (.pdf) and DOCX (.docx) files are allowed.",
        )

    file_path = await save_upload_file(file, settings.UPLOAD_DIR)
    raw_text = process_uploaded_file(file_path, filename)

    try:
        parsed_data = await parse_jd_with_llm(raw_text)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"JD LLM parsing warning: {exc}")
        parsed_data = {}

    user_id = str(current_user["id"])
    try:
        jd_id = await save_jd_to_db(
            user_id=user_id,
            raw_text=raw_text,
            parsed_data=parsed_data,
            file_name=filename,
            input_method="upload",
        )
    except Exception as exc:
        import logging, uuid
        logging.getLogger(__name__).warning(f"JD DB persistence warning: {exc}")
        jd_id = "temp_jd_" + uuid.uuid4().hex[:8]

    return {
        "message": "JD parsed",
        "jd_id": jd_id,
        "parsed_data": parsed_data,
    }


@jd_router.post("/paste")
async def paste_jd(
    jd_data: JDPasteRequest,
    current_user: dict = Depends(get_optional_current_user),
):
    """Submit raw text job description, parse with AI, and persist to MongoDB."""
    raw_text = jd_data.raw_text
    try:
        parsed_data = await parse_jd_with_llm(raw_text)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"JD LLM parsing warning: {exc}")
        parsed_data = {}

    if isinstance(parsed_data, dict):
        if jd_data.job_title:
            parsed_data["job_title"] = jd_data.job_title
        if jd_data.company_name:
            parsed_data["company_name"] = jd_data.company_name

    user_id = str(current_user["id"])
    try:
        jd_id = await save_jd_to_db(
            user_id=user_id,
            raw_text=raw_text,
            parsed_data=parsed_data,
            input_method="paste",
        )
    except Exception as exc:
        import logging, uuid
        logging.getLogger(__name__).warning(f"JD DB persistence warning: {exc}")
        jd_id = "temp_jd_" + uuid.uuid4().hex[:8]

    return {
        "message": "JD parsed",
        "jd_id": jd_id,
        "parsed_data": parsed_data,
    }
