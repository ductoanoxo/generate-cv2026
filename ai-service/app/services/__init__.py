# Services package for AI Service
from app.services.embedding_service import embedding_service
from app.services.vector_search_service import vector_search_service
from app.services.project_scraper_service import project_scraper_service
from app.services.competency_service import competency_service
from app.services.cv_generator_service import cv_generator_service

__all__ = [
    "embedding_service",
    "vector_search_service",
    "project_scraper_service",
    "competency_service",
    "cv_generator_service",
]
