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


class ProjectSchema(BaseModel):
    name: str = ""
    role: str = ""
    description: str = ""
    technologies: List[str] = []
    startDate: Optional[str] = None
    endDate: Optional[str] = None



class CertificationSchema(BaseModel):
    certificationName: str = ""
    date: str = ""


class ExperienceSchema(BaseModel):
    company: str = ""
    role: str = ""
    period: str = ""
    description: str = ""
    companyAddress: str = ""
    mentorName: str = ""


class GradeSchema(BaseModel):
    subjectName: str = ""
    score: float = 0.0
    credits: int = 0


class ProfileSchema(BaseModel):
    fullName: str = ""
    email: str = ""
    phoneNumber: str = ""
    gender: str = ""
    birthDate: str = ""
    faculty: str = ""
    major: str = ""
    academicYear: str = ""
    studentCode: str = ""
    gpa: float = 0.0
    avatar: Optional[str] = None


class EducationSchema(BaseModel):
    school: str = ""
    major: str = ""
    period: str = ""
    gpa: Optional[Any] = None
    degree: Optional[str] = None


class CategorizedSkillGroupSchema(BaseModel):
    category: str = ""
    items: List[str] = []


class CVDataSchema(BaseModel):
    profile: ProfileSchema = Field(default_factory=ProfileSchema)
    summary: str = ""
    skills: List[str] = []
    categorizedSkills: Optional[List[CategorizedSkillGroupSchema]] = None
    languages: List[str] = []
    projects: List[ProjectSchema] = []
    education: List[EducationSchema] = []
    certifications: List[CertificationSchema] = []
    experience: List[ExperienceSchema] = []
    grades: List[GradeSchema] = []
    activities: List[str] = []



class Mau07RequestSchema(BaseModel):
    profile: ProfileSchema = Field(default_factory=ProfileSchema)
    experience: ExperienceSchema = Field(default_factory=ExperienceSchema)
