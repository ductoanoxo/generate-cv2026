using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;
using backend.Data;
using backend.Data.Entities;
using backend.Helpers;
using backend.Services;

namespace backend.Tests
{
    public class AuthServiceTests
    {
        private AppDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        private IConfiguration GetMockConfiguration()
        {
            var myConfiguration = new Dictionary<string, string?>
            {
                { "Jwt:Key", "TEST_KEY_MUST_BE_AT_LEAST_32_CHARACTERS_LONG_12345" }
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnJwtToken()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var config = GetMockConfiguration();

            PasswordHelper.CreatePasswordHash("password123", out string hash, out byte[] salt);
            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "testuser",
                PasswordHash = hash,
                PasswordSalt = salt,
                FullName = "Test User",
                Role = 99,
                UserInternalId = "T01",
                IsActived = true,
                IsDeleted = false
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var service = new AuthService(context, config);

            // Act
            var token = await service.LoginAsync("testuser", "password123");

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidCredentials_ShouldReturnNull()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var config = GetMockConfiguration();

            PasswordHelper.CreatePasswordHash("password123", out string hash, out byte[] salt);
            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "testuser",
                PasswordHash = hash,
                PasswordSalt = salt,
                FullName = "Test User",
                Role = 99,
                UserInternalId = "T01",
                IsActived = true,
                IsDeleted = false
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var service = new AuthService(context, config);

            // Act
            var token = await service.LoginAsync("testuser", "wrongpassword");

            // Assert
            Assert.Null(token);
        }

        [Fact]
        public async Task GetCurrentUserAsync_WithValidId_ShouldReturnUserDetails()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var config = GetMockConfiguration();

            var userId = Guid.NewGuid();
            var user = new User
            {
                Id = userId,
                UserName = "testuser",
                PasswordHash = "hash",
                PasswordSalt = new byte[] { 1, 2, 3 },
                FullName = "Test User",
                Role = 50,
                UserInternalId = "T01",
                IsActived = true,
                IsDeleted = false
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var service = new AuthService(context, config);

            // Act
            var result = await service.GetCurrentUserAsync(userId.ToString());

            // Assert
            Assert.NotNull(result);

            // Verify properties via reflection/dynamic
            var usernameProp = result.GetType().GetProperty("Username")?.GetValue(result, null);
            var roleProp = result.GetType().GetProperty("Role")?.GetValue(result, null);

            Assert.Equal("testuser", usernameProp);
            Assert.Equal(50, roleProp);
        }
    }
}
