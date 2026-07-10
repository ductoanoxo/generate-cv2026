import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { mockSettings } from '../../mock/mockData';
import { Sliders, ShieldCheck, Cloud, Database } from '@phosphor-icons/react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/admin/settings');
        setSettings(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch settings from API, falling back to mock data', err);
        setSettings(mockSettings);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  const settingsKeysMap: { [key: string]: string } = {
    academicYear: 'Năm học hiện tại (academicYear)',
    semester: 'Học kỳ hiện tại (semester)',
    registrationDeadline: 'Hạn đăng ký môn học (registrationDeadline)',
    minimumCreditsToGraduate: 'Tín chỉ tốt nghiệp tối thiểu (minimumCreditsToGraduate)',
    allowEvaluationEdit: 'Mở chỉnh sửa đánh giá (allowEvaluationEdit)',
    systemMaintenanceMode: 'Chế độ bảo trì hệ thống (systemMaintenanceMode)',
    backupFrequency: 'Tần suất sao lưu hệ thống (backupFrequency)',
    apiRateLimit: 'Giới hạn API Rate (apiRateLimit)',
    moodleIntegration: 'Tích hợp học tập Moodle (moodleIntegration)',
    smsGateway: 'Cổng gửi SMS Gateway (smsGateway)',
    emailNotification: 'Gửi Email thông báo (emailNotification)'
  };

  return (
    <div className="panel-card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={24} color="#22C55E" />
          <h2>Cấu hình hệ thống ({Object.keys(settings || {}).length} keys)</h2>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px' }}>
          <ShieldCheck size={24} color="#22C55E" />
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Hệ thống đang hoạt động ở chế độ <strong style={{ color: '#22C55E' }}>Đọc (Read-Only)</strong>. Bạn chỉ có thể xem các thiết lập hệ thống, không thể chỉnh sửa trực tiếp tại đây.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {Object.entries(settings || {}).map(([key, value]) => {
            const label = settingsKeysMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            const valStr = String(value);

            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 600, color: '#94A3B8', fontSize: '0.9rem' }}>{label}</span>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  backgroundColor: valStr === 'true' || valStr === 'Enabled' || valStr === 'True' ? 'rgba(34, 197, 94, 0.1)' : valStr === 'false' || valStr === 'Disabled' || valStr === 'False' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: valStr === 'true' || valStr === 'Enabled' || valStr === 'True' ? '#22C55E' : valStr === 'false' || valStr === 'Disabled' || valStr === 'False' ? '#EF4444' : 'var(--color-foreground)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)'
                }}>
                  {valStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
