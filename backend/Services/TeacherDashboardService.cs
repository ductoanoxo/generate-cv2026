using backend.DTOs.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class TeacherDashboardService : ITeacherDashboardService
    {
        // For Week 1, we return robust mock data that aligns perfectly with the Master Plan and the Frontend.
        // Once the DB schema is scaffolded by Dev A, this service can be updated to query AppDbContext.
        
        public Task<TeacherDashboardDto> GetTeacherStatsAsync(Guid teacherId)
        {
            var classes = GetMockClasses(teacherId);
            var schedules = GetMockSchedules(teacherId);
            var alerts = GetMockAlerts(teacherId);
            
            var dto = new TeacherDashboardDto
            {
                ClassesCount = classes.Count,
                TodaySlotsCount = schedules.Where(s => s.DayOfWeek == (int)DateTime.Now.DayOfWeek + 1).Sum(s => s.SlotEnd - s.SlotStart + 1),
                AlertStudentsCount = alerts.Count,
                Classes = classes,
                TodaySchedules = schedules,
                AlertStudents = alerts,
                AttendanceStats = new List<AttendanceStatDto>
                {
                    new() { Name = "Có mặt", Value = 38, Color = "#22C55E" },
                    new() { Name = "Đi trễ", Value = 4, Color = "#EAB308" },
                    new() { Name = "Vắng có phép", Value = 2, Color = "#3B82F6" },
                    new() { Name = "Vắng không phép", Value = 1, Color = "#EF4444" }
                }
            };

            return Task.FromResult(dto);
        }

        public Task<IEnumerable<TeacherClassDto>> GetClassesTaughtAsync(Guid teacherId)
        {
            var classes = GetMockClasses(teacherId);
            return Task.FromResult<IEnumerable<TeacherClassDto>>(classes);
        }

        public Task<IEnumerable<AlertStudentDto>> GetAlertStudentsAsync(Guid teacherId)
        {
            var alerts = GetMockAlerts(teacherId);
            return Task.FromResult<IEnumerable<AlertStudentDto>>(alerts);
        }

        public Task<IEnumerable<QuestionSuiteDto>> GetQuestionSuitesAsync(Guid teacherId)
        {
            var suites = GetMockQuestionSuites(teacherId);
            return Task.FromResult<IEnumerable<QuestionSuiteDto>>(suites);
        }

        private List<TeacherClassDto> GetMockClasses(Guid teacherId)
        {
            return new List<TeacherClassDto>
            {
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000001"),
                    SubjectCode = "IT101",
                    SubjectName = "Kỹ thuật lập trình C",
                    ClassCode = "IT21A",
                    TotalSessions = 15,
                    CompletedSessions = 12,
                    StudentsCount = 45
                },
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000002"),
                    SubjectCode = "IT201",
                    SubjectName = "Lập trình Web nâng cao",
                    ClassCode = "IT21A",
                    TotalSessions = 15,
                    CompletedSessions = 9,
                    StudentsCount = 45
                }
            };
        }

        private List<TeacherScheduleDto> GetMockSchedules(Guid teacherId)
        {
            return new List<TeacherScheduleDto>
            {
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000003"),
                    SubjectName = "Kỹ thuật lập trình C",
                    ClassCode = "IT21A",
                    Room = "A201",
                    DayOfWeek = 2, // Monday
                    SlotStart = 1,
                    SlotEnd = 4
                },
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000004"),
                    SubjectName = "Kỹ thuật lập trình C",
                    ClassCode = "IT21A",
                    Room = "B203",
                    DayOfWeek = 3, // Tuesday
                    SlotStart = 5,
                    SlotEnd = 8
                },
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000004"),
                    SubjectName = "Lập trình Web nâng cao",
                    ClassCode = "IT21A",
                    Room = "A201",
                    DayOfWeek = 4, // Wednesday
                    SlotStart = 5,
                    SlotEnd = 8
                },
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000004"),
                    SubjectName = "Lập trình Web nâng cao",
                    ClassCode = "IT21A",
                    Room = "A201",
                    DayOfWeek = 5, // Thursday
                    SlotStart = 1,
                    SlotEnd = 4
                }
            }.Where(s => s.DayOfWeek == (int)DateTime.Now.DayOfWeek + 1).ToList(); // Filter for today's schedules
        }

        private List<AlertStudentDto> GetMockAlerts(Guid teacherId)
        {
            return new List<AlertStudentDto>
            {
                new() { Name = "Trần Văn An", ClassCode = "IT21A", Reason = "Vắng 4 buổi không phép", Status = "Warning" },
                new() { Name = "Lê Thị Bình", ClassCode = "IT21A", Reason = "GPA < 5.0 (Cần chú ý)", Status = "Notice" },
                new() { Name = "Phạm Minh Đức", ClassCode = "IT21B", Reason = "Vắng 3 buổi liên tiếp", Status = "Warning" }
            };
        }

        private List<QuestionSuiteDto> GetMockQuestionSuites(Guid teacherId)
        {
            return new List<QuestionSuiteDto>
            {
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000005"),
                    SubjectCode = "IT101",
                    SubjectName = "Kỹ thuật lập trình C",
                    EasyCount = 120,
                    NormalCount = 95,
                    HardCount = 45,
                    LastUpdated = DateTime.Parse("2026-06-15")
                },
                new()
                {
                    Id = Guid.Parse("d3b07384-d113-49be-a5d2-000000000006"),
                    SubjectCode = "IT201",
                    SubjectName = "Lập trình Web nâng cao",
                    EasyCount = 90,
                    NormalCount = 80,
                    HardCount = 30,
                    LastUpdated = DateTime.Parse("2026-06-22")
                }
            };
        }
    }
}
