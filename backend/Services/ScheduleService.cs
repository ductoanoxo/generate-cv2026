// namespace backend.Services
// {
//     public class ScheduleService : IScheduleService
//     {
//         public Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId)
//         {
//             var schedule = new List<object>
//             {
//                 new { SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 2, SlotStart = 1, SlotEnd = 4 }
//             };
//             return Task.FromResult<IEnumerable<object>>(schedule);
//         }

//         public Task<IEnumerable<object>> GetScheduleByTeacherAsync(string teacherId)
//         {
//             var schedule = new List<object>
//             {
//                 new { Id = "sch1", SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 2, SlotStart = 1, SlotEnd = 4, TeacherName = "ThS. Lê Hoàng Nam" },
//                 new { Id = "sch3", SubjectName = "Lập trình Web nâng cao", ClassCode = "IT21A", Room = "B104", DayOfWeek = 3, SlotStart = 1, SlotEnd = 4, TeacherName = "ThS. Lê Hoàng Nam" },
//                 new { Id = "sch6", SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 4, SlotStart = 5, SlotEnd = 8, TeacherName = "ThS. Lê Hoàng Nam" },
//                 new { Id = "sch8", SubjectName = "Lập trình Web nâng cao", ClassCode = "IT21A", Room = "B104", DayOfWeek = 5, SlotStart = 5, SlotEnd = 8, TeacherName = "ThS. Lê Hoàng Nam" }
//             };
//             return Task.FromResult<IEnumerable<object>>(schedule);
//         }

//         public Task<IEnumerable<object>> GetScheduleByFacultyAsync(string facultyId)
//         {
//             var schedule = new List<object>();
//             return Task.FromResult<IEnumerable<object>>(schedule);
//         }
//     }
// }

using backend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly AppDbContext _context;

        public ScheduleService(AppDbContext context)
        {
            _context = context;
        }

        public Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId)
        {
            var schedule = new List<object>
            {
                new { SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 2, SlotStart = 1, SlotEnd = 4 }
            };
            return Task.FromResult<IEnumerable<object>>(schedule);
        }

        public async Task<IEnumerable<object>> GetScheduleByTeacherAsync(string teacherId, Guid? semesterId = null)
        {
            if (!Guid.TryParse(teacherId, out var teacherGuid))
            {
                return Enumerable.Empty<object>();
            }

            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherGuid && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            var query = _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Include(ss => ss.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(ss => ss.TeacherId != null && teacherFacultyIds.Contains(ss.TeacherId.Value) && !ss.IsDeleted);

            if (semesterId.HasValue)
            {
                var semester = await _context.SemesterPlans
                    .FirstOrDefaultAsync(sp => sp.Id == semesterId.Value);

                if (semester != null)
                {
                    var startLimit = DateTime.SpecifyKind(semester.StartDate, DateTimeKind.Utc);
                    var endLimit = DateTime.SpecifyKind(semester.EndDate, DateTimeKind.Utc);
                    query = query.Where(ss => ss.StartDateTime >= startLimit && ss.StartDateTime <= endLimit);
                }
            }
            else
            {
                var activeSemesters = await _context.SemesterPlans
                    .Where(sp => sp.IsActive && !sp.IsDeleted)
                    .ToListAsync();

                if (activeSemesters.Any())
                {
                    var startLimit = DateTime.SpecifyKind(activeSemesters.Min(sp => sp.StartDate), DateTimeKind.Utc);
                    var endLimit = DateTime.SpecifyKind(activeSemesters.Max(sp => sp.EndDate), DateTimeKind.Utc);
                    query = query.Where(ss => ss.StartDateTime >= startLimit && ss.StartDateTime <= endLimit);
                }
            }

            var schedules = await query
                .Select(ss => new
                {
                    Id = ss.Id.ToString(),
                    SubjectName = ss.SubjectTeaching.Subject.Name,
                    ClassCode = ss.SubjectTeaching.Name,
                    Room = ss.Room != null ? ss.Room.Name : "N/A",
                    DayOfWeek = (int)ss.StartDateTime.DayOfWeek == 0 ? 8 : (int)ss.StartDateTime.DayOfWeek + 1,
                    SlotStart = GetSlotFromTime(ss.StartDateTime.TimeOfDay),
                    SlotEnd = GetSlotFromTime(ss.EndDateTime.TimeOfDay),
                    TeacherName = ss.Teacher != null && ss.Teacher.User != null ? ss.Teacher.User.FullName : "N/A",
                    StartDateTime = ss.StartDateTime
                })
                .ToListAsync();

            return schedules.Cast<object>();
        }

        public async Task<IEnumerable<object>> GetSemestersAsync()
        {
            var semesters = await _context.SemesterPlans
                .Include(sp => sp.AcademicYear)
                .Where(sp => !sp.IsDeleted)
                .GroupBy(sp => new { sp.Semester, sp.AcademicYearId, AcademicYearName = sp.AcademicYear.Name, Year = sp.AcademicYear.Year })
                .Select(g => new
                {
                    Id = g.First().Id.ToString(),
                    Name = $"Học kỳ {g.Key.Semester} - Năm học {g.Key.Year} - {g.Key.Year + 1}",
                    StartDate = g.Min(sp => sp.StartDate),
                    EndDate = g.Max(sp => sp.EndDate),
                    IsActive = g.Any(sp => sp.IsActive),
                    YearName = g.Key.AcademicYearName,
                    SemesterNum = g.Key.Semester
                })
                .ToListAsync();

            var sorted = semesters
                .OrderByDescending(x => x.YearName)
                .ThenByDescending(x => x.SemesterNum)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.StartDate,
                    x.EndDate,
                    x.IsActive
                })
                .ToList();

            return sorted.Cast<object>();
        }

        public Task<IEnumerable<object>> GetScheduleByFacultyAsync(string facultyId)
        {
            var schedule = new List<object>();
            return Task.FromResult<IEnumerable<object>>(schedule);
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