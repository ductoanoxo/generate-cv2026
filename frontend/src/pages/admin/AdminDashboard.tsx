import React from 'react';
import { adminStats, mockAuditLogs, mockDevices, mockSettings } from '../../mock/mockData';
import { 
  Users, 
  UserCircle, 
  Buildings, 
  BookOpen, 
  Terminal, 
  DeviceMobile, 
  Sliders 
} from '@phosphor-icons/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const kpiData = [
    { title: 'Tổng Sinh Viên', value: adminStats.kpis.students, icon: <Users size={24} />, type: 'info' },
    { title: 'Tổng Giảng Viên', value: adminStats.kpis.teachers, icon: <UserCircle size={24} />, type: 'warning' },
    { title: 'Tổng Số Khoa', value: adminStats.kpis.faculties, icon: <Buildings size={24} />, type: 'primary' },
    { title: 'Môn Học Đang Mở', value: adminStats.kpis.subjects, icon: <BookOpen size={24} />, type: 'success' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* KPI Section */}
      <div className="grid-kpis">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className={`kpi-card ${kpi.type}`}>
            <div className="kpi-details">
              <h3>{kpi.title}</h3>
              <div className="kpi-value">{kpi.value}</div>
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Stats Charts */}
      <div className="grid-2col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Phân bố sinh viên theo Khoa</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={adminStats.studentsByFaculty}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Sinh viên theo Khóa</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={adminStats.studentsByYear}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="year"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#22C55E" />
                  <Cell fill="#EAB308" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance & Exam Results Distribution */}
      <div className="grid-2col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Xu hướng điểm danh theo tháng</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={adminStats.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
                <Area type="monotone" dataKey="present" name="Có mặt (%)" stroke="#22C55E" fill="rgba(34, 197, 94, 0.1)" />
                <Area type="monotone" dataKey="unexcused" name="Vắng KP (%)" stroke="#EF4444" fill="rgba(239, 68, 68, 0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Phân bố điểm thi (Toàn trường)</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={adminStats.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="value" name="Số lượng bài thi" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Logs, Devices & Settings Overview */}
      <div className="grid-3col">
        {/* Recent Logs */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color="#22C55E" />
              <h2>Nhật ký hoạt động</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
            {mockAuditLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#22C55E' }}>{log.username}</span>
                  <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{new Date(log.creationDate).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#F8FAFC' }}>{log.action}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>IP: {log.ipAddress}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DeviceMobile size={20} color="#22C55E" />
              <h2>Thiết bị truy cập</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={adminStats.devicesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  nameKey="name"
                >
                  {adminStats.devicesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', overflowY: 'auto', maxHeight: '100px' }}>
            {mockDevices.slice(0, 3).map((dev) => (
              <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>{dev.deviceName}</span>
                <span style={{ color: '#22C55E' }}>{dev.deviceType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Settings */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#22C55E" />
              <h2>Cấu hình học thuật</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              <span style={{ color: '#94A3B8' }}>Năm học hiện tại</span>
              <span style={{ fontWeight: 600 }}>{mockSettings.academicYear}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              <span style={{ color: '#94A3B8' }}>Học kỳ hiện tại</span>
              <span style={{ fontWeight: 600 }}>{mockSettings.semester}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              <span style={{ color: '#94A3B8' }}>Hạn đăng ký môn học</span>
              <span style={{ fontWeight: 600, color: '#EAB308' }}>{mockSettings.registrationDeadline}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              <span style={{ color: '#94A3B8' }}>Yêu cầu tốt nghiệp</span>
              <span style={{ fontWeight: 600 }}>{mockSettings.minimumCreditsToGraduate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              <span style={{ color: '#94A3B8' }}>Tích hợp Moodle</span>
              <span style={{ fontWeight: 600, color: '#22C55E' }}>{mockSettings.moodleIntegration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
