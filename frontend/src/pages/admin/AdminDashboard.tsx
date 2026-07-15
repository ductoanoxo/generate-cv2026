import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { adminStats, mockDevices } from '../../mock/mockData';
import { 
  Users, 
  UserCircle, 
  Buildings, 
  Terminal, 
  DeviceMobile, 
  Sliders,
  Notebook,
  Cloud,
  Database,
  ArrowSquareOut
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
  LineChart,
  Line,
  Treemap
} from 'recharts';

interface AdminKpis {
  students: number;
  teachers: number;
  faculties: number;
  subjects: number;
  majors: number;
}

interface StudentByFaculty {
  name: string;
  count: number;
}

interface StudentByFacultyAndMajor {
  faculty: string;
  major: string;
  count: number;
}

interface StudentByYear {
  year: string;
  count: number;
}

interface StudentByYearAndGender {
  year: string;
  gender: string;
  count: number;
}

interface AttendanceTrend {
  month: string;
  present: number;
  late: number;
  excused: number;
  unexcused: number;
}

interface AttendanceDistribution {
  name: string;
  value: number;
  color: string;
}

interface ScoreDistribution {
  name: string;
  value: number;
}

interface ExamResultsByFaculty {
  faculty: string;
  kem: number;
  yeu: number;
  tb: number;
  kha: number;
  gioi: number;
  avg: number;
}

interface DevicesDistribution {
  name: string;
  value: number;
  color: string;
}

