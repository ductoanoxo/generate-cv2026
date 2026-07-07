using Microsoft.EntityFrameworkCore;
using backend.Data.Entities;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<AcademicYear> AcademicYears { get; set; } = null!;
        public DbSet<Attendance> Attendances { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<EvaluationCriteria> EvaluationCriterias { get; set; } = null!;
        public DbSet<ExamAttempt> ExamAttempts { get; set; } = null!;
        public DbSet<ExamQuestionAnswer> ExamQuestionAnswers { get; set; } = null!;
        public DbSet<ExamQuestionSelection> ExamQuestionSelections { get; set; } = null!;
        public DbSet<ExamResult> ExamResults { get; set; } = null!;
        public DbSet<Faculty> Faculties { get; set; } = null!;
        public DbSet<FormRequest> FormRequests { get; set; } = null!;
        public DbSet<FormTemplate> FormTemplates { get; set; } = null!;
        public DbSet<Major> Majors { get; set; } = null!;
        public DbSet<PasswordReset> PasswordResets { get; set; } = null!;
        public DbSet<QuestionAnswer> QuestionAnswers { get; set; } = null!;
        public DbSet<QuestionSuite> QuestionSuites { get; set; } = null!;
        public DbSet<Question> Questions { get; set; } = null!;
        public DbSet<Room> Rooms { get; set; } = null!;
        public DbSet<SemesterPlan> SemesterPlans { get; set; } = null!;
        public DbSet<SemesterSubject> SemesterSubjects { get; set; } = null!;
        public DbSet<SemesterTuition> SemesterTuitions { get; set; } = null!;
        public DbSet<Setting> Settings { get; set; } = null!;
        public DbSet<StudentEvaluationDetail> StudentEvaluationDetails { get; set; } = null!;
        public DbSet<StudentEvaluation> StudentEvaluations { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<SubjectDocument> SubjectDocuments { get; set; } = null!;
        public DbSet<SubjectSchedule> SubjectSchedules { get; set; } = null!;
        public DbSet<SubjectSpecialNote> SubjectSpecialNotes { get; set; } = null!;
        public DbSet<SubjectStudent> SubjectStudents { get; set; } = null!;
        public DbSet<SubjectTeachingExam> SubjectTeachingExams { get; set; } = null!;
        public DbSet<SubjectTeachingTeacher> SubjectTeachingTeachers { get; set; } = null!;
        public DbSet<SubjectTeaching> SubjectTeachings { get; set; } = null!;
        public DbSet<Subject> Subjects { get; set; } = null!;
        public DbSet<TeacherFaculty> TeacherFaculties { get; set; } = null!;
        public DbSet<UserAnnouncement> UserAnnouncements { get; set; } = null!;
        public DbSet<UserDevice> UserDevices { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AcademicYear configuration
            modelBuilder.Entity<AcademicYear>(entity =>
            {
                entity.ToTable("AcademicYears");
                entity.HasKey(e => e.Id);
            });

            // Attendance configuration
            modelBuilder.Entity<Attendance>(entity =>
            {
                entity.ToTable("Attendances");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.CreatedById, "IX_Attendances_CreatedById");
                entity.HasIndex(e => new { e.StudentId, e.SubjectScheduleId }, "IX_Attendances_StudentId_SubjectScheduleId").IsUnique();
                entity.HasIndex(e => e.SubjectScheduleId, "IX_Attendances_SubjectScheduleId");
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectSchedule)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectScheduleId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.CreatedBy)
                    .WithMany()
                    .HasForeignKey(d => d.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // AuditLog configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.CreationDate, "IX_AuditLogs_CreationDate");
                entity.HasIndex(e => e.RecordId, "IX_AuditLogs_RecordId");
                entity.HasIndex(e => e.UserId, "IX_AuditLogs_UserId");
                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // EvaluationCriteria configuration
            modelBuilder.Entity<EvaluationCriteria>(entity =>
            {
                entity.ToTable("EvaluationCriterias");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Score).HasPrecision(18, 2);
                entity.HasIndex(e => e.ParentId, "IX_EvaluationCriterias_ParentId");
                entity.HasIndex(e => e.QuestionId, "IX_EvaluationCriterias_QuestionId");
                entity.HasOne(d => d.Parent)
                    .WithMany()
                    .HasForeignKey(d => d.ParentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Question)
                    .WithMany()
                    .HasForeignKey(d => d.QuestionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // ExamAttempt configuration
            modelBuilder.Entity<ExamAttempt>(entity =>
            {
                entity.ToTable("ExamAttempts");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.StudentId, "IX_ExamAttempts_StudentId");
                entity.HasIndex(e => e.SubjectTeachingExamId, "IX_ExamAttempts_SubjectTeachingExamId");
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeachingExam)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingExamId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ExamQuestionAnswer configuration
            modelBuilder.Entity<ExamQuestionAnswer>(entity =>
            {
                entity.ToTable("ExamQuestionAnswers");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ExamQuestionSelectionId, "IX_ExamQuestionAnswers_ExamQuestionSelectionId");
                entity.HasOne(d => d.ExamQuestionSelection)
                    .WithMany()
                    .HasForeignKey(d => d.ExamQuestionSelectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ExamQuestionSelection configuration
            modelBuilder.Entity<ExamQuestionSelection>(entity =>
            {
                entity.ToTable("ExamQuestionSelections");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ExamAttemptId, "IX_ExamQuestionSelections_ExamAttemptId");
                entity.HasOne(d => d.ExamAttempt)
                    .WithMany()
                    .HasForeignKey(d => d.ExamAttemptId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ExamResult configuration
            modelBuilder.Entity<ExamResult>(entity =>
            {
                entity.ToTable("ExamResults");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ExamAttemptId, "IX_ExamResults_ExamAttemptId");
                entity.HasIndex(e => new { e.StudentId, e.SubjectTeachingExamId }, "IX_ExamResults_StudentId_SubjectTeachingExamId");
                entity.HasIndex(e => e.SubjectTeachingExamId, "IX_ExamResults_SubjectTeachingExamId");
                entity.HasOne(d => d.ExamAttempt)
                    .WithMany()
                    .HasForeignKey(d => d.ExamAttemptId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeachingExam)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingExamId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Faculty configuration
            modelBuilder.Entity<Faculty>(entity =>
            {
                entity.ToTable("Faculties");
                entity.HasKey(e => e.Id);
            });

            // FormRequest configuration
            modelBuilder.Entity<FormRequest>(entity =>
            {
                entity.ToTable("FormRequests");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ApprovalId, "IX_FormRequests_ApprovalId");
                entity.HasIndex(e => e.FormTemplateId, "IX_FormRequests_FormTemplateId");
                entity.HasIndex(e => e.StudentId, "IX_FormRequests_StudentId");
                entity.HasOne(d => d.FormTemplate)
                    .WithMany()
                    .HasForeignKey(d => d.FormTemplateId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Approval)
                    .WithMany()
                    .HasForeignKey(d => d.ApprovalId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // FormTemplate configuration
            modelBuilder.Entity<FormTemplate>(entity =>
            {
                entity.ToTable("FormTemplates");
                entity.HasKey(e => e.Id);
            });

            // Major configuration
            modelBuilder.Entity<Major>(entity =>
            {
                entity.ToTable("Majors");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.FacultyId, "IX_Majors_FacultyId");
                entity.HasOne(d => d.Faculty)
                    .WithMany()
                    .HasForeignKey(d => d.FacultyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // PasswordReset configuration
            modelBuilder.Entity<PasswordReset>(entity =>
            {
                entity.ToTable("PasswordResets");
                entity.HasKey(e => e.Id);
            });

            // QuestionAnswer configuration
            modelBuilder.Entity<QuestionAnswer>(entity =>
            {
                entity.ToTable("QuestionAnswers");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.QuestionId, "IX_QuestionAnswers_QuestionId");
                entity.HasOne(d => d.Question)
                    .WithMany()
                    .HasForeignKey(d => d.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Question configuration
            modelBuilder.Entity<Question>(entity =>
            {
                entity.ToTable("Questions");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.QuestionSuiteId, "IX_Questions_QuestionSuiteId");
                entity.HasOne(d => d.QuestionSuite)
                    .WithMany()
                    .HasForeignKey(d => d.QuestionSuiteId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // QuestionSuite configuration
            modelBuilder.Entity<QuestionSuite>(entity =>
            {
                entity.ToTable("QuestionSuites");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SubjectId, "IX_QuestionSuites_SubjectId");
                entity.HasIndex(e => e.UpdatedById, "IX_QuestionSuites_UpdatedById");
                entity.HasOne(d => d.Subject)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.UpdatedBy)
                    .WithMany()
                    .HasForeignKey(d => d.UpdatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Room configuration
            modelBuilder.Entity<Room>(entity =>
            {
                entity.ToTable("Rooms");
                entity.HasKey(e => e.Id);
            });

            // SemesterPlan configuration
            modelBuilder.Entity<SemesterPlan>(entity =>
            {
                entity.ToTable("SemesterPlans");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.AcademicYearId, "IX_SemesterPlans_AcademicYearId");
                entity.HasIndex(e => e.MajorId, "IX_SemesterPlans_MajorId");
                entity.HasOne(d => d.AcademicYear)
                    .WithMany()
                    .HasForeignKey(d => d.AcademicYearId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Major)
                    .WithMany()
                    .HasForeignKey(d => d.MajorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SemesterSubject configuration
            modelBuilder.Entity<SemesterSubject>(entity =>
            {
                entity.ToTable("SemesterSubjects");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SemesterPlanId, "IX_SemesterSubjects_SemesterPlanId");
                entity.HasIndex(e => e.SubjectId, "IX_SemesterSubjects_SubjectId");
                entity.HasOne(d => d.SemesterPlan)
                    .WithMany()
                    .HasForeignKey(d => d.SemesterPlanId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Subject)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // SemesterTuition configuration
            modelBuilder.Entity<SemesterTuition>(entity =>
            {
                entity.ToTable("SemesterTuitions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.HasIndex(e => e.SemesterPlanId, "IX_SemesterTuitions_SemesterPlanId");
                entity.HasIndex(e => e.StudentId, "IX_SemesterTuitions_StudentId");
                entity.HasOne(d => d.SemesterPlan)
                    .WithMany()
                    .HasForeignKey(d => d.SemesterPlanId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Setting configuration
            modelBuilder.Entity<Setting>(entity =>
            {
                entity.ToTable("Settings");
                entity.HasKey(e => e.Id);
            });

            // StudentEvaluationDetail configuration
            modelBuilder.Entity<StudentEvaluationDetail>(entity =>
            {
                entity.ToTable("StudentEvaluationDetails");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StudentScore).HasPrecision(18, 2);
                entity.Property(e => e.Score).HasPrecision(18, 2);
                entity.HasIndex(e => e.EvaluationCriteriaId, "IX_StudentEvaluationDetails_EvaluationCriteriaId");
                entity.HasIndex(e => e.StudentEvaluationId, "IX_StudentEvaluationDetails_StudentEvaluationId");
                entity.HasOne(d => d.EvaluationCriteria)
                    .WithMany()
                    .HasForeignKey(d => d.EvaluationCriteriaId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.StudentEvaluation)
                    .WithMany()
                    .HasForeignKey(d => d.StudentEvaluationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // StudentEvaluation configuration
            modelBuilder.Entity<StudentEvaluation>(entity =>
            {
                entity.ToTable("StudentEvaluations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalScore).HasPrecision(18, 2);
                entity.HasIndex(e => e.QuestionId, "IX_StudentEvaluations_QuestionId");
                entity.HasIndex(e => e.SemesterPlanId, "IX_StudentEvaluations_SemesterPlanId");
                entity.HasIndex(e => e.StudentId, "IX_StudentEvaluations_StudentId");
                entity.HasIndex(e => e.SubjectTeachingExamId, "IX_StudentEvaluations_SubjectTeachingExamId");
                entity.HasIndex(e => e.SubjectTeachingId, "IX_StudentEvaluations_SubjectTeachingId");
                entity.HasIndex(e => e.TeacherId, "IX_StudentEvaluations_TeacherId");
                entity.HasOne(d => d.Question)
                    .WithMany()
                    .HasForeignKey(d => d.QuestionId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SemesterPlan)
                    .WithMany()
                    .HasForeignKey(d => d.SemesterPlanId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeachingExam)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingExamId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeaching)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Teacher)
                    .WithMany()
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Student configuration
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.AcademicYearId, "IX_Students_AcademicYearId");
                entity.HasIndex(e => e.MajorId, "IX_Students_MajorId");
                entity.HasIndex(e => e.RelativeUserId, "IX_Students_RelativeUserId");
                entity.HasIndex(e => e.UserId, "IX_Students_UserId");
                entity.HasOne(d => d.AcademicYear)
                    .WithMany()
                    .HasForeignKey(d => d.AcademicYearId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Major)
                    .WithMany()
                    .HasForeignKey(d => d.MajorId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.RelativeUser)
                    .WithMany()
                    .HasForeignKey(d => d.RelativeUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SubjectDocument configuration
            modelBuilder.Entity<SubjectDocument>(entity =>
            {
                entity.ToTable("SubjectDocuments");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SubjectId, "IX_SubjectDocuments_SubjectId");
                entity.HasIndex(e => e.UserId, "IX_SubjectDocuments_UserId");
                entity.HasOne(d => d.Subject)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Subject configuration
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.ToTable("Subjects");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.FacultyId, "IX_Subjects_FacultyId");
                entity.HasOne(d => d.Faculty)
                    .WithMany()
                    .HasForeignKey(d => d.FacultyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SubjectSchedule configuration
            modelBuilder.Entity<SubjectSchedule>(entity =>
            {
                entity.ToTable("SubjectSchedules");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.RoomId, "IX_SubjectSchedules_RoomId");
                entity.HasIndex(e => new { e.SubjectTeachingId, e.StartDateTime, e.EndDateTime }, "IX_SubjectSchedules_SubjectTeachingId_StartDateTime_EndDateTime").IsUnique();
                entity.HasIndex(e => e.TeacherId, "IX_SubjectSchedules_TeacherId");
                entity.HasOne(d => d.Room)
                    .WithMany()
                    .HasForeignKey(d => d.RoomId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeaching)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Teacher)
                    .WithMany()
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // SubjectSpecialNote configuration
            modelBuilder.Entity<SubjectSpecialNote>(entity =>
            {
                entity.ToTable("SubjectSpecialNotes");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.CreatedById, "IX_SubjectSpecialNotes_CreatedById");
                entity.HasIndex(e => e.StudentId, "IX_SubjectSpecialNotes_StudentId");
                entity.HasIndex(e => e.SubjectId, "IX_SubjectSpecialNotes_SubjectId");
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Subject)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.CreatedBy)
                    .WithMany()
                    .HasForeignKey(d => d.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SubjectStudent configuration
            modelBuilder.Entity<SubjectStudent>(entity =>
            {
                entity.ToTable("SubjectStudents");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.StudentId, "IX_SubjectStudents_StudentId");
                entity.HasIndex(e => e.SubjectTeachingId, "IX_SubjectStudents_SubjectTeachingId");
                entity.HasOne(d => d.Student)
                    .WithMany()
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeaching)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SubjectTeachingExam configuration
            modelBuilder.Entity<SubjectTeachingExam>(entity =>
            {
                entity.ToTable("SubjectTeachingExams");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.QuestionSuiteId, "IX_SubjectTeachingExams_QuestionSuiteId");
                entity.HasIndex(e => e.RoomId, "IX_SubjectTeachingExams_RoomId");
                entity.HasIndex(e => e.SubjectTeachingId, "IX_SubjectTeachingExams_SubjectTeachingId");
                entity.HasIndex(e => e.TeacherId, "IX_SubjectTeachingExams_TeacherId");
                entity.HasOne(d => d.QuestionSuite)
                    .WithMany()
                    .HasForeignKey(d => d.QuestionSuiteId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Room)
                    .WithMany()
                    .HasForeignKey(d => d.RoomId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.SubjectTeaching)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Teacher)
                    .WithMany()
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // SubjectTeaching configuration
            modelBuilder.Entity<SubjectTeaching>(entity =>
            {
                entity.ToTable("SubjectTeachings");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.RoomIdDefault, "IX_SubjectTeachings_RoomIdDefault");
                entity.HasIndex(e => e.SubjectId, "IX_SubjectTeachings_SubjectId");
                entity.HasOne(d => d.RoomDefault)
                    .WithMany()
                    .HasForeignKey(d => d.RoomIdDefault)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Subject)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SubjectTeachingTeacher configuration
            modelBuilder.Entity<SubjectTeachingTeacher>(entity =>
            {
                entity.ToTable("SubjectTeachingTeachers");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SubjectTeachingId, "IX_SubjectTeachingTeachers_SubjectTeachingId");
                entity.HasIndex(e => e.TeacherId, "IX_SubjectTeachingTeachers_TeacherId");
                entity.HasOne(d => d.SubjectTeaching)
                    .WithMany()
                    .HasForeignKey(d => d.SubjectTeachingId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Teacher)
                    .WithMany()
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // TeacherFaculty configuration
            modelBuilder.Entity<TeacherFaculty>(entity =>
            {
                entity.ToTable("TeacherFaculties");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.FacultyId, "IX_TeacherFaculties_FacultyId");
                entity.HasIndex(e => e.UserId, "IX_TeacherFaculties_UserId");
                entity.HasOne(d => d.Faculty)
                    .WithMany()
                    .HasForeignKey(d => d.FacultyId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // UserAnnouncement configuration
            modelBuilder.Entity<UserAnnouncement>(entity =>
            {
                entity.ToTable("UserAnnouncements");
                entity.HasKey(e => e.Id);
            });

            // UserDevice configuration
            modelBuilder.Entity<UserDevice>(entity =>
            {
                entity.ToTable("UserDevices");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId, "IX_UserDevices_UserId");
                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserName).HasMaxLength(450);
                entity.Property(e => e.PasswordSalt).HasColumnType("bytea");
                entity.Property(e => e.FullName).HasMaxLength(450);
                entity.Property(e => e.UserInternalId).HasMaxLength(450);
                entity.Property(e => e.Mobile).HasMaxLength(450);
                entity.HasIndex(e => e.FullName, "IX_Users_FullName");
                entity.HasIndex(e => e.Mobile, "IX_Users_Mobile");
                entity.HasIndex(e => e.UserInternalId, "IX_Users_UserInternalId");
                entity.HasIndex(e => e.UserName, "IX_Users_UserName");
            });

        }
    }
}
