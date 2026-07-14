import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Database, Cloud, Database as DatabaseIcon } from '@phosphor-icons/react';

interface QuestionSuiteItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  easyCount: number;
  normalCount: number;
  hardCount: number;
  lastUpdated: string;
}

export const QuestionsPage: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionSuiteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const departmentId = user?.majorId;
        if (!departmentId) throw new Error('Tài khoản chưa được gán bộ môn/ngành');
        const response = await axios.get<QuestionSuiteItem[]>(`http://localhost:5000/api/department/questions?departmentId=${departmentId}`);
        setQuestions(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch questions from API, using mock questions', err);
        setQuestions([]);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải ngân hàng câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="panel-card fade-in">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={24} color="#22C55E" />
          <h2>Ngân hàng câu hỏi & Đề thi bộ môn ({questions.length} đề)</h2>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: isMock ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: isMock ? '#EAB308' : '#22C55E',
          fontSize: '0.7rem',
          fontWeight: 600
        }}>
          {isMock ? <Cloud size={14} /> : <DatabaseIcon size={14} />}
          <span>{isMock ? 'CSDL Offline' : 'Live DB'}</span>
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
              <th>Tổng Số Câu Hỏi</th>
              <th>Cập nhật gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((qs) => {
              const total = qs.easyCount + qs.normalCount + qs.hardCount;
              return (
                <tr key={qs.id}>
                  <td style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 600 }}>{qs.subjectCode}</td>
                  <td style={{ fontWeight: 600 }}>{qs.subjectName}</td>
                  <td style={{ color: '#22C55E' }}>{qs.easyCount}</td>
                  <td style={{ color: '#EAB308' }}>{qs.normalCount}</td>
                  <td style={{ color: '#EF4444' }}>{qs.hardCount}</td>
                  <td style={{ fontWeight: 700, color: '#3B82F6', fontFamily: 'var(--font-heading)' }}>{total}</td>
                  <td>{qs.lastUpdated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
