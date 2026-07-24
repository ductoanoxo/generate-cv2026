import sys
import io
import asyncio
from fastapi.testclient import TestClient

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.main import app

client = TestClient(app)

def test_api_routes():
    # 1. Test Health
    resp_health = client.get("/health")
    assert resp_health.status_code == 200
    print("✅ Health Check Endpoint PASSED!")

    # 2. Test Competency Profile Endpoint
    cp_payload = {
        "student": {
            "student_id": "SV007",
            "full_name": "Lê Minh Hải",
            "major": "Công nghệ thông tin",
            "specialization": "Kỹ thuật phần mềm",
            "overall_gpa": 3.7
        },
        "target_job": {
            "job_title": "AI & Software Engineer",
            "required_skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "React"]
        },
        "selected_courses": [
            {
                "course_id": "AI101",
                "course_name": "Nhập môn Trí tuệ nhân tạo",
                "grade": 9.5,
                "similarity_score": 0.96,
                "course_description": "Lập trình Python, FastAPI và xử lý dữ liệu.",
                "clos": ["Xây dựng REST API bằng FastAPI", "Lập trình Python ứng dụng ML"]
            }
        ],
        "projects": [
            {
                "project_name": "Hệ thống Generate CV AI",
                "role": "AI Engineer",
                "description": "Phát triển AI service với FastAPI, LangGraph và Qdrant.",
                "technologies": ["Python", "FastAPI", "Docker", "PostgreSQL"],
                "github_url": "https://github.com/ductoanoxo/generate-cv2026"
            }
        ]
    }

    resp_cp = client.post("/api/competency-profile", json=cp_payload)
    assert resp_cp.status_code == 200
    cp_data = resp_cp.json()
    assert cp_data["status"] == "success"
    profile = cp_data["competency_profile"]
    assert profile["student"]["full_name"] == "Lê Minh Hải"
    print("✅ POST /api/competency-profile Endpoint PASSED!")

    # 3. Test Generate CV Endpoint
    resp_cv = client.post("/api/generate-cv", json={"competency_profile": profile})
    assert resp_cv.status_code == 200
    cv_data = resp_cv.json()
    assert cv_data["status"] == "success"
    cv = cv_data["cv"]
    assert cv["personal_info"]["full_name"] == "Lê Minh Hải"
    assert "personal_info" in cv
    assert "education" in cv
    assert "skills" in cv
    assert "projects" in cv
    print("✅ POST /api/generate-cv Endpoint PASSED!")

if __name__ == "__main__":
    test_api_routes()
