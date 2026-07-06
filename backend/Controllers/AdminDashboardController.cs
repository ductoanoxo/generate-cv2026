using Microsoft.AspNetCore.Mvc;
using GenerateCV.API.Services;

namespace GenerateCV.API.Controllers
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
    }
}
