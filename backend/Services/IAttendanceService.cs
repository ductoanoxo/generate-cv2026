namespace backend.Services
{
    public interface IAttendanceService
    {
        Task<object> GetAttendanceStatsAsync(string? classId, string? studentId);
        Task<IEnumerable<object>> GetClassAttendanceHeatmapAsync(string classId);
        Task<IEnumerable<object>> GetRecentAttendanceLogsAsync(int limit = 10);
    }
}
