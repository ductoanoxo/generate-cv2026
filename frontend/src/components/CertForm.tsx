import React, { useState } from 'react';
import { Certificate, Plus, Trash } from '@phosphor-icons/react';
import type { Certification } from '../mock/mockData';

interface CertFormProps {
  certifications: Certification[];
  onAddCert: (cert: Certification) => void;
  onRemoveCert: (index: number) => void;
}

export const CertForm: React.FC<CertFormProps> = ({
  certifications,
  onAddCert,
  onRemoveCert
}) => {
  const [newCert, setNewCert] = useState<Certification>({
    certificationName: '',
    date: ''
  });

  const handleAdd = () => {
    if (newCert.certificationName.trim()) {
      onAddCert({
        certificationName: newCert.certificationName.trim(),
        date: newCert.date.trim() || new Date().getFullYear().toString()
      });
      setNewCert({ certificationName: '', date: '' });
    }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Certificate size={18} />
        <span>7. Chứng chỉ & Bằng cấp</span>
      </h3>

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="text" 
          placeholder="Tên chứng chỉ (vd: Chứng chỉ Lập trình Web Full-stack)" 
          className="input-field" 
          style={{ flex: 2 }}
          value={newCert.certificationName}
          onChange={(e) => setNewCert(prev => ({ ...prev, certificationName: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input 
          type="text" 
          placeholder="Năm đạt (vd: 2025)" 
          className="input-field" 
          style={{ flex: 1 }}
          value={newCert.date}
          onChange={(e) => setNewCert(prev => ({ ...prev, date: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn-icon-text primary" onClick={handleAdd} style={{ padding: '0 16px' }}>
          <Plus size={20} />
        </button>
      </div>

      {/* Item List */}
      <div className="tag-list">
        {certifications.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Chưa có chứng chỉ nào được thêm.</div>
        ) : (
          certifications.map((cert, idx) => (
            <span key={idx} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#F8FAFC' }}>
              <span>{cert.certificationName} {cert.date ? `(${cert.date})` : ''}</span>
              <button 
                onClick={() => onRemoveCert(idx)}
                style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Xóa chứng chỉ"
              >
                <Trash size={14} />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};
