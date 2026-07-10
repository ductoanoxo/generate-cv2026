import React, { useState, useEffect } from 'react';
import { facultyStats, mockAttendanceLogs } from '../../mock/mockData';
import { ClipboardText, Cloud, Database } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface AttendanceLog {
  id: string;
  studentName: string;
  subjectName: string;
  date: string;
  status: number;
}

interface ClassAttendanceRate {
  name: string;
  present: number;
  late: number;
  absence: number;
}

export const AttendanceStatsPage: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [rates, setRates] = useState<ClassAttendanceRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const facultyId = '4d82e2b2-ff50-4df3-a7c3-08618fb26f32';
        
        const [recentRes, ratesRes] = await Promise.all([
          axios.get<AttendanceLog[]>('http://localhost:5000/api/attendance/recent'),
          axios.get<any>(`http://localhost:5000/api/faculty/dashboard?facultyId=${facultyId}`)
        ]);

        setLogs(recentRes.data);
        setRates(ratesRes.data.classAttendanceRates || []);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Attendance statistics query failed, using offline fallback', err);
        setLogs(mockAttendanceLogs.map(l => ({
          id: l.id,
          studentName: l.studentName,
          subjectName: l.subjectName,
          date: l.date,
          status: l.status
        })));
        setRates(facultyStats.classAttendanceRates);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, []);

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Có mặt';
      case 2: return 'Trễ';
      case 3: return 'Vắng CP';
      case 4: return 'Vắng KP';
      default: return 'Không xác định';
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1: return 'present';
      case 2: return 'late';
      case 3: return 'excused';
      case 4: return 'unexcused';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải số liệu chuyên cần...</p>
      </div>
    );
  }

  return (
    <div className="grid-2col fade-in">
      {/* Recent Attendance Logs */}
      <div className="panel-card">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardText size={24} color="#22C55E" />
            <h2>Nhật ký điểm danh gần đây ({logs.length} bản ghi)</h2>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: isMock ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            color: isMock ? '#EAB308' : '#22C55E',
            fontSize: '0.7rem',
            fontWeight: 600
          }}>
            {isMock ? <Cloud size={14} /> : <Database size={14} />}
            <span>{isMock ? 'CSDL Offline' : 'Live DB'}</span>
          </div>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh Viên</th>
                <th>Môn Học</th>
                <th>Ngày</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.studentName}</td>
                  <td>{log.subjectName}</td>
                  <td>{log.date}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(log.status)}`}>
                      {getStatusText(log.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Rates by Class Section */}
      <div className="panel-card">
        <div className="panel-header">
          <h2>Tỷ lệ chuyên cần các Lớp học phần</h2>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          {rates.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={rates}>
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
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              Không có dữ liệu biểu đồ
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
