import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { mockDevices, adminStats } from '../../mock/mockData';
import { DeviceMobile, Laptop, DeviceTablet, Cloud, Database } from '@phosphor-icons/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface UserDeviceItem {
  id: string;
  userName: string;
  deviceName: string;
  deviceOS: string;
  browserName: string;
  lastIpAddress: string;
  lastLoginTime: string;
  isBlocked: boolean;
}

export const DevicesPage: React.FC = () => {
  const [deviceDistribution, setDeviceDistribution] = useState<any[]>([]);
  const [devicesList, setDevicesList] = useState<UserDeviceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchDevicesData = async () => {
      try {
        setLoading(true);
        const [distRes, listRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/devices'),
          axios.get<UserDeviceItem[]>('http://localhost:5000/api/admin/devices/list')
        ]);
        
        setDeviceDistribution(distRes.data.devicesDistribution || distRes.data);
        setDevicesList(listRes.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch devices from API, falling back to mock data', err);
        setDeviceDistribution(adminStats.devicesDistribution);
        setDevicesList(mockDevices.map(d => ({
          id: d.id,
          userName: "Người dùng hệ thống",
          deviceName: d.deviceName,
          deviceOS: d.deviceType === 'Desktop' ? 'Windows 11' : (d.deviceType === 'Mobile' ? 'Android/iOS' : 'iPadOS'),
          browserName: 'Chrome/Safari',
          lastIpAddress: '172.18.0.' + d.id,
          lastLoginTime: new Date(d.lastActive).toLocaleString('vi-VN'),
          isBlocked: false
        })));
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDevicesData();
  }, []);

  const getDeviceIcon = (deviceName: string) => {
    const nameLower = deviceName.toLowerCase();
    if (nameLower.includes('phone') || nameLower.includes('di động') || nameLower.includes('mobile')) {
      return <DeviceMobile size={20} color="#22C55E" />;
    }
    if (nameLower.includes('bảng') || nameLower.includes('tablet') || nameLower.includes('ipad')) {
      return <DeviceTablet size={20} color="#3B82F6" />;
    }
    return <Laptop size={20} color="#64748B" />;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải dữ liệu thiết bị đăng ký...</p>
      </div>
    );
  }

  return (
    <div className="grid-2col fade-in">
      {/* Device List Table */}
      <div className="panel-card">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Thiết bị đăng ký truy cập ({devicesList.length})</h2>
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
        <div className="data-table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Thiết Bị</th>
                <th>Người Sử Dụng</th>
                <th>Hệ điều hành / Trình duyệt</th>
                <th>IP / Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {devicesList.map((dev) => (
                <tr key={dev.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getDeviceIcon(dev.deviceName)}
                    <span style={{ fontWeight: 600 }}>{dev.deviceName}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{dev.userName}</td>
                  <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {dev.deviceOS} • <span style={{ color: '#22C55E' }}>{dev.browserName}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    <div>IP: {dev.lastIpAddress}</div>
                    <div>{dev.lastLoginTime}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="panel-header" style={{ width: '100%' }}>
          <h2>Phân bố loại thiết bị (Donut)</h2>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={deviceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {deviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || ['#64748B', '#22C55E', '#3B82F6'][index % 3]} />
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
