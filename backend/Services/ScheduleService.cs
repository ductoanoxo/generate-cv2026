using backend.Data;
using backend.Data.Entities;
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

        private async Task<IQueryable<SubjectSchedule>> GetStudentScheduleQueryAsync(string studentId)
        {
            if (!Guid.TryParse(studentId, out var studentGuid))
            {
                return Enumerable.Empty<SubjectSchedule>().AsQueryable();
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.Id == studentGuid || s.UserId == studentGuid);

            if (student == null)
            {
                return Enumerable.Empty<SubjectSchedule>().AsQueryable();
            }

            var teachingIds = await _context.SubjectStudents
                .Where(ss => ss.StudentId == student.Id)
                .Select(ss => ss.SubjectTeachingId)
                .ToListAsync();

            return _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Include(ss => ss.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(ss => teachingIds.Contains(ss.SubjectTeachingId) && !ss.IsDeleted);
        }

        private async Task<IQueryable<SubjectSchedule>> GetTeacherScheduleQueryAsync(string teacherId)
        {
            if (!Guid.TryParse(teacherId, out var teacherGuid))
            {
                return Enumerable.Empty<SubjectSchedule>().AsQueryable();
            }

            var teacherFacultyIds = await _context.TeacherFaculties
                .Where(tf => tf.UserId == teacherGuid && !tf.IsDeleted)
                .Select(tf => tf.Id)
                .ToListAsync();

            return _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Include(ss => ss.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(ss => ss.TeacherId != null && teacherFacultyIds.Contains(ss.TeacherId.Value) && !ss.IsDeleted);
        }

        public async Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId)
        {
            var query = await GetStudentScheduleQueryAsync(studentId);

            var activeSemesters = await _context.SemesterPlans
                .Where(sp => sp.IsActive && !sp.IsDeleted)
                .ToListAsync();

            if (activeSemesters.Any())
            {
                var startLimit = DateTime.SpecifyKind(activeSemesters.Min(sp => sp.StartDate), DateTimeKind.Utc);
                var endLimit = DateTime.SpecifyKind(activeSemesters.Max(sp => sp.EndDate), DateTimeKind.Utc);
                query = query.Where(ss => ss.StartDateTime >= startLimit && ss.StartDateTime <= endLimit);
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
            var query = await GetTeacherScheduleQueryAsync(teacherId);

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

        public async Task<IEnumerable<object>> GetScheduleTodayAsync(string userId, int role, DateTime? date = null)
        {
            var targetDate = (date ?? DateTime.Today).Date;
            var query = role == 1 
                ? await GetStudentScheduleQueryAsync(userId) 
                : await GetTeacherScheduleQueryAsync(userId);

            var startOfDay = DateTime.SpecifyKind(targetDate, DateTimeKind.Utc);
            var endOfDay = DateTime.SpecifyKind(targetDate.AddDays(1), DateTimeKind.Utc);

            var schedules = await query
                .Where(ss => ss.StartDateTime >= startOfDay && ss.StartDateTime < endOfDay)
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
            var targetDate = date ?? DateTime.Today;
            int diff = (7 + (targetDate.DayOfWeek - DayOfWeek.Monday)) % 7;
            var monday = targetDate.AddDays(-1 * diff).Date;
            var sunday = monday.AddDays(7).Date;

            var startOfWeek = DateTime.SpecifyKind(monday, DateTimeKind.Utc);
            var endOfWeek = DateTime.SpecifyKind(sunday, DateTimeKind.Utc);

            var query = role == 1 
                ? await GetStudentScheduleQueryAsync(userId) 
                : await GetTeacherScheduleQueryAsync(userId);

            var schedules = await query
                .Where(ss => ss.StartDateTime >= startOfWeek && ss.StartDateTime < endOfWeek)
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