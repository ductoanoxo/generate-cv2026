import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import type { CVData, CategorizedSkillGroup } from "../mock/mockData";
import { formatProjectPeriod } from "../mock/mockData";

interface CVPreviewProps {
  cvData: CVData;
  selectedGrades: string[];
  children?: React.ReactNode;
  cvLang?: "vi" | "en";
}

export interface PageSectionItem {
  sectionKey: string;
  titleText: string;
  showTitle: boolean;
  itemIndices: number[];
}

export interface PageContent {
  showHeader: boolean;
  sections: PageSectionItem[];
}

const removeVietnameseDiacritics = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"));

export const getFormattedSkillGroups = (
  cvData: CVData,
): CategorizedSkillGroup[] => {
  if (cvData.categorizedSkills && cvData.categorizedSkills.length > 0) {
    return cvData.categorizedSkills;
  }
  if (!cvData.skills || cvData.skills.length === 0) return [];

  const categories: Record<string, string[]> = {
    "Backend & Programming Skills": [],
    "Databases & Data Management": [],
    "Domain Knowledge": [],
    "DevOps, Tools & Monitoring": [],
    "Business Skills": [],
    "Soft Skills & Methodologies": [],
  };

  cvData.skills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (
      sLower.includes("banking") ||
      sLower.includes("thought machine") ||
      sLower.includes("symbols") ||
      sLower.includes("exchange") ||
      sLower.includes("fx") ||
      sLower.includes("accounting") ||
      sLower.includes("custody") ||
      sLower.includes("laundering") ||
      sLower.includes("aml") ||
      sLower.includes("compliance")
    ) {
      categories["Domain Knowledge"].push(skill);
    } else if (
      sLower.includes("crm") ||
      sLower.includes("lark") ||
      sLower.includes("erp") ||
      sLower.includes("odoo") ||
      sLower.includes("business")
    ) {
      categories["Business Skills"].push(skill);
    } else if (
      sLower.includes("sql") ||
      sLower.includes("db") ||
      sLower.includes("database") ||
      sLower.includes("mongo") ||
      sLower.includes("postgres") ||
      sLower.includes("redis") ||
      sLower.includes("oracle")
    ) {
      categories["Databases & Data Management"].push(skill);
    } else if (
      sLower.includes("docker") ||
      sLower.includes("git") ||
      sLower.includes("ci/cd") ||
      sLower.includes("kubernetes") ||
      sLower.includes("linux") ||
      sLower.includes("aws") ||
      sLower.includes("prometheus") ||
      sLower.includes("grafana") ||
      sLower.includes("figma") ||
      sLower.includes("draw.io") ||
      sLower.includes("tool") ||
      sLower.includes("monitoring") ||
      sLower.includes("alert")
    ) {
      categories["DevOps, Tools & Monitoring"].push(skill);
    } else if (
      sLower.includes("teamwork") ||
      sLower.includes("communication") ||
      sLower.includes("scrum") ||
      sLower.includes("agile") ||
      sLower.includes("giao tiếp") ||
      sLower.includes("tự học") ||
      sLower.includes("giải quyết") ||
      sLower.includes("thích ứng") ||
      sLower.includes("collaboration") ||
      sLower.includes("troubleshooting")
    ) {
      categories["Soft Skills & Methodologies"].push(skill);
    } else {
      categories["Backend & Programming Skills"].push(skill);
    }
  });

  return Object.entries(categories)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({ category, items }));
};

