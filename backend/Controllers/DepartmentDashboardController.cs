using Microsoft.AspNetCore.Mvc;
using backend.Services;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/department")]
    public class DepartmentDashboardController : ControllerBase
    {
        private readonly IDepartmentDashboardService _deptService;

        public DepartmentDashboardController(IDepartmentDashboardService deptService)
        {
            _deptService = deptService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] string departmentId)
        {
            var stats = await _deptService.GetDepartmentStatsAsync(departmentId);
            return Ok(stats);
        }

        [HttpGet("progress")]
        public async Task<IActionResult> GetProgress([FromQuery] string departmentId)
        {
            var progress = await _deptService.GetTeachingProgressAsync(departmentId);
            return Ok(progress);
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions([FromQuery] string departmentId)
        {
            var questions = await _deptService.GetQuestionSuitesAsync(departmentId);
            return Ok(questions);
        }
    }
}
