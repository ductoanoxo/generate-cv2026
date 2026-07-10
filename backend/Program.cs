using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using backend.Services;
using backend.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DB Context with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Register DI Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
builder.Services.AddScoped<IFacultyDashboardService, FacultyDashboardService>();
builder.Services.AddScoped<IDepartmentDashboardService, DepartmentDashboardService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<ITeacherDashboardService, TeacherDashboardService>();
builder.Services.AddScoped<IStudentDashboardService, StudentDashboardService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IReportService, ReportService>();

// 4. Configure Controllers
builder.Services.AddControllers();

// 5. Configure JWT Authentication (Stub setup)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YOUR_VERY_SECRET_KEY_HERE_123456789"))
        };
    });

// 6. Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();

// Custom role verification middleware (must run after Authentication)
app.UseMiddleware<RoleAuthorizationMiddleware>();

app.UseAuthorization();

app.MapControllers();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        backend.Data.DbSeeder.Seed(context);

        // Debug query to print SemesterPlans and AcademicYears
        Console.WriteLine("========================================");
        Console.WriteLine("DEBUG: SEMESTER PLANS & ACADEMIC YEARS:");
        
        var list = context.SemesterPlans
            .Include(sp => sp.AcademicYear)
            .Where(sp => !sp.IsDeleted)
            .OrderBy(sp => sp.AcademicYear.Name)
            .ThenBy(sp => sp.Semester)
            .Select(sp => new
            {
                sp.Semester,
                AcademicYearName = sp.AcademicYear.Name,
                AcademicYearStart = sp.AcademicYear.StartDate,
                AcademicYearEnd = sp.AcademicYear.EndDate,
                SemesterStart = sp.StartDate,
                SemesterEnd = sp.EndDate,
                sp.IsActive
            })
            .Distinct()
            .ToList();

        foreach (var item in list)
        {
            Console.WriteLine($"- AcademicYear: {item.AcademicYearName} (Dates: {item.AcademicYearStart:yyyy-MM-dd} to {item.AcademicYearEnd:yyyy-MM-dd}) | Semester: {item.Semester} (Dates: {item.SemesterStart:yyyy-MM-dd} to {item.SemesterEnd:yyyy-MM-dd})");
        }
        Console.WriteLine("========================================");

        var examNames = context.SubjectTeachingExams
            .Select(e => e.Name)
            .Distinct()
            .ToList();
        Console.WriteLine("========================================");
        Console.WriteLine("DEBUG: DISTINCT EXAM NAMES:");
        foreach (var name in examNames)
        {
            Console.WriteLine($"- Exam Name: '{name}'");
        }
        Console.WriteLine("========================================");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

app.Run();
