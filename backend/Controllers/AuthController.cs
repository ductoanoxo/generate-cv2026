using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Dữ liệu yêu cầu không hợp lệ" });
            }

            var token = await authService.LoginAsync(request.Username, request.Password);
            if (token == null)
            {
                return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu" });
            }
            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính người dùng từ token" });
            }

            var userDetails = await authService.GetCurrentUserAsync(userId);
            if (userDetails == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            return Ok(userDetails);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
