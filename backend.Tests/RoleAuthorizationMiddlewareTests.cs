using System.IO;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Xunit;
using backend.Middleware;

namespace backend.Tests
{
    public class RoleAuthorizationMiddlewareTests
    {
        [Fact]
        public async Task InvokeAsync_UnauthenticatedRequest_ShouldPassThrough()
        {
            // Arrange
            var context = new DefaultHttpContext();
            context.User = new ClaimsPrincipal(new ClaimsIdentity()); // IsAuthenticated = false

            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new RoleAuthorizationMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.True(nextCalled);
            Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(10)]
        [InlineData(20)]
        [InlineData(50)]
        [InlineData(99)]
        public async Task InvokeAsync_AuthenticatedWithValidRole_ShouldPassAndAttachRoleId(int validRole)
        {
            // Arrange
            var context = new DefaultHttpContext();
            var claims = new[] { new Claim(ClaimTypes.Role, validRole.ToString()) };
            var identity = new ClaimsIdentity(claims, "TestAuth"); // marking IsAuthenticated = true
            context.User = new ClaimsPrincipal(identity);

            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new RoleAuthorizationMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.True(nextCalled);
            Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
            Assert.Equal(validRole, context.Items["RoleId"]);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(5)]
        [InlineData(100)]
        public async Task InvokeAsync_AuthenticatedWithInvalidRole_ShouldBlockWith403(int invalidRole)
        {
            // Arrange
            var context = new DefaultHttpContext();
            // Need a memory stream for Response.Body because WriteAsJsonAsync writes to it
            context.Response.Body = new MemoryStream();

            var claims = new[] { new Claim(ClaimTypes.Role, invalidRole.ToString()) };
            var identity = new ClaimsIdentity(claims, "TestAuth"); // marking IsAuthenticated = true
            context.User = new ClaimsPrincipal(identity);

            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new RoleAuthorizationMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.False(nextCalled);
            Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
            
            // Read response body
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(context.Response.Body);
            var responseText = await reader.ReadToEndAsync();
            
            Assert.Contains("Tài khoản không có vai trò hợp lệ", responseText);
        }

        [Fact]
        public async Task InvokeAsync_AuthenticatedWithoutRoleClaim_ShouldBlockWith403()
        {
            // Arrange
            var context = new DefaultHttpContext();
            context.Response.Body = new MemoryStream();

            var identity = new ClaimsIdentity(new Claim[] { }, "TestAuth"); // marking IsAuthenticated = true
            context.User = new ClaimsPrincipal(identity);

            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new RoleAuthorizationMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.False(nextCalled);
            Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
        }
    }
}
