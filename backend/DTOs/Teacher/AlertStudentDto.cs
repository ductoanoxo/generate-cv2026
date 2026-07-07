namespace backend.DTOs.Teacher
{
    public class AlertStudentDto
    {
        public string Name { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "Warning", "Notice"
    }
}
