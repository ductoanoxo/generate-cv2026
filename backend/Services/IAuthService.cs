namespace GenerateCV.API.Services
{
    public interface IAuthService
    {
        Task<string?> LoginAsync(string username, string password);
        Task<object?> GetCurrentUserAsync(string userId);
    }
}
