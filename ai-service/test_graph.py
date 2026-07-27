import asyncio
from app.graph import cv_pipeline_graph

async def test_full_pipeline():
    initial_state = {
        "student_info": {
            "student_id": "SV001",
            "full_name": "Minh Hải",
            "email": "minhhai@taydo.edu.vn",
            "major": "Công nghệ thông tin",
            "overall_gpa": 3.6
        },
        "target_job": {
            "job_title": "Backend Developer",
            "required_skills": ["Python", "FastAPI", "Docker", "PostgreSQL"]
        },
        "jd_raw_text": "Tuyển dụng Backend Developer kinh nghiệm Python, FastAPI, Docker, PostgreSQL và Redis.",
        "selected_courses": [
            {
                "course_name": "Lập trình Web nâng cao",
                "clos": ["Phát triển Web API với Python và FastAPI"],
                "grade": 9.0
            }
        ],
        "projects": [
            {
                "name": "CV Generation System",
                "role": "Backend Lead",
                "description": "Xây dựng hệ thống sinh CV AI bằng Python, FastAPI và Docker.",
                "technologies": ["Python", "FastAPI", "Docker"]
            }
        ]
    }

    res = await cv_pipeline_graph.ainvoke(initial_state)

    print("Pipeline Execution Completed!")
    print("CV Generated Keys:", list(res.get("generated_cv", {}).keys()))
    print("ATS Score:", res.get("ats_report", {}).get("ats_score"))
    print("Validation Evidence Score:", res.get("validation_report", {}).get("evidence_score"))

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
