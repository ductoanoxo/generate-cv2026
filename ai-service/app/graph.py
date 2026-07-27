import logging
from typing import Dict, Any, List, Optional, TypedDict

from app.services.jd_parser_service import jd_parser_service
from app.services.embedding_service import embedding_service
from app.services.vector_search_service import vector_search_service
from app.services.project_scraper_service import project_scraper_service
from app.services.competency_service import competency_service
from app.services.cv_generator_service import cv_generator_service
from app.services.validator_service import validator_service
from app.services.ats_optimizer_service import ats_optimizer_service

logger = logging.getLogger(__name__)

# --- LangGraph State Definition ---
class CVPipelineState(TypedDict, total=False):
    # Input
    student_info: Dict[str, Any]
    target_job: Dict[str, Any]
    jd_raw_text: Optional[str]
    github_url: Optional[str]
    selected_courses: Optional[List[Dict[str, Any]]]
    projects: Optional[List[Dict[str, Any]]]

    # Intermediate Pipeline Data
    parsed_jd: Optional[Dict[str, Any]]
    jd_embedding: Optional[List[float]]
    matched_courses: Optional[List[Dict[str, Any]]]
    scraped_project: Optional[Dict[str, Any]]
    competency_profile: Optional[Dict[str, Any]]
    generated_cv: Optional[Dict[str, Any]]
    validation_report: Optional[Dict[str, Any]]
    ats_report: Optional[Dict[str, Any]]
    
    # Status
    status: str
    error: Optional[str]

# --- Nodes ---

def node_parse_jd(state: CVPipelineState) -> CVPipelineState:
    """Step 1: Parse JD Text / Document using Docling or raw input."""
    logger.info("[Pipeline Step 1] Parsing JD...")
    jd_text = state.get("jd_raw_text", "")
    if not jd_text:
        return {"parsed_jd": {"text": "", "keywords": []}}
    
    parsed_text = jd_parser_service.parse_file(jd_text)
    return {"parsed_jd": {"text": parsed_text}}



def node_search_courses(state: CVPipelineState) -> CVPipelineState:
    """Step 2: Perform Vector Search in Qdrant for matching courses."""
    logger.info("[Pipeline Step 2] Vector Searching Courses...")
    jd_text = state.get("jd_raw_text", "")
    if not jd_text and state.get("parsed_jd"):
        jd_text = state["parsed_jd"].get("text", "")
        
    if not jd_text:
        return {"matched_courses": state.get("selected_courses") or []}

    try:
        search_res = vector_search_service.search(query=jd_text, limit=5)
        
        # Format search results to course objects
        formatted_courses = []
        for item in search_res:
            payload = item.get("payload", {})
            formatted_courses.append({
                "course_name": payload.get("subject_name") or payload.get("name", "Học phần"),
                "clos": [payload.get("content", "")] if payload.get("content") else [],
                "grade": 8.5
            })

        # Merge with user selected courses if provided
        user_courses = state.get("selected_courses") or []
        combined_courses = user_courses + formatted_courses
        return {"matched_courses": combined_courses}
    except Exception as e:
        logger.warning(f"Vector search failed in pipeline: {e}. Using selected courses.")
        return {"matched_courses": state.get("selected_courses") or []}



async def node_scrape_github(state: CVPipelineState) -> CVPipelineState:
    """Step 3: Scrape GitHub repository details if github_url is provided."""
    logger.info("[Pipeline Step 3] Scraping GitHub Projects...")
    github_url = state.get("github_url")
    user_projects = state.get("projects") or []
    
    if not github_url:
        return {"projects": user_projects}

    try:
        scraped = await project_scraper_service.scrape_github_project(github_url)
        if scraped and scraped.get("status") == "success":
            repo_info = scraped.get("repo", {})
            tech_stack_dict = scraped.get("tech_stack", {})
            all_techs = [tech for category_techs in tech_stack_dict.values() for tech in category_techs]

            scraped_proj = {
                "name": repo_info.get("name", "GitHub Project"),
                "role": "Fullstack Contributor",
                "description": repo_info.get("description") or f"Repository {repo_info.get('full_name', '')}",
                "technologies": all_techs
            }
            combined_projects = user_projects + [scraped_proj]
            return {"projects": combined_projects, "scraped_project": scraped}
    except Exception as e:
        logger.warning(f"GitHub scraping failed: {e}")

    return {"projects": user_projects}



