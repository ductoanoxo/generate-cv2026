using System;

namespace backend.DTOs.Student
{
    public class StudentAnnouncementDto
    {
        public Guid Id { get; set; }
        public int Type { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public string DeepLink { get; set; } = string.Empty;
        public string DeepLinkParam { get; set; } = string.Empty;
        public int Status { get; set; }
        public bool EnforceRead { get; set; }
        public int? NotificationType { get; set; }
    }
}
