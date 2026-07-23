import React, { useState } from 'react';
import { Briefcase, Plus, Trash } from '@phosphor-icons/react';
import type { Experience } from '../mock/mockData';

interface InternshipFormProps {
  experiences: Experience[];
  onAddExperience: (exp: Experience) => void;
  onRemoveExperience: (index: number) => void;
}

export const InternshipForm: React.FC<InternshipFormProps> = ({
  experiences,
  onAddExperience,
  onRemoveExperience
}) => {
  const [newExp, setNewExp] = useState<Experience>({
    company: '',
    role: '',
    period: '',
    description: ''
  });

  const handleAdd = () => {
    if (newExp.company.trim() && newExp.role.trim()) {
      onAddExperience({
        company: newExp.company.trim(),
        role: newExp.role.trim(),
        period: newExp.period.trim() || 'Thời gian gần đây',
        description: newExp.description.trim()
      });
      setNewExp({ company: '', role: '', period: '', description: '' });
    }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Briefcase size={18} />
        <span>6. Kinh nghiệm thực tập & làm việc</span>
      </h3>

      {/* Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Tên công ty / Tổ chức *" 
            className="input-field" 
            value={newExp.company}
            onChange={(e) => setNewExp(prev => ({ ...prev, company: e.target.value }))}
          />
          <input 
            type="text" 
            placeholder="Vai trò / Vị trí *" 
            className="input-field" 
            value={newExp.role}
            onChange={(e) => setNewExp(prev => ({ ...prev, role: e.target.value }))}
          />
        </div>
        <input 
          type="text" 
          placeholder="Thời gian làm việc (vd: 06/2025 - 08/2025)" 
          className="input-field" 
          value={newExp.period}
          onChange={(e) => setNewExp(prev => ({ ...prev, period: e.target.value }))}
        />
        <textarea 
          placeholder="Mô tả công việc & thành tích đạt được..." 
          className="input-field" 
          rows={2} 
          style={{ resize: 'vertical' }}
          value={newExp.description}
          onChange={(e) => setNewExp(prev => ({ ...prev, description: e.target.value }))}
        />
        <button 
          className="btn-icon-text primary" 
          onClick={handleAdd} 
          style={{ justifyContent: 'center' }}
        >
          <Plus size={16} />
          <span>Thêm kinh nghiệm thực tập</span>
        </button>
      </div>

      {/* Item List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {experiences.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Chưa có kinh nghiệm thực tập nào được thêm.</div>
        ) : (
          experiences.map((exp, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px 12px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>
                  {exp.company}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#22C55E', fontWeight: 500, marginTop: '1px' }}>
                  {exp.role} {exp.period ? `(${exp.period})` : ''}
                </div>
                {exp.description && (
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.4' }}>
                    {exp.description}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onRemoveExperience(idx)}
                style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}
                title="Xóa kinh nghiệm"
              >
                <Trash size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
