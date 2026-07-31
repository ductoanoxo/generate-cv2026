import type { CVData } from '../mock/mockData';

export interface ValidationItem {
  key: string;
  label: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'success';
}

export interface ATSReport {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  items: ValidationItem[];
}

const STOP_WORDS = new Set(['and', 'the', 'with', 'for', 'from', 'you', 'your', 'có', 'và', 'của', 'cho', 'các', 'một']);

export const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().match(/[a-z0-9+#.]{2,}|[\u00C0-\u024F\u1EA0-\u1EF9]{3,}/gi) ?? [];
  return Array.from(new Set(words.filter(word => !STOP_WORDS.has(word) && !/^\d+$/.test(word))));
};

export const validateCV = (cv: CVData): ValidationItem[] => [
  {
    key: 'name', label: 'Họ và tên', passed: Boolean(cv.profile.fullName.trim()),
    message: cv.profile.fullName.trim() ? 'Đã có thông tin.' : 'Bổ sung họ và tên.', severity: cv.profile.fullName.trim() ? 'success' : 'error'
  },
  {
    key: 'contact', label: 'Thông tin liên hệ', passed: Boolean(cv.profile.email.trim() && cv.profile.phoneNumber.trim()),
    message: cv.profile.email.trim() && cv.profile.phoneNumber.trim() ? 'Email và số điện thoại hợp lệ.' : 'Cần có email và số điện thoại.', severity: cv.profile.email.trim() && cv.profile.phoneNumber.trim() ? 'success' : 'error'
  },
  {
    key: 'summary', label: 'Giới thiệu bản thân', passed: cv.summary.trim().length >= 40,
    message: cv.summary.trim().length >= 40 ? 'Độ dài phù hợp cho ATS.' : 'Nên viết ít nhất 40 ký tự.', severity: cv.summary.trim().length >= 40 ? 'success' : 'warning'
  },
  {
    key: 'skills', label: 'Kỹ năng', passed: cv.skills.length >= 3,
    message: cv.skills.length >= 3 ? `${cv.skills.length} kỹ năng đã thêm.` : 'Nên thêm ít nhất 3 kỹ năng.', severity: cv.skills.length >= 3 ? 'success' : 'warning'
  },
  {
    key: 'projects', label: 'Dự án/Kinh nghiệm', passed: cv.projects.length > 0 || cv.experience.length > 0,
    message: cv.projects.length > 0 || cv.experience.length > 0 ? 'Đã có nội dung chứng minh năng lực.' : 'Thêm ít nhất một dự án hoặc kinh nghiệm.', severity: cv.projects.length > 0 || cv.experience.length > 0 ? 'success' : 'warning'
  },
  {
    key: 'education', label: 'Kết quả học tập', passed: cv.grades.length > 0,
    message: cv.grades.length > 0 ? `${cv.grades.length} môn học đã chọn.` : 'Chưa có môn học được chọn.', severity: cv.grades.length > 0 ? 'success' : 'warning'
  }
];

export const buildATSReport = (cv: CVData, jdText: string): ATSReport => {
  const cvText = JSON.stringify(cv).toLowerCase();
  const keywords = extractKeywords(jdText).filter(keyword => keyword.length > 2);
  const matchedKeywords = keywords.filter(keyword => cvText.includes(keyword));
  const missingKeywords = keywords.filter(keyword => !cvText.includes(keyword)).slice(0, 12);
  const validation = validateCV(cv);
  const completeness = Math.round((validation.filter(item => item.passed).length / validation.length) * 40);
  const keywordScore = keywords.length ? Math.round((matchedKeywords.length / keywords.length) * 60) : 0;
  return { score: Math.min(100, completeness + keywordScore), matchedKeywords, missingKeywords, items: validation };
};
