from app.services.jd_parser_service import JDParserService


def test_pdf_without_text_layer_does_not_return_binary_bytes_as_text(tmp_path):
    pdf_path = tmp_path / "scanned-jd.pdf"
    pdf_path.write_bytes(
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\n"
        b"trailer << /Root 1 0 R >>\n%%EOF\n"
    )

    service = JDParserService()
    assert service.parse_file(str(pdf_path), pdf_path.name) == ""
