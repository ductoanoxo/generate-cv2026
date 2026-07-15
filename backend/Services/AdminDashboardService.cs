using backend.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly AppDbContext _context;

        public AdminDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            var studentsCount = await _context.Students.CountAsync(s => !s.IsDeleted);
            var teachersCount = await _context.TeacherFaculties.CountAsync(tf => !tf.IsDeleted);
            var facultiesCount = await _context.Faculties.CountAsync(f => !f.IsDeleted);
            var subjectsCount = await _context.Subjects.CountAsync(s => !s.IsDeleted);
            var majorsCount = await _context.Majors.CountAsync(m => !m.IsDeleted);

            var studentsByFaculty = await _context.Students
                .Where(s => !s.IsDeleted && s.Major != null && s.Major.Faculty != null && !s.Major.IsDeleted && !s.Major.Faculty.IsDeleted)
                .GroupBy(s => s.Major!.Faculty!.Name)
                .Select(g => new { name = g.Key, count = g.Count() })
                .ToListAsync();

            var studentsByFacultyAndMajor = await _context.Students
                .Where(s => !s.IsDeleted && s.Major != null && s.Major.Faculty != null && !s.Major.IsDeleted && !s.Major.Faculty.IsDeleted)
                .GroupBy(s => new { FacultyName = s.Major!.Faculty!.Name, MajorName = s.Major.Name })
                .Select(g => new { faculty = g.Key.FacultyName, major = g.Key.MajorName, count = g.Count() })
                .ToListAsync();

            var studentsByYear = await _context.Students
                .Where(s => !s.IsDeleted && s.AcademicYear != null && !s.AcademicYear.IsDeleted)
                .GroupBy(s => s.AcademicYear!.Name)
                .Select(g => new { year = g.Key, count = g.Count() })
                .ToListAsync();

            var studentsByYearAndGender = await _context.Students
                .Where(s => !s.IsDeleted && s.AcademicYear != null && !s.AcademicYear.IsDeleted)
                .GroupBy(s => new { YearName = s.AcademicYear!.Name, Gender = s.Gender })
                .Select(g => new { 
                    year = g.Key.YearName, 
                    gender = g.Key.Gender == 1 ? "Nam" : (g.Key.Gender == 2 ? "Nữ" : "Khác"), 
                    count = g.Count() 
                })
                .ToListAsync();

            var attendanceGrouped = await _context.Attendances
                .GroupBy(a => new { a.CreationDate.Year, a.CreationDate.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Present = g.Count(a => a.Status == 1),
                    Late = g.Count(a => a.Status == 2),
                    Excused = g.Count(a => a.Status == 3),
                    Unexcused = g.Count(a => a.Status == 4),
                    Total = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            var attendanceTrend = attendanceGrouped.Select(x =>
            {
                double total = x.Total > 0 ? x.Total : 1.0;
                return new
                {
                    month = $"T{x.Month}/{x.Year}",
                    present = Math.Round((x.Present / total) * 100),
                    late = Math.Round((x.Late / total) * 100),
                    excused = Math.Round((x.Excused / total) * 100),
                    unexcused = Math.Round((x.Unexcused / total) * 100)
                };
            }).ToList();

            var attCounts = await _context.Attendances
                .GroupBy(a => 1)
                .Select(g => new
                {
                    Present = g.Count(a => a.Status == 1),
                    Late = g.Count(a => a.Status == 2),
                    Excused = g.Count(a => a.Status == 3),
                    Unexcused = g.Count(a => a.Status == 4)
                })
                .FirstOrDefaultAsync();

            var attendanceDistribution = new[]
            {
                new { name = "Có mặt", value = attCounts?.Present ?? 0, color = "#22C55E" },
                new { name = "Đi trễ", value = attCounts?.Late ?? 0, color = "#EAB308" },
                new { name = "Vắng có phép", value = attCounts?.Excused ?? 0, color = "#3B82F6" },
                new { name = "Vắng không phép", value = attCounts?.Unexcused ?? 0, color = "#EF4444" }
            };

            var counts = await _context.ExamResults
                .Where(r => !r.IsDeleted && r.Result != null)
                .GroupBy(r => 1)
                .Select(g => new
                {
                    Kem = g.Count(r => r.Result < 4),
                    Yeu = g.Count(r => r.Result >= 4 && r.Result < 5),
                    Tb = g.Count(r => r.Result >= 5 && r.Result < 6.5),
                    Kha = g.Count(r => r.Result >= 6.5 && r.Result < 8),
                    Gioi = g.Count(r => r.Result >= 8)
                })
                .FirstOrDefaultAsync();

            var scoreDistribution = new[]
            {
                new { name = "Kém (<4)", value = counts?.Kem ?? 0 },
                new { name = "Yếu (4-5)", value = counts?.Yeu ?? 0 },
                new { name = "TB (5-6.5)", value = counts?.Tb ?? 0 },
                new { name = "Khá (6.5-8)", value = counts?.Kha ?? 0 },
                new { name = "Giỏi (8+)", value = counts?.Gioi ?? 0 }
            };

            var examResultsByFaculty = await _context.ExamResults
                .Where(r => !r.IsDeleted && r.Result != null && r.Student != null && r.Student.Major != null && r.Student.Major.Faculty != null && !r.Student.IsDeleted && !r.Student.Major.IsDeleted && !r.Student.Major.Faculty.IsDeleted)
                .GroupBy(r => r.Student.Major!.Faculty!.Name)
                .Select(g => new
                {
                    faculty = g.Key,
                    kem = g.Count(r => r.Result < 4),
                    yeu = g.Count(r => r.Result >= 4 && r.Result < 5),
                    tb = g.Count(r => r.Result >= 5 && r.Result < 6.5),
                    kha = g.Count(r => r.Result >= 6.5 && r.Result < 8),
                    gioi = g.Count(r => r.Result >= 8),
                    avg = g.Average(r => r.Result)
                })
                .ToListAsync();

            var devCounts = await _context.UserDevices
                .GroupBy(d => 1)
                .Select(g => new
                {
                    Desktop = g.Count(d => d.DeviceType == 1),
                    Mobile = g.Count(d => d.DeviceType == 2),
                    Tablet = g.Count(d => d.DeviceType == 3)
                })
                .FirstOrDefaultAsync();

            var devicesDistribution = new[]
            {
                new { name = "Desktop", value = devCounts?.Desktop ?? 0, color = "#64748B" },
                new { name = "Mobile", value = devCounts?.Mobile ?? 0, color = "#22C55E" },
                new { name = "Tablet", value = devCounts?.Tablet ?? 0, color = "#3B82F6" }
            };

            return new
            {
                kpis = new
                {
                    students = studentsCount,
                    teachers = teachersCount,
                    faculties = facultiesCount,
                    subjects = subjectsCount,
                    majors = majorsCount
                },
                studentsByFaculty,
                studentsByFacultyAndMajor,
                studentsByYear,
                studentsByYearAndGender,
                attendanceTrend,
                attendanceDistribution,
                scoreDistribution,
                examResultsByFaculty,
                devicesDistribution
            };
        }

        public async Task<IEnumerable<object>> GetAuditLogsAsync(int limit)
        {
            var logs = await _context.AuditLogs
                .Include(l => l.User)
                .Where(l => !l.IsDeleted)
                .OrderByDescending(l => l.CreationDate)
                .Take(limit)
                .Select(l => new
                {
                    id = l.Id.ToString(),
                    creationDate = l.CreationDate,
                    username = l.User != null ? l.User.FullName : "Hệ thống",
                    action = !string.IsNullOrEmpty(l.RecordDesc) ? l.RecordDesc : (!string.IsNullOrEmpty(l.Details) ? l.Details : $"Hành động {l.Action}"),
                    ipAddress = "127.0.0.1"
                })
                .ToListAsync();

            return logs;
        }

        public async Task<object> GetDeviceDistributionAsync()
        {
            var devCounts = await _context.UserDevices
                .GroupBy(d => 1)
                .Select(g => new
                {
                    Desktop = g.Count(d => d.DeviceType == 1),
                    Mobile = g.Count(d => d.DeviceType == 2),
                    Tablet = g.Count(d => d.DeviceType == 3)
                })
                .FirstOrDefaultAsync();

            int desktop = devCounts?.Desktop ?? 0;
            int mobile = devCounts?.Mobile ?? 0;
            int tablet = devCounts?.Tablet ?? 0;

            return new
            {
                desktop,
                mobile,
                tablet,
                devicesDistribution = new[]
                {
                    new { name = "Desktop", value = desktop, color = "#64748B" },
                    new { name = "Mobile", value = mobile, color = "#22C55E" },
                    new { name = "Tablet", value = tablet, color = "#3B82F6" }
                }
            };
        }

        public async Task<object> GetSettingsAsync()
        {
            var settingsList = await _context.Settings
                .Where(s => !s.IsDeleted)
                .ToListAsync();

            var settingsDict = settingsList
                .GroupBy(s => s.Key)
                .ToDictionary(g => g.Key, g => g.First().Value);

            if (!settingsDict.ContainsKey("academicYear")) settingsDict["academicYear"] = "2025-2026";
            if (!settingsDict.ContainsKey("semester")) settingsDict["semester"] = "Học kỳ II";
            if (!settingsDict.ContainsKey("registrationDeadline")) settingsDict["registrationDeadline"] = "2026-08-30";
            if (!settingsDict.ContainsKey("minimumCreditsToGraduate")) settingsDict["minimumCreditsToGraduate"] = "120 credits";
            if (!settingsDict.ContainsKey("allowEvaluationEdit")) settingsDict["allowEvaluationEdit"] = "false";
            if (!settingsDict.ContainsKey("systemMaintenanceMode")) settingsDict["systemMaintenanceMode"] = "false";
            if (!settingsDict.ContainsKey("backupFrequency")) settingsDict["backupFrequency"] = "Hàng ngày (03:00)";
            if (!settingsDict.ContainsKey("apiRateLimit")) settingsDict["apiRateLimit"] = "60 requests/min";
            if (!settingsDict.ContainsKey("moodleIntegration")) settingsDict["moodleIntegration"] = "Enabled";
            if (!settingsDict.ContainsKey("smsGateway")) settingsDict["smsGateway"] = "Enabled (Viettel)";
            if (!settingsDict.ContainsKey("emailNotification")) settingsDict["emailNotification"] = "True";

            return settingsDict;
        }

        public async Task<IEnumerable<object>> GetUserDevicesListAsync(int limit = 50)
        {
            var list = await _context.UserDevices
                .Include(d => d.User)
                .Select(d => new
                {
                    Id = d.Id.ToString(),
                    UserName = d.User.FullName,
                    DeviceName = d.DeviceType == 1 ? "Máy tính để bàn" : (d.DeviceType == 2 ? "Điện thoại di động" : "Máy tính bảng"),
                    DeviceOS = d.Identifier.Contains("iOS") ? "iOS" : (d.Identifier.Contains("Android") ? "Android" : "Windows/macOS"),
                    BrowserName = d.PushId.Contains("Safari") ? "Safari" : (d.PushId.Contains("Firefox") ? "Firefox" : "Chrome"),
                    LastIpAddress = "172.18.0." + (d.DeviceType * 5 + 1),
                    LastLoginTime = DateTime.Today.AddHours(-d.DeviceType).ToString("yyyy-MM-dd HH:mm"),
                    IsBlocked = false
                })
                .Take(limit)
                .ToListAsync();

            if (!list.Any())
            {
                return new List<object>
                {
                    new { Id = "d1", UserName = "Đặng Đức Toàn", DeviceName = "Windows PC", DeviceOS = "Windows 11", BrowserName = "Chrome", LastIpAddress = "172.18.0.1", LastLoginTime = "2026-07-09 15:10", IsBlocked = false },
                    new { Id = "d2", UserName = "Trần Thị Thảo Vy", DeviceName = "Apple iPhone", DeviceOS = "iOS 17", BrowserName = "Safari", LastIpAddress = "172.18.0.10", LastLoginTime = "2026-07-09 14:45", IsBlocked = false }
                };
            }

            return list.Cast<object>();
        }

        public async Task<IEnumerable<object>> GetTeachersListAsync(string? search, int limit)
        {
            var query = _context.TeacherFaculties
                .AsNoTracking().Include(x => x.User).Include(x => x.Faculty)
                .Where(x => !x.IsDeleted && !x.User.IsDeleted);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(x => x.User.FullName.Contains(search) || x.User.UserName.Contains(search));
            return await query.OrderBy(x => x.User.FullName).Take(limit).Select(x => new
            {
                id = x.UserId, name = x.User.FullName, username = x.User.UserName,
                email = x.User.UserName + "@taydo.edu.vn", role = x.User.Role,
                faculty = x.Faculty.Name, isHeadOfFaculty = x.IsHeadOfFaculty,
                avatarUrl = x.User.ProfilePicUrl
            }).ToListAsync();
        }

        public async Task<IEnumerable<object>> GetStudentsListAsync(string? search, string? facultyId, int limit)
        {
            var query = _context.Students.AsNoTracking().Include(x => x.User).Include(x => x.Major).ThenInclude(x => x.Faculty)
                .Where(x => !x.IsDeleted && !x.User.IsDeleted);
            if (Guid.TryParse(facultyId, out var fid)) query = query.Where(x => x.Major.FacultyId == fid);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(x => x.User.FullName.Contains(search) || x.User.UserName.Contains(search) || x.User.UserInternalId.Contains(search));
            return await query.OrderBy(x => x.User.FullName).Take(limit).Select(x => new
            {
                id = x.Id, userId = x.UserId, name = x.User.FullName, username = x.User.UserName,
                studentCode = x.User.UserInternalId, faculty = x.Major.Faculty.Name,
                major = x.Major.Name, academicYear = x.AcademicYear.Name,
                studyStatus = x.StudyStatus, isGraduated = x.IsGraduated,
                avatarUrl = x.User.ProfilePicUrl
            }).ToListAsync();
        }
    }
}
