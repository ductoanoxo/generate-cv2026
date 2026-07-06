import React from 'react';
import { mockAuditLogs } from '../../mock/mockData';
import { Terminal } from '@phosphor-icons/react';

export const AuditLogsPage: React.FC = () => {
  return (
    <div className="panel-card fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={24} color="#22C55E" />
          <h2>Nhật ký hoạt động hệ thống (Read-Only)</h2>
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
            {mockAuditLogs.map((log) => (
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
