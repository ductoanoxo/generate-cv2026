import logging
from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from app.config import settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

COLLECTION_NAME = "course_clos"


class VectorSearchService:
    def __init__(self):
        self._qdrant_client: Optional[QdrantClient] = None
        self._cohere_client = None

    @property
    def qdrant_client(self) -> QdrantClient:
        if self._qdrant_client is None:
            self._qdrant_client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
            logger.info(f"Connected to Qdrant at {settings.QDRANT_URL}")
        return self._qdrant_client

    @property
    def cohere_client(self):
        if self._cohere_client is None:
            if not settings.COHERE_API_KEY:
                raise ValueError("COHERE_API_KEY is not configured.")
            import cohere
            self._cohere_client = cohere.Client(api_key=settings.COHERE_API_KEY)
            logger.info("Initialized Cohere client for reranking.")
        return self._cohere_client

    def _build_filter(self, type_filter: Optional[str] = None, department: Optional[str] = None) -> Optional[Filter]:
        conditions = []
        if type_filter:
            conditions.append(FieldCondition(key="type", match=MatchValue(value=type_filter)))
        if department:
            conditions.append(FieldCondition(key="department", match=MatchValue(value=department)))
        if not conditions:
            return None
        return Filter(must=conditions)

    def search(
        self,
        query: str,
        limit: int = 5,
        type_filter: Optional[str] = None,
        department: Optional[str] = None,
        score_threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Vector search against Qdrant course_clos collection.
        Returns list of results with score and payload.
        """
        query_vector = embedding_service.get_embedding(query)
        qdrant_filter = self._build_filter(type_filter, department)

        results = self.qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=qdrant_filter,
            limit=limit,
            with_payload=True,
            score_threshold=score_threshold if score_threshold > 0 else None
        ).points

        return [
            {
                "id": r.id,
                "score": round(r.score, 4),
                "payload": r.payload or {}
            }
            for r in results
        ]

    def search_with_rerank(
        self,
        query: str,
        limit: int = 5,
        type_filter: Optional[str] = None,
        department: Optional[str] = None,
        score_threshold: float = 0.0,
        cohere_top_n: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Vector search + Cohere Rerank.
        1. Fetch top 20 candidates from Qdrant
        2. Rerank with Cohere Rerank, return top N
        """
        query_vector = embedding_service.get_embedding(query)
        qdrant_filter = self._build_filter(type_filter, department)

        candidates = self.qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=qdrant_filter,
            limit=20,
            with_payload=True,
            score_threshold=score_threshold if score_threshold > 0 else None
        ).points

        if not candidates:
            return []

        docs = [
            r.payload.get("full_text", r.payload.get("content", r.payload.get("description", "")))
            for r in candidates
        ]

        reranked = self.cohere_client.rerank(
            query=query,
            documents=docs,
            top_n=min(cohere_top_n, len(docs)),
            model="rerank-multilingual-v3.0"
        )

        results = []
        for item in reranked.results:
            original = candidates[item.index]
            results.append({
                "id": original.id,
                "score": round(item.relevance_score, 4),
                "payload": original.payload or {}
            })

        return results

    def build_search_context(self, results: List[Dict[str, Any]], max_items: int = 10) -> str:
        """
        Build a text context string from search results for LLM consumption.
        """
        lines = []
        seen_subjects = set()

        for r in results[:max_items]:
            payload = r["payload"]
            ptype = payload.get("type", "unknown")
            code = payload.get("subject_code", "")
            name = payload.get("subject_name", "")
            score = r.get("score", 0)

            if ptype == "subject":
                key = f"subject:{code}"
                if key in seen_subjects:
                    continue
                seen_subjects.add(key)
                lines.append(
                    f"[Score: {score}] Môn: {name} ({code}) | "
                    f"Khoa: {payload.get('department', '')} | "
                    f"Mô tả: {payload.get('description', '')[:200]}"
                )
            elif ptype == "clo":
                lines.append(
                    f"[Score: {score}] CLO {payload.get('clo_code', '')} [{payload.get('category', '')}] "
                    f"từ {name} ({code}): {payload.get('content', '')[:200]}"
                )

        return "\n".join(lines) if lines else "Không tìm thấy kết quả phù hợp."


vector_search_service = VectorSearchService()
