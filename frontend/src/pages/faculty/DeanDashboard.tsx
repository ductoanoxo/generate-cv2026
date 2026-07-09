import React, { useState, useEffect } from 'react';
import { facultyStats, mockSchedules } from '../../mock/mockData';
import { Users, UserSquare, Notebook, BookOpen, Database, Cloud } from '@phosphor-icons/react';
import axios from 'axios';
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

export const DeanDashboard: React.FC = () => {
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const facultyId = '4d82e2b2-ff50-4df3-a7c3-08618fb26f32';
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
        setData(facultyStats as any);
        setSchedules(mockSchedules);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải dữ liệu dashboard khoa...</p>
      </div>
    );
  }

  const kpisData = data?.kpis || facultyStats.kpis;
  const progressValue = data?.semesterProgress ?? facultyStats.semesterProgress;
  const teachersList = data?.teachers || facultyStats.teachers;

  const kpiItems = [
    { title: 'Sinh viên trong Khoa (SV)', value: kpisData.students, icon: <Users size={24} />, type: 'primary' },
    { title: 'Giảng viên Khoa (GV)', value: kpisData.teachers, icon: <UserSquare size={24} />, type: 'warning' },
    { title: 'Chuyên ngành học (Ngành)', value: kpisData.majors, icon: <Notebook size={24} />, type: 'info' },
    { title: 'Môn học phụ trách', value: kpisData.subjects, icon: <BookOpen size={24} />, type: 'success' }
  ];

  // Calendar variables
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Live Data Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Khoa Công nghệ thông tin</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Theo dõi các chỉ số KPIs khoa, đánh giá giảng dạy và lịch tuần tự của các lớp</p>
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

      {/* KPI Cards */}
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

      {/* Semester Progress */}
      <div className="panel-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Tiến độ hoàn thành môn học học kỳ này</h2>
          <span style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 700 }}>{progressValue}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${progressValue}%`, height: '100%', backgroundColor: '#22C55E', transition: 'width 1s ease-in-out' }}></div>
        </div>
      </div>

      {/* Stacked Attendance Bar & Radar Evaluations */}
      <div className="grid-2col">
        {/* Attendance by Class HP (Stacked Bar) */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Chuyên cần theo lớp học phần (Stacked Bar)</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
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

        {/* Radar Evaluation */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Đánh giá giảng viên từ sinh viên (Radar Chart)</h2>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
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

      {/* Avg score Bar chart & Teacher list table */}
      <div className="grid-2col">
        {/* Avg scores per Subject (Horizontal Bar Chart) */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Điểm trung bình theo Môn trong khoa (Bar Chart)</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={data?.averageScoresBySubject || facultyStats.averageScoresBySubject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 10]} stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={130} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="score" name="Điểm TB" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teachers List (Table + Avatar + IsHeadOfFaculty) */}
        <div className="panel-card" style={{ overflow: 'hidden' }}>
          <div className="panel-header">
            <h2>Giảng viên thuộc khoa</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '320px', flex: 1, paddingRight: '4px' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px' }}>Giáo Viên</th>
                  <th style={{ padding: '8px' }}>Chức danh</th>
                  <th style={{ padding: '8px' }}>Trưởng khoa</th>
                </tr>
              </thead>
              <tbody>
                {teachersList.map((teacher, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacher.name)}`} 
                        alt="avatar" 
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{teacher.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{teacher.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '8px', fontSize: '0.8rem' }}>{teacher.title}</td>
                    <td style={{ padding: '8px' }}>
                      {teacher.isHead ? (
                        <span className="status-badge present" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>Trưởng khoa</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Lịch giảng dạy khoa (Calendar view) */}
      <div className="panel-card">
        <div className="panel-header">
          <h2>Lịch giảng dạy tuần của Khoa (Calendar View)</h2>
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
                  const dayNum = dayIdx + 2; // Monday is 2
                  // Filter classes active in this day and slot range
                  const activeClasses = schedules.filter(sch => 
                    sch.dayOfWeek === dayNum && 
                    slot >= sch.slotStart && 
                    slot <= sch.slotEnd
                  );

                  return (
                    <div key={dayIdx} className="schedule-slot-cell" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', minHeight: '90px' }}>
                      {activeClasses.map((sch) => {
                        const isStart = sch.slotStart === slot;
                        // To make it clear, we show the tag in the starting cell with details, and simple indicators in ongoing cells.
                        if (isStart) {
                          return (
                            <div
                              key={sch.id}
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                borderLeft: '3px solid var(--color-accent)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                fontSize: '0.7rem'
                              }}
                            >
                              <div style={{ fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sch.subjectName}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.65rem', marginTop: '2px' }}>
                                <span>Lớp: {sch.classCode}</span>
                                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>P: {sch.room}</span>
                              </div>
                              <div style={{ color: '#64748B', fontSize: '0.65rem', marginTop: '2px', fontStyle: 'italic' }}>
                                GV: {sch.teacherName}
                              </div>
                            </div>
                          );
                        } else {
                          // Simple ongoing marker to show continuation
                          return (
                            <div 
                              key={sch.id} 
                              style={{ 
                                padding: '2px 4px', 
                                borderRadius: '3px', 
                                backgroundColor: 'rgba(34, 197, 94, 0.03)', 
                                borderLeft: '2px dashed rgba(34, 197, 94, 0.4)', 
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
    </div>
  );
};
