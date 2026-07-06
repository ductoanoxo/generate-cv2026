using Microsoft.AspNetCore.Mvc;
using GenerateCV.API.Services;

namespace GenerateCV.API.Controllers
{
    [ApiController]
    [Route("api/exams")]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;

        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpGet("distribution")]
        public async Task<IActionResult> GetDistribution([FromQuery] string? subjectId)
        {
            var dist = await _examService.GetExamScoreDistributionAsync(subjectId);
            return Ok(dist);
        }

        [HttpGet("results/student/{id}")]
        public async Task<IActionResult> GetStudentResults(string id)
        {
            var results = await _examService.GetExamResultsByStudentAsync(id);
            return Ok(results);
        }
    }
}
