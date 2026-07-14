using backend.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class FacultyDashboardService : IFacultyDashboardService
    {
        private readonly AppDbContext _context;

        public FacultyDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetFacultyStatsAsync(string facultyId)
        {
            if (!Guid.TryParse(facultyId, out var facultyGuid))
            {
                // Fallback / default data
                return new { kpis = new { students = 0, teachers = 0, majors = 0, subjects = 0 }, teachers = Array.Empty<object>(), semesterProgress = 0, classAttendanceRates = Array.Empty<object>(), averageScoresBySubject = Array.Empty<object>(), teacherEvaluations = Array.Empty<object>() };
            }

            // A16: Tối ưu hóa truy vấn bằng cách lọc và đếm trực tiếp trên Database, tránh N+1.
            // 1. KPIs
            var studentsCount = await _context.Students
                .CountAsync(s => !s.IsDeleted && s.Major.FacultyId == facultyGuid && !s.Major.IsDeleted);

            var teachersCount = await _context.TeacherFaculties
                .CountAsync(tf => tf.FacultyId == facultyGuid && !tf.IsDeleted);

            var majorsCount = await _context.Majors
                .CountAsync(m => m.FacultyId == facultyGuid && !m.IsDeleted);

            var subjectsCount = await _context.Subjects
                .CountAsync(s => s.FacultyId == facultyGuid && !s.IsDeleted);

            // 2. Semester Progress (calculated by average done sessions of active classes)
            var teachings = await _context.SubjectTeachings
                .Where(st => st.Subject.FacultyId == facultyGuid && !st.IsDeleted && !st.Subject.IsDeleted)
                .Select(st => new
                {
                    Total = st.TotalSessions,
                    Done = _context.SubjectSchedules.Count(ss => ss.SubjectTeachingId == st.Id && ss.EndDateTime <= DateTime.UtcNow && !ss.IsDeleted)
                })
                .ToListAsync();

            int semesterProgress = 0;
            if (teachings.Any())
            {
                var totalSessions = teachings.Sum(t => t.Total);
                var doneSessions = teachings.Sum(t => t.Done);
                if (totalSessions > 0)
                {
                    semesterProgress = (int)Math.Round((double)doneSessions * 100 / totalSessions);
                }
            }

            // 3. Class Attendance Rates
            // A16: Nhóm trực tiếp ở DB để tính tỷ lệ phần trăm điểm danh của từng lớp.
            var classAttendanceRatesRaw = await _context.Attendances
                .Where(a => a.SubjectSchedule.SubjectTeaching.Subject.FacultyId == facultyGuid
                            && !a.SubjectSchedule.IsDeleted
                            && !a.SubjectSchedule.SubjectTeaching.IsDeleted
                            && !a.SubjectSchedule.SubjectTeaching.Subject.IsDeleted)
                .GroupBy(a => new { className = a.SubjectSchedule.SubjectTeaching.Name, subjectName = a.SubjectSchedule.SubjectTeaching.Subject.Name })
                .Select(g => new
                {
                    name = g.Key.className + " - " + g.Key.subjectName,
                    present = g.Count(x => x.Status == 1),
                    late = g.Count(x => x.Status == 2),
                    absence = g.Count(x => x.Status == 3 || x.Status == 4),
                    total = g.Count()
                })
                .ToListAsync();

            var classAttendanceRates = classAttendanceRatesRaw.Select(r =>
            {
                double total = r.total > 0 ? r.total : 1.0;
                return new
                {
                    name = r.name,
                    present = Math.Round((r.present / total) * 100),
                    late = Math.Round((r.late / total) * 100),
                    absence = Math.Round((r.absence / total) * 100)
                };
            }).ToList();


            // 4. Average Scores by Subject
            // A16: Tính điểm trung bình các môn học qua kết quả thi của sinh viên khoa.
            var averageScores = await _context.ExamResults
                .Where(r => r.SubjectTeachingExam.SubjectTeaching.Subject.FacultyId == facultyGuid
                            && r.Result != null
                            && !r.IsDeleted
                            && !r.SubjectTeachingExam.IsDeleted
                            && !r.SubjectTeachingExam.SubjectTeaching.IsDeleted
                            && !r.SubjectTeachingExam.SubjectTeaching.Subject.IsDeleted)
                .GroupBy(r => r.SubjectTeachingExam.SubjectTeaching.Subject.Name)
                .Select(g => new
                {
                    name = g.Key,
                    score = Math.Round((double)g.Average(x => x.Result!.Value), 1)
                })
                .ToListAsync();

            var averageScoresBySubject = averageScores.Cast<object>().ToList();

            // 5. Teacher Evaluations
            var evaluationsRaw = await _context.StudentEvaluationDetails
                .Where(d => d.StudentEvaluation!.Teacher!.FacultyId == facultyGuid
                            && d.StudentScore != null
                            && !d.IsDeleted
                            && !d.StudentEvaluation.IsDeleted)
                .GroupBy(d => d.EvaluationName ?? d.EvaluationCriteria!.Name)
                .Select(g => new
                {
                    aspect = g.Key,
                    value = Math.Round((double)g.Average(x => x.StudentScore!.Value), 1)
                })
                .ToListAsync();

            var teacherEvaluations = evaluationsRaw.Cast<object>().ToList();

            // 6. Faculty Teachers (nested in stats for easier consumption)
            var teachers = await GetFacultyTeachersInternalAsync(facultyGuid);

            return new
            {
                kpis = new
                {
                    students = studentsCount,
                    teachers = teachersCount,
                    majors = majorsCount,
                    subjects = subjectsCount
                },
                teachers,
                semesterProgress,
                classAttendanceRates,
                averageScoresBySubject,
                teacherEvaluations
            };
        }

        public async Task<IEnumerable<object>> GetFacultyTeachersAsync(string facultyId)
        {
            if (!Guid.TryParse(facultyId, out var facultyGuid))
            {
                return Array.Empty<object>();
            }
            return await GetFacultyTeachersInternalAsync(facultyGuid);
        }

        public async Task<object> GetFacultyAttendanceRatesAsync(string facultyId)
        {
            if (!Guid.TryParse(facultyId, out var facultyGuid))
            {
                return new { Present = 95, Late = 2, Absence = 3 };
            }

            // A16: Eagerly load and aggregate directly in one SQL call
            var attendanceGroups = await _context.Attendances
                .Where(a => a.SubjectSchedule.SubjectTeaching.Subject.FacultyId == facultyGuid
                            && !a.SubjectSchedule.IsDeleted
                            && !a.SubjectSchedule.SubjectTeaching.IsDeleted)
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            int presentCount = attendanceGroups.FirstOrDefault(g => g.Status == 1)?.Count ?? 0;
            int lateCount = attendanceGroups.FirstOrDefault(g => g.Status == 2)?.Count ?? 0;
            int absenceCount = attendanceGroups.Where(g => g.Status == 3 || g.Status == 4).Sum(g => g.Count);
            int total = presentCount + lateCount + absenceCount;

            if (total > 0)
            {
                return new
                {
                    Present = Math.Round((double)presentCount * 100 / total),
                    Late = Math.Round((double)lateCount * 100 / total),
                    Absence = Math.Round((double)absenceCount * 100 / total)
                };
            }
            return new { Present = 0, Late = 0, Absence = 0 };
        }

        private async Task<IEnumerable<object>> GetFacultyTeachersInternalAsync(Guid facultyGuid)
        {
            var teachers = await _context.TeacherFaculties
                .Include(tf => tf.User)
                .Where(tf => tf.FacultyId == facultyGuid && !tf.IsDeleted && !tf.User.IsDeleted)
                .Select(tf => new
                {
                    name = tf.User.FullName,
                    title = tf.IsHeadOfFaculty 
                        ? "Trưởng Khoa / GV" 
                        : (tf.User.Role == 2 ? "Giảng viên thỉnh giảng" : "Giảng viên"),
                    email = $"{tf.User.UserName}@taydo.edu.vn",
                    isHead = tf.IsHeadOfFaculty
                })
                .ToListAsync();

            if (!teachers.Any())
            {
                return Array.Empty<object>();
            }

            return teachers;
        }

        private object GetDefaultFacultyStats()
        {
            return new
            {
                kpis = new { students = 180, teachers = 15, majors = 3, subjects = 45 },
                teachers = GetDefaultTeachers(),
                semesterProgress = 80,
                classAttendanceRates = new List<object>
                {
                    new { name = "IT21A - Lập trình C", present = 95, late = 2, absence = 3 },
                    new { name = "IT21B - Cơ sở dữ liệu", present = 91, late = 3, absence = 6 },
                    new { name = "IT21A - Web nâng cao", present = 93, late = 1, absence = 6 },
                    new { name = "IT20A - Kỹ thuật PM", present = 88, late = 5, absence = 7 }
                },
                averageScoresBySubject = new List<object>
                {
                    new { name = "Kỹ thuật lập trình C", score = 7.2 },
                    new { name = "Cơ sở dữ liệu", score = 6.8 },
                    new { name = "Lập trình Web nâng cao", score = 7.5 },
                    new { name = "Phân tích & thiết kế HT", score = 7.0 },
                    new { name = "Kỹ thuật phần mềm", score = 7.4 }
                },
                teacherEvaluations = new List<object>
                {
                    new { aspect = "Kiến thức chuyên môn", value = 4.8 },
                    new { aspect = "Phương pháp sư phạm", value = 4.5 },
                    new { aspect = "Tương tác & hỗ trợ", value = 4.6 },
                    new { aspect = "Đúng giờ & kỷ luật", value = 4.9 },
                    new { aspect = "Tính rõ ràng của bài giảng", value = 4.4 }
                }
            };
        }

        private IEnumerable<object> GetDefaultTeachers()
        {
            return new List<object>
            {
                new { name = "TS. Trần Minh Khoa", title = "Trưởng Khoa / GV", isHead = true, email = "tmkhoa@taydo.edu.vn" },
                new { name = "ThS. Nguyễn Thị Trưởng", title = "Trưởng Bộ môn / GV", isHead = false, email = "nttruong@taydo.edu.vn" },
                new { name = "ThS. Lê Hoàng Nam", title = "Giảng viên", isHead = false, email = "lhnam@taydo.edu.vn" },
                new { name = "ThS. Phạm Thanh Sơn", title = "Giảng viên", isHead = false, email = "ptson@taydo.edu.vn" },
                new { name = "Cô Nguyễn Bích Liên", title = "Giảng viên thỉnh giảng", isHead = false, email = "nblien@taydo.edu.vn" }
            };
        }
    }
}
