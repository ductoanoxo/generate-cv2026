import json
import logging
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

OPTIMIZE_SYSTEM_PROMPT = (
    "You are an expert CV optimizer for Applicant Tracking Systems (ATS). "
    "Your job is to REWRITE and REORDER the CV content so it matches the job description keywords, "
    "while staying 100% grounded in the original CV data.\n"
    "STRICT GROUNDING RULES (never break them):\n"
    "- NEVER invent, add, or fabricate skills, companies, projects, dates, numbers, or achievements "
    "that are not present in the original CV.\n"
    "- Only reword phrasing and reorder skills so relevant keywords appear earlier.\n"
    "- Keep all proper nouns (company names, project names, technology names) exactly as-is.\n"
    "- Keep the SAME number of skills, projects, and experience entries as the input.\n"
    "- Return a single JSON object with EXACTLY this structure (no markdown fences, no extra text):\n"
    '{\n'
    '  "summary": "<rewritten summary>",\n'
    '  "skills": ["<reordered skills, JD-matching ones first>"],\n'
    '  "projects": [{"name": "...", "role": "...", "description": "..."}],\n'
    '  "experience": [{"role": "...", "description": "..."}],\n'
    '  "recommendations": ["<short, concrete optimization tips (2-4 items)>"]\n'
    "}\n"
)


class AutoOptimizeService:

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
                {"role": "system", "content": OPTIMIZE_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 3000,
            "response_format": {"type": "json_object"},
        }
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            logger.warning(f"Auto-optimize API returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Auto-optimize API error: {e}")
        return None

    @staticmethod
    def _merge_grounded(
        cv_data: Dict[str, Any], llm: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], List[str]]:
        out = json.loads(json.dumps(cv_data))
        recommendations: List[str] = llm.get("recommendations") or []

        # Summary: accept any non-empty rewrite.
        if isinstance(llm.get("summary"), str) and llm["summary"].strip():
            out["summary"] = llm["summary"].strip()

        # Skills: only keep skills that already exist in the original CV (grounding),
        # in the LLM-recommended order, then re-append any original skills not kept.
        original_skills = [str(s).strip() for s in cv_data.get("skills", []) if str(s).strip()]
        original_lower = {s.lower() for s in original_skills}
        new_order: List[str] = []
        seen = set()
        for skill in (llm.get("skills") or []):
            s = str(skill).strip()
            if s.lower() in original_lower and s.lower() not in seen:
                new_order.append(s)
                seen.add(s.lower())
        for skill in original_skills:
            if skill.lower() not in seen:
                new_order.append(skill)
                seen.add(skill.lower())
        if new_order:
            out["skills"] = new_order

        # Projects / Experience: apply reworded fields by index, keep originals as fallback.
        def merge_items(key: str, fields: List[str]):
            src = out.get(key) or []
            tr = llm.get(key) or []
            for i, item in enumerate(src):
                if i >= len(tr) or not isinstance(tr[i], dict):
                    continue
                for f in fields:
                    val = tr[i].get(f)
                    if isinstance(val, str) and val.strip():
                        item[f] = val.strip()

        merge_items("projects", ("name", "role", "description"))
        merge_items("experience", ("role", "description"))

        return out, recommendations

    async def optimize_cv(
        self, cv_data: Dict[str, Any], jd_text: str
    ) -> Tuple[Dict[str, Any], List[str]]:
        prompt = (
            "### JOB DESCRIPTION (JD):\n"
            f"{jd_text}\n\n"
            "### CURRENT CV DATA:\n"
            f"{json.dumps(cv_data, ensure_ascii=False, indent=2)}\n"
        )
        try:
            raw = await self._call_openai(prompt)
            if raw:
                cleaned = raw.strip().strip("`")
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip().strip("`")
                parsed = json.loads(cleaned)
                if isinstance(parsed, dict):
                    return self._merge_grounded(cv_data, parsed)
        except Exception as e:
            logger.warning(f"Auto-optimize LLM failed, returning original CV: {e}")
        return cv_data, []


auto_optimize_service = AutoOptimizeService()
