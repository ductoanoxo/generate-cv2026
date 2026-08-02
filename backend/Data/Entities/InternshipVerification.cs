using System;

namespace backend.Data.Entities
{
    /// <summary>
    /// A submitted, expert-signed Mẫu 07 internship evaluation form.
    /// Status: 0 = Đã nộp (chờ xác thực), 1 = Đã xác thực, 2 = Từ chối.
    /// </summary>
    public class InternshipVerification
    {
        public Guid Id { get; set; }

        // The submitting student's user id (matches frontend User.id).
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;

        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string MentorName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // The uploaded signed DOCX (Mẫu 07).
        public byte[] DocumentBytes { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        public int Status { get; set; }

        public Guid? ApproverId { get; set; }
        public string? ApprovalName { get; set; }
        public string? Note { get; set; }

        public DateTime SubmissionDate { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public DateTime CreationDate { get; set; }
    }
}
