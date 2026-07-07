import React, { useState, useEffect } from 'react';
import { mockSubjectTeachings, mockSchedules, teacherStats } from '../../mock/mockData';
import { BookBookmark, Calendar, ChartPieSlice, Warning, Database, Cloud } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface TeacherClass {
  id: string;
  subjectCode: string;
  subjectName: string;
  classCode: string;
  totalSessions: number;
  completedSessions: number;
  studentsCount: number;
}

interface TeacherSchedule {
  id: string;
  subjectName: string;
  classCode: string;
  room: string;
  dayOfWeek: number;
  slotStart: number;
  slotEnd: number;
}

interface AttendanceStat {
  name: string;
  value: number;
  color: string;
}

interface AlertStudent {
  name: string;
  classCode: string;
  reason: string;
  status: string;
}

interface DashboardData {
  classesCount: number;
  todaySlotsCount: number;
  alertStudentsCount: number;
  classes: TeacherClass[];
  todaySchedules: TeacherSchedule[];
  attendanceStats: AttendanceStat[];
  alertStudents: AlertStudent[];
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Map user ID to valid Guid for mock testing
        const teacherId = user?.id === 'u4' ? 'd3b07384-d113-49be-a5d2-000000000000' : (user?.id ?? 'd3b07384-d113-49be-a5d2-000000000000');
        const response = await axios.get<DashboardData>(`http://localhost:5000/api/teacher/dashboard?teacherId=${teacherId}`);
        setData(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Backend API connection failed, falling back to frontend mock data', err);
        setIsMock(true);
        // Fallback to local mock data matching backend DTO structure
        setData({
          classesCount: 2,
          todaySlotsCount: 4,
          alertStudentsCount: teacherStats.alertStudents.length,
          classes: mockSubjectTeachings.slice(0, 2).map(st => ({
            id: st.id,
            subjectCode: st.subjectCode,
            subjectName: st.subjectName,
            classCode: st.classCode,
            totalSessions: st.totalSessions,
            completedSessions: st.completedSessions,
            studentsCount: st.studentsCount
          })),
          todaySchedules: mockSchedules.slice(0, 2).map(sch => ({
            id: sch.id,
            subjectName: sch.subjectName,
            classCode: sch.classCode,
            room: sch.room,
            dayOfWeek: sch.dayOfWeek,
            slotStart: sch.slotStart,
            slotEnd: sch.slotEnd
          })),
          attendanceStats: [
            { name: 'Có mặt', value: 38, color: '#22C55E' },
            { name: 'Đi trễ', value: 4, color: '#EAB308' },
            { name: 'Vắng có phép', value: 2, color: '#3B82F6' },
            { name: 'Vắng không phép', value: 1, color: '#EF4444' }
          ],
          alertStudents: teacherStats.alertStudents
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#22C55E', fontWeight: 600 }}>
        <div className="spinner" style={{ border: '3px solid rgba(34, 197, 94, 0.1)', borderTop: '3px solid #22C55E', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <span>Đang tải dữ liệu từ API...</span>
      </div>
    );
  }

  const teacherKPIs = [
    { title: 'Lớp đang giảng dạy', value: data.classesCount, icon: <BookBookmark size={24} />, type: 'primary' },
    { title: 'Lịch dạy hôm nay (tiết)', value: data.todaySlotsCount, icon: <Calendar size={24} />, type: 'info' },
    { title: 'Sinh viên cần chú ý', value: data.alertStudentsCount, icon: <Warning size={24} />, type: 'danger' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
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
          GV: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{user?.fullName}</span>
        </div>
      </div>

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
                {data.classes.map((st) => (
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
            {data.todaySchedules.length > 0 ? (
              data.todaySchedules.map((sch) => (
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
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.9rem' }}>
                Hôm nay bạn không có lịch giảng dạy.
              </div>
            )}
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
                  data={data.attendanceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.attendanceStats.map((entry, index) => (
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
            {data.alertStudents.length > 0 ? (
              data.alertStudents.map((alert, index) => (
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
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.9rem' }}>
                Không có sinh viên nào cần lưu ý đặc biệt.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
