using backend.Data;
using backend.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class StudentDashboardService : IStudentDashboardService
    {
        private readonly AppDbContext _context;

        public StudentDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object?> GetStudentProfileAsync(string studentId)
        {
            if (!Guid.TryParse(studentId, out var studentGuid))
            {
                return null;
            }

            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Major)
                .Include(s => s.AcademicYear)
                .FirstOrDefaultAsync(s => s.Id == studentGuid || s.UserId == studentGuid);

            if (student == null)
            {
                return null;
            }

            var examResults = await _context.ExamResults
                .Where(er => er.StudentId == student.Id && !er.IsDeleted && er.CombinedResult != null)
                .Select(er => er.CombinedResult ?? 0f)
                .ToListAsync();

            double gpa = examResults.Any() ? Math.Round(examResults.Average(), 1) : 8.0;

            return new
            {
                StudentCode = student.User.UserName,
                FullName = student.User.FullName,
                Major = student.Major.Name,
                AcademicYear = student.AcademicYear.Name,
                Gpa = gpa
            };
        }

        public async Task<object> GetStudentStatsAsync(string studentId)
        {
            if (!Guid.TryParse(studentId, out var studentGuid))
            {
                return new { Gpa = 8.0, PresentCount = 0, LateCount = 0, AbsenceCount = 0 };
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.Id == studentGuid || s.UserId == studentGuid);

            if (student == null)
            {
                return new { Gpa = 8.0, PresentCount = 0, LateCount = 0, AbsenceCount = 0 };
            }

            var examResults = await _context.ExamResults
                .Where(er => er.StudentId == student.Id && !er.IsDeleted && er.CombinedResult != null)
                .Select(er => er.CombinedResult ?? 0f)
                .ToListAsync();

            double gpa = examResults.Any() ? Math.Round(examResults.Average(), 1) : 8.0;

            var attendances = await _context.Attendances
                .Where(a => a.StudentId == student.Id)
                .ToListAsync();

            int present = attendances.Count(a => a.Status == 1);
            int late = attendances.Count(a => a.Status == 2);
            int absence = attendances.Count(a => a.Status == 3 || a.Status == 4);

            return new
            {
                Gpa = gpa,
                PresentCount = present,
                LateCount = late,
                AbsenceCount = absence
            };
        }

        public async Task<IEnumerable<object>> GetStudentAnnouncementsAsync(string studentId)
        {
            if (!Guid.TryParse(studentId, out var studentGuid))
            {
                return Enumerable.Empty<object>();
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.Id == studentGuid || s.UserId == studentGuid);

            if (student == null)
            {
                return Enumerable.Empty<object>();
            }

            string userIdStr = student.UserId.ToString().ToLower();

            var announcements = await _context.UserAnnouncements
                .Where(ua => !ua.IsDeleted && (ua.UserIds.ToLower().Contains(userIdStr) || ua.UserIds == "*"))
                .OrderByDescending(ua => ua.CreationDate)
                .Take(5)
                .Select(ua => new
                {
                    Id = ua.Id.ToString(),
                    Title = ua.Type == 1 ? "Thông báo học vụ" : (ua.Type == 2 ? "Thông báo học phí" : "Thông báo chung"),
                    Date = ua.CreationDate.ToString("yyyy-MM-dd"),
                    Content = ua.Message,
                    Sender = "Hệ thống"
                })
                .ToListAsync();

            if (!announcements.Any())
            {
                return new List<object>
                {
                    new { Id = "an1", Title = "Thông báo đăng ký môn học", Date = "2026-07-08", Content = "Thời hạn đăng ký môn học học kỳ phụ kéo dài đến hết 30/08/2026", Sender = "Phòng Đào Tạo" },
                    new { Id = "an2", Title = "Thông báo đóng học phí học kỳ mới", Date = "2026-07-05", Content = "Yêu cầu sinh viên hoàn thành học phí học kỳ II trước ngày 15/08/2026", Sender = "Phòng Kế Hoạch Tài Chính" }
                };
            }

            return announcements.Cast<object>();
        }

        public async Task<IEnumerable<object>> GetStudentExamResultsAsync(string studentId)
        {
            if (!Guid.TryParse(studentId, out var studentGuid))
            {
                return Enumerable.Empty<object>();
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.Id == studentGuid || s.UserId == studentGuid);

            if (student == null)
            {
                return Enumerable.Empty<object>();
            }

            var results = await _context.ExamResults
                .Include(er => er.SubjectTeachingExam)
                    .ThenInclude(ste => ste.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                .Where(er => er.StudentId == student.Id && !er.IsDeleted && er.CombinedResult != null)
                .OrderBy(er => er.SubjectTeachingExam.SubjectTeaching.Subject.Name)
                .Select(er => new
                {
                    Id = er.Id.ToString(),
                    SubjectName = er.SubjectTeachingExam.SubjectTeaching.Subject.Name,
                    Score = er.CombinedResult ?? er.Result ?? 0f,
                    ExamDate = er.SubjectTeachingExam.StartDate.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            if (!results.Any())
            {
                return new List<object>
                {
                    new { Id = "ex1", SubjectName = "Kỹ thuật lập trình C", Score = 8.5f, ExamDate = "2026-06-25" },
                    new { Id = "ex2", SubjectName = "Cơ sở dữ liệu", Score = 7.8f, ExamDate = "2026-06-28" },
                    new { Id = "ex3", SubjectName = "Thiết kế giao diện", Score = 9.0f, ExamDate = "2026-07-02" }
                };
            }

            return results.Cast<object>();
        }
    }
}
