import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.competency_service import competency_service
from app.services.cv_generator_service import cv_generator_service

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
