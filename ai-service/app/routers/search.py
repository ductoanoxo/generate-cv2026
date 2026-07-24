import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.vector_search_service import vector_search_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Search"])


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query (JD text, keywords, or natural language)")
    limit: int = Field(5, ge=1, le=20, description="Max results to return")
    type_filter: Optional[str] = Field(None, description="Filter by type: 'subject' or 'clo'")
    department: Optional[str] = Field(None, description="Filter by department name")
    use_rerank: bool = Field(False, description="Enable Cohere Rerank for higher accuracy")
    rerank_top_n: int = Field(3, ge=1, le=10, description="Top N results after reranking")


class SearchResultItem(BaseModel):
    id: int
    score: float
    type: str
    subject_code: str
    subject_name: str
    content: str
    category: Optional[str] = None
    department: Optional[str] = None


class SearchResponse(BaseModel):
    status: str
    query: str
    use_rerank: bool
    total_results: int
    results: List[SearchResultItem]
    context: str


@router.post("/search", response_model=SearchResponse)
async def search_courses(payload: SearchRequest):
    """
    Semantic vector search for courses and CLOs in Qdrant.

    - With use_rerank=false: fast Qdrant cosine similarity search.
    - With use_rerank=true: Qdrant candidate retrieval + Cohere Rerank v3.0 for higher accuracy.
    """
    try:
        if payload.use_rerank:
            results = vector_search_service.search_with_rerank(
                query=payload.query,
                limit=payload.limit,
                type_filter=payload.type_filter,
                department=payload.department,
                cohere_top_n=payload.rerank_top_n
            )
        else:
            results = vector_search_service.search(
                query=payload.query,
                limit=payload.limit,
                type_filter=payload.type_filter,
                department=payload.department
            )

        formatted = []
        for r in results:
            p = r["payload"]
            formatted.append(SearchResultItem(
                id=r["id"],
                score=r["score"],
                type=p.get("type", "unknown"),
                subject_code=p.get("subject_code", ""),
                subject_name=p.get("subject_name", ""),
                content=p.get("content", p.get("full_text", ""))[:500],
                category=p.get("category"),
                department=p.get("department")
            ))

        context = vector_search_service.build_search_context(results)

        return SearchResponse(
            status="success",
            query=payload.query,
            use_rerank=payload.use_rerank,
            total_results=len(formatted),
            results=formatted,
            context=context
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Search error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
