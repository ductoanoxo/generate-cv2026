import React, { useState, useEffect } from 'react';
import { ShieldCheck, DownloadSimple, Check, X, Spinner, UserCircle, Building } from '@phosphor-icons/react';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  downloadVerificationFile,
  type InternshipVerification
} from '../../services/internshipVerificationService';

const STATUS_LABELS: Record<number, { text: string; color: string }> = {
  0: { text: 'Đã nộp', color: '#EAB308' },
  1: { text: 'Đã duyệt', color: '#22C55E' },
  2: { text: 'Từ chối', color: '#EF4444' },
};

const TABS = [
  { key: 'pending', label: 'Chờ duyệt', status: 0 },
  { key: 'approved', label: 'Đã duyệt', status: 1 },
  { key: 'rejected', label: 'Từ chối', status: 2 },
] as const;

export const InternshipVerificationsPage: React.FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('pending');
  const [items, setItems] = useState<InternshipVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const status = TABS.find(t => t.key === tab)?.status;
      setItems(await getPendingVerifications(status));
    } catch {
      setError('Không tải được danh sách phiếu xác thực. Vui lòng kiểm tra kết nối máy chủ.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [tab]);

  const handleApprove = async (item: InternshipVerification) => {
    setProcessingId(item.id);
    try {
      await approveVerification(item.id, noteMap[item.id] || '');
      await load();
    } catch {
      setError('Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: InternshipVerification) => {
    setProcessingId(item.id);
    try {
      await rejectVerification(item.id, noteMap[item.id] || '');
      await load();
    } catch {
      setError('Từ chối thất bại. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={26} color="#22C55E" />
          <span>Xác thực phiếu Mẫu 07 (Thực tập Tốt nghiệp)</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
          Duyệt phiếu đánh giá của chuyên gia doanh nghiệp do sinh viên nộp lên. Khi được duyệt, mục thực tập sẽ chính thức hiển thị trên CV với badge "Đã duyệt".
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="btn-icon-text"
            style={{
              background: tab === t.key ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' : 'rgba(30,41,59,0.8)',
              border: '1px solid var(--color-border)',
              color: tab === t.key ? '#FFFFFF' : '#94A3B8',
              fontWeight: 600,
            }}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {error && <div role="status" style={{ color: '#EF4444', fontSize: '0.85rem' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
          <Spinner size={18} className="spin" /> Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="panel-card" style={{ color: '#64748B', fontStyle: 'italic', fontSize: '0.9rem' }}>
          Không có phiếu nào ở trạng thái này.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => {
            const st = STATUS_LABELS[item.status] ?? STATUS_LABELS[0];
            return (
              <div key={item.id} className="panel-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <UserCircle size={28} color="#22C55E" />
                      <div>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>
                          {item.studentName || 'Sinh viên'}
                          <span style={{ fontWeight: 500, color: '#94A3B8', fontSize: '0.8rem', marginLeft: '8px' }}>
                            {item.studentCode || ''}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          Nộp lúc: {new Date(item.submissionDate).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Building size={16} color="#64748B" />
                      <span style={{ fontWeight: 600, color: '#E2E8F0', fontSize: '0.88rem' }}>{item.company}</span>
                      <span style={{ color: '#22C55E', fontSize: '0.82rem', fontWeight: 600 }}>{item.role}</span>
                      {item.period && <span style={{ color: '#64748B', fontSize: '0.78rem' }}>({item.period})</span>}
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: st.color, border: `1px solid ${st.color}55`, background: `${st.color}1A`, padding: '2px 8px', borderRadius: '999px' }}>
                        {st.text}
                      </span>
                    </div>

                    {(item.companyAddress || item.mentorName) && (
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                        {item.companyAddress && <span>Địa chỉ: {item.companyAddress}</span>}
                        {item.companyAddress && item.mentorName && <span> • </span>}
                        {item.mentorName && <span>Chuyên gia hướng dẫn: {item.mentorName}</span>}
                      </div>
                    )}

                    {item.approvalName && (
                      <div style={{ fontSize: '0.78rem', color: '#22C55E', marginTop: '4px' }}>
                        Xác thực bởi: {item.approvalName}
                        {item.approvalDate && ` vào ${new Date(item.approvalDate).toLocaleString('vi-VN')}`}
                      </div>
                    )}
                    {item.note && (
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontStyle: 'italic' }}>
                        Ghi chú: {item.note}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-icon-text"
                    onClick={() => downloadVerificationFile(item.id, `Mau07_${(item.studentName || 'SV').replace(/\s+/g, '_')}_${item.company.replace(/\s+/g, '_')}.docx`)}
                    style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--color-border)', padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    <DownloadSimple size={16} />
                    <span>Tải phiếu</span>
                  </button>
                </div>

                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ghi chú duyệt (tùy chọn)..."
                      value={noteMap[item.id] || ''}
                      onChange={(e) => setNoteMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                      style={{ flex: 1, minWidth: '200px', fontSize: '0.82rem', padding: '8px 10px' }}
                    />
                    <button
                      className="btn-icon-text"
                      onClick={() => handleApprove(item)}
                      disabled={processingId === item.id}
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      {processingId === item.id ? <Spinner size={16} className="spin" /> : <Check size={16} />}
                      <span>Xác thực</span>
                    </button>
                    <button
                      className="btn-icon-text"
                      onClick={() => handleReject(item)}
                      disabled={processingId === item.id}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      <X size={16} />
                      <span>Từ chối</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
