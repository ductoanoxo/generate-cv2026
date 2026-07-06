import React from 'react';
import { facultyStats, mockAttendanceLogs } from '../../mock/mockData';
import { ClipboardText } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AttendanceStatsPage: React.FC = () => {
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

  return (
    <div className="grid-2col fade-in">
      <div className="panel-card">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardText size={24} color="#22C55E" />
            <h2>Nhật ký điểm danh gần đây</h2>
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
              {mockAttendanceLogs.map((log) => (
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

      <div className="panel-card">
        <div className="panel-header">
          <h2>Tỷ lệ chuyên cần các Lớp học phần</h2>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={facultyStats.classAttendanceRates}>
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
        </div>
      </div>
    </div>
  );
};
