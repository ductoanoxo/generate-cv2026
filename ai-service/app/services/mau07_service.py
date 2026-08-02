import io
import logging
import os
from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn

logger = logging.getLogger(__name__)

TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "templates",
    "mau07_TTTN_template.docx",
)


def _normalize(text: str) -> str:
    """Remove all whitespace/tabs for robust label matching."""
    return "".join(text.split())


class Mau07Service:
    """Fill the official Mẫu 07 (expert internship evaluation) DOCX template in place.

    The original layout (tables, fonts, watermark, signature blocks) is preserved
    100%: we only replace the blank header fields with student data.
    """

    def __init__(self, template_path: str | None = None):
        self.template_path = template_path or TEMPLATE_PATH

    def _find_paragraph(self, doc: Document, label: str):
        norm_label = _normalize(label)
        for p in doc.paragraphs:
            if _normalize(p.text).startswith(norm_label):
                return p
        return None

    def _fill_paragraph(self, paragraph, label: str, value: str):
        """Insert `value` right after the label run, dropping trailing tab/dot leaders."""
        norm_label = _normalize(label)
        acc = ""
        keep = 0
        for run in paragraph.runs:
            acc += _normalize(run.text)
            keep += 1
            if len(acc) >= len(norm_label):
                break

        for run in list(paragraph.runs[keep:]):
            run._element.getparent().remove(run._element)

        run = paragraph.add_run(value)
        run.font.size = Pt(13)
        run.font.name = "Times New Roman"
        rpr = run._element.get_or_add_rPr()
        rfonts = rpr.get_or_add_rFonts()
        rfonts.set(qn("w:eastAsia"), "Times New Roman")
        return run

    def generate(self, profile: dict, experience: dict) -> bytes:
        doc = Document(self.template_path)

        fields = [
            ("Họ và tên sinh viên:", profile.get("fullName")),
            ("Ngày sinh:", profile.get("birthDate")),
            ("Mã số sinh viên:", profile.get("studentCode")),
            ("Lớp:", profile.get("academicYear") or profile.get("major")),
            ("Thời gian thực tập:", experience.get("period")),
            ("Doanh nghiệp thực tập:", experience.get("company")),
            ("Địa chỉ doanh nghiệp:", experience.get("companyAddress")),
            ("Chuyên gia doanh nghiệp hướng dẫn:", experience.get("mentorName")),
        ]

        for label, value in fields:
            if not value:
                continue
            paragraph = self._find_paragraph(doc, label)
            if paragraph is not None:
                self._fill_paragraph(paragraph, label, str(value))
            else:
                logger.warning("Mau07 field not found in template: %s", label)

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        return buf.getvalue()


mau07_service = Mau07Service()
