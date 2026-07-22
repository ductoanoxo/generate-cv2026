import React, { useState, useEffect } from 'react';
import { facultyStats } from '../../mock/mockData';
import { 
  Users, 
  UserSquare, 
  Notebook, 
  BookOpen, 
  Database, 
  Cloud, 
  ChartBar, 
  CalendarBlank, 
  GraduationCap, 
  MagnifyingGlass,
  CheckCircle,
  Funnel
} from '@phosphor-icons/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
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

interface FacultyKpis {
  students: number;
  teachers: number;
  majors: number;
  subjects: number;
}

interface ClassAttendanceRate {
  name: string;
  present: number;
  late: number;
  absence: number;
}

interface AverageScoreBySubject {
  name: string;
  score: number;
}

interface TeacherEvaluation {
  aspect: string;
  value: number;
}

interface FacultyTeacher {
  name: string;
  title: string;
  email: string;
  isHead: boolean;
}

interface FacultyDashboardData {
  kpis: FacultyKpis;
  semesterProgress: number;
  classAttendanceRates: ClassAttendanceRate[];
  averageScoresBySubject: AverageScoreBySubject[];
  teacherEvaluations: TeacherEvaluation[];
  teachers: FacultyTeacher[];
}

type TabType = 'overview' | 'schedule' | 'teachers' | 'all';

