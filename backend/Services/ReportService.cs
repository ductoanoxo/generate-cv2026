namespace GenerateCV.API.Services
{
    public class ReportService : IReportService
    {
        public Task<byte[]> ExportAttendanceReportAsync(string classId)
        {
            // Return empty excel byte array skeleton
            return Task.FromResult(new byte[0]);
        }

        public Task<byte[]> ExportExamReportAsync(string subjectId)
        {
            // Return empty excel byte array skeleton
            return Task.FromResult(new byte[0]);
        }

        public Task<object?> GetCVDataAsync(string studentId)
        {
            return Task.FromResult<object?>(new
            {
                StudentId = studentId,
                Summary = "Sinh viên Kỹ thuật Phần mềm xuất sắc",
                Skills = new[] { "React", "SQL", ".NET" },
                Grades = new[]
                {
                    new { SubjectName = "Kỹ thuật lập trình C", Score = 8.5 }
                }
            });
        }
    }
}
