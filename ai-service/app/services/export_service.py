import io
import logging
import os
from typing import Optional
from jinja2 import Environment, FileSystemLoader
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

logger = logging.getLogger(__name__)

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


class ExportService:

    def __init__(self):
        self.template_dir = TEMPLATE_DIR

    def _render_html(self, cv_data: dict, template_name: str = "modern") -> str:
        template = jinja_env.get_template(f"{template_name}.html")
        return template.render(**cv_data)

    def generate_pdf(self, cv_data: dict, template_name: str = "modern") -> bytes:
        html = self._render_html(cv_data, template_name)
        try:
            from weasyprint import HTML
            pdf_bytes = HTML(string=html).write_pdf()
            return pdf_bytes
        except Exception as e:
            logger.error("WeasyPrint PDF generation failed: %s", e)
            raise

    def generate_docx(self, cv_data: dict, template_name: str = "modern") -> bytes:
        profile = cv_data.get("profile", {})
        summary = cv_data.get("summary", "")
        skills = cv_data.get("skills", [])
        languages = cv_data.get("languages", [])
        projects = cv_data.get("projects", [])
        certifications = cv_data.get("certifications", [])
        experience = cv_data.get("experience", [])
        grades = cv_data.get("grades", [])
        activities = cv_data.get("activities", [])

        doc = Document()
        style = doc.styles["Normal"]
        font = style.font
        font.name = "Times New Roman"
        font.size = Pt(11)

        section = doc.sections[0]
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)

        name_para = doc.add_paragraph()
        name_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = name_para.add_run(profile.get("fullName", "CV"))
        run.bold = True
        run.font.size = Pt(18)
        run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x1a)

        if profile.get("major"):
            major_para = doc.add_paragraph()
            major_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = major_para.add_run(profile.get("major", ""))
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

        contact_parts = []
        if profile.get("email"):
            contact_parts.append(profile["email"])
        if profile.get("phoneNumber"):
            contact_parts.append(profile["phoneNumber"])
        if profile.get("birthDate"):
            contact_parts.append(profile["birthDate"])
        if contact_parts:
            contact_para = doc.add_paragraph()
            contact_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = contact_para.add_run(" | ".join(contact_parts))
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

        self._add_docx_heading(doc, "Thông tin cá nhân")
        info_table = doc.add_table(rows=0, cols=2)
        info_table.alignment = WD_TABLE_ALIGNMENT.LEFT
        info_data = {
            "Khoa": profile.get("faculty"),
            "Ngành": profile.get("major"),
            "Khóa": profile.get("academicYear"),
        }
        if profile.get("gpa"):
            info_data["GPA"] = f'{profile["gpa"]:.2f}'

        for label, value in info_data.items():
            if value:
                row = info_table.add_row()
                row.cells[0].text = label
                row.cells[1].text = str(value)
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        for run in paragraph.runs:
                            run.font.size = Pt(11)
                row.cells[0].paragraphs[0].runs[0].bold = True if row.cells[0].paragraphs[0].runs else False

        if summary:
            self._add_docx_heading(doc, "Mục tiêu nghề nghiệp")
            p = doc.add_paragraph(summary)
            p.paragraph_format.space_after = Pt(4)

        if skills:
            self._add_docx_heading(doc, "Kỹ năng")
            p = doc.add_paragraph(" •  ".join(skills))
            p.paragraph_format.space_after = Pt(4)

        if languages:
            self._add_docx_heading(doc, "Ngôn ngữ")
            for lang in languages:
                p = doc.add_paragraph(lang)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(0)

        if grades:
            self._add_docx_heading(doc, "Kết quả học tập")
            grade_table = doc.add_table(rows=1, cols=3)
            grade_table.style = "Table Grid"
            grade_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            hdr = grade_table.rows[0].cells
            hdr[0].text = "Môn học"
            hdr[1].text = "Điểm"
            hdr[2].text = "TC"
            for cell in hdr:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.bold = True
                        run.font.size = Pt(10)
            for g in grades:
                row = grade_table.add_row().cells
                row[0].text = g.get("subjectName", "")
                score = g.get("score", 0)
                row[1].text = f"{score:.1f}"
                row[2].text = str(g.get("credits", 0))
                for cell in row:
                    for paragraph in cell.paragraphs:
                        for run in paragraph.runs:
                            run.font.size = Pt(10)

        if projects:
            self._add_docx_heading(doc, "Dự án")
            for p in projects:
                p_name = doc.add_paragraph()
                run = p_name.add_run(p.get("name", ""))
                run.bold = True
                run.font.size = Pt(11)

                if p.get("role"):
                    p_role = doc.add_paragraph()
                    run = p_role.add_run(p["role"])
                    run.italic = True
                    run.font.size = Pt(10)
                    run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

                if p.get("description"):
                    doc.add_paragraph(p["description"]).paragraph_format.space_after = Pt(2)

                if p.get("technologies"):
                    tech_p = doc.add_paragraph()
                    run = tech_p.add_run("Công nghệ: " + ", ".join(p["technologies"]))
                    run.font.size = Pt(10)
                    run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

        if experience:
            self._add_docx_heading(doc, "Kinh nghiệm làm việc")
            for e in experience:
                exp_para = doc.add_paragraph()
                run = exp_para.add_run(e.get("company", ""))
                run.bold = True
                run.font.size = Pt(11)
                if e.get("period"):
                    run2 = exp_para.add_run(f"  —  {e['period']}")
                    run2.font.size = Pt(10)
                    run2.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

                if e.get("role"):
                    role_p = doc.add_paragraph()
                    run = role_p.add_run(e["role"])
                    run.italic = True
                    run.font.size = Pt(10)

                if e.get("description"):
                    desc_p = doc.add_paragraph(e["description"])
                    desc_p.paragraph_format.space_after = Pt(4)

        if certifications:
            self._add_docx_heading(doc, "Chứng chỉ")
            for c in certifications:
                p = doc.add_paragraph()
                run = p.add_run(c.get("certificationName", ""))
                run.bold = True
                run.font.size = Pt(10)
                if c.get("date"):
                    run2 = p.add_run(f" ({c['date']})")
                    run2.font.size = Pt(10)
                    run2.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

        if activities:
            self._add_docx_heading(doc, "Hoạt động")
            for a in activities:
                p = doc.add_paragraph(a, style="List Bullet")
                for run in p.runs:
                    run.font.size = Pt(10)

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        return buf.getvalue()

    def _add_docx_heading(self, doc: Document, text: str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x1a)
        run.underline = True


export_service = ExportService()