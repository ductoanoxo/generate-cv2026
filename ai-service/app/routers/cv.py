import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.competency_service import competency_service
from app.services.cv_generator_service import cv_generator_service

from app.services.ats_optimizer_service import ats_optimizer_service
from app.services.validator_service import validator_service
from app.graph import cv_pipeline_graph

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["CV Generator"])


# --- Request & Response Models ---

class StudentInfoInput(BaseModel):
    student_id: Optional[str] = Field("SV001", description="Mã sinh viên")
    full_name: Optional[str] = Field("Nguyễn Văn A", description="Họ và tên sinh viên")
    email: Optional[str] = Field(None, description="Email sinh viên")
    phone: Optional[str] = Field(None, description="Số điện thoại sinh viên")
    major: Optional[str] = Field("Công nghệ thông tin", description="Ngành học")
    specialization: Optional[str] = Field("Kỹ thuật phần mềm", description="Chuyên ngành")
    academic_year: Optional[str] = Field("2022-2026", description="Khóa học")
    graduation_year: Optional[str] = Field("2026", description="Năm tốt nghiệp")
    overall_gpa: Optional[float] = Field(3.2, description="Điểm GPA hệ 4")
    overall_percentage: Optional[float] = Field(8.0, description="Điểm GPA hệ 10")
    languages: List[str] = Field(default_factory=list, description="Ngoại ngữ do sinh viên cung cấp")


class TargetJobInput(BaseModel):
    job_title: str = Field(..., description="Vị trí ứng tuyển (ví dụ: Backend Developer)")
    required_skills: List[str] = Field(..., description="Danh sách kỹ năng yêu cầu từ JD")


class CompetencyProfileRequest(BaseModel):
    student: StudentInfoInput
    target_job: TargetJobInput
    selected_courses: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách môn học đã hoàn thành")
    projects: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách dự án cá nhân")


class CompetencyProfileResponse(BaseModel):
    status: str
    competency_profile: Dict[str, Any]


class GenerateCVRequest(BaseModel):
    competency_profile: Dict[str, Any] = Field(..., description="Competency profile object")


class GenerateCVResponse(BaseModel):
    status: str
    cv: Dict[str, Any]


class OptimizeATSRequest(BaseModel):
    cv_data: Dict[str, Any] = Field(..., description="Dữ liệu CV đã sinh")
    jd_text: str = Field(..., description="Nội dung mô tả công việc (JD)")
    competency_profile: Optional[Dict[str, Any]] = Field(None, description="Competency Profile (tùy chọn)")


class OptimizeATSResponse(BaseModel):
    status: str
    result: Dict[str, Any]


class ValidateEvidenceRequest(BaseModel):
    cv_data: Dict[str, Any] = Field(..., description="Dữ liệu CV dạng JSON")
    competency_profile: Optional[Dict[str, Any]] = Field(None, description="Competency profile chứa môn học & dự án gốc")


class ValidateEvidenceResponse(BaseModel):
    status: str
    validation_report: Dict[str, Any]


class FullPipelineRequest(BaseModel):
    student: StudentInfoInput
    target_job: TargetJobInput
    jd_raw_text: str = Field(..., description="Mô tả công việc JD dạng văn bản")
    github_url: Optional[str] = Field(None, description="Đường dẫn repository GitHub (tùy chọn)")
    selected_courses: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Môn học đã hoàn thành")
    projects: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Dự án cá nhân đã làm")


class FullPipelineResponse(BaseModel):
    status: str
    cv: Dict[str, Any]
    ats_report: Dict[str, Any]
    validation_report: Dict[str, Any]
    competency_profile: Dict[str, Any]


# --- Endpoints ---

@router.post("/competency-profile", response_model=CompetencyProfileResponse)
async def build_competency_profile(payload: CompetencyProfileRequest):
    """
    Tạo Competency Profile (Hồ sơ năng lực) tổng hợp từ 4 nguồn:
    1. Thông tin sinh viên
    2. JD ứng tuyển & Kỹ năng yêu cầu
    3. Điểm số các môn học matched
    4. Dự án cá nhân & GitHub Tech Stack
    """
    try:
        profile = competency_service.build_profile(
            student_info=payload.student.model_dump(),
            target_job=payload.target_job.model_dump(),
            selected_courses=payload.selected_courses,
            projects=payload.projects
        )
        return CompetencyProfileResponse(
            status="success",
            competency_profile=profile
        )
    except Exception as e:
        logger.error(f"Error building competency profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to build competency profile: {str(e)}")


@router.post("/generate-cv", response_model=GenerateCVResponse)
async def generate_cv_content(payload: GenerateCVRequest):
    """
    Sinh nội dung CV dạng JSON dựa trên Competency Profile bằng LLM (Gemini / OpenAI / Fallback Engine).
    """
    try:
        cv_json = await cv_generator_service.generate_cv(payload.competency_profile)
        return GenerateCVResponse(
            status="success",
            cv=cv_json
        )
    except Exception as e:
        logger.error(f"Error generating CV: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate CV: {str(e)}")


@router.post("/optimize-ats", response_model=OptimizeATSResponse)
async def optimize_ats(payload: OptimizeATSRequest):
    """
    Phân tích và tối ưu hóa điểm ATS (Applicant Tracking System) của CV so với JD.
    """
    try:
        result = ats_optimizer_service.analyze_ats(
            cv_data=payload.cv_data,
            jd_text=payload.jd_text,
            competency_profile=payload.competency_profile
        )
        return OptimizeATSResponse(
            status="success",
            result=result
        )
    except Exception as e:
        logger.error(f"Error analyzing ATS: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze ATS: {str(e)}")


@router.post("/validate-evidence", response_model=ValidateEvidenceResponse)
async def validate_evidence(payload: ValidateEvidenceRequest):
    """
    Xác thực các kỹ năng trong CV xem có bằng chứng môn học/dự án chứng minh không.
    """
    try:
        report = validator_service.validate_cv_evidence(
            cv_data=payload.cv_data,
            competency_profile=payload.competency_profile
        )
        return ValidateEvidenceResponse(
            status="success",
            validation_report=report
        )
    except Exception as e:
        logger.error(f"Error validating evidence: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to validate evidence: {str(e)}")


@router.post("/generate-cv/full", response_model=FullPipelineResponse)
async def generate_cv_full_pipeline(payload: FullPipelineRequest):
    """
    Chạy toàn bộ AI Pipeline end-to-end 7 bước đóng gói trong LangGraph Graph:
    1. Parse JD -> 2. Vector Search Courses -> 3. Scrape GitHub -> 4. Build Profile -> 5. Generate CV -> 6. Validate Evidence -> 7. ATS Optimize
    """
    try:
        initial_state = {
            "student_info": payload.student.model_dump(),
            "target_job": payload.target_job.model_dump(),
            "jd_raw_text": payload.jd_raw_text,
            "github_url": payload.github_url,
            "selected_courses": payload.selected_courses,
            "projects": payload.projects
        }

        final_state = await cv_pipeline_graph.ainvoke(initial_state)

        return FullPipelineResponse(
            status="success",
            cv=final_state.get("generated_cv", {}),
            ats_report=final_state.get("ats_report", {}),
            validation_report=final_state.get("validation_report", {}),
            competency_profile=final_state.get("competency_profile", {})
        )
    except Exception as e:
        logger.error(f"Error running full CV pipeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Full pipeline failed: {str(e)}")


