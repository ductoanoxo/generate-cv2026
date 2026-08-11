import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  defaultCVData,
  type CVData,
  type Experience,
  type Certification,
} from "../../mock/mockData";
import { JDInputForm } from "../../components/JDInputForm";
import { CVPreview, getFormattedSkillGroups } from "../../components/CVPreview";
import { ATSScoreBadge } from "../../components/ATSScoreBadge";
import { ValidationReport } from "../../components/ValidationReport";
import { buildATSReport } from "../../utils/cvValidation";
import {
  autoOptimizeCv,
  exportCVPdf,
  exportMau07Docx,
  generateCVFullPipeline,
  parseJobDescription,
  translateCvData,
} from "../../services/aiService";
import {
  getMyVerifications,
  submitVerification,
  type InternshipVerification,
} from "../../services/internshipVerificationService";
import {
  MatchedCoursesTable,
  type MatchedCourse,
} from "../../components/MatchedCoursesTable";
import { ProjectForm, type Project } from "../../components/ProjectForm";
import { EducationForm, type EducationItem } from "../../components/EducationForm";
import { InternshipForm } from "../../components/InternshipForm";

import { CertForm } from "../../components/CertForm";
import { SkillRadarChart } from "../../components/SkillRadarChart";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  FileText,
  FloppyDisk,
  Plus,
  Trash,
  Check,
  User,
  Sparkle,
  Target,
  ArrowRight,
  DownloadSimple,
  Spinner,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  CornersOut,
  Copy,
} from "@phosphor-icons/react";

interface SavedCVSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface StudentProfileResponse {
  fullName: string;
  studentCode: string;
  majorName: string;
  academicYearName: string;
  birthDate: string | null;
  gender: string | null;
  email: string;
  hometown: string | null;
  phoneNumber: string | null;
}

// Keep the pipeline useful even when the JD parser returns only plain text.
// These are explicit technology names, not fabricated student data.
const extractJDTechnologySkills = (text: string): string[] => {
  const known = [
    "Linux",
    "Python",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Git",
    "GitHub",
    "Terraform",
    "AWS",
    "Azure",
    "GCP",
    "PostgreSQL",
    "Oracle",
    "MySQL",
    "MongoDB",
    "JavaScript",
    "TypeScript",
    "React",
    "FastAPI",
    "Java",
    "Spring Boot",
    "Jmix",
    "Vaadin",
    "C++",
    "C#",
    "Prometheus",
    "Grafana",
    "Draw.io",
    "Figma",
    "Core Banking",
    "Thought Machine",
    "Foreign Exchange",
    "FX Platform",
    "Financial Accounting",
    "Custody Banking",
    "Anti-Money Laundering",
    "AML",
    "Compliance",
    "Customer Relationship Management",
    "LARK",
    "Enterprise Resource Planning",
    "ODOO",
    "Agile Scrum",
    "Technical Troubleshooting",
    "Cross-functional Collaboration",
    "unit testing",
    "infrastructure as code",
  ];
  const lower = text.toLowerCase();
  return known.filter((skill) => lower.includes(skill.toLowerCase()));
};

