import logging
from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Embedding"])


class EmbedRequest(BaseModel):
    text: Optional[str] = Field(None, description="Single text input to embed")
    texts: Optional[List[str]] = Field(None, description="List of texts to embed in batch")


class EmbedResponse(BaseModel):
    status: str
    model: str
    dimension: int
    embedding: Optional[List[float]] = None
    embeddings: Optional[List[List[float]]] = None


@router.post("/embed", response_model=EmbedResponse)
async def create_embedding(payload: EmbedRequest):
    """
    Generates OpenAI text-embedding-3-small (1536-dimensional) vector embedding(s).
    """
    try:
        if payload.text and payload.text.strip():
            vector = embedding_service.get_embedding(payload.text)
            return EmbedResponse(
                status="success",
                model=embedding_service.model,
                dimension=len(vector),
                embedding=vector
            )
        elif payload.texts and len(payload.texts) > 0:
            vectors = embedding_service.get_embeddings(payload.texts)
            return EmbedResponse(
                status="success",
                model=embedding_service.model,
                dimension=len(vectors[0]) if vectors else embedding_service.dimension,
                embeddings=vectors
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Request body must contain either 'text' (string) or 'texts' (list of strings)."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating embedding: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")
