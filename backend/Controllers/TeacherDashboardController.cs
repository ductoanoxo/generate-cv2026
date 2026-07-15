using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs.Teacher;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace backend.Controllers
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

        /// <summary>
        /// Retrieves the summary of teacher dashboard metrics including KPI counters, schedules, alert students, and attendance distribution.
        /// </summary>
        [HttpGet("dashboard")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TeacherDashboardDto))]
        public async Task<ActionResult<TeacherDashboardDto>> GetDashboard([FromQuery] Guid teacherId)
        {
            var stats = await _teacherService.GetTeacherStatsAsync(teacherId);
            return Ok(stats);
        }

        /// <summary>
        /// Retrieves list of classes currently taught by the specified teacher.
        /// </summary>
        // [HttpGet("classes")]
        // [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TeacherClassDto>))]
        // public async Task<ActionResult<IEnumerable<TeacherClassDto>>> GetClasses([FromQuery] Guid teacherId)
        // {
        //     var classes = await _teacherService.GetClassesTaughtAsync(teacherId);
        //     return Ok(classes);
        // }

        /// <summary>
        /// Retrieves students who need special attention (e.g. high absence count, low performance).
        /// </summary>
        // [HttpGet("alerts")]
        // [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<AlertStudentDto>))]
        // public async Task<ActionResult<IEnumerable<AlertStudentDto>>> GetAlerts([FromQuery] Guid teacherId)
        // {
        //     var alerts = await _teacherService.GetAlertStudentsAsync(teacherId);
        //     return Ok(alerts);
        // }

        /// <summary>
        /// Retrieves the exam question suites bank for subjects assigned to this teacher.
        /// </summary>
        [HttpGet("question-suites")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<QuestionSuiteDto>))]
        public async Task<ActionResult<IEnumerable<QuestionSuiteDto>>> GetQuestionSuites([FromQuery] Guid teacherId)
        {
            var suites = await _teacherService.GetQuestionSuitesAsync(teacherId);
            return Ok(suites);
        }
    }
}
