# 🛠️ Prompt Thực Thi: Nhóm Kỹ Năng Kỹ Thuật (Categorized Competences)

## Mục Tiêu

Cải thiện phần "Kỹ năng kỹ thuật" trong CV từ danh sách phẳng thành các nhóm kỹ năng có tổ chức, chuyên nghiệp. Tái sử dụng `CATEGORY_MAP` và `_get_skill_category()` đã có sẵn trong `competency_service.py` thay vì keyword matching thô.

## Tham Khảo

- Phân tích chi tiết: `docs/analysis_skill_categorization.md`

## Đầu Ra Mong Đợi

**Trước (flat list):**
```
Docker, Kubernetes, Python, Bash, AWS, PostgreSQL, Terraform, Git, CI/CD, Linux
```

**Sau (categorized):**
```
COMPETENCES
* DevOps, Tools & Infrastructure: Docker, Kubernetes, Terraform, AWS, CI/CD, Git, Linux, Bash.
* Backend & Programming Skills: Python, Java.
* Databases & Data Management: PostgreSQL, Kafka.
* Soft Skills & Methodologies: Agile Scrum, Technical Troubleshooting, Cross-functional Collaboration.
```

---

## Task 1: Thêm smart categorization vào `competency_service.py`

**File:** `ai-service/app/services/competency_service.py`

### Bước 1.1: Thêm constants sau `DEFAULT_SOFT_SKILLS` (sau dòng 69)

```python
# ────────────────────────────────────────────────────────────────
# Display names for skill categories on the CV
# Maps internal CATEGORY_MAP keys → professional display labels
# ────────────────────────────────────────────────────────────────
SKILL_DISPLAY_CATEGORIES: Dict[str, str] = {
    "web_frontend": "Frontend & UI Development",
    "web_backend": "Backend & Programming Skills",
    "database": "Databases & Data Management",
    "devops_cloud": "DevOps, Tools & Infrastructure",
    "ai_data": "AI, Data Science & Machine Learning",
}

SOFT_SKILLS_CATEGORY = "Soft Skills & Methodologies"
GENERAL_SKILLS_CATEGORY = "General Technical Skills"
```

### Bước 1.2: Thêm method `_categorize_skills` vào class `CompetencyService`

Thêm method mới **trước** method `build_profile` (trước dòng 203):

```python
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
```

### Bước 1.3: Gọi `_categorize_skills` trong `build_profile()` và thêm vào output

Tìm đoạn code xây dựng `profile` dict cuối hàm `build_profile()`. Thêm `categorized_skills` vào `competency_summary`.

**Trước block `profile = {` (khoảng dòng 306), thêm:**

```python
categorized_skills = self._categorize_skills(technical_summary, soft_skills)
```

**Trong dict `competency_summary` bên trong `profile`, thêm key mới:**

```python
"competency_summary": {
    "technical_skills": technical_summary,
    "soft_skills": soft_skills,
    "categorized_skills": categorized_skills,  # ← THÊM DÒNG NÀY
},
```

---

## Task 2: Cập nhật `cv_generator_service.py` dùng categorized từ profile

**File:** `ai-service/app/services/cv_generator_service.py`

### Bước 2.1: Thay thế block phân nhóm thô trong `generate_fallback_cv()`

Tìm block hiện tại (khoảng dòng 139-148):

```python
"skills": {
    "categorized": [
        {"category": "Backend & Programming Skills", "items": [s for s in tech_skills if not any(kw in s.lower() for kw in ['sql', 'postgres', 'mysql', 'mongo', 'docker', 'git', 'ci/cd'])] or tech_skills},
        {"category": "Databases & Data Management", "items": [s for s in tech_skills if any(kw in s.lower() for kw in ['sql', 'postgres', 'mysql', 'mongo', 'redis', 'db', 'oracle'])] or ["PostgreSQL", "MySQL"]},
        {"category": "DevOps, Tools & Infrastructure", "items": [s for s in tech_skills if any(kw in s.lower() for kw in ['docker', 'git', 'ci/cd', 'linux', 'aws', 'kubernetes'])] or ["Docker", "Git", "GitHub"]},
        {"category": "Soft Skills & Methodologies", "items": competency_summary.get("soft_skills", []) or ["Agile Scrum", "Technical Troubleshooting", "Teamwork & Communication"]},
    ],
    "technical": tech_skills,
    "tools": [],
    "soft": competency_summary.get("soft_skills", []),
},
```

