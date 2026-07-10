import React, { useState, useEffect } from 'react';
import { Megaphone, Cloud } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface StudentAnnouncement {
  id: string;
  type: number;
  message: string;
  creationDate: string;
  deepLink: string;
  deepLinkParam: string;
  status: number;
  enforceRead: boolean;
  notificationType: number | null;
}

export const StudentAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        if (!user?.id) {
          setErrorMsg('Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        const response = await axios.get<StudentAnnouncement[]>(
          `http://localhost:5000/api/student/announcements?studentId=${user.id}`
        );
        setAnnouncements(response.data);
      } catch (err) {
        setErrorMsg('Không thể kết nối cơ sở dữ liệu để tải danh sách thông báo.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#22C55E',
          fontWeight: 600,
        }}
      >
        <div
          className="spinner"
          style={{
            border: '3px solid rgba(34, 197, 94, 0.1)',
            borderTop: '3px solid #22C55E',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <span>Đang tải thông báo từ cơ sở dữ liệu...</span>
      </div>
    );
  }

  const totalPages = Math.ceil(announcements.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 16px',
        }}
      >
        <div
          style={{
            fontSize: '0.85rem',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Trạng thái kết nối:</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#22C55E',
              fontWeight: 600,
            }}
          >
            <Cloud size={16} /> Đã kết nối Cơ sở dữ liệu Supabase (API .NET 8)
          </span>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            fontSize: '0.85rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={24} color="#22C55E" />
            <h2>Thông báo từ nhà trường</h2>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentAnnouncements.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '1rem' }}>
              Không có thông báo mới nào dành cho bạn
            </div>
          ) : (
            <>
              {currentAnnouncements.map((ann) => (
                <div key={ann.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F8FAFC' }}>{ann.message}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {new Date(ann.creationDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    style={{
                      background: '#0f172a',
                      border: '1px solid var(--color-border)',
                      color: currentPage === 1 ? '#64748B' : 'var(--color-foreground)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Trang trước
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    style={{
                      background: '#0f172a',
                      border: '1px solid var(--color-border)',
                      color: currentPage === totalPages ? '#64748B' : 'var(--color-foreground)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
