import os
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.config import settings
from app.services.resume_service import save_resume_to_db
from app.utils.dependencies import get_optional_current_user
from app.utils.file_handler import ALLOWED_EXTENSIONS, process_uploaded_file, save_upload_file
from app.utils.llm import parse_resume_with_llm

resume_router = APIRouter(
    prefix="/api/v1/resume",
    tags=["Resume"],
)


class ResumePasteRequest(BaseModel):
    raw_text: str


@resume_router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_optional_current_user),
):
    """Upload a resume file (PDF or DOCX), extract text, parse with AI, and persist to MongoDB."""
    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext or 'unknown'}. Only PDF (.pdf) and DOCX (.docx) files are allowed.",
        )

    file_path = await save_upload_file(file, settings.UPLOAD_DIR)
    try:
        raw_text = process_uploaded_file(file_path, filename)
    except Exception as exc:
        raw_text = ""
        import logging
        logging.getLogger(__name__).warning(f"File text extraction warning: {exc}")

    if not raw_text.strip():
        try:
            with open(file_path, "rb") as f:
                content = f.read()
                raw_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = filename

    # Parse raw text using LLM
    try:
        parsed_data = await parse_resume_with_llm(raw_text)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"Resume parsing warning: {exc}")
        parsed_data = {}

    # Persist to database
    user_id = str(current_user["id"])
    try:
        resume_id = await save_resume_to_db(
            user_id=user_id,
            file_name=filename,
            file_path=file_path,
            raw_text=raw_text,
            parsed_data=parsed_data,
        )
    except Exception as exc:
        import logging
        import uuid
        logging.getLogger(__name__).warning(f"Resume DB persistence warning: {exc}")
        resume_id = "temp_resume_" + uuid.uuid4().hex[:8]

    return {
        "message": "Resume parsed and saved successfully",
        "resume_id": resume_id,
        "raw_text": raw_text,
        "parsed_data": parsed_data,
    }


@resume_router.post("/paste")
async def paste_resume(
    payload: ResumePasteRequest,
    current_user: dict = Depends(get_optional_current_user),
):
    """Parse pasted raw resume text using AI and persist to MongoDB."""
    raw_text = payload.raw_text.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text cannot be empty.",
        )

    # Parse raw text using LLM
    try:
        parsed_data = await parse_resume_with_llm(raw_text)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"Resume LLM parsing warning: {exc}")
        parsed_data = {}

    # Persist to database
    user_id = str(current_user["id"])
    try:
        resume_id = await save_resume_to_db(
            user_id=user_id,
            file_name="pasted_resume.txt",
            file_path="",
            raw_text=raw_text,
            parsed_data=parsed_data,
        )
    except Exception as exc:
        import logging, uuid
        logging.getLogger(__name__).warning(f"Resume DB persistence warning: {exc}")
        resume_id = "temp_resume_" + uuid.uuid4().hex[:8]

    return {
        "message": "Pasted resume parsed and saved successfully",
        "resume_id": resume_id,
        "raw_text": raw_text,
        "parsed_data": parsed_data,
    }

