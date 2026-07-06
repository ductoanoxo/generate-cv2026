namespace GenerateCV.API.Services
{
    public interface IAdminDashboardService
    {
        Task<object> GetDashboardStatsAsync();
        Task<IEnumerable<object>> GetAuditLogsAsync(int limit);
        Task<object> GetDeviceDistributionAsync();
    }
}
