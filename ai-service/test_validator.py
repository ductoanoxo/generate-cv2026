from app.services.validator_service import validator_service

def test_validator_service():
    mock_cv = {
        "skills": ["Python", "FastAPI", "React", "Docker", "Kubernetes"],
        "projects": [
            {
                "name": "CV Generator Project",
                "technologies": ["Python", "FastAPI", "Docker"],
                "description": "Xây dựng hệ thống sinh CV tự động."
            }
        ]
    }
    
    mock_profile = {
        "selected_courses": [
            {
                "course_name": "Lập trình Web nâng cao",
                "clos": ["Xây dựng ứng dụng Web với React và Node.js"],
                "grade": 8.5
            }
        ],
        "projects": [
            {
                "name": "CV Generator Project",
                "technologies": ["Python", "FastAPI", "Docker"],
                "description": "Xây dựng hệ thống sinh CV tự động."
            }
        ]
    }

    res = validator_service.validate_cv_evidence(mock_cv, mock_profile)
    
    assert "evidence_score" in res
    assert res["total_skills"] == 5
    assert res["verified_skills_count"] == 4  # Python, FastAPI, React, Docker verified; Kubernetes unverified
    print("Evidence Score:", res["evidence_score"])
    print("Verified Skills Count:", res["verified_skills_count"], "/", res["total_skills"])

if __name__ == "__main__":
    test_validator_service()
