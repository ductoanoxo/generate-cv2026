import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { ChartLineUp, Info } from '@phosphor-icons/react';

interface GradeItem {
  subjectName: string;
  score: number;
  credits: number;
}

interface SkillRadarChartProps {
  grades: GradeItem[];
  selectedGrades: string[];
}

const SKILL_GROUPS: { category: string; keywords: string[] }[] = [
  { category: 'Lập trình Web', keywords: ['lập trình web', 'web nâng cao', 'giao diện', 'frontend', 'html', 'css'] },
  { category: 'Lập trình C / C#', keywords: ['lập trình c', 'c#', '.net', 'kỹ thuật lập trình', 'c++'] },
  { category: 'Cơ sở dữ liệu', keywords: ['cơ sở dữ liệu', 'sql', 'database', 'dữ liệu'] },
  { category: 'Phân tích & Thiết kế', keywords: ['phân tích', 'thiết kế hệ thống', 'kỹ thuật phần mềm', 'phần mềm'] },
  { category: 'Mạng & Nền tảng IT', keywords: ['mạng', 'bảo mật', 'an toàn thông tin', 'nhập môn cntt', 'hệ điều hành'] },
];

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  grades,
  selectedGrades
}) => {
  // Compute average score per skill category dynamically based on active selectedGrades
  const activeGrades = grades.filter(g => selectedGrades.includes(g.subjectName));

  const chartData = SKILL_GROUPS.map(group => {
    const matchingSubjects = activeGrades.filter(g => {
      const nameLower = g.subjectName.toLowerCase();
      return group.keywords.some(kw => nameLower.includes(kw));
    });

    let avgScore = 0;
    if (matchingSubjects.length > 0) {
      const sum = matchingSubjects.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 8.0), 0);
      avgScore = sum / matchingSubjects.length;
    } else {
      // If no explicit matching subject selected, calculate baseline fallback from all active grades or default 6.5
      const fallbackSum = activeGrades.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 7.0), 0);
      avgScore = activeGrades.length > 0 ? (fallbackSum / activeGrades.length) * 0.85 : 7.0;
    }

    // Convert score (0 - 10) to percentage scale (0 - 100) for radar visualization
    const scorePct = Math.min(100, Math.max(20, Math.round((avgScore / 10) * 100)));

    return {
      subject: group.category,
      score: scorePct,
      rawScore: avgScore.toFixed(1),
      fullMark: 100
    };
  });

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ChartLineUp size={18} />
        <span>7. Biểu đồ Radar Năng lực Chuyên môn</span>
      </h3>
      <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '12px' }}>
        Tự động tính toán & trực quan hóa nhóm kỹ năng dựa trên kết quả môn học đã được chọn:
      </p>

      <div style={{ 
        background: 'rgba(15, 23, 42, 0.6)', 
        border: '1px solid var(--color-border)', 
        borderRadius: '10px', 
        padding: '16px 12px 8px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="rgba(51, 65, 85, 0.6)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#F8FAFC', fontSize: 11, fontWeight: 500 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#64748B', fontSize: 9 }} 
              />
              <Radar
                name="Năng lực học thuật"
                dataKey="score"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', fontStyle: 'italic' }}>
          <Info size={14} color="#22C55E" />
          <span>Biểu đồ tự động cập nhật khi tích/bỏ tích chọn môn học ở Bước 1.</span>
        </div>
      </div>
    </div>
  );
};
