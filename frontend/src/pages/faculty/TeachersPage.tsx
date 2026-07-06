import React from 'react';
import { facultyStats } from '../../mock/mockData';
import { Users } from '@phosphor-icons/react';

export const TeachersPage: React.FC = () => {
  return (
    <div className="panel-card fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} color="#22C55E" />
          <h2>Danh sách Giảng viên trong Khoa</h2>
        </div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Họ và Tên</th>
              <th>Chức danh</th>
              <th>Email</th>
              <th>Trưởng khoa</th>
            </tr>
          </thead>
          <tbody>
            {facultyStats.teachers.map((teacher, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 600 }}>{teacher.name}</td>
                <td>{teacher.title}</td>
                <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>{teacher.email}</td>
                <td>
                  {teacher.isHead ? (
                    <span className="status-badge present" style={{ fontSize: '0.7rem' }}>Trưởng khoa</span>
                  ) : (
                    <span className="status-badge late" style={{ fontSize: '0.7rem', color: '#94A3B8', backgroundColor: 'transparent', borderColor: 'transparent' }}>Thành viên</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
