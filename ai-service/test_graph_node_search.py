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
