using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GenerateCV.API.Middleware
{
    public class RoleAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;

        public RoleAuthorizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Custom middleware logic to verify user role integer claim from JWT
            var user = context.User;
            if (user.Identity?.IsAuthenticated == true)
            {
                var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
                if (int.TryParse(roleClaim, out int roleId))
                {
                    // Attach roleId to HttpContext Items for easier controller checking
                    context.Items["RoleId"] = roleId;
                }
            }

            await _next(context);
        }
    }
}
