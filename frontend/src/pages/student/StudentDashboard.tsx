import React, { useState, useEffect } from 'react';
import { mockStudents, mockSchedules, mockAttendanceLogs, mockExamResults, studentStats } from '../../mock/mockData';
import { 
  User, 
  CalendarBlank, 
  Notebook, 
  Megaphone,
  CheckCircle,
  FileText,
  Database,
  Cloud
} from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface StudentProfile {
  studentCode: string;
  fullName: string;
  major: string;
  academicYear: string;
  gpa: number;
}

interface StudentStats {
  gpa: number;
  presentCount: number;
  lateCount: number;
  absenceCount: number;
}

interface StudentAnnouncement {
  id: string;
  title: string;
  date: string;
  content: string;
  sender: string;
}

interface StudentExam {
  id: string;
  subjectName: string;
  score: number;
  examDate: string;
}

interface StudentScheduleToday {
  id: string;
  subjectName: string;
  room: string;
  teacherName: string;
  slotStart: number;
  slotEnd: number;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [schedules, setSchedules] = useState<StudentScheduleToday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Default target student ID for demo or context ID
        const studentId = user?.id || 'd3b07384-d113-49be-a5d2-000000000000';
        
        const [profileRes, statsRes, annRes, examsRes, scheduleRes] = await Promise.all([
          axios.get<StudentProfile>(`http://localhost:5000/api/student/profile?studentId=${studentId}`),
          axios.get<StudentStats>(`http://localhost:5000/api/student/dashboard?studentId=${studentId}`),
          axios.get<StudentAnnouncement[]>(`http://localhost:5000/api/student/announcements?studentId=${studentId}`),
          axios.get<StudentExam[]>(`http://localhost:5000/api/student/exams?studentId=${studentId}`),
          axios.get<StudentScheduleToday[]>(`http://localhost:5000/api/schedule/today?userId=${studentId}&role=1`)
        ]);

        setProfile(profileRes.data);
        setStats(statsRes.data);
        setAnnouncements(annRes.data);
        setExams(examsRes.data);
        setSchedules(scheduleRes.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Student Dashboard API connection failed, falling back to mock data', err);
        setIsMock(true);
        
        const mockStudent = mockStudents[0];
        setProfile({
          studentCode: mockStudent.studentCode,
          fullName: mockStudent.fullName,
          major: mockStudent.major,
          academicYear: mockStudent.academicYear,
          gpa: mockStudent.gpa
        });
        
        setStats({
          gpa: mockStudent.gpa,
          presentCount: mockAttendanceLogs.filter(l => l.studentName === mockStudent.fullName && l.status === 1).length || 8,
          lateCount: mockAttendanceLogs.filter(l => l.studentName === mockStudent.fullName && l.status === 2).length || 1,
          absenceCount: mockAttendanceLogs.filter(l => l.studentName === mockStudent.fullName && (l.status === 3 || l.status === 4)).length || 1
        });

        setAnnouncements(studentStats.announcements.map(ann => ({
          id: ann.id,
          title: ann.title,
          date: ann.date,
          content: ann.content,
          sender: ann.sender
        })));

        setExams(mockExamResults.filter(ex => ex.studentName === mockStudent.fullName).map(ex => ({
          id: ex.id,
          subjectName: ex.subjectName,
          score: ex.score,
          examDate: ex.examDate
        })));

        setSchedules(mockSchedules.slice(0, 2).map(sch => ({
          id: sch.id,
          subjectName: sch.subjectName,
          room: sch.room,
          teacherName: sch.teacherName,
          slotStart: sch.slotStart,
          slotEnd: sch.slotEnd
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !profile || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải hồ sơ sinh viên...</p>
      </div>
    );
  }

  const attendanceChartData = [
    { name: 'Có mặt', value: stats.presentCount, color: '#22C55E' },
    { name: 'Đi trễ', value: stats.lateCount, color: '#EAB308' },
    { name: 'Vắng phép/KP', value: stats.absenceCount, color: '#EF4444' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Live Data Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cổng thông tin Sinh viên</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Theo dõi hồ sơ cá nhân, lịch học chuyên cần và kết quả học tập</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: isMock ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: isMock ? '#EAB308' : '#22C55E',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          {isMock ? <Cloud size={16} /> : <Database size={16} />}
          <span>{isMock ? 'Dữ liệu Mock (CSDL Offline)' : 'Dữ liệu Live (Supabase DB)'}</span>
        </div>
      </div>

      <div className="grid-2col">
        {/* Profile Card */}
        <div className="panel-card" style={{ gap: '16px' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={24} color="#22C55E" />
              <h2>Hồ sơ cá nhân</h2>
            </div>
            <Link to="/student/cv" className="btn-icon-text primary" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
              <FileText size={16} />
              <span>Tạo CV / Resume</span>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.fullName)}`} 
              alt="avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px solid var(--color-border)' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile.fullName}</h3>
              <p style={{ fontSize: '0.9rem', color: '#22C55E', fontWeight: 600 }}>MSSV: {profile.studentCode}</p>
              <p style={{ fontSize: '0.85rem' }}>{profile.major} • {profile.academicYear}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div>
              <span style={{ color: '#64748B' }}>Email liên hệ: </span>
              <span style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Điểm GPA tích lũy: </span>
              <span style={{ fontWeight: 700, color: '#22C55E' }}>{profile.gpa} / 10.0</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Hệ đào tạo: </span>
              <span style={{ fontWeight: 600 }}>Cao đẳng chính quy</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Trạng thái: </span>
              <span className="status-badge present" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Đang học</span>
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
            {schedules.length > 0 ? (
              schedules.map((sch) => (
                <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
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
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.9rem' }}>
                Hôm nay bạn không có lịch học.
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
              <CheckCircle size={20} color="#22C55E" />
              <h2>Thống kê chuyên cần tích lũy</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', fontSize: '0.8rem', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22C55E' }}>{stats.presentCount}</div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Có mặt</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EAB308' }}>{stats.lateCount}</div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Đi muộn</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EF4444' }}>{stats.absenceCount}</div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Vắng</div>
            </div>
          </div>
        </div>

        {/* Exams Results Trend */}
        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Notebook size={20} color="#22C55E" />
              <h2>Điểm thi học phần ({exams.length} môn)</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 180 }}>
            {exams.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={exams}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="subjectName" stroke="#94A3B8" fontSize={8} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                  <Line type="monotone" dataKey="score" name="Điểm" stroke="#22C55E" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                Chưa ghi nhận điểm thi học kỳ này
              </div>
            )}
          </div>
          <div className="data-table-container" style={{ marginTop: '10px', maxHeight: '120px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>Điểm</th>
                  <th>Ngày thi</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => (
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
            <h2>Thông báo cá nhân gần đây</h2>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <div key={ann.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F8FAFC' }}>{ann.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{ann.date} • {ann.sender}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{ann.content}</p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#64748B', fontSize: '0.85rem' }}>
              Không có thông báo mới nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
