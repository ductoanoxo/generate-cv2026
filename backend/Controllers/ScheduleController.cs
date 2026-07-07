using Microsoft.AspNetCore.Mvc;
using backend.Services;

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
        public async Task<IActionResult> GetStudentSchedule(string id)
        {
            var schedule = await _scheduleService.GetScheduleByStudentAsync(id);
            return Ok(schedule);
        }

        [HttpGet("teacher/{id}")]
        public async Task<IActionResult> GetTeacherSchedule(string id)
        {
            var schedule = await _scheduleService.GetScheduleByTeacherAsync(id);
            return Ok(schedule);
        }
    }
}
