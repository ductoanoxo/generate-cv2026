import pytest
from app.services.ats_optimizer_service import ats_optimizer_service

def test_ats_optimizer_rule_based():
    mock_cv = {
        "summary": "Lập trình viên Backend với kinh nghiệm Python, FastAPI và Docker.",
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
        "projects": [
            {
                "name": "CV Generator",
                "role": "Backend Developer",
                "description": "Xây dựng hệ thống sinh CV tự động bằng Python và FastAPI.",
                "technologies": ["Python", "FastAPI", "Docker"]
            }
        ]
    }
    
    mock_jd = "Chúng tôi cần tuyển Backend Developer thành thạo Python, FastAPI, Docker, CI/CD và Redis."

    res = ats_optimizer_service.analyze_ats(mock_cv, mock_jd)
    
    assert "ats_score" in res
    assert "breakdown" in res
    assert "matched_keywords" in res
    assert "missing_keywords" in res
    assert res["ats_score"] > 0
    print("ATS Score:", res["ats_score"])
    print("Matched Keywords:", res["matched_keywords"])

if __name__ == "__main__":
    test_ats_optimizer_rule_based()

