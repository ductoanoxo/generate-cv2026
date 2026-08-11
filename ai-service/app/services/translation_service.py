import json
import logging
import re
import unicodedata
from typing import Any, Dict, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

TRANSLATE_SYSTEM_PROMPT = (
    "You are a professional CV translator (Vietnamese -> English). "
    "Translate CV text fields into natural, professional, ATS-friendly English. "
    "STRICT RULES:\n"
    "- Return a single JSON object with EXACTLY the same keys as the input object.\n"
    "- Preserve proper nouns, company/brand names, technology names (Python, React, Docker...), "
    "numbers, dates, and any text that is already English.\n"
    "- For Vietnamese personal names, preserve the name and order but transliterate to Latin letters without diacritics.\n"
    "- Translate Vietnamese text accurately; do not invent, add, or remove content.\n"
    "- Do NOT add or remove any key or field.\n"
)

# Lightweight glossary fallback applied when the LLM is unavailable.
_FALLBACK_PHRASES = {
    "kỹ thuật phần mềm": "software engineering",
    "trường cao đẳng tây đô": "tay do college",
    "cao đẳng": "college",
    "chuyên ngành": "major",
    "thực tập": "internship",
    "kinh nghiệm làm việc": "work experience",
    "kinh nghiệm": "experience",
    "dự án": "project",
    "chứng chỉ": "certificate",
    "hoạt động ngoại khóa": "extracurricular activities",
    "hoạt động": "activity",
    "ngoại ngữ": "foreign languages",
    "tiếng anh": "english",
    "giao tiếp": "communication",
    "làm việc nhóm": "teamwork",
    "giải quyết vấn đề": "problem solving",
    "tư duy phản biện": "critical thinking",
    "tự học": "self-learning",
    "quản lý thời gian": "time management",
    "học tập": "learning",
    "xây dựng": "build",
    "phát triển": "develop",
    "triển khai": "implement",
    "thiết kế": "design",
    "phân tích": "analyze",
    "kiểm thử": "testing",
    "quản lý": "manage",
    "nghiên cứu": "research",
    "tham gia": "participate",
    "đạt được": "achieve",
    "chịu trách nhiệm": "responsible for",
    "người dùng": "users",
    "ứng dụng": "application",
    "hệ thống": "system",
    "dữ liệu": "data",
}


