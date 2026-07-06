namespace GenerateCV.API.Services
{
    public interface IScheduleService
    {
        Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId);
        Task<IEnumerable<object>> GetScheduleByTeacherAsync(string teacherId);
        Task<IEnumerable<object>> GetScheduleByFacultyAsync(string facultyId);
    }
}
