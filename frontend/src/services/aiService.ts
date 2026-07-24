import axios from 'axios';

const AI_BASE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// --- Search Types ---
export interface SearchRequest {
  query: string;
  limit?: number;
  type_filter?: 'subject' | 'clo' | null;
  department?: string | null;
  use_rerank?: boolean;
  rerank_top_n?: number;
}

export interface SearchResultItem {
  id: number;
  score: number;
  type: string;
  subject_code: string;
  subject_name: string;
  content: string;
  category?: string;
  department?: string;
}

export interface SearchResponse {
  status: string;
  query: string;
  use_rerank: boolean;
  total_results: number;
  results: SearchResultItem[];
  context: string;
}

// --- Scrape Types ---
export interface ScrapeGithubRequest {
  github_url: string;
}

export interface ScrapeGithubResponse {
  status: string;
  repo: {
    full_name: string;
    name: string;
    description: string;
    html_url: string;
    language: string;
    stars: number;
    forks: number;
    topics: string[];
    license: string;
  };
  readme: {
    full_text: string;
    sections: Record<string, string>;
  };
  tech_stack: Record<string, string[]>;
  file_tree: string[];
}

// --- API Functions ---
export const searchCourses = (data: SearchRequest) =>
  aiClient.post<SearchResponse>('/api/search', data).then(r => r.data);

export const scrapeGithub = (data: ScrapeGithubRequest) =>
  aiClient.post<ScrapeGithubResponse>('/api/scrape-github', data).then(r => r.data);

export const aiHealthCheck = () =>
  aiClient.get('/health').then(r => r.data);
