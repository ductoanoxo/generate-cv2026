from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END


class CVPipelineState(TypedDict):
    """
    State definition for the 7-step Generate CV LangGraph Pipeline
    """
    student_id: Optional[str]
    jd_file_path: Optional[str]
    jd_raw_text: Optional[str]
    jd_embedding: Optional[List[float]]
    top_courses: Optional[List[Dict[str, Any]]]
    student_scores: Optional[List[Dict[str, Any]]]
    personal_projects: Optional[List[Dict[str, Any]]]
    competency_profile: Optional[Dict[str, Any]]
    cv_json: Optional[Dict[str, Any]]
    ats_score: Optional[float]
    validation_status: Optional[Dict[str, Any]]
    error: Optional[str]


# Node placeholders for LangGraph Pipeline
def init_node(state: CVPipelineState) -> CVPipelineState:
    """Initialization node for CV generation pipeline"""
    return state


def build_cv_pipeline_graph():
    """
    Constructs the base LangGraph workflow for Generate CV pipeline.
    Nodes will be populated as feature development progresses across 10 days.
    """
    builder = StateGraph(CVPipelineState)
    
    # Add nodes
    builder.add_node("init", init_node)
    
    # Define entrypoint and edges
    builder.set_entry_point("init")
    builder.add_edge("init", END)
    
    # Compile graph
    return builder.compile()


cv_graph = build_cv_pipeline_graph()
