import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.services.jd_parser_service import jd_parser_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["JD Parser"])


class ParseJDResponse(BaseModel):
    status: str
    filename: str
    markdown: str


@router.post("/parse-jd", response_model=ParseJDResponse)
async def parse_jd(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Parses a Job Description (JD) file (PDF, DOCX, TXT) or raw text into Markdown format using Docling.
    """
    try:
        if file is not None:
            content = await file.read()
            markdown = jd_parser_service.parse_file(content, filename=file.filename or "jd_upload.pdf")
            return ParseJDResponse(
                status="success",
                filename=file.filename or "uploaded_file",
                markdown=markdown
            )
        elif raw_text and raw_text.strip():
            markdown = jd_parser_service.parse_file(raw_text, filename="raw_text.txt")
            return ParseJDResponse(
                status="success",
                filename="raw_text",
                markdown=markdown
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either 'file' (UploadFile) or 'raw_text' form field must be provided."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing JD: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to parse JD file: {str(e)}")
