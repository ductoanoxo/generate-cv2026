import React from 'react';
import type { ATSReport } from '../utils/cvValidation';

interface ValidationReportProps { report: ATSReport; }

export const ValidationReport: React.FC<ValidationReportProps> = ({ report }) => (
  <section className="panel-card" aria-labelledby="cv-validation-title" style={{ marginTop: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
      <div><h3 id="cv-validation-title" style={{ margin: 0, color: '#F8FAFC' }}>Kiểm tra CV & ATS</h3><p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.8rem' }}>Cập nhật theo thời gian thực</p></div>
      <strong style={{ color: report.score >= 80 ? '#22C55E' : '#EAB308', fontSize: '1.25rem' }}>{report.score}/100</strong>
    </div>
    <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
      {report.items.map(item => <div key={item.key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.82rem' }}><span aria-hidden="true" style={{ color: item.severity === 'success' ? '#22C55E' : item.severity === 'error' ? '#EF4444' : '#EAB308' }}>{item.severity === 'success' ? '✓' : item.severity === 'error' ? '!' : '•'}</span><span><strong style={{ color: '#CBD5E1' }}>{item.label}: </strong><span style={{ color: '#94A3B8' }}>{item.message}</span></span></div>)}
    </div>
    {report.missingKeywords.length > 0 && <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#94A3B8' }}><strong style={{ color: '#EAB308' }}>Từ khóa nên bổ sung:</strong> {report.missingKeywords.join(', ')}</div>}
  </section>
);
