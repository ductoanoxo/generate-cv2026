import React, { useState } from 'react';
import { Briefcase, Plus, Trash, FileDoc, UploadSimple, CheckCircle, Clock, XCircle } from '@phosphor-icons/react';
import type { Experience } from '../mock/mockData';
import { downloadVerificationFile } from '../services/internshipVerificationService';

interface InternshipFormProps {
  experiences: Experience[];
  onAddExperience: (exp: Experience) => void;
  onRemoveExperience: (index: number) => void;
  onExportMau07: (exp: Experience) => void;
  onSubmitVerification: (exp: Experience, file: File) => Promise<void>;
}

const STATUS_LABELS: Record<number, { text: string; color: string }> = {
  [-1]: { text: 'Chờ nộp phiếu Mẫu 07', color: '#94A3B8' },
  0: { text: 'Đã nộp phiếu Mẫu 07', color: '#EAB308' },
  1: { text: 'Đã duyệt', color: '#22C55E' },
  2: { text: 'Đã bị từ chối', color: '#EF4444' },
};

export const InternshipForm: React.FC<InternshipFormProps> = ({
  experiences,
  onAddExperience,
  onRemoveExperience,
  onExportMau07,
  onSubmitVerification
}) => {
  const [newExp, setNewExp] = useState<Experience>({
    company: '',
    role: '',
    period: '',
    description: '',
    companyAddress: '',
    mentorName: ''
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportingIdx, setExportingIdx] = useState<number | null>(null);
  const [submittingIdx, setSubmittingIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleAdd = () => {
    if (newExp.company.trim() && newExp.role.trim()) {
      const period = [startDate.trim(), endDate.trim()].filter(Boolean).join(' - ');
      onAddExperience({
        company: newExp.company.trim(),
        role: newExp.role.trim(),
        period: period || 'Thời gian gần đây',
        description: newExp.description.trim(),
        companyAddress: newExp.companyAddress?.trim() || '',
        mentorName: newExp.mentorName?.trim() || ''
      });
      setNewExp({ company: '', role: '', period: '', description: '', companyAddress: '', mentorName: '' });
      setStartDate('');
      setEndDate('');
    }
  };

  const handleExportMau07 = async (exp: Experience, idx: number) => {
    setExportingIdx(idx);
    setUploadError('');
    try {
      await onExportMau07(exp);
    } catch {
      setUploadError('Không thể tải phiếu Mẫu 07. Vui lòng kiểm tra AI service.');
    } finally {
      setExportingIdx(null);
    }
  };

  const handleFileChange = async (exp: Experience, idx: number, file?: File) => {
    if (!file) return;
    setSubmittingIdx(idx);
    setUploadError('');
    try {
      await onSubmitVerification(exp, file);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Nộp phiếu thất bại. Vui lòng thử lại.');
    } finally {
      setSubmittingIdx(null);
    }
  };

  const statusOf = (exp: Experience) => (exp.verificationId ? (exp.verificationStatus ?? 0) : -1);
  const status = (exp: Experience) => STATUS_LABELS[statusOf(exp)] ?? STATUS_LABELS[0];

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Từ ngày (vd: 01/06/2025)" 
            className="input-field" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Đến ngày (vd: 30/08/2025)" 
            className="input-field" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Địa chỉ doanh nghiệp" 
            className="input-field" 
            value={newExp.companyAddress}
            onChange={(e) => setNewExp(prev => ({ ...prev, companyAddress: e.target.value }))}
          />
          <input 
            type="text" 
            placeholder="Chuyên gia doanh nghiệp hướng dẫn" 
            className="input-field" 
            value={newExp.mentorName}
            onChange={(e) => setNewExp(prev => ({ ...prev, mentorName: e.target.value }))}
          />
        </div>
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

      {uploadError && <div role="status" style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '8px' }}>{uploadError}</div>}

      {/* Item List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {experiences.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Chưa có kinh nghiệm thực tập nào được thêm.</div>
        ) : (
          experiences.map((exp, idx) => {
            const st = status(exp);
            const verified = statusOf(exp) === 1;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', border: `1px solid ${verified ? 'rgba(34,197,94,0.4)' : 'var(--color-border)'}`, borderRadius: '6px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {exp.company}
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: st.color, border: `1px solid ${st.color}55`, background: `${st.color}1A`, padding: '2px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {statusOf(exp) === 1 ? <CheckCircle size={12} /> : statusOf(exp) === 2 ? <XCircle size={12} /> : <Clock size={12} />}
                        {st.text}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#22C55E', fontWeight: 500, marginTop: '1px' }}>
                      {exp.role} {exp.period ? `(${exp.period})` : ''}
                    </div>
                    {exp.companyAddress && (
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>Địa chỉ: {exp.companyAddress}</div>
                    )}
                    {exp.mentorName && (
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '1px' }}>Chuyên gia hướng dẫn: {exp.mentorName}</div>
                    )}
                    {exp.description && (
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.4' }}>
                        {exp.description}
                      </div>
                    )}
                    {exp.verificationNote && statusOf(exp) !== 1 && (
                      <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px' }}>Ghi chú duyệt: {exp.verificationNote}</div>
                    )}
                    {verified && exp.verificationName && (
                      <div style={{ fontSize: '0.75rem', color: '#22C55E', marginTop: '4px' }}>
                        Xác thực bởi: {exp.verificationName}
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

                {/* Verification actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-icon-text"
                    onClick={() => handleExportMau07(exp, idx)}
                    disabled={exportingIdx === idx}
                    style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--color-border)', padding: '6px 12px', fontSize: '0.78rem' }}
                    title="Xuất phiếu Mẫu 07 trống (chuyên gia doanh nghiệp điền & ký)"
                  >
                    <FileDoc size={16} />
                    <span>{exportingIdx === idx ? 'Đang tạo...' : 'Tải phiếu Mẫu 07'}</span>
                  </button>

                  {!verified && (
                    <label
                      className="btn-icon-text"
                      style={{ background: submittingIdx === idx ? 'rgba(30,41,59,0.6)' : 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer' }}
                      title="Nộp phiếu Mẫu 07 đã được chuyên gia ký & đóng dấu"
                    >
                      <UploadSimple size={16} />
                      <span>{submittingIdx === idx ? 'Đang nộp...' : 'Nộp phiếu đã ký'}</span>
                      <input
                        type="file"
                        accept=".docx,.doc,.pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileChange(exp, idx, file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}

                  {verified && exp.verificationId && (
                    <button
                      className="btn-icon-text"
                      onClick={() => downloadVerificationFile(exp.verificationId!, `Mau07_${(exp.company || 'SV').replace(/\s+/g, '_')}.docx`)}
                      style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--color-border)', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer' }}
                      title="Xem phiếu Mẫu 07 đã xác thực"
                    >
                      <FileDoc size={16} />
                      <span>Xem phiếu đã duyệt</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
