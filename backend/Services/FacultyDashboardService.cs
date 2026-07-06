namespace GenerateCV.API.Services
{
    public class FacultyDashboardService : IFacultyDashboardService
    {
        public Task<object> GetFacultyStatsAsync(string facultyId)
        {
            return Task.FromResult<object>(new { Students = 180, Teachers = 15, Majors = 3, Subjects = 45 });
        }

        public Task<IEnumerable<object>> GetFacultyTeachersAsync(string facultyId)
        {
            var teachers = new List<object>
            {
                new { Name = "TS. Trần Minh Khoa", Title = "Trưởng Khoa", IsHead = true }
            };
            return Task.FromResult<IEnumerable<object>>(teachers);
        }

        public Task<object> GetFacultyAttendanceRatesAsync(string facultyId)
        {
            return Task.FromResult<object>(new { Present = 95, Late = 2, Absence = 3 });
        }
    }
}