class TranslationService:

    def _extract_translatable(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        profile = cv_data.get("profile", {})
        return {
            "summary": cv_data.get("summary", ""),
            "skills": cv_data.get("skills", []),
            "languages": cv_data.get("languages", []),
            "activities": cv_data.get("activities", []),
            "projects": [
                {
                    "name": p.get("name", ""),
                    "role": p.get("role", ""),
                    "description": p.get("description", ""),
                    "technologies": p.get("technologies", []),
                }
                for p in cv_data.get("projects", [])
            ],
            "experience": [
                {
                    "company": e.get("company", ""),
                    "role": e.get("role", ""),
                    "description": e.get("description", ""),
                }
                for e in cv_data.get("experience", [])
            ],
            "education": [
                {
                    "school": ed.get("school", ""),
                    "major": ed.get("major", ""),
                    "degree": ed.get("degree", ""),
                }
                for ed in cv_data.get("education", [])
            ],
            "categorizedSkills": [
                {
                    "category": group.get("category", ""),
                    "items": group.get("items", []),
                }
                for group in cv_data.get("categorizedSkills", [])
            ],
            "certifications": [
                {"certificationName": c.get("certificationName", "")}
                for c in cv_data.get("certifications", [])
            ],
            "profile": {
                "fullName": profile.get("fullName", ""),
                "faculty": profile.get("faculty", ""),
                "major": profile.get("major", ""),
                "hometown": profile.get("hometown", ""),
            },
        }

    def _merge(self, cv_data: Dict[str, Any], translated: Dict[str, Any]) -> Dict[str, Any]:
        out = json.loads(json.dumps(cv_data))
        if translated.get("summary"):
            out["summary"] = translated["summary"]

        def replace_list(key: str, item_keys):
            tr = translated.get(key)
            src = out.get(key)
            if isinstance(tr, list) and isinstance(src, list) and len(tr) == len(src):
                for i, item in enumerate(tr):
                    if isinstance(item, dict):
                        for k in item_keys:
                            if item.get(k):
                                src[i][k] = item[k]

        replace_list("skills", ())
        if isinstance(translated.get("skills"), list) and len(translated["skills"]) == len(out.get("skills", [])):
            out["skills"] = translated["skills"]
        replace_list("languages", ())
        if isinstance(translated.get("languages"), list) and len(translated["languages"]) == len(out.get("languages", [])):
            out["languages"] = translated["languages"]
        replace_list("activities", ())
        if isinstance(translated.get("activities"), list) and len(translated["activities"]) == len(out.get("activities", [])):
            out["activities"] = translated["activities"]

        replace_list("projects", ("name", "role", "description", "technologies"))
        replace_list("experience", ("company", "role", "description"))
        replace_list("education", ("school", "major", "degree"))
        replace_list("categorizedSkills", ("category", "items"))
        replace_list("certifications", ("certificationName",))

        tr_profile = translated.get("profile")
        if isinstance(tr_profile, dict):
            for k in ("fullName", "faculty", "major", "hometown"):
                if tr_profile.get(k):
                    out["profile"][k] = tr_profile[k]

        profile = out.get("profile")
        if isinstance(profile, dict) and isinstance(profile.get("fullName"), str):
            normalized_name = unicodedata.normalize("NFD", profile["fullName"])
            normalized_name = "".join(
                char for char in normalized_name
                if unicodedata.category(char) != "Mn"
            )
            profile["fullName"] = normalized_name.translate(str.maketrans({"đ": "d", "Đ": "D"}))
        return out

    def _glossary_text(self, text: str) -> str:
        if not text:
            return text
        result = text
        for vi, en in _FALLBACK_PHRASES.items():
            result = re.sub(re.escape(vi), en, result, flags=re.IGNORECASE)
        return result

    def _fallback_translate(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        payload = self._extract_translatable(cv_data)

        def translate_value(value: Any) -> Any:
            if isinstance(value, str):
                return self._glossary_text(value)
            if isinstance(value, dict):
                return {k: translate_value(v) for k, v in value.items()}
            if isinstance(value, list):
                return [translate_value(v) for v in value]
            return value

        return self._merge(cv_data, translate_value(payload))

    async def _call_openai(self, prompt: str) -> Optional[str]:
        if not settings.OPENAI_API_KEY:
            return None
        is_openrouter = settings.OPENAI_API_KEY.startswith("sk-or-")
        url = (
            "https://openrouter.ai/api/v1/chat/completions"
            if is_openrouter
            else "https://api.openai.com/v1/chat/completions"
        )
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        model_name = settings.LLM_MODEL
        if is_openrouter and "/" not in model_name:
            model_name = f"openai/{model_name}"
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": TRANSLATE_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 8000,
            "response_format": {"type": "json_object"},
        }
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            logger.warning(f"Translation API returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Translation API error: {e}")
        return None

    async def translate_cv(self, cv_data: Dict[str, Any], target_lang: str = "en") -> Dict[str, Any]:
        if target_lang != "en":
            return cv_data
        payload = self._extract_translatable(cv_data)
        try:
            prompt = json.dumps(payload, ensure_ascii=False)
            raw = await self._call_openai(prompt)
            if raw:
                cleaned = raw.strip().strip("`")
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip().strip("`")
                parsed = json.loads(cleaned)
                if isinstance(parsed, dict):
                    return self._merge(cv_data, parsed)
        except Exception as e:
            logger.warning(f"LLM translation failed, using glossary fallback: {e}")
        return self._fallback_translate(cv_data)


translation_service = TranslationService()
