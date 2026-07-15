import React, { useState, useEffect } from 'react';
import { Users, Presentation, BookOpen, Database, Cloud } from '@phosphor-icons/react';
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
  ResponsiveContainer 
} from 'recharts';

interface DeptKpis {
  students: number;
  classes: number;
  subjects: number;
}

interface TeachingProgressItem {
  subject: string;
  done: number;
  total: number;
}

interface QuestionSuiteItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  easyCount: number;
  normalCount: number;
  hardCount: number;
  lastUpdated: string;
}

interface DeptDashboardData {
  kpis: DeptKpis;
  teachingProgress: TeachingProgressItem[];
  classScoresComparison: any[];
}

interface HeatmapItem {
  studentName: string;
  date: string;
  status: number;
}

// Attendance Heatmap Matrix Component
const AttendanceHeatmapMatrix: React.FC<{ heatmapData: HeatmapItem[] }> = ({ heatmapData }) => {
  const students = Array.from(new Set(heatmapData.map(item => item.studentName))).sort();
  const sessions = Array.from(new Set(heatmapData.map(item => item.date))).sort();

  const getStatus = (studentName: string, date: string) => {
    const record = heatmapData.find(item => item.studentName === studentName && item.date === date);
    return record ? record.status : null;
  };

  const getStatusColor = (status: number | null) => {
    switch (status) {
      case 1: return '#22C55E'; // Present - Green
      case 2: return '#EAB308'; // Late - Yellow
      case 3: return '#3B82F6'; // Excused - Blue
      case 4: return '#EF4444'; // Unexcused - Red
      default: return '#1E293B'; // No session - Gray
    }
  };

  const getStatusLabel = (status: number | null) => {
    switch (status) {
      case 1: return 'V';
      case 2: return 'T';
      case 3: return 'P';
      case 4: return 'K';
      default: return '-';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', overflowX: 'auto' }}>
      <table className="data-table" style={{ width: '100%', minWidth: '450px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Học Viên</th>
            {sessions.map((session, idx) => (
              <th key={idx} style={{ textAlign: 'center', padding: '8px', fontSize: '0.75rem' }}>{session}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, sIdx) => (
            <tr key={sIdx}>
              <td style={{ fontWeight: 600, padding: '8px', fontSize: '0.85rem' }}>{student}</td>
              {sessions.map((session, dIdx) => {
                const status = getStatus(student, session);
                const color = getStatusColor(status);
                const label = getStatusLabel(status);
                return (
                  <td key={dIdx} style={{ padding: '4px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: status ? '#020617' : '#94A3B8',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        margin: '0 auto',
                        border: '1px solid var(--color-border)'
                      }}
                      title={`${student} - ${session}: ${
                        status === 1 ? 'Có mặt' : status === 2 ? 'Đi muộn' : status === 3 ? 'Vắng có phép' : status === 4 ? 'Vắng không phép' : 'Chưa học'
                      }`}
                    >
                      {label}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.7rem', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#22C55E' }}></div>
          <span style={{ color: '#94A3B8' }}>Có mặt (V)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#EAB308' }}></div>
          <span style={{ color: '#94A3B8' }}>Trễ (T)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3B82F6' }}></div>
          <span style={{ color: '#94A3B8' }}>Có phép (P)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#EF4444' }}></div>
          <span style={{ color: '#94A3B8' }}>Không phép (K)</span>
        </div>
      </div>
    </div>
  );
};

export const DeptHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DeptDashboardData | null>(null);
  const [questions, setQuestions] = useState<QuestionSuiteItem[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('345c4ed0-dd7e-473e-231b-08d9d001b4e8'); // Default or stub id
  const [loading, setLoading] = useState<boolean>(true);
  const [heatmapLoading, setHeatmapLoading] = useState<boolean>(false);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const departmentId = user?.majorId;
        if (!departmentId) throw new Error('Tài khoản chưa được gán bộ môn/ngành');
        
        // Fetch dashboard statistics
        const response = await axios.get<DeptDashboardData>(`http://localhost:5000/api/department/dashboard?departmentId=${departmentId}`);
        setData(response.data);

        // Fetch question bank suites
        try {
          const qsResponse = await axios.get<QuestionSuiteItem[]>(`http://localhost:5000/api/department/questions?departmentId=${departmentId}`);
          setQuestions(qsResponse.data);
        } catch (qsErr) {
          console.warn('Failed to fetch questions, using mock questions', qsErr);
          setQuestions([]);
        }

        setIsMock(false);
      } catch (err: any) {
        console.warn('Backend API connection failed, falling back to frontend mock data', err);
        setIsMock(true);
        setData(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch heatmap whenever selected class changes
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setHeatmapLoading(true);
        const response = await axios.get<HeatmapItem[]>(`http://localhost:5000/api/attendance/heatmap/${selectedClassId}`);
        setHeatmap(response.data);
      } catch (err) {
        console.warn('Failed to fetch attendance heatmap, using mock fallback', err);
        // Standard mock dataset matching mock attendance
        setHeatmap([]);
        /*
          { studentName: "Đặng Đức Toàn", date: "Buổi 1", status: 1 },
          { studentName: "Đặng Đức Toàn", date: "Buổi 2", status: 1 },
          { studentName: "Đặng Đức Toàn", date: "Buổi 3", status: 1 },
          { studentName: "Đặng Đức Toàn", date: "Buổi 4", status: 1 },
          { studentName: "Đặng Đức Toàn", date: "Buổi 5", status: 2 },
          { studentName: "Đặng Đức Toàn", date: "Buổi 6", status: 1 },
          
          { studentName: "Trần Thị Thảo Vy", date: "Buổi 1", status: 1 },
          { studentName: "Trần Thị Thảo Vy", date: "Buổi 2", status: 1 },
          { studentName: "Trần Thị Thảo Vy", date: "Buổi 3", status: 3 },
          { studentName: "Trần Thị Thảo Vy", date: "Buổi 4", status: 4 },
          { studentName: "Trần Thị Thảo Vy", date: "Buổi 5", status: 1 },
          { studentName: "Trần Thị Thảo Vy", date: "Buổi 6", status: 1 },
          
          { studentName: "Nguyễn Văn An", date: "Buổi 1", status: 1 },
          { studentName: "Nguyễn Văn An", date: "Buổi 2", status: 2 },
          { studentName: "Nguyễn Văn An", date: "Buổi 3", status: 1 },
          { studentName: "Nguyễn Văn An", date: "Buổi 4", status: 1 },
          { studentName: "Nguyễn Văn An", date: "Buổi 5", status: 1 },
          { studentName: "Nguyễn Văn An", date: "Buổi 6", status: 4 },
          
          { studentName: "Phan Lê Vy", date: "Buổi 1", status: 1 },
          { studentName: "Phan Lê Vy", date: "Buổi 2", status: 1 },
          { studentName: "Phan Lê Vy", date: "Buổi 3", status: 1 },
          { studentName: "Phan Lê Vy", date: "Buổi 4", status: 1 },
          { studentName: "Phan Lê Vy", date: "Buổi 5", status: 1 },
          { studentName: "Phan Lê Vy", date: "Buổi 6", status: 1 }
        ]);
        */
      } finally {
        setHeatmapLoading(false);
      }
    };
    fetchHeatmapData();
  }, [selectedClassId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải dữ liệu dashboard bộ môn...</p>
      </div>
    );
  }

  if (!loading && !data) {
    return <div className="panel-card fade-in"><h2>Không thể tải dữ liệu bộ môn</h2><p>API chưa trả dữ liệu live. Kiểm tra mapping bộ môn của tài khoản và backend Supabase.</p></div>;
  }

  const kpisData = data?.kpis || { students: 0, classes: 0, subjects: 0 };
  const teachingProgressList = data?.teachingProgress || [];
  const scoresComparison = data?.classScoresComparison || [];
  const questionSuitesList = questions;

  const kpiItems = [
    { title: 'Sinh viên Bộ môn (SV)', value: kpisData.students, icon: <Users size={24} />, type: 'primary' },
    { title: 'Lớp học phần quản lý (Lớp HP)', value: kpisData.classes, icon: <Presentation size={24} />, type: 'warning' },
    { title: 'Môn học bộ môn (Môn)', value: kpisData.subjects, icon: <BookOpen size={24} />, type: 'info' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Live Data Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Bộ môn Công nghệ thông tin</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Giám sát tiến độ học phần, quản lý ngân hàng câu hỏi, so sánh điểm số và chuyên cần chi tiết</p>
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
          <span>{isMock ? 'API không khả dụng' : 'Dữ liệu Live (Supabase DB)'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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

      {/* Teaching Progress & Scores Comparison */}
      <div className="grid-2col">
        {/* Teaching Progress */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Tiến độ giảng dạy học phần</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {teachingProgressList.map((prog, idx) => {
              const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{prog.subject}</span>
                    <span style={{ color: '#94A3B8' }}>{prog.done}/{prog.total} buổi ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#22C55E' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score comparison between classes (Grouped Bar) */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>So sánh điểm trung bình giữa các lớp HP (Grouped Bar)</h2>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={scoresComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="subject" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
                <Bar dataKey="IT21A" fill="#3B82F6" name="Lớp IT21A" radius={[2, 2, 0, 0]} />
                <Bar dataKey="IT21B" fill="#22C55E" name="Lớp IT21B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="IT21C" fill="#EAB308" name="Lớp IT21C" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Questions table & Attendance Heatmap matrix */}
      <div className="grid-2col">
        {/* Question suite bank */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Đề thi trong Ngân hàng đề bộ môn ({questionSuitesList.length} đề)</h2>
          </div>
          <div className="data-table-container" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã môn</th>
                  <th>Môn học</th>
                  <th>Dễ</th>
                  <th>TB</th>
                  <th>Khó</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {questionSuitesList.map((qs) => (
                  <tr key={qs.id}>
                    <td style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontSize: '0.8rem' }}>{qs.subjectCode}</td>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{qs.subjectName}</td>
                    <td style={{ color: '#22C55E', fontWeight: 600 }}>{qs.easyCount}</td>
                    <td style={{ color: '#EAB308', fontWeight: 600 }}>{qs.normalCount}</td>
                    <td style={{ color: '#EF4444', fontWeight: 600 }}>{qs.hardCount}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{qs.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Attendance Heatmap Matrix */}
        <div className="panel-card" style={{ overflow: 'hidden' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h2>Điểm danh chi tiết học viên (Heatmap Matrix)</h2>
            
            {/* Class selection dropdown */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                backgroundColor: 'var(--color-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-foreground)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="345c4ed0-dd7e-473e-231b-08d9d001b4e8">IT21A - Lập trình C</option>
              <option value="345c4ed0-dd7e-473e-231b-08d9d001b4e9">IT21B - Cơ sở dữ liệu</option>
              <option value="345c4ed0-dd7e-473e-231b-08d9d001b4f0">IT21A - Web nâng cao</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: '8px' }}>
            {heatmapLoading ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Đang tải bảng điểm danh...</span>
              </div>
            ) : heatmap.length > 0 ? (
              <AttendanceHeatmapMatrix heatmapData={heatmap} />
            ) : (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748B' }}>
                Không có dữ liệu điểm danh cho lớp này
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
