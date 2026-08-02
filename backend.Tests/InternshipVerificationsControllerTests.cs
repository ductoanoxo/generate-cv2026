using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using backend.Controllers;
using backend.Data;
using backend.Data.Entities;

namespace backend.Tests
{
    public class InternshipVerificationsControllerTests
    {
        private AppDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private InternshipVerificationsController NewController(AppDbContext context, int role, Guid userId)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, "reviewer"),
                new Claim(ClaimTypes.Role, role.ToString())
            };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
            var controller = new InternshipVerificationsController(context)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext { User = principal }
                }
            };
            return controller;
        }

        [Fact]
        public async Task Submit_ThenApprove_ThenReject_Flow()
        {
            using var context = GetInMemoryDbContext();
            var studentId = Guid.NewGuid();
            var approverId = Guid.NewGuid();

            context.Users.Add(new User
            {
                Id = approverId,
                UserName = "gv_nam",
                PasswordHash = "hash",
                PasswordSalt = new byte[] { 1 },
                FullName = "ThS. Lê Hoàng Nam",
                UserInternalId = "T01",
                Role = 10,
                IsActived = true,
                IsDeleted = false
            });
            await context.SaveChangesAsync();

            // Student submits a signed file
            var studentController = NewController(context, 1, studentId);
            var fileBytes = Encoding.UTF8.GetBytes("PK fake docx content");
            var formFile = new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, "file", "Mau07_TTTN.docx");
            var result = await studentController.Submit(new SubmitVerificationRequest
            {
                StudentName = "Đặng Đức Toàn",
                StudentCode = "SV26001",
                Company = "Công ty ABC",
                Role = "Thực tập sinh Backend",
                Period = "06/2025 - 08/2025",
                MentorName = "Nguyễn Văn Hướng Dẫn",
                File = formFile
            }) as OkObjectResult;

            Assert.NotNull(result);
            var saved = await context.InternshipVerifications.SingleAsync();
            Assert.Equal(0, saved.Status);
            Assert.True(saved.DocumentBytes.Length > 0);

            // Non-approver cannot see pending list
            var studentPending = await studentController.Pending(null);
            Assert.IsType<ForbidResult>(studentPending);

            // The owning student can download their own document
            var ownerFileResult = await studentController.File(saved.Id) as FileContentResult;
            Assert.NotNull(ownerFileResult);
            Assert.Equal(fileBytes, ownerFileResult.FileContents);

            // Approver lists pending
            var approverController = NewController(context, 10, approverId);
            var pendingResult = await approverController.Pending(null) as OkObjectResult;
            Assert.NotNull(pendingResult);

            // Approver downloads the file
            var fileResult = await approverController.File(saved.Id) as FileContentResult;
            Assert.NotNull(fileResult);
            Assert.Equal(fileBytes, fileResult.FileContents);

            // Approve
            var approveResult = await approverController.Approve(saved.Id, new ReviewRequest { Note = "Hồ sơ hợp lệ" }) as OkObjectResult;
            Assert.NotNull(approveResult);
            var approved = await context.InternshipVerifications.SingleAsync();
            Assert.Equal(1, approved.Status);
            Assert.Equal("ThS. Lê Hoàng Nam", approved.ApprovalName);

            // Reject
            var rejectResult = await approverController.Reject(saved.Id, new ReviewRequest { Note = "Thiếu dấu mộc" }) as OkObjectResult;
            Assert.NotNull(rejectResult);
            var rejected = await context.InternshipVerifications.SingleAsync();
            Assert.Equal(2, rejected.Status);
            Assert.Equal("Thiếu dấu mộc", rejected.Note);

            // Student can see their own verification in /mine
            var mineResult = await studentController.Mine() as OkObjectResult;
            Assert.NotNull(mineResult);
        }

        [Fact]
        public async Task Submit_WithoutFile_ReturnsBadRequest()
        {
            using var context = GetInMemoryDbContext();
            var controller = NewController(context, 1, Guid.NewGuid());
            var result = await controller.Submit(new SubmitVerificationRequest
            {
                Company = "Công ty ABC",
                Role = "Intern"
            });
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Submit_EmptyStudentCode_FallsBackToFileSubmission()
        {
            using var context = GetInMemoryDbContext();
            var controller = NewController(context, 1, Guid.NewGuid());
            var fileBytes = Encoding.UTF8.GetBytes("fake");
            var formFile = new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, "file", "signed.docx");
            var result = await controller.Submit(new SubmitVerificationRequest
            {
                StudentName = "Sinh Viên Test",
                File = formFile
            }) as OkObjectResult;
            Assert.NotNull(result);
            var saved = await context.InternshipVerifications.SingleAsync();
            Assert.Equal("Sinh Viên Test", saved.StudentName);
        }
    }
}
