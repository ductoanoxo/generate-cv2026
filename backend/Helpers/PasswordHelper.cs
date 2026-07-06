using System.Security.Cryptography;
using System.Text;

namespace GenerateCV.API.Helpers
{
    public static class PasswordHelper
    {
        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            // WARNING: Stub logic - Replace with the actual PBKDF2 / Bcrypt / HMACSHA512 verification logic
            // matching the existing database hash system.
            using (var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(storedSalt)))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                var computedHashStr = Convert.ToBase64String(computedHash);
                return computedHashStr == storedHash;
            }
        }
    }
}
