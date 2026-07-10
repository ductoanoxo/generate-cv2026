import React, { useState, useEffect } from 'react';
import { 
  User, 
  CalendarBlank, 
  Notebook, 
  CheckCircle,
  FileText,
  Cloud
} from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface StudentProfile {
  fullName: string;
  studentCode: string;
  majorName: string;
  academicYearName: string;
  birthDate: string | null;
  gender: string | null;
  email: string;
  profilePicUrl: string | null;
  placeOfBirth: string | null;
  hometown: string | null;
  ethnicity: string | null;
  religion: string | null;
  studyStatus: number | null;
  gpa: number;
  phoneNumber: string | null;
  cccd: string | null;
}

interface StudentSchedule {
  subjectTeachingName: string;
  subjectName: string;
  roomName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotStart: number;
  slotEnd: number;
}

interface StudentAttendanceStat {
  name: string;
  value: number;
  color: string;
}

interface StudentExamResult {
  subjectTeachingExamName: string;
  subjectName: string;
  result: number | null;
  combinedResult: number | null;
  examDate: string;
  gradeBand: string;
}

interface StudentSubject {
  subjectTeachingId: string;
  subjectName: string;
  subjectCode: string;
  classCode: string;
  creditPoint: number;
  teacherName: string;
  totalSessions: number;
  completedSessions: number;
}

interface StudentAnnouncement {
  id: string;
  type: number;
  message: string;
  creationDate: string;
  deepLink: string;
  deepLinkParam: string;
  status: number;
  enforceRead: boolean;
  notificationType: number | null;
}

interface StudentDashboardData {
  profile: StudentProfile | null;
  todaySchedules: StudentSchedule[];
  attendanceStats: StudentAttendanceStat[];
  examResults: StudentExamResult[];
  currentSubjects: StudentSubject[];
  announcements: StudentAnnouncement[];
}

interface ComponentScore {
  componentName: string;
  score: number | null;
  weight: number;
}

interface SubjectScore {
  subjectName: string;
  subjectCode: string;
  creditPoint: number;
  result: number | null;
  combinedResult: number | null;
  gradeBand: string;
  gradeC: string;
  grade4: number;
  resultIcon: string;
  detailAction: string;
  components: ComponentScore[];
}

