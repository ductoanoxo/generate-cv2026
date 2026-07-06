using Microsoft.AspNetCore.Mvc;
using GenerateCV.API.Services;

namespace GenerateCV.API.Controllers
{
    [ApiController]
    [Route("api/attendance")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] string? classId, [FromQuery] string? studentId)
        {
            var stats = await _attendanceService.GetAttendanceStatsAsync(classId, studentId);
            return Ok(stats);
        }

        [HttpGet("heatmap/{classId}")]
        public async Task<IActionResult> GetHeatmap(string classId)
        {
            var heatmap = await _attendanceService.GetClassAttendanceHeatmapAsync(classId);
            return Ok(heatmap);
        }
    }
}
