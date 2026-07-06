namespace GenerateCV.API.Services
{
    public class StudentDashboardService : IStudentDashboardService
    {
        public Task<object?> GetStudentProfileAsync(string studentId)
        {
            return Task.FromResult<object?>(new
            {
                StudentCode = "SV26001",
                FullName = "Đặng Đức Toàn",
                Major = "Kỹ thuật Phần mềm",
                AcademicYear = "K21",
                Gpa = 8.4
            });
        }

        public Task<object> GetStudentStatsAsync(string studentId)
        {
            return Task.FromResult<object>(new { Gpa = 8.4, PresentCount = 10, LateCount = 1, AbsenceCount = 1 });
        }

        public Task<IEnumerable<object>> GetStudentAnnouncementsAsync(string studentId)
        {
            var ann = new List<object>
            {
                new { Id = "an1", Title = "Thông báo đóng học phí", Date = "2026-07-05", Content = "Yêu cầu đóng học phí kỳ II", Sender = "Phòng Tài vụ" }
            };
            return Task.FromResult<IEnumerable<object>>(ann);
        }
    }
}
