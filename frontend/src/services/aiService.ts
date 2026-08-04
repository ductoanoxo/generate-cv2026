import axios from 'axios';
import type { CVData, Experience } from '../mock/mockData';

const AI_BASE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_BASE,
  timeout: 90000,
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
  project_summary: string;
  highlights: string[];
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
    languages?: string[];
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

export interface FullCVPipelineRequest {
  student: {
    student_id?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    major?: string;
    specialization?: string;
    academic_year?: string;
    graduation_year?: string;
    overall_gpa?: number;
    overall_percentage?: number;
    languages?: string[];
  };
  target_job: {
    job_title: string;
    required_skills: string[];
  };
  jd_raw_text: string;
  github_url?: string;
  selected_courses: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
}

export interface FullCVPipelineResponse extends GenerateCVResponse {
  competency_profile: {
    languages?: string[];
    competency_summary?: {
      technical_skills?: Array<{ skill: string; confidence?: number }>;
    };
    selected_courses?: Array<{
      course_id: string;
      course_name: string;
      grade: number;
      credit_point?: number;
      similarity_score?: number;
      clos?: string[];
      matched_skills?: string[];
    }>;
  };
  ats_report: Record<string, unknown>;
  validation_report: Record<string, unknown>;
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

export const generateCVFullPipeline = (data: FullCVPipelineRequest) =>
  aiClient.post<FullCVPipelineResponse>('/api/generate-cv/full', data).then(r => r.data);

export const aiHealthCheck = () =>
  aiClient.get('/health').then(r => r.data);

export const parseJobDescription = async (rawText: string, file?: File) => {
  const form = new FormData();
  if (file) form.append('file', file);
  else form.append('raw_text', rawText);
  const response = await aiClient.post<{ status: string; filename: string; markdown: string }>('/api/parse-jd', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const exportCVPdf = async (cvData: CVData) => {
  const response = await aiClient.post('/api/export/pdf', cvData, { responseType: 'blob', params: { template: 'modern' } });
  return response.data as Blob;
};

const formatBirthDateForDocx = (value?: string): string => {
  if (!value) return '';
  const iso = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return value;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const exportMau07Docx = async (cvData: CVData, experience: Experience, studentCodeOverride?: string) => {
  const response = await aiClient.post('/api/export/mau07', {
    profile: {
      fullName: cvData.profile.fullName,
      email: cvData.profile.email,
      phoneNumber: cvData.profile.phoneNumber,
      gender: cvData.profile.gender,
      birthDate: formatBirthDateForDocx(cvData.profile.birthDate),
      faculty: cvData.profile.faculty,
      major: cvData.profile.major,
      academicYear: cvData.profile.academicYear,
      studentCode: studentCodeOverride || cvData.profile.studentCode || '',
      gpa: cvData.profile.gpa,
    },
    experience: {
      company: experience.company,
      role: experience.role,
      period: experience.period,
      description: experience.description,
      companyAddress: experience.companyAddress || '',
      mentorName: experience.mentorName || '',
    },
  }, { responseType: 'blob' });
  return response.data as Blob;
};
