using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Helpers;

namespace backend.Services
{
    public class AuthService(AppDbContext context, IConfiguration configuration) : IAuthService
    {
        public async Task<string?> LoginAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return null;
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.UserName.ToLower() == username.ToLower() && !u.IsDeleted);

            if (user == null || !user.IsActived)
            {
                return null;
            }

            if (!PasswordHelper.VerifyPassword(password, user.PasswordHash, user.PasswordSalt))
            {
                return null;
            }

            // Generate JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = configuration["Jwt:Key"] ?? "YOUR_VERY_SECRET_KEY_HERE_123456789";
            var key = Encoding.UTF8.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<object?> GetCurrentUserAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return null;
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Id == userGuid && !u.IsDeleted);

            if (user == null)
            {
                return null;
            }

            var facultyId = await context.TeacherFaculties
                .Where(t => t.UserId == userGuid && !t.IsDeleted)
                .Select(t => (Guid?)t.FacultyId)
                .FirstOrDefaultAsync();
            if (user.Role == RoleHelper.Dean && !facultyId.HasValue)
            {
                facultyId = await context.Faculties
                    .Where(f => !f.IsDeleted)
                    .OrderBy(f => f.Code)
                    .Select(f => (Guid?)f.Id)
                    .FirstOrDefaultAsync();
            }
            var studentScope = await context.Students
                .Where(s => s.UserId == userGuid && !s.IsDeleted)
                .Select(s => new { s.MajorId, FacultyId = s.Major.FacultyId })
                .FirstOrDefaultAsync();
            var departmentMajorId = facultyId.HasValue
                ? await context.Majors.Where(m => m.FacultyId == facultyId && !m.IsDeleted)
                    .Select(m => (Guid?)m.Id).FirstOrDefaultAsync()
                : null;
            // Department-head seed users may not yet have a TeacherFaculty row.
            // Resolve their department to the first active major so Role 20 can
            // still use the live department APIs instead of the frontend mock path.
            if (user.Role == RoleHelper.DeptHead && !departmentMajorId.HasValue)
            {
                departmentMajorId = await context.Majors
                    .Where(m => !m.IsDeleted)
                    .OrderBy(m => m.Code)
                    .Select(m => (Guid?)m.Id)
                    .FirstOrDefaultAsync();
            }

            return new
            {
                UserId = user.Id.ToString(),
                Username = user.UserName,
                FullName = user.FullName,
                Role = user.Role,
                RoleName = RoleHelper.GetRoleName(user.Role),
                UserInternalId = user.UserInternalId,
                FacultyId = facultyId ?? studentScope?.FacultyId,
                MajorId = studentScope?.MajorId ?? departmentMajorId
            };
        }
    }
}
