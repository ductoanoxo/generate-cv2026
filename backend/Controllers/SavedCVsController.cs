using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/saved-cvs")]
    [Authorize]
    public class SavedCVsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SavedCVsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();
            var cvs = await _context.SavedCVs.Where(cv => cv.UserId == userId)
                .OrderByDescending(cv => cv.UpdatedAt)
                .Select(cv => new { id = cv.Id, title = cv.Title, createdAt = cv.CreatedAt, updatedAt = cv.UpdatedAt })
                .ToListAsync();
            return Ok(cvs);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var cv = await FindOwnedCV(id);
            return cv == null ? NotFound() : Ok(new { id = cv.Id, title = cv.Title, content = cv.ContentJson, updatedAt = cv.UpdatedAt });
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] SaveCVRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();
            var now = DateTime.UtcNow;
            SavedCV? cv = request.Id.HasValue ? await FindOwnedCV(request.Id.Value) : null;
            if (request.Id.HasValue && cv == null) return NotFound();
            if (cv == null) {
                cv = new SavedCV { Id = Guid.NewGuid(), UserId = userId, CreatedAt = now };
                _context.SavedCVs.Add(cv);
            }
            cv.Title = string.IsNullOrWhiteSpace(request.Title) ? "CV chưa đặt tên" : request.Title.Trim();
            cv.ContentJson = request.ContentJson;
            cv.UpdatedAt = now;
            await _context.SaveChangesAsync();
            return Ok(new { id = cv.Id, title = cv.Title, updatedAt = cv.UpdatedAt });
        }

        private Guid GetUserId() => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;
        private async Task<SavedCV?> FindOwnedCV(Guid id) {
            var userId = GetUserId();
            return userId == Guid.Empty ? null : await _context.SavedCVs.FirstOrDefaultAsync(cv => cv.Id == id && cv.UserId == userId);
        }
    }

    public class SaveCVRequest { public Guid? Id { get; set; } public string? Title { get; set; } public string ContentJson { get; set; } = "{}"; }
}
