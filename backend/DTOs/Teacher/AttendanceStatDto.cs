namespace backend.DTOs.Teacher
{
    public class AttendanceStatDto
    {
        public string Name { get; set; } = string.Empty; // "Có mặt", "Đi trễ", "Vắng có phép", "Vắng không phép"
        public int Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}