const CVContent: React.FC<{
  cvData: CVData;
  selectedGrades: string[];
  pageConfig?: PageContent;
  cvLang?: "vi" | "en";
}> = ({ cvData, selectedGrades: _selectedGrades, pageConfig, cvLang = "vi" }) => {
  const isEn = cvLang === "en";
  const formattedSkillGroups = getFormattedSkillGroups(cvData);

  const getSecConfig = (key: string) => {
    if (!pageConfig)
      return { exists: true, showTitle: true, itemIndices: null };
    const found = pageConfig.sections.find((s) => s.sectionKey === key);
    if (!found) return { exists: false, showTitle: false, itemIndices: [] };
    return {
      exists: true,
      showTitle: found.showTitle,
      itemIndices: found.itemIndices,
    };
  };

  return (
    <>
      {/* Header (Overleaf IIIT Vadodara Reference Style) */}
      {(!pageConfig || pageConfig.showHeader) && (
        <div
          className="cv-pdf-header-overleaf"
          style={{
            borderBottom: "1.5px solid #000000",
            paddingBottom: "6px",
            marginBottom: "10px",
          }}
        >
          {/* Row 1: Full Name (left) | Phone (right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#000000",
              }}
            >
              {isEn
                ? removeVietnameseDiacritics(
                    cvData.profile.fullName || "NGUYỄN VĂN A",
                  )
                : cvData.profile.fullName || "NGUYỄN VĂN A"}
            </span>
            {cvData.profile.phoneNumber && (
              <span
                style={{
                  fontSize: "0.76rem",
                  color: "#222222",
                  fontWeight: 600,
                }}
              >
                {cvData.profile.phoneNumber}
              </span>
            )}
          </div>

          {/* Row 2: Student Code (left) | Email (right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: "2px",
            }}
          >
            <span
              style={{ fontSize: "0.76rem", color: "#333333", fontWeight: 600 }}
            >
              {cvData.profile.studentCode
                ? `${isEn ? "Student ID: " : "Mã SV: "}${cvData.profile.studentCode}`
                : ""}
            </span>
            {cvData.profile.email && (
              <span style={{ fontSize: "0.76rem", color: "#222222" }}>
                {cvData.profile.email}
              </span>
            )}
          </div>

          {/* Row 3: Major & Faculty (left) */}
          {(cvData.profile.major || cvData.profile.faculty) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "0.76rem",
                  color: "#333333",
                  fontWeight: 600,
                }}
              >
                {isEn ? "Major: " : "Ngành: "}
                {cvData.profile.major}{" "}
                {cvData.profile.faculty
                  ? `• ${isEn ? "Faculty: " : "Khoa: "}${cvData.profile.faculty}`
                  : ""}
              </span>
            </div>
          )}

          {/* Row 4: Institution Name (left) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: "2px",
            }}
          >
            <span
              style={{ fontSize: "0.76rem", color: "#111111", fontWeight: 700 }}
            >
              {isEn ? "Tay Do College" : "Trường Cao đẳng Tây Đô"}
            </span>
          </div>
        </div>
      )}

      {/* 1. Education Section (Placed right after Header) */}
      {getSecConfig("education").exists && (
        <div className="cv-pdf-section" data-section-key="education">
          {getSecConfig("education").showTitle && (
            <div className="cv-pdf-section-title">{isEn ? "EDUCATION" : "HỌC VẤN"}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {(cvData.education && cvData.education.length > 0
              ? cvData.education
              : [
                  {
                    school: isEn ? "Tay Do College" : "Trường Cao đẳng Tây Đô",
                    major: cvData.profile.major
                      ? `${cvData.profile.major}${
                          cvData.profile.faculty
                            ? ` (${cvData.profile.faculty})`
                            : ""
                        }`
                      : isEn
                      ? "Software Engineering"
                      : "Kỹ thuật Phần mềm",
                    period: cvData.profile.academicYear || "",
                    gpa: cvData.profile.gpa > 0 ? cvData.profile.gpa : undefined,
                    degree: isEn ? "College" : "Cao đẳng",
                  },
                ]
            ).map((edu, idx) => {
              const sec = getSecConfig("education");
              if (sec.itemIndices && !sec.itemIndices.includes(idx)) return null;
              return (
                <div key={idx} data-item-idx={idx} style={{ padding: "1px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        color: "#000000",
                      }}
                    >
                      • {edu.school}
                    </span>
                    {edu.period && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#444444",
                          fontWeight: 600,
                        }}
                      >
                        {edu.period}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginTop: "2px",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#222222" }}>
                      {isEn ? "Major: " : "Chuyên ngành: "}
                      {edu.major}{" "}
                      {edu.degree ? `[${edu.degree}]` : ""}
                    </span>
                    {edu.gpa && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#000000",
                        }}
                      >
                        GPA:{" "}
                        {typeof edu.gpa === "number"
                          ? edu.gpa.toFixed(2)
                          : edu.gpa}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* 2. Summary */}
      {cvData.summary && getSecConfig("summary").exists && (
        <div className="cv-pdf-section" data-section-key="summary">
          {getSecConfig("summary").showTitle && (
            <div className="cv-pdf-section-title">{isEn ? "SUMMARY" : "GIỚI THIỆU BẢN THÂN"}</div>
          )}
          <p
            data-item-idx={0}
            style={{
              fontSize: "0.75rem",
              lineHeight: "1.35",
              margin: 0,
              color: "#222222",
            }}
          >
            {cvData.summary}
          </p>
        </div>
      )}

      {/* 3. COMPETENCES / KỸ NĂNG */}
      {formattedSkillGroups.length > 0 &&
        getSecConfig("competences").exists && (
          <div className="cv-pdf-section" data-section-key="competences">
            {getSecConfig("competences").showTitle && (
              <div className="cv-pdf-section-title">
                {isEn ? "SKILLS & TECHNOLOGIES" : "KỸ NĂNG & CÔNG NGHỆ"}
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                marginTop: "2px",
              }}
            >
              {formattedSkillGroups.map((group, idx) => {
                const sec = getSecConfig("competences");
                if (sec.itemIndices && !sec.itemIndices.includes(idx))
                  return null;
                return (
                  <div
                    key={group.category}
                    data-item-idx={idx}
                    style={{
                      fontSize: "0.75rem",
                      color: "#111111",
                      lineHeight: "1.35",
                    }}
                  >
                    <strong style={{ color: "#000000", fontWeight: 700 }}>
                      • {group.category}:
                    </strong>{" "}
                    {group.items.join(", ")}.
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 4. Projects */}
      {cvData.projects &&
        cvData.projects.length > 0 &&
        getSecConfig("projects").exists && (
          <div className="cv-pdf-section" data-section-key="projects">
            {getSecConfig("projects").showTitle && (
              <div className="cv-pdf-section-title">{isEn ? "PERSONAL PROJECTS" : "DỰ ÁN CÁ NHÂN"}</div>
            )}
            <div className="cv-pdf-grid">
              {cvData.projects.map((proj, idx) => {
                const sec = getSecConfig("projects");
                if (sec.itemIndices && !sec.itemIndices.includes(idx))
                  return null;
                const periodStr = formatProjectPeriod(
                  proj.startDate,
                  proj.endDate,
                );
                const descLines = proj.description
                  ? proj.description.split(/\n|(?<=\.)\s+/).filter((l) => l.trim())
                  : [];
                return (
                  <div
                    key={idx}
                    className="cv-pdf-project-card"
                    data-item-idx={idx}
                    style={{ marginBottom: "6px" }}
                  >
                    {/* Row 1: Name (left, bold) | Date range (right) */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span className="cv-pdf-project-title">
                        {proj.name}
                      </span>
                      {periodStr && (
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "#444444",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {periodStr}
                        </span>
                      )}
                    </div>
                    {/* Row 2: Technologies as inline tags */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div
                        style={{
                          fontSize: "0.73rem",
                          color: "#333333",
                          marginTop: "2px",
                        }}
                      >
                        {Array.isArray(proj.technologies)
                          ? proj.technologies.join(", ")
                          : proj.technologies}
                      </div>
                    )}
                    {/* Row 3: Role */}
                    {proj.role && (
                      <div
                        style={{
                          fontSize: "0.73rem",
                          color: "#333333",
                          marginTop: "1px",
                        }}
                      >
                        {proj.role}
                      </div>
                    )}
                    {/* Row 4: Description as bullet points */}
                    {descLines.length > 0 && (
                      <div
                        style={{
                          fontSize: "0.73rem",
                          color: "#222222",
                          marginTop: "2px",
                          lineHeight: "1.4",
                        }}
                      >
                        {descLines.map((line, li) => (
                          <div key={li} style={{ paddingLeft: "12px", position: "relative", marginBottom: "1px" }}>
                            <span style={{ position: "absolute", left: 0, color: "#444" }}>•</span>
                            {line.trim()}
                          </div>
                        ))}
                      </div>
                    )}
                    {proj.githubUrl && (
                      <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.7rem",
                          color: "#1D4ED8",
                          marginTop: "2px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <span>GitHub: </span>
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "inherit", textDecoration: "underline" }}
                        >
                          {proj.githubUrl}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 5. Internship & Work Experience */}
      {cvData.experience &&
        cvData.experience.length > 0 &&
        getSecConfig("experience").exists && (
          <div className="cv-pdf-section" data-section-key="experience">
            {getSecConfig("experience").showTitle && (
              <div className="cv-pdf-section-title">
                {isEn ? "WORK EXPERIENCE & INTERNSHIPS" : "KINH NGHIỆM LÀM VIỆC & THỰC TẬP"}
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              {cvData.experience.map((exp, idx) => {
                const sec = getSecConfig("experience");
                if (sec.itemIndices && !sec.itemIndices.includes(idx))
                  return null;
                return (
                  <div
                    key={idx}
                    data-item-idx={idx}
                    style={{ padding: "2px 0" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          color: "#000000",
                        }}
                      >
                        • {exp.company}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "#555555",
                          fontWeight: 600,
                        }}
                      >
                        {exp.period || ""}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "#111111",
                        fontWeight: 600,
                      }}
                    >
                      {exp.role}
                    </div>
                    {exp.description && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#222222",
                          marginTop: "2px",
                          lineHeight: "1.35",
                        }}
                      >
                        • {exp.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 6. Certifications & Languages (merged) */}
      {(cvData.languages?.length > 0 || cvData.certifications?.length > 0) &&
        getSecConfig("certifications").exists && (
          <div className="cv-pdf-section" data-section-key="certifications">
            {getSecConfig("certifications").showTitle && (
              <div className="cv-pdf-section-title">{isEn ? "CERTIFICATIONS & LANGUAGES" : "CHỨNG CHỈ & NGOẠI NGỮ"}</div>
            )}
            <div
              data-item-idx={0}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "2px",
              }}
            >
              {cvData.languages?.map((lang, idx) => (
                <span key={`lang-${idx}`} className="cv-tag">
                  {lang}
                </span>
              ))}
              {cvData.certifications?.map((cert, idx) => (
                <span key={`cert-${idx}`} className="cv-tag">
                  {cert.certificationName} {cert.date ? `(${cert.date})` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* 7. Extracurricular Activities */}
      {cvData.activities &&
        cvData.activities.length > 0 &&
        getSecConfig("activities").exists && (
          <div className="cv-pdf-section" data-section-key="activities">
            {getSecConfig("activities").showTitle && (
              <div className="cv-pdf-section-title">{isEn ? "EXTRACURRICULAR ACTIVITIES" : "HOẠT ĐỘNG NGOẠI KHÓA"}</div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                fontSize: "0.74rem",
                marginTop: "2px",
              }}
            >
              {cvData.activities.map((act, idx) => {
                const sec = getSecConfig("activities");
                if (sec.itemIndices && !sec.itemIndices.includes(idx))
                  return null;
                return (
                  <div
                    key={idx}
                    data-item-idx={idx}
                    style={{ lineHeight: "1.35" }}
                  >
                    • {act}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </>
  );
};

// Use unscaled layout height (offsetHeight) to prevent CSS transform scale (zoom) from breaking pagination calculations!
function getUnscaledOuterHeight(el: HTMLElement): number {
  const style = window.getComputedStyle(el);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  return el.offsetHeight + marginTop + marginBottom;
}

function getUnscaledSpanHeight(first: HTMLElement, last: HTMLElement): number {
  const firstRect = first.getBoundingClientRect();
  const lastRect = last.getBoundingClientRect();
  return Math.max(0, lastRect.bottom - firstRect.top);
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  cvData,
  selectedGrades,
  children,
  cvLang = "vi",
}) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageContent[]>([
    { showHeader: true, sections: [] },
  ]);

  const calculatePagination = () => {
    if (!measureRef.current) return;
    const measureContainer = measureRef.current.querySelector(
      "#printable-cv",
    ) as HTMLElement;
    if (!measureContainer) return;

    // Calculate exact usable height in unscaled pixels (297mm - 12mm top - 15mm bottom = 270mm)
    // Use a 3mm safety margin (~11px) to guarantee zero clipping at page bottom
    const pxPerMm = measureContainer.offsetWidth / 210;
    if (!pxPerMm || isNaN(pxPerMm)) return;
    const usableHeightPx = (270 - 3) * pxPerMm;

    // Header
    const headerEl = measureContainer.querySelector(
      ".cv-pdf-header-overleaf",
    ) as HTMLElement | null;
    const headerHeight = headerEl ? getUnscaledOuterHeight(headerEl) : 0;

    const computedPages: PageContent[] = [];
    let currentPage: PageContent = { showHeader: false, sections: [] };
    let currentUsedHeight = 0;

    if (headerEl) {
      currentPage.showHeader = true;
      currentUsedHeight = headerHeight;
    }

    const sectionEls = Array.from(
      measureContainer.querySelectorAll(".cv-pdf-section"),
    ) as HTMLElement[];

    for (const sectionEl of sectionEls) {
      const sectionKey = sectionEl.getAttribute("data-section-key") || "";
      const titleEl = sectionEl.querySelector(
        ".cv-pdf-section-title",
      ) as HTMLElement | null;
      const titleText = titleEl?.textContent || "";




      const itemEls = Array.from(
        sectionEl.querySelectorAll("[data-item-idx]"),
      ) as HTMLElement[];

      if (itemEls.length === 0) {
        const secHeight = getUnscaledOuterHeight(sectionEl);

        if (currentUsedHeight + secHeight <= usableHeightPx) {
          currentPage.sections.push({
            sectionKey,
            titleText,
            showTitle: true,
            itemIndices: [0],
          });
          currentUsedHeight += secHeight;
        } else {
          if (currentPage.sections.length > 0 || currentPage.showHeader) {
            computedPages.push(currentPage);
            currentPage = { showHeader: false, sections: [] };
            currentUsedHeight = 0;
          }
          currentPage.sections.push({
            sectionKey,
            titleText,
            showTitle: true,
            itemIndices: [0],
          });
          currentUsedHeight = secHeight;
        }
        continue;
      }

      let isTitlePlaced = false;
      let currentSecItem: PageSectionItem | null = null;
      let previousItemEl: HTMLElement | null = null;
      const sectionMarginBottom =
        parseFloat(window.getComputedStyle(sectionEl).marginBottom) || 0;

      for (let idx = 0; idx < itemEls.length; idx++) {
        const itemEl = itemEls[idx];
        const titleAndItemHeight = titleEl
          ? getUnscaledSpanHeight(titleEl, itemEl)
          : getUnscaledOuterHeight(itemEl);
        // For subsequent items, use bottom-to-bottom distance to avoid double-counting
        const itemHeight = previousItemEl
          ? (itemEl.getBoundingClientRect().bottom - previousItemEl.getBoundingClientRect().bottom)
          : titleAndItemHeight;
        const marginAfterItem =
          idx === itemEls.length - 1 ? sectionMarginBottom : 0;

        if (!isTitlePlaced) {
          // First item in section: Title + Item 0 MUST fit together (anti-orphan title)
          const firstUnitHeight = titleAndItemHeight + marginAfterItem;

          if (currentUsedHeight + firstUnitHeight <= usableHeightPx) {
            currentSecItem = {
              sectionKey,
              titleText,
              showTitle: true,
              itemIndices: [idx],
            };
            currentPage.sections.push(currentSecItem);
            currentUsedHeight += firstUnitHeight;
          } else {
            // Move section to new page
            if (currentPage.sections.length > 0 || currentPage.showHeader) {
              computedPages.push(currentPage);
              currentPage = { showHeader: false, sections: [] };
              currentUsedHeight = 0;
            }
            currentSecItem = {
              sectionKey,
              titleText,
              showTitle: true,
              itemIndices: [idx],
            };
            currentPage.sections.push(currentSecItem);
            currentUsedHeight = firstUnitHeight;
          }
          isTitlePlaced = true;
        } else {
          // Subsequent items in section
          if (currentUsedHeight + itemHeight + marginAfterItem <= usableHeightPx) {
            currentSecItem!.itemIndices.push(idx);
            currentUsedHeight += itemHeight + marginAfterItem;
          } else {
            // Item doesn't fit -> start new page
            computedPages.push(currentPage);
            currentPage = { showHeader: false, sections: [] };
            currentUsedHeight = 0;

            currentSecItem = {
              sectionKey,
              titleText,
              showTitle: true,
              itemIndices: [idx],
            };
            currentPage.sections.push(currentSecItem);
            currentUsedHeight = titleAndItemHeight + marginAfterItem;
          }
        }

        previousItemEl = itemEl;
      }
    }

    if (currentPage.sections.length > 0 || currentPage.showHeader) {
      computedPages.push(currentPage);
    }

    if (computedPages.length > 0) {
      setPages(computedPages);
    }
  };

  useLayoutEffect(() => {
    calculatePagination();
  }, [cvData, selectedGrades, children, cvLang]);

  useEffect(() => {
    let isMounted = true;
    document.fonts.ready.then(() => {
      if (isMounted) {
        calculatePagination();
      }
    });
    window.addEventListener("resize", calculatePagination);
    return () => {
      isMounted = false;
      window.removeEventListener("resize", calculatePagination);
    };
  }, []);

  return (
    <div className="cv-preview-wrapper" style={{ width: "100%" }}>
      {/* Off-screen measurement container & PDF export / print target */}
      <div className="cv-offscreen-measure" ref={measureRef}>
        <div
          id="printable-cv"
          className="cv-a4-sheet-measure"
          style={{ display: "block" }}
        >
          {children || (
            <CVContent cvData={cvData} selectedGrades={selectedGrades} cvLang={cvLang} />
          )}
        </div>
      </div>

      {/* On-screen Paginated A4 Sheets Stack */}
      <div className="cv-preview" aria-label="Bản xem trước CV khổ A4">
        <div className="cv-paginated-stack">
          {pages.map((pageConfig, pageIndex) => (
            <div key={pageIndex} className="cv-a4-sheet">
              <div style={{ display: "block" }}>
                <CVContent
                  cvData={cvData}
                  selectedGrades={selectedGrades}
                  pageConfig={pageConfig}
                  cvLang={cvLang}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
