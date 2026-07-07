using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace backend.Middleware
{
    public class RoleAuthorizationMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            var user = context.User;

            if (user.Identity?.IsAuthenticated == true)
            {
                var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;

                if (int.TryParse(roleClaim, out int roleId))
                {
                    // Check if roleId is valid (1, 2, 10, 20, 50, 99)
                    if (roleId == 1 || roleId == 2 || roleId == 10 || roleId == 20 || roleId == 50 || roleId == 99)
                    {
                        // Attach roleId to HttpContext Items for easier controller checking
                        context.Items["RoleId"] = roleId;
                    }
                    else
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new { message = "Tài khoản không có vai trò hợp lệ để truy cập hệ thống" });
                        return;
                    }
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new { message = "Không tìm thấy thông tin vai trò hợp lệ" });
                    return;
                }
            }

            await next(context);
        }
    }
}
