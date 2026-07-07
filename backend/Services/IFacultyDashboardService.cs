namespace backend.Services
{
    public interface IFacultyDashboardService
    {
        Task<object> GetFacultyStatsAsync(string facultyId);
        Task<IEnumerable<object>> GetFacultyTeachersAsync(string facultyId);
        Task<object> GetFacultyAttendanceRatesAsync(string facultyId);
    }
}
