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

        public async Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId, Guid? semesterId = null)
        {
            if (!Guid.TryParse(studentId, out var studentGuid))
            {
                return Enumerable.Empty<object>();
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => (s.Id == studentGuid || s.UserId == studentGuid) && !s.IsDeleted);

            if (student == null)
            {
                return Enumerable.Empty<object>();
            }

            var actualStudentId = student.Id;

            var subjectTeachingIds = await _context.SubjectStudents
                .Where(ss => ss.StudentId == actualStudentId)
                .Select(ss => ss.SubjectTeachingId)
                .ToListAsync();

            var query = _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Include(ss => ss.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(ss => !ss.IsDeleted && subjectTeachingIds.Contains(ss.SubjectTeachingId));

            if (semesterId.HasValue)
            {
                var academicYear = await _context.AcademicYears
                    .FirstOrDefaultAsync(ay => ay.Id == semesterId.Value);

                if (academicYear != null)
                {
                    var startLimit = DateTime.SpecifyKind(academicYear.StartDate, DateTimeKind.Utc);
                    var endLimit = DateTime.SpecifyKind(academicYear.EndDate, DateTimeKind.Utc);
                    query = query.Where(ss => ss.StartDateTime >= startLimit && ss.StartDateTime <= endLimit);
                }
            }
            else
            {
                var currentYear = DateTime.UtcNow.Year;
                var activeYear = await _context.AcademicYears
                    .FirstOrDefaultAsync(ay => ay.Year == currentYear && !ay.IsDeleted)
                    ?? await _context.AcademicYears.OrderByDescending(ay => ay.Year).FirstOrDefaultAsync(ay => !ay.IsDeleted);

                if (activeYear != null)
                {
                    var startLimit = DateTime.SpecifyKind(activeYear.StartDate, DateTimeKind.Utc);
                    var endLimit = DateTime.SpecifyKind(activeYear.EndDate, DateTimeKind.Utc);
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

        public async Task<IEnumerable<object>> GetScheduleByTeacherAsync(string teacherId, Guid? semesterId = null)
        {
            if (!Guid.TryParse(teacherId, out var teacherGuid))
            {
                return Enumerable.Empty<object>();
            }

            /*
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
            */

            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherGuid && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            var subjectTeachingIds = await _context.SubjectTeachingTeachers
                .Where(stt => stt.TeacherId != null && teacherFacultyIds.Contains(stt.TeacherId.Value) && !stt.IsDeleted)
                .Select(stt => stt.SubjectTeachingId)
                .ToListAsync();

            var query = _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Include(ss => ss.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(ss => !ss.IsDeleted && (
                    subjectTeachingIds.Contains(ss.SubjectTeachingId)
                    || (ss.TeacherId != null && teacherFacultyIds.Contains(ss.TeacherId.Value))
                ));

            /*
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
            */

            if (semesterId.HasValue)
            {
                var academicYear = await _context.AcademicYears
                    .FirstOrDefaultAsync(ay => ay.Id == semesterId.Value);

                if (academicYear != null)
                {
                    var startLimit = DateTime.SpecifyKind(academicYear.StartDate, DateTimeKind.Utc);
                    var endLimit = DateTime.SpecifyKind(academicYear.EndDate, DateTimeKind.Utc);
                    query = query.Where(ss => ss.StartDateTime >= startLimit && ss.StartDateTime <= endLimit);
                }
            }
            else
            {
                var currentYear = DateTime.UtcNow.Year;
                var activeYear = await _context.AcademicYears
                    .FirstOrDefaultAsync(ay => ay.Year == currentYear && !ay.IsDeleted)
                    ?? await _context.AcademicYears.OrderByDescending(ay => ay.Year).FirstOrDefaultAsync(ay => !ay.IsDeleted);

                if (activeYear != null)
                {
                    var startLimit = DateTime.SpecifyKind(activeYear.StartDate, DateTimeKind.Utc);
                    var endLimit = DateTime.SpecifyKind(activeYear.EndDate, DateTimeKind.Utc);
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
            /*
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
            */

            var currentYear = DateTime.UtcNow.Year;
            var academicYears = await _context.AcademicYears
                .Where(ay => !ay.IsDeleted)
                .OrderByDescending(ay => ay.Year)
                .ToListAsync();

            var result = academicYears.Select(ay => new
            {
                Id = ay.Id.ToString(),
                Name = ay.Name,
                StartDate = ay.StartDate,
                EndDate = ay.EndDate,
                IsActive = ay.Year == currentYear
            }).ToList();

            if (!result.Any(r => r.IsActive) && result.Any())
            {
                result[0] = new
                {
                    result[0].Id,
                    result[0].Name,
                    result[0].StartDate,
                    result[0].EndDate,
                    IsActive = true
                };
            }

            return result.Cast<object>();
        }

        public Task<IEnumerable<object>> GetScheduleByFacultyAsync(string facultyId)
        {
            var schedule = new List<object>();
            return Task.FromResult<IEnumerable<object>>(schedule);
        }

        public async Task<IEnumerable<object>> GetScheduleTodayAsync(string userId, int role, DateTime? date = null)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Enumerable.Empty<object>();
            }

            var targetDate = date?.Date ?? DateTime.UtcNow.Date;
            var nextDate = targetDate.AddDays(1);
            var targetDateUtc = DateTime.SpecifyKind(targetDate, DateTimeKind.Utc);
            var nextDateUtc = DateTime.SpecifyKind(nextDate, DateTimeKind.Utc);

            IQueryable<backend.Data.Entities.SubjectSchedule> query;

            if (role == 1) // Student
            {
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => (s.Id == userGuid || s.UserId == userGuid) && !s.IsDeleted);

                if (student == null)
                {
                    return Enumerable.Empty<object>();
                }

                var actualStudentId = student.Id;

                var subjectTeachingIds = await _context.SubjectStudents
                    .Where(ss => ss.StudentId == actualStudentId)
                    .Select(ss => ss.SubjectTeachingId)
                    .ToListAsync();

                query = _context.SubjectSchedules
                    .Include(ss => ss.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                    .Include(ss => ss.Room)
                    .Include(ss => ss.Teacher)
                        .ThenInclude(t => t!.User)
                    .Where(ss => !ss.IsDeleted && subjectTeachingIds.Contains(ss.SubjectTeachingId));
            }
            else // Teacher
            {
                var teacherFacultyIds = await _context.TeacherFaculties
                    .Where(tf => tf.UserId == userGuid && !tf.IsDeleted)
                    .Select(tf => tf.Id)
                    .ToListAsync();

                var subjectTeachingIds = await _context.SubjectTeachingTeachers
                    .Where(stt => stt.TeacherId != null && teacherFacultyIds.Contains(stt.TeacherId.Value) && !stt.IsDeleted)
                    .Select(stt => stt.SubjectTeachingId)
                    .ToListAsync();

                query = _context.SubjectSchedules
                    .Include(ss => ss.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                    .Include(ss => ss.Room)
                    .Include(ss => ss.Teacher)
                        .ThenInclude(t => t!.User)
                    .Where(ss => !ss.IsDeleted && (
                        subjectTeachingIds.Contains(ss.SubjectTeachingId)
                        || (ss.TeacherId != null && teacherFacultyIds.Contains(ss.TeacherId.Value))
                    ));
            }

            query = query.Where(ss => ss.StartDateTime >= targetDateUtc && ss.StartDateTime < nextDateUtc);

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

        public async Task<IEnumerable<object>> GetScheduleByWeekAsync(string userId, int role, DateTime? date = null)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Enumerable.Empty<object>();
            }

            var targetDate = date?.Date ?? DateTime.UtcNow.Date;
            int diff = (7 + (targetDate.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = targetDate.AddDays(-1 * diff).Date;
            var endOfWeek = startOfWeek.AddDays(7);

            var startOfWeekUtc = DateTime.SpecifyKind(startOfWeek, DateTimeKind.Utc);
            var endOfWeekUtc = DateTime.SpecifyKind(endOfWeek, DateTimeKind.Utc);

            IQueryable<backend.Data.Entities.SubjectSchedule> query;

            if (role == 1) // Student
            {
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => (s.Id == userGuid || s.UserId == userGuid) && !s.IsDeleted);

                if (student == null)
                {
                    return Enumerable.Empty<object>();
                }

                var actualStudentId = student.Id;

                var subjectTeachingIds = await _context.SubjectStudents
                    .Where(ss => ss.StudentId == actualStudentId)
                    .Select(ss => ss.SubjectTeachingId)
                    .ToListAsync();

                query = _context.SubjectSchedules
                    .Include(ss => ss.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                    .Include(ss => ss.Room)
                    .Include(ss => ss.Teacher)
                        .ThenInclude(t => t!.User)
                    .Where(ss => !ss.IsDeleted && subjectTeachingIds.Contains(ss.SubjectTeachingId));
            }
            else // Teacher
            {
                var teacherFacultyIds = await _context.TeacherFaculties
                    .Where(tf => tf.UserId == userGuid && !tf.IsDeleted)
                    .Select(tf => tf.Id)
                    .ToListAsync();

                var subjectTeachingIds = await _context.SubjectTeachingTeachers
                    .Where(stt => stt.TeacherId != null && teacherFacultyIds.Contains(stt.TeacherId.Value) && !stt.IsDeleted)
                    .Select(stt => stt.SubjectTeachingId)
                    .ToListAsync();

                query = _context.SubjectSchedules
                    .Include(ss => ss.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                    .Include(ss => ss.Room)
                    .Include(ss => ss.Teacher)
                        .ThenInclude(t => t!.User)
                    .Where(ss => !ss.IsDeleted && (
                        subjectTeachingIds.Contains(ss.SubjectTeachingId)
                        || (ss.TeacherId != null && teacherFacultyIds.Contains(ss.TeacherId.Value))
                    ));
            }

            query = query.Where(ss => ss.StartDateTime >= startOfWeekUtc && ss.StartDateTime < endOfWeekUtc);

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