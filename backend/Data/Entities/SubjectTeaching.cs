using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class SubjectTeaching
    {
        public Guid Id { get; set; }
        public Guid SubjectId { get; set; }
        public string Name { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalSessions { get; set; }
        public Guid? RoomIdDefault { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Room? RoomDefault { get; set; }
        public virtual Subject Subject { get; set; } = null!;
    }
}
