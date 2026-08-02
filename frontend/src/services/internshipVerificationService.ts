import axios from 'axios';
import type { Experience } from '../mock/mockData';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface InternshipVerification {
  id: string;
  studentName: string;
  studentCode: string;
  company: string;
  role: string;
  period: string;
  companyAddress: string;
  mentorName: string;
  status: number; // -1 = Chờ nộp, 0 = Đã nộp, 1 = Đã duyệt, 2 = Từ chối
  approvalName?: string;
  note?: string;
  submissionDate: string;
  approvalDate?: string;
}

/** Student submits a signed Mẫu 07 document for approval. */
export const submitVerification = async (params: {
  studentName: string;
  studentCode: string;
  experience: Experience;
  file: File;
}) => {
  const form = new FormData();
  form.append('studentName', params.studentName);
  form.append('studentCode', params.studentCode);
  form.append('company', params.experience.company);
  form.append('role', params.experience.role);
  form.append('period', params.experience.period || '');
  form.append('companyAddress', params.experience.companyAddress || '');
  form.append('mentorName', params.experience.mentorName || '');
  form.append('description', params.experience.description || '');
  form.append('file', params.file);
  const response = await axios.post(`${API_BASE}/api/internship-verifications`, form);
  return response.data as { id: string; status: number };
};

/** List verifications submitted by the current student. */
export const getMyVerifications = async () => {
  const response = await axios.get(`${API_BASE}/api/internship-verifications/mine`);
  return response.data as InternshipVerification[];
};

/** List verifications for approvers (roles 10/20/50). Optional status filter. */
export const getPendingVerifications = async (status?: number) => {
  const params = status !== undefined ? { status } : {};
  const response = await axios.get(`${API_BASE}/api/internship-verifications/pending`, { params });
  return response.data as InternshipVerification[];
};

export const approveVerification = async (id: string, note?: string) => {
  const response = await axios.post(`${API_BASE}/api/internship-verifications/${id}/approve`, { note });
  return response.data;
};

export const rejectVerification = async (id: string, note?: string) => {
  const response = await axios.post(`${API_BASE}/api/internship-verifications/${id}/reject`, { note });
  return response.data;
};

/** Download the uploaded signed document. */
export const downloadVerificationFile = async (id: string, fileName?: string) => {
  const response = await axios.get(`${API_BASE}/api/internship-verifications/${id}/file`, { responseType: 'blob' });
  const blob = response.data as Blob;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || `Mau07_TTTN_${id}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
