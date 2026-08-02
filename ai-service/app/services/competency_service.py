import re
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────
# Layer 2: Synonym-based Semantic Matching
# Maps a skill keyword to known synonyms / alternative names
# ────────────────────────────────────────────────────────────────
SKILL_SYNONYMS: Dict[str, List[str]] = {
    "react": ["reactjs", "react.js", "react native"],
    "vue": ["vuejs", "vue.js", "nuxt"],
    "angular": ["angularjs", "angular.js"],
    "nextjs": ["next.js", "next js"],
    "asp.net core": ["asp.net", ".net core", "dotnet core", "aspnet"],
    ".net": ["dotnet", "dot net"],
    "c#": ["csharp", "c sharp"],
    "c++": ["cpp"],
    "fastapi": ["fast api"],
    "django": ["django rest framework", "drf"],
    "spring boot": ["spring framework", "springboot"],
    "node.js": ["nodejs", "node"],
    "express": ["expressjs", "express.js"],
    "rest api": ["restful", "restful api", "web api", "api", "web service", "endpoint"],
    "graphql": ["graph ql"],
    "postgresql": ["postgres", "pgsql"],
    "mysql": ["mariadb"],
    "mongodb": ["mongo"],
    "sql": ["truy vấn", "query", "cơ sở dữ liệu"],
    "database": ["cơ sở dữ liệu", "csdl", "quản trị dữ liệu"],
    "docker": ["container", "containerize", "đóng gói"],
    "kubernetes": ["k8s"],
    "ci/cd": ["cicd", "continuous integration", "continuous deployment", "github actions", "jenkins"],
    "git": ["version control", "quản lý phiên bản"],
    "python": ["py"],
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "machine learning": ["ml", "học máy", "trí tuệ nhân tạo", "ai"],
    "deep learning": ["dl", "học sâu", "neural network", "mạng nơ-ron"],
    "nlp": ["natural language processing", "xử lý ngôn ngữ tự nhiên"],
    "html": ["html5"],
    "css": ["css3", "scss", "sass", "less"],
    "tailwind": ["tailwindcss", "tailwind css"],
    "jwt": ["json web token", "xác thực", "authentication"],
}

# ────────────────────────────────────────────────────────────────
# Layer 3: Category-based Matching
# Group related technologies into categories
# ────────────────────────────────────────────────────────────────
CATEGORY_MAP: Dict[str, List[str]] = {
    "web_frontend": ["react", "vue", "angular", "svelte", "nextjs", "html", "css", "tailwind", "bootstrap", "frontend", "giao diện web"],
    "web_backend": ["java", "spring", "spring boot", "jmix", "vaadin", "c++", "c#", "asp.net", "asp.net core", ".net", "fastapi", "django", "flask", "express", "nestjs", "node.js", "backend", "rest api", "graphql"],
    "database": ["postgresql", "oracle", "mysql", "mongodb", "redis", "sql", "sqlite", "cơ sở dữ liệu", "database", "supabase", "orm", "db2"],
    "domain_knowledge": ["core banking", "banking", "thought machine", "symbols", "foreign exchange", "fx platform", "financial accounting", "custody banking", "anti-money laundering", "aml", "compliance", "tài chính", "ngân hàng"],
    "devops_cloud": ["docker", "kubernetes", "aws", "azure", "ci/cd", "nginx", "git", "github", "prometheus", "grafana", "draw.io", "figma", "monitoring", "telemetry", "alerting"],
    "business_skills": ["crm", "lark", "erp", "odoo", "customer relationship management", "enterprise resource planning", "quản trị doanh nghiệp"],
    "ai_data": ["python", "machine learning", "deep learning", "nlp", "pandas", "numpy", "pytorch", "tensorflow", "openai", "llm", "trí tuệ nhân tạo"],
}

# Minimum number of category keywords that must appear in text for a category match
CATEGORY_MATCH_MIN_KEYWORDS = 2
GOOD_GRADE_THRESHOLD = 7.0

DEFAULT_SOFT_SKILLS = [
    "Tư duy logic & Giải quyết vấn đề",
    "Làm việc nhóm & Giao tiếp",
    "Tự học & Nghiên cứu công nghệ mới",
    "Quản lý thời gian & Tiến độ dự án",
]

