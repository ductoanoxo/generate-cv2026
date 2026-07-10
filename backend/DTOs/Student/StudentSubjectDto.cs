using System;

namespace backend.DTOs.Student
{
    public class StudentSubjectDto
    {
        public Guid SubjectTeachingId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        public int CreditPoint { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public int TotalSessions { get; set; }
        public int CompletedSessions { get; set; }
    }
}
