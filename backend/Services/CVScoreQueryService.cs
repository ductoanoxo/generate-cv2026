using backend.Data;
using backend.DTOs.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CVScoreQueryService : ICVScoreQueryService
    {
        private readonly AppDbContext _context;

        public CVScoreQueryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CourseScoreDto>> GetFilteredScoresAsync(Guid studentId)
        {
            // 1. Fetch all non-deleted exam results for the student with all related entities
            var examResults = await _context.ExamResults
                .Include(er => er.SubjectTeachingExam)
                    .ThenInclude(ste => ste.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                .Where(er => er.StudentId == studentId && !er.IsDeleted)
                .Where(er => er.SubjectTeachingExam != null && !er.SubjectTeachingExam.IsDeleted)
                .Where(er => er.SubjectTeachingExam.SubjectTeaching != null && !er.SubjectTeachingExam.SubjectTeaching.IsDeleted)
                .Where(er => er.SubjectTeachingExam.SubjectTeaching.Subject != null 
                    && !er.SubjectTeachingExam.SubjectTeaching.Subject.IsDeleted 
                    && er.SubjectTeachingExam.SubjectTeaching.Subject.IsActived)
                .ToListAsync();

            // 2. Group by SubjectTeachingId (representing a specific course/class attempt)
            var attempts = examResults
                .GroupBy(er => er.SubjectTeachingExam.SubjectTeachingId)
                .Select(group =>
                {
                    var firstResult = group.FirstOrDefault();
                    if (firstResult == null) return null!;

                    var teaching = firstResult.SubjectTeachingExam.SubjectTeaching;
                    var subject = teaching.Subject;

                    // Calculate dynamically weighted CombinedResult (Điểm TK)
                    double sumScores = 0;
                    double sumWeights = 0;
                    bool hasComponent = false;

                    foreach (var er in group)
                    {
                        if (er.Result.HasValue)
                        {
                            double weight = 0.0;
                            int type = er.SubjectTeachingExam.Type;
                            
                            if (type == 3) // Cuối kỳ (50%)
                                weight = 0.5;
                            else if (type == 2) // Giữa kỳ (40%)
                                weight = 0.4;
                            else if (type == 1) // Thường xuyên (10%)
                                weight = 0.1;

                            if (weight > 0)
                            {
                                sumScores += (double)er.Result.Value * weight;
                                sumWeights += weight;
                                hasComponent = true;
                            }
                        }
                    }

                    double? calculatedCombinedResult = hasComponent && sumWeights > 0 ? (sumScores / sumWeights) : null;
                    
                    // Fallback logic for calculating summary score matching StudentDashboardService
                    double? finalScore = calculatedCombinedResult.HasValue 
                        ? calculatedCombinedResult.Value 
                        : (firstResult.CombinedResult.HasValue 
                            ? (double)firstResult.CombinedResult.Value 
                            : (firstResult.Result.HasValue 
                                ? (double)firstResult.Result.Value 
                                : (double?)null));

                    return new CourseScoreDto
                    {
                        SubjectId = subject.Id,
                        SubjectCode = subject.SubjectCode,
                        SubjectName = subject.Name,
                        CombinedResult = finalScore.HasValue ? (float)finalScore.Value : 0f,
                        Result = firstResult.Result,
                        CreditPoint = subject.CreditPoint
                    };
                })
                .Where(dto => dto != null && dto.CombinedResult >= 7.0f)
                .ToList();

            // 3. Group by SubjectId to handle cases where a student retook the same subject.
            // We select the attempt with the highest CombinedResult.
            var distinctScores = attempts
                .GroupBy(a => a.SubjectId)
                .Select(g => g.OrderByDescending(a => a.CombinedResult).First())
                .ToList();

            return distinctScores;
        }
    }
}
