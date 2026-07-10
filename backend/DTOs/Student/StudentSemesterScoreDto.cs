using System.Collections.Generic;

namespace backend.DTOs.Student
{
    public class StudentSemesterScoreDto
    {
        public string SemesterName { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public List<StudentSubjectScoreDto> Subjects { get; set; } = new List<StudentSubjectScoreDto>();
        public double? SemesterGpa { get; set; }
    }

    public class StudentSubjectScoreDto
    {
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int CreditPoint { get; set; }
        public double? Result { get; set; }
        public double? CombinedResult { get; set; }
        public string GradeBand { get; set; } = string.Empty;
        public string GradeC { get; set; } = string.Empty;      // A/B/C/D/F
        public int Grade4 { get; set; } = 0;                    // 4/3/2/1/0
        public string ResultIcon { get; set; } = string.Empty;  // "✓" hoặc "✗"
        public string DetailAction { get; set; } = "view";       // cho frontend icon
        public List<ComponentScoreDto> Components { get; set; } = new List<ComponentScoreDto>();
    }

    public class ComponentScoreDto
    {
        public string ComponentName { get; set; } = string.Empty;
        public double? Score { get; set; }
        public double Weight { get; set; }
    }
}
