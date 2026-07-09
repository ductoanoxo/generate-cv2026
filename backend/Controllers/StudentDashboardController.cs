using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/student")]
    public class StudentDashboardController : ControllerBase
    {
        private readonly IStudentDashboardService _studentService;

        public StudentDashboardController(IStudentDashboardService studentService)
        {
            _studentService = studentService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] string studentId)
        {
            var stats = await _studentService.GetStudentStatsAsync(studentId);
            return Ok(stats);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile([FromQuery] string studentId)
        {
            var profile = await _studentService.GetStudentProfileAsync(studentId);
            if (profile == null)
            {
                return NotFound(new { message = "Không tìm thấy hồ sơ sinh viên" });
            }
            return Ok(profile);
        }

        [HttpGet("announcements")]
        public async Task<IActionResult> GetAnnouncements([FromQuery] string studentId)
        {
            var ann = await _studentService.GetStudentAnnouncementsAsync(studentId);
            return Ok(ann);
        }

        [HttpGet("exams")]
        public async Task<IActionResult> GetExams([FromQuery] string studentId)
        {
            var exams = await _studentService.GetStudentExamResultsAsync(studentId);
            return Ok(exams);
        }
    }
}
