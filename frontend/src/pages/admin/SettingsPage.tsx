import React from 'react';
import { mockSettings } from '../../mock/mockData';
import { Sliders, ShieldCheck } from '@phosphor-icons/react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="panel-card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={24} color="#22C55E" />
          <h2>Cấu hình hệ thống (Read-Only)</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px' }}>
          <ShieldCheck size={24} color="#22C55E" />
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Hệ thống đang hoạt động ở chế độ <strong style={{ color: '#22C55E' }}>Đọc (Read-Only)</strong>. Bạn chỉ có thể xem các thiết lập hệ thống, không thể chỉnh sửa chúng trực tiếp trên dashboard này.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {Object.entries(mockSettings).map(([key, value]) => {
            // Convert camelCase to space separated capitalized words
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 600, color: '#94A3B8' }}>{label}</span>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  backgroundColor: value === 'true' || value === 'Enabled' ? 'rgba(34, 197, 94, 0.1)' : value === 'false' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: value === 'true' || value === 'Enabled' ? '#22C55E' : value === 'false' ? '#EF4444' : 'var(--color-foreground)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)'
                }}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
