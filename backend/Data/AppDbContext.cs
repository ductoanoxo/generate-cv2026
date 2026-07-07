using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Stub DbSets matching the major tables in the schema
        // public DbSet<User> Users { get; set; }
        // public DbSet<Student> Students { get; set; }
        // public DbSet<Attendance> Attendances { get; set; }
        // public DbSet<ExamResult> ExamResults { get; set; }
        // public DbSet<SubjectTeaching> SubjectTeachings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Soft delete filters, primary keys, relationships configuration...
        }
    }
}
