import os
import tempfile
import logging
from typing import Union

logger = logging.getLogger(__name__)

class JDParserService:
    def __init__(self):
        self._converter = None

    @property
    def converter(self):
        if self._converter is None:
            try:
                from docling.document_converter import DocumentConverter
                self._converter = DocumentConverter()
                logger.info("Docling DocumentConverter initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Docling DocumentConverter: {e}. Will fallback to basic parsers.")
                self._converter = None
        return self._converter

    def parse_file(self, file_content: Union[str, bytes], filename: str = "jd.pdf") -> str:
        """
        Parses a Job Description (JD) file (PDF, DOCX, TXT) into Markdown string using Docling.
        Falls back to specialized parsers if Docling is unavailable or encounters issues.
        """
        if isinstance(file_content, str):
            if os.path.exists(file_content):
                return self._parse_file_path(file_content, filename or file_content)
            return file_content.strip()

        ext = os.path.splitext(filename)[1].lower() if filename else ".pdf"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_content)
            temp_path = tmp.name

        try:
            return self._parse_file_path(temp_path, filename)
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    def _parse_file_path(self, file_path: str, filename: str) -> str:
        # Try Docling first
        if self.converter is not None:
            try:
                result = self.converter.convert(file_path)
                markdown_text = result.document.export_to_markdown()
                if markdown_text and len(markdown_text.strip()) > 0:
                    return markdown_text.strip()
            except Exception as e:
                logger.warning(f"Docling conversion failed: {e}. Falling back to default parser.")

        return self._fallback_parse(file_path, filename)

    def _fallback_parse(self, file_path: str, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".docx":
            try:
                import docx
                doc = docx.Document(file_path)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                return "\n\n".join(paragraphs)
            except Exception as e:
                logger.error(f"Fallback docx parse failed: {e}")

        elif ext == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                text_content = []
                for page in reader.pages:
                    txt = page.extract_text()
                    if txt:
                        text_content.append(txt)
                if text_content:
                    return "\n\n".join(text_content)
            except Exception as e:
                logger.error(f"Fallback pdf parse failed: {e}")

        # Plain text fallback
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()
        except Exception as e:
            logger.error(f"Fallback text read failed: {e}")
            return f"Failed to parse content from file {filename}"


jd_parser_service = JDParserService()
