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

interface FacultyDashboardData {
  kpis: FacultyKpis;
  semesterProgress: number;
  classAttendanceRates: ClassAttendanceRate[];
  averageScoresBySubject: AverageScoreBySubject[];
  teacherEvaluations: TeacherEvaluation[];
}

export const DeanDashboard: React.FC = () => {
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using the default Faculty ID from Supabase
        const facultyId = '4d82e2b2-ff50-4df3-a7c3-08618fb26f32';
        const response = await axios.get<FacultyDashboardData>(`http://localhost:5000/api/faculty/dashboard?facultyId=${facultyId}`);
        setData(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Backend API connection failed, falling back to frontend mock data', err);
        setIsMock(true);
        setData(facultyStats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải dữ liệu dashboard khoa...</p>
      </div>
    );
  }

  const kpisData = data?.kpis || facultyStats.kpis;
  const progressValue = data?.semesterProgress ?? facultyStats.semesterProgress;

  const kpiItems = [
    { title: 'Sinh viên trong Khoa', value: kpisData.students, icon: <Users size={24} />, type: 'primary' },
    { title: 'Giảng viên Khoa', value: kpisData.teachers, icon: <UserSquare size={24} />, type: 'warning' },
    { title: 'Chuyên ngành học', value: kpisData.majors, icon: <Notebook size={24} />, type: 'info' },
    { title: 'Môn học phụ trách', value: kpisData.subjects, icon: <BookOpen size={24} />, type: 'success' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Live Data Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Khoa Công nghệ thông tin</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Theo dõi các chỉ số KPIs khoa, đánh giá giảng dạy và chuyên cần</p>
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
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Tiến độ học kỳ hiện tại</h2>
          <span style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 700 }}>{progressValue}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${progressValue}%`, height: '100%', backgroundColor: '#22C55E', transition: 'width 1s ease-in-out' }}></div>
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

        {/* Avg scores per Subject */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Điểm trung bình các môn học</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
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
      </div>

      <div className="grid-2col">
        {/* Radar Evaluation */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Đánh giá Giảng viên (Phản hồi sinh viên)</h2>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.teacherEvaluations || facultyStats.teacherEvaluations}>
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
