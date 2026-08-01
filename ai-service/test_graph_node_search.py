import sys
import types


def _service_module(name: str, attribute: str, value: object) -> None:
    module = types.ModuleType(name)
    setattr(module, attribute, value)
    sys.modules[name] = module


services_package = types.ModuleType("app.services")
sys.modules["app.services"] = services_package
vector_search_service = types.SimpleNamespace(search=lambda **_: [])
_service_module("app.services.jd_parser_service", "jd_parser_service", types.SimpleNamespace(parse=lambda _: {}))
_service_module("app.services.embedding_service", "embedding_service", object())
_service_module("app.services.vector_search_service", "vector_search_service", vector_search_service)
_service_module("app.services.project_scraper_service", "project_scraper_service", object())
_service_module("app.services.competency_service", "competency_service", object())
_service_module("app.services.cv_generator_service", "cv_generator_service", object())
_service_module("app.services.validator_service", "validator_service", object())
_service_module("app.services.ats_optimizer_service", "ats_optimizer_service", object())

from app.graph import node_search_courses


def test_vector_search_enriches_selected_course_without_replacing_real_grade(monkeypatch):
    monkeypatch.setattr(
        vector_search_service,
        "search",
        lambda **_: [
            {
                "score": 0.92,
                "payload": {
                    "subject_code": "IT101",
                    "subject_name": "Lập trình Web",
                    "content": "Xây dựng ứng dụng web với React và API.",
                },
            }
        ],
    )

    result = node_search_courses(
        {
            "jd_raw_text": "Tuyển Frontend Developer React",
            "selected_courses": [
                {
                    "course_id": "IT101",
                    "course_name": "Lập trình Web",
                    "grade": 9.2,
                    "credit_point": 3,
                }
            ],
        }
    )

    assert result["matched_courses"] == [
        {
            "course_id": "IT101",
            "course_name": "Lập trình Web",
            "grade": 9.2,
            "credit_point": 3,
            "similarity_score": 0.92,
            "clos": ["Xây dựng ứng dụng web với React và API."],
        }
    ]


def test_vector_search_with_required_skills(monkeypatch):
    queries_logged = []

    def mock_search(query, limit=5, **kwargs):
        queries_logged.append((query, limit))
        if "Docker" in query or "Kỹ năng công nghệ" in query:
            return [
                {
                    "id": 1,
                    "score": 0.88,
                    "payload": {
                        "subject_code": "502CNTH20",
                        "subject_name": "Điện toán đám mây & DevOps",
                        "content": "Triển khai CI/CD và Docker container.",
                    },
                }
            ]
        return []

    monkeypatch.setattr(vector_search_service, "search", mock_search)

    result = node_search_courses(
        {
            "jd_raw_text": "Paymentology DevOps Engineer JD long text...",
            "target_job": {
                "job_title": "DevOps Engineer",
                "required_skills": ["Docker", "Kubernetes", "AWS"]
            },
            "selected_courses": [
                {
                    "course_id": "502CNTH20",
                    "course_name": "Điện toán đám mây & DevOps",
                    "grade": 8.5,
                }
            ],
        }
    )

    assert len(result["matched_courses"]) == 1
    assert result["matched_courses"][0]["course_id"] == "502CNTH20"
    assert result["matched_courses"][0]["similarity_score"] == 0.88
    # Ensure query was built from required_skills
    assert "Kỹ năng công nghệ: Docker, Kubernetes, AWS" in queries_logged[0][0]

