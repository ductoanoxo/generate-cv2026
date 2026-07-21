from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    app_name: str
    environment: str
    qdrant_connected: bool = False


class PipelineStateSchema(BaseModel):
    student_id: Optional[str] = None
    jd_raw_text: Optional[str] = None
    jd_embedding: Optional[List[float]] = None
    top_courses: Optional[List[Dict[str, Any]]] = None
    filtered_scores: Optional[List[Dict[str, Any]]] = None
    competency_profile: Optional[Dict[str, Any]] = None
    generated_cv: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
    is_validated: bool = False
    error: Optional[str] = None
