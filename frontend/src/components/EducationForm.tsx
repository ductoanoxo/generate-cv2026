import React, { useState } from 'react';
import { GraduationCap, Plus, Trash, PencilSimple, Check, X } from '@phosphor-icons/react';
import type { EducationItem } from '../mock/mockData';

export type { EducationItem };

interface EducationFormProps {
  education: EducationItem[];
  onAddEducation: (item: EducationItem) => void;
  onUpdateEducation: (index: number, item: EducationItem) => void;
  onRemoveEducation: (index: number) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
}) => {
  const [newEdu, setNewEdu] = useState<EducationItem>({
    school: '',
    major: '',
    period: '',
    gpa: '',
    degree: '',
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEdu, setEditingEdu] = useState<EducationItem>({
    school: '',
    major: '',
    period: '',
    gpa: '',
    degree: '',
  });

  const handleAdd = () => {
    if (newEdu.school.trim() && newEdu.major.trim()) {
      onAddEducation({
        school: newEdu.school.trim(),
        major: newEdu.major.trim(),
        period: (newEdu.period || '').trim(),
        gpa: newEdu.gpa ? newEdu.gpa : undefined,
        degree: newEdu.degree ? newEdu.degree.trim() : undefined,
      });
      setNewEdu({ school: '', major: '', period: '', gpa: '', degree: '' });
    }
  };

  const startEdit = (idx: number, item: EducationItem) => {
    setEditingIndex(idx);
    setEditingEdu({ ...item });
  };

  const saveEdit = (idx: number) => {
    if (editingEdu.school.trim() && editingEdu.major.trim()) {
      onUpdateEducation(idx, {
        school: editingEdu.school.trim(),
        major: editingEdu.major.trim(),
        period: (editingEdu.period || '').trim(),
        gpa: editingEdu.gpa ? editingEdu.gpa : undefined,
        degree: editingEdu.degree ? editingEdu.degree.trim() : undefined,
      });
      setEditingIndex(null);
    }

  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <GraduationCap size={18} />
        <span>Học vấn & Bằng cấp (Education)</span>
      </h3>

      {/* Manual Input Form to Add New Education */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            type="text"
            placeholder="Tên trường / Cơ sở đào tạo * (vd: Trường Cao đẳng Tây Đô)"
            className="input-field"
            value={newEdu.school}
            onChange={(e) => setNewEdu(prev => ({ ...prev, school: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Chuyên ngành / Khoa * (vd: Kỹ thuật Phần mềm)"
            className="input-field"
            value={newEdu.major}
            onChange={(e) => setNewEdu(prev => ({ ...prev, major: e.target.value }))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <input
            type="text"
            placeholder="Niên khóa (vd: K21 (2024-2027))"
            className="input-field"
            value={newEdu.period}
            onChange={(e) => setNewEdu(prev => ({ ...prev, period: e.target.value }))}
          />
          <input
            type="text"
            placeholder="GPA (vd: 3.5 / 4.0 hoặc 8.4)"
            className="input-field"
            value={newEdu.gpa || ''}
            onChange={(e) => setNewEdu(prev => ({ ...prev, gpa: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Bằng cấp (vd: Cao đẳng, Kỹ sư)"
            className="input-field"
            value={newEdu.degree || ''}
            onChange={(e) => setNewEdu(prev => ({ ...prev, degree: e.target.value }))}
          />
        </div>

        <button
          className="btn-icon-text primary"
          onClick={handleAdd}
          style={{ justifyContent: 'center' }}
        >
          <Plus size={16} />
          <span>Thêm thông tin học vấn</span>
        </button>
      </div>

      {/* List of Education Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {education.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Chưa có thông tin học vấn nào. Vui lòng thêm bên trên.</div>
        ) : (
          education.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px 12px' }}>
              {editingIndex === idx ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={editingEdu.school}
                      onChange={(e) => setEditingEdu(prev => ({ ...prev, school: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={editingEdu.major}
                      onChange={(e) => setEditingEdu(prev => ({ ...prev, major: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={editingEdu.period}
                      onChange={(e) => setEditingEdu(prev => ({ ...prev, period: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={editingEdu.gpa || ''}
                      onChange={(e) => setEditingEdu(prev => ({ ...prev, gpa: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={editingEdu.degree || ''}
                      onChange={(e) => setEditingEdu(prev => ({ ...prev, degree: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => saveEdit(idx)}
                      className="btn-icon-text primary"
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    >
                      <Check size={14} /> Lưu
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      style={{ background: 'none', border: '1px solid var(--color-border)', color: '#94A3B8', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      <X size={14} /> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>
                        • {item.school}
                      </span>
                      {item.period && (
                        <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: 600 }}>
                          {item.period}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                      Ngành: <strong>{item.major}</strong> {item.degree ? `[${item.degree}]` : ''} {item.gpa ? `— GPA: ${item.gpa}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    <button
                      onClick={() => startEdit(idx, item)}
                      style={{ border: 'none', background: 'none', color: '#38BDF8', cursor: 'pointer', padding: '4px' }}
                      title="Chỉnh sửa"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => onRemoveEducation(idx)}
                      style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                      title="Xóa"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
