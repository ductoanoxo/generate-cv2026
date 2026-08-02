import io

from docx import Document
from app.services.mau07_service import mau07_service


def test_mau07_fills_header_fields():
    profile = {
        "fullName": "Đặng Đức Toàn",
        "email": "toan@example.com",
        "phoneNumber": "0901234567",
        "gender": "Nam",
        "birthDate": "15/08/2003",
        "faculty": "Công nghệ thông tin",
        "major": "Công nghệ thông tin",
        "academicYear": "2022-2026",
        "gpa": 3.6,
    }
    experience = {
        "company": "Công ty TNHH ABC",
        "role": "Thực tập sinh Backend",
        "period": "01/06/2025 - 30/08/2025",
        "description": "Phát triển API với ASP.NET Core và React.",
        "companyAddress": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
        "mentorName": "Nguyễn Văn Hướng Dẫn",
    }

    docx_bytes = mau07_service.generate(profile, experience)
    assert len(docx_bytes) > 0
    assert docx_bytes.startswith(b"PK")  # valid zip (docx container)

    doc = Document(io.BytesIO(docx_bytes))
    texts = [p.text for p in doc.paragraphs]

    def line_starting(label):
        for t in texts:
            if "".join(t.split()).startswith("".join(label.split())):
                return t
        return None

    assert "Đặng Đức Toàn" in line_starting("Họ và tên sinh viên:")
    assert "15/08/2003" in line_starting("Ngày sinh:")
    assert "2022-2026" in line_starting("Lớp:")
    assert "01/06/2025 - 30/08/2025" in line_starting("Thời gian thực tập:")
    assert "Công ty TNHH ABC" in line_starting("Doanh nghiệp thực tập:")
    assert "123 Nguyễn Văn Linh, Quận 7, TP.HCM" in line_starting("Địa chỉ doanh nghiệp:")
    assert "Nguyễn Văn Hướng Dẫn" in line_starting("Chuyên gia doanh nghiệp hướng dẫn:")

    # Template structural integrity is preserved
    assert len(doc.tables) == 3
    assert any("BẢNG ĐÁNH GIÁ QUÁ TRÌNH THỰC TẬP TỐT NGHIỆP" in t for t in texts)
    table_texts = [c.text for table in doc.tables for row in table.rows for c in row.cells]
    assert any("XÁC NHẬN CỦA DOANH NGHIỆP" in t for t in table_texts)
    print("\n✅ Mau07 template-fill test PASSED!")


def test_mau07_empty_fields_leave_template_untouched():
    profile = {"fullName": "Test SV", "birthDate": "01/01/2000", "studentCode": "SV001"}
    experience = {"company": "Công ty XYZ"}

    docx_bytes = mau07_service.generate(profile, experience)
    doc = Document(io.BytesIO(docx_bytes))
    texts = [p.text for p in doc.paragraphs]
    joined = "".join(texts)

    # Unfilled fields keep their template lines untouched (no dotted leaders in other fields)
    assert "Lớp : \t\t" in joined
    assert "Thời gian thực tập:  \t\t" in joined
    # Filled ones are present
    assert "Test SV" in joined
    assert "Công ty XYZ" in joined
    print("✅ Mau07 empty-field test PASSED!")


if __name__ == "__main__":
    test_mau07_fills_header_fields()
    test_mau07_empty_fields_leave_template_untouched()
