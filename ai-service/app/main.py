from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, parse_jd, embed, search, scrape_github, cv

app = FastAPI(
    title=settings.APP_NAME,
    description="Generate CV AI Service - Powered by LangGraph, Docling & Qdrant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(parse_jd.router)
app.include_router(embed.router)
app.include_router(search.router)
app.include_router(scrape_github.router)
app.include_router(cv.router)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/health"
    }
