import React from 'react';
import type { CVData, CategorizedSkillGroup } from '../mock/mockData';

interface CVPreviewProps { cvData: CVData; selectedGrades: string[]; children?: React.ReactNode; }

export const getFormattedSkillGroups = (cvData: CVData): CategorizedSkillGroup[] => {
  if (cvData.categorizedSkills && cvData.categorizedSkills.length > 0) {
    return cvData.categorizedSkills;
  }
  if (!cvData.skills || cvData.skills.length === 0) return [];

  const categories: Record<string, string[]> = {
    'Backend & Programming Skills': [],
    'Databases & Data Management': [],
    'Domain Knowledge': [],
    'DevOps, Tools & Monitoring': [],
    'Business Skills': [],
    'Soft Skills & Methodologies': [],
  };

  cvData.skills.forEach(skill => {
    const sLower = skill.toLowerCase();
    if (sLower.includes('banking') || sLower.includes('thought machine') || sLower.includes('symbols') || sLower.includes('exchange') || sLower.includes('fx') || sLower.includes('accounting') || sLower.includes('custody') || sLower.includes('laundering') || sLower.includes('aml') || sLower.includes('compliance')) {
      categories['Domain Knowledge'].push(skill);
    } else if (sLower.includes('crm') || sLower.includes('lark') || sLower.includes('erp') || sLower.includes('odoo') || sLower.includes('business')) {
      categories['Business Skills'].push(skill);
    } else if (sLower.includes('sql') || sLower.includes('db') || sLower.includes('database') || sLower.includes('mongo') || sLower.includes('postgres') || sLower.includes('redis') || sLower.includes('oracle')) {
      categories['Databases & Data Management'].push(skill);
    } else if (sLower.includes('docker') || sLower.includes('git') || sLower.includes('ci/cd') || sLower.includes('kubernetes') || sLower.includes('linux') || sLower.includes('aws') || sLower.includes('prometheus') || sLower.includes('grafana') || sLower.includes('figma') || sLower.includes('draw.io') || sLower.includes('tool') || sLower.includes('monitoring') || sLower.includes('alert')) {
      categories['DevOps, Tools & Monitoring'].push(skill);
    } else if (sLower.includes('teamwork') || sLower.includes('communication') || sLower.includes('scrum') || sLower.includes('agile') || sLower.includes('giao tiếp') || sLower.includes('tự học') || sLower.includes('giải quyết') || sLower.includes('thích ứng') || sLower.includes('collaboration') || sLower.includes('troubleshooting')) {
      categories['Soft Skills & Methodologies'].push(skill);
    } else {
      categories['Backend & Programming Skills'].push(skill);
    }
  });

  return Object.entries(categories)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({ category, items }));
};


export const CVPreview: React.FC<CVPreviewProps> = ({ cvData, selectedGrades, children }) => children ? (
  <div className="cv-preview" aria-label="Bản xem trước CV khổ A4">{children}</div>
) : (
  <div className="cv-preview" aria-label="Bản xem trước CV khổ A4">
    <div id="printable-cv" className="cv-a4-sheet">
      <div className="cv-pdf-header">
        <div>
          <div className="cv-pdf-name">{cvData.profile.fullName}</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#22C55E', marginTop: '2px' }}>{cvData.profile.major}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>{cvData.profile.faculty} - Tây Đô College</div>
        </div>
        <div className="cv-pdf-contact">
          <div>Email: {cvData.profile.email}</div>
          <div>SĐT: {cvData.profile.phoneNumber}</div>
          <div>Địa chỉ: {cvData.profile.hometown}</div>
        </div>
      </div>
      
      <div className="cv-pdf-section">
        <div className="cv-pdf-section-title">Giới thiệu bản thân</div>
        <p>{cvData.summary}</p>
      </div>

      <div className="cv-pdf-section">
        <div className="cv-pdf-section-title">COMPETENCES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {getFormattedSkillGroups(cvData).map(group => (
            <div key={group.category} style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: '1.5' }}>
              <strong style={{ color: '#0F172A', fontWeight: 700 }}>* {group.category}:</strong> {group.items.join(', ')}.
            </div>
          ))}
        </div>
      </div>

      {cvData.languages.length > 0 && (
        <div className="cv-pdf-section" style={{ marginTop: '8px' }}>
          <div className="cv-pdf-section-title">Ngoại ngữ (Languages)</div>
          <div style={{ fontSize: '0.85rem', color: '#1E293B' }}>
            {cvData.languages.join(' • ')}
          </div>
        </div>
      )}

      <div className="cv-pdf-section">
        <div className="cv-pdf-section-title">Dự án đã thực hiện</div>
        <div className="cv-pdf-grid">
          {cvData.projects.map(project => (
            <div key={project.name} className="cv-pdf-project-card">
              <div className="cv-pdf-project-title">{project.name}</div>
              <div>Vai trò: {project.role}</div>
              <p>{project.description}</p>
              <div className="cv-pdf-project-tech">Công nghệ: {project.technologies.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      {cvData.experience.length > 0 && (
        <div className="cv-pdf-section">
          <div className="cv-pdf-section-title">Kinh nghiệm thực tập & làm việc</div>
          {cvData.experience.map(exp => (
            <div key={`${exp.company}-${exp.role}`} className="cv-preview-item">
              <strong>{exp.company}</strong>
              {exp.verificationStatus === 1 && (
                <span className="cv-verified-chip">✓ Đã duyệt</span>
              )}
              <div>{exp.role} {exp.period && `(${exp.period})`}</div>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {cvData.certifications.length > 0 && (
        <div className="cv-pdf-section">
          <div className="cv-pdf-section-title">Chứng chỉ & Bằng cấp</div>
          <div className="cv-tag-list">
            {cvData.certifications.map(cert => (
              <span key={`${cert.certificationName}-${cert.date}`} className="cv-tag">
                {cert.certificationName} {cert.date && `(${cert.date})`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="cv-pdf-section">
        <div className="cv-pdf-section-title">Kết quả môn học tiêu biểu</div>
        <p className="cv-preview-note">* Bảng điểm môn học đã qua phân tích khớp với yêu cầu JD tuyển dụng.</p>
        <div className="cv-grade-grid">
          {cvData.grades.filter(grade => selectedGrades.includes(grade.subjectName)).map(grade => (
            <div key={grade.subjectName} className="cv-grade-item">
              <span>{grade.subjectName}</span>
              <strong>{grade.score.toFixed(1)} / 10</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="cv-pdf-section">
        <div className="cv-pdf-section-title">Hoạt động ngoại khóa</div>
        {cvData.activities.map(activity => <div key={activity}>• {activity}</div>)}
      </div>
    </div>
  </div>
);

