# 🛠️ Prompt Thực Thi: Fix Vector Search Matching Trong CV Pipeline

## Mục Tiêu

Sửa hàm `node_search_courses` trong file `ai-service/app/graph.py` để vector search Qdrant trả về kết quả chính xác hơn khi JD dài, thay vì rơi vào fallback trả `user_courses` gốc không có enrichment.

## Tham Khảo

- Phân tích chi tiết: `docs/analysis_vector_search_issue.md`

---

## Các Thay Đổi Cần Thực Hiện

### Task 1: Cải thiện query strategy trong `node_search_courses` (`ai-service/app/graph.py`)

**File:** `ai-service/app/graph.py`  
**Hàm:** `node_search_courses` (dòng 54-108)

**Yêu cầu thay đổi:**

1. **Ưu tiên dùng `required_skills` từ `state["target_job"]`** để xây dựng search query thay vì gửi toàn bộ `jd_raw_text`.
   - Nếu `required_skills` có dữ liệu → Nối thành chuỗi ngắn: `"Kỹ năng yêu cầu: Docker, Kubernetes, CI/CD, AWS, Terraform, Python, Bash, Linux, Kafka, Git"`
   - Nếu `required_skills` rỗng → Fallback lấy `jd_text[:500]` (chỉ phần đầu JD, bỏ phần company intro/equal opportunity/fraud warning)

2. **Tăng `limit` từ 5 lên 20** để có nhiều candidates hơn cho matching.

3. **Thêm multi-query strategy**: Ngoài query tổng hợp, thêm query riêng từng skill (top 3 mỗi skill) rồi merge kết quả, deduplicate theo `subject_code`, giữ score cao nhất.

4. **Giữ nguyên matching logic hiện tại** (so khớp `subject_code`/`subject_name` giữa Qdrant results ↔ `user_courses`), nhưng bổ sung thêm fuzzy matching: normalize cả hai bên về lowercase + strip + remove dấu trước khi so sánh.

5. **Log rõ ràng hơn**: Log ra số lượng Qdrant results, số matched, và danh sách subject_code matched để dễ debug.

**Code mẫu tham khảo:**

```python
def node_search_courses(state: CVPipelineState) -> CVPipelineState:
    """Step 2: Perform Vector Search in Qdrant for matching courses."""
    logger.info("[Pipeline Step 2] Vector Searching Courses...")
    jd_text = state.get("jd_raw_text", "")
    if not jd_text and state.get("parsed_jd"):
        jd_text = state["parsed_jd"].get("text", "")
        
    if not jd_text:
        return {"matched_courses": state.get("selected_courses") or []}

    try:
        # --- FIX 1: Build focused search query from required_skills ---
        target_job = state.get("target_job", {})
        required_skills = target_job.get("required_skills", [])
        
        if required_skills:
            search_query = f"Kỹ năng công nghệ: {', '.join(required_skills)}"
        else:
            search_query = jd_text[:500]
        
        logger.info(f"[Step 2] Search query ({len(search_query)} chars): {search_query[:200]}...")
        
        # --- FIX 2: Increase limit to 20 ---
        search_res = vector_search_service.search(query=search_query, limit=20)
        
        # --- FIX 3: Multi-query per individual skill ---
        if required_skills:
            seen_ids = {r.get("id") for r in search_res}
            for skill in required_skills[:10]:  # Cap at 10 skills to avoid too many API calls
                skill_results = vector_search_service.search(query=skill, limit=3)
                for sr in skill_results:
                    if sr.get("id") not in seen_ids:
                        search_res.append(sr)
                        seen_ids.add(sr.get("id"))
        
        logger.info(f"[Step 2] Total Qdrant results (after multi-query): {len(search_res)}")
        
        user_courses = state.get("selected_courses") or []
        if not user_courses:
            return {"matched_courses": []}

        def course_keys(course: Dict[str, Any]) -> set[str]:
            return {
                str(value).strip().lower()
                for value in (
                    course.get("course_id"),
                    course.get("subjectCode"),
                    course.get("course_name"),
                    course.get("subjectName"),
                )
                if value
            }

        matched_courses = []
        matched_codes = set()
        for item in search_res:
            payload = item.get("payload", {})
            result_keys = {
                str(value).strip().lower()
                for value in (payload.get("subject_code"), payload.get("subject_name"), payload.get("name"))
                if value
            }
            selected_course = next((course for course in user_courses if course_keys(course) & result_keys), None)
            if not selected_course:
                continue

            course_code = (selected_course.get("course_id") or selected_course.get("subjectCode") or payload.get("subject_code", ""))
            if course_code in matched_codes:
                continue  # Deduplicate
            matched_codes.add(course_code)

            enriched_course = dict(selected_course)
            enriched_course["course_id"] = enriched_course.get("course_id") or payload.get("subject_code")
            enriched_course["course_name"] = enriched_course.get("course_name") or payload.get("subject_name")
            enriched_course["similarity_score"] = item.get("score", 0)
            clos = list(enriched_course.get("clos") or [])
            if payload.get("content") and payload["content"] not in clos:
                clos.append(payload["content"])
            enriched_course["clos"] = clos
            matched_courses.append(enriched_course)

        logger.info(f"[Step 2] Matched {len(matched_courses)} courses: {list(matched_codes)}")
        return {"matched_courses": matched_courses or user_courses}
    except Exception as e:
        logger.warning(f"Vector search failed in pipeline: {e}. Using selected courses.")
        return {"matched_courses": state.get("selected_courses") or []}
```

---

### Task 2: (Không bắt buộc) Thêm method `search_multi_query` vào `vector_search_service.py`

**File:** `ai-service/app/services/vector_search_service.py`

Nếu muốn tách logic multi-query ra service riêng cho sạch, thêm method mới:

```python
def search_multi_query(
    self,
    queries: List[str],
    limit_per_query: int = 3,
    type_filter: Optional[str] = None,
    department: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Run multiple queries and merge results, deduplicating by point ID,
    keeping the highest score for each unique result.
    """
    all_results: Dict[int, Dict[str, Any]] = {}
    for q in queries:
        results = self.search(
            query=q,
            limit=limit_per_query,
            type_filter=type_filter,
            department=department,
        )
        for r in results:
            rid = r["id"]
            if rid not in all_results or r["score"] > all_results[rid]["score"]:
                all_results[rid] = r
    # Sort by score descending
    return sorted(all_results.values(), key=lambda x: x["score"], reverse=True)
```

---

## Ràng Buộc

- **KHÔNG thay đổi** cấu trúc `CVPipelineState`, input/output interface, hay các node khác trong graph.
- **KHÔNG thay đổi** `embedding_service.py`, `competency_service.py`, `seed_vectors.py`.
- **Giữ nguyên** fallback `matched_courses or user_courses` — chỉ cải thiện khả năng match trước khi rơi vào fallback.
- **Giữ nguyên** tất cả comments và docstrings hiện có không liên quan đến code thay đổi.
- Đảm bảo **backward compatible**: nếu `required_skills` rỗng hoặc thiếu, vẫn hoạt động bình thường.

## Kiểm Tra Sau Khi Fix

1. Chạy pipeline với JD DevOps Paymentology → phải match được ít nhất 2-4 môn (502CNTH20, 502CNTH18, 502CNLT25, 502CSTH09).
2. Chạy pipeline với JD ngắn (ví dụ: "React, Node.js, SQL developer") → vẫn match được các môn frontend/backend/database.
3. Chạy pipeline khi `required_skills` rỗng → fallback sang `jd_text[:500]` query, không crash.
4. Kiểm tra log output có đủ thông tin debug: số Qdrant results, số matched, danh sách codes.
