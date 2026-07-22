using System;

namespace backend.DTOs.Student
{
    public class CourseScoreDto
    {
        public Guid SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public float CombinedResult { get; set; }
        public float? Result { get; set; }
        public int CreditPoint { get; set; }
    }
}
