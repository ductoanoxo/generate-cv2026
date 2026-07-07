namespace backend.Services
{
    public interface IDepartmentDashboardService
    {
        Task<object> GetDepartmentStatsAsync(string departmentId);
        Task<object> GetTeachingProgressAsync(string departmentId);
        Task<IEnumerable<object>> GetQuestionSuitesAsync(string departmentId);
    }
}
