using System.Collections.Generic;

namespace backend.DTOs.Teacher
{
    public class TeacherDashboardDto
    {
        public int ClassesCount { get; set; }
        public int TodaySlotsCount { get; set; }
        public int AlertStudentsCount { get; set; }
        public List<TeacherClassDto> Classes { get; set; } = new();
        public List<TeacherScheduleDto> TodaySchedules { get; set; } = new();
        public List<AttendanceStatDto> AttendanceStats { get; set; } = new();
        public List<AlertStudentDto> AlertStudents { get; set; } = new();
    }
}
