namespace backend.Services
{
    public interface IStudentDashboardService
    {
        Task<object?> GetStudentProfileAsync(string studentId);
        Task<object> GetStudentStatsAsync(string studentId);
        Task<IEnumerable<object>> GetStudentAnnouncementsAsync(string studentId);
        Task<IEnumerable<object>> GetStudentExamResultsAsync(string studentId);
    }
}
