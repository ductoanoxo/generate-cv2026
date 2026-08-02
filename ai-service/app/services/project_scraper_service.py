import re
import json
import asyncio
import logging
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from app.config import settings

logger = logging.getLogger(__name__)

# LLM prompt: turn a scraped GitHub project into a CV-ready Vietnamese summary.
PROJECT_SUMMARY_PROMPT = """Bạn là chuyên gia viết CV và tuyển dụng IT, giúp sinh viên trích xuất dự án GitHub thành nội dung CV chuyên nghiệp bằng Tiếng Việt.

Dựa CHỈ trên thông tin repository dưới đây, hãy sinh ra:
1. "description": Mô tả dự án 2-3 câu bằng Tiếng Việt, súc tích, chuyên nghiệp, dùng cho mục "Dự án thực tế". Nêu rõ mục đích, chức năng chính và công nghệ chủ đạo. Nếu dữ liệu gốc bằng Tiếng Anh thì dịch sang Tiếng Việt.
2. "highlights": Danh sách 3-5 điểm nhấn bằng Tiếng Việt, mỗi điểm bắt đầu bằng động từ hành động (Xây dựng, Triển khai, Thiết kế, Tối ưu hóa, Phát triển...), diễn đạt lại tự nhiên theo phong cách CV.

NGHIÊM CẤM bịa đặt, thêm thông tin không có trong dữ liệu. Trả về RAW JSON duy nhất (không markdown, không giải thích):
{"description": "...", "highlights": ["...", "..."]}"""

TECH_KEYWORDS = {
    "languages": [
        "python", "javascript", "typescript", "java", "c#", "c++", "go", "rust",
        "php", "ruby", "kotlin", "swift", "dart", "scala", "r", "matlab",
        "html", "css", "sql", "bash", "shell", "powershell"
    ],
    "frameworks": [
        "react", "vue", "angular", "svelte", "nextjs", "nuxt", "fastapi",
        "django", "flask", "spring", "spring boot", "express", "nestjs",
        "dotnet", "asp.net", "laravel", "rails", "gin", "fiber",
        "tailwind", "bootstrap", "material ui", "chakra", "shadcn"
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "redis", "sqlite", "elasticsearch",
        "cassandra", "dynamodb", "supabase", "firebase", "prisma", "sequelize"
    ],
    "devops": [
        "docker", "kubernetes", "aws", "azure", "gcp", "vercel", "netlify",
        "github actions", "jenkins", "terraform", "ansible", "nginx", "ci/cd"
    ],
    "ai_ml": [
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
        "langchain", "openai", "huggingface", "transformers", "llm",
        "machine learning", "deep learning", "nlp", "computer vision"
    ],
    "tools": [
        "git", "npm", "yarn", "pip", "cargo", "maven", "gradle",
        "vscode", "postman", "figma", "swagger", "graphql", "rest api", "grpc"
    ]
}

TECH_KEYWORDS_FLAT = {}
for category, keywords in TECH_KEYWORDS.items():
    for kw in keywords:
        TECH_KEYWORDS_FLAT[kw.lower()] = category


