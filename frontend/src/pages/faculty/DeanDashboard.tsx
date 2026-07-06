import React from 'react';
import { facultyStats, mockSchedules } from '../../mock/mockData';
import { Users, UserSquare, Notebook, BookOpen } from '@phosphor-icons/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const DeanDashboard: React.FC = () => {
  const kpis = [
    { title: 'Sinh viên trong Khoa', value: facultyStats.kpis.students, icon: <Users size={24} />, type: 'primary' },
    { title: 'Giảng viên Khoa', value: facultyStats.kpis.teachers, icon: <UserSquare size={24} />, type: 'warning' },
    { title: 'Chuyên ngành học', value: facultyStats.kpis.majors, icon: <Notebook size={24} />, type: 'info' },
    { title: 'Môn học phụ trách', value: facultyStats.kpis.subjects, icon: <BookOpen size={24} />, type: 'success' }
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

      {/* Semester Progress */}
      <div className="panel-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Tiến độ học kỳ hiện tại</h2>
          <span style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 700 }}>{facultyStats.semesterProgress}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${facultyStats.semesterProgress}%`, height: '100%', backgroundColor: '#22C55E', transition: 'width 1s ease-in-out' }}></div>
        </div>
      </div>

      {/* Main Faculty Charts */}
      <div className="grid-2col">
        {/* Attendance by Class HP */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Tỷ lệ chuyên cần các Lớp học phần</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={facultyStats.classAttendanceRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
                <Bar dataKey="present" name="Có mặt (%)" fill="#22C55E" stackId="a" />
                <Bar dataKey="late" name="Trễ (%)" fill="#EAB308" stackId="a" />
                <Bar dataKey="absence" name="Vắng (%)" fill="#EF4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg scores per Subject */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Điểm trung bình các môn học</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={facultyStats.averageScoresBySubject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 10]} stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={130} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="score" name="Điểm TB" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        {/* Radar Evaluation */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Đánh giá Giảng viên (Phản hồi sinh viên)</h2>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={facultyStats.teacherEvaluations}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="aspect" stroke="#94A3B8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#64748B" fontSize={9} />
                <Radar name="Điểm đánh giá" dataKey="value" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Schedule today */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Lịch giảng dạy hôm nay của Khoa</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
            {mockSchedules.slice(0, 4).map((sch) => (
              <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{sch.subjectName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Lớp: {sch.classCode} • Phòng: <span style={{ color: '#22C55E' }}>{sch.room}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>GV: {sch.teacherName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="status-badge present" style={{ fontSize: '0.7rem' }}>
                    Tiết {sch.slotStart} - {sch.slotEnd}
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
