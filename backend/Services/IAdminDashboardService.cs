namespace backend.Services
{
    public interface IAdminDashboardService
    {
        Task<object> GetDashboardStatsAsync();
        Task<IEnumerable<object>> GetAuditLogsAsync(int limit);
        Task<object> GetDeviceDistributionAsync();
        Task<object> GetSettingsAsync();
        Task<IEnumerable<object>> GetUserDevicesListAsync(int limit);
        Task<IEnumerable<object>> GetTeachersListAsync(string? search, int limit);
        Task<IEnumerable<object>> GetStudentsListAsync(string? search, string? facultyId, int limit);
    }
}
