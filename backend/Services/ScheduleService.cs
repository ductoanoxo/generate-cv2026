namespace backend.Services
{
    public class ScheduleService : IScheduleService
    {
        public Task<IEnumerable<object>> GetScheduleByStudentAsync(string studentId)
        {
            var schedule = new List<object>
            {
                new { SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 2, SlotStart = 1, SlotEnd = 4 }
            };
            return Task.FromResult<IEnumerable<object>>(schedule);
        }

        public Task<IEnumerable<object>> GetScheduleByTeacherAsync(string teacherId)
        {
            var schedule = new List<object>
            {
                new { Id = "sch1", SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 2, SlotStart = 1, SlotEnd = 4, TeacherName = "ThS. Lê Hoàng Nam" },
                new { Id = "sch3", SubjectName = "Lập trình Web nâng cao", ClassCode = "IT21A", Room = "B104", DayOfWeek = 3, SlotStart = 1, SlotEnd = 4, TeacherName = "ThS. Lê Hoàng Nam" },
                new { Id = "sch6", SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 4, SlotStart = 5, SlotEnd = 8, TeacherName = "ThS. Lê Hoàng Nam" },
                new { Id = "sch8", SubjectName = "Lập trình Web nâng cao", ClassCode = "IT21A", Room = "B104", DayOfWeek = 5, SlotStart = 5, SlotEnd = 8, TeacherName = "ThS. Lê Hoàng Nam" }
            };
            return Task.FromResult<IEnumerable<object>>(schedule);
        }

        public Task<IEnumerable<object>> GetScheduleByFacultyAsync(string facultyId)
        {
            var schedule = new List<object>();
            return Task.FromResult<IEnumerable<object>>(schedule);
        }
    }
}
