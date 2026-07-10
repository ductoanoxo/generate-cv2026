using backend.DTOs.Student;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IStudentDashboardService
    {
        Task<StudentDashboardDto> GetStudentDashboardAsync(Guid studentId);
        Task<StudentProfileDto?> GetStudentProfileAsync(Guid studentId);
        Task<IEnumerable<StudentAnnouncementDto>> GetStudentAnnouncementsAsync(Guid studentId);
        Task<IEnumerable<StudentSemesterScoreDto>> GetStudentScoresBySemesterAsync(Guid studentId);
        Task<IEnumerable<StudentExamResultDto>> GetStudentExamResultsAsync(string studentId);
    }
}