interface AdminDashboardData {
  kpis: AdminKpis;
  studentsByFaculty: StudentByFaculty[];
  studentsByFacultyAndMajor: StudentByFacultyAndMajor[];
  studentsByYear: StudentByYear[];
  studentsByYearAndGender: StudentByYearAndGender[];
  attendanceTrend: AttendanceTrend[];
  attendanceDistribution: AttendanceDistribution[];
  scoreDistribution: ScoreDistribution[];
  examResultsByFaculty: ExamResultsByFaculty[];
  devicesDistribution: DevicesDistribution[];
}

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [statsRes, logsRes, devRes, settingsRes] = await Promise.all([
          axios.get<AdminDashboardData>('http://localhost:5000/api/admin/dashboard'),
          axios.get<any[]>('http://localhost:5000/api/admin/audit-logs?limit=5'),
          axios.get<any>('http://localhost:5000/api/admin/devices'),
          axios.get<any>('http://localhost:5000/api/admin/settings')
        ]);
        
        setData(statsRes.data);
        setLogs(logsRes.data);
        setDevices(devRes.data.devicesDistribution || devRes.data);
        setSettings(settingsRes.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Admin API connection failed, falling back to mock data', err);
        setIsMock(true);
        setData(null);
        setLogs([]);
        setDevices([]);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải dữ liệu admin dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="panel-card fade-in"><h2>Không thể tải dữ liệu Admin</h2><p>API chưa trả dữ liệu thật từ Supabase.</p></div>;
  }

  const kpisData = data?.kpis || adminStats.kpis;
  const kpiData = [
    { title: 'Tổng Sinh Viên (SV)', value: kpisData.students, icon: <Users size={24} />, type: 'info' },
    { title: 'Tổng Giảng Viên (GV)', value: kpisData.teachers, icon: <UserCircle size={24} />, type: 'warning' },
    { title: 'Tổng Số Khoa', value: kpisData.faculties, icon: <Buildings size={24} />, type: 'primary' },
    { title: 'Tổng Số Ngành', value: kpisData.majors || 24, icon: <Notebook size={24} />, type: 'success' }
  ];

  // 1. Phân bố SV theo Khoa/Ngành (Treemap)
  const treemapSource = data?.studentsByFacultyAndMajor || adminStats.studentsByFacultyAndMajor;
  const groupedTreemap: { [key: string]: { name: string; value: number }[] } = {};
  treemapSource.forEach((item: any) => {
    if (!groupedTreemap[item.faculty]) {
      groupedTreemap[item.faculty] = [];
    }
    groupedTreemap[item.faculty].push({
      name: item.major,
      value: item.count
    });
  });
  const treemapData = Object.keys(groupedTreemap).map(facultyName => ({
    name: facultyName,
    children: groupedTreemap[facultyName]
  }));

  // 2. Phân bố SV theo Khóa (Grouped Bar)
  const genderSource = data?.studentsByYearAndGender || adminStats.studentsByYearAndGender;
  const groupedYear: { [key: string]: { name: string; Nam: number; Nữ: number; Khác: number } } = {};
  genderSource.forEach((item: any) => {
    if (!groupedYear[item.year]) {
      groupedYear[item.year] = { name: item.year, Nam: 0, Nữ: 0, Khác: 0 };
    }
    if (item.gender === 'Nam') groupedYear[item.year].Nam = item.count;
    else if (item.gender === 'Nữ') groupedYear[item.year].Nữ = item.count;
    else groupedYear[item.year].Khác = item.count;
  });
  const groupedBarData = Object.values(groupedYear);

  // 3. Điểm danh
  const trendData = data?.attendanceTrend || adminStats.attendanceTrend;
  const distData = data?.attendanceDistribution || adminStats.attendanceDistribution;
  
  // Calculate average attendance from distribution
  const totalAtt = distData.reduce((sum: number, item: any) => sum + item.value, 0) || 1;
  const presentItem = distData.find((item: any) => item.name === 'Có mặt');
  const presentPct = presentItem ? Math.round((presentItem.value / totalAtt) * 100) : 92;

  // 4. Phân bố điểm thi
  const scoresData = data?.scoreDistribution || adminStats.scoreDistribution;
  const heatmapData = data?.examResultsByFaculty || adminStats.examResultsByFaculty;

  // Custom Heatmap Component
  const Heatmap: React.FC<{ heatmapData: ExamResultsByFaculty[] }> = ({ heatmapData }) => {
    const categories = ['kem', 'yeu', 'tb', 'kha', 'gioi'];
    const categoryLabels = ['Kém (<4)', 'Yếu (4-5)', 'TB (5-6.5)', 'Khá (6.5-8)', 'Giỏi (8+)'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', overflowX: 'auto' }}>
        {/* Heatmap Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(5, 1fr)', gap: '6px', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#94A3B8', paddingBottom: '4px', minWidth: '550px' }}>
          <div style={{ textAlign: 'left' }}>Khoa</div>
          {categoryLabels.map((lbl, idx) => <div key={idx}>{lbl}</div>)}
        </div>
        
        {/* Heatmap Rows */}
        {heatmapData.map((row, idx) => {
          const rowTotal = row.kem + row.yeu + row.tb + row.kha + row.gioi || 1;
          
          return (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px repeat(5, 1fr)', gap: '6px', alignItems: 'center', minWidth: '550px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#F8FAFC' }} title={row.faculty}>
                  {row.faculty}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#22C55E', fontWeight: 500 }}>
                  ĐTB: {row.avg !== null && row.avg !== undefined ? Number(row.avg).toFixed(1) : 'N/A'}
                </span>
              </div>
              
              {categories.map((cat) => {
                const val = (row as any)[cat] || 0;
                const pct = (val / rowTotal) * 100;
                const intensity = Math.min(Math.max(pct / 100, 0.05), 0.85); // between 5% and 85% opacity
                
                return (
                  <div
                    key={cat}
                    style={{
                      height: '36px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `rgba(34, 197, 94, ${intensity})`,
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: intensity > 0.45 ? '#020617' : '#F8FAFC',
                      transition: 'all 150ms ease',
                      cursor: 'pointer'
                    }}
                    title={`${row.faculty} - ${val} bài (${Math.round(pct)}%)`}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span>{val}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Convert settings dictionary keys to labels
  const settingsKeysMap: { [key: string]: string } = {
    academicYear: 'Năm học hiện tại',
    semester: 'Học kỳ hiện tại',
    registrationDeadline: 'Hạn đăng ký môn học',
    minimumCreditsToGraduate: 'Tín chỉ tốt nghiệp tối thiểu',
    allowEvaluationEdit: 'Mở chỉnh sửa đánh giá',
    systemMaintenanceMode: 'Chế độ bảo trì hệ thống',
    backupFrequency: 'Tần suất sao lưu',
    apiRateLimit: 'Giới hạn API Rate',
    moodleIntegration: 'Tích hợp Moodle',
    smsGateway: 'Cổng gửi SMS Gateway',
    emailNotification: 'Gửi Email thông báo'
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Top Banner (Connectivity and Title) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Hệ thống quản trị Tây Đô College</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Quản lý hệ thống, thống kê chuyên cần, kết quả thi và hoạt động người dùng</p>
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

      {/* 1 & 2. Student Distribution by Faculty/Major and Year */}
      <div className="grid-2col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Phân bố sinh viên theo Khoa/Ngành (Treemap)</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            {treemapData.length > 0 ? (
              <ResponsiveContainer>
                <Treemap
                  data={treemapData}
                  dataKey="value"
                  stroke="#1E293B"
                  fill="rgba(34, 197, 94, 0.75)"
                >
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
                    formatter={(value: any, _name: any, props: any) => {
                      const majorName = props?.payload?.name || '';
                      const facultyName = props?.payload?.root?.name || '';
                      return [
                        `${value} Sinh viên`, 
                        majorName ? (facultyName ? `${majorName} (${facultyName})` : majorName) : 'Thông tin chung'
                      ];
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                Không có dữ liệu phân bố Khoa/Ngành
              </div>
            )}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Phân bố sinh viên theo Khóa (Grouped Bar)</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={groupedBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
                <Bar dataKey="Nam" name="Nam" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Nữ" name="Nữ" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Attendance Section (Multi-line & Donut) */}
      <div className="grid-2col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Xu hướng điểm danh theo tháng (Multi-line)</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
                <Line type="monotone" dataKey="present" name="Có mặt" stroke="#22C55E" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="late" name="Đi trễ" stroke="#EAB308" strokeWidth={2} />
                <Line type="monotone" dataKey="excused" name="Vắng có phép" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="unexcused" name="Vắng không phép" stroke="#EF4444" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card" style={{ position: 'relative' }}>
          <div className="panel-header">
            <h2>Tỷ lệ điểm danh tổng hợp (Donut)</h2>
          </div>
          <div style={{ width: '100%', height: 260, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {distData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || ['#22C55E', '#EAB308', '#3B82F6', '#EF4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label for Donut */}
            <div style={{
              position: 'absolute',
              top: '43%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22C55E', display: 'block' }}>{presentPct}%</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>CÓ MẶT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Exams Section (Heatmap & Histogram) */}
      <div className="grid-2col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Kết quả thi theo Khoa (Heatmap)</h2>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {heatmapData.length > 0 ? (
              <Heatmap heatmapData={heatmapData} />
            ) : (
              <div style={{ color: '#64748B', height: '200px', display: 'flex', alignItems: 'center' }}>
                Không có dữ liệu kết quả thi theo khoa
              </div>
            )}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Phân bố điểm thi (Histogram)</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={scoresData} barCategoryGap={1}>
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

      {/* 5. Logs, Devices & Settings Overview */}
      <div className="grid-3col">
        {/* Recent Audit Logs */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color="#22C55E" />
              <h2>Hoạt động hệ thống</h2>
            </div>
            <Link to="/admin/logs" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Tất cả</span>
              <ArrowSquareOut size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '320px', flex: 1, paddingRight: '4px' }}>
            {logs.map((log) => (
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

        {/* User Devices donut */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DeviceMobile size={20} color="#22C55E" />
              <h2>Thiết bị đăng ký (Donut)</h2>
            </div>
            <Link to="/admin/devices" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Tất cả</span>
              <ArrowSquareOut size={16} />
            </Link>
          </div>
          <div style={{ width: '100%', height: 200, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {devices.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || ['#64748B', '#22C55E', '#3B82F6'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', overflowY: 'auto', maxHeight: '120px', paddingRight: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
            {mockDevices.slice(0, 3).map((dev) => (
              <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>{dev.deviceName}</span>
                <span className={`status-badge ${dev.deviceType.toLowerCase() === 'desktop' ? 'present' : dev.deviceType.toLowerCase() === 'mobile' ? 'late' : 'excused'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {dev.deviceType}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Configuration - 11 Keys */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#22C55E" />
              <h2>Cấu hình hệ thống (11 keys)</h2>
            </div>
            <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Quản lý</span>
              <ArrowSquareOut size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', overflowY: 'auto', maxHeight: '320px', flex: 1, paddingRight: '4px' }}>
            {settings ? (
              Object.entries(settings).map(([key, value]) => {
                const label = settingsKeysMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                const isBoolOrActive = value === 'true' || value === 'Enabled' || value === 'True';
                const isBoolOrInactive = value === 'false' || value === 'Disabled' || value === 'False';

                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                    <span style={{ color: '#94A3B8', fontWeight: 500 }} title={key}>{label}</span>
                    <span style={{ 
                      fontWeight: 600,
                      color: isBoolOrActive ? '#22C55E' : isBoolOrInactive ? '#EF4444' : '#F8FAFC',
                      backgroundColor: isBoolOrActive ? 'rgba(34, 197, 94, 0.08)' : isBoolOrInactive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {String(value)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                Không thể tải cấu hình
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