**Thay thế bằng:**

```python
# Build categorized skills from competency profile (smart categorization)
profile_categorized = competency_summary.get("categorized_skills", [])
if not profile_categorized:
    # Legacy fallback when profile doesn't have categorized_skills
    profile_categorized = [
        {"category": "Technical Skills", "items": tech_skills},
    ]
    if competency_summary.get("soft_skills"):
        profile_categorized.append({
            "category": "Soft Skills & Methodologies",
            "items": competency_summary["soft_skills"],
        })
```

Sau đó trong dict `cv_json`, cập nhật key `"skills"`:

```python
"skills": {
    "categorized": profile_categorized,
    "technical": tech_skills,
    "tools": [],
    "soft": competency_summary.get("soft_skills", []),
},
```

---

## Task 3: Đảm bảo `_ground_cv_in_profile()` giữ lại categorized data

**File:** `ai-service/app/services/cv_generator_service.py`

Hàm `_ground_cv_in_profile()` (dòng 43-63) hiện gọi `self.generate_fallback_cv(profile)` rồi chỉ giữ lại `summary` từ LLM. Vì `generate_fallback_cv()` giờ đã dùng `categorized_skills` từ profile → **không cần sửa logic**, categorized data tự động được preserve.

**Kiểm tra:** Đọc lại hàm `_ground_cv_in_profile()` sau khi sửa Task 2, đảm bảo nó KHÔNG ghi đè `skills.categorized` bằng giá trị khác.

---

## Ràng Buộc

- **KHÔNG thay đổi** `CATEGORY_MAP`, `SKILL_SYNONYMS`, `_get_skill_category()`, `_is_exact_match()`, `_is_semantic_match()`, `_is_category_match()` — chỉ **tái sử dụng** chúng
- **KHÔNG thay đổi** `CVPipelineState`, router endpoints, hoặc frontend TypeScript
- **KHÔNG thay đổi** `prompts.py`, `embedding_service.py`, `vector_search_service.py`, `graph.py`
- **Backward compatible**: nếu `categorized_skills` thiếu trong profile cũ → fallback vẫn hoạt động
- **KHÔNG tạo dữ liệu giả**: xóa các nhánh `or ["PostgreSQL", "MySQL"]`, `or tech_skills` — chỉ hiển thị skill mà sinh viên thực sự có evidence
- **Giữ nguyên** tất cả comments, docstrings hiện có không liên quan đến code thay đổi
- Mỗi skill chỉ xuất hiện trong **đúng 1 nhóm**, không được lặp giữa các categories

---

## Kiểm Tra Sau Khi Fix

1. **Unit test `test_competency.py`**: Chạy `python ai-service/test_competency.py` → `competency_summary` phải có key `categorized_skills` là list `[{category, items}]`, mỗi item có ít nhất 1 skill.

2. **Categorization đúng nhóm**: Với `required_skills = ["ASP.NET Core", "REST API", "Docker", "PostgreSQL", "React"]`:
   - `"ASP.NET Core"`, `"REST API"` → nằm trong "Backend & Programming Skills"
   - `"Docker"` → nằm trong "DevOps, Tools & Infrastructure"
   - `"PostgreSQL"` → nằm trong "Databases & Data Management"
   - `"React"` → nằm trong "Frontend & UI Development"

3. **Không trùng lặp**: Mỗi skill chỉ xuất hiện trong đúng 1 category, không bị lặp.

4. **Backward compat**: Nếu xóa `categorized_skills` khỏi profile output → `cv_generator_service` vẫn tạo được fallback `categorized` list.

5. **Full pipeline**: Chạy full pipeline qua API `/api/generate-cv/full` → response `cv.skills.categorized` phải trả về đúng format `[{category, items}]`.
