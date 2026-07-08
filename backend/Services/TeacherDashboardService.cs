// using backend.DTOs.Teacher;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;

// namespace backend.Services
// {
//     public class TeacherDashboardService : ITeacherDashboardService
//     {
//         // For Week 1, we return robust mock data that aligns perfectly with the Master Plan and the Frontend.
//         // Once the DB schema is scaffolded by Dev A, this service can be updated to query AppDbContext.
        
//         public Task<TeacherDashboardDto> GetTeacherStatsAsync(Guid teacherId)
//         {
//             var classes = GetMockClasses(teacherId);
//             var schedules = GetMockSchedules(teacherId);
//             var alerts = GetMockAlerts(teacherId);
            
//             var dto = new TeacherDashboardDto
//             {
//                 ClassesCount = classes.Count,
//                 TodaySlotsCount = schedules.Where(s => s.DayOfWeek == (int)DateTime.Now.DayOfWeek + 1).Sum(s => s.SlotEnd - s.SlotStart + 1),
//                 AlertStudentsCount = alerts.Count,
//                 Classes = classes,
//                 TodaySchedules = schedules,
//                 AlertStudents = alerts,
//                 AttendanceStats = new List<AttendanceStatDto>
//                 {
//                     new() { Name = "Có mặt", Value = 38, Color = "#22C55E" },
//                     new() { Name = "Đi trễ", Value = 4, Color = "#EAB308" },
//                     new() { Name = "Vắng có phép", Value = 2, Color = "#3B82F6" },
//                     new() { Name = "Vắng không phép", Value = 1, Color = "#EF4444" }
//                 }
//             };

//             return Task.FromResult(dto);
//         }

//         public Task<IEnumerable<TeacherClassDto>> GetClassesTaughtAsync(Guid teacherId)
//         {
//             var classes = GetMockClasses(teacherId);
//             return Task.FromResult<IEnumerable<TeacherClassDto>>(classes);
//         }

//         public Task<IEnumerable<AlertStudentDto>> GetAlertStudentsAsync(Guid teacherId)
//         {
//             var alerts = GetMockAlerts(teacherId);
//             return Task.FromResult<IEnumerable<AlertStudentDto>>(alerts);
//         }

//         public Task<IEnumerable<QuestionSuiteDto>> GetQuestionSuitesAsync(Guid teacherId)
//         {
//             var suites = GetMockQuestionSuites(teacherId);
//             return Task.FromResult<IEnumerable<QuestionSuiteDto>>(suites);
//         }

//         private List<TeacherClassDto> GetMockClasses(Guid teacherId)
//         {
//             return new List<TeacherClassDto>
//             {
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000001"),
//                     SubjectCode = "IT101",
//                     SubjectName = "Kỹ thuật lập trình C",
//                     ClassCode = "IT21A",
//                     TotalSessions = 15,
//                     CompletedSessions = 12,
//                     StudentsCount = 45
//                 },
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000002"),
//                     SubjectCode = "IT201",
//                     SubjectName = "Lập trình Web nâng cao",
//                     ClassCode = "IT21A",
//                     TotalSessions = 15,
//                     CompletedSessions = 9,
//                     StudentsCount = 45
//                 }
//             };
//         }

//         private List<TeacherScheduleDto> GetMockSchedules(Guid teacherId)
//         {
//             return new List<TeacherScheduleDto>
//             {
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000003"),
//                     SubjectName = "Kỹ thuật lập trình C",
//                     ClassCode = "IT21A",
//                     Room = "A201",
//                     DayOfWeek = 2, // Monday
//                     SlotStart = 1,
//                     SlotEnd = 4
//                 },
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000004"),
//                     SubjectName = "Kỹ thuật lập trình C",
//                     ClassCode = "IT21A",
//                     Room = "B203",
//                     DayOfWeek = 3, // Tuesday
//                     SlotStart = 5,
//                     SlotEnd = 8
//                 },
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000004"),
//                     SubjectName = "Lập trình Web nâng cao",
//                     ClassCode = "IT21A",
//                     Room = "A201",
//                     DayOfWeek = 4, // Wednesday
//                     SlotStart = 5,
//                     SlotEnd = 8
//                 },
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000004"),
//                     SubjectName = "Lập trình Web nâng cao",
//                     ClassCode = "IT21A",
//                     Room = "A201",
//                     DayOfWeek = 5, // Thursday
//                     SlotStart = 1,
//                     SlotEnd = 4
//                 }
//             }.Where(s => s.DayOfWeek == (int)DateTime.Now.DayOfWeek + 1).ToList(); // Filter for today's schedules
//         }

