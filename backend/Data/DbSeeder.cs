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
                new { Username = "deankhoa", FullName = "TS. Trần Minh Khoa", Role = 50, InternalId = "DK50" },
                new { Username = "tbm_cntt", FullName = "ThS. Nguyễn Thị Trưởng", Role = 20, InternalId = "TBM20" },
                new { Username = "gv_nam", FullName = "ThS. Lê Hoàng Nam", Role = 10, InternalId = "GV10" },
                new { Username = "sv_toan", FullName = "Đặng Đức Toàn", Role = 1, InternalId = "SV01" }
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
            }

            if (changed)
            {
                context.SaveChanges();
                Console.WriteLine("Database seeded successfully with missing test accounts.");
            }
        }
    }
}
