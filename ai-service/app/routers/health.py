import httpx
from fastapi import APIRouter
from app.config import settings
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health Check"])


@router.get("/health", response_model=HealthResponse)
async def check_health():
    """
    Check health status of AI Service and Qdrant connection
    """
    qdrant_ok = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{settings.QDRANT_URL}/healthz")
            if resp.status_code == 200:
                qdrant_ok = True
    except Exception:
        qdrant_ok = False

    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        qdrant_connected=qdrant_ok
    )
