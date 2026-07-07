namespace backend.Services
{
    public class DepartmentDashboardService : IDepartmentDashboardService
    {
        public Task<object> GetDepartmentStatsAsync(string departmentId)
        {
            return Task.FromResult<object>(new { Students = 120, Classes = 4, Subjects = 18 });
        }

        public Task<object> GetTeachingProgressAsync(string departmentId)
        {
            return Task.FromResult<object>(new { Subject = "Kỹ thuật lập trình C", Done = 12, Total = 15 });
        }

        public Task<IEnumerable<object>> GetQuestionSuitesAsync(string departmentId)
        {
            var suites = new List<object>
            {
                new { SubjectCode = "IT101", SubjectName = "Kỹ thuật lập trình C", EasyCount = 120, NormalCount = 95, HardCount = 45 }
            };
            return Task.FromResult<IEnumerable<object>>(suites);
        }
    }
}
