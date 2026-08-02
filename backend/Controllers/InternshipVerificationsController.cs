using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Data.Entities;
using backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/internship-verifications")]
    [Authorize]
    public class InternshipVerificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InternshipVerificationsController(AppDbContext context) => _context = context;

        /// <summary>Roles allowed to review/approve internship verifications.</summary>
        private static readonly int[] ApprovalRoles = { RoleHelper.Teacher, RoleHelper.DeptHead, RoleHelper.Dean };

        // ---------- Student ----------

        /// <summary>List verifications submitted by the current student.</summary>
        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var studentId = GetUserId();
            if (studentId == Guid.Empty) return Unauthorized();
            var list = await _context.InternshipVerifications
                .Where(v => v.StudentId == studentId)
                .OrderByDescending(v => v.SubmissionDate)
                .Select(v => new { v.Id, v.Company, v.Role, v.Period, v.CompanyAddress, v.MentorName, v.Status, v.ApprovalName, v.Note, v.SubmissionDate, v.ApprovalDate })
                .ToListAsync();
            return Ok(list);
        }

        /// <summary>Submit a signed Mẫu 07 document for approval.</summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Submit([FromForm] SubmitVerificationRequest request)
        {
            var studentId = GetUserId();
            if (studentId == Guid.Empty) return Unauthorized();

            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "Chưa đính kèm phiếu Mẫu 07 đã ký." });

            using var ms = new System.IO.MemoryStream();
            await request.File.CopyToAsync(ms);

            var now = DateTime.UtcNow;
            var verification = new InternshipVerification
            {
                Id = Guid.NewGuid(),
                StudentId = studentId,
                StudentName = (request.StudentName ?? string.Empty).Trim(),
                StudentCode = (request.StudentCode ?? string.Empty).Trim(),
                Company = (request.Company ?? string.Empty).Trim(),
                Role = (request.Role ?? string.Empty).Trim(),
                Period = (request.Period ?? string.Empty).Trim(),
                CompanyAddress = (request.CompanyAddress ?? string.Empty).Trim(),
                MentorName = (request.MentorName ?? string.Empty).Trim(),
                Description = (request.Description ?? string.Empty).Trim(),
                DocumentBytes = ms.ToArray(),
                FileName = string.IsNullOrWhiteSpace(request.File.FileName) ? "Mau07_TTTN.docx" : request.File.FileName,
                ContentType = string.IsNullOrWhiteSpace(request.ContentType) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : request.ContentType,
                Status = 0,
                SubmissionDate = now,
                CreationDate = now,
            };
            _context.InternshipVerifications.Add(verification);
            await _context.SaveChangesAsync();
            return Ok(new { verification.Id, verification.Status });
        }

        // ---------- Approver (roles 10/20/50) ----------

        /// <summary>List pending/reviewable verifications for an approver.</summary>
        [HttpGet("pending")]
        public async Task<IActionResult> Pending(int? status)
        {
            if (!HasApprovalRole()) return Forbid();
            var query = _context.InternshipVerifications.AsNoTracking();
            if (status.HasValue) query = query.Where(v => v.Status == status.Value);
            var list = await query
                .OrderByDescending(v => v.SubmissionDate)
                .Select(v => new { v.Id, v.StudentName, v.StudentCode, v.Company, v.Role, v.Period, v.CompanyAddress, v.MentorName, v.Status, v.ApprovalName, v.Note, v.SubmissionDate, v.ApprovalDate })
                .ToListAsync();
            return Ok(list);
        }

        /// <summary>Download the uploaded signed document (approver or the owning student).</summary>
        [HttpGet("{id:guid}/file")]
        public async Task<IActionResult> File(Guid id)
        {
            var verification = await _context.InternshipVerifications.FindAsync(id);
            if (verification == null) return NotFound();
            if (!HasApprovalRole() && verification.StudentId != GetUserId()) return Forbid();
            return File(verification.DocumentBytes, verification.ContentType, verification.FileName);
        }

        /// <summary>Approve an internship verification (marks it Đã xác thực).</summary>
        [HttpPost("{id:guid}/approve")]
        public async Task<IActionResult> Approve(Guid id, [FromBody] ReviewRequest request)
        {
            return await Review(id, 1, request?.Note);
        }

        /// <summary>Reject an internship verification.</summary>
        [HttpPost("{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] ReviewRequest request)
        {
            return await Review(id, 2, request?.Note);
        }

        private async Task<IActionResult> Review(Guid id, int newStatus, string? note)
        {
            if (!HasApprovalRole()) return Forbid();
            var verification = await _context.InternshipVerifications.FindAsync(id);
            if (verification == null) return NotFound();

            var approverId = GetUserId();
            var approverName = await _context.Users.Where(u => u.Id == approverId).Select(u => u.FullName).FirstOrDefaultAsync();

            verification.Status = newStatus;
            verification.ApproverId = approverId == Guid.Empty ? null : approverId;
            verification.ApprovalName = string.IsNullOrWhiteSpace(approverName) ? null : approverName;
            verification.Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
            verification.ApprovalDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { verification.Id, verification.Status, verification.ApprovalName, verification.Note });
        }

        // ---------- Helpers ----------

        private Guid GetUserId() => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;

        private bool HasApprovalRole()
        {
            var role = int.TryParse(User.FindFirstValue(ClaimTypes.Role), out var r) ? r : 0;
            return ApprovalRoles.Contains(role);
        }
    }

    public class SubmitVerificationRequest
    {
        public string? StudentName { get; set; }
        public string? StudentCode { get; set; }
        public string? Company { get; set; }
        public string? Role { get; set; }
        public string? Period { get; set; }
        public string? CompanyAddress { get; set; }
        public string? MentorName { get; set; }
        public string? Description { get; set; }
        public string? ContentType { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? File { get; set; }
    }

    public class ReviewRequest
    {
        public string? Note { get; set; }
    }
}
