using backend.DTOs.Student;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface ICVScoreQueryService
    {
        Task<IEnumerable<CourseScoreDto>> GetFilteredScoresAsync(Guid studentId);
    }
}
