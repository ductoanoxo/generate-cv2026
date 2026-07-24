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

// --- Competency & CV Generator Types ---
export interface CompetencyProfileRequest {
  student: {
    student_id?: string;
    full_name?: string;
    major?: string;
    specialization?: string;
    academic_year?: string;
    overall_gpa?: number;
    overall_percentage?: number;
  };
  target_job: {
    job_title: string;
    required_skills: string[];
  };
  selected_courses?: any[];
  projects?: any[];
}

export interface CompetencyProfileResponse {
  status: string;
  competency_profile: Record<string, any>;
}

export interface GenerateCVRequest {
  competency_profile: Record<string, any>;
}

export interface GenerateCVResponse {
  status: string;
  cv: {
    personal_info: {
      full_name: string;
      title: string;
      email: string;
      phone: string;
      summary: string;
    };
    education: {
      institution: string;
      major: string;
      gpa: string;
      graduation_year: string;
      relevant_courses: {
        name: string;
        grade: string;
        highlights: string[];
      }[];
    };
    skills: {
      technical: string[];
      tools: string[];
      soft: string[];
    };
    projects: {
      name: string;
      role: string;
      description: string;
      technologies: string[];
      highlights: string[];
    }[];
    certifications: any[];
    languages: string[];
  };
}

// --- API Functions ---
export const searchCourses = (data: SearchRequest) =>
  aiClient.post<SearchResponse>('/api/search', data).then(r => r.data);

export const scrapeGithub = (data: ScrapeGithubRequest) =>
  aiClient.post<ScrapeGithubResponse>('/api/scrape-github', data).then(r => r.data);

export const buildCompetencyProfile = (data: CompetencyProfileRequest) =>
  aiClient.post<CompetencyProfileResponse>('/api/competency-profile', data).then(r => r.data);

export const generateCV = (data: GenerateCVRequest) =>
  aiClient.post<GenerateCVResponse>('/api/generate-cv', data).then(r => r.data);

export const aiHealthCheck = () =>
  aiClient.get('/health').then(r => r.data);
