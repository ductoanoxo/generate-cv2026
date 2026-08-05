from typing import Any, Dict

from fastapi import APIRouter

from app.services.translation_service import translation_service

router = APIRouter(prefix="/api/translate", tags=["translate"])


@router.post("/cv")
async def translate_cv(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Translate CV text content (Vietnamese -> English) while preserving all other fields."""
    return await translation_service.translate_cv(payload, target_lang="en")