class ProjectScraperService:
    def __init__(self):
        self._headers: Dict[str, str] = {"Accept": "application/vnd.github.v3+json"}
        if settings.GITHUB_TOKEN:
            self._headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    @staticmethod
    def parse_github_url(url: str) -> Optional[Dict[str, str]]:
        parsed = urlparse(url)
        if parsed.hostname not in ("github.com", "www.github.com"):
            return None
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        if len(parts) < 2:
            return None
        return {"owner": parts[0], "repo": parts[1]}

    async def get_repo_info(self, owner: str, repo: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers=self._headers
            )
            if resp.status_code != 200:
                raise Exception(f"GitHub API error: {resp.status_code} - {resp.text}")
            return resp.json()

    async def get_readme(self, owner: str, repo: str) -> Optional[str]:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/readme",
                headers={**self._headers, "Accept": "application/vnd.github.v3.raw"}
            )
            if resp.status_code == 200:
                return resp.text
            return None

    async def get_file_tree(self, owner: str, repo: str, depth: int = 1) -> List[str]:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=0",
                headers=self._headers
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
            paths = [t["path"] for t in data.get("tree", []) if t.get("path")]
            return paths

    def detect_tech_stack(self, readme: str, file_tree: List[str]) -> Dict[str, List[str]]:
        combined_text = readme.lower() if readme else ""
        all_paths = " ".join(file_tree).lower() if file_tree else ""
        search_text = f"{combined_text} {all_paths}"

        detected: Dict[str, List[str]] = {}
        for category, keywords in TECH_KEYWORDS.items():
            found = []
            for kw in keywords:
                pattern = re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE)
                if pattern.search(search_text):
                    found.append(kw)
            if found:
                detected[category] = found

        lang_ext_map = {
            ".py": "python", ".js": "javascript", ".ts": "typescript",
            ".java": "java", ".cs": "c#", ".go": "go", ".rs": "rust",
            ".php": "php", ".rb": "ruby", ".kt": "kotlin", ".swift": "swift",
            ".dart": "dart", ".html": "html", ".css": "css", ".sql": "sql",
            ".vue": "vue", ".svelte": "svelte", ".jsx": "react", ".tsx": "react"
        }
        ext_found = set()
        for path in (file_tree or []):
            ext = "." + path.rsplit(".", 1)[-1] if "." in path else ""
            if ext in lang_ext_map:
                ext_found.add(lang_ext_map[ext])

        if ext_found and "languages" not in detected:
            detected["languages"] = sorted(ext_found)
        elif ext_found:
            for lang in ext_found:
                if lang not in detected["languages"]:
                    detected["languages"].append(lang)

        return detected

    _MD_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$", re.MULTILINE)

    def _split_markdown_sections(self, readme: str) -> Optional[List[Dict[str, str]]]:
        """Split a Markdown README into ordered (heading, content) sections.

        Returns None when the text contains no Markdown ATX headings (i.e. it is
        likely plain text or HTML), so callers can fall back to HTML parsing.
        """
        if not readme:
            return None
        matches = list(self._MD_HEADING_RE.finditer(readme))
        if not matches:
            return None
        sections: List[Dict[str, str]] = []
        for i, m in enumerate(matches):
            end = matches[i + 1].start() if i + 1 < len(matches) else len(readme)
            sections.append({
                "heading": m.group(2).strip(),
                "content": readme[m.end():end].strip(),
            })
        return sections

    def extract_sections_from_readme(self, readme: str) -> Dict[str, str]:
        """Extract README sections by heading.

        GitHub serves READMEs as raw Markdown, so Markdown headings are parsed
        first; plain-HTML READMEs are handled via BeautifulSoup as a fallback.
        """
        if not readme:
            return {}
        markdown_sections = self._split_markdown_sections(readme)
        if markdown_sections is not None:
            return {s["heading"]: s["content"] for s in markdown_sections}

        soup = BeautifulSoup(readme, "html.parser")
        sections: Dict[str, str] = {}
        current_heading = None
        current_content: List[str] = []

        for element in soup.children:
            if element.name in ("h1", "h2", "h3"):
                if current_heading:
                    sections[current_heading] = "\n".join(current_content).strip()
                current_heading = element.get_text(strip=True)
                current_content = []
            elif current_heading:
                current_content.append(element.get_text(strip=True) if hasattr(element, 'get_text') else str(element))

        if current_heading:
            sections[current_heading] = "\n".join(current_content).strip()

        return sections

    @staticmethod
    def _strip_markdown(text: str) -> str:
        """Remove Markdown/HTML formatting and emojis, keeping readable prose."""
        if not text:
            return ""
        text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)     # fenced code blocks
        text = re.sub(r"`([^`]*)`", r"\1", text)                     # inline code -> keep content
        text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)            # images
        text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)         # links -> keep label
        text = re.sub(r"<[^>]+>", " ", text)                         # HTML tags
        text = re.sub(r"^\s{0,3}#{1,6}\s+", " ", text, flags=re.MULTILINE)  # ATX headings
        text = re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D]", " ", text)  # emojis/ZWJ
        text = re.sub(r":[\w+\-]+?:", " ", text)                   # emoji shortcodes like :rocket:
        text = re.sub(r"[*_]{1,3}", " ", text)                       # bold/italic markers
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _first_paragraph(self, readme: str) -> str:
        """Return the first meaningful paragraph of a README (before any heading)."""
        lines = []
        for raw in readme.split("\n"):
            line = raw.strip()
            if not line:
                if lines:
                    break
                continue
            if re.match(r"^#{1,6}\s+", line) or re.match(r"^```", line):
                break
            lines.append(line)
        return self._strip_markdown(" ".join(lines))

    def _truncate_sentence(self, text: str, max_len: int) -> str:
        """Truncate text at a sentence boundary, keeping the text under max_len."""
        text = text.strip()
        if len(text) <= max_len:
            return text
        truncated = text[:max_len]
        boundary = max(truncated.rfind(". "), truncated.rfind("! "), truncated.rfind("? "), truncated.rfind("; "))
        if boundary > max_len // 2:
            return truncated[:boundary + 1].strip()
        return truncated.rsplit(" ", 1)[0].rstrip(".,;").strip() + "..."

    def build_project_summary(self, repo_info: Dict[str, Any], readme: str, max_len: int = 700) -> str:
        """Build a clean, CV-ready project summary.

        Priority: repo description -> About/Overview/Intro README sections ->
        first paragraph of the README -> truncated README dump.
        """
        candidates: List[str] = []
        description = (repo_info.get("description") or "").strip()
        if description:
            candidates.append(self._strip_markdown(description))

        sections = self._split_markdown_sections(readme) or []
        preferred_terms = ("about", "overview", "introduction", "intro", "what is",
                           "giới thiệu", "tổng quan", "mô tả", "description")
        for section in sections:
            heading = section["heading"].lower()
            if any(term in heading for term in preferred_terms):
                cleaned = self._strip_markdown(section["content"])
                if cleaned:
                    candidates.append(cleaned)

        if not candidates:
            first_paragraph = self._first_paragraph(readme)
            if first_paragraph:
                candidates.append(first_paragraph)

        if not candidates:
            candidates.append(self._strip_markdown(readme or ""))

        for candidate in candidates:
            if len(candidate) > 80:
                return self._truncate_sentence(candidate, max_len)
        return self._truncate_sentence(" ".join(candidates), max_len) if candidates else ""

    def extract_features_from_readme(self, readme: str, max_items: int = 6) -> List[str]:
        """Extract feature/highlight bullets from README feature sections."""
        if not readme:
            return []
        sections = self._split_markdown_sections(readme) or []
        feature_terms = ("feature", "function", "highlight", "capabilit",
                         "chức năng", "tính năng", "điểm nổi bật", "công năng")
        features: List[str] = []
        command_pattern = re.compile(
            r"^\s*(npm|yarn|pip|pip3|docker|docker-compose|composer|gem|brew|apt|go get|git clone|cargo|mvn|gradle)\b"
        )
        for section in sections:
            heading = section["heading"].lower()
            if not any(term in heading for term in feature_terms):
                continue
            for line in section["content"].split("\n"):
                line = line.strip()
                line = re.sub(r"^\s*[-*+•·]+\s+", "", line)
                line = re.sub(r"^\d+[.)]\s+", "", line)
                cleaned = self._strip_markdown(line)
                if command_pattern.match(cleaned):
                    continue
                if len(cleaned) > 10:
                    features.append(cleaned)
        seen = set()
        unique = []
        for feature in features:
            key = feature.lower()
            if key not in seen:
                seen.add(key)
                unique.append(feature)
        return unique[:max_items]

    @staticmethod
    def _build_llm_payload(repo_info: Dict[str, Any], project_summary: str, highlights: List[str]) -> str:
        return f"""--- THÔNG TIN REPOSITORY GITHUB ---
Tên dự án: {repo_info.get('name', '')}
Mô tả từ GitHub: {repo_info.get('description') or 'N/A'}
Ngôn ngữ chính: {repo_info.get('language') or 'N/A'}
Topics: {', '.join(repo_info.get('topics') or []) or 'N/A'}

--- TÓM TẮT ĐƯỢC TRÍCH XUẤT TỪ README ---
{project_summary or 'N/A'}

--- CÁC ĐIỂM NỔI BẬT (FEATURES) ---
{json.dumps(highlights, ensure_ascii=False) if highlights else 'N/A'}
---------------------------------------
Hãy sinh JSON theo đúng yêu cầu trong system prompt."""

    async def _call_gemini_summarize(self, prompt: str) -> Optional[str]:
        if not settings.GEMINI_API_KEY:
            return None
        model_name = settings.LLM_MODEL or "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "system_instruction": {"parts": [{"text": PROJECT_SUMMARY_PROMPT}]},
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Gemini summarize returned {resp.status_code}: {resp.text[:200]}")
                return None
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

    async def _call_openai_summarize(self, prompt: str) -> Optional[str]:
        if not settings.OPENAI_API_KEY:
            return None
        is_openrouter = settings.OPENAI_API_KEY.startswith("sk-or-")
        url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": f"openai/{settings.LLM_MODEL}" if is_openrouter else settings.LLM_MODEL,
            "messages": [
                {"role": "system", "content": PROJECT_SUMMARY_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.warning(f"OpenAI summarize returned {resp.status_code}: {resp.text[:200]}")
                return None
            return resp.json()["choices"][0]["message"]["content"]

    @staticmethod
    def _parse_llm_summary(raw: str) -> Optional[Dict[str, Any]]:
        """Parse LLM JSON response, tolerating markdown code fences."""
        if not raw:
            return None
        text = raw.strip()
        if text.startswith("```"):
            text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        try:
            data = json.loads(text.strip())
        except (json.JSONDecodeError, ValueError):
            return None
        if not isinstance(data, dict):
            return None
        description = str(data.get("description") or "").strip()
        highlights = [str(h).strip() for h in data.get("highlights") or [] if str(h).strip()]
        if not description and not highlights:
            return None
        return {"description": description, "highlights": highlights}

    async def summarize_project_with_llm(
        self, repo_info: Dict[str, Any], project_summary: str, highlights: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Summarize a scraped project into CV-ready Vietnamese content via LLM.

        Priority: Gemini -> OpenAI. Returns None when no API key is configured,
        the call fails, or the response is not parseable (callers keep the
        deterministic summary in that case).
        """
        prompt = self._build_llm_payload(repo_info, project_summary, highlights)

        async def _try(call_fn):
            for attempt in range(2):
                try:
                    result = await call_fn(prompt)
                    if result:
                        parsed = self._parse_llm_summary(result)
                        if parsed:
                            return parsed
                except Exception as e:
                    logger.warning(f"Project summarize LLM attempt {attempt + 1}/2 failed: {e}")
                await asyncio.sleep(1.0)
            return None

        if settings.GEMINI_API_KEY:
            parsed = await _try(self._call_gemini_summarize)
            if parsed:
                return parsed
        if settings.OPENAI_API_KEY:
            return await _try(self._call_openai_summarize)
        return None

    async def scrape_github_project(self, github_url: str) -> Dict[str, Any]:
        parsed = self.parse_github_url(github_url)
        if not parsed:
            raise ValueError("Invalid GitHub URL. Expected format: https://github.com/owner/repo")

        owner, repo = parsed["owner"], parsed["repo"]
        logger.info(f"Scraping GitHub project: {owner}/{repo}")

        repo_info = await self.get_repo_info(owner, repo)
        readme = await self.get_readme(owner, repo)
        file_tree = await self.get_file_tree(owner, repo)
        tech_stack = self.detect_tech_stack(readme, file_tree)
        readme_sections = self.extract_sections_from_readme(readme)
        project_summary = self.build_project_summary(repo_info, readme)
        project_highlights = self.extract_features_from_readme(readme)

        # Refine the summary & highlights with an LLM when a key is configured;
        # otherwise keep the deterministic extraction.
        llm_summary = None
        if project_summary or repo_info.get("description") or project_highlights:
            llm_summary = await self.summarize_project_with_llm(repo_info, project_summary, project_highlights)
        if llm_summary:
            if llm_summary.get("description"):
                project_summary = llm_summary["description"]
            if llm_summary.get("highlights"):
                project_highlights = llm_summary["highlights"]
            logger.info(f"LLM refined summary for {owner}/{repo}")

        return {
            "status": "success",
            "repo": {
                "full_name": repo_info.get("full_name", f"{owner}/{repo}"),
                "name": repo_info.get("name", repo),
                "description": repo_info.get("description", ""),
                "html_url": repo_info.get("html_url", github_url),
                "homepage": repo_info.get("homepage", ""),
                "language": repo_info.get("language", ""),
                "stars": repo_info.get("stargazers_count", 0),
                "forks": repo_info.get("forks_count", 0),
                "open_issues": repo_info.get("open_issues_count", 0),
                "watchers": repo_info.get("watchers_count", 0),
                "created_at": repo_info.get("created_at", ""),
                "updated_at": repo_info.get("updated_at", ""),
                "license": (repo_info.get("license") or {}).get("spdx_id", "N/A"),
                "topics": repo_info.get("topics", []),
                "default_branch": repo_info.get("default_branch", "main")
            },
            "readme": {
                "full_text": readme[:10000] if readme else "",
                "sections": readme_sections
            },
            "project_summary": project_summary,
            "highlights": project_highlights,
            "tech_stack": tech_stack,
            "file_tree": file_tree[:200]
        }


project_scraper_service = ProjectScraperService()
