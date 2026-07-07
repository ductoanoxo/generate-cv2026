namespace backend.Services
{
    public interface ITeacherDashboardService
    {
        Task<object> GetTeacherStatsAsync(string teacherId);
        Task<IEnumerable<object>> GetClassesTaughtAsync(string teacherId);
        Task<IEnumerable<object>> GetAlertStudentsAsync(string teacherId);
    }
}