interface SemesterScore {
  semesterName: string;
  academicYear: string;
  subjects: SubjectScore[];
  semesterGpa: number | null;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [semesterScores, setSemesterScores] = useState<SemesterScore[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardAndScores = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        if (!user?.id) {
          setErrorMsg('Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const [dashboardRes, scoresRes] = await Promise.all([
          axios.get<StudentDashboardData>(
            `http://localhost:5000/api/student/dashboard?studentId=${user.id}`
          ),
          axios.get<SemesterScore[]>(
            `http://localhost:5000/api/student/scores?studentId=${user.id}`
          )
        ]);

        setData(dashboardRes.data);
        setSemesterScores(scoresRes.data);

        // Select the first/latest semester by default
        if (scoresRes.data && scoresRes.data.length > 0) {
          setSelectedSemester(scoresRes.data[0].semesterName);
        }
      } catch (err: any) {
        console.error('Dashboard error details:', err);
        setErrorMsg(`Không thể kết nối cơ sở dữ liệu để tải thông tin dashboard: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardAndScores();
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#22C55E',
          fontWeight: 600,
        }}
      >
        <div
          className="spinner"
          style={{
            border: '3px solid rgba(34, 197, 94, 0.1)',
            borderTop: '3px solid #22C55E',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <span>Đang tải thông tin dashboard từ cơ sở dữ liệu...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        style={{
          padding: '12px',
          borderRadius: '6px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #EF4444',
          color: '#FCA5A5',
          fontSize: '0.85rem',
        }}
      >
        {errorMsg}
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          background: 'rgba(30, 41, 59, 0.2)',
          border: '1px dashed var(--color-border)',
          borderRadius: '12px',
          color: '#94A3B8',
        }}
      >
        Không tìm thấy thông tin hồ sơ sinh viên.
      </div>
    );
  }

  const profile = data.profile;
  const todaySchedules = data.todaySchedules;
  const attendanceStats = data.attendanceStats;

  const attendanceChartData = attendanceStats.map(stat => ({
    name: stat.name,
    value: stat.value,
    color: stat.color
  }));

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'inherit';
    if (score >= 8.0) return '#22C55E';
    if (score >= 5.0) return '#3B82F6';
    return '#EF4444';
  };

  const currentSemesterData = semesterScores.find(s => s.semesterName === selectedSemester);
  const chartData = currentSemesterData 
    ? currentSemesterData.subjects.map(sub => ({
        ...sub,
        combinedResult: sub.combinedResult !== null ? parseFloat(sub.combinedResult.toFixed(1)) : null
      }))
    : [];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 16px',
        }}
      >
        <div
          style={{
            fontSize: '0.85rem',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Trạng thái kết nối:</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#22C55E',
              fontWeight: 600,
            }}
          >
            <Cloud size={16} /> Đã kết nối Cơ sở dữ liệu Supabase (API .NET 8)
          </span>
        </div>
      </div>

      <div className="grid-2col">
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
              {profile.profilePicUrl ? (
                <img src={profile.profilePicUrl} alt={profile.fullName} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
              ) : (
                profile.fullName.split(' ').pop()?.[0]
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile.fullName}</h3>
              <p style={{ fontSize: '0.9rem', color: '#22C55E', fontWeight: 600 }}>MSSV: {profile.studentCode}</p>
              <p style={{ fontSize: '0.85rem' }}>{profile.majorName} • {profile.academicYearName}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div>
              <span style={{ color: '#64748B' }}>Ngày sinh: </span>
              <span style={{ fontWeight: 600 }}>
                {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Giới tính: </span>
              <span style={{ fontWeight: 600 }}>{profile.gender || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Số CCCD: </span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{profile.cccd || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Điện thoại: </span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{profile.phoneNumber || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Quê quán: </span>
              <span style={{ fontWeight: 600 }}>{profile.hometown || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Điểm GPA tích lũy: </span>
              <span style={{ fontWeight: 700, color: '#22C55E' }}>{profile.gpa.toFixed(2)} / 10.0</span>
            </div>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarBlank size={24} color="#22C55E" />
              <h2>Lịch học hôm nay</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todaySchedules.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
                Không có lịch học hôm nay
              </div>
            ) : (
              todaySchedules.map((sch, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{sch.subjectName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Phòng: <span style={{ color: '#22C55E' }}>{sch.roomName}</span> • Lớp: {sch.subjectTeachingName}</div>
                  </div>
                  <div>
                    <span className="status-badge present" style={{ fontSize: '0.7rem' }}>
                      Tiết {sch.slotStart} - {sch.slotEnd}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid-2col">
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
            {attendanceStats.map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>{stat.name}</span>
                <span style={{ color: stat.color, fontWeight: 700 }}>
                  {stat.value} buổi
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Notebook size={20} color="#22C55E" />
              <h2>Kết quả học tập</h2>
            </div>
            {semesterScores.length > 0 && (
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Học kỳ:</label>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-foreground)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '220px',
                    height: '38px',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#22C55E'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <span style={{ fontWeight: 500 }}>
                    {selectedSemester ? selectedSemester.split(' - Từ ')[0] : 'Chọn học kỳ'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>▼</span>
                </button>
                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '42px',
                      right: 0,
                      background: '#0f172a',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 100,
                      minWidth: '220px',
                      maxHeight: '190px', // display ~5 items with scrolling
                      overflowY: 'auto',
                      padding: '4px',
                    }}
                  >
                    {semesterScores.map((sem, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedSemester(sem.semesterName);
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: selectedSemester === sem.semesterName ? '#22C55E' : 'var(--color-foreground)',
                          background: selectedSemester === sem.semesterName ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontWeight: selectedSemester === sem.semesterName ? 600 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSemester !== sem.semesterName) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSemester !== sem.semesterName) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {sem.semesterName.split(' - Từ ')[0]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="subjectCode" stroke="#94A3B8" fontSize={9} fontWeight={600} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
                  formatter={(value: any, _name: any, props: any) => {
                    const subjectName = props.payload?.subjectName || '';
                    return [typeof value === 'number' ? value.toFixed(1) : value, `${subjectName} (Điểm TK)`];
                  }}
                />
                <Line type="monotone" dataKey="combinedResult" name="Điểm TK" stroke="#22C55E" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="data-table-container" style={{ marginTop: '10px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th style={{ textAlign: 'center' }}>Số TC</th>
                  <th style={{ textAlign: 'center' }}>Điểm TK</th>
                </tr>
              </thead>
              <tbody>
                {chartData.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#94A3B8' }}>Chưa có kết quả học tập</td>
                  </tr>
                ) : (
                  chartData.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{sub.subjectCode}</td>
                      <td style={{ textAlign: 'center' }}>{sub.creditPoint}</td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontFamily: 'var(--font-heading)',
                          color: getScoreColor(sub.combinedResult),
                          fontWeight: 700,
                        }}
                      >
                        {sub.combinedResult !== null ? sub.combinedResult.toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