# ────────────────────────────────────────────────────────────────
# Display names for skill categories on the CV
# Maps internal CATEGORY_MAP keys → professional display labels
# ────────────────────────────────────────────────────────────────
SKILL_DISPLAY_CATEGORIES: Dict[str, str] = {
    "web_backend": "Backend & Programming Skills",
    "database": "Databases & Data Management",
    "domain_knowledge": "Domain Knowledge",
    "devops_cloud": "DevOps, Tools & Monitoring",
    "business_skills": "Business Skills",
    "web_frontend": "Frontend & UI Development",
    "ai_data": "AI, Data Science & Machine Learning",
}

SOFT_SKILLS_CATEGORY = "Soft Skills & Methodologies"
GENERAL_SKILLS_CATEGORY = "General Technical Skills"




class CompetencyService:
    """
    Competency Profile Engine — Ngày 7
    Tổng hợp dữ liệu từ 4 nguồn (Student, JD, Courses, Projects)
    để xây dựng hồ sơ năng lực với Skill Matching 3 lớp + Confidence Score.
    """

    def __init__(self):
        pass

    # ── Layer 1: Exact Match ───────────────────────────────────
    def _is_exact_match(self, skill: str, text: str) -> bool:
        """Check if skill appears as an exact word/phrase in text."""
        if not skill or not text:
            return False
        escaped = re.escape(skill.lower().strip())
        # Use word-boundary for alphanumeric; contains-check for symbols like C#, .NET
        if re.match(r'^[\w\s]+$', skill):
            pattern = r'\b' + escaped + r'\b'
        else:
            pattern = escaped
        return bool(re.search(pattern, text.lower()))

    # ── Layer 2: Semantic (Synonym) Match ──────────────────────
    def _is_semantic_match(self, skill: str, text: str) -> bool:
        """Check if any known synonym of the skill appears in text."""
        skill_lower = skill.lower().strip()
        text_lower = text.lower()
        synonyms = SKILL_SYNONYMS.get(skill_lower, [])
        return any(syn in text_lower for syn in synonyms)

    # ── Layer 3: Category Match ────────────────────────────────
    def _get_skill_category(self, skill: str) -> Optional[str]:
        """Get technology category for a skill."""
        skill_lower = skill.lower().strip()
        for category, kws in CATEGORY_MAP.items():
            for kw in kws:
                if kw in skill_lower or skill_lower in kw:
                    return category
        return None

    def _is_category_match(self, skill: str, text: str) -> bool:
        """
        Check if text contains enough keywords from the same skill category.
        Requires at least CATEGORY_MATCH_MIN_KEYWORDS hits to reduce false positives.
        """
        category = self._get_skill_category(skill)
        if not category:
            return False
        text_lower = text.lower()
        hit_count = sum(1 for kw in CATEGORY_MAP[category] if kw in text_lower)
        return hit_count >= CATEGORY_MATCH_MIN_KEYWORDS

    # ── Combined Matching ──────────────────────────────────────
    def _match_skills_for_item(self, required_skills: List[str], text_content: str) -> List[str]:
        """
        Find which required skills match a given text content using 3-layer matching:
        Layer 1 (Exact) → Layer 2 (Semantic/Synonym) → Layer 3 (Category).
        """
        matched = []
        for skill in required_skills:
            if (self._is_exact_match(skill, text_content)
                    or self._is_semantic_match(skill, text_content)
                    or self._is_category_match(skill, text_content)):
                matched.append(skill)
        return list(set(matched))

    # ── Confidence Scoring ─────────────────────────────────────
    def _calculate_confidence(
        self,
        skill: str,
        matched_courses: List[Dict[str, Any]],
        matched_projects: List[Dict[str, Any]],
    ) -> Tuple[float, List[str]]:
        """
        Confidence = (similarity × 0.4) + (grade/10 × 0.4) + (evidence_count/3 × 0.2)
        Clamped to [0.5, 1.0].
        """
        evidences: List[str] = []
        max_similarity = 0.5
        max_grade = 7.0

        for c in matched_courses:
            course_id = c.get("course_id") or c.get("subjectCode") or c.get("course_name") or "Course"
            evidences.append(str(course_id))
            sim = float(c.get("similarity_score") or (c.get("matchPercentage", 50) / 100.0) or 0.7)
            max_similarity = max(max_similarity, sim)
            grade = float(c.get("grade") or c.get("combinedResult") or 8.0)
            max_grade = max(max_grade, grade)

        for p in matched_projects:
            proj_name = p.get("project_name") or p.get("name") or "Project"
            evidences.append(str(proj_name))
            max_similarity = max(max_similarity, 0.85)

        evidence_score = min(1.0, len(evidences) / 3.0)
        grade_score = min(1.0, max_grade / 10.0)
        sim_score = min(1.0, max_similarity)

        confidence = round((sim_score * 0.4) + (grade_score * 0.4) + (evidence_score * 0.2), 2)
        return min(1.0, max(0.5, confidence)), list(set(evidences))

    # ── Soft Skills Extraction ─────────────────────────────────
    def _extract_soft_skills(self, courses: List[Dict[str, Any]]) -> List[str]:
        """Extract soft skills from CLOs where possible, fall back to defaults."""
        SOFT_KEYWORDS = {
            "teamwork": "Làm việc nhóm & Giao tiếp",
            "nhóm": "Làm việc nhóm & Giao tiếp",
            "giao tiếp": "Làm việc nhóm & Giao tiếp",
            "communication": "Làm việc nhóm & Giao tiếp",
            "thuyết trình": "Thuyết trình & Trình bày ý tưởng",
            "presentation": "Thuyết trình & Trình bày ý tưởng",
            "problem solving": "Tư duy logic & Giải quyết vấn đề",
            "giải quyết vấn đề": "Tư duy logic & Giải quyết vấn đề",
            "tư duy": "Tư duy logic & Giải quyết vấn đề",
            "quản lý": "Quản lý thời gian & Tiến độ dự án",
            "time management": "Quản lý thời gian & Tiến độ dự án",
            "tự học": "Tự học & Nghiên cứu công nghệ mới",
            "self-learning": "Tự học & Nghiên cứu công nghệ mới",
        }
        found: set = set()
        for c in courses:
            clos = c.get("clos", [])
            desc = c.get("course_description", "")
            text = f"{desc} {' '.join(clos)}".lower()
            for keyword, label in SOFT_KEYWORDS.items():
                if keyword in text:
                    found.add(label)
        return list(found)

    # ── Smart Skill Categorization ──────────────────────────────
    def _categorize_skills(
        self,
        technical_summary: List[Dict[str, Any]],
        soft_skills: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Group technical + soft skills into display categories
        using CATEGORY_MAP + SKILL_DISPLAY_CATEGORIES.
        Returns ordered list of {category, items} dicts.
        """
        grouped: Dict[str, List[str]] = {}

        for entry in technical_summary:
            skill = entry["skill"]
            cat_key = self._get_skill_category(skill)
            display_name = (
                SKILL_DISPLAY_CATEGORIES.get(cat_key, GENERAL_SKILLS_CATEGORY)
                if cat_key else GENERAL_SKILLS_CATEGORY
            )
            grouped.setdefault(display_name, [])
            if skill not in grouped[display_name]:
                grouped[display_name].append(skill)

        # Soft skills as last group
        if soft_skills:
            grouped.setdefault(SOFT_SKILLS_CATEGORY, [])
            for ss in soft_skills:
                if ss not in grouped[SOFT_SKILLS_CATEGORY]:
                    grouped[SOFT_SKILLS_CATEGORY].append(ss)

        # Build ordered list — defined categories first, then general, then soft
        ordered = []
        seen = set()
        for _cat_key, display_name in SKILL_DISPLAY_CATEGORIES.items():
            if display_name in grouped and display_name not in seen:
                ordered.append({"category": display_name, "items": grouped[display_name]})
                seen.add(display_name)

        if GENERAL_SKILLS_CATEGORY in grouped and GENERAL_SKILLS_CATEGORY not in seen:
            ordered.append({"category": GENERAL_SKILLS_CATEGORY, "items": grouped[GENERAL_SKILLS_CATEGORY]})
            seen.add(GENERAL_SKILLS_CATEGORY)

        if SOFT_SKILLS_CATEGORY in grouped and SOFT_SKILLS_CATEGORY not in seen:
            ordered.append({"category": SOFT_SKILLS_CATEGORY, "items": grouped[SOFT_SKILLS_CATEGORY]})

        return ordered

    # ── Main Entry Point ───────────────────────────────────────
    def build_profile(
        self,
        student_info: Dict[str, Any],
        target_job: Dict[str, Any],
        selected_courses: List[Dict[str, Any]],
        projects: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Build full Competency Profile from student info, target job, courses & projects.
        """
        job_title = target_job.get("job_title", "Software Engineer")
        required_skills = target_job.get("required_skills", [])
        if isinstance(required_skills, str):
            required_skills = [s.strip() for s in required_skills.split(",") if s.strip()]

        # Process selected courses & annotate matched skills
        processed_courses = []
        for course in selected_courses:
            course_text = (
                f"{course.get('course_name', '')} "
                f"{course.get('course_description', '')} "
                f"{' '.join(course.get('clos', []))}"
            )
            grade = float(course.get("grade") or course.get("combinedResult") or 0)
            matched_skills = (
                self._match_skills_for_item(required_skills, course_text)
                if grade >= GOOD_GRADE_THRESHOLD else []
            )

            c_dict = {
                "course_id": course.get("course_id") or course.get("subjectCode", "CS101"),
                "course_name": course.get("course_name") or course.get("subjectName", "Course"),
                "grade": grade,
                "credit_point": int(course.get("credit_point") or course.get("creditPoint") or 3),
                "similarity_score": round(
                    float(course.get("similarity_score") or (course.get("matchPercentage", 70) / 100.0)), 2
                ),
                "course_description": course.get("course_description") or f"Học phần {course.get('course_name', '')}",
                "clos": course.get("clos") or course.get("matchedKeywords") or [],
                "matched_skills": matched_skills,
            }
            processed_courses.append(c_dict)

        # Process projects & annotate matched skills
        processed_projects = []
        for proj in projects:
            techs = proj.get("technologies", [])
            if isinstance(techs, str):
                techs = [t.strip() for t in techs.split(",") if t.strip()]
            proj_text = (
                f"{proj.get('project_name', '')} "
                f"{proj.get('role', '')} "
                f"{proj.get('description', '')} "
                f"{' '.join(techs)}"
            )
            matched_skills = self._match_skills_for_item(required_skills, proj_text)

            p_dict = {
                "project_name": proj.get("project_name") or proj.get("name", "Personal Project"),
                "role": proj.get("role", "Developer"),
                "description": proj.get("description", ""),
                "technologies": techs,
                "github_url": proj.get("github_url") or proj.get("html_url", ""),
                "highlights": proj.get("highlights") or [],
                "matched_skills": matched_skills,
            }
            processed_projects.append(p_dict)

        # Compute Technical Skills Competency Summary
        technical_summary = []
        for skill in required_skills:
            matching_courses = [
                c for c in processed_courses
                if skill in c["matched_skills"] and c.get("grade", 0) >= GOOD_GRADE_THRESHOLD
            ]
            matching_projects = [p for p in processed_projects if skill in p["matched_skills"]]

            conf_score, evidences = self._calculate_confidence(skill, matching_courses, matching_projects)

            if matching_courses or matching_projects:
                technical_summary.append({
                    "skill": skill,
                    "confidence": conf_score,
                    "evidence": evidences,
                })

        # Extract soft skills from course CLOs
        soft_skills = self._extract_soft_skills([
            c for c in processed_courses if c.get("grade", 0) >= GOOD_GRADE_THRESHOLD
        ])
        categorized_skills = self._categorize_skills(technical_summary, soft_skills)

        languages = [str(language).strip() for language in student_info.get("languages", []) if str(language).strip()]

        import datetime
        current_year = datetime.datetime.now().year
        academic_year_val = str(student_info.get("academic_year") or "2022-2026")
        start_year_match = re.search(r'\b(20\d{2})\b', academic_year_val)
        start_year = int(start_year_match.group(1)) if start_year_match else 2022
        year_level = max(1, current_year - start_year)
        student_year_label = f"Năm thứ {year_level}"

        # Final Competency Profile Structure
        profile = {
            "student": {
                "student_id": student_info.get("student_id") or student_info.get("username") or "SV001",
                "full_name": student_info.get("full_name") or student_info.get("fullName") or "Sinh viên Tây Đô",
                "email": student_info.get("email"),
                "phone": student_info.get("phone") or student_info.get("phoneNumber"),
                "major": student_info.get("major") or "Công nghệ thông tin",
                "specialization": student_info.get("specialization") or "Kỹ thuật phần mềm",
                "academic_year": academic_year_val,
                "student_year": student_year_label,
                "overall_gpa": float(student_info.get("overall_gpa") or student_info.get("gpa") or 3.2),
                "overall_percentage": float(student_info.get("overall_percentage") or 8.0),
            },
            "target_job": {
                "job_title": job_title,
                "required_skills": required_skills,
            },
            "selected_courses": processed_courses,
            "projects": processed_projects,
            "languages": languages,
            "competency_summary": {
                "technical_skills": technical_summary,
                "soft_skills": soft_skills,
                "categorized_skills": categorized_skills,
            },
        }

        return profile


competency_service = CompetencyService()


