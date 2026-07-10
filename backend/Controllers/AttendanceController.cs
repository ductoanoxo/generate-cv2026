using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
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

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent([FromQuery] int limit = 10)
        {
            var logs = await _attendanceService.GetRecentAttendanceLogsAsync(limit);
            return Ok(logs);
        }
    }
}