//         private List<AlertStudentDto> GetMockAlerts(Guid teacherId)
//         {
//             return new List<AlertStudentDto>
//             {
//                 new() { Name = "Trần Văn An", ClassCode = "IT21A", Reason = "Vắng 4 buổi không phép", Status = "Warning" },
//                 new() { Name = "Lê Thị Bình", ClassCode = "IT21A", Reason = "GPA < 5.0 (Cần chú ý)", Status = "Notice" },
//                 new() { Name = "Phạm Minh Đức", ClassCode = "IT21B", Reason = "Vắng 3 buổi liên tiếp", Status = "Warning" }
//             };
//         }

//         private List<QuestionSuiteDto> GetMockQuestionSuites(Guid teacherId)
//         {
//             return new List<QuestionSuiteDto>
//             {
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000005"),
//                     SubjectCode = "IT101",
//                     SubjectName = "Kỹ thuật lập trình C",
//                     EasyCount = 120,
//                     NormalCount = 95,
//                     HardCount = 45,
//                     LastUpdated = DateTime.Parse("2026-06-15")
//                 },
//                 new()
//                 {
//                     Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000006"),
//                     SubjectCode = "IT201",
//                     SubjectName = "Lập trình Web nâng cao",
//                     EasyCount = 90,
//                     NormalCount = 80,
//                     HardCount = 30,
//                     LastUpdated = DateTime.Parse("2026-06-22")
//                 }
//             };
//         }
//     }
// }


