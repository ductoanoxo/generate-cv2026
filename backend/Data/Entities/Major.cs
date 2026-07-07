using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class Major
    {
        public Guid Id { get; set; }
        public Guid? FacultyId { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public int TrainingType { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Faculty? Faculty { get; set; }
    }
}
