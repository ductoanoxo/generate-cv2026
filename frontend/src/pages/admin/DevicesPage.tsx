import React from 'react';
import { mockDevices, adminStats } from '../../mock/mockData';
import { DeviceMobile, Laptop, DeviceTablet } from '@phosphor-icons/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const DevicesPage: React.FC = () => {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Desktop': return <Laptop size={20} color="#22C55E" />;
      case 'Mobile': return <DeviceMobile size={20} color="#EAB308" />;
      case 'Tablet': return <DeviceTablet size={20} color="#3B82F6" />;
      default: return <DeviceMobile size={20} />;
    }
  };

  return (
    <div className="grid-2col fade-in">
      <div className="panel-card">
        <div className="panel-header">
          <h2>Danh sách thiết bị đã đăng ký</h2>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Tên Thiết Bị</th>
                <th>Loại</th>
                <th>Lần hoạt động cuối</th>
              </tr>
            </thead>
            <tbody>
              {mockDevices.map((dev) => (
                <tr key={dev.id}>
                  <td>{getDeviceIcon(dev.deviceType)}</td>
                  <td style={{ fontWeight: 600 }}>{dev.deviceName}</td>
                  <td>
                    <span className={`status-badge ${dev.deviceType.toLowerCase() === 'desktop' ? 'present' : dev.deviceType.toLowerCase() === 'mobile' ? 'late' : 'excused'}`}>
                      {dev.deviceType}
                    </span>
                  </td>
                  <td>{new Date(dev.lastActive).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="panel-header" style={{ width: '100%' }}>
          <h2>Phân bố loại thiết bị</h2>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={adminStats.devicesDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {adminStats.devicesDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
              <Legend formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
