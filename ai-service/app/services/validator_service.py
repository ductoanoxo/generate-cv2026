import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class ValidatorService:
    """
    Evidence Validator Service — Ngày 9
    Xác thực từng skill/claim trong CV xem có bằng chứng thật từ môn học (CLO/Grades)
    hoặc dự án cá nhân (Projects/GitHub Tech Stack) hay không.
    """

    def validate_cv_evidence(
        self,
        cv_data: Dict[str, Any],
        competency_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate skills and claims in CV against competency profile evidence.
        """
        skills_raw = cv_data.get("skills", [])
        def extract_skill_strings(data) -> List[str]:
            res = []
            if isinstance(data, str):
                if data.strip():
                    res.append(data.strip())
            elif isinstance(data, list):
                for item in data:
                    res.extend(extract_skill_strings(item))
            elif isinstance(data, dict):
                for k, v in data.items():
                    if k == "category":
                        continue
                    res.extend(extract_skill_strings(v))
            return res

        skills_in_cv = list(dict.fromkeys(extract_skill_strings(skills_raw)))
            
        projects = cv_data.get("projects", [])

        
        # Extract evidence sources
        course_evidence = []
        project_evidence = []

        if competency_profile:
            courses = competency_profile.get("selected_courses", [])
            for c in courses:
                course_name = c.get("course_name", "")
                clos = c.get("clos", [])
                grade = c.get("grade", 0)
                course_evidence.append({
                    "course_name": course_name,
                    "clos": clos,
                    "grade": grade
                })

            prof_projects = competency_profile.get("projects", [])
            for p in prof_projects:
                p_name = p.get("project_name") or p.get("name", "")
                project_evidence.append({
                    "name": p_name,
                    "technologies": [t.lower() for t in p.get("technologies", [])],
                    "description": p.get("description", "")
                })

        else:
            for p in projects:
                techs = p.get("technologies", []) if isinstance(p, dict) else getattr(p, "technologies", [])
                name = p.get("name", "") if isinstance(p, dict) else getattr(p, "name", "")
                project_evidence.append({
                    "name": name,
                    "technologies": [t.lower() for t in techs],
                    "description": p.get("description", "") if isinstance(p, dict) else getattr(p, "description", "")
                })

        validated_skills = []
        total_skills = len(skills_in_cv)
        skills_with_evidence_count = 0

        for skill in skills_in_cv:
            if not isinstance(skill, str):
                continue
            skill_lower = skill.lower()
            matched_sources = []

            # 1. Check in Projects tech stack / description
            for proj in project_evidence:
                if any(skill_lower in tech for tech in proj["technologies"]) or skill_lower in proj["description"].lower():
                    matched_sources.append({
                        "type": "project",
                        "title": f"Dự án: {proj['name']}",
                        "detail": f"Công nghệ/Mô tả dự án có chứa '{skill}'"
                    })

            # 2. Check in Courses / CLOs
            for course in course_evidence:
                clos_str = " ".join(course["clos"]).lower()
                c_name = course["course_name"].lower()
                if skill_lower in c_name or skill_lower in clos_str:
                    matched_sources.append({
                        "type": "course",
                        "title": f"Môn học: {course['course_name']} (Điểm: {course['grade']})",
                        "detail": f"Nội dung/CLO môn học khớp với kỹ năng '{skill}'"
                    })

            has_evidence = len(matched_sources) > 0
            if has_evidence:
                skills_with_evidence_count += 1

            validated_skills.append({
                "skill": skill,
                "has_evidence": has_evidence,
                "confidence_status": "VERIFIED ✅" if has_evidence else "UNVERIFIED ⚠️",
                "evidence_sources": matched_sources
            })

        evidence_rate = round((skills_with_evidence_count / total_skills) * 100, 1) if total_skills > 0 else 100.0

        return {
            "is_valid": evidence_rate >= 60.0,
            "evidence_score": evidence_rate,
            "total_skills": total_skills,
            "verified_skills_count": skills_with_evidence_count,
            "unverified_skills_count": total_skills - skills_with_evidence_count,
            "skills_validation": validated_skills,
            "summary_message": (
                f"Đã xác thực thành công {skills_with_evidence_count}/{total_skills} kỹ năng ({evidence_rate}% có bằng chứng rõ ràng từ môn học & dự án)."
                if evidence_rate >= 60.0 else
                f"Cảnh báo: Có {total_skills - skills_with_evidence_count}/{total_skills} kỹ năng chưa tìm thấy bằng chứng rõ ràng trong danh sách môn học hoặc dự án."
            )
        }


validator_service = ValidatorService()
