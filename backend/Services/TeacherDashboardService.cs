namespace backend.Services
{
    public class TeacherDashboardService : ITeacherDashboardService
    {
        public Task<object> GetTeacherStatsAsync(string teacherId)
        {
            return Task.FromResult<object>(new { Classes = 2, TodaySlots = 4, AlertStudentsCount = 3 });
        }

        public Task<IEnumerable<object>> GetClassesTaughtAsync(string teacherId)
        {
            var classes = new List<object>
            {
                new { SubjectCode = "IT101", SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", CompletedSessions = 12, TotalSessions = 15, StudentsCount = 45 }
            };
            return Task.FromResult<IEnumerable<object>>(classes);
        }

        public Task<IEnumerable<object>> GetAlertStudentsAsync(string teacherId)
        {
            var alerts = new List<object>
            {
                new { Name = "Trần Văn An", ClassCode = "IT21A", Reason = "Vắng 4 buổi không phép", Status = "Warning" }
            };
            return Task.FromResult<IEnumerable<object>>(alerts);
        }
    }
}
