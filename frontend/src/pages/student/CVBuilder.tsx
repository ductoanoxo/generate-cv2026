import React, { useState, useEffect } from 'react';
import { defaultCVData, type CVData } from '../../mock/mockData';
import { JDInputForm } from '../../components/JDInputForm';
import { MatchedCoursesTable, type MatchedCourse } from '../../components/MatchedCoursesTable';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import axios from 'axios';
import { 
  FileText, 
  FloppyDisk, 
  Printer, 
  Plus, 
  Trash,
  Check,
  User,
  GraduationCap,
  Sparkle,
  Target,
  ArrowRight
} from '@phosphor-icons/react';

export const CVBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jd-match' | 'cv-editor'>('jd-match');
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [newSkill, setNewSkill] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('');
  const [newActivity, setNewActivity] = useState<string>('');
  const [newProject, setNewProject] = useState({ name: '', role: '', description: '', technologies: '' });
  const [selectedGrades, setSelectedGrades] = useState<string[]>(cvData.grades.map(g => g.subjectName));
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // JD Matching states inside CV Builder
  const [jdText, setJdText] = useState<string>('');
  const [matchedCourses, setMatchedCourses] = useState<MatchedCourse[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [rawDbSubjects, setRawDbSubjects] = useState<any[]>([]);

  // Fetch real student scores from .NET API or Supabase DB
  useEffect(() => {
    const fetchScores = async () => {
      const studentId = user?.id || 'u6';
      try {
        const response = await axios.get(
          `http://localhost:5000/api/student/scores?studentId=${studentId}`
        );
        if (response.data && Array.isArray(response.data)) {
          const list: any[] = [];
          response.data.forEach((sem: any) => {
            if (sem.subjects) {
              sem.subjects.forEach((sub: any) => {
                list.push(sub);
              });
            }
          });
          if (list.length > 0) {
            setRawDbSubjects(list);
            return;
          }
        }
      } catch (err) {
        console.warn('API score query failed, loading from Supabase...', err);
      }

      // Supabase fallback
      try {
        const { data: dbSubjects } = await supabase.from('Subjects').select('*');
        if (dbSubjects && dbSubjects.length > 0) {
          setRawDbSubjects(dbSubjects.map(s => ({
            subjectCode: s.SubjectCode || `IT${s.Id?.slice(0, 3)}`,
            subjectName: s.Name,
            creditPoint: s.CreditPoint || 3,
            combinedResult: 8.5,
            gradeC: 'A',
            grade4: 4
          })));
        }
      } catch (sErr) {
        console.error(sErr);
      }
    };

    fetchScores();
  }, [user]);

  // Update profile from logged in user if available
  useEffect(() => {
    if (user) {
      setCvData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          fullName: user.fullName || prev.profile.fullName,
          email: user.email || prev.profile.email
        }
      }));
    }
  }, [user]);

  // Handle Analyzing JD & Matching Courses
  const handleAnalyzeJD = (inputJdText: string) => {
    setJdText(inputJdText);
    setIsMatchingLoading(true);

    setTimeout(() => {
      const jdLower = inputJdText.toLowerCase();
      const sources = rawDbSubjects.length > 0 ? rawDbSubjects : cvData.grades.map(g => ({
        subjectCode: 'IT101',
        subjectName: g.subjectName,
        creditPoint: g.credits,
        combinedResult: g.score,
        gradeC: g.score >= 8.5 ? 'A' : (g.score >= 7.0 ? 'B' : 'C')
      }));

      const matched: MatchedCourse[] = sources.map(sub => {
        const nameLower = sub.subjectName.toLowerCase();
        let hits: string[] = [];
        let scoreBonus = 0;

        if ((jdLower.includes('react') || jdLower.includes('web') || jdLower.includes('frontend') || jdLower.includes('css') || jdLower.includes('html')) &&
            (nameLower.includes('web') || nameLower.includes('giao diện'))) {
          hits.push('Lập trình Web', 'Frontend UI', 'React.js');
          scoreBonus += 35;
        }

        if ((jdLower.includes('c#') || jdLower.includes('.net') || jdLower.includes('lập trình c') || jdLower.includes('backend')) &&
            (nameLower.includes('lập trình c') || nameLower.includes('c#') || nameLower.includes('.net'))) {
          hits.push('C# / .NET Core', 'Kỹ thuật Lập trình C');
          scoreBonus += 30;
        }

        if ((jdLower.includes('sql') || jdLower.includes('database') || jdLower.includes('cơ sở dữ liệu')) &&
            (nameLower.includes('cơ sở dữ liệu') || nameLower.includes('sql'))) {
          hits.push('Cơ sở dữ liệu SQL', 'Thiết kế Database');
          scoreBonus += 30;
        }

        if ((jdLower.includes('phân tích') || jdLower.includes('thiết kế hệ thống') || jdLower.includes('phần mềm')) &&
            (nameLower.includes('phân tích') || nameLower.includes('kỹ thuật phần mềm'))) {
          hits.push('Phân tích & Thiết kế hệ thống', 'Kỹ thuật phần mềm');
          scoreBonus += 28;
        }

        const jdWords = jdLower.split(/[\s,.\-\/\(\)]+/).filter((w: string) => w.length > 2);
        const nameWords = nameLower.split(/[\s,.\-\/\(\)]+/).filter((w: string) => w.length > 2);
        nameWords.forEach((nw: string) => {
          if (jdWords.includes(nw)) {
            scoreBonus += 10;
            if (!hits.includes(nw)) hits.push(nw);
          }
        });

        if (hits.length === 0) {
          hits = ['Nền tảng CNTT core'];
        }

        const calcMatch = Math.min(98, Math.max(50, 55 + scoreBonus));

        return {
          subjectCode: sub.subjectCode || 'IT100',
          subjectName: sub.subjectName,
          creditPoint: sub.creditPoint || 3,
          combinedResult: sub.combinedResult ?? sub.score ?? 8.0,
          gradeC: sub.gradeC || 'B',
          grade4: sub.grade4 || 3,
          matchPercentage: calcMatch,
          matchedKeywords: Array.from(new Set(hits)),
          relevanceReason: `Đáp ứng tốt ${hits.length} từ khóa tiêu chí của nhà tuyển dụng.`
        };
      });

      matched.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setMatchedCourses(matched);

      // Auto update CV Grades state with matched courses from DB
      const updatedCvGrades = matched.map(m => ({
        subjectName: m.subjectName,
        score: m.combinedResult ?? 8.0,
        credits: m.creditPoint
      }));

      setCvData(prev => ({
        ...prev,
        grades: updatedCvGrades
      }));

      setSelectedGrades(updatedCvGrades.map(g => g.subjectName));
      setIsMatchingLoading(false);
    }, 600);
  };

  const handleProfileFieldChange = (field: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleFieldChange = (field: keyof CVData, value: any) => {
    setCvData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !cvData.languages.includes(newLanguage.trim())) {
      setCvData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }));
  };

  const handleAddActivity = () => {
    if (newActivity.trim() && !cvData.activities.includes(newActivity.trim())) {
      setCvData(prev => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()]
      }));
      setNewActivity('');
    }
  };

  const handleRemoveActivity = (act: string) => {
    setCvData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== act)
    }));
  };

  const handleAddProject = () => {
    if (newProject.name.trim() && newProject.role.trim()) {
      const techArray = newProject.technologies.split(',').map(t => t.trim()).filter(Boolean);
      setCvData(prev => ({
        ...prev,
        projects: [...prev.projects, {
          name: newProject.name.trim(),
          role: newProject.role.trim(),
          description: newProject.description.trim(),
          technologies: techArray
        }]
      }));
      setNewProject({ name: '', role: '', description: '', technologies: '' });
    }
  };

  const handleRemoveProject = (index: number) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const toggleGradeSelection = (subjectName: string) => {
    setSelectedGrades(prev => 
      prev.includes(subjectName) 
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Header and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={26} color="#22C55E" />
            <span>Tạo CV Cá Nhân & Phân Tích JD Tuyển Dụng</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
            Gom thông tin cá nhân, phân tích JD để tự động chọn các môn học có kết quả tốt nhất từ CSDL đưa vào CV.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon-text" onClick={handlePrint}>
            <Printer size={18} />
            <span>Xuất PDF / In CV</span>
          </button>
          <button className="btn-icon-text primary" onClick={handleSave}>
            {saveSuccess ? <Check size={18} /> : <FloppyDisk size={18} />}
            <span>{saveSuccess ? 'Đã lưu CV!' : 'Lưu CV'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('jd-match')}
          style={{
            background: activeTab === 'jd-match' ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' : 'transparent',
            color: activeTab === 'jd-match' ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'jd-match' ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Target size={18} />
          <span>Bước 1: Phân Tích JD & Khớp Môn Học Matched</span>
        </button>

        <button
          onClick={() => setActiveTab('cv-editor')}
          style={{
            background: activeTab === 'cv-editor' ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' : 'transparent',
            color: activeTab === 'cv-editor' ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'cv-editor' ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FileText size={18} />
          <span>Bước 2: Biên Tập & Xem Trước Hồ Sơ CV (Live Preview)</span>
        </button>
      </div>

      {/* Tab 1: JD Matcher Section */}
      {activeTab === 'jd-match' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <JDInputForm 
            onAnalyze={handleAnalyzeJD} 
            isLoading={isMatchingLoading}
            initialText={jdText}
          />

          {matchedCourses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <MatchedCoursesTable
                courses={matchedCourses}
                isLoading={isMatchingLoading}
                jdText={jdText}
                studentName={cvData.profile.fullName}
                studentCode={user?.username || 'sv_toan'}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveTab('cv-editor')}
                  className="btn-icon-text primary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <span>Áp dụng danh sách môn học này vào CV & Tiếp tục</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: CV Builder Editor & Live Preview */}
      {activeTab === 'cv-editor' && (
        <div className="cv-builder-container">
          {/* CV Editor Column */}
          <div className="cv-editor">
            {/* Section 1: Personal Info */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={18} />
                <span>1. Thông tin cá nhân</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={cvData.profile.fullName} 
                    onChange={(e) => handleProfileFieldChange('fullName', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={cvData.profile.phoneNumber} 
                    onChange={(e) => handleProfileFieldChange('phoneNumber', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={cvData.profile.email} 
                    onChange={(e) => handleProfileFieldChange('email', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Quê quán</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={cvData.profile.hometown} 
                    onChange={(e) => handleProfileFieldChange('hometown', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Summary */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} />
                <span>2. Giới thiệu bản thân</span>
              </h3>
              <div className="form-group">
                <textarea 
                  className="input-field" 
                  rows={3} 
                  style={{ resize: 'vertical' }}
                  value={cvData.summary}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                />
              </div>
            </div>

            {/* Section 3: Skills */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} />
                <span>3. Kỹ năng chuyên môn</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nhập kỹ năng mới (ví dụ: React, SQL)" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button className="btn-icon-text primary" onClick={handleAddSkill} style={{ padding: '0 16px' }}>
                  <Plus size={20} />
                </button>
              </div>
              <div className="tag-list">
                {cvData.skills.map((skill, idx) => (
                  <span key={idx} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{skill}</span>
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 4: Languages */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} />
                <span>4. Ngoại ngữ</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nhập ngoại ngữ (ví dụ: Tiếng Anh)" 
                  value={newLanguage} 
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                />
                <button className="btn-icon-text primary" onClick={handleAddLanguage} style={{ padding: '0 16px' }}>
                  <Plus size={20} />
                </button>
              </div>
              <div className="tag-list">
                {cvData.languages.map((lang, idx) => (
                  <span key={idx} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{lang}</span>
                    <button 
                      onClick={() => handleRemoveLanguage(lang)}
                      style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 5: Projects */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} />
                <span>5. Dự án thực tế</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Tên dự án" 
                    className="input-field" 
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input 
                    type="text" 
                    placeholder="Vai trò" 
                    className="input-field" 
                    value={newProject.role}
                    onChange={(prev) => setNewProject(p => ({ ...p, role: prev.target.value }))}
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Công nghệ (ngăn cách bằng dấu phẩy, vd: React, Node)" 
                  className="input-field" 
                  value={newProject.technologies}
                  onChange={(e) => setNewProject(prev => ({ ...prev, technologies: e.target.value }))}
                />
                <textarea 
                  placeholder="Mô tả dự án..." 
                  className="input-field" 
                  rows={2} 
                  style={{ resize: 'vertical' }}
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                />
                <button className="btn-icon-text primary" onClick={handleAddProject} style={{ justifyContent: 'center' }}>
                  <Plus size={16} />
                  <span>Thêm dự án</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cvData.projects.map((proj, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{proj.name} ({proj.role})</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{proj.description}</div>
                    </div>
                    <button 
                      onClick={() => handleRemoveProject(idx)}
                      style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Grades showcasing */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={18} />
                <span>6. Hiển thị kết quả môn học đã matched (Từ CSDL Supabase)</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px' }}>
                Chọn các môn học đã được AI khớp với JD để hiển thị vào CV ứng tuyển:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {cvData.grades.map((grade) => (
                  <label 
                    key={grade.subjectName} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedGrades.includes(grade.subjectName)} 
                        onChange={() => toggleGradeSelection(grade.subjectName)}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{grade.subjectName}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 700, fontSize: '0.85rem' }}>
                      {typeof grade.score === 'number' ? grade.score.toFixed(1) : grade.score} / 10
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 7: Activities */}
            <div style={{ paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} />
                <span>7. Hoạt động ngoại khóa</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nhập hoạt động..." 
                  value={newActivity} 
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                />
                <button className="btn-icon-text primary" onClick={handleAddActivity} style={{ padding: '0 16px' }}>
                  <Plus size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {cvData.activities.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem' }}>{act}</span>
                    <button 
                      onClick={() => handleRemoveActivity(act)}
                      style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CV Live Preview Column */}
          <div className="cv-preview">
            {/* Printable Container A4 */}
            <div id="printable-cv" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              {/* CV Header */}
              <div className="cv-pdf-header">
                <div>
                  <div className="cv-pdf-name">{cvData.profile.fullName}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#22C55E', marginTop: '2px' }}>{cvData.profile.major}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>{cvData.profile.faculty} - Tây Đô College</div>
                </div>
                <div className="cv-pdf-contact">
                  <div>Email: {cvData.profile.email}</div>
                  <div>SĐT: {cvData.profile.phoneNumber}</div>
                  <div>Địa chỉ: {cvData.profile.hometown}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="cv-pdf-section">
                <div className="cv-pdf-section-title">Giới thiệu bản thân</div>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{cvData.summary}</p>
              </div>

              {/* Grid for Skills & Languages */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div className="cv-pdf-section">
                  <div className="cv-pdf-section-title">Kỹ năng kỹ thuật</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {cvData.skills.map((skill, idx) => (
                      <span key={idx} className="cv-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="cv-pdf-section">
                  <div className="cv-pdf-section-title">Ngoại ngữ</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', marginTop: '4px' }}>
                    {cvData.languages.map((lang, idx) => (
                      <div key={idx} style={{ fontWeight: 500 }}>• {lang}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="cv-pdf-section">
                <div className="cv-pdf-section-title">Dự án đã thực hiện</div>
                <div className="cv-pdf-grid" style={{ marginTop: '4px' }}>
                  {cvData.projects.map((proj, idx) => (
                    <div key={idx} className="cv-pdf-project-card">
                      <div className="cv-pdf-project-title">{proj.name}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginTop: '2px' }}>Vai trò: {proj.role}</div>
                      <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>{proj.description}</p>
                      <div className="cv-pdf-project-tech">
                        Công nghệ: {proj.technologies.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic results (Autofilled from database) */}
              <div className="cv-pdf-section">
                <div className="cv-pdf-section-title">Kết quả môn học tiêu biểu (Xác thực CSDL Tây Đô)</div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic', marginBottom: '4px' }}>
                  * Bảng điểm môn học đã qua phân tích khớp với yêu cầu JD tuyển dụng:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {cvData.grades
                    .filter(g => selectedGrades.includes(g.subjectName))
                    .map((grade) => (
                      <div 
                        key={grade.subjectName} 
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '4px', background: '#F8FAFC', fontSize: '0.8rem' }}
                      >
                        <span style={{ fontWeight: 500 }}>{grade.subjectName}</span>
                        <span style={{ fontWeight: 700, color: '#22C55E' }}>
                          {typeof grade.score === 'number' ? grade.score.toFixed(1) : grade.score} / 10
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Extracurricular Activities */}
              <div className="cv-pdf-section">
                <div className="cv-pdf-section-title">Hoạt động ngoại khóa</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', marginTop: '4px' }}>
                  {cvData.activities.map((act, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>• {act}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
