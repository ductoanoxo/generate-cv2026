using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/faculty")]
    public class FacultyDashboardController : ControllerBase
    {
        private readonly IFacultyDashboardService _facultyService;

        public FacultyDashboardController(IFacultyDashboardService facultyService)
        {
            _facultyService = facultyService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] string facultyId)
        {
            var stats = await _facultyService.GetFacultyStatsAsync(facultyId);
            return Ok(stats);
        }

        [HttpGet("teachers")]
        public async Task<IActionResult> GetTeachers([FromQuery] string facultyId)
        {
            var teachers = await _facultyService.GetFacultyTeachersAsync(facultyId);
            return Ok(teachers);
        }
    }
}
