import sys
sys.path.insert(0, ".")

from app.services.project_scraper_service import ProjectScraperService


svc = ProjectScraperService()

MARKDOWN_README = """# E-Commerce Platform

## About / Giới thiệu
A full-stack e-commerce platform with real-time inventory tracking and payment integration. Built for small businesses.

## Features / Tính năng
- **User authentication** with JWT
- Real-time order tracking via WebSocket
- Admin dashboard with analytics
- [PayPal integration](https://paypal.com)
- `npm run dev` local setup

## Installation
npm install && npm start
"""


def test_extract_sections_parses_markdown_headings():
    sections = svc.extract_sections_from_readme(MARKDOWN_README)
    assert "About / Giới thiệu" in sections
    assert "Features / Tính năng" in sections
    assert "inventory tracking" in sections["About / Giới thiệu"]
    assert "npm install && npm start" in sections["Installation"]


def test_extract_sections_empty_readme():
    assert svc.extract_sections_from_readme("") == {}
    assert svc.extract_sections_from_readme(None) == {}


def test_build_project_summary_prefers_about_section():
    summary = svc.build_project_summary(
        {"description": "Short repo description."}, MARKDOWN_README
    )
    assert "real-time inventory tracking" in summary
    assert "small businesses" in summary


def test_build_project_summary_uses_description_when_no_about():
    readme = "## Installation\nnpm install"
    summary = svc.build_project_summary({"description": "Repo description text."}, readme)
    assert summary == "Repo description text."


def test_build_project_summary_falls_back_to_first_paragraph():
    readme = "A one line intro without any heading.\n\nThen more text that is not used."
    summary = svc.build_project_summary({"description": ""}, readme)
    assert "A one line intro without any heading." in summary


def test_build_project_summary_truncates_at_sentence_boundary():
    long_text = "First sentence that is quite long. " * 30
    summary = svc.build_project_summary({"description": long_text}, "", max_len=200)
    assert len(summary) <= 205
    assert summary.endswith(".")


def test_extract_features_skips_install_commands():
    features = svc.extract_features_from_readme(MARKDOWN_README)
    assert "User authentication with JWT" in features
    assert "Real-time order tracking via WebSocket" in features
    assert not any("npm run dev" in f for f in features)
    assert not any("npm install" in f for f in features)


def test_extract_features_deduplicates():
    readme = "## Features\n- Alpha feature\n- Alpha feature\n- Beta feature"
    features = svc.extract_features_from_readme(readme)
    assert features == ["Alpha feature", "Beta feature"]


def test_strip_markdown_removes_formatting():
    text = "**bold** [link](https://example.com) `code` :rocket:"
    cleaned = svc._strip_markdown(text)
    assert "bold" in cleaned
    assert "link" in cleaned
    assert "code" in cleaned
    assert "https://example.com" not in cleaned
    assert "rocket" not in cleaned


def test_parse_llm_summary_accepts_clean_json():
    raw = '{"description": "Mô tả dự án.", "highlights": ["Xây dựng tính năng A", "Tối ưu hiệu năng"]}'
    parsed = svc._parse_llm_summary(raw)
    assert parsed["description"] == "Mô tả dự án."
    assert parsed["highlights"] == ["Xây dựng tính năng A", "Tối ưu hiệu năng"]


def test_parse_llm_summary_accepts_markdown_fence():
    raw = '```json\n{"description": "desc", "highlights": ["h1"]}\n```'
    parsed = svc._parse_llm_summary(raw)
    assert parsed["description"] == "desc"
    assert parsed["highlights"] == ["h1"]


def test_parse_llm_summary_rejects_invalid():
    assert svc._parse_llm_summary("not json at all") is None
    assert svc._parse_llm_summary("") is None
    assert svc._parse_llm_summary('{"description": ""}') is None


def test_summarize_project_with_llm_returns_none_without_keys(monkeypatch):
    import asyncio
    from app.config import settings
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)
    result = asyncio.run(svc.summarize_project_with_llm(
        {"name": "app", "description": "desc"}, "summary", ["feature"]
    ))
    assert result is None
