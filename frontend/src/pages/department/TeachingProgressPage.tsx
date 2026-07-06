import React from 'react';
import { departmentStats } from '../../mock/mockData';
import { Calendar } from '@phosphor-icons/react';

export const TeachingProgressPage: React.FC = () => {
  return (
    <div className="panel-card fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="#22C55E" />
          <h2>Theo dõi tiến độ giảng dạy bộ môn</h2>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: '16px 0' }}>
        {departmentStats.teachingProgress.map((prog, idx) => {
          const pct = Math.round((prog.done / prog.total) * 100);
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
