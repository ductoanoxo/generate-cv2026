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

            var studentsByFaculty = await _context.Students
                .Where(s => !s.IsDeleted && s.Major != null && s.Major.Faculty != null && !s.Major.IsDeleted && !s.Major.Faculty.IsDeleted)
                .GroupBy(s => s.Major!.Faculty!.Name)
                .Select(g => new { name = g.Key, count = g.Count() })
                .ToListAsync();

            var studentsByYear = await _context.Students
                .Where(s => !s.IsDeleted && s.AcademicYear != null && !s.AcademicYear.IsDeleted)
                .GroupBy(s => s.AcademicYear!.Name)
                .Select(g => new { year = g.Key, count = g.Count() })
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
                new { name = "Desktop", value = devCounts?.Desktop ?? 0, color = "#0F172A" },
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
                    subjects = subjectsCount
                },
                studentsByFaculty,
                studentsByYear,
                attendanceTrend,
                attendanceDistribution,
                scoreDistribution,
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
                    new { name = "Desktop", value = desktop, color = "#0F172A" },
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

            var settingsDict = settingsList.ToDictionary(s => s.Key, s => s.Value);

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
    }
}
