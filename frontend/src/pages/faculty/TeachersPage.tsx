import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { facultyStats } from '../../mock/mockData';
import { Users, Cloud, Database } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

interface FacultyTeacher {
  name: string;
  title: string;
  email: string;
  isHead: boolean;
}

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<FacultyTeacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const facultyId = user?.facultyId;
        if (!facultyId) throw new Error('Tài khoản chưa được gán khoa');
        const response = await axios.get<FacultyTeacher[]>(`http://localhost:5000/api/faculty/teachers?facultyId=${facultyId}`);
        setTeachers(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch teachers, falling back to mock data', err);
        setTeachers(facultyStats.teachers);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải danh sách giảng viên...</p>
      </div>
    );
  }

  return (
    <div className="panel-card fade-in">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} color="#22C55E" />
          <h2>Danh sách Giảng viên trong Khoa ({teachers.length} thành viên)</h2>
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
              <th>Giáo Viên</th>
              <th>Chức danh</th>
              <th>Email</th>
              <th>Trưởng khoa</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, index) => (
              <tr key={index}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacher.name)}`} 
                    alt="avatar" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-border)' }} 
                  />
                  <span style={{ fontWeight: 600 }}>{teacher.name}</span>
                </td>
                <td>{teacher.title}</td>
                <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>{teacher.email}</td>
                <td>
                  {teacher.isHead ? (
                    <span className="status-badge present" style={{ fontSize: '0.7rem' }}>Trưởng khoa</span>
                  ) : (
                    <span className="status-badge late" style={{ fontSize: '0.7rem', color: '#64748B', backgroundColor: 'transparent', borderColor: 'transparent' }}>Thành viên</span>
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
