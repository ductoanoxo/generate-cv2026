import React from 'react';
import { mockStudents, mockSchedules, mockAttendanceLogs, mockExamResults, studentStats } from '../../mock/mockData';
import { 
  User, 
  CalendarBlank, 
  Notebook, 
  Megaphone,
  CheckCircle,
  FileText
} from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  // We'll show the data for s1 (Đặng Đức Toàn)
  const student = mockStudents[0];

  // Filter personal schedule, attendance, and exam scores
  const personalSchedules = mockSchedules.slice(0, 3); // mock schedule slots
  const personalAttendance = mockAttendanceLogs.filter(log => log.studentName === student.fullName);
  const personalExams = mockExamResults.filter(log => log.studentName === student.fullName);

  // Group attendance status counts
  const presentCount = personalAttendance.filter(l => l.status === 1).length;
  const lateCount = personalAttendance.filter(l => l.status === 2).length;
  const excusedCount = personalAttendance.filter(l => l.status === 3).length;
  const unexcusedCount = personalAttendance.filter(l => l.status === 4).length;

  const attendanceChartData = [
    { name: 'Có mặt', value: presentCount || 6, color: '#22C55E' },
    { name: 'Đi trễ', value: lateCount || 1, color: '#EAB308' },
    { name: 'Vắng có phép', value: excusedCount || 0, color: '#3B82F6' },
    { name: 'Vắng không phép', value: unexcusedCount || 1, color: '#EF4444' }
  ];

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Có mặt';
      case 2: return 'Đi trễ';
      case 3: return 'Vắng CP';
      case 4: return 'Vắng KP';
      default: return '';
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1: return 'present';
      case 2: return 'late';
      case 3: return 'excused';
      case 4: return 'unexcused';
      default: return '';
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div className="grid-2col">
        {/* Profile Card */}
        <div className="panel-card" style={{ gap: '16px' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={24} color="#22C55E" />
              <h2>Hồ sơ sinh viên</h2>
            </div>
            <Link to="/student/cv" className="btn-icon-text primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <FileText size={16} />
              <span>Tạo CV / Resume</span>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '12px' }}>
              {student.fullName.split(' ').pop()?.[0]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{student.fullName}</h3>
              <p style={{ fontSize: '0.9rem', color: '#22C55E', fontWeight: 600 }}>MSSV: {student.studentCode}</p>
              <p style={{ fontSize: '0.85rem' }}>{student.major} • {student.academicYear}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div>
              <span style={{ color: '#64748B' }}>Ngày sinh: </span>
              <span style={{ fontWeight: 600 }}>{student.birthDate}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Giới tính: </span>
              <span style={{ fontWeight: 600 }}>{student.gender}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Số CCCD: </span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{student.cccd}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Điện thoại: </span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{student.phoneNumber}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Quê quán: </span>
              <span style={{ fontWeight: 600 }}>{student.hometown}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Điểm GPA tích lũy: </span>
              <span style={{ fontWeight: 700, color: '#22C55E' }}>{student.gpa} / 10.0</span>
            </div>
          </div>
        </div>

        {/* Schedule today */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarBlank size={24} color="#22C55E" />
              <h2>Lịch học hôm nay</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {personalSchedules.map((sch, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{sch.subjectName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Phòng: <span style={{ color: '#22C55E' }}>{sch.room}</span> • Giảng viên: {sch.teacherName}</div>
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
              <CheckCircle size={20} color="#22C55E" />
              <h2>Thống kê điểm danh cá nhân</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={attendanceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  nameKey="name"
                >
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', fontSize: '0.8rem', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
            {personalAttendance.map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>{log.subjectName} ({log.date})</span>
                <span className={`status-badge ${getStatusClass(log.status)}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {getStatusText(log.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exams Results Trend */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Notebook size={20} color="#22C55E" />
              <h2>Kết quả kiểm tra & Học tập</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={personalExams}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="subjectName" stroke="#94A3B8" fontSize={8} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="score" name="Điểm thi" stroke="#22C55E" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="data-table-container" style={{ marginTop: '10px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>Điểm</th>
                  <th>Ngày thi</th>
                </tr>
              </thead>
              <tbody>
                {personalExams.map((ex) => (
                  <tr key={ex.id}>
                    <td style={{ fontWeight: 600 }}>{ex.subjectName}</td>
                    <td style={{ fontFamily: 'var(--font-heading)', color: ex.score >= 8 ? '#22C55E' : ex.score >= 5 ? '#3B82F6' : '#EF4444', fontWeight: 700 }}>{ex.score}</td>
                    <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{ex.examDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="panel-card">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={24} color="#22C55E" />
            <h2>Thông báo từ nhà trường</h2>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {studentStats.announcements.map((ann) => (
            <div key={ann.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F8FAFC' }}>{ann.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{ann.date} • {ann.sender}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{ann.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
