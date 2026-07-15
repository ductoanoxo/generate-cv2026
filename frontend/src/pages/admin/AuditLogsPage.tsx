import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { mockAuditLogs } from '../../mock/mockData';
import { Terminal, Cloud, Database } from '@phosphor-icons/react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/admin/audit-logs?limit=50');
        setLogs(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch audit logs from API, falling back to mock data', err);
        setLogs(mockAuditLogs);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải nhật ký hoạt động...</p>
      </div>
    );
  }

  return (
    <div className="panel-card fade-in">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={24} color="#22C55E" />
          <h2>Nhật ký hoạt động hệ thống ({logs.length} dòng)</h2>
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
          <span>{isMock ? 'API không khả dụng' : 'Dữ liệu Live (Supabase DB)'}</span>
        </div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Địa chỉ IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: '#64748B' }}>{log.id}</td>
                <td>{new Date(log.creationDate).toLocaleString('vi-VN')}</td>
                <td style={{ fontWeight: 600, color: '#22C55E' }}>{log.username}</td>
                <td>{log.action}</td>
                <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