def node_build_competency(state: CVPipelineState) -> CVPipelineState:
    """Step 4: Build Competency Profile (3-layer skill matching + confidence score)."""
    logger.info("[Pipeline Step 4] Building Competency Profile...")
    profile = competency_service.build_profile(
        student_info=state.get("student_info", {}),
        target_job=state.get("target_job", {}),
        selected_courses=state.get("matched_courses") or [],
        projects=state.get("projects") or []
    )
    return {"competency_profile": profile}


async def node_generate_cv(state: CVPipelineState) -> CVPipelineState:
    """Step 5: Generate CV Content JSON using LLM / Fallback Engine."""
    logger.info("[Pipeline Step 5] Generating CV Content...")
    profile = state.get("competency_profile", {})
    cv_json = await cv_generator_service.generate_cv(profile)
    return {"generated_cv": cv_json}


def node_validate_evidence(state: CVPipelineState) -> CVPipelineState:
    """Step 6: Validate CV skills against course CLOs & projects."""
    logger.info("[Pipeline Step 6] Validating Evidence...")
    cv_data = state.get("generated_cv", {})
    profile = state.get("competency_profile", {})
    report = validator_service.validate_cv_evidence(cv_data, profile)
    return {"validation_report": report}


def node_optimize_ats(state: CVPipelineState) -> CVPipelineState:
    """Step 7: Analyze & Optimize ATS Score against JD."""
    logger.info("[Pipeline Step 7] Optimizing ATS Score...")
    cv_data = state.get("generated_cv", {})
    jd_text = state.get("jd_raw_text", "")
    profile = state.get("competency_profile", {})
    ats_res = ats_optimizer_service.analyze_ats(cv_data, jd_text, profile)
    return {"ats_report": ats_res, "status": "completed"}


# --- Sequential Fallback Orchestrator (used when langgraph package is not loaded) ---
class FallbackCVPipelineGraph:
    async def ainvoke(self, state: CVPipelineState) -> CVPipelineState:
        current_state = dict(state)
        
        # Step 1
        res1 = node_parse_jd(current_state)
        current_state.update(res1)
        
        # Step 2
        res2 = node_search_courses(current_state)
        current_state.update(res2)
        
        # Step 3
        res3 = await node_scrape_github(current_state)
        current_state.update(res3)

        
        # Step 4
        res4 = node_build_competency(current_state)
        current_state.update(res4)
        
        # Step 5
        res5 = await node_generate_cv(current_state)
        current_state.update(res5)
        
        # Step 6
        res6 = node_validate_evidence(current_state)
        current_state.update(res6)
        
        # Step 7
        res7 = node_optimize_ats(current_state)
        current_state.update(res7)
        
        return current_state


try:
    from langgraph.graph import StateGraph, END
    builder = StateGraph(CVPipelineState)

    builder.add_node("parse_jd", node_parse_jd)
    builder.add_node("search_courses", node_search_courses)
    builder.add_node("scrape_github", node_scrape_github)
    builder.add_node("build_competency", node_build_competency)
    builder.add_node("generate_cv", node_generate_cv)
    builder.add_node("validate_evidence", node_validate_evidence)
    builder.add_node("optimize_ats", node_optimize_ats)

    builder.set_entry_point("parse_jd")
    builder.add_edge("parse_jd", "search_courses")
    builder.add_edge("search_courses", "scrape_github")
    builder.add_edge("scrape_github", "build_competency")
    builder.add_edge("build_competency", "generate_cv")
    builder.add_edge("generate_cv", "validate_evidence")
    builder.add_edge("validate_evidence", "optimize_ats")
    builder.add_edge("optimize_ats", END)

    cv_pipeline_graph = builder.compile()
except ImportError:
    logger.warning("langgraph package not found in current environment. Using FallbackCVPipelineGraph.")
    cv_pipeline_graph = FallbackCVPipelineGraph()

