using System;
using System.Linq;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using backend.Data.Entities;
using backend.Helpers;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            var databaseCreator = context.Database.GetService<IDatabaseCreator>() as RelationalDatabaseCreator;
            if (databaseCreator != null)
            {
                bool tablesExist = false;
                try
                {
                    // Check if the Users table exists and is readable
                    _ = context.Users.Any();
                    tablesExist = true;
                }
                catch (Exception)
                {
                    // If it throws an exception (like 42P01 relation does not exist), tables do not exist
                    tablesExist = false;
                }

                if (!tablesExist)
                {
                    Console.WriteLine("Users table does not exist. Creating tables defined in DbContext...");
                    databaseCreator.CreateTables();
                    Console.WriteLine("Database tables created successfully using RelationalDatabaseCreator.");
                }
            }

            var testUsers = new[]
            {
                new { Username = "admin", FullName = "Nguyễn Văn Quản Trị", Role = 99, InternalId = "AD99" },
                new { Username = "admin1", FullName = "Nguyễn Văn Quản Trị", Role = 99, InternalId = "AD991" },
                new { Username = "deankhoa", FullName = "TS. Trần Minh Khoa", Role = 50, InternalId = "DK50" },
                new { Username = "tbm_cntt", FullName = "ThS. Nguyễn Thị Trưởng", Role = 20, InternalId = "TBM20" },
                new { Username = "gv_nam", FullName = "ThS. Lê Hoàng Nam", Role = 10, InternalId = "GV10" },
                new { Username = "giaovien1", FullName = "Giảng viên Khoa Cơ sở dữ liệu", Role = 50, InternalId = "GVDB1" },
                new { Username = "giaovien47", FullName = "Trưởng Bộ Môn CNTT", Role = 20, InternalId = "GV000047" },
                new { Username = "giaovien2", FullName = "Giảng viên bộ môn", Role = 10, InternalId = "GVDB2" },
                new { Username = "sv_toan", FullName = "Đặng Đức Toàn", Role = 1, InternalId = "SV01" },
                new { Username = "sinhvien1", FullName = "Sinh viên thử nghiệm", Role = 1, InternalId = "SVDB1" }
                , new { Username = "sinhvien246", FullName = "Sinh viên 246", Role = 1, InternalId = "SV000246" }
                , new { Username = "sinhvien194", FullName = "Sinh viên 194", Role = 1, InternalId = "SV000194" }
            };

            bool changed = false;
            foreach (var userDef in testUsers)
            {
                var exists = context.Users.Any(u => u.UserName.ToLower() == userDef.Username.ToLower());
                if (!exists)
                {
                    // Create password hash using "admin" for admin, and "password123" for other users to match frontend quick login buttons
                    string seedPassword = userDef.Username == "admin" ? "admin" : "password123";
                    PasswordHelper.CreatePasswordHash(seedPassword, out string hash, out byte[] salt);
                    // PasswordHelper.CreatePasswordHash(userDef.Username, out string hash, out byte[] salt);

                    var user = new User
                    {
                        Id = Guid.NewGuid(),
                        UserName = userDef.Username,
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        FullName = userDef.FullName,
                        Role = userDef.Role,
                        UserInternalId = userDef.InternalId,
                        IsActived = true,
                        IsDeleted = false
                    };

                    context.Users.Add(user);
                    changed = true;
                    Console.WriteLine($"Seeding test account: {userDef.Username}");
                }
                else
                {
                    // Keep the documented local/demo credentials usable after a previous
                    // seed or password-helper change. Only these known test accounts are
                    // synchronized; real users are never modified.
                    var existingUser = context.Users.First(u => u.UserName.ToLower() == userDef.Username.ToLower());
                    string seedPassword = userDef.Username == "admin" ? "admin" : "password123";
                    if (existingUser.PasswordSalt == null || string.IsNullOrWhiteSpace(existingUser.PasswordHash) ||
                        !PasswordHelper.VerifyPassword(seedPassword, existingUser.PasswordHash, existingUser.PasswordSalt))
                    {
                        PasswordHelper.CreatePasswordHash(seedPassword, out string hash, out byte[] salt);
                        existingUser.PasswordHash = hash;
                        existingUser.PasswordSalt = salt;
                        existingUser.IsActived = true;
                        existingUser.IsDeleted = false;
                        changed = true;
                        Console.WriteLine($"Synchronized test account password: {userDef.Username}");
                    }
                }
            }

            if (changed)
            {
                context.SaveChanges();
                Console.WriteLine("Database seeded successfully with missing test accounts.");
            }
        }
    }
}
