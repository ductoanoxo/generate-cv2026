namespace backend.Services
{
    public class AttendanceService : IAttendanceService
    {
        public Task<object> GetAttendanceStatsAsync(string? classId, string? studentId)
        {
            return Task.FromResult<object>(new { Present = 59807, Late = 3381, ExcusedAbsence = 3171, UnexcusedAbsence = 27506 });
        }

        public Task<IEnumerable<object>> GetClassAttendanceHeatmapAsync(string classId)
        {
            var heatmap = new List<object>
            {
                new { StudentName = "Đặng Đức Toàn", Date = "2026-07-06", Status = 1 }
            };
            return Task.FromResult<IEnumerable<object>>(heatmap);
        }
    }
}
