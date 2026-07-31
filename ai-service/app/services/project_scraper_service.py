import re
import logging
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from app.config import settings

logger = logging.getLogger(__name__)

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

    def extract_sections_from_readme(self, readme: str) -> Dict[str, str]:
        if not readme:
            return {}
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
        summary_sections = [
            content for heading, content in readme_sections.items()
            if any(term in heading.lower() for term in ("about", "overview", "feature", "function", "result", "outcome"))
        ]
        project_summary = " ".join(summary_sections).strip() or readme.strip()
        project_summary = " ".join(project_summary.split())[:1800]

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
            "tech_stack": tech_stack,
            "file_tree": file_tree[:200]
        }


project_scraper_service = ProjectScraperService()
