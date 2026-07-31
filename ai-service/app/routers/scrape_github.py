import logging
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.project_scraper_service import project_scraper_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["GitHub Scraper"])


class ScrapeGithubRequest(BaseModel):
    github_url: str = Field(..., description="GitHub project URL (e.g. https://github.com/owner/repo)")


class ScrapeGithubResponse(BaseModel):
    status: str
    repo: dict
    readme: dict
    project_summary: str = ""
    tech_stack: dict
    file_tree: list


@router.post("/scrape-github", response_model=ScrapeGithubResponse)
async def scrape_github_project(payload: ScrapeGithubRequest):
    """
    Scrape a GitHub project to extract README, tech stack, and file tree.

    Accepts any valid GitHub repository URL and returns structured data
    including repo info, README content, detected technologies, and file structure.
    """
    try:
        result = await project_scraper_service.scrape_github_project(payload.github_url)
        return ScrapeGithubResponse(
            status=result["status"],
            repo=result["repo"],
            readme=result["readme"],
            project_summary=result.get("project_summary", ""),
            tech_stack=result["tech_stack"],
            file_tree=result["file_tree"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="GitHub repository not found. Check the URL and try again.")
        elif e.response.status_code == 403:
            raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env for higher limits.")
        raise HTTPException(status_code=502, detail=f"GitHub API error: {e.response.status_code}")
    except Exception as e:
        logger.error(f"GitHub scrape error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")
