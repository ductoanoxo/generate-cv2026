using backend.DTOs.Student;
using backend.Data;
using backend.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class StudentDashboardService : IStudentDashboardService
    {
        private readonly AppDbContext _context;

        public StudentDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<StudentDashboardDto> GetStudentDashboardAsync(Guid studentId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Major)
                .Include(s => s.AcademicYear)
                .FirstOrDefaultAsync(s => (s.Id == studentId || s.UserId == studentId) && !s.IsDeleted);

            if (student == null)
            {
                return new StudentDashboardDto();
            }

            var actualStudentId = student.Id;
            var actualUserId = student.UserId;

            var profile = await GetStudentProfileInternalAsync(student, actualStudentId);
            var todaySchedules = await GetTodaySchedulesInternalAsync(actualStudentId);
            var attendanceStats = await GetAttendanceStatsInternalAsync(actualStudentId);
            var examResults = await GetExamResultsInternalAsync(actualStudentId);
            var currentSubjects = await GetCurrentSubjectsInternalAsync(actualStudentId);
            var announcements = await GetAnnouncementsInternalAsync(actualUserId, actualStudentId);

            return new StudentDashboardDto
            {
                Profile = profile,
                TodaySchedules = todaySchedules,
                AttendanceStats = attendanceStats,
                ExamResults = examResults,
                CurrentSubjects = currentSubjects,
                Announcements = announcements
            };
        }

        public async Task<StudentProfileDto?> GetStudentProfileAsync(Guid studentId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Major)
                .Include(s => s.AcademicYear)
                .FirstOrDefaultAsync(s => (s.Id == studentId || s.UserId == studentId) && !s.IsDeleted);

            if (student == null)
            {
                return null;
            }

            return await GetStudentProfileInternalAsync(student, student.Id);
        }

        public async Task<IEnumerable<StudentAnnouncementDto>> GetStudentAnnouncementsAsync(Guid studentId)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => (s.Id == studentId || s.UserId == studentId) && !s.IsDeleted);

            if (student == null)
            {
                return Enumerable.Empty<StudentAnnouncementDto>();
            }

            return await GetAnnouncementsInternalAsync(student.UserId, student.Id);
        }

        public async Task<IEnumerable<StudentSemesterScoreDto>> GetStudentScoresBySemesterAsync(Guid studentId)
        {
            var student = await _context.Students
                .Include(s => s.Major)
                .FirstOrDefaultAsync(s => (s.Id == studentId || s.UserId == studentId) && !s.IsDeleted);

            if (student == null)
            {
                return Enumerable.Empty<StudentSemesterScoreDto>();
            }

            var semesters = await _context.SemesterPlans
                .Include(sp => sp.AcademicYear)
                .Where(sp => sp.MajorId == student.MajorId && !sp.IsDeleted)
                .OrderByDescending(sp => sp.StartDate)
                .ToListAsync();

            var facultyId = student.Major?.FacultyId;

            // Fetch all exam results for the student in a single query with necessary includes
            var allExamResults = await _context.ExamResults
                .Include(er => er.SubjectTeachingExam)
                    .ThenInclude(ste => ste.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                .Where(er => er.StudentId == student.Id 
                    && !er.IsDeleted
                    && er.SubjectTeachingExam != null 
                    && !er.SubjectTeachingExam.IsDeleted 
                    && er.SubjectTeachingExam.SubjectTeaching != null 
                    && !er.SubjectTeachingExam.SubjectTeaching.IsDeleted
                    && er.SubjectTeachingExam.SubjectTeaching.Subject != null
                    && !er.SubjectTeachingExam.SubjectTeaching.Subject.IsDeleted)
                .ToListAsync();

            var resultList = new List<StudentSemesterScoreDto>();
            foreach (var semester in semesters)
            {
                var startDateUtc = DateTime.SpecifyKind(semester.StartDate, DateTimeKind.Utc);
                var endDateUtc = DateTime.SpecifyKind(semester.EndDate, DateTimeKind.Utc);

                // Filter exam results for the current semester in-memory
                var semesterResults = allExamResults
                    .Where(er => er.SubjectTeachingExam.SubjectTeaching.StartDate >= startDateUtc
                        && er.SubjectTeachingExam.SubjectTeaching.EndDate <= endDateUtc
                        && (facultyId == null || er.SubjectTeachingExam.SubjectTeaching.Subject.FacultyId == facultyId))
                    .ToList();

                var subjectGroups = semesterResults
                    .GroupBy(er => er.SubjectTeachingExam.SubjectTeaching.Subject.SubjectCode)
                    .ToList();

                var subjectScores = new List<StudentSubjectScoreDto>();
                foreach (var group in subjectGroups)
                {
                    var er = group
                        .OrderByDescending(x => x.CombinedResult.HasValue)
                        .ThenByDescending(x => x.SubjectTeachingExam.StartDate)
                        .FirstOrDefault();

                    if (er != null)
                    {
                        var exam = er.SubjectTeachingExam;

                        var components = group
                            .Select(c => {
                                var name = c.SubjectTeachingExam.Name.ToLower();
                                var type = c.SubjectTeachingExam.Type;
                                double weight = 0.0;
                                // if (name.Contains("cuối") || name.Contains("cuoi") || name.Contains("thi học kỳ") || name.Contains("thi hoc ky"))
                                if (type == 3)
                                {
                                    weight = 0.6;
                                    name = "Điểm cuối kỳ";
                                }
                                // else if (name.Contains("giữa") || name.Contains("giua"))
                                else if (type == 2)
                                {
                                    weight = 0.4;
                                    name = "Điểm giữa kỳ";
                                }
                                // else if (name.Contains("thường") || name.Contains("thuong") || name.Contains("chuyên") || name.Contains("chuyen"))
                                else if (type == 1)
                                {
                                    weight = 0.1;
                                    name = "Điểm thường xuyên";
                                }

                                return new ComponentScoreDto
                                {
                                    ComponentName = name,
                                    Score = c.Result.HasValue ? (double)c.Result.Value : null,
                                    Weight = weight
                                };
                            })
                            .ToList();

                        // Calculate dynamically weighted CombinedResult (Điểm TK)
                        double sumScores = 0;
                        double sumWeights = 0;
                        bool hasComponent = false;
                        foreach (var comp in components)
                        {
                            if (comp.Score.HasValue && comp.Weight > 0)
                            {
                                sumScores += comp.Score.Value * comp.Weight;
                                sumWeights += comp.Weight;
                                hasComponent = true;
                            }
                        }

                        double? calculatedCombinedResult = hasComponent && sumWeights > 0 ? (sumScores / sumWeights) : null;
                        
                        // Fallback logic for calculating grades
                        var scoreForGrade = calculatedCombinedResult.HasValue ? calculatedCombinedResult.Value : (er.CombinedResult.HasValue ? (double)er.CombinedResult.Value : (er.Result.HasValue ? (double)er.Result.Value : (double?)null));
                        var gradeC = CalculateGradeC(scoreForGrade);

                        var subjectScoreDto = new StudentSubjectScoreDto
                        {
                            SubjectName = exam.SubjectTeaching.Subject.Name,
                            SubjectCode = exam.SubjectTeaching.Subject.SubjectCode,
                            CreditPoint = exam.SubjectTeaching.Subject.CreditPoint,
                            Result = er.Result.HasValue ? (double)er.Result.Value : null,
                            CombinedResult = scoreForGrade,
                            GradeBand = GetGradeBandForSemester(er.Result.HasValue ? (double)er.Result.Value : null),
                            GradeC = gradeC,
                            Grade4 = CalculateGrade4(gradeC),
                            ResultIcon = gradeC == "N/A" ? "-" : (gradeC == "F" ? "✗" : "✓"),
                            DetailAction = "view",
                            Components = components
                        };
                        subjectScores.Add(subjectScoreDto);
                    }
                }

                double? semesterGpa = null;
                var gradedSubjects = subjectScores.Where(s => s.CombinedResult.HasValue || s.Result.HasValue).ToList();
                if (gradedSubjects.Any())
                {
                    semesterGpa = gradedSubjects.Average(s => s.CombinedResult ?? s.Result!.Value);
                }

                resultList.Add(new StudentSemesterScoreDto
                {
                    SemesterName = $"HK{semester.Semester} - Năm học {semester.AcademicYear.Year}/{semester.AcademicYear.Year + 1} - Từ {semester.StartDate:dd/MM/yyyy} đến {semester.EndDate:dd/MM/yyyy}",
                    AcademicYear = semester.AcademicYear.Name,
                    Subjects = subjectScores,
                    SemesterGpa = semesterGpa
                });
            }

            return resultList;
        }

        private static string CalculateGradeC(double? score)
        {
            if (!score.HasValue) return "N/A";
            var s = score.Value;
            if (s >= 8.5) return "A";
            if (s >= 7.0) return "B";
            if (s >= 5.5) return "C";
            if (s >= 4.0) return "D";
            return "F";
        }

        private static int CalculateGrade4(string gradeC)
        {
            return gradeC switch
            {
                "A" => 4,
                "B" => 3,
                "C" => 2,
                "D" => 1,
                "F" => 0,
                _ => 0
            };
        }

        private static string ToRoman(int semester)
        {
            return semester switch
            {
                1 => "I",
                2 => "II",
                3 => "III",
                _ => semester.ToString()
            };
        }

        private static string GetGradeBandForSemester(double? result)
        {
            if (!result.HasValue) return "N/A";
            var score = result.Value;
            if (score >= 8.0) return "Giỏi (8+)";
            if (score >= 6.5) return "Khá (6.5-8)";
            if (score >= 5.0) return "TB (5-6.5)";
            if (score >= 4.0) return "Yếu (4-5)";
            return "Kém (<4)";
        }

        private async Task<StudentProfileDto> GetStudentProfileInternalAsync(Student student, Guid actualStudentId)
        {
            var examResults = await _context.ExamResults
                .Where(er => er.StudentId == actualStudentId && !er.IsDeleted)
                .ToListAsync();

            double gpa = 0.0;
            if (examResults.Any())
            {
                var validResults = examResults.Where(er => er.Result.HasValue).ToList();
                if (validResults.Any())
                {
                    gpa = validResults.Average(er => (double)er.Result!.Value);
                }
            }

            string? genderStr = null;
            if (student.Gender.HasValue)
            {
                if (student.Gender == 1) genderStr = "Nam";
                else if (student.Gender == 2) genderStr = "Nữ";
                else genderStr = "Khác";
            }

            return new StudentProfileDto
            {
                FullName = student.User != null ? student.User.FullName : "N/A",
                StudentCode = student.User != null ? student.User.UserInternalId : "N/A",
                MajorName = student.Major != null ? student.Major.Name : "N/A",
                AcademicYearName = student.AcademicYear != null ? student.AcademicYear.Name : "N/A",
                BirthDate = student.User?.BirthDate,
                Gender = genderStr,
                Email = student.User != null ? student.User.UserName : "N/A",
                ProfilePicUrl = student.User?.ProfilePicUrl,
                PlaceOfBirth = student.PlaceOfBirth,
                Hometown = student.Hometown,
                Ethnicity = student.Ethnicity,
                Religion = student.Religion,
                StudyStatus = student.StudyStatus,
                Gpa = gpa,
                PhoneNumber = student.User?.Mobile,
                Cccd = student.User?.IdentificationNumber
            };
        }

        private async Task<IEnumerable<StudentScheduleDto>> GetTodaySchedulesInternalAsync(Guid actualStudentId)
        {
            var subjectTeachingIds = await _context.SubjectStudents
                .Where(ss => ss.StudentId == actualStudentId)
                .Select(ss => ss.SubjectTeachingId)
                .ToListAsync();

            var todayDate = DateTime.UtcNow.Date;

            var schedules = await _context.SubjectSchedules
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Include(ss => ss.Room)
                .Include(ss => ss.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(ss => subjectTeachingIds.Contains(ss.SubjectTeachingId)
                    && !ss.IsDeleted)
                .ToListAsync();

            return schedules
                .Where(ss => ss.StartDateTime.Date == todayDate)
                .Select(ss => new StudentScheduleDto
                {
                    Id = ss.Id.ToString(),
                    SubjectTeachingName = ss.SubjectTeaching != null ? ss.SubjectTeaching.Name : "N/A",
                    SubjectName = ss.SubjectTeaching != null && ss.SubjectTeaching.Subject != null ? ss.SubjectTeaching.Subject.Name : "N/A",
                    ClassCode = ss.SubjectTeaching != null ? ss.SubjectTeaching.Name : "N/A",
                    Room = ss.Room != null ? ss.Room.Name : "N/A",
                    RoomName = ss.Room != null ? ss.Room.Name : "N/A",
                    DayOfWeek = (int)ss.StartDateTime.DayOfWeek == 0 ? 8 : (int)ss.StartDateTime.DayOfWeek + 1,
                    StartTime = ss.StartDateTime,
                    EndTime = ss.EndDateTime,
                    SlotStart = GetSlotFromTime(ss.StartDateTime.TimeOfDay),
                    SlotEnd = GetSlotFromTime(ss.EndDateTime.TimeOfDay),
                    TeacherName = ss.Teacher != null && ss.Teacher.User != null ? ss.Teacher.User.FullName : "N/A"
                })
                .ToList();
        }

        private async Task<IEnumerable<StudentAttendanceStatDto>> GetAttendanceStatsInternalAsync(Guid actualStudentId)
        {
            var attendances = await _context.Attendances
                .Where(a => a.StudentId == actualStudentId)
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var presentCount = attendances.FirstOrDefault(g => g.Status == 1)?.Count ?? 0;
            var lateCount = attendances.FirstOrDefault(g => g.Status == 2)?.Count ?? 0;
            var excusedCount = attendances.FirstOrDefault(g => g.Status == 3)?.Count ?? 0;
            var unexcusedCount = attendances.FirstOrDefault(g => g.Status == 4)?.Count ?? 0;

            return new List<StudentAttendanceStatDto>
            {
                new() { Name = "Có mặt", Value = presentCount, Color = "#22C55E" },
                new() { Name = "Đi trễ", Value = lateCount, Color = "#EAB308" },
                new() { Name = "Vắng có phép", Value = excusedCount, Color = "#3B82F6" },
                new() { Name = "Vắng không phép", Value = unexcusedCount, Color = "#EF4444" }
            };
        }

        private async Task<IEnumerable<StudentExamResultDto>> GetExamResultsInternalAsync(Guid actualStudentId)
        {
            var results = await _context.ExamResults
                .Include(er => er.SubjectTeachingExam)
                    .ThenInclude(ste => ste.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                .Where(er => er.StudentId == actualStudentId && !er.IsDeleted 
                    && er.SubjectTeachingExam != null 
                    && !er.SubjectTeachingExam.IsDeleted 
                    && er.SubjectTeachingExam.SubjectTeaching != null 
                    && !er.SubjectTeachingExam.SubjectTeaching.IsDeleted)
                .ToListAsync();

            return results.Select(er => new StudentExamResultDto
            {
                SubjectTeachingExamName = er.SubjectTeachingExam != null ? er.SubjectTeachingExam.Name : "N/A",
                SubjectName = er.SubjectTeachingExam != null && er.SubjectTeachingExam.SubjectTeaching != null && er.SubjectTeachingExam.SubjectTeaching.Subject != null ? er.SubjectTeachingExam.SubjectTeaching.Subject.Name : "N/A",
                Result = er.Result,
                CombinedResult = er.CombinedResult,
                ExamDate = er.SubjectTeachingExam != null ? er.SubjectTeachingExam.StartDate : DateTime.MinValue,
                GradeBand = GetGradeBand(er.Result)
            }).ToList();
        }

        private async Task<IEnumerable<StudentSubjectDto>> GetCurrentSubjectsInternalAsync(Guid actualStudentId)
        {
            var subjects = await _context.SubjectStudents
                .Include(ss => ss.SubjectTeaching)
                    .ThenInclude(st => st.Subject)
                .Where(ss => ss.StudentId == actualStudentId && ss.SubjectTeaching != null && !ss.SubjectTeaching.IsDeleted)
                .ToListAsync();

            var list = new List<StudentSubjectDto>();
            foreach (var ss in subjects)
            {
                if (ss.SubjectTeaching == null || ss.SubjectTeaching.Subject == null) continue;

                var teacherName = await _context.SubjectTeachingTeachers
                    .Where(stt => stt.SubjectTeachingId == ss.SubjectTeachingId && !stt.IsDeleted && stt.Teacher != null && stt.Teacher.User != null)
                    .Select(stt => stt.Teacher != null && stt.Teacher.User != null ? stt.Teacher.User.FullName : "N/A")
                    .FirstOrDefaultAsync() ?? "N/A";

                var completedSessions = await _context.SubjectSchedules
                    .CountAsync(sch => sch.SubjectTeachingId == ss.SubjectTeachingId && sch.EndDateTime <= DateTime.UtcNow && !sch.IsDeleted);

                list.Add(new StudentSubjectDto
                {
                    SubjectTeachingId = ss.SubjectTeachingId,
                    SubjectName = ss.SubjectTeaching.Subject.Name,
                    SubjectCode = ss.SubjectTeaching.Subject.SubjectCode,
                    ClassCode = ss.SubjectTeaching.Name,
                    CreditPoint = ss.SubjectTeaching.Subject.CreditPoint,
                    TeacherName = teacherName,
                    TotalSessions = ss.SubjectTeaching.TotalSessions,
                    CompletedSessions = completedSessions
                });
            }

            return list;
        }

        private async Task<IEnumerable<StudentAnnouncementDto>> GetAnnouncementsInternalAsync(Guid actualUserId, Guid actualStudentId)
        {
            var userIdStr = actualUserId.ToString();
            var studentIdStr = actualStudentId.ToString();

            return await _context.UserAnnouncements
                .Where(a => !a.IsDeleted && (a.UserIds.Contains(userIdStr) || a.UserIds.Contains(studentIdStr)))
                .OrderByDescending(a => a.CreationDate)
                .Select(a => new StudentAnnouncementDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    Message = a.Message,
                    CreationDate = a.CreationDate,
                    DeepLink = a.DeepLink,
                    DeepLinkParam = a.DeepLinkParam,
                    Status = a.Status,
                    EnforceRead = a.EnforceRead,
                    NotificationType = a.NotificationType
                })
                .ToListAsync();
        }

        private static string GetGradeBand(float? result)
        {
            if (!result.HasValue) return "N/A";
            var score = result.Value;
            if (score >= 9.0f) return "Xuất sắc";
            if (score >= 8.0f) return "Giỏi";
            if (score >= 6.5f) return "Khá";
            if (score >= 5.0f) return "Trung bình";
            return "Yếu";
        }

        private static int GetSlotFromTime(TimeSpan time)
        {
            if (time.Hours < 7) return 1;
            if (time.Hours >= 18) return 12;

            if (time.Hours < 12)
            {
                int minutes = (int)(time - new TimeSpan(7, 30, 0)).TotalMinutes;
                if (minutes < 0) return 1;
                int slot = (minutes / 50) + 1;
                return Math.Clamp(slot, 1, 5);
            }
            else if (time.Hours < 17)
            {
                int minutes = (int)(time - new TimeSpan(13, 0, 0)).TotalMinutes;
                if (minutes < 0) return 6;
                int slot = (minutes / 50) + 6;
                return Math.Clamp(slot, 6, 10);
            }
            else
            {
                int minutes = (int)(time - new TimeSpan(17, 30, 0)).TotalMinutes;
                if (minutes < 0) return 11;
                int slot = (minutes / 50) + 11;
                return Math.Clamp(slot, 11, 12);
            }
        }
    }
}
