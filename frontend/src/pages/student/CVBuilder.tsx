import React, { useState, useEffect, useMemo } from 'react';
import { defaultCVData, type CVData, type Experience, type Certification } from '../../mock/mockData';
import { JDInputForm } from '../../components/JDInputForm';
import { CVPreview, getFormattedSkillGroups } from '../../components/CVPreview';
import { ATSScoreBadge } from '../../components/ATSScoreBadge';
import { ValidationReport } from '../../components/ValidationReport';
import { buildATSReport } from '../../utils/cvValidation';
import { exportCVPdf, generateCVFullPipeline, parseJobDescription } from '../../services/aiService';
import { MatchedCoursesTable, type MatchedCourse } from '../../components/MatchedCoursesTable';
import { ProjectForm, type Project } from '../../components/ProjectForm';
import { InternshipForm } from '../../components/InternshipForm';
import { CertForm } from '../../components/CertForm';
import { SkillRadarChart } from '../../components/SkillRadarChart';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  FloppyDisk, 
  Plus, 
  Trash,
  Check,
  User,
  GraduationCap,
  Sparkle,
  Target,
  ArrowRight,
  DownloadSimple,
  Spinner
} from '@phosphor-icons/react';

interface SavedCVSummary { id: string; title: string; updatedAt: string; }

// Keep the pipeline useful even when the JD parser returns only plain text.
// These are explicit technology names, not fabricated student data.
const extractJDTechnologySkills = (text: string): string[] => {
  const known = [
    'Linux', 'Python', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Terraform', 'AWS', 'Azure', 'GCP', 
    'PostgreSQL', 'Oracle', 'MySQL', 'MongoDB', 'JavaScript', 'TypeScript', 'React', 'FastAPI', 'Java', 'Spring Boot', 
    'Jmix', 'Vaadin', 'C++', 'C#', 'Prometheus', 'Grafana', 'Draw.io', 'Figma', 'Core Banking', 'Thought Machine', 
    'Foreign Exchange', 'FX Platform', 'Financial Accounting', 'Custody Banking', 'Anti-Money Laundering', 'AML', 
    'Compliance', 'Customer Relationship Management', 'LARK', 'Enterprise Resource Planning', 'ODOO', 'Agile Scrum', 
    'Technical Troubleshooting', 'Cross-functional Collaboration', 'unit testing', 'infrastructure as code'
  ];
  const lower = text.toLowerCase();
  return known.filter(skill => lower.includes(skill.toLowerCase()));
};


