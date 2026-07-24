import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.services.competency_service import competency_service

def test_competency():
    student_info = {
        "student_id": "SV001",
        "full_name": "Nguyễn Văn A",
        "major": "Công nghệ thông tin",
        "specialization": "Kỹ thuật phần mềm",
        "academic_year": "2022-2026",
        "overall_gpa": 3.5,
        "overall_percentage": 8.5
    }

    target_job = {
        "job_title": "Backend Developer",
        "required_skills": ["ASP.NET Core", "REST API", "Docker", "PostgreSQL", "React"]
    }

    selected_courses = [
        {
            "course_id": "SE340",
            "course_name": "Lập trình Web nâng cao",
            "grade": 8.8,
            "similarity_score": 0.95,
            "course_description": "Xây dựng ứng dụng web với ASP.NET Core và RESTful API.",
            "clos": ["Thiết kế RESTful APIs", "Triển khai xác thực JWT trong ASP.NET Core"]
        },
        {
            "course_id": "DB201",
            "course_name": "Cơ sở dữ liệu",
            "grade": 9.0,
            "similarity_score": 0.88,
            "course_description": "Quản trị và truy vấn PostgreSQL SQL.",
            "clos": ["Viết truy vấn SQL phức tạp", "Tối ưu hóa cơ sở dữ liệu PostgreSQL"]
        }
    ]

    projects = [
        {
            "project_name": "Hệ thống Quản lý Bán hàng",
            "role": "Backend Developer",
            "description": "Viết RESTful API bằng FastAPI, đóng gói Docker và lưu trữ PostgreSQL.",
            "technologies": ["FastAPI", "Docker", "PostgreSQL", "REST API"],
            "github_url": "https://github.com/example/shop-api"
        }
    ]

    profile = competency_service.build_profile(
        student_info=student_info,
        target_job=target_job,
        selected_courses=selected_courses,
        projects=projects
    )

    print("--- COMPUTED COMPETENCY PROFILE ---")
    print(json.dumps(profile, indent=2, ensure_ascii=False))

    assert profile["student"]["student_id"] == "SV001"
    assert len(profile["selected_courses"]) == 2
    assert len(profile["projects"]) == 1
    assert len(profile["competency_summary"]["technical_skills"]) == 5
    print("\n✅ Competency Service Unit Test PASSED!")

if __name__ == "__main__":
    test_competency()
