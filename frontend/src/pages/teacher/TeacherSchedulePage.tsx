import React, { useState, useEffect } from "react";
import { Calendar, Cloud } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

interface SubjectSchedule {
  id: string;
  subjectName: string;
  classCode: string;
  room: string;
  dayOfWeek: number; // 2 to 8 (2 = Monday, 8 = Sunday)
  slotStart: number; // 1 to 12
  slotEnd: number;
  teacherName: string;
  startDateTime?: string;
}

interface Semester {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface Week {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

export const TeacherSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for custom dropdown visibility
  const [isSemOpen, setIsSemOpen] = useState<boolean>(false);
  const [isWeekOpen, setIsWeekOpen] = useState<boolean>(false);

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("#semester-dropdown-container") &&
        !target.closest("#week-dropdown-container")
      ) {
        setIsSemOpen(false);
        setIsWeekOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to generate weeks dynamically from start and end dates
  const generateWeeks = (startStr: string, endStr: string): Week[] => {
    if (!startStr || !endStr) return [];
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    // Set to Monday of the starting week
    const startDay = start.getDay();
    const diffToMonday = startDay === 0 ? -6 : 1 - startDay;
    const monday = new Date(start);
    monday.setDate(start.getDate() + diffToMonday);

    const weekList: Week[] = [];
    let currentMonday = new Date(monday);
    let weekNum = 1;

    // Safety ceiling of 35 weeks to prevent infinite loops on malformed date ranges
    while (currentMonday <= end && weekNum <= 35) {
      const currentSunday = new Date(currentMonday);
      currentSunday.setDate(currentMonday.getDate() + 6);

      const format = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      weekList.push({
        weekNumber: weekNum,
        startDate: new Date(currentMonday),
        endDate: new Date(currentSunday),
        label: `Tuần ${String(weekNum).padStart(2, "0")} [từ ${format(currentMonday)} đến ${format(currentSunday)}]`,
      });

      currentMonday.setDate(currentMonday.getDate() + 7);
      weekNum++;
    }
    return weekList;
  };

  // 1. Fetch unique Semesters first
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setErrorMsg(null);
        const response = await axios.get<any[]>(
          "http://localhost:5000/api/schedule/semesters",
        );
        // Normalize properties to support both camelCase and PascalCase
        const normalizedSemesters: Semester[] = response.data.map((s) => ({
          id: s.id || s.Id,
          name: s.name || s.Name,
          isActive: s.isActive !== undefined ? s.isActive : s.IsActive,
          startDate: s.startDate || s.StartDate,
          endDate: s.endDate || s.EndDate,
        }));

        setSemesters(normalizedSemesters);
        const active = normalizedSemesters.find((s) => s.isActive);
        if (active) {
          setSelectedSemester(active.id);
        } else if (normalizedSemesters.length > 0) {
          setSelectedSemester(normalizedSemesters[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch semesters from backend:", err);
        setErrorMsg("Không thể kết nối cơ sở dữ liệu để tải danh sách học kỳ.");
      }
    };

    fetchSemesters();
  }, []);

  // 2. Update weeks list and auto-select current week when selected semester changes
  useEffect(() => {
    if (!selectedSemester || semesters.length === 0) return;

    const sem = semesters.find(
      (s) => s.id.toLowerCase() === selectedSemester.toLowerCase(),
    );
    if (sem) {
      const startStr = sem.startDate || "";
      const endStr = sem.endDate || "";

      const generated = generateWeeks(startStr, endStr);
      setWeeks(generated);

      // Auto-select current week if it falls within the semester, otherwise week 1
      const today = new Date();
      const todayTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();

      const currentWeek = generated.find((w) => {
        const start = new Date(
          w.startDate.getFullYear(),
          w.startDate.getMonth(),
          w.startDate.getDate(),
        ).getTime();
        const end = new Date(
          w.endDate.getFullYear(),
          w.endDate.getMonth(),
          w.endDate.getDate(),
        ).getTime();
        return todayTime >= start && todayTime <= end;
      });

      if (currentWeek) {
        setSelectedWeekNum(currentWeek.weekNumber);
      } else {
        setSelectedWeekNum(1);
      }
    }
  }, [selectedSemester, semesters]);