const extractJobTitleFromJD = (jdText: string): string => {
  const IGNORED_HEADINGS = [
    'mô tả công việc', 'job description', 'thông tin tuyển dụng', 'vị trí tuyển dụng', 
    'tuyển dụng', 'vị trí', 'jd', 'yêu cầu công việc', 'yêu cầu ứng viên', 'mô tả', 'quyền lợi'
  ];
  const lines = jdText.split(/\n|[.!?]/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const lower = line.toLowerCase().replace(/[:\-\*#]/g, '').trim();
    if (!IGNORED_HEADINGS.includes(lower) && line.length >= 3 && line.length <= 80) {
      return line.replace(/^[:\-\*#\d\.\s]+/, '').trim();
    }
  }
  return 'Kỹ sư CNTT';
};

export const CVBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jd-match' | 'cv-editor'>('jd-match');
const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [newSkill, setNewSkill] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('');
  const [newActivity, setNewActivity] = useState<string>('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>(cvData.grades.map(g => g.subjectName));
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedCVId, setSavedCVId] = useState<string | null>(null);
  const [savedCVs, setSavedCVs] = useState<SavedCVSummary[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // JD Matching states inside CV Builder
  const [jdText, setJdText] = useState<string>('');
  const [matchedCourses, setMatchedCourses] = useState<MatchedCourse[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [rawDbSubjects, setRawDbSubjects] = useState<any[]>([]);
  const [apiMessage, setApiMessage] = useState<string>('');
  const [shouldRegenerateAfterProject, setShouldRegenerateAfterProject] = useState(false);
  const atsReport = useMemo(() => buildATSReport(cvData, jdText), [cvData, jdText]);


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
            // Deduplicate by subjectCode / subjectName, keeping the highest score
            const uniqueMap = new Map<string, any>();
            list.forEach(sub => {
              const key = (sub.subjectCode || sub.subjectName || '').trim().toLowerCase();
              if (!key) return;
              if (!uniqueMap.has(key)) {
                uniqueMap.set(key, sub);
              } else {
                const existing = uniqueMap.get(key);
                const existingScore = existing.combinedResult ?? existing.result ?? 0;
                const newScore = sub.combinedResult ?? sub.result ?? 0;
                if (newScore > existingScore) {
                  uniqueMap.set(key, sub);
                }
              }
            });
            setRawDbSubjects(Array.from(uniqueMap.values()));
            return;
          }
        }
      } catch (err) {
        console.warn('API score query failed, loading from Supabase...', err);
      }

      setApiMessage('Không tải được điểm thật từ hệ thống. Vui lòng thử lại sau.');
    };

    fetchScores();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    axios.get<SavedCVSummary[]>('http://localhost:5000/api/saved-cvs')
      .then(response => setSavedCVs(response.data))
      .catch(() => setApiMessage('Không tải được danh sách CV đã lưu.'));
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
  const handleAnalyzeJD = async (inputJdText: string, _fileName?: string, file?: File) => {
    setJdText(inputJdText);
    setIsMatchingLoading(true);
    setApiMessage('');
    let normalizedJd = inputJdText;
    try {
      const parsed = await parseJobDescription(inputJdText, file);
      if (parsed.markdown.trim()) normalizedJd = parsed.markdown;
      setJdText(normalizedJd);
      const selectedCourses = rawDbSubjects
        .filter(subject => Number.isFinite(subject.combinedResult ?? subject.result))
        .map(subject => ({
          course_id: subject.subjectCode,
          course_name: subject.subjectName,
          grade: subject.combinedResult ?? subject.result,
          credit_point: subject.creditPoint || 3,
        }));

      if (!selectedCourses.length) {
        throw new Error('Chưa có điểm học phần thực tế để tạo CV.');
      }

      const projects = cvData.projects.map(project => ({
        project_name: project.name,
        role: project.role,
        description: project.description,
        technologies: project.technologies,
      }));
      const jdLower = normalizedJd.toLowerCase();
      const requiredSkills = [...new Set([
        ...cvData.skills,
        ...extractJDTechnologySkills(normalizedJd),
        ...projects.flatMap(project => project.technologies as string[]),
      ].filter(skill => jdLower.includes(skill.toLowerCase())))];

      const result = await generateCVFullPipeline({
        student: {
          student_id: user?.username,
          full_name: cvData.profile.fullName,
          email: cvData.profile.email,
          phone: cvData.profile.phoneNumber,
          major: cvData.profile.major || 'Công nghệ thông tin',
          specialization: cvData.profile.faculty || 'Kỹ thuật phần mềm',
          academic_year: cvData.profile.academicYear || '',
          overall_percentage: cvData.profile.gpa,
          languages: cvData.languages,
        },
        target_job: {
          job_title: extractJobTitleFromJD(normalizedJd),
          required_skills: requiredSkills,
        },
        jd_raw_text: normalizedJd,
        selected_courses: selectedCourses,
        projects,
      });

      const pipelineCourses = result.competency_profile.selected_courses || [];
      const matched = pipelineCourses.map(course => ({
        subjectCode: course.course_id,
        subjectName: course.course_name,
        creditPoint: course.credit_point || 3,
        combinedResult: course.grade,
        gradeC: course.grade >= 8.5 ? 'A' : course.grade >= 7 ? 'B' : course.grade >= 5.5 ? 'C' : 'D',
        grade4: course.grade >= 8.5 ? 4 : course.grade >= 7 ? 3 : course.grade >= 5.5 ? 2 : 1,
        matchPercentage: Math.round((course.similarity_score || 0) * 100),
        matchedKeywords: course.matched_skills || course.clos || [],
        relevanceReason: 'Được AI đối chiếu với JD, CLO và điểm học phần thực tế.',
      }));
      const generated = result.cv;
      const profileSkills = (result.competency_profile.competency_summary?.technical_skills || [])
        .filter(skill => (skill.confidence ?? 0) >= 0.5)
        .map(skill => skill.skill);
      const generatedLanguages = generated.languages?.length
        ? generated.languages
        : (result.competency_profile.languages || cvData.languages);
      const updatedCvGrades = matched.map(course => ({ subjectName: course.subjectName, score: course.combinedResult, credits: course.creditPoint }));

      const generatedCategorized = Array.isArray(generated.skills?.categorized)
        ? generated.skills.categorized.map((g: any) => ({
            category: g.category || g.name || 'General Skills',
            items: Array.isArray(g.items) ? g.items : Array.isArray(g.skills) ? g.skills : []
          }))
        : undefined;

      setMatchedCourses(matched);
      setCvData(previous => ({
        ...previous,
        profile: {
          ...previous.profile,
          fullName: generated.personal_info.full_name || previous.profile.fullName,
          email: generated.personal_info.email || previous.profile.email,
          phoneNumber: generated.personal_info.phone || previous.profile.phoneNumber,
        },
        summary: generated.personal_info.summary || previous.summary,
        skills: [...new Set([...(generated.skills?.technical || []), ...(generated.skills?.tools || []), ...profileSkills])],
        categorizedSkills: generatedCategorized || previous.categorizedSkills,
        languages: generatedLanguages,
        projects: generated.projects.map(project => ({
          name: project.name,
          role: project.role,
          description: project.description,
          technologies: project.technologies,
        })),
        grades: updatedCvGrades,
      }));
      setSelectedGrades(updatedCvGrades.map(grade => grade.subjectName));
      setApiMessage(`Đã hoàn tất full pipeline — ATS: ${String(result.ats_report.ats_score ?? result.ats_report.score ?? 'đang đánh giá')}; kiểm chứng evidence: ${String(result.validation_report.evidence_score ?? 'đã chạy')}.`);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : 'Không thể chạy full pipeline. Vui lòng thử lại.');
    } finally {
      setIsMatchingLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldRegenerateAfterProject || !jdText.trim()) return;
    setShouldRegenerateAfterProject(false);
    void handleAnalyzeJD(jdText);
  }, [shouldRegenerateAfterProject]);


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

  const [perCategoryInput, setPerCategoryInput] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const activeSkillGroups = useMemo(() => {
    return getFormattedSkillGroups(cvData);
  }, [cvData]);

  const handleAddItemToCategory = (categoryName: string, itemStr: string) => {
    const trimmed = itemStr.trim();
    if (!trimmed) return;

    const currentGroups = activeSkillGroups.map(g => ({
      category: g.category,
      items: [...g.items]
    }));

    let targetGroup = currentGroups.find(g => g.category === categoryName);
    if (!targetGroup) {
      targetGroup = { category: categoryName, items: [] };
      currentGroups.push(targetGroup);
    }

    if (!targetGroup.items.includes(trimmed)) {
      targetGroup.items.push(trimmed);
    }

    const allSkills = [...new Set(currentGroups.flatMap(g => g.items))];

    setCvData(prev => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups
    }));

    setPerCategoryInput(prev => ({ ...prev, [categoryName]: '' }));
  };

  const handleRemoveItemFromCategory = (categoryName: string, itemStr: string) => {
    const currentGroups = activeSkillGroups.map(g => ({
      category: g.category,
      items: g.items.filter(i => i !== itemStr)
    })).filter(g => g.items.length > 0);

    const allSkills = [...new Set(currentGroups.flatMap(g => g.items))];

    setCvData(prev => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups
    }));
  };

  const handleAddCategoryGroup = () => {
    const trimmedCat = newCategoryName.trim();
    if (!trimmedCat) return;

    const currentGroups = activeSkillGroups.map(g => ({
      category: g.category,
      items: [...g.items]
    }));

    if (!currentGroups.some(g => g.category.toLowerCase() === trimmedCat.toLowerCase())) {
      currentGroups.push({ category: trimmedCat, items: [] });
    }

    const allSkills = [...new Set(currentGroups.flatMap(g => g.items))];

    setCvData(prev => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups
    }));

    setNewCategoryName('');
  };

  const handleRemoveCategoryGroup = (categoryName: string) => {
    const currentGroups = activeSkillGroups.filter(g => g.category !== categoryName);
    const allSkills = [...new Set(currentGroups.flatMap(g => g.items))];

    setCvData(prev => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
        categorizedSkills: undefined,
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
      categorizedSkills: undefined,
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

  // Handlers for Projects
  const handleAddProject = (project: Project) => {
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
    if (jdText.trim()) {
      setApiMessage('Đã thêm project. Đang cập nhật lại summary và CV theo dữ liệu mới...');
      setShouldRegenerateAfterProject(true);
    }
  };

  const handleRemoveProject = (index: number) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  // Handlers for Experience (Internship)
  const handleAddExperience = (exp: Experience) => {
    setCvData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), exp]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, idx) => idx !== index)
    }));
  };

  // Handlers for Certifications
  const handleAddCert = (cert: Certification) => {
    setCvData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), cert]
    }));
  };

  const handleRemoveCert = (index: number) => {
    setCvData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, idx) => idx !== index)
    }));
  };

  const toggleGradeSelection = (subjectName: string) => {
    setSelectedGrades(prev => 
      prev.includes(subjectName) 
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = async () => {
    try {
      const response = await axios.post<{ id: string; title: string; updatedAt: string }>('http://localhost:5000/api/saved-cvs', {
        id: savedCVId,
        title: cvData.profile.fullName ? `CV ${cvData.profile.fullName}` : 'CV chưa đặt tên',
        contentJson: JSON.stringify({ cvData, jdText, selectedGrades }),
      });
      setSavedCVId(response.data.id);
      setSavedCVs(previous => [
        { id: response.data.id, title: response.data.title, updatedAt: response.data.updatedAt },
        ...previous.filter(cv => cv.id !== response.data.id),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setApiMessage('Không thể lưu CV. Vui lòng thử lại.');
    }
  };

  const handleLoadSavedCV = async (id: string) => {
    if (!id) return;
    try {
      const response = await axios.get<{ id: string; content: string }>(`http://localhost:5000/api/saved-cvs/${id}`);
      const saved = JSON.parse(response.data.content) as { cvData: CVData; jdText?: string; selectedGrades?: string[] };
      setCvData(saved.cvData);
      setJdText(saved.jdText || '');
      setSelectedGrades(saved.selectedGrades || saved.cvData.grades.map(grade => grade.subjectName));
      setSavedCVId(response.data.id);
      setActiveTab('cv-editor');
      setApiMessage('Đã mở CV đã lưu để tiếp tục chỉnh sửa.');
    } catch {
      setApiMessage('Không thể mở CV đã lưu.');
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('printable-cv');
    if (!element) return;

    setIsExportingPdf(true);

    try {
      const blob = await exportCVPdf(cvData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${(cvData.profile.fullName || 'Student').replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExportingPdf(false);
      return;
    } catch {
      // Local html2pdf fallback keeps the demo usable without AI service.
    }

    const getHtml2Pdf = async (): Promise<any> => {
      if ((window as any).html2pdf) {
        return (window as any).html2pdf;
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve((window as any).html2pdf);
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };

    try {
      const html2pdfLib = await getHtml2Pdf();
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `CV_${(cvData.profile.fullName || 'Student').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdfLib().set(opt).from(element).save();
      setIsExportingPdf(false);
    } catch (err) {
      console.warn('html2pdf library loading failed, falling back to window.print():', err);
      setIsExportingPdf(false);
      window.print();
    }
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select aria-label="Chọn CV đã lưu" className="input-field" value={savedCVId || ''} onChange={(event) => handleLoadSavedCV(event.target.value)} style={{ minWidth: '180px', padding: '8px 10px' }}>
            <option value="">CV mới</option>
            {savedCVs.map(cv => <option key={cv.id} value={cv.id}>{cv.title}</option>)}
          </select>
          <button className="btn-icon-text" onClick={() => { setSavedCVId(null); setCvData(defaultCVData); setJdText(''); setSelectedGrades([]); }} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--color-border)' }}>
            <Plus size={18} /><span>CV mới</span>
          </button>
          <button 
            className="btn-icon-text primary" 
            onClick={handleExportPDF} 
            disabled={isExportingPdf}
            style={{ opacity: isExportingPdf ? 0.7 : 1 }}
          >
            {isExportingPdf ? <Spinner size={18} className="spin" /> : <DownloadSimple size={18} />}
            <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF'}</span>
          </button>

          {/* 
          <button className="btn-icon-text" onClick={handlePrint}>
            <Printer size={18} />
            <span>In CV</span>
          </button>
          */}

          <button className="btn-icon-text" onClick={handleSave} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--color-border)' }}>
            {saveSuccess ? <Check size={18} color="#22C55E" /> : <FloppyDisk size={18} />}
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
          {apiMessage && <div role="status" style={{ color: apiMessage.startsWith('JD đã') ? '#22C55E' : '#EAB308', fontSize: '0.82rem' }}>{apiMessage}</div>}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div><h3 style={{ margin: 0, color: '#F8FAFC' }}>Biên tập CV</h3><p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.8rem' }}>Thay đổi sẽ cập nhật ngay sang bản xem trước.</p></div>
              <ATSScoreBadge score={atsReport.score} compact />
            </div>
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

            {/* Section 3: Skills (COMPETENCES Grouped Input) */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} />
                <span>3. Kỹ năng chuyên môn (COMPETENCES)</span>
              </h3>



              {/* Grouped Skills Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeSkillGroups.map((group) => (
                  <div 
                    key={group.category} 
                    style={{ 
                      padding: '12px', 
                      background: 'rgba(15, 23, 42, 0.6)', 
                      borderRadius: '8px', 
                      border: '1px solid var(--color-border)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22C55E' }}>
                        * {group.category} ({group.items.length})
                      </span>
                      <button 
                        onClick={() => handleRemoveCategoryGroup(group.category)}
                        title="Xóa nhóm kỹ năng này"
                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px 4px' }}
                      >
                        <Trash size={14} />
                      </button>
                    </div>

                    {/* Skill tags inside this category */}
                    <div className="tag-list" style={{ marginBottom: '8px' }}>
                      {group.items.map((skill, sIdx) => (
                        <span key={sIdx} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <span>{skill}</span>
                          <button 
                            onClick={() => handleRemoveItemFromCategory(group.category, skill)}
                            style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Trash size={12} />
                          </button>
                        </span>
                      ))}
                      {group.items.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic' }}>Chưa có kỹ năng trong nhóm này.</span>
                      )}
                    </div>

                    {/* Per-category add input */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        placeholder={`+ Thêm kỹ năng vào nhóm "${group.category}"...`}
                        value={perCategoryInput[group.category] || ''}
                        onChange={(e) => setPerCategoryInput(prev => ({ ...prev, [group.category]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItemToCategory(group.category, perCategoryInput[group.category] || '');
                          }
                        }}
                      />
                      <button 
                        className="btn-icon-text secondary"
                        style={{ padding: '0 10px', fontSize: '0.75rem' }}
                        onClick={() => handleAddItemToCategory(group.category, perCategoryInput[group.category] || '')}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Create new custom category */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Tên nhóm kỹ năng mới (ví dụ: Domain Knowledge, Certifications)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryGroup()}
                  />
                  <button 
                    className="btn-icon-text secondary"
                    style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
                    onClick={handleAddCategoryGroup}
                  >
                    <Plus size={16} />
                    <span>Tạo nhóm mới</span>
                  </button>
                </div>
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

            {/* Section 5: ProjectForm Component */}
            <ProjectForm
              projects={cvData.projects}
              onAddProject={handleAddProject}
              onRemoveProject={handleRemoveProject}
            />

            {/* Section 6: InternshipForm Component */}
            <InternshipForm
              experiences={cvData.experience || []}
              onAddExperience={handleAddExperience}
              onRemoveExperience={handleRemoveExperience}
            />

            {/* Section 7: CertForm Component */}
            <CertForm
              certifications={cvData.certifications || []}
              onAddCert={handleAddCert}
              onRemoveCert={handleRemoveCert}
            />

            {/* Section 8: Grades Showcase */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={18} />
                <span>8. Hiển thị kết quả môn học đã matched (Từ CSDL Supabase)</span>
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

            {/* Section 9: SkillRadarChart Component */}
            <SkillRadarChart
              grades={cvData.grades}
              selectedGrades={selectedGrades}
            />

            {/* Section 10: Activities */}
            <div style={{ paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} />
                <span>10. Hoạt động ngoại khóa</span>
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
            <ValidationReport report={atsReport} />
          </div>

          {/* CV Live Preview Column */}
          <CVPreview cvData={cvData} selectedGrades={selectedGrades}>
            {/* Printable Container A4 */}
            <div id="printable-cv" className="cv-a4-sheet" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
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
                  <div className="cv-pdf-section-title">COMPETENCES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {getFormattedSkillGroups(cvData).map(group => (
                      <div key={group.category} style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: '1.5' }}>
                        <strong style={{ color: '#0F172A', fontWeight: 700 }}>* {group.category}:</strong> {group.items.join(', ')}.
                      </div>
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
                        Công nghệ: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internship Experience (Live Preview A4) */}
              {cvData.experience && cvData.experience.length > 0 && (
                <div className="cv-pdf-section">
                  <div className="cv-pdf-section-title">Kinh nghiệm thực tập & làm việc</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    {cvData.experience.map((exp, idx) => (
                      <div key={idx} style={{ padding: '6px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>{exp.company}</div>
                        <div style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 600 }}>
                          {exp.role} {exp.period ? `(${exp.period})` : ''}
                        </div>
                        {exp.description && (
                          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', lineHeight: '1.4' }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications (Live Preview A4) */}
              {cvData.certifications && cvData.certifications.length > 0 && (
                <div className="cv-pdf-section">
                  <div className="cv-pdf-section-title">Chứng chỉ & Bằng cấp</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {cvData.certifications.map((cert, idx) => (
                      <span key={idx} className="cv-tag">
                        {cert.certificationName} {cert.date ? `(${cert.date})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
          </CVPreview>
        </div>
      )}
    </div>
  );
};
