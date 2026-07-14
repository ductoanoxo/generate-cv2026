using System;
using System.Security.Cryptography;
using System.Text;

namespace backend.Helpers
{
    public static class PasswordHelper
    {
        public static void CreatePasswordHash(string password, out string passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
            }
        }

        public static bool VerifyPassword(string password, string storedHash, byte[] storedSalt)
        {
            if (storedSalt == null) throw new ArgumentNullException(nameof(storedSalt));
            if (storedHash == null) throw new ArgumentNullException(nameof(storedHash));

            using (var hmac = new HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                var computedHashStr = Convert.ToBase64String(computedHash);
                return computedHashStr == storedHash;
            }
        }
    }
}
