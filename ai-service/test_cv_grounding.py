from app.services.cv_generator_service import cv_generator_service


def test_grounding_removes_llm_invented_data():
    profile = {
        "student": {"student_id": "SV1", "full_name": "Nguyễn A", "email": "a@example.com", "phone": "0123", "major": "CNTT", "specialization": "KTPM", "overall_gpa": 3.2, "overall_percentage": 8.0, "languages": ["Tiếng Anh"]},
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
    assert grounded["skills"]["tools"] == []
    assert grounded["skills"]["technical"] == ["Linux", "Docker"]
    assert grounded["languages"] == ["Tiếng Anh"]
    assert grounded["projects"][0]["technologies"] == ["Docker"]