  // 3. Fetch Schedule based on selected semester
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const teacherId = user?.id;
        if (!teacherId) {
          setErrorMsg("Vui lòng đăng nhập lại để xác thực quyền giảng viên.");
          setLoading(false);
          return;
        }

        // Only append query param if selectedSemester is valid
        const url = selectedSemester
          ? `http://localhost:5000/api/schedule/teacher/${teacherId}?semesterId=${selectedSemester}`
          : `http://localhost:5000/api/schedule/teacher/${teacherId}`;

        const response = await axios.get<any[]>(url);
        // Normalize schedule properties (camelCase vs PascalCase)
        const normalizedSchedules: SubjectSchedule[] = response.data.map(
          (s) => ({
            id: s.id || s.Id,
            subjectName: s.subjectName || s.SubjectName,
            classCode: s.classCode || s.ClassCode,
            room: s.room || s.Room,
            dayOfWeek: s.dayOfWeek !== undefined ? s.dayOfWeek : s.DayOfWeek,
            slotStart: s.slotStart !== undefined ? s.slotStart : s.SlotStart,
            slotEnd: s.slotEnd !== undefined ? s.slotEnd : s.SlotEnd,
            teacherName: s.teacherName || s.TeacherName,
            startDateTime: s.startDateTime || s.StartDateTime,
          }),
        );

