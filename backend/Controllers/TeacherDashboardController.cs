using Microsoft.AspNetCore.Mvc;
using GenerateCV.API.Services;

namespace GenerateCV.API.Controllers
{
    [ApiController]
    [Route("api/teacher")]
    public class TeacherDashboardController : ControllerBase
    {
        private readonly ITeacherDashboardService _teacherService;

        public TeacherDashboardController(ITeacherDashboardService teacherService)
        {
            _teacherService = teacherService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] string teacherId)
        {
            var stats = await _teacherService.GetTeacherStatsAsync(teacherId);
            return Ok(stats);
        }

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses([FromQuery] string teacherId)
        {
            var classes = await _teacherService.GetClassesTaughtAsync(teacherId);
            return Ok(classes);
        }

        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts([FromQuery] string teacherId)
        {
            var alerts = await _teacherService.GetAlertStudentsAsync(teacherId);
            return Ok(alerts);
        }
    }
}
