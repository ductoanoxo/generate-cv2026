namespace backend.Services
{
    public interface IExamService
    {
        Task<object> GetExamScoreDistributionAsync(string? subjectId);
        Task<IEnumerable<object>> GetExamResultsByStudentAsync(string studentId);
    }
}
