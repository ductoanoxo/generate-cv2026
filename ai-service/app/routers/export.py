import logging
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from app.models.schemas import CVDataSchema, Mau07RequestSchema
from app.services.export_service import export_service
from app.services.mau07_service import mau07_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.post("/mau07")
async def export_mau07(data: Mau07RequestSchema):
    """Generate the Mẫu 07 expert internship-evaluation form as DOCX.

    Must be registered before /{format} so it is not swallowed by the catch-all.
    """
    try:
        content = mau07_service.generate(
            data.profile.model_dump(),
            data.experience.model_dump(),
        )
        filename = "Mau07_TTTN_DanhGiaThucTap.docx"
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(content)),
            },
        )
    except Exception as e:
        logger.exception("Mau07 export failed")
        raise HTTPException(status_code=500, detail=f"Mau07 export failed: {str(e)}")


@router.post("/{format}")
async def export_cv(
    format: str,
    cv_data: CVDataSchema,
    template: str = Query("modern", description="Template name: modern or classic"),
):
    if format not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'pdf' or 'docx'.")

    if template not in ("modern", "classic"):
        raise HTTPException(status_code=400, detail="Unsupported template. Use 'modern' or 'classic'.")

    data = cv_data.model_dump()

    try:
        if format == "pdf":
            content = export_service.generate_pdf(data, template_name=template)
            media_type = "application/pdf"
            filename = f"cv_{template}.pdf"
        else:
            content = export_service.generate_docx(data, template_name=template)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"cv_{template}.docx"

        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(content)),
            },
        )
    except Exception as e:
        logger.exception("Export failed")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")