using backend.DTOs.Teacher;
using backend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TeacherDashboardService : ITeacherDashboardService
    {
        private readonly AppDbContext _context;

        public TeacherDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TeacherDashboardDto> GetTeacherStatsAsync(Guid teacherId)
        {
            // Map the User ID to TeacherFaculty ID(s)
            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherId && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            var classes = await GetClassesTaughtInternalAsync(teacherFacultyIds);
            var schedules = await GetSchedulesInternalAsync(teacherFacultyIds);
            var alerts = await GetAlertStudentsInternalAsync(teacherFacultyIds, classes.Select(c => c.Id).ToList());

            // Filter schedules for today
            var today = (int)DateTime.Now.DayOfWeek == 0 ? 8 : (int)DateTime.Now.DayOfWeek + 1;
            var todaySchedules = schedules.Where(s => s.DayOfWeek == today).ToList();

            // Calculate attendance stats
            var attendanceStats = await GetAttendanceStatsInternalAsync(classes.Select(c => c.Id).ToList());

            var dto = new TeacherDashboardDto
            {
                ClassesCount = classes.Count,
                TodaySlotsCount = todaySchedules.Sum(s => s.SlotEnd - s.SlotStart + 1),
                AlertStudentsCount = alerts.Count,
                Classes = classes,
                TodaySchedules = todaySchedules,
                AlertStudents = alerts,
                AttendanceStats = attendanceStats
            };

            return dto;
        }

        public async Task<IEnumerable<TeacherClassDto>> GetClassesTaughtAsync(Guid teacherId)
        {
            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherId && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            return await GetClassesTaughtInternalAsync(teacherFacultyIds);
        }

        public async Task<IEnumerable<AlertStudentDto>> GetAlertStudentsAsync(Guid teacherId)
        {
            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherId && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            var classes = await GetClassesTaughtInternalAsync(teacherFacultyIds);
            return await GetAlertStudentsInternalAsync(teacherFacultyIds, classes.Select(c => c.Id).ToList());
        }

        public async Task<IEnumerable<QuestionSuiteDto>> GetQuestionSuitesAsync(Guid teacherId)
        {
            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherId && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            var subjectIds = await _context.SubjectTeachingTeachers
                .Where(stt => stt.TeacherId != null && teacherFacultyIds.Contains(stt.TeacherId.Value) && !stt.IsDeleted)
                .Select(stt => stt.SubjectTeaching.SubjectId)
                .Distinct()
                .ToListAsync();

            return await _context.QuestionSuites
                .Include(qs => qs.Subject)
                .Where(qs => subjectIds.Contains(qs.SubjectId))
                .Select(qs => new QuestionSuiteDto
                {
                    Id = qs.Id,
                    SubjectCode = qs.Subject.SubjectCode,
                    SubjectName = qs.Subject.Name,
                    EasyCount = _context.Questions.Count(q => q.QuestionSuiteId == qs.Id && q.Level == 1),
                    NormalCount = _context.Questions.Count(q => q.QuestionSuiteId == qs.Id && q.Level == 2),
                    HardCount = _context.Questions.Count(q => q.QuestionSuiteId == qs.Id && q.Level == 3),
                    LastUpdated = qs.CreationTime
                })
                .ToListAsync();
        }

        private async Task<List<TeacherClassDto>> GetClassesTaughtInternalAsync(List<Guid> teacherFacultyIds)
        {
            return await _context.SubjectTeachingTeachers
                .Include(stt => stt.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Where(stt => stt.TeacherId != null && teacherFacultyIds.Contains(stt.TeacherId.Value) && !stt.IsDeleted && !stt.SubjectTeaching.IsDeleted)
                .Select(stt => new TeacherClassDto
                {
                    Id = stt.SubjectTeachingId,
                    SubjectCode = stt.SubjectTeaching.Subject.SubjectCode,
                    SubjectName = stt.SubjectTeaching.Subject.Name,
                    ClassCode = stt.SubjectTeaching.Name,
                    TotalSessions = stt.SubjectTeaching.TotalSessions,
                    CompletedSessions = _context.SubjectSchedules
                        .Count(ss => ss.SubjectTeachingId == stt.SubjectTeachingId && ss.EndDateTime <= DateTime.UtcNow && !ss.IsDeleted),
                    StudentsCount = _context.SubjectStudents
                        .Count(ss => ss.SubjectTeachingId == stt.SubjectTeachingId)
                })
                .ToListAsync();
        }

        private async Task<List<TeacherScheduleDto>> GetSchedulesInternalAsync(List<Guid> teacherFacultyIds)
        {
            return await _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Where(ss => ss.TeacherId != null && teacherFacultyIds.Contains(ss.TeacherId.Value) && !ss.IsDeleted)
                .Select(ss => new TeacherScheduleDto
                {
                    Id = ss.Id,
                    SubjectName = ss.SubjectTeaching.Subject.Name,
                    ClassCode = ss.SubjectTeaching.Name,
                    Room = ss.Room != null ? ss.Room.Name : "N/A",
                    DayOfWeek = (int)ss.StartDateTime.DayOfWeek == 0 ? 8 : (int)ss.StartDateTime.DayOfWeek + 1,
                    SlotStart = GetSlotFromTime(ss.StartDateTime.TimeOfDay),
                    SlotEnd = GetSlotFromTime(ss.EndDateTime.TimeOfDay)
                })
                .ToListAsync();
        }

        private async Task<List<AlertStudentDto>> GetAlertStudentsInternalAsync(List<Guid> teacherFacultyIds, List<Guid> teachingIds)
        {
            var subjectIds = await _context.SubjectTeachingTeachers
                .Where(stt => stt.TeacherId != null && teacherFacultyIds.Contains(stt.TeacherId.Value) && !stt.IsDeleted)
                .Select(stt => stt.SubjectTeaching.SubjectId)
                .Distinct()
                .ToListAsync();

            var alertNotes = await _context.SubjectSpecialNotes
                .Include(n => n.Student)
                    .ThenInclude(s => s.User)
                .Where(n => subjectIds.Contains(n.SubjectId) && !n.IsDeleted)
                .Select(n => new AlertStudentDto
                {
                    Name = n.Student.User.FullName,
                    ClassCode = _context.SubjectTeachings
                        .Where(st => st.SubjectId == n.SubjectId && !st.IsDeleted)
                        .Select(st => st.Name)
                        .FirstOrDefault() ?? "N/A",
                    Reason = n.Notes,
                    Status = n.Type == 1 ? "Warning" : "Notice"
                })
                .ToListAsync();

            var allScheduleIds = await _context.SubjectSchedules
                .Where(ss => teachingIds.Contains(ss.SubjectTeachingId) && !ss.IsDeleted)
                .Select(ss => ss.Id)
                .ToListAsync();

            var absentAlerts = await _context.Attendances
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Include(a => a.SubjectSchedule)
                    .ThenInclude(ss => ss.SubjectTeaching)
                .Where(a => allScheduleIds.Contains(a.SubjectScheduleId) && a.Status == 4)
                .GroupBy(a => new { a.StudentId, StudentName = a.Student.User.FullName, ClassCode = a.SubjectSchedule.SubjectTeaching.Name })
                .Select(g => new { g.Key.StudentName, g.Key.ClassCode, AbsentCount = g.Count() })
                .Where(x => x.AbsentCount >= 3)
                .Select(x => new AlertStudentDto
                {
                    Name = x.StudentName,
                    ClassCode = x.ClassCode,
                    Reason = $"Vắng {x.AbsentCount} buổi không phép",
                    Status = "Warning"
                })
                .ToListAsync();

            return alertNotes.Concat(absentAlerts).ToList();
        }

        private async Task<List<AttendanceStatDto>> GetAttendanceStatsInternalAsync(List<Guid> teachingIds)
        {
            var allScheduleIds = await _context.SubjectSchedules
                .Where(ss => teachingIds.Contains(ss.SubjectTeachingId) && !ss.IsDeleted)
                .Select(ss => ss.Id)
                .ToListAsync();

            var attendanceGroups = await _context.Attendances
                .Where(a => allScheduleIds.Contains(a.SubjectScheduleId))
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var presentCount = attendanceGroups.FirstOrDefault(g => g.Status == 1)?.Count ?? 0;
            var lateCount = attendanceGroups.FirstOrDefault(g => g.Status == 2)?.Count ?? 0;
            var excusedCount = attendanceGroups.FirstOrDefault(g => g.Status == 3)?.Count ?? 0;
            var unexcusedCount = attendanceGroups.FirstOrDefault(g => g.Status == 4)?.Count ?? 0;

            return new List<AttendanceStatDto>
            {
                new() { Name = "Có mặt", Value = presentCount, Color = "#22C55E" },
                new() { Name = "Đi trễ", Value = lateCount, Color = "#EAB308" },
                new() { Name = "Vắng có phép", Value = excusedCount, Color = "#3B82F6" },
                new() { Name = "Vắng không phép", Value = unexcusedCount, Color = "#EF4444" }
            };
        }

        private static int GetSlotFromTime(TimeSpan time)
        {
            if (time.Hours < 7) return 1;
            if (time.Hours >= 18) return 12;
            
            if (time.Hours < 12)
            {
                int minutes = (int)(time - new TimeSpan(7, 30, 0)).TotalMinutes;
                if (minutes < 0) return 1;
                int slot = (minutes / 50) + 1;
                return Math.Clamp(slot, 1, 5);
            }
            else if (time.Hours < 17)
            {
                int minutes = (int)(time - new TimeSpan(13, 0, 0)).TotalMinutes;
                if (minutes < 0) return 6;
                int slot = (minutes / 50) + 6;
                return Math.Clamp(slot, 6, 10);
            }
            else
            {
                int minutes = (int)(time - new TimeSpan(17, 30, 0)).TotalMinutes;
                if (minutes < 0) return 11;
                int slot = (minutes / 50) + 11;
                return Math.Clamp(slot, 11, 12);
            }
        }
    }
}