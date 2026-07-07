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
                new { SubjectName = "Kỹ thuật lập trình C", ClassCode = "IT21A", Room = "A201", DayOfWeek = 2, SlotStart = 1, SlotEnd = 4 }
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
