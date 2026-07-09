import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { departmentStats } from '../../mock/mockData';
import { Calendar, Cloud, Database } from '@phosphor-icons/react';

interface TeachingProgressItem {
  subject: string;
  done: number;
  total: number;
}

interface DeptDashboardData {
  teachingProgress: TeachingProgressItem[];
}

export const TeachingProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<TeachingProgressItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const departmentId = '345c4ed0-dd7e-473e-231b-08d9d001b4e8';
        const response = await axios.get<DeptDashboardData>(`http://localhost:5000/api/department/dashboard?departmentId=${departmentId}`);
        setProgress(response.data.teachingProgress);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch teaching progress, using mock data', err);
        setProgress(departmentStats.teachingProgress);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải tiến độ giảng dạy...</p>
      </div>
    );
  }

  return (
    <div className="panel-card fade-in">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="#22C55E" />
          <h2>Theo dõi tiến độ giảng dạy bộ môn</h2>
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
          {isMock ? <Cloud size={14} /> : <Database size={14} />}
          <span>{isMock ? 'CSDL Offline' : 'Live DB'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: '16px 0' }}>
        {progress.map((prog, idx) => {
          const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{prog.subject}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                    Giáo trình chuẩn: {prog.total} buổi học chính khóa.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 700, fontSize: '1rem' }}>{pct}%</span>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{prog.done} trên {prog.total} buổi</div>
                </div>
              </div>
              <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#22C55E', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
