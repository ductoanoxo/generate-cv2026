using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IScheduleService
    {
        Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId, Guid? semesterId = null);
        Task<IEnumerable<object>> GetScheduleByTeacherAsync(string teacherId, Guid? semesterId = null);
        Task<IEnumerable<object>> GetScheduleByFacultyAsync(string facultyId);
        Task<IEnumerable<object>> GetSemestersAsync();
    }
}
