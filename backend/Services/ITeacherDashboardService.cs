using backend.DTOs.Teacher;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface ITeacherDashboardService
    {
        Task<TeacherDashboardDto> GetTeacherStatsAsync(Guid teacherId);
        Task<IEnumerable<TeacherClassDto>> GetClassesTaughtAsync(Guid teacherId);
        Task<IEnumerable<AlertStudentDto>> GetAlertStudentsAsync(Guid teacherId);
        Task<IEnumerable<QuestionSuiteDto>> GetQuestionSuitesAsync(Guid teacherId);
    }
}
