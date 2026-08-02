import re
import json
import asyncio
import logging
import copy
from typing import Dict, Any, Optional
import httpx

from app.config import settings
from app.models.prompts import CV_SYSTEM_PROMPT, build_cv_user_prompt

logger = logging.getLogger(__name__)

# Required top-level keys in a valid CV JSON response
REQUIRED_CV_KEYS = {"personal_info", "education", "skills", "projects"}

# Max retries for LLM API calls
MAX_LLM_RETRIES = 2


class CVGeneratorService:
    """
    CV Generator Service — Ngày 7
    Sử dụng LLM (Gemini / OpenAI) để sinh CV JSON từ Competency Profile.
    Khi LLM không khả dụng → fallback sang deterministic engine.
    """

    def __init__(self):
        pass

    def _clean_json_text(self, text: str) -> str:
        """Strip markdown codeblock wrappers if LLM returns ```json ... ```."""
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        return text.strip()

    def _validate_cv_schema(self, cv_json: dict) -> bool:
        """Validate that LLM response contains all required top-level keys."""
        return REQUIRED_CV_KEYS.issubset(cv_json.keys())

    def _ground_cv_in_profile(self, llm_cv: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
        """Apply a deterministic evidence boundary after LLM generation.

        The model may invent contact details, tools, courses, languages, or project
        technologies.  Rebuilding the data-bearing sections from the competency
        profile guarantees that only user/evidence-backed values reach the UI.
        """
        grounded = self.generate_fallback_cv(profile)
        if isinstance(llm_cv, dict) and llm_cv.get("personal_info", {}).get("summary"):
            grounded["personal_info"]["summary"] = llm_cv["personal_info"]["summary"]

        if isinstance(llm_cv.get("projects"), list):
            source_projects = profile.get("projects", [])
            for index, project in enumerate(grounded.get("projects", [])):
                if index < len(source_projects):
                    source = source_projects[index]
                    project["name"] = source.get("project_name", source.get("name", project["name"]))
                    project["role"] = source.get("role", project["role"])
                    project["description"] = source.get("description", project["description"])
                    project["technologies"] = list(source.get("technologies", []))
                    if source.get("highlights"):
                        project["highlights"] = source["highlights"]
        return copy.deepcopy(grounded)

    # ── Fallback Engine ────────────────────────────────────────
    def generate_fallback_cv(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a deterministic, high-quality CV JSON directly from competency profile
        when LLM API key is not configured or LLM service is unreachable.
        """
        student = profile.get("student", {})
        target_job = profile.get("target_job", {})
        selected_courses = profile.get("selected_courses", [])
        projects = profile.get("projects", [])
        competency_summary = profile.get("competency_summary", {})

        job_title = target_job.get("job_title", "Software Engineer")
        student_name = student.get("full_name", "Sinh viên Tây Đô")

        # Build relevant courses strictly from matched selected_courses
        relevant_courses = []
        for c in selected_courses:
            grade_val = c.get("grade", 8.0)
            clos = c.get("clos", [])
            relevant_courses.append({
                "name": c.get("course_name", "Học phần"),
                "grade": f"{grade_val:.1f}/10",
                "highlights": clos[:2] if clos else ["Hoàn thành tốt các đồ án và kiến thức môn học."],
            })

        # Build technical skills (only confidence >= 0.6)
        competency_skills = [
            t["skill"]
            for t in competency_summary.get("technical_skills", [])
            if t.get("confidence", 0) >= 0.6
        ]

        # Project technologies are evidence-backed skills, not placeholder tools.
        all_techs = set()
        for p in projects:
            for t in p.get("technologies", []):
                all_techs.add(t)
        tech_skills = list(dict.fromkeys(competency_skills + sorted(all_techs)))

        # Build projects with dynamic highlights
        formatted_projects = []
        for p in projects:
            techs = p.get("technologies", [])
            tech_str = ", ".join(techs[:3]) if techs else "các công nghệ hiện đại"
            highlights = list(p.get("highlights") or [])
            if not highlights:
                highlights = [
                    f"Thiết kế và triển khai các tính năng core sử dụng {tech_str}.",
                    f"Đảm bảo chất lượng mã nguồn, viết documentation và tối ưu hiệu năng hệ thống.",
                ]
            if p.get("github_url"):
                highlights.append(f"Mã nguồn mở trên GitHub: {p['github_url']}")
            formatted_projects.append({
                "name": p.get("project_name", "Dự án cá nhân"),
                "role": p.get("role", job_title),
                "description": p.get("description", "Xây dựng ứng dụng hoàn chỉnh đáp ứng yêu cầu thực tế."),
                "technologies": techs,
                "highlights": highlights,
            })

        # Build categorized skills from competency profile (smart categorization)
        profile_categorized = competency_summary.get("categorized_skills", [])
        if not profile_categorized:
            profile_categorized = [
                {"category": "Technical Skills", "items": tech_skills},
            ]
            if competency_summary.get("soft_skills"):
                profile_categorized.append({
                    "category": "Soft Skills & Methodologies",
                    "items": competency_summary["soft_skills"],
                })

        cv_json = {
            "personal_info": {
                "full_name": student_name,
                "title": job_title,
                "email": student.get("email") or "",
                "phone": student.get("phone") or student.get("phoneNumber") or "",
                "summary": f"Sinh viên ngành {student.get('major', 'CNTT')} - {student.get('specialization', 'Kỹ thuật phần mềm')}, định hướng phát triển {job_title}.",
            },
            "education": {
                "institution": "Trường Cao Đẳng Tây Đô",
                "major": f"{student.get('major', 'CNTT')} - {student.get('specialization', 'Kỹ thuật phần mềm')}",
                "gpa": f"{student.get('overall_gpa', 3.2):.2f}/4.0 ({student.get('overall_percentage', 8.0):.1f}/10)",
                "graduation_year": student.get("graduation_year") or student.get("academic_year", "2026")[-4:],
                "relevant_courses": relevant_courses,
            },
            "skills": {
                "categorized": profile_categorized,
                "technical": tech_skills,
                "tools": [],
                "soft": competency_summary.get("soft_skills", []),
            },
            "projects": formatted_projects,
            "certifications": [],
            "languages": profile.get("languages") or student.get("languages", []),
        }
        return cv_json


    # ── LLM API Callers ────────────────────────────────────────
    async def _call_openai_llm(self, prompt: str) -> Optional[str]:
        """Call OpenAI directly or through OpenRouter when an sk-or key is configured."""
        if not settings.OPENAI_API_KEY:
            return None

        is_openrouter = settings.OPENAI_API_KEY.startswith("sk-or-")
        url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": f"openai/{settings.LLM_MODEL}" if is_openrouter else settings.LLM_MODEL,
            "messages": [
                {"role": "system", "content": CV_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            else:
                logger.warning(f"OpenAI API returned status {resp.status_code}: {resp.text[:200]}")
                return None

    async def _call_gemini_llm(self, prompt: str) -> Optional[str]:
        """Call Gemini API using the model specified in settings.LLM_MODEL."""
        if not settings.GEMINI_API_KEY:
            return None

        model_name = settings.LLM_MODEL or "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "system_instruction": {
                "parts": [{"text": CV_SYSTEM_PROMPT}],
            },
            "contents": [
                {"parts": [{"text": prompt}]},
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                logger.warning(f"Gemini API ({model_name}) returned status {resp.status_code}: {resp.text[:200]}")
                return None

    async def _call_with_retry(self, call_fn, prompt: str) -> Optional[str]:
        """Retry wrapper for LLM API calls."""
        for attempt in range(MAX_LLM_RETRIES):
            try:
                result = await call_fn(prompt)
                if result:
                    return result
            except httpx.TimeoutException:
                logger.warning(f"LLM timeout on attempt {attempt + 1}/{MAX_LLM_RETRIES}")
            except Exception as e:
                logger.warning(f"LLM error on attempt {attempt + 1}/{MAX_LLM_RETRIES}: {e}")
            if attempt < MAX_LLM_RETRIES - 1:
                await asyncio.sleep(1.0)
        return None

    # ── Main Entry Point ───────────────────────────────────────
    async def generate_cv(self, competency_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to generate structured CV JSON from Competency Profile.
        Priority: Gemini → OpenAI → Deterministic Fallback.
        """
        user_prompt = build_cv_user_prompt(competency_profile)
        raw_json_str = None

        # 1. Try Gemini API with retry
        if settings.GEMINI_API_KEY:
            raw_json_str = await self._call_with_retry(self._call_gemini_llm, user_prompt)

        # 2. Try OpenAI API with retry
        if not raw_json_str and settings.OPENAI_API_KEY:
            raw_json_str = await self._call_with_retry(self._call_openai_llm, user_prompt)

        # 3. Parse & validate LLM JSON result
        if raw_json_str:
            try:
                cleaned = self._clean_json_text(raw_json_str)
                cv_json = json.loads(cleaned)
                if self._validate_cv_schema(cv_json):
                    logger.info("Successfully generated and validated CV JSON via LLM.")
                    return self._ground_cv_in_profile(cv_json, competency_profile)
                else:
                    missing = REQUIRED_CV_KEYS - set(cv_json.keys())
                    logger.error(f"LLM response missing required keys: {missing}. Falling back...")
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response JSON: {e}. Falling back...")
            except Exception as e:
                logger.error(f"Unexpected error processing LLM response: {e}. Falling back...")

        # 4. Deterministic fallback generator
        logger.info("Using Deterministic Fallback CV Generator.")
        return self.generate_fallback_cv(competency_profile)


cv_generator_service = CVGeneratorService()
