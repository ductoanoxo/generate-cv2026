using System;

namespace backend.DTOs.Teacher
{
    public class TeacherScheduleDto
    {
        public Guid Id { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int DayOfWeek { get; set; } // 2 = Monday, ..., 8 = Sunday
        public int SlotStart { get; set; }
        public int SlotEnd { get; set; }
    }
}
