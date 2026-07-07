using System;

namespace backend.DTOs.Teacher
{
    public class QuestionSuiteDto
    {
        public Guid Id { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int EasyCount { get; set; }
        public int NormalCount { get; set; }
        public int HardCount { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
