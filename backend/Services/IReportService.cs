namespace GenerateCV.API.Services
{
    public interface IReportService
    {
        Task<byte[]> ExportAttendanceReportAsync(string classId);
        Task<byte[]> ExportExamReportAsync(string subjectId);
        Task<object?> GetCVDataAsync(string studentId);
    }
}