export const DeanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [teacherSearch, setTeacherSearch] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const facultyId = user?.facultyId;
        if (!facultyId) throw new Error('Tài khoản chưa được gán khoa');
        const [dashboardRes, scheduleRes] = await Promise.all([
          axios.get<FacultyDashboardData>(`http://localhost:5000/api/faculty/dashboard?facultyId=${facultyId}`),
          axios.get<any[]>(`http://localhost:5000/api/schedule/faculty/${facultyId}`)
        ]);

        setData(dashboardRes.data);
        setSchedules(scheduleRes.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Faculty Dean API connection failed, falling back to mock data', err);
        setIsMock(true);
        setData(null);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.facultyId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải dữ liệu dashboard khoa...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel-card fade-in">
        <h2>Không thể tải dữ liệu Khoa</h2>
        <p>API chưa trả dữ liệu từ hệ thống.</p>
      </div>
    );
  }

  const kpisData = data?.kpis || facultyStats.kpis;
  const progressValue = data?.semesterProgress ?? facultyStats.semesterProgress;
  const teachersList = data?.teachers || facultyStats.teachers;

  const filteredTeachers = teachersList.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.title.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const kpiItems = [
    { title: 'Sinh viên trong Khoa (SV)', value: kpisData.students, icon: <Users size={24} />, type: 'primary' },
    { title: 'Giảng viên Khoa (GV)', value: kpisData.teachers, icon: <UserSquare size={24} />, type: 'warning' },
    { title: 'Chuyên ngành học (Ngành)', value: kpisData.majors, icon: <Notebook size={24} />, type: 'info' },
    { title: 'Môn học phụ trách', value: kpisData.subjects, icon: <BookOpen size={24} />, type: 'success' }
  ];

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Header & Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
            Cổng Thông Tin Trưởng Khoa CNOT&KTML
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
            Theo dõi chỉ số KPI, thống kê giảng dạy, đánh giá môn học và thời khóa biểu tuần của khoa
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: isMock ? 'rgba(234, 179, 8, 0.12)' : 'rgba(34, 197, 94, 0.12)',
          color: isMock ? '#EAB308' : '#22C55E',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: isMock ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          {isMock ? <Cloud size={16} /> : <Database size={16} />}
          <span>{isMock ? 'Dữ liệu Demo / Mock' : 'Dữ liệu Live (Supabase DB)'}</span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-kpis">
        {kpiItems.map((kpi, idx) => (
          <div key={idx} className={`kpi-card ${kpi.type}`}>
            <div className="kpi-details">
              <h3>{kpi.title}</h3>
              <div className="kpi-value">{kpi.value}</div>
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation Menu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #334155',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? '#3B82F6' : 'transparent',
            color: activeTab === 'overview' ? '#FFFFFF' : '#94A3B8',
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap'
          }}
        >
          <ChartBar size={18} />
          <span>Thống kê & Đánh giá</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'schedule' ? '#3B82F6' : 'transparent',
            color: activeTab === 'schedule' ? '#FFFFFF' : '#94A3B8',
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap'
          }}
        >
          <CalendarBlank size={18} />
          <span>Lịch giảng dạy Khoa</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'teachers' ? '#3B82F6' : 'transparent',
            color: activeTab === 'teachers' ? '#FFFFFF' : '#94A3B8',
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap'
          }}
        >
          <GraduationCap size={18} />
          <span>Giảng viên trong Khoa ({teachersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'all' ? 'rgba(51, 65, 85, 0.8)' : 'transparent',
            color: activeTab === 'all' ? '#F8FAFC' : '#64748B',
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap',
            marginLeft: 'auto'
          }}
        >
          <span>Xem tất cả</span>
        </button>
      </div>

      {/* TAB 1: THỐNG KÊ & ĐÁNH GIÁ (OVERVIEW) */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Semester Progress */}
          <div className="panel-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#F8FAFC' }}>
                Tiến độ hoàn thành môn học học kỳ này
              </h2>
              <span style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 700, fontSize: '1.1rem' }}>
                {progressValue}%
              </span>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${progressValue}%`, height: '100%', backgroundColor: '#22C55E', transition: 'width 1s ease-in-out' }}></div>
            </div>
          </div>

          {/* Row 1 Charts: Attendance & Radar Evaluations */}
          <div className="grid-2col">
            <div className="panel-card">
              <div className="panel-header">
                <h2>Chuyên cần theo lớp học phần (Stacked Bar)</h2>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={data?.classAttendanceRates || facultyStats.classAttendanceRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
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

            <div className="panel-card">
              <div className="panel-header">
                <h2>Đánh giá giảng viên từ sinh viên (Radar Chart)</h2>
              </div>
              <div style={{ width: '100%', height: 280, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data?.teacherEvaluations || facultyStats.teacherEvaluations}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="aspect" stroke="#94A3B8" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#64748B" fontSize={9} />
                    <Radar name="Điểm đánh giá" dataKey="value" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2 Chart: Avg score Bar chart */}
          <div className="panel-card">
            <div className="panel-header">
              <h2>Điểm trung bình theo môn trong Khoa (Bar Chart)</h2>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={data?.averageScoresBySubject || facultyStats.averageScoresBySubject} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 10]} stroke="#94A3B8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={180} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                  <Bar dataKey="score" name="Điểm TB" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LỊCH GIẢNG DẠY KHOA (CALENDAR VIEW) */}
      {(activeTab === 'schedule' || activeTab === 'all') && (
        <div className="panel-card">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Lịch giảng dạy tuần của Khoa (Calendar View)</h2>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Hiển thị {schedules.length} lớp học phần</span>
          </div>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <div className="schedule-grid" style={{ minWidth: '800px', gridTemplateColumns: '80px repeat(5, 1fr)' }}>
              <div className="schedule-header-cell">Tiết</div>
              {days.map((day, idx) => (
                <div key={idx} className="schedule-header-cell">{day}</div>
              ))}

              {slots.map((slot) => (
                <React.Fragment key={slot}>
                  <div className="schedule-time-cell">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>T. {slot}</span>
                      <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                        {slot <= 5 ? `${slot + 6}:30` : `${slot + 7}:00`}
                      </span>
                    </div>
                  </div>
                  {days.map((_, dayIdx) => {
                    const dayNum = dayIdx + 2;
                    const activeClasses = schedules.filter(sch => 
                      sch.dayOfWeek === dayNum && 
                      slot >= sch.slotStart && 
                      slot <= sch.slotEnd
                    );

                    return (
                      <div key={dayIdx} className="schedule-slot-cell" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', minHeight: '85px' }}>
                        {activeClasses.map((sch) => {
                          const isStart = sch.slotStart === slot;
                          if (isStart) {
                            return (
                              <div
                                key={sch.id}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                  borderLeft: '3px solid #3B82F6',
                                  border: '1px solid rgba(59, 130, 246, 0.25)',
                                  fontSize: '0.7rem'
                                }}
                              >
                                <div style={{ fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {sch.subjectName}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.65rem', marginTop: '2px' }}>
                                  <span>Lớp: {sch.classCode}</span>
                                  <span style={{ color: '#3B82F6', fontWeight: 600 }}>P: {sch.room}</span>
                                </div>
                                <div style={{ color: '#64748B', fontSize: '0.65rem', marginTop: '2px', fontStyle: 'italic' }}>
                                  GV: {sch.teacherName}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div 
                                key={sch.id} 
                                style={{ 
                                  padding: '2px 4px', 
                                  borderRadius: '3px', 
                                  backgroundColor: 'rgba(59, 130, 246, 0.04)', 
                                  borderLeft: '2px dashed rgba(59, 130, 246, 0.4)', 
                                  color: '#64748B', 
                                  fontSize: '0.65rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                ↓ {sch.classCode}
                              </div>
                            );
                          }
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DANH SÁCH GIẢNG VIÊN (TEACHERS LIST) */}
      {(activeTab === 'teachers' || activeTab === 'all') && (
        <div className="panel-card">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2>Giảng viên thuộc Khoa ({filteredTeachers.length})</h2>
            
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1E293B', padding: '6px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <MagnifyingGlass size={16} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Tìm tên hoặc email giảng viên..." 
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#F8FAFC', outline: 'none', fontSize: '0.8rem', width: '220px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px' }}>Giảng Viên</th>
                  <th style={{ padding: '10px' }}>Email Liên Hệ</th>
                  <th style={{ padding: '10px' }}>Chức danh</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Nhiệm Vụ Khoa</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacher.name)}`} 
                        alt="avatar" 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #334155' }} 
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{teacher.name}</span>
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.8rem', color: '#94A3B8' }}>{teacher.email}</td>
                    <td style={{ padding: '10px', fontSize: '0.825rem' }}>{teacher.title}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {teacher.isHead ? (
                        <span className="status-badge present" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                          Trưởng khoa
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Giảng dạy</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>
                      Không tìm thấy giảng viên phù hợp với từ khóa "{teacherSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
