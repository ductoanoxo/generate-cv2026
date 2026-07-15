using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;

        public AdminDashboardController(IAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var stats = await _dashboardService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int limit = 20)
        {
            var logs = await _dashboardService.GetAuditLogsAsync(limit);
            return Ok(logs);
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GetDevices()
        {
            var devices = await _dashboardService.GetDeviceDistributionAsync();
            return Ok(devices);
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _dashboardService.GetSettingsAsync();
            return Ok(settings);
        }

        [HttpGet("devices/list")]
        public async Task<IActionResult> GetDevicesList([FromQuery] int limit = 50)
        {
            var devices = await _dashboardService.GetUserDevicesListAsync(limit);
            return Ok(devices);
        }

        [HttpGet("teachers")]
        public async Task<IActionResult> GetTeachers([FromQuery] string? search = null, [FromQuery] int limit = 100)
            => Ok(await _dashboardService.GetTeachersListAsync(search, Math.Clamp(limit, 1, 500)));

        [HttpGet("students")]
        public async Task<IActionResult> GetStudents([FromQuery] string? search = null, [FromQuery] string? facultyId = null, [FromQuery] int limit = 100)
            => Ok(await _dashboardService.GetStudentsListAsync(search, facultyId, Math.Clamp(limit, 1, 500)));
    }
}
