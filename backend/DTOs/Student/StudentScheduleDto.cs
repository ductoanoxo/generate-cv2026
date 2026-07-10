using System;

namespace backend.DTOs.Student
{
    public class StudentScheduleDto
    {
        public string Id { get; set; } = string.Empty;
        public string SubjectTeachingName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty; // Kept for compatibility
        public int DayOfWeek { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SlotStart { get; set; }
        public int SlotEnd { get; set; }
        public string TeacherName { get; set; } = string.Empty;
    }
}
