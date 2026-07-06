namespace GenerateCV.API.Services
{
    public interface IAttendanceService
    {
        Task<object> GetAttendanceStatsAsync(string? classId, string? studentId);
        Task<IEnumerable<object>> GetClassAttendanceHeatmapAsync(string classId);
    }
}
