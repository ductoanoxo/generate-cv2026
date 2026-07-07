namespace backend.Services
{
    public class ExamService : IExamService
    {
        public Task<object> GetExamScoreDistributionAsync(string? subjectId)
        {
            var dist = new List<object>
            {
                new { Range = "Kém (<4)", Count = 1200 },
                new { Range = "Yếu (4-5)", Count = 3400 },
                new { Range = "TB (5-6.5)", Count = 12500 },
                new { Range = "Khá (6.5-8)", Count = 9800 },
                new { Range = "Giỏi (8+)", Count = 4179 }
            };
            return Task.FromResult<object>(dist);
        }

        public Task<IEnumerable<object>> GetExamResultsByStudentAsync(string studentId)
        {
            var results = new List<object>
            {
                new { SubjectName = "Kỹ thuật lập trình C", Score = 8.5, ExamDate = "2026-06-20" }
            };
            return Task.FromResult<IEnumerable<object>>(results);
        }
    }
}
