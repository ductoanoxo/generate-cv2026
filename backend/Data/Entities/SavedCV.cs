using System;

namespace backend.Data.Entities
{
    public class SavedCV
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = "CV chưa đặt tên";
        public string ContentJson { get; set; } = "{}";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
