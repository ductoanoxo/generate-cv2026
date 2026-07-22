using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs.Student;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/student")]
    public class StudentDashboardController : ControllerBase
    {
        private readonly IStudentDashboardService _studentService;
        private readonly AppDbContext _context;
        private readonly ICVScoreQueryService _scoreService;

        public StudentDashboardController(IStudentDashboardService studentService, AppDbContext context, ICVScoreQueryService scoreService)
        {
            _studentService = studentService;
            _context = context;
            _scoreService = scoreService;
        }

        private async Task<Guid> ResolveStudentIdAsync(string studentId)
        {
            if (Guid.TryParse(studentId, out var guid))
            {
                return guid;
            }

            var svToanUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == "sv_toan");
            if (svToanUser != null)
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == svToanUser.Id && !s.IsDeleted);
                if (student != null)
                {
                    return student.Id;
                }
            }

            var fallback = await _context.Students.FirstOrDefaultAsync(s => !s.IsDeleted);
            if (fallback != null)
            {
                return fallback.Id;
            }

            return Guid.Empty;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] string studentId)
        {
            var resolvedId = await ResolveStudentIdAsync(studentId);
            if (resolvedId == Guid.Empty)
            {
                return NotFound(new { message = "Không tìm thấy sinh viên" });
            }
            var dashboard = await _studentService.GetStudentDashboardAsync(resolvedId);
            return Ok(dashboard);
        }

        // [HttpGet("profile")]
        // public async Task<IActionResult> GetProfile([FromQuery] string studentId)
        // {
        //     var resolvedId = await ResolveStudentIdAsync(studentId);
        //     if (resolvedId == Guid.Empty)
        //     {
        //         return NotFound(new { message = "Không tìm thấy sinh viên" });
        //     }
        //     var profile = await _studentService.GetStudentProfileAsync(resolvedId);
        //     if (profile == null)
        //     {
        //         return NotFound(new { message = "Không tìm thấy hồ sơ sinh viên" });
        //     }
        //     return Ok(profile);
        // }

        [HttpGet("announcements")]
        public async Task<IActionResult> GetAnnouncements([FromQuery] string studentId)
        {
            var resolvedId = await ResolveStudentIdAsync(studentId);
            if (resolvedId == Guid.Empty)
            {
                return Ok(new List<StudentAnnouncementDto>());
            }
            var announcements = await _studentService.GetStudentAnnouncementsAsync(resolvedId);
            return Ok(announcements);
        }

        [HttpGet("scores")]
        public async Task<IActionResult> GetScoresBySemester([FromQuery] string studentId)
        {
            var resolvedId = await ResolveStudentIdAsync(studentId);
            if (resolvedId == Guid.Empty)
            {
                return Ok(new List<StudentSemesterScoreDto>());
            }
            var scores = await _studentService.GetStudentScoresBySemesterAsync(resolvedId);
            return Ok(scores);
        }

        // [HttpGet("exams")]
        // public async Task<IActionResult> GetExams([FromQuery] string studentId)
        // {
        //     var exams = await _studentService.GetStudentExamResultsAsync(studentId);
        //     return Ok(exams);
        // }

        [HttpGet("{id}/scores/filtered")]
        public async Task<IActionResult> GetFilteredScores(string id)
        {
            var resolvedId = await ResolveStudentIdAsync(id);
            if (resolvedId == Guid.Empty)
            {
                return Ok(new List<CourseScoreDto>());
            }
            var scores = await _scoreService.GetFilteredScoresAsync(resolvedId);
            return Ok(scores);
        }
    }
}
