using Microsoft.AspNetCore.Mvc;
using backend.Services;
using System;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/schedule")]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpGet("student/{id}")]
        public async Task<IActionResult> GetStudentSchedule(string id, [FromQuery] Guid? semesterId)
        {
            var schedule = await _scheduleService.GetScheduleByStudentAsync(id, semesterId);
            return Ok(schedule);
        }

        [HttpGet("teacher/{id}")]
        public async Task<IActionResult> GetTeacherSchedule(string id, [FromQuery] Guid? semesterId)
        {
            var schedule = await _scheduleService.GetScheduleByTeacherAsync(id, semesterId);
            return Ok(schedule);
        }

        [HttpGet("semesters")]
        public async Task<IActionResult> GetSemesters()
        {
            var semesters = await _scheduleService.GetSemestersAsync();
            return Ok(semesters);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodaySchedule([FromQuery] string? userId, [FromQuery] int? role, [FromQuery] DateTime? date)
        {
            var finalUserId = userId ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var roleStr = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var finalRole = role ?? (int.TryParse(roleStr, out var r) ? r : 1);

            if (string.IsNullOrEmpty(finalUserId))
            {
                return BadRequest(new { message = "userId is required or user must be authenticated" });
            }

            var schedule = await _scheduleService.GetScheduleTodayAsync(finalUserId, finalRole, date);
            return Ok(schedule);
        }

        [HttpGet("by-week")]
        public async Task<IActionResult> GetWeeklySchedule([FromQuery] string? userId, [FromQuery] int? role, [FromQuery] DateTime? date)
        {
            var finalUserId = userId ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var roleStr = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var finalRole = role ?? (int.TryParse(roleStr, out var r) ? r : 1);

            if (string.IsNullOrEmpty(finalUserId))
            {
                return BadRequest(new { message = "userId is required or user must be authenticated" });
            }

            var schedule = await _scheduleService.GetScheduleByWeekAsync(finalUserId, finalRole, date);
            return Ok(schedule);
        }

        [HttpGet("faculty/{id}")]
        public async Task<IActionResult> GetFacultySchedule(string id)
        {
            var schedule = await _scheduleService.GetScheduleByFacultyAsync(id);
            return Ok(schedule);
        }
    }
}
