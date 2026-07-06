import React from 'react';
import { mockSubjectTeachings, mockSchedules, teacherStats } from '../../mock/mockData';
import { BookBookmark, Calendar, ChartPieSlice, Warning } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const TeacherDashboard: React.FC = () => {
  // Hardcoded or dynamically aggregated stats
  const teacherKPIs = [
    { title: 'Lớp đang giảng dạy', value: 2, icon: <BookBookmark size={24} />, type: 'primary' },
    { title: 'Lịch dạy hôm nay (tiết)', value: 4, icon: <Calendar size={24} />, type: 'info' },
    { title: 'Sinh viên cần chú ý', value: teacherStats.alertStudents.length, icon: <Warning size={24} />, type: 'danger' }
  ];

  // Aggregated attendance for classes he teaches
  const classAttendanceData = [
    { name: 'Có mặt', value: 38, color: '#22C55E' },
    { name: 'Đi trễ', value: 4, color: '#EAB308' },
    { name: 'Vắng có phép', value: 2, color: '#3B82F6' },
    { name: 'Vắng không phép', value: 1, color: '#EF4444' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* KPIs */}
      <div className="grid-kpis">
        {teacherKPIs.map((kpi, idx) => (
          <div key={idx} className={`kpi-card ${kpi.type}`}>
            <div className="kpi-details">
              <h3>{kpi.title}</h3>
              <div className="kpi-value">{kpi.value}</div>
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid-2col">
        {/* Classes list */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Danh sách Lớp học phần đang dạy</h2>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã môn</th>
                  <th>Tên Môn Học</th>
                  <th>Lớp</th>
                  <th>Đã dạy</th>
                  <th>Sĩ số</th>
                </tr>
              </thead>
              <tbody>
                {mockSubjectTeachings.slice(0, 2).map((st) => (
                  <tr key={st.id}>
                    <td style={{ fontFamily: 'var(--font-heading)', color: '#22C55E' }}>{st.subjectCode}</td>
                    <td style={{ fontWeight: 600 }}>{st.subjectName}</td>
                    <td style={{ fontFamily: 'var(--font-heading)' }}>{st.classCode}</td>
                    <td>{st.completedSessions}/{st.totalSessions} buổi</td>
                    <td style={{ fontWeight: 600 }}>{st.studentsCount} SV</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule today */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Lịch dạy của tôi hôm nay</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockSchedules.slice(0, 2).map((sch) => (
              <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{sch.subjectName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Lớp: {sch.classCode} • Phòng: <span style={{ color: '#22C55E' }}>{sch.room}</span></div>
                </div>
                <div>
                  <span className="status-badge present" style={{ fontSize: '0.7rem' }}>
                    Tiết {sch.slotStart} - {sch.slotEnd}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2col">
        {/* Attendance Pie */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="panel-header" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChartPieSlice size={20} color="#22C55E" />
              <h2>Tỉ lệ điểm danh trung bình lớp phụ trách</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={classAttendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  nameKey="name"
                >
                  {classAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warning Students List */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Warning size={20} color="#EF4444" />
              <h2>Sinh viên cần chú ý đặc biệt</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teacherStats.alertStudents.map((alert, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{alert.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Lớp: {alert.classCode} • Lý do: <span style={{ color: '#EF4444' }}>{alert.reason}</span></div>
                </div>
                <div>
                  <span className={`status-badge ${alert.status === 'Warning' ? 'unexcused' : 'late'}`} style={{ fontSize: '0.65rem' }}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
