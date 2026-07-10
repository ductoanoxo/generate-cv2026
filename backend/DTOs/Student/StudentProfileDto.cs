using System;

namespace backend.DTOs.Student
{
    public class StudentProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string MajorName { get; set; } = string.Empty;
        public string AcademicYearName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? ProfilePicUrl { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? Hometown { get; set; }
        public string? Ethnicity { get; set; }
        public string? Religion { get; set; }
        public int? StudyStatus { get; set; }
        public double Gpa { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Cccd { get; set; }
    }
}
