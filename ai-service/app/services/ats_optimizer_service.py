import json
import logging
import re
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class ATSOptimizerService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    def analyze_ats(
        self,
        cv_data: Dict[str, Any],
        jd_text: str,
        competency_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze CV against JD using LLM and keyword matching to provide ATS score and recommendations.
        """
        if self.api_key:
            try:
                return self._analyze_with_llm(cv_data, jd_text, competency_profile)
            except Exception as e:
                logger.error(f"Error calling LLM for ATS optimization: {e}. Falling back to rule-based analysis.")
                return self._analyze_rule_based(cv_data, jd_text, competency_profile)
        else:
            return self._analyze_rule_based(cv_data, jd_text, competency_profile)

    def _analyze_with_llm(
        self,
        cv_data: Dict[str, Any],
        jd_text: str,
        competency_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        prompt = f"""
Bạn là một chuyên gia hệ thống ATS (Applicant Tracking System) và nhà tuyển dụng cao cấp.
Hãy phân tích dữ liệu CV và Mô tả công việc (JD) dưới đây để tính điểm ATS (0-100) và đưa ra các gợi ý tối ưu hóa chi tiết.

### DỮ LIỆU CV:
{json.dumps(cv_data, ensure_ascii=False, indent=2)}

### MÔ TẢ CÔNG VIỆC (JD):
{jd_text}

### YÊU CẦU ĐẦU RA:
Trả về KẾT QUẢ DUY NHẤT dưới dạng JSON hợp lệ (không kèm Markdown block ```json, không kèm giải thích bên ngoài) theo cấu trúc chính xác sau:

{{
  "ats_score": 85.5,
  "breakdown": {{
    "keyword_match_score": 80.0,
    "skills_coverage_score": 90.0,
    "formatting_score": 85.0,
    "experience_relevance_score": 85.0
  }},
  "matched_keywords": ["Python", "FastAPI", "React", "Docker"],
  "missing_keywords": ["Kubernetes", "CI/CD", "Redis"],
  "strengths": [
    "Các kỹ năng chuyên môn phù hợp tốt với mô tả công việc.",
    "Bố cục thông tin cá nhân và dự án rõ ràng."
  ],
  "weaknesses": [
    "Thiếu các từ khóa quan trọng về DevOps như CI/CD.",
    "Mục Tóm tắt cá nhân (Summary) chưa làm nổi bật định hướng công việc."
  ],
  "recommendations": [
    "Bổ sung từ khóa 'CI/CD' và 'Redis' vào mục Kỹ năng hoặc Mô tả dự án nếu đã từng làm.",
    "Viết lại phần Summary nhấn mạnh vào vị trí tuyển dụng."
  ]
}}
"""
        model_name = settings.LLM_MODEL or "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {"parts": [{"text": prompt}]},
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        }

        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                cleaned_text = re.sub(r"^```json\s*", "", raw_text.strip(), flags=re.MULTILINE)
                cleaned_text = re.sub(r"```$", "", cleaned_text, flags=re.MULTILINE).strip()
                return json.loads(cleaned_text)
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}. Falling back to rule-based.")
                return self._analyze_rule_based(cv_data, jd_text, competency_profile)


    def _analyze_rule_based(
        self,
        cv_data: Dict[str, Any],
        jd_text: str,
        competency_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Rule-based fallback calculation for ATS score.
        """
        jd_words = set(re.findall(r'\b[a-zA-Z0-9+#.#-]{2,}\b', jd_text.lower()))
        
        def extract_skill_strings(data) -> List[str]:
            res = []
            if isinstance(data, str):
                if data.strip(): res.append(data.strip())
            elif isinstance(data, list):
                for item in data: res.extend(extract_skill_strings(item))
            elif isinstance(data, dict):
                for k, v in data.items():
                    if k != "category": res.extend(extract_skill_strings(v))
            return res

        cv_skills = set([s.lower() for s in extract_skill_strings(cv_data.get("skills", []))])
        if competency_profile:
            skills_from_prof = competency_profile.get("skills", [])
            if not skills_from_prof and "competency_summary" in competency_profile:
                tech_skills = competency_profile["competency_summary"].get("technical_skills", [])
                skills_from_prof = [item["skill"] for item in tech_skills if isinstance(item, dict) and "skill" in item]
            cv_skills.update([s.lower() for s in extract_skill_strings(skills_from_prof)])


        # Extract words from projects & summary
        summary = cv_data.get("summary", "").lower()
        projects_text = " ".join([
            f"{p.get('name', '')} {p.get('role', '')} {p.get('description', '')} {' '.join(p.get('technologies', []))}"
            for p in cv_data.get("projects", [])
        ]).lower()
        
        all_cv_text = f"{summary} {' '.join(cv_skills)} {projects_text}"
        cv_words = set(re.findall(r'\b[a-zA-Z0-9+#.#-]{2,}\b', all_cv_text))

        # Check matched keywords among common tech terms
        matched_words = [word for word in cv_skills if word in jd_text.lower()]
        missing_keywords = [word for word in jd_words if len(word) > 3 and word not in cv_words][:5]

        # Calculate basic score
        skills_score = min(100.0, len(cv_skills) * 10.0) if cv_skills else 50.0
        keyword_score = min(100.0, (len(matched_words) / max(1, len(cv_skills))) * 100.0) if cv_skills else 60.0
        formatting_score = 90.0 if cv_data.get("profile") and cv_data.get("projects") else 70.0
        experience_score = 80.0 if cv_data.get("projects") or cv_data.get("experience") else 60.0

        overall_score = round(
            (keyword_score * 0.35) + (skills_score * 0.30) + (formatting_score * 0.15) + (experience_score * 0.20), 1
        )

        return {
            "ats_score": overall_score,
            "breakdown": {
                "keyword_match_score": round(keyword_score, 1),
                "skills_coverage_score": round(skills_score, 1),
                "formatting_score": round(formatting_score, 1),
                "experience_relevance_score": round(experience_score, 1)
            },
            "matched_keywords": [w.capitalize() for w in list(matched_words)[:10]],
            "missing_keywords": [w.capitalize() for w in missing_keywords],
            "strengths": [
                "Bố cục thông tin CV cơ bản đầy đủ các mục quan trọng.",
                "Đã liệt kê danh sách kỹ năng chuyên môn phù hợp."
            ],
            "weaknesses": [
                "Cần bổ sung thêm một số từ khóa kỹ thuật có trong yêu cầu công việc."
            ],
            "recommendations": [
                "Điều chỉnh phần Tóm tắt cá nhân để nhấn mạnh các kỹ năng cốt lõi được yêu cầu trong JD.",
                "Đảm bảo các tên dự án trình bày rõ ràng công nghệ và vai trò đảm nhận."
            ]
        }


ats_optimizer_service = ATSOptimizerService()
