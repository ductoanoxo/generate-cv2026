import React, { useState } from 'react';
import { 
  CheckCircle, 
  Sparkle, 
  Eye, 
  Funnel, 
  MagnifyingGlass, 
  TrendUp,
  Trophy,
  BookOpen,
  Cloud
} from '@phosphor-icons/react';

export interface ComponentScore {
  componentName: string;
  score: number | null;
  weight: number;
}

export interface MatchedCourse {
  subjectCode: string;
  subjectName: string;
  creditPoint: number;
  combinedResult: number | null;
  gradeC: string;
  grade4: number;
  matchPercentage: number;
  matchedKeywords: string[];
  relevanceReason: string;
  semesterName?: string;
  components?: ComponentScore[];
  isSelected?: boolean;
}

interface MatchedCoursesTableProps {
  courses: MatchedCourse[];
  isLoading?: boolean;
  jdText?: string;
  studentName?: string;
  studentCode?: string;
  onToggleSelectCourse?: (subjectCode: string) => void;
}

export const MatchedCoursesTable: React.FC<MatchedCoursesTableProps> = ({
  courses,
  isLoading = false,
  jdText: _jdText = '',
  studentName = 'Đặng Đức Toàn',
  studentCode = 'SV26001',
  onToggleSelectCourse: _onToggleSelectCourse
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMatchLevel, setFilterMatchLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'score' | 'name'>('match');
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<MatchedCourse | null>(null);

  if (isLoading) {
    return (
      <div className="panel-card fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div 
            className="spinner" 
            style={{ 
              width: '44px', 
              height: '44px', 
              border: '3px solid rgba(34, 197, 94, 0.2)', 
              borderTop: '3px solid #22C55E', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} 
          />
          <span style={{ color: '#22C55E', fontWeight: 600, fontSize: '1rem' }}>
            Đang đối soát dữ liệu môn học từ Cơ sở dữ liệu Supabase & API .NET 8...
          </span>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="panel-card fade-in" style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
        <BookOpen size={40} color="#64748B" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.1rem', color: '#E2E8F0', marginBottom: '6px' }}>Chưa có môn học nào được khớp</h3>
        <p style={{ fontSize: '0.85rem' }}>
          Vui lòng nhập mô tả JD ở Bước 1 và nhấn nút "Phân Tích JD & Khớp Môn Học" để tra cứu bảng điểm thực tế.
        </p>
      </div>
    );
  }

  // Filter logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.matchedKeywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMatchLevel === 'high') return course.matchPercentage >= 75;
    if (filterMatchLevel === 'medium') return course.matchPercentage >= 50 && course.matchPercentage < 75;
    if (filterMatchLevel === 'goodGrades') return (course.combinedResult ?? 0) >= 8.0;

    return true;
  });

  // Sort logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'match') return b.matchPercentage - a.matchPercentage;
    if (sortBy === 'score') return (b.combinedResult ?? 0) - (a.combinedResult ?? 0);
    return a.subjectName.localeCompare(b.subjectName);
  });

  // KPI Statistics
  const totalMatchedCount = courses.length;
  const highMatchCount = courses.filter(c => c.matchPercentage >= 75).length;
  const avgMatchPct = Math.round(courses.reduce((acc, c) => acc + c.matchPercentage, 0) / totalMatchedCount);
  
  const gradedCourses = courses.filter(c => c.combinedResult !== null);
  const avgScore = gradedCourses.length > 0 
    ? (gradedCourses.reduce((acc, c) => acc + (c.combinedResult ?? 0), 0) / gradedCourses.length).toFixed(2)
    : 'N/A';

  const getScoreColor = (score: number | null) => {
    if (score === null) return '#94A3B8';
    if (score >= 8.5) return '#22C55E';
    if (score >= 7.0) return '#3B82F6';
    if (score >= 5.5) return '#EAB308';
    return '#EF4444';
  };

  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 85) return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '#22C55E' };
    if (pct >= 70) return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: '#3B82F6' };
    if (pct >= 50) return { bg: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', border: '#EAB308' };
    return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', border: '#94A3B8' };
  };

  return (
    <div className="panel-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#F8FAFC' }}>
            <CheckCircle size={24} color="#22C55E" weight="fill" />
            <span>Bước 2: Bảng Môn Học Khớp Kèm Điểm Số Thực Tế</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
            Truy vấn trực tiếp từ API .NET / Supabase cho sinh viên: <strong style={{ color: '#22C55E' }}>{studentName} ({studentCode})</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <Cloud size={16} />
          <span>Dữ liệu thực từ Supabase (.NET Score Query)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkle size={22} color="#22C55E" weight="fill" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Tỉ lệ phù hợp JD</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22C55E' }}>{avgMatchPct}%</div>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} color="#3B82F6" weight="fill" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Môn học liên quan JD</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3B82F6' }}>{totalMatchedCount} môn</div>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={22} color="#EAB308" weight="fill" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>GPA môn liên quan</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#EAB308' }}>{avgScore} / 10</div>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendUp size={22} color="#A855F7" weight="fill" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Môn học khớp cao (≥75%)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#A855F7' }}>{highMatchCount} môn</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filter, Sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0F172A', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px 12px', flex: '1', minWidth: '220px' }}>
          <MagnifyingGlass size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Tìm theo tên môn, mã môn, từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#F1F5F9', outline: 'none', fontSize: '0.88rem', width: '100%' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Funnel size={16} color="#94A3B8" />
            <select
              value={filterMatchLevel}
              onChange={(e) => setFilterMatchLevel(e.target.value)}
              style={{ background: '#0F172A', border: '1px solid var(--color-border)', color: '#F1F5F9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Tất cả độ khớp</option>
              <option value="high">Khớp rất cao (≥75%)</option>
              <option value="medium">Khớp vừa (50-74%)</option>
              <option value="goodGrades">Điểm môn cao (≥8.0)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ background: '#0F172A', border: '1px solid var(--color-border)', color: '#F1F5F9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="match">Độ khớp JD giảm dần</option>
              <option value="score">Điểm số thực giảm dần</option>
              <option value="name">Tên môn A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Matched Courses Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th style={{ width: '100px' }}>Mã môn</th>
              <th>Tên môn học</th>
              <th style={{ textAlign: 'center', width: '70px' }}>Tín chỉ</th>
              <th style={{ textAlign: 'center', width: '110px' }}>Điểm TK (10)</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Điểm Chữ</th>
              <th style={{ textAlign: 'center', width: '140px' }}>Tỉ lệ khớp JD</th>
              <th>Từ khóa / Kỹ năng khớp</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {sortedCourses.map((course, idx) => {
              const matchBadge = getMatchBadgeStyle(course.matchPercentage);
              const scoreColor = getScoreColor(course.combinedResult);

              return (
                <tr key={course.subjectCode + idx} style={{ transition: 'background-color 0.2s' }}>
                  <td style={{ textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    {idx + 1}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3B82F6', fontSize: '0.88rem' }}>
                    {course.subjectCode}
                  </td>
                  <td style={{ fontWeight: 600, color: '#F8FAFC' }}>
                    <div>{course.subjectName}</div>
                    {course.relevanceReason && (
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400, marginTop: '2px' }}>
                        {course.relevanceReason}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', color: '#CBD5E1' }}>
                    {course.creditPoint}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span 
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${scoreColor}`,
                        color: scoreColor,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}
                    >
                      {course.combinedResult !== null ? course.combinedResult.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: scoreColor }}>
                    {course.gradeC || 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: matchBadge.bg,
                          color: matchBadge.color,
                          border: `1px solid ${matchBadge.border}`,
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        <Sparkle size={12} weight="fill" />
                        {course.matchPercentage}%
                      </span>
                      {/* Match progress bar */}
                      <div style={{ width: '100px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${course.matchPercentage}%`, 
                            height: '100%', 
                            background: matchBadge.color,
                            borderRadius: '3px',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {course.matchedKeywords.map((kw, kIdx) => (
                        <span 
                          key={kIdx} 
                          style={{ 
                            fontSize: '0.72rem', 
                            background: 'rgba(34, 197, 94, 0.1)', 
                            color: '#22C55E', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            border: '1px solid rgba(34, 197, 94, 0.2)'
                          }}
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedCourseDetail(course)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'transform 0.2s'
                      }}
                      title="Xem chi tiết điểm thành phần"
                    >
                      <Eye size={20} weight="bold" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Component Details Modal */}
      {selectedCourseDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedCourseDetail(null)}
        >
          <div
            style={{
              background: '#1E293B',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                Chi Tiết Điểm Môn Học Matched
              </h3>
              <button
                onClick={() => setSelectedCourseDetail(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3B82F6' }}>
                {selectedCourseDetail.subjectName} ({selectedCourseDetail.subjectCode})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '4px' }}>
                Số tín chỉ: <strong style={{ color: '#F1F5F9' }}>{selectedCourseDetail.creditPoint}</strong> | Tỉ lệ khớp JD: <strong style={{ color: '#22C55E' }}>{selectedCourseDetail.matchPercentage}%</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22C55E', marginBottom: '6px' }}>
                Từ khóa & kỹ năng JD khớp với môn học:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCourseDetail.matchedKeywords.map((kw, i) => (
                  <span key={i} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8' }}>Thành phần điểm</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8' }}>Trọng số</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8' }}>Điểm số</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourseDetail.components && selectedCourseDetail.components.length > 0 ? (
                    selectedCourseDetail.components.map((comp, cIdx) => (
                      <tr key={cIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 12px', color: '#E2E8F0' }}>{comp.componentName}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8' }}>{(comp.weight * 100).toFixed(0)}%</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#F1F5F9', fontFamily: 'monospace' }}>
                          {comp.score !== null ? comp.score.toFixed(1) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#94A3B8' }}>
                        Điểm tổng kết đã cập nhật trực tiếp từ hệ thống Supabase DB.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <span style={{ fontSize: '0.9rem', color: '#F1F5F9', fontWeight: 600 }}>Điểm tổng kết (TK):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22C55E', fontFamily: 'monospace' }}>
                {selectedCourseDetail.combinedResult !== null ? selectedCourseDetail.combinedResult.toFixed(1) : 'N/A'} (Hệ C: {selectedCourseDetail.gradeC})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedCourseDetail(null)}
                style={{ background: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
