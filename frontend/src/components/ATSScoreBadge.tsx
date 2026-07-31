import React from 'react';

interface ATSScoreBadgeProps {
  score: number;
  compact?: boolean;
}

export const ATSScoreBadge: React.FC<ATSScoreBadgeProps> = ({ score, compact = false }) => {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#EAB308' : '#EF4444';
  const label = score >= 80 ? 'Tốt' : score >= 60 ? 'Cần cải thiện' : 'Thấp';
  return (
    <div aria-label={`Điểm ATS ${score} trên 100`} style={{ display: 'flex', alignItems: 'center', gap: compact ? '8px' : '12px' }}>
      <div style={{ width: compact ? 42 : 58, height: compact ? 42 : 58, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `4px solid ${color}`, color, fontWeight: 800, fontSize: compact ? '0.85rem' : '1.1rem' }}>{score}</div>
      {!compact && <div><div style={{ fontWeight: 700, color: '#F8FAFC' }}>ATS Score</div><div style={{ fontSize: '0.78rem', color }}>{label}</div></div>}
    </div>
  );
};
