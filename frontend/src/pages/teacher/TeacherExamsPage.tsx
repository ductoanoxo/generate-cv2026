import React, { useState, useEffect } from 'react';
import { mockQuestionSuites } from '../../mock/mockData';
import { ClipboardText, Database, Cloud } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface QuestionSuite {
  id: string;
  subjectCode: string;
  subjectName: string;
  easyCount: number;
  normalCount: number;
  hardCount: number;
  lastUpdated: string;
}

export const TeacherExamsPage: React.FC = () => {
  const { user } = useAuth();
  const [suites, setSuites] = useState<QuestionSuite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const teacherId = user?.id === 'u4' ? 'd3b07384-d113-49be-a5d2-000000000000' : (user?.id ?? 'd3b07384-d113-49be-a5d2-000000000000');
        const response = await axios.get<QuestionSuite[]>(`http://localhost:5000/api/teacher/question-suites?teacherId=${teacherId}`);
        setSuites(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Backend question-suites API failed, falling back to local mock', err);
        setIsMock(true);
        // Fallback to local mock
        setSuites(mockQuestionSuites.slice(0, 2).map(qs => ({
          id: qs.id,
          subjectCode: qs.subjectCode,
          subjectName: qs.subjectName,
          easyCount: qs.easyCount,
          normalCount: qs.normalCount,
          hardCount: qs.hardCount,
          lastUpdated: qs.lastUpdated
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#22C55E', fontWeight: 600 }}>
        <div className="spinner" style={{ border: '3px solid rgba(34, 197, 94, 0.1)', borderTop: '3px solid #22C55E', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <span>Đang tải ngân hàng đề thi...</span>
      </div>
    );
  }

  return (
    <div className="panel-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* API Connection Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px' }}>
        <div style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Trạng thái kết nối:</span>
          {isMock ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EAB308', fontWeight: 600 }}>
              <Database size={16} /> Dữ liệu Giả lập (Mock Fallback)
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#22C55E', fontWeight: 600 }}>
              <Cloud size={16} /> Đã kết nối Backend API (.NET 8)
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          Ngân hàng: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{suites.length} Môn học</span>
        </div>
      </div>

      <div className="panel-header" style={{ border: 'none', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardText size={24} color="#22C55E" />
          <h2>Ngân hàng câu hỏi của tôi</h2>
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Môn</th>
              <th>Tên Môn Học</th>
              <th>Số Câu Dễ</th>
              <th>Số Câu Trung Bình</th>
              <th>Số Câu Khó</th>
              <th>Tổng Số Câu</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {suites.map((qs) => {
              const total = qs.easyCount + qs.normalCount + qs.hardCount;
              return (
                <tr key={qs.id}>
                  <td style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 600 }}>{qs.subjectCode}</td>
                  <td style={{ fontWeight: 600 }}>{qs.subjectName}</td>
                  <td style={{ color: '#22C55E' }}>{qs.easyCount}</td>
                  <td style={{ color: '#EAB308' }}>{qs.normalCount}</td>
                  <td style={{ color: '#EF4444' }}>{qs.hardCount}</td>
                  <td style={{ fontWeight: 700, color: '#3B82F6', fontFamily: 'var(--font-heading)' }}>{total}</td>
                  <td>
                    <span className="status-badge present" style={{ fontSize: '0.7rem' }}>Sẵn sàng</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
