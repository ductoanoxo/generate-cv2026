namespace backend.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        public Task<object> GetDashboardStatsAsync()
        {
            return Task.FromResult<object>(new { Students = 577, Teachers = 67, Faculties = 9, Subjects = 390 });
        }

        public Task<IEnumerable<object>> GetAuditLogsAsync(int limit)
        {
            var logs = new List<object>
            {
                new { Id = "a1", Username = "admin", Action = "Login thành công", CreationDate = DateTime.UtcNow }
            };
            return Task.FromResult<IEnumerable<object>>(logs);
        }

        public Task<object> GetDeviceDistributionAsync()
        {
            return Task.FromResult<object>(new { Desktop = 450, Mobile = 180, Tablet = 35 });
        }
    }
}
