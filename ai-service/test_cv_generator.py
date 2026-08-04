import sys
import io
import asyncio
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.services.competency_service import competency_service
from app.services.cv_generator_service import cv_generator_service


def test_grounding_removes_llm_invented_data():
    profile = {
        "student": {
            "student_id": "SV1",
            "full_name": "Nguyễn A",
            "email": "a@example.com",
            "phone": "0123",
            "major": "Công nghệ thông tin",
            "specialization": "Kỹ thuật phần mềm",
            "overall_gpa": 3.2,
            "overall_percentage": 8.0,
            "languages": ["Tiếng Anh"],
        },
        "target_job": {"job_title": "DevOps Intern", "required_skills": ["Linux"]},
        "selected_courses": [{"course_name": "Linux", "grade": 8.5, "clos": []}],
        "projects": [{"project_name": "p1", "role": "Developer", "description": "Dùng Docker", "technologies": ["Docker"]}],
        "competency_summary": {"technical_skills": [{"skill": "Linux", "confidence": 0.5}], "soft_skills": ["Không được tự thêm"]},
    }
    llm_cv = {
        "personal_info": {"full_name": "Tên giả", "title": "DevOps Intern", "email": "fake@example.com", "phone": "0909", "summary": "Tóm tắt giả"},
        "education": {"relevant_courses": [{"name": "Môn giả", "grade": "10/10"}]},
        "skills": {"technical": ["Linux", "Docker"], "tools": ["Git", "VS Code"], "soft": ["Không được tự thêm"]},
        "projects": [{"name": "p1", "role": "Developer", "description": "Dùng Docker", "technologies": ["Docker", "Git"]}],
        "languages": ["Tiếng Anh", "Tiếng Nhật"],
    }
    grounded = cv_generator_service._ground_cv_in_profile(llm_cv, profile)
    assert grounded["personal_info"]["full_name"] == "Nguyễn A"
    assert grounded["personal_info"]["email"] == "a@example.com"
    assert grounded["personal_info"]["summary"] == "Tóm tắt giả"
    assert grounded["skills"]["tools"] == []
    assert grounded["skills"]["technical"] == ["Linux", "Docker"]
    assert grounded["languages"] == ["Tiếng Anh"]
    assert grounded["projects"][0]["technologies"] == ["Docker"]


async def test_cv_generator():
    student_info = {
        "student_id": "SV001",
        "full_name": "Đặng Đức Toàn",
        "major": "Công nghệ thông tin",
        "specialization": "Kỹ thuật phần mềm",
        "academic_year": "2022-2026",
        "overall_gpa": 3.6,
        "overall_percentage": 8.6
    }

    target_job = {
        "job_title": "Fullstack Developer",
        "required_skills": ["React", "ASP.NET Core", "Docker", "PostgreSQL"]
    }

    selected_courses = [
        {
            "course_id": "SE340",
            "course_name": "Lập trình Web nâng cao",
            "grade": 9.2,
            "similarity_score": 0.98,
            "course_description": "Xây dựng web app với ASP.NET Core & React.",
            "clos": ["Xây dựng RESTful API chuẩn", "Tích hợp JWT Auth"]
        }
    ]

    projects = [
        {
            "project_name": "Hệ thống Cổng Thông Tin & Tạo CV",
            "role": "Fullstack Developer",
            "description": "Dự án tốt nghiệp phát triển bằng React, .NET 8, FastAPI và Qdrant.",
            "technologies": ["React", "ASP.NET Core", "PostgreSQL", "Docker", "FastAPI"],
            "github_url": "https://github.com/ductoanoxo/generate-cv2026"
        }
    ]

    # 1. Build profile
    profile = competency_service.build_profile(
        student_info=student_info,
        target_job=target_job,
        selected_courses=selected_courses,
        projects=projects
    )

    # 2. Generate CV JSON
    cv_result = await cv_generator_service.generate_cv(profile)

    print("--- GENERATED CV JSON ---")
    print(json.dumps(cv_result, indent=2, ensure_ascii=False))

    assert "personal_info" in cv_result
    assert "education" in cv_result
    assert "skills" in cv_result
    assert "projects" in cv_result
    assert cv_result["personal_info"]["full_name"] == "Đặng Đức Toàn"
    assert cv_result["personal_info"]["title"] == "Fullstack Developer"
    
    print("\n✅ CV Generator Unit Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test_cv_generator())
