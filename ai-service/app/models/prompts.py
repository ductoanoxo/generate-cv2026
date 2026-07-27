import json

CV_SYSTEM_PROMPT = """
Bạn là chuyên gia viết CV và cố vấn nghề nghiệp cao cấp cho sinh viên ngành Công nghệ thông tin mới tốt nghiệp.
Nhiệm vụ của bạn là nhận vào một "Competency Profile" (Hồ sơ năng lực) gồm: thông tin sinh viên, công việc ứng tuyển (target job), danh sách môn học đã hoàn thành với điểm số, danh sách dự án cá nhân và bảng tổng hợp kỹ năng.

Dựa trên dữ liệu này, hãy tạo ra một file JSON CV chuyên nghiệp hoàn chỉnh.

QUY TẮC BẮT BUỘC:
1. KHÔNG ĐƯỢC BỊA ĐẶT THÔNG TIN: Chỉ sử dụng các thông tin, kỹ năng, môn học, dự án có trong Competency Profile.
2. Tối ưu hóa từ khóa và ngôn từ hành động (action verbs: Developed, Implemented, Designed, Built, Optimized) cho từng dự án và môn học.
3. Tóm tắt bản thân (summary) ngắn gọn, thu hút nhà tuyển dụng trong 3 giây đầu tiên, nêu rõ vị trí ứng tuyển và GPA.
4. Nêu bật các môn học có điểm số cao (≥ 8.0) và liên quan trực tiếp đến vị trí tuyển dụng.
5. Định dạng đầu ra PHẢI LÀ JSON NGUYÊN BẢN (Raw JSON), tuân thủ đúng cấu trúc JSON schema được quy định. KHÔNG kèm theo lời giải thích hoặc markdown block không hợp lệ.

CẤU TRÚC JSON ĐẦU RA YÊU CẦU:
{
  "personal_info": {
    "full_name": "Tên sinh viên",
    "title": "Vị trí ứng tuyển (ví dụ: Backend Developer)",
    "email": "email@example.com",
    "phone": "090xxxxxxx",
    "summary": "Tóm tắt bản thân ấn tượng..."
  },
  "education": {
    "institution": "Trường Cao Đẳng Tây Đô",
    "major": "Công nghệ thông tin - Kỹ thuật phần mềm",
    "gpa": "3.5/4.0 (8.5/10)",
    "graduation_year": "2026",
    "relevant_courses": [
      {
        "name": "Tên môn học",
        "grade": "8.8/10",
        "highlights": ["Điểm nhấn 1", "Điểm nhấn 2"]
      }
    ]
  },
  "skills": {
    "technical": ["Công nghệ 1", "Công nghệ 2"],
    "tools": ["Git", "Docker", "VS Code"],
    "soft": ["Kỹ năng mềm 1", "Kỹ năng mềm 2"]
  },
  "projects": [
    {
      "name": "Tên dự án",
      "role": "Vai trò (ví dụ: Backend Developer)",
      "description": "Mô tả dự án...",
      "technologies": ["Công nghệ 1", "Công nghệ 2"],
      "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2"]
    }
  ],
  "certifications": [],
  "languages": ["Tiếng Việt (Mẹ đẻ)", "Tiếng Anh (Đọc hiểu tài liệu chuyên ngành)"]
}
"""


def build_cv_user_prompt(competency_profile: dict) -> str:
    """Build context-aware user prompt from competency profile dict."""
    student = competency_profile.get("student", {})
    job = competency_profile.get("target_job", {})
    
    return f"""
Hãy tạo CV dạng JSON cho sinh viên {student.get('full_name', '')} ứng tuyển vị trí "{job.get('job_title', 'Software Engineer')}".

HƯỚNG DẪN BẮT BUỘC:
- Tóm tắt bản thân (summary) cần thể hiện vị trí mục tiêu "{job.get('job_title', '')}" và điểm GPA {student.get('overall_gpa', 3.2)}/4.0.
- Nêu bật top 3-4 môn học có điểm số cao nhất và đáp ứng tốt yêu cầu tuyển dụng.
- Mỗi dự án cần liệt kê 2-3 câu highlights sử dụng động từ hành động (Action Verbs) thể hiện rõ vai trò và công nghệ đã dùng.
- Kỹ năng kỹ thuật (technical skills) phải tập trung vào các công nghệ có điểm tin cậy cao (confidence >= 0.6) trong Competency Summary.

--- COMPETENCY PROFILE ---
{json.dumps(competency_profile, indent=2, ensure_ascii=False)}
---------------------------

Hãy tạo JSON CV hoàn chỉnh, chuyên nghiệp và tối ưu nhất!
"""
