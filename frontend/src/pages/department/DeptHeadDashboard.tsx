import React from 'react';
import { departmentStats, mockQuestionSuites } from '../../mock/mockData';
import { Users, Presentation, BookOpen } from '@phosphor-icons/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const DeptHeadDashboard: React.FC = () => {
  const kpis = [
    { title: 'Sinh viên Bộ môn', value: departmentStats.kpis.students, icon: <Users size={24} />, type: 'primary' },
    { title: 'Lớp học phần quản lý', value: departmentStats.kpis.classes, icon: <Presentation size={24} />, type: 'warning' },
    { title: 'Môn học bộ môn', value: departmentStats.kpis.subjects, icon: <BookOpen size={24} />, type: 'info' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* KPI Cards */}
      <div className="grid-kpis">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`kpi-card ${kpi.type}`}>
            <div className="kpi-details">
              <h3>{kpi.title}</h3>
              <div className="kpi-value">{kpi.value}</div>
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Teaching Progress */}
      <div className="grid-2col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Tiến độ giảng dạy học phần</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {departmentStats.teachingProgress.map((prog, idx) => {
              const pct = Math.round((prog.done / prog.total) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{prog.subject}</span>
                    <span style={{ color: '#94A3B8' }}>{prog.done}/{prog.total} buổi ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#22C55E' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score comparison between classes */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>So sánh điểm trung bình giữa các lớp</h2>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={departmentStats.classScoresComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="subject" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
                <Bar dataKey="IT21A" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="IT21B" fill="#22C55E" radius={[2, 2, 0, 0]} />
                <Bar dataKey="IT21C" fill="#EAB308" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        {/* Question suite bank */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Đề thi trong Ngân hàng đề bộ môn</h2>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã môn</th>
                  <th>Môn học</th>
                  <th>Dễ</th>
                  <th>Trung bình</th>
                  <th>Khó</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {mockQuestionSuites.map((qs) => (
                  <tr key={qs.id}>
                    <td style={{ fontFamily: 'var(--font-heading)', color: '#22C55E' }}>{qs.subjectCode}</td>
                    <td style={{ fontWeight: 600 }}>{qs.subjectName}</td>
                    <td style={{ color: '#22C55E' }}>{qs.easyCount}</td>
                    <td style={{ color: '#EAB308' }}>{qs.normalCount}</td>
                    <td style={{ color: '#EF4444' }}>{qs.hardCount}</td>
                    <td style={{ fontSize: '0.8rem' }}>{qs.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Attendance sample matrix */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Điểm danh chi tiết học viên</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px' }}>
              Danh sách chuyên cần môn <strong>Kỹ thuật Lập trình C</strong> tuần này:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Đặng Đức Toàn</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="status-badge present" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Buổi 10: V</span>
                  <span className="status-badge present" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Buổi 11: V</span>
                  <span className="status-badge late" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Buổi 12: T</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Trần Thị Thảo Vy</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="status-badge present" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Buổi 10: V</span>
                  <span className="status-badge unexcused" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Buổi 11: K</span>
                  <span className="status-badge present" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Buổi 12: V</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Lê Hoàng Nam (GV)</span>
                <span style={{ fontSize: '0.75rem', color: '#22C55E', fontFamily: 'var(--font-heading)' }}>Điểm danh hoàn tất</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