const extractJobTitleFromJD = (jdText: string): string => {
  const IGNORED_HEADINGS = [
    "mô tả công việc",
    "job description",
    "thông tin tuyển dụng",
    "vị trí tuyển dụng",
    "tuyển dụng",
    "vị trí",
    "jd",
    "yêu cầu công việc",
    "yêu cầu ứng viên",
    "mô tả",
    "quyền lợi",
  ];
  const lines = jdText
    .split(/\n|[.!?]/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    const lower = line
      .toLowerCase()
      .replace(/[:\-\*#]/g, "")
      .trim();
    if (
      !IGNORED_HEADINGS.includes(lower) &&
      line.length >= 3 &&
      line.length <= 80
    ) {
      return line.replace(/^[:\-\*#\d\.\s]+/, "").trim();
    }
  }
  return "Kỹ sư CNTT";
};

const OptimizeDiffBlock: React.FC<{
  label: string;
  oldValue: string;
  newValue: string;
}> = ({ label, oldValue, newValue }) => {
  if (oldValue === newValue) return null;
  return (
    <div style={{ marginBottom: "14px" }}>
      <strong style={{ color: "#E2E8F0", fontSize: "0.85rem" }}>{label}</strong>
      <div
        style={{
          marginTop: "6px",
          background: "#1E293B",
          borderRadius: "8px",
          padding: "10px 12px",
          fontSize: "0.8rem",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
        }}
      >
        <div
          style={{
            color: "#F87171",
            textDecoration: "line-through",
            textDecorationColor: "rgba(248,113,113,0.4)",
          }}
        >
          {oldValue || "(trống)"}
        </div>
        <div style={{ color: "#4ADE80", marginTop: "6px" }}>
          {newValue || "(trống)"}
        </div>
      </div>
    </div>
  );
};

export const CVBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"jd-match" | "cv-editor">(
    "jd-match",
  );
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [newActivity, setNewActivity] = useState<string>("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    cvData.grades.map((g) => g.subjectName),
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedCVId, setSavedCVId] = useState<string | null>(null);
  const [savedCVs, setSavedCVs] = useState<SavedCVSummary[]>([]);
  const [cvTitle, setCvTitle] = useState<string>("");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [verifications, setVerifications] = useState<InternshipVerification[]>(
    [],
  );
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [cvLang, setCvLang] = useState<"vi" | "en">("vi");
  const [translatedCV, setTranslatedCV] = useState<CVData | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const translationCacheRef = useRef<Map<string, CVData>>(new Map());
  const [optimizeDraft, setOptimizeDraft] = useState<CVData | null>(null);
  const [optimizeRecommendations, setOptimizeRecommendations] = useState<
    string[]
  >([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const zoomLevelRef = useRef<number>(zoomLevel);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(2.5, parseFloat((prev + 0.1).toFixed(2))));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(0.5, parseFloat((prev - 0.1).toFixed(2))));
  const handleZoomReset = () => setZoomLevel(0.75);

  useEffect(() => {
    const container = viewerContainerRef.current;
    if (!container) return;

    let gestureScaleStart = 0.75;

    const handleWheel = (e: WheelEvent) => {
      // Ensure the event target is inside the CV viewer container
      if (!container.contains(e.target as Node)) return;

      // Pinch-to-zoom on touchpad / trackpad or Ctrl + Mouse Wheel
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = -e.deltaY;
        // Determine sensitivity: trackpad pinch yields very small delta values (often absolute value < 15)
        // compared to standard mouse wheel ticks (typically 100+).
        const isTrackpad = Math.abs(e.deltaY) < 15;
        const sensitivity = isTrackpad ? 0.015 : 0.003;
        // Using Math.exp ensures the factor is ALWAYS positive, preventing layout collapse or negative scale
        const factor = Math.exp(delta * sensitivity);

        setZoomLevel((prev) => {
          const currentScale = prev || 0.75;
          const nextScale = Math.min(2.5, Math.max(0.5, currentScale * factor));
          if (nextScale === currentScale) return currentScale;

          // Target scale center coordinates relative to the container
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const scrollLeft = container.scrollLeft;
          const scrollTop = container.scrollTop;

          // Keep point under cursor stationary
          const contentX = (scrollLeft + mouseX) / currentScale;
          const contentY = (scrollTop + mouseY) / currentScale;

          if (isFinite(contentX) && isFinite(contentY)) {
            requestAnimationFrame(() => {
              container.scrollLeft = contentX * nextScale - mouseX;
              container.scrollTop = contentY * nextScale - mouseY;
            });
          }

          return parseFloat(nextScale.toFixed(3));
        });
      }
    };

    // Safari/macOS Trackpad gestures support
    const handleGestureStart = (e: any) => {
      if (!container.contains(e.target as Node)) return;
      e.preventDefault();
      gestureScaleStart = zoomLevelRef.current;
    };

    const handleGestureChange = (e: any) => {
      if (!container.contains(e.target as Node)) return;
      e.preventDefault();
      setZoomLevel(() => {
        const nextScale = Math.min(2.5, Math.max(0.5, gestureScaleStart * e.scale));
        return parseFloat(nextScale.toFixed(3));
      });
    };

    // Bind to document with capture: true to guarantee handling before default browser action and bubbling cancellation
    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    document.addEventListener("gesturestart", handleGestureStart, { passive: false, capture: true });
    document.addEventListener("gesturechange", handleGestureChange, { passive: false, capture: true });

    return () => {
      document.removeEventListener("wheel", handleWheel, { capture: true });
      document.removeEventListener("gesturestart", handleGestureStart, { capture: true });
      document.removeEventListener("gesturechange", handleGestureChange, { capture: true });
    };
  }, []);

  // JD Matching states inside CV Builder
  const [jdText, setJdText] = useState<string>("");
  const [matchedCourses, setMatchedCourses] = useState<MatchedCourse[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [rawDbSubjects, setRawDbSubjects] = useState<any[]>([]);
  const [apiMessage, setApiMessage] = useState<string>("");
  const [shouldRegenerateAfterProject, setShouldRegenerateAfterProject] =
    useState(false);
  const atsReport = useMemo(
    () => buildATSReport(cvData, jdText),
    [cvData, jdText],
  );

  // Only internship items that have been approved (verificationStatus === 1) are shown on the CV
  const cvExperience = useMemo(
    () =>
      (cvData.experience || []).filter((exp) => exp.verificationStatus === 1),
    [cvData.experience],
  );

  const baseCVData = useMemo(
    () => ({
      ...cvData,
      education:
        cvData.education && cvData.education.length > 0
          ? cvData.education
          : [
              {
                school: "Trường Cao đẳng Tây Đô",
                major: cvData.profile.major
                  ? `${cvData.profile.major}${
                      cvData.profile.faculty ? ` (${cvData.profile.faculty})` : ""
                    }`
                  : "Kỹ thuật Phần mềm",
                period: cvData.profile.academicYear || "",
                gpa: cvData.profile.gpa > 0 ? cvData.profile.gpa : undefined,
                degree: "Cao đẳng",
              },
            ],
      experience: cvExperience,
    }),
    [
      cvData,
      cvData.education,
      cvData.profile.academicYear,
      cvData.profile.faculty,
      cvData.profile.gpa,
      cvData.profile.major,
      cvExperience,
    ],
  );

  // Translate CV content to English when toggling EN (cached per content version)
  useEffect(() => {
    if (cvLang !== "en") {
      setTranslatedCV(null);
      return;
    }
    const contentKey = JSON.stringify(baseCVData);
    const cached = translationCacheRef.current.get(contentKey);
    if (cached) {
      setTranslatedCV(cached);
      return;
    }
    let cancelled = false;
    setIsTranslating(true);
    translateCvData(baseCVData)
      .then((result) => {
        if (cancelled) return;
        translationCacheRef.current.set(contentKey, result);
        setTranslatedCV(result);
      })
      .catch(() => {
        if (!cancelled) setTranslatedCV(null);
      })
      .finally(() => {
        if (!cancelled) setIsTranslating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cvLang, baseCVData]);

  // Fetch real student scores from .NET API or Supabase DB
  useEffect(() => {
    const fetchScores = async () => {
      const studentId = user?.id || "u6";
      try {
        const response = await axios.get(
          `http://localhost:5000/api/student/scores?studentId=${studentId}`,
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
            list.forEach((sub) => {
              const key = (sub.subjectCode || sub.subjectName || "")
                .trim()
                .toLowerCase();
              if (!key) return;
              if (!uniqueMap.has(key)) {
                uniqueMap.set(key, sub);
              } else {
                const existing = uniqueMap.get(key);
                const existingScore =
                  existing.combinedResult ?? existing.result ?? 0;
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
        console.warn("API score query failed, loading from Supabase...", err);
      }

      setApiMessage(
        "Không tải được điểm thật từ hệ thống. Vui lòng thử lại sau.",
      );
    };

    fetchScores();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    axios
      .get<SavedCVSummary[]>("http://localhost:5000/api/saved-cvs")
      .then((response) => setSavedCVs(response.data))
      .catch(() => setApiMessage("Không tải được danh sách CV đã lưu."));
  }, [user]);

  // Update profile from logged in user if available
  useEffect(() => {
    if (user) {
      setCvData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          fullName: user.fullName || prev.profile.fullName,
          email: user.email || prev.profile.email,
        },
      }));
    }
  }, [user]);

  // Auto-fill Lớp (academicYear), major, studentCode, birthDate... from the student record
  useEffect(() => {
    if (!user) return;
    let active = true;
    axios
      .get<{ profile: StudentProfileResponse }>(
        `http://localhost:5000/api/student/dashboard?studentId=${user.id}`,
      )
      .then((res) => {
        const p = res.data?.profile;
        if (!p || !active) return;
        setCvData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            fullName: prev.profile.fullName || p.fullName,
            email: prev.profile.email || p.email,
            phoneNumber: prev.profile.phoneNumber || p.phoneNumber || "",
            gender: prev.profile.gender || p.gender || "",
            birthDate:
              prev.profile.birthDate ||
              (p.birthDate ? p.birthDate.slice(0, 10) : ""),
            hometown: prev.profile.hometown || p.hometown || "",
            studentCode: prev.profile.studentCode || p.studentCode,
            major: prev.profile.major || p.majorName,
            academicYear: prev.profile.academicYear || p.academicYearName,
          },
        }));
      })
      .catch(() => {
        /* backend may be off */
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Load the student's internship verifications and merge status into experiences.
  // Re-poll periodically and on window focus so approvals made elsewhere show up.
  useEffect(() => {
    let active = true;
    const load = () => {
      getMyVerifications()
        .then((list) => {
          if (active) setVerifications(list);
        })
        .catch(() => {
          /* backend may be off */
        });
    };
    load();
    const timer = setInterval(load, 20000);
    window.addEventListener("focus", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, []);

  useEffect(() => {
    if (verifications.length === 0) return;
    setCvData((prev) => {
      const newExperiences = (prev.experience || []).map((exp) => {
        const match = verifications.find(
          (v) =>
            v.company.trim().toLowerCase() ===
              (exp.company || "").trim().toLowerCase() &&
            v.role.trim().toLowerCase() ===
              (exp.role || "").trim().toLowerCase() &&
            (v.period || "").trim().toLowerCase() ===
              (exp.period || "").trim().toLowerCase(),
        );
        if (!match) return exp;
        return {
          ...exp,
          verificationId: match.id,
          verificationStatus: match.status,
          verificationName: match.approvalName,
          verificationNote: match.note,
        };
      });
      if (JSON.stringify(newExperiences) === JSON.stringify(prev.experience))
        return prev;
      return { ...prev, experience: newExperiences };
    });
  }, [verifications, cvData.experience]);

  // Handle Analyzing JD & Matching Courses
  const handleAnalyzeJD = async (
    inputJdText: string,
    _fileName?: string,
    file?: File,
  ) => {
    setJdText(inputJdText);
    setIsMatchingLoading(true);
    setApiMessage("");
    let normalizedJd = inputJdText;
    try {
      const parsed = await parseJobDescription(inputJdText, file);
      if (parsed.markdown.trim()) normalizedJd = parsed.markdown;
      setJdText(normalizedJd);
      const selectedCourses = rawDbSubjects
        .filter((subject) =>
          Number.isFinite(subject.combinedResult ?? subject.result),
        )
        .map((subject) => ({
          course_id: subject.subjectCode,
          course_name: subject.subjectName,
          grade: subject.combinedResult ?? subject.result,
          credit_point: subject.creditPoint || 3,
        }));

      if (!selectedCourses.length) {
        throw new Error("Chưa có điểm học phần thực tế để tạo CV.");
      }

      const projects = cvData.projects.map((project) => ({
        project_name: project.name,
        role: project.role,
        description: project.description,
        technologies: project.technologies,
      }));
      const jdLower = normalizedJd.toLowerCase();
      const requiredSkills = [
        ...new Set(
          [
            ...cvData.skills,
            ...extractJDTechnologySkills(normalizedJd),
            ...projects.flatMap((project) => project.technologies as string[]),
          ].filter((skill) => jdLower.includes(skill.toLowerCase())),
        ),
      ];

      const result = await generateCVFullPipeline({
        student: {
          student_id: user?.username,
          full_name: cvData.profile.fullName,
          email: cvData.profile.email,
          phone: cvData.profile.phoneNumber,
          major: cvData.profile.major || "Công nghệ thông tin",
          specialization: cvData.profile.faculty || "Kỹ thuật phần mềm",
          academic_year: cvData.profile.academicYear || "",
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

      const pipelineCourses = (result.competency_profile.selected_courses || []).filter(
        (course) => (Number(course.grade) || 0) >= 7,
      );
      const matched = pipelineCourses.map((course) => ({
        subjectCode: course.course_id,
        subjectName: course.course_name,
        creditPoint: course.credit_point || 3,
        combinedResult: course.grade,
        gradeC:
          course.grade >= 8.5
            ? "A"
            : course.grade >= 7
              ? "B"
              : course.grade >= 5.5
                ? "C"
                : "D",
        grade4:
          course.grade >= 8.5
            ? 4
            : course.grade >= 7
              ? 3
              : course.grade >= 5.5
                ? 2
                : 1,
        matchPercentage: Math.round((course.similarity_score || 0) * 100),
        matchedKeywords: course.matched_skills || course.clos || [],
        relevanceReason:
          "Được AI đối chiếu với JD, CLO và điểm học phần thực tế.",
      }));
      const generated = result.cv;
      const profileSkills = (
        result.competency_profile.competency_summary?.technical_skills || []
      )
        .filter((skill) => (skill.confidence ?? 0) >= 0.5)
        .map((skill) => skill.skill);
      const generatedLanguages = generated.languages?.length
        ? generated.languages
        : result.competency_profile.languages || cvData.languages;
      const updatedCvGrades = matched.map((course) => ({
        subjectName: course.subjectName,
        score: course.combinedResult,
        credits: course.creditPoint,
      }));

      const generatedCategorized = Array.isArray(
        (generated.skills as any)?.categorized,
      )
        ? (generated.skills as any).categorized.map((g: any) => ({
            category: g.category || g.name || "General Skills",
            items: Array.isArray(g.items)
              ? g.items
              : Array.isArray(g.skills)
                ? g.skills
                : [],
          }))
        : undefined;

      setMatchedCourses(matched);
      setCvData((previous) => ({
        ...previous,
        profile: {
          ...previous.profile,
          fullName:
            generated.personal_info.full_name || previous.profile.fullName,
          email: generated.personal_info.email || previous.profile.email,
          phoneNumber:
            generated.personal_info.phone || previous.profile.phoneNumber,
        },
        summary: generated.personal_info.summary || previous.summary,
        skills: [
          ...new Set([
            ...(generated.skills?.technical || []),
            ...(generated.skills?.tools || []),
            ...profileSkills,
          ]),
        ],
        categorizedSkills: generatedCategorized || previous.categorizedSkills,
        languages: generatedLanguages,
        projects: generated.projects.map((project) => ({
          name: project.name,
          role: project.role,
          description: project.description,
          technologies: project.technologies,
        })),
        grades: updatedCvGrades,
      }));
      setSelectedGrades(updatedCvGrades.map((grade) => grade.subjectName));
      setApiMessage(
        `Đã hoàn tất full pipeline — ATS: ${String(result.ats_report.ats_score ?? result.ats_report.score ?? "đang đánh giá")}; kiểm chứng evidence: ${String(result.validation_report.evidence_score ?? "đã chạy")}.`,
      );
    } catch (error) {
      setApiMessage(
        error instanceof Error
          ? error.message
          : "Không thể chạy full pipeline. Vui lòng thử lại.",
      );
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
    setCvData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const handleFieldChange = (field: keyof CVData, value: any) => {
    setCvData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [perCategoryInput, setPerCategoryInput] = useState<
    Record<string, string>
  >({});
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const activeSkillGroups = useMemo(() => {
    return getFormattedSkillGroups(cvData);
  }, [cvData]);

  const handleAddItemToCategory = (categoryName: string, itemStr: string) => {
    const trimmed = itemStr.trim();
    if (!trimmed) return;

    const currentGroups = activeSkillGroups.map((g) => ({
      category: g.category,
      items: [...g.items],
    }));

    let targetGroup = currentGroups.find((g) => g.category === categoryName);
    if (!targetGroup) {
      targetGroup = { category: categoryName, items: [] };
      currentGroups.push(targetGroup);
    }

    if (!targetGroup.items.includes(trimmed)) {
      targetGroup.items.push(trimmed);
    }

    const allSkills = [...new Set(currentGroups.flatMap((g) => g.items))];

    setCvData((prev) => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups,
    }));

    setPerCategoryInput((prev) => ({ ...prev, [categoryName]: "" }));
  };

  const handleRemoveItemFromCategory = (
    _categoryName: string,
    itemStr: string,
  ) => {
    const currentGroups = activeSkillGroups
      .map((g) => ({
        category: g.category,
        items: g.items.filter((i) => i !== itemStr),
      }))
      .filter((g) => g.items.length > 0);

    const allSkills = [...new Set(currentGroups.flatMap((g) => g.items))];

    setCvData((prev) => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups,
    }));
  };

  const handleAddCategoryGroup = () => {
    const trimmedCat = newCategoryName.trim();
    if (!trimmedCat) return;

    const currentGroups = activeSkillGroups.map((g) => ({
      category: g.category,
      items: [...g.items],
    }));

    if (
      !currentGroups.some(
        (g) => g.category.toLowerCase() === trimmedCat.toLowerCase(),
      )
    ) {
      currentGroups.push({ category: trimmedCat, items: [] });
    }

    const allSkills = [...new Set(currentGroups.flatMap((g) => g.items))];

    setCvData((prev) => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups,
    }));

    setNewCategoryName("");
  };

  const handleRemoveCategoryGroup = (categoryName: string) => {
    const currentGroups = activeSkillGroups.filter(
      (g) => g.category !== categoryName,
    );
    const allSkills = [...new Set(currentGroups.flatMap((g) => g.items))];

    setCvData((prev) => ({
      ...prev,
      skills: allSkills,
      categorizedSkills: currentGroups,
    }));
  };

  const handleAddActivity = () => {
    if (newActivity.trim() && !cvData.activities.includes(newActivity.trim())) {
      setCvData((prev) => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()],
      }));
      setNewActivity("");
    }
  };

  const handleRemoveActivity = (act: string) => {
    setCvData((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a !== act),
    }));
  };

  // Handlers for Projects
  const handleAddProject = (project: Project) => {
    setCvData((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
    if (jdText.trim()) {
      setApiMessage(
        "Đã thêm project. Đang cập nhật lại summary và CV theo dữ liệu mới...",
      );
      setShouldRegenerateAfterProject(true);
    }
  };

  const handleRemoveProject = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index),
    }));
  };

  // Handlers for Experience (Internship)
  const handleAddExperience = (exp: Experience) => {
    setCvData((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), exp],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, idx) => idx !== index),
    }));
  };

  // Export Mẫu 07 (expert internship evaluation) as DOCX for the given experience
  const handleExportMau07 = async (exp: Experience) => {
    const blob = await exportMau07Docx(cvData, exp, user?.username);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Mau07_TTTN_${(exp.company || "KinhNghiem").replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit a signed Mẫu 07 for lecturer approval
  const handleSubmitVerification = async (exp: Experience, file: File) => {
    const result = await submitVerification({
      studentName: cvData.profile.fullName || user?.fullName || "Sinh viên",
      studentCode: cvData.profile.studentCode || user?.username || "",
      experience: exp,
      file,
    });
    setCvData((prev) => ({
      ...prev,
      experience: (prev.experience || []).map((e) =>
        e.company === exp.company &&
        e.role === exp.role &&
        (e.period || "") === (exp.period || "")
          ? {
              ...e,
              verificationId: result.id,
              verificationStatus: result.status,
            }
          : e,
      ),
    }));
    setApiMessage(
      "Đã nộp phiếu Mẫu 07. Đang chờ trưởng khoa duyệt. Mục thực tập sẽ hiển thị trên CV sau khi được duyệt.",
    );
    getMyVerifications()
      .then((list) => setVerifications(list))
      .catch(() => {});
  };

  // Handlers for Education
  const handleAddEducation = (item: EducationItem) => {
    setCvData((prev) => ({
      ...prev,
      education: [...(prev.education && prev.education.length > 0 ? prev.education : [
        {
          school: "Trường Cao đẳng Tây Đô",
          major: prev.profile.major ? `${prev.profile.major}${prev.profile.faculty ? ` (${prev.profile.faculty})` : ''}` : "Kỹ thuật Phần mềm",
          period: prev.profile.academicYear || "",
          gpa: prev.profile.gpa > 0 ? prev.profile.gpa : undefined,
          degree: "Cao đẳng"
        }
      ]), item],
    }));
  };

  const handleUpdateEducation = (index: number, item: EducationItem) => {
    setCvData((prev) => {
      const currentEduList = prev.education && prev.education.length > 0 ? prev.education : [
        {
          school: "Trường Cao đẳng Tây Đô",
          major: prev.profile.major ? `${prev.profile.major}${prev.profile.faculty ? ` (${prev.profile.faculty})` : ''}` : "Kỹ thuật Phần mềm",
          period: prev.profile.academicYear || "",
          gpa: prev.profile.gpa > 0 ? prev.profile.gpa : undefined,
          degree: "Cao đẳng"
        }
      ];
      return {
        ...prev,
        education: currentEduList.map((e, idx) => (idx === index ? item : e)),
      };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setCvData((prev) => {
      const currentEduList = prev.education && prev.education.length > 0 ? prev.education : [
        {
          school: "Trường Cao đẳng Tây Đô",
          major: prev.profile.major ? `${prev.profile.major}${prev.profile.faculty ? ` (${prev.profile.faculty})` : ''}` : "Kỹ thuật Phần mềm",
          period: prev.profile.academicYear || "",
          gpa: prev.profile.gpa > 0 ? prev.profile.gpa : undefined,
          degree: "Cao đẳng"
        }
      ];
      return {
        ...prev,
        education: currentEduList.filter((_, idx) => idx !== index),
      };
    });
  };

  // Handlers for Certifications
  const handleAddCert = (cert: Certification) => {
    setCvData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), cert],
    }));
  };

  const handleRemoveCert = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter(
        (_, idx) => idx !== index,
      ),
    }));
  };

  // const toggleGradeSelection = (subjectName: string) => {
  //   setSelectedGrades((prev) =>
  //     prev.includes(subjectName)
  //       ? prev.filter((name) => name !== subjectName)
  //       : [...prev, subjectName],
  //   );
  // };

  const resolveCvTitle = () =>
    cvTitle.trim() ||
    (cvData.profile.fullName
      ? `CV ${cvData.profile.fullName}`
      : "CV chưa đặt tên");

  const performSave = async (id: string | null) => {
    const response = await axios.post<{
      id: string;
      title: string;
      updatedAt: string;
    }>("http://localhost:5000/api/saved-cvs", {
      id,
      title: resolveCvTitle(),
      contentJson: JSON.stringify({ cvData, jdText, selectedGrades }),
    });
    setSavedCVId(response.data.id);
    setCvTitle(response.data.title);
    setSavedCVs((previous) => [
      {
        id: response.data.id,
        title: response.data.title,
        updatedAt: response.data.updatedAt,
      },
      ...previous.filter((cv) => cv.id !== response.data.id),
    ]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSave = async () => {
    try {
      await performSave(savedCVId);
    } catch {
      setApiMessage("Không thể lưu CV. Vui lòng thử lại.");
    }
  };

  const handleSaveAs = async () => {
    try {
      await performSave(null);
    } catch {
      setApiMessage("Không thể lưu CV với tên mới. Vui lòng thử lại.");
    }
  };

  const handleAutoOptimize = async () => {
    if (!jdText.trim()) {
      setApiMessage("Vui lòng dán Mô tả công việc (JD) trước khi tối ưu ATS.");
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await autoOptimizeCv(cvData, jdText);
      setOptimizeDraft(result.optimized_cv);
      setOptimizeRecommendations(result.recommendations || []);
    } catch {
      setApiMessage("Không thể tối ưu CV. Vui lòng thử lại.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimize = () => {
    if (!optimizeDraft) return;
    setCvData(optimizeDraft);
    setOptimizeDraft(null);
    setOptimizeRecommendations([]);
    setTranslatedCV(null);
    setApiMessage("Đã áp dụng bản CV đã tối ưu ATS.");
  };

  const handleCancelOptimize = () => {
    setOptimizeDraft(null);
    setOptimizeRecommendations([]);
  };

  const handleLoadSavedCV = async (id: string) => {
    if (!id) return;
    try {
      const response = await axios.get<{
        id: string;
        title: string;
        content: string;
      }>(`http://localhost:5000/api/saved-cvs/${id}`);
      const saved = JSON.parse(response.data.content) as {
        cvData: CVData;
        jdText?: string;
        selectedGrades?: string[];
      };
      setCvData(saved.cvData);
      setJdText(saved.jdText || "");
      setSelectedGrades(
        saved.selectedGrades ||
          saved.cvData.grades.map((grade) => grade.subjectName),
      );
      setSavedCVId(response.data.id);
      setCvTitle(response.data.title);
      setActiveTab("cv-editor");
      setApiMessage("Đã mở CV đã lưu để tiếp tục chỉnh sửa.");
    } catch {
      setApiMessage("Không thể mở CV đã lưu.");
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("printable-cv");
    if (!element) return;

    setIsExportingPdf(true);

    try {
      const blob = await exportCVPdf(
        cvLang === "en" && translatedCV ? translatedCV : baseCVData,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${(cvData.profile.fullName || "Student").replace(/\s+/g, "_")}.pdf`;
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
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve((window as any).html2pdf);
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };

    try {
      const html2pdfLib = await getHtml2Pdf();
      const opt = {
        margin: [10, 10, 12, 10],


        filename: `CV_${(cvData.profile.fullName || "Student").replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById("printable-cv");
            if (el) {
              el.style.position = "static";
              el.style.opacity = "1";
              el.style.visibility = "visible";
            }
          }
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['css', 'legacy'] }
      };


      await html2pdfLib().set(opt).from(element).save();
      setIsExportingPdf(false);
    } catch (err) {
      console.error("PDF export failed:", err);
      setIsExportingPdf(false);
      setApiMessage("Không thể tải file PDF. Vui lòng thử lại sau.");
    }
  };


  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {/* Header and Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FileText size={26} color="#22C55E" />
            <span>Tạo CV Cá Nhân & Phân Tích JD Tuyển Dụng</span>
          </h2>
          <p
            style={{ fontSize: "0.85rem", color: "#94A3B8", marginTop: "2px" }}
          >
            Gom thông tin cá nhân, phân tích JD để tự động chọn các môn học có
            kết quả tốt nhất từ CSDL đưa vào CV.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            aria-label="Chọn CV đã lưu"
            className="input-field"
            value={savedCVId || ""}
            onChange={(event) => handleLoadSavedCV(event.target.value)}
            style={{ minWidth: "180px", padding: "8px 10px" }}
          >
            <option value="">CV mới</option>
            {savedCVs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.title}
              </option>
            ))}
          </select>
          <button
            className="btn-icon-text"
            onClick={() => {
              setSavedCVId(null);
              setCvTitle("");
              setCvData(defaultCVData);
              setJdText("");
              setSelectedGrades([]);
            }}
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Plus size={18} />
            <span>CV mới</span>
          </button>
          <button
            className="btn-icon-text primary"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            style={{ opacity: isExportingPdf ? 0.7 : 1 }}
          >
            {isExportingPdf ? (
              <Spinner size={18} className="spin" />
            ) : (
              <DownloadSimple size={18} />
            )}
            <span>{isExportingPdf ? "Đang tạo PDF..." : "Tải File PDF"}</span>
          </button>

          {/* 
          <button className="btn-icon-text" onClick={handlePrint}>
            <Printer size={18} />
            <span>In CV</span>
          </button>
          */}

          <input
            aria-label="Tên CV"
            className="input-field"
            value={cvTitle}
            onChange={(event) => setCvTitle(event.target.value)}
            placeholder={
              cvData.profile.fullName
                ? `CV ${cvData.profile.fullName}`
                : "Tên CV"
            }
            style={{ minWidth: "160px", padding: "8px 10px" }}
          />
          <button
            className="btn-icon-text"
            onClick={handleSave}
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid var(--color-border)",
            }}
          >
            {saveSuccess ? (
              <Check size={18} color="#22C55E" />
            ) : (
              <FloppyDisk size={18} />
            )}
            <span>{saveSuccess ? "Đã lưu CV!" : "Lưu CV"}</span>
          </button>
          <button
            className="btn-icon-text"
            onClick={handleSaveAs}
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Copy size={18} />
            <span>Lưu với tên mới</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(30, 41, 59, 0.6)",
          padding: "8px 12px",
          borderRadius: "10px",
          border: "1px solid var(--color-border)",
        }}
      >
        <button
          onClick={() => setActiveTab("jd-match")}
          style={{
            background:
              activeTab === "jd-match"
                ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
                : "transparent",
            color: activeTab === "jd-match" ? "#FFFFFF" : "#94A3B8",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow:
              activeTab === "jd-match"
                ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Target size={18} />
          <span>Bước 1: Phân Tích JD & Khớp Môn Học Matched</span>
        </button>

        <button
          onClick={() => setActiveTab("cv-editor")}
          style={{
            background:
              activeTab === "cv-editor"
                ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
                : "transparent",
            color: activeTab === "cv-editor" ? "#FFFFFF" : "#94A3B8",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow:
              activeTab === "cv-editor"
                ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                : "none",
            transition: "all 0.2s ease",
          }}
        >
          <FileText size={18} />
          <span>Bước 2: Biên Tập & Xem Trước Hồ Sơ CV (Live Preview)</span>
        </button>
      </div>

      {/* Tab 1: JD Matcher Section */}
      {activeTab === "jd-match" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <JDInputForm
            onAnalyze={handleAnalyzeJD}
            isLoading={isMatchingLoading}
            initialText={jdText}
          />
          {apiMessage && (
            <div
              role="status"
              style={{
                color: apiMessage.startsWith("JD đã") ? "#22C55E" : "#EAB308",
                fontSize: "0.82rem",
              }}
            >
              {apiMessage}
            </div>
          )}

          {matchedCourses.length > 0 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <MatchedCoursesTable
                courses={matchedCourses}
                isLoading={isMatchingLoading}
                jdText={jdText}
                studentName={cvData.profile.fullName}
                studentCode={user?.username || "sv_toan"}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setActiveTab("cv-editor")}
                  className="btn-icon-text primary"
                  style={{
                    padding: "12px 24px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                  }}
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
      {activeTab === "cv-editor" && (
        <div className="cv-builder-container">
          {/* CV Editor Column */}
          <div className="cv-editor">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#F8FAFC" }}>Biên tập CV</h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#94A3B8",
                    fontSize: "0.8rem",
                  }}
                >
                  Thay đổi sẽ cập nhật ngay sang bản xem trước.
                </p>
              </div>
              <ATSScoreBadge score={atsReport.score} compact />
              <button
                className="btn-icon-text"
                onClick={handleAutoOptimize}
                disabled={isOptimizing}
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                  border: "none",
                  color: "#fff",
                }}
              >
                {isOptimizing ? (
                  <Spinner size={16} className="spin" />
                ) : (
                  <Sparkle size={16} />
                )}
                <span>
                  {isOptimizing ? "Đang tối ưu..." : "Tự động tối ưu ATS"}
                </span>
              </button>
            </div>
            {/* Section 1: Personal Info */}
            <div
              style={{
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "12px",
                  color: "#22C55E",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <User size={18} />
                <span>1. Thông tin cá nhân</span>
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input
                    type="text"
                    className="input-field"
                    value={cvData.profile.fullName}
                    onChange={(e) =>
                      handleProfileFieldChange("fullName", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    className="input-field"
                    value={cvData.profile.phoneNumber}
                    onChange={(e) =>
                      handleProfileFieldChange("phoneNumber", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={cvData.profile.email}
                    onChange={(e) =>
                      handleProfileFieldChange("email", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Quê quán</label>
                  <input
                    type="text"
                    className="input-field"
                    value={cvData.profile.hometown}
                    onChange={(e) =>
                      handleProfileFieldChange("hometown", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    className="input-field"
                    value={
                      cvData.profile.birthDate
                        ? cvData.profile.birthDate.slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      handleProfileFieldChange("birthDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Summary */}
            <div
              style={{
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "12px",
                  color: "#22C55E",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkle size={18} />
                <span>2. Giới thiệu bản thân</span>
              </h3>
              <div className="form-group">
                <textarea
                  className="input-field"
                  rows={3}
                  style={{ resize: "vertical" }}
                  value={cvData.summary}
                  onChange={(e) => handleFieldChange("summary", e.target.value)}
                />
              </div>
            </div>

            {/* Section 3: Skills (COMPETENCES Grouped Input) */}
            <div
              style={{
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "12px",
                  color: "#22C55E",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkle size={18} />
                <span>3. Kỹ năng</span>
              </h3>

              {/* Grouped Skills Cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {activeSkillGroups.map((group) => (
                  <div
                    key={group.category}
                    style={{
                      padding: "12px",
                      background: "rgba(15, 23, 42, 0.6)",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#22C55E",
                        }}
                      >
                        * {group.category} ({group.items.length})
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveCategoryGroup(group.category)
                        }
                        title="Xóa nhóm kỹ năng này"
                        style={{
                          border: "none",
                          background: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          padding: "2px 4px",
                        }}
                      >
                        <Trash size={14} />
                      </button>
                    </div>

                    {/* Skill tags inside this category */}
                    <div className="tag-list" style={{ marginBottom: "8px" }}>
                      {group.items.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="tag"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem",
                          }}
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() =>
                              handleRemoveItemFromCategory(
                                group.category,
                                skill,
                              )
                            }
                            style={{
                              border: "none",
                              background: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash size={12} />
                          </button>
                        </span>
                      ))}
                      {group.items.length === 0 && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#64748B",
                            fontStyle: "italic",
                          }}
                        >
                          Chưa có kỹ năng trong nhóm này.
                        </span>
                      )}
                    </div>

                    {/* Per-category add input */}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        className="input-field"
                        style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                        placeholder={`+ Thêm kỹ năng vào nhóm "${group.category}"...`}
                        value={perCategoryInput[group.category] || ""}
                        onChange={(e) =>
                          setPerCategoryInput((prev) => ({
                            ...prev,
                            [group.category]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddItemToCategory(
                              group.category,
                              perCategoryInput[group.category] || "",
                            );
                          }
                        }}
                      />
                      <button
                        className="btn-icon-text secondary"
                        style={{ padding: "0 10px", fontSize: "0.75rem" }}
                        onClick={() =>
                          handleAddItemToCategory(
                            group.category,
                            perCategoryInput[group.category] || "",
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Create new custom category */}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tên nhóm kỹ năng mới (ví dụ: Domain Knowledge, Certifications)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddCategoryGroup()
                    }
                  />
                  <button
                    className="btn-icon-text secondary"
                    style={{ padding: "0 16px", whiteSpace: "nowrap" }}
                    onClick={handleAddCategoryGroup}
                  >
                    <Plus size={16} />
                    <span>Tạo nhóm mới</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: EducationForm Component */}
            <EducationForm
              education={baseCVData.education || []}
              onAddEducation={handleAddEducation}
              onUpdateEducation={handleUpdateEducation}
              onRemoveEducation={handleRemoveEducation}
            />

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
              onExportMau07={handleExportMau07}
              onSubmitVerification={handleSubmitVerification}
            />

            {/* Section 7: SkillRadarChart Component */}
            <SkillRadarChart
              grades={cvData.grades}
              selectedGrades={selectedGrades}
            />

            {/* Section 8: Certification */}
            <CertForm
              certifications={cvData.certifications || []}
              onAddCert={handleAddCert}
              onRemoveCert={handleRemoveCert}
            />

            {/* Section 9: Activities */}
            <div style={{ paddingBottom: "16px" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "12px",
                  color: "#22C55E",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkle size={18} />
                <span>9. Hoạt động ngoại khóa</span>
              </h3>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nhập hoạt động..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
                />
                <button
                  className="btn-icon-text primary"
                  onClick={handleAddActivity}
                  style={{ padding: "0 16px" }}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {cvData.activities.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--color-border)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem" }}>{act}</span>
                    <button
                      onClick={() => handleRemoveActivity(act)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                      }}
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
          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            {/* Flexible Viewer Toolbar */}
            <div className="cv-viewer-toolbar">
              <div className="cv-viewer-toolbar-title">
                <FileText size={18} />
                <span>CV Live Preview</span>
              </div>
              <div className="cv-viewer-controls">
                {/* Language Toggle */}
                <button
                  className="cv-zoom-btn"
                  onClick={() => setCvLang((prev) => (prev === "vi" ? "en" : "vi"))}
                  title={cvLang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
                  style={{ minWidth: "48px" }}
                >
                  <span>{cvLang === "vi" ? "EN" : "VI"}</span>
                </button>
                {cvLang === "en" && isTranslating && (
                  <span
                    className="cv-zoom-label"
                    style={{ fontStyle: "italic", color: "#94A3B8" }}
                  >
                    Đang dịch...
                  </span>
                )}
                <button
                  className="cv-zoom-btn"
                  onClick={handleZoomOut}
                  title="Thu nhỏ (Zoom Out)"
                >
                  <MagnifyingGlassMinus size={14} />
                  <span>−</span>
                </button>
                <span className="cv-zoom-label">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  className="cv-zoom-btn"
                  onClick={handleZoomIn}
                  title="Phóng to (Zoom In)"
                >
                  <MagnifyingGlassPlus size={14} />
                  <span>+</span>
                </button>
                <button
                  className="cv-zoom-btn"
                  onClick={handleZoomReset}
                  title="Mặc định (75%)"
                >
                  <CornersOut size={14} />
                  <span>Fit</span>
                </button>
              </div>
            </div>

            {/* Scrollable Viewer Container */}
            <div className="cv-viewer-container" ref={viewerContainerRef}>
              <div
                ref={previewWrapperRef}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top center",
                  transition: "transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                <CVPreview
                  cvData={
                    cvLang === "en" && translatedCV ? translatedCV : baseCVData
                  }
                  selectedGrades={selectedGrades}
                  cvLang={cvLang}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {optimizeDraft && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={handleCancelOptimize}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0F172A",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              maxWidth: "720px",
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkle size={18} color="#A78BFA" />
                Xem trước bản CV đã tối ưu ATS
              </h3>
              <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "0.8rem" }}>
                AI không bịa thêm kỹ năng hay nội dung mới — chỉ viết lại & sắp xếp theo JD.
              </p>
            </div>
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              {optimizeRecommendations.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <strong style={{ color: "#A78BFA", fontSize: "0.85rem" }}>
                    Gợi ý cải thiện:
                  </strong>
                  <ul
                    style={{
                      margin: "8px 0 0",
                      paddingLeft: "20px",
                      color: "#E2E8F0",
                      fontSize: "0.82rem",
                    }}
                  >
                    {optimizeRecommendations.map((rec, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <OptimizeDiffBlock
                label="Tóm tắt (Summary)"
                oldValue={cvData.summary}
                newValue={optimizeDraft.summary}
              />
              <OptimizeDiffBlock
                label="Kỹ năng (thứ tự ưu tiên theo JD)"
                oldValue={cvData.skills.join(", ")}
                newValue={optimizeDraft.skills.join(", ")}
              />
              {optimizeDraft.projects.map((np, i) => {
                const p = cvData.projects[i];
                if (!p) return null;
                return (
                  <OptimizeDiffBlock
                    key={`proj-${i}`}
                    label={`Dự án: ${np.name || p.name}`}
                    oldValue={[p.role, p.description].filter(Boolean).join("\n")}
                    newValue={[np.role, np.description]
                      .filter(Boolean)
                      .join("\n")}
                  />
                );
              })}
              {optimizeDraft.experience.map((ne, i) => {
                const e = cvData.experience[i];
                if (!e) return null;
                return (
                  <OptimizeDiffBlock
                    key={`exp-${i}`}
                    label={`Kinh nghiệm: ${ne.company || e.company}`}
                    oldValue={[e.role, e.description].filter(Boolean).join("\n")}
                    newValue={[ne.role, ne.description]
                      .filter(Boolean)
                      .join("\n")}
                  />
                );
              })}
            </div>
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button className="btn-icon-text" onClick={handleCancelOptimize}>
                Hủy
              </button>
              <button
                className="btn-icon-text primary"
                onClick={handleApplyOptimize}
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                  border: "none",
                  color: "#fff",
                }}
              >
                <Check size={16} />
                <span>Áp dụng vào CV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
