using System;

namespace backend.DTOs.Student
{
    public class StudentExamResultDto
    {
        public string SubjectTeachingExamName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public float? Result { get; set; }
        public float? CombinedResult { get; set; }
        public DateTime ExamDate { get; set; }
        public string GradeBand { get; set; } = string.Empty;
    }
}