        setSchedules(normalizedSchedules);
      } catch (err: any) {
        console.error("Backend schedule API failed:", err);
        setErrorMsg("Không thể tải lịch giảng dạy từ cơ sở dữ liệu.");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSemester) {
      fetchSchedule();
    }
  }, [user, selectedSemester]);

  // Filter schedules that fall within the selected week's date range
  const activeWeekObj = weeks.find((w) => w.weekNumber === selectedWeekNum);

  const displayedSchedules = schedules.filter((sch) => {
    if (!activeWeekObj) return true;

    // Read the date property supporting both camelCase and PascalCase
    const rawDateStr = sch.startDateTime;
    if (!rawDateStr) return true;

    const schDate = new Date(rawDateStr);

    // Normalize to midnight for comparison
    const checkDate = new Date(
      schDate.getFullYear(),
      schDate.getMonth(),
      schDate.getDate(),
    ).getTime();
    const startDate = new Date(
      activeWeekObj.startDate.getFullYear(),
      activeWeekObj.startDate.getMonth(),
      activeWeekObj.startDate.getDate(),
    ).getTime();
    const endDate = new Date(
      activeWeekObj.endDate.getFullYear(),
      activeWeekObj.endDate.getMonth(),
      activeWeekObj.endDate.getDate(),
    ).getTime();

    return checkDate >= startDate && checkDate <= endDate;
  });

  const getSlotDetails = (dayIdx: number, slotNum: number) => {
    const dayOfWeek = dayIdx + 2;
    return displayedSchedules.find(
      (sch) =>
        sch.dayOfWeek === dayOfWeek &&
        slotNum >= sch.slotStart &&
        slotNum <= sch.slotEnd,
    );
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
        <span>Đang tải lịch giảng dạy từ cơ sở dữ liệu...</span>
      </div>
    );
  }

  return (
    <div
      className="panel-card fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {/* API Connection Indicator */}
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
        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
          Tổng số lịch học:{" "}
          <span style={{ color: "#F8FAFC", fontWeight: 600 }}>
            {displayedSchedules.length} tiết
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
          <Calendar size={24} color="#22C55E" />
          <h2>Lịch giảng dạy chi tiết trong tuần</h2>
        </div>

        {/* Custom Styled Selection Dropdowns */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Custom Dropdown 1: Semester */}
          <div
            id="semester-dropdown-container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            <label
              style={{ fontSize: "0.95rem", color: "#94A3B8", fontWeight: 600 }}
            >
              Học kỳ:
            </label>
            <div style={{ position: "relative", width: "280px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsSemOpen(!isSemOpen);
                  setIsWeekOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  outline: "none",
                  transition: "border-color 150ms ease",
                }}
              >
                <span
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {semesters.find(
                    (s) =>
                      s.id.toLowerCase() === selectedSemester.toLowerCase(),
                  )?.name || "Chọn học kỳ"}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748B",
                    transform: isSemOpen ? "rotate(180deg)" : "none",
                    transition: "transform 150ms ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {isSemOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    background: "#0f172a",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)",
                    zIndex: 50,
                    maxHeight: "230px", // Roughly shows 5-6 items, makes rest scrollable
                    overflowY: "auto",
                    padding: "4px",
                  }}
                >
                  {semesters.map((sem) => {
                    const isSelected =
                      sem.id.toLowerCase() === selectedSemester.toLowerCase();
                    return (
                      <div
                        key={sem.id}
                        onClick={() => {
                          setSelectedSemester(sem.id);
                          setIsSemOpen(false);
                        }}
                        style={{
                          padding: "10px 14px", // generous item spacing
                          borderRadius: "6px",
                          fontSize: "0.92rem",
                          color: isSelected ? "#22C55E" : "#E2E8F0",
                          background: isSelected
                            ? "rgba(34, 197, 94, 0.1)"
                            : "transparent",
                          cursor: "pointer",
                          transition: "background 150ms ease, color 150ms ease",
                          marginBottom: "2px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {sem.name} {sem.isActive ? "" : ""}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Custom Dropdown 2: Week */}
          <div
            id="week-dropdown-container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            <label
              style={{ fontSize: "0.95rem", color: "#94A3B8", fontWeight: 600 }}
            >
              Tuần học:
            </label>
            <div style={{ position: "relative", width: "340px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsWeekOpen(!isWeekOpen);
                  setIsSemOpen(false);
                }}
                disabled={weeks.length === 0}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: weeks.length === 0 ? "not-allowed" : "pointer",
                  outline: "none",
                  opacity: weeks.length === 0 ? 0.5 : 1,
                  transition: "border-color 150ms ease",
                }}
              >
                <span
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {weeks.find((w) => w.weekNumber === selectedWeekNum)?.label ||
                    "Chọn tuần học"}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748B",
                    transform: isWeekOpen ? "rotate(180deg)" : "none",
                    transition: "transform 150ms ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {isWeekOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    background: "#0f172a",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)",
                    zIndex: 50,
                    maxHeight: "230px", // Roughly shows 5-6 items, makes rest scrollable
                    overflowY: "auto",
                    padding: "4px",
                  }}
                >
                  {weeks.map((w) => {
                    const isSelected = w.weekNumber === selectedWeekNum;
                    return (
                      <div
                        key={w.weekNumber}
                        onClick={() => {
                          setSelectedWeekNum(w.weekNumber);
                          setIsWeekOpen(false);
                        }}
                        style={{
                          padding: "10px 14px", // generous item spacing
                          borderRadius: "6px",
                          fontSize: "0.92rem",
                          color: isSelected ? "#22C55E" : "#E2E8F0",
                          background: isSelected
                            ? "rgba(34, 197, 94, 0.1)"
                            : "transparent",
                          cursor: "pointer",
                          transition: "background 150ms ease, color 150ms ease",
                          marginBottom: "2px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {w.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="schedule-grid" style={{ marginTop: "16px" }}>
        <div className="schedule-header-cell">Tiết học</div>
        {days.map((day, idx) => (
          <div key={idx} className="schedule-header-cell">
            {day}
          </div>
        ))}

        {slots.map((slot) => (
          <React.Fragment key={slot}>
            <div className="schedule-time-cell">Tiết {slot}</div>
            {days.map((_, dayIdx) => {
              const schedule = getSlotDetails(dayIdx, slot);
              if (schedule) {
                if (schedule.slotStart === slot) {
                  const span = schedule.slotEnd - schedule.slotStart + 1;
                  return (
                    <div
                      key={dayIdx}
                      className="schedule-slot-cell"
                      style={{ gridRow: `span ${span}`, height: "auto" }}
                    >
                      <div className="schedule-slot-occupied">
                        <div className="schedule-slot-title">
                          {schedule.subjectName}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "4px",
                            fontSize: "0.7rem",
                            color: "#94A3B8",
                          }}
                        >
                          <span>Lớp: {schedule.classCode}</span>
                          <span className="schedule-slot-room">
                            {schedule.room}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              } else {
                return <div key={dayIdx} className="schedule-slot-cell" />;
              }
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
