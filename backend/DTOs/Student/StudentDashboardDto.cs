using System.Collections.Generic;

namespace backend.DTOs.Student
{
    public class StudentDashboardDto
    {
        public StudentProfileDto? Profile { get; set; }
        public IEnumerable<StudentScheduleDto> TodaySchedules { get; set; } = new List<StudentScheduleDto>();
        public IEnumerable<StudentAttendanceStatDto> AttendanceStats { get; set; } = new List<StudentAttendanceStatDto>();
        public IEnumerable<StudentExamResultDto> ExamResults { get; set; } = new List<StudentExamResultDto>();
        public IEnumerable<StudentSubjectDto> CurrentSubjects { get; set; } = new List<StudentSubjectDto>();
        public IEnumerable<StudentAnnouncementDto> Announcements { get; set; } = new List<StudentAnnouncementDto>();
    }
}
