namespace backend.Services
{
    public class AuthService : IAuthService
    {
        public Task<string?> LoginAsync(string username, string password)
        {
            // Mock authentication token generation
            if (username == "admin" || username == "sv_toan")
            {
                return Task.FromResult<string?>("mock-jwt-token-xyz");
            }
            return Task.FromResult<string?>(null);
        }

        public Task<object?> GetCurrentUserAsync(string userId)
        {
            return Task.FromResult<object?>(new { UserId = userId, Username = "admin", Role = 99 });
        }
    }
}
