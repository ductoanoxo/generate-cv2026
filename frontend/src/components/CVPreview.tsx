import React from 'react';
import type { CVData } from '../mock/mockData';

interface CVPreviewProps { cvData: CVData; selectedGrades: string[]; children?: React.ReactNode; }

export const CVPreview: React.FC<CVPreviewProps> = ({ cvData, selectedGrades, children }) => children ? (
  <div className="cv-preview" aria-label="Bản xem trước CV khổ A4">{children}</div>
) : (
  <div className="cv-preview" aria-label="Bản xem trước CV khổ A4">
    <div id="printable-cv" className="cv-a4-sheet">
      <div className="cv-pdf-header"><div><div className="cv-pdf-name">{cvData.profile.fullName}</div><div style={{ fontSize: '1rem', fontWeight: 600, color: '#22C55E', marginTop: '2px' }}>{cvData.profile.major}</div><div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>{cvData.profile.faculty} - Tây Đô College</div></div><div className="cv-pdf-contact"><div>Email: {cvData.profile.email}</div><div>SĐT: {cvData.profile.phoneNumber}</div><div>Địa chỉ: {cvData.profile.hometown}</div></div></div>
      <div className="cv-pdf-section"><div className="cv-pdf-section-title">Giới thiệu bản thân</div><p>{cvData.summary}</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}><div className="cv-pdf-section"><div className="cv-pdf-section-title">Kỹ năng kỹ thuật</div><div className="cv-tag-list">{cvData.skills.map(skill => <span key={skill} className="cv-tag">{skill}</span>)}</div></div><div className="cv-pdf-section"><div className="cv-pdf-section-title">Ngoại ngữ</div>{cvData.languages.map(lang => <div key={lang}>• {lang}</div>)}</div></div>
      <div className="cv-pdf-section"><div className="cv-pdf-section-title">Dự án đã thực hiện</div><div className="cv-pdf-grid">{cvData.projects.map(project => <div key={project.name} className="cv-pdf-project-card"><div className="cv-pdf-project-title">{project.name}</div><div>Vai trò: {project.role}</div><p>{project.description}</p><div className="cv-pdf-project-tech">Công nghệ: {project.technologies.join(', ')}</div></div>)}</div></div>
      {cvData.experience.length > 0 && <div className="cv-pdf-section"><div className="cv-pdf-section-title">Kinh nghiệm thực tập & làm việc</div>{cvData.experience.map(exp => <div key={`${exp.company}-${exp.role}`} className="cv-preview-item"><strong>{exp.company}</strong><div>{exp.role} {exp.period && `(${exp.period})`}</div><p>{exp.description}</p></div>)}</div>}
      {cvData.certifications.length > 0 && <div className="cv-pdf-section"><div className="cv-pdf-section-title">Chứng chỉ & Bằng cấp</div><div className="cv-tag-list">{cvData.certifications.map(cert => <span key={`${cert.certificationName}-${cert.date}`} className="cv-tag">{cert.certificationName} {cert.date && `(${cert.date})`}</span>)}</div></div>}
      <div className="cv-pdf-section"><div className="cv-pdf-section-title">Kết quả môn học tiêu biểu</div><p className="cv-preview-note">* Bảng điểm môn học đã qua phân tích khớp với yêu cầu JD tuyển dụng.</p><div className="cv-grade-grid">{cvData.grades.filter(grade => selectedGrades.includes(grade.subjectName)).map(grade => <div key={grade.subjectName} className="cv-grade-item"><span>{grade.subjectName}</span><strong>{grade.score.toFixed(1)} / 10</strong></div>)}</div></div>
      <div className="cv-pdf-section"><div className="cv-pdf-section-title">Hoạt động ngoại khóa</div>{cvData.activities.map(activity => <div key={activity}>• {activity}</div>)}</div>
    </div>
  </div>
);
