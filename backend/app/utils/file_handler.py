import os
import re
import shutil
import uuid

import PyPDF2
import docx
from fastapi import HTTPException, UploadFile, status

from app.config import settings


ALLOWED_EXTENSIONS = {".pdf", ".docx"}


async def save_upload_file(upload_file: UploadFile, destination_folder: str = "") -> str:
    """Validates file size, generates a unique filename, and saves the upload.

    Args:
        upload_file: The incoming FastAPI UploadFile object.
        destination_folder: Destination folder or subfolder. Defaults to UPLOAD_DIR.

    Returns:
        The absolute path to the saved file.

    Raises:
        HTTPException 400 if the file exceeds MAX_FILE_SIZE_MB.
    """
    base_dir = os.path.abspath(settings.UPLOAD_DIR)
    if destination_folder:
        if os.path.isabs(destination_folder):
            target_dir = destination_folder
        elif os.path.abspath(destination_folder) == base_dir:
            target_dir = base_dir
        else:
            target_dir = os.path.join(base_dir, destination_folder)
    else:
        target_dir = base_dir
    os.makedirs(target_dir, exist_ok=True)

    # Read file content and validate size
    content = await upload_file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB} MB",
        )

    # Generate unique filename preserving original extension
    original_name = upload_file.filename or "upload"
    _, ext = os.path.splitext(original_name)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(target_dir, unique_name)

    # Write file to disk
    with open(file_path, "wb") as f:
        f.write(content)

    return file_path


def extract_text_from_pdf(file_path: str) -> str:
    """Uses PyPDF2 to read a PDF file and return the extracted text."""
    text_parts = []
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_path: str) -> str:
    """Uses python-docx to read a Word document and return the extracted text."""
    doc = docx.Document(file_path)
    text_parts = [paragraph.text for paragraph in doc.paragraphs if paragraph.text]
    return "\n".join(text_parts)


def _clean_text(raw_text: str) -> str:
    """Removes excessive whitespace and blank lines from extracted text."""
    # Collapse multiple spaces/tabs into a single space
    text = re.sub(r"[^\S\n]+", " ", raw_text)
    # Collapse 3+ consecutive newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def process_uploaded_file(file_path: str, filename: str) -> str:
    """Routes to the correct text extraction function based on file extension.

    Args:
        file_path: Absolute path to the saved file.
        filename: Original filename (used to determine extension).

    Returns:
        Cleaned extracted text.

    Raises:
        HTTPException 400 if the file type is unsupported.
    """
    _, ext = os.path.splitext(filename)
    ext = ext.lower()

    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        raw_text = extract_text_from_docx(file_path)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Only PDF and DOCX are accepted.",
        )

    return _clean_text(raw_text)
