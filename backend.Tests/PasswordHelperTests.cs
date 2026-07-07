using Xunit;
using backend.Helpers;

namespace backend.Tests
{
    public class PasswordHelperTests
    {
        [Fact]
        public void CreatePasswordHash_ShouldGenerateValidSaltAndHash()
        {
            // Arrange
            string password = "mySecurePassword123";

            // Act
            PasswordHelper.CreatePasswordHash(password, out string hash, out byte[] salt);

            // Assert
            Assert.NotNull(hash);
            Assert.NotEmpty(hash);
            Assert.NotNull(salt);
            Assert.True(salt.Length > 0);
        }

        [Fact]
        public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
        {
            // Arrange
            string password = "mySecurePassword123";
            PasswordHelper.CreatePasswordHash(password, out string hash, out byte[] salt);

            // Act
            bool result = PasswordHelper.VerifyPassword(password, hash, salt);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_WithIncorrectPassword_ShouldReturnFalse()
        {
            // Arrange
            string password = "mySecurePassword123";
            string wrongPassword = "wrongPassword123";
            PasswordHelper.CreatePasswordHash(password, out string hash, out byte[] salt);

            // Act
            bool result = PasswordHelper.VerifyPassword(wrongPassword, hash, salt);

            // Assert
            Assert.False(result);
        }
    }
}
