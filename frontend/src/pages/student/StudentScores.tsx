import React, { useState, useEffect } from "react";
import { Notebook, Cloud, Eye } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

interface ComponentScore {
  componentName: string;
  score: number | null;
  weight: number;
}

interface SubjectScore {
  subjectName: string;
  subjectCode: string;
  creditPoint: number;
  result: number | null;
  combinedResult: number | null;
  gradeBand: string;
  gradeC: string;
  grade4: number;
  resultIcon: string; // "✓" hoặc "✗"
  detailAction: string; // "view"
  components: ComponentScore[];
}

interface SemesterScore {
  semesterName: string;
  academicYear: string;
  subjects: SubjectScore[];
  semesterGpa: number | null;
}

export const StudentScores: React.FC = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<SemesterScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedSubjectDetail, setSelectedSubjectDetail] =
    useState<SubjectScore | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        if (!user?.id) {
          setErrorMsg("Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }
        const response = await axios.get<SemesterScore[]>(
          `http://localhost:5000/api/student/scores?studentId=${user.id}`,
        );
        setScores(response.data);
      } catch (err) {
        setErrorMsg("Không thể kết nối cơ sở dữ liệu để tải bảng điểm.");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [user]);

  const semesters = ["all", ...scores.map((s) => s.semesterName)];

  const filteredScores =
    selectedSemester === "all"
      ? scores
      : scores.filter((s) => s.semesterName === selectedSemester);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "inherit";
    if (score >= 8.0) return "#22C55E";
    if (score >= 5.0) return "#3B82F6";
    return "#EF4444";
  };

  const getGradeCColor = (gradeC: string) => {
    switch (gradeC) {
      case "A":
        return "#22C55E";
      case "B":
        return "#3B82F6";
      case "C":
        return "#EAB308";
      case "D":
        return "#F97316";
      case "F":
        return "#EF4444";
      default:
        return "inherit";
    }
  };

  const handleViewDetail = (subject: SubjectScore) => {
    setSelectedSubjectDetail(subject);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: "#22C55E",
          fontWeight: 600,
        }}
      >
        <div
          className="spinner"
          style={{
            border: "3px solid rgba(34, 197, 94, 0.1)",
            borderTop: "3px solid #22C55E",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <span>Đang tải bảng điểm từ cơ sở dữ liệu...</span>
      </div>
    );
  }

  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xl)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(30, 41, 59, 0.5)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "8px 16px",
        }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>Trạng thái kết nối:</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#22C55E",
              fontWeight: 600,
            }}
          >
            <Cloud size={16} /> Đã kết nối Cơ sở dữ liệu Supabase (API .NET 8)
          </span>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "12px",
            borderRadius: "6px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #EF4444",
            color: "#FCA5A5",
            fontSize: "0.85rem",
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        className="panel-header"
        style={{
          border: "none",
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Notebook size={24} color="#22C55E" />
          <h2>Xem điểm qua từng học kỳ</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{ fontSize: "0.95rem", color: "#94A3B8", fontWeight: 600 }}
          >
            Lọc theo học kỳ:
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              background: "#0f172a",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.95rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {semesters.map((sem, idx) => (
              <option key={idx} value={sem}>
                {sem === "all" ? "Tất cả học kỳ" : sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredScores.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "rgba(30, 41, 59, 0.2)",
            border: "1px dashed var(--color-border)",
            borderRadius: "12px",
            color: "#94A3B8",
            fontSize: "1rem",
          }}
        >
          Chưa có dữ liệu điểm
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xl)",
            maxHeight: "550px",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        >
          {filteredScores.map((sem, sIdx) => (
            <div key={sIdx} className="panel-card">
              <div
                className="panel-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#F8FAFC",
                  }}
                >
                  {sem.semesterName}
                </h3>
                {sem.semesterGpa !== null && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", color: "#94A3B8" }}>
                      GPA học kỳ:
                    </span>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: getScoreColor(sem.semesterGpa),
                      }}
                    >
                      {sem.semesterGpa.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {sem.subjects.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    color: "#94A3B8",
                    textAlign: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  Không có môn học nào được ghi nhận điểm
                </div>
              ) : (
                <div
                  className="data-table-container"
                  style={{ marginTop: "16px" }}
                >
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px", textAlign: "center" }}>
                          STT
                        </th>
                        <th>Mã môn</th>
                        <th>Tên môn học</th>
                        <th style={{ textAlign: "center" }}>Số tín chỉ</th>
                        <th style={{ textAlign: "center" }}>Điểm TK (10)</th>
                        <th style={{ textAlign: "center" }}>Điểm TK (4)</th>
                        <th style={{ textAlign: "center" }}>Điểm TK (C)</th>
                        <th style={{ textAlign: "center" }}>Kết quả</th>
                        <th style={{ textAlign: "center", width: "50px" }}>
                          Chi tiết
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.subjects.map((sub, idx) => (
                        <tr key={idx}>
                          <td style={{ textAlign: "center", color: "#64748B" }}>
                            {idx + 1}
                          </td>
                          <td
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 600,
                            }}
                          >
                            {sub.subjectCode}
                          </td>
                          <td style={{ fontWeight: 600 }}>{sub.subjectName}</td>
                          <td style={{ textAlign: "center" }}>
                            {sub.creditPoint}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontFamily: "var(--font-heading)",
                              fontWeight: 700,
                              color: getScoreColor(sub.combinedResult),
                            }}
                          >
                            {sub.combinedResult !== null
                              ? sub.combinedResult.toFixed(1)
                              : "-"}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontFamily: "var(--font-heading)",
                              fontWeight: 700,
                              color: "#3B82F6",
                            }}
                          >
                            {sub.grade4 > 0 ? sub.grade4.toFixed(1) : "-"}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 600,
                              color: getGradeCColor(sub.gradeC),
                            }}
                          >
                            {sub.gradeC}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              color:
                                sub.resultIcon === "✗"
                                  ? "#EF4444"
                                  : sub.resultIcon === "-"
                                    ? "inherit"
                                    : "#22C55E",
                            }}
                          >
                            {sub.resultIcon}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              onClick={() => handleViewDetail(sub)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3B82F6",
                                transition: "color 0.2s, transform 0.2s",
                                padding: 0,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#60A5FA";
                                e.currentTarget.style.transform = "scale(1.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#3B82F6";
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                              title="Xem chi tiết"
                            >
                              <Eye size={18} weight="bold" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedSubjectDetail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedSubjectDetail(null)}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#F8FAFC",
                  margin: 0,
                }}
              >
                Chi tiết điểm môn học
              </h3>
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#3B82F6",
                  marginBottom: "4px",
                }}
              >
                {selectedSubjectDetail.subjectName}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                Mã môn:{" "}
                <span style={{ color: "#F1F5F9", fontWeight: 500 }}>
                  {selectedSubjectDetail.subjectCode}
                </span>{" "}
                | Số tín chỉ:{" "}
                <span style={{ color: "#F1F5F9", fontWeight: 500 }}>
                  {selectedSubjectDetail.creditPoint}
                </span>
              </div>
            </div>

            <div
              style={{
                overflowX: "auto",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "rgba(30, 41, 59, 0.5)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 12px",
                        color: "#94A3B8",
                        fontWeight: 600,
                      }}
                    >
                      Thành phần điểm
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        color: "#94A3B8",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      Điểm số
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubjectDetail.components &&
                  selectedSubjectDetail.components.length > 0 ? (
                    selectedSubjectDetail.components.map((comp, cIdx) => (
                      <tr
                        key={cIdx}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td style={{ padding: "10px 12px", color: "#E2E8F0" }}>
                          {comp.componentName}
                          {comp.weight > 0 && (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "#94A3B8",
                                marginLeft: "6px",
                              }}
                            >
                              ({(comp.weight * 100).toFixed(0)}%)
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            color: "#F1F5F9",
                            fontWeight: 700,
                            textAlign: "center",
                            fontFamily: "var(--font-heading)",
                          }}
                        >
                          {comp.score !== null ? comp.score.toFixed(1) : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          padding: "16px",
                          color: "#94A3B8",
                          textAlign: "center",
                        }}
                      >
                        Không có điểm thành phần
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "8px",
                padding: "12px 16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#94A3B8",
                  fontWeight: 500,
                }}
              >
                Điểm tổng kết:
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: getScoreColor(selectedSubjectDetail.combinedResult),
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {selectedSubjectDetail.combinedResult !== null
                    ? selectedSubjectDetail.combinedResult.toFixed(1)
                    : "-"}
                </span>
                {/* {selectedSubjectDetail.gradeC !== "N/A" && (
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#3B82F6",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Hệ C: {selectedSubjectDetail.gradeC} | Hệ 4:{" "}
                    {selectedSubjectDetail.grade4}
                  </span>
                )} */}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                style={{
                  background: "#3B82F6",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563EB")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3B82F6")
                }
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
