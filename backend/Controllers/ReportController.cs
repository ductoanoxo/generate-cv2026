using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("cv-data/{studentId}")]
        public async Task<IActionResult> GetCVData(string studentId)
        {
            var data = await _reportService.GetCVDataAsync(studentId);
            if (data == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu CV cho sinh viên này" });
            }
            return Ok(data);
        }

        [HttpGet("attendance/export")]
        public async Task<IActionResult> ExportAttendance([FromQuery] string classId)
        {
            var bytes = await _reportService.ExportAttendanceReportAsync(classId);
            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"diemdanh_{classId}.xlsx");
        }

        [HttpGet("exams/export")]
        public async Task<IActionResult> ExportExams([FromQuery] string subjectId)
        {
            var bytes = await _reportService.ExportExamReportAsync(subjectId);
            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"diemthi_{subjectId}.xlsx");
        }
    }
}
