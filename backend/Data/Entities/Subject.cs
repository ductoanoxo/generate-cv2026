using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class Subject
    {
        public Guid Id { get; set; }
        public Guid? FacultyId { get; set; }
        public string SubjectCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int CreditPoint { get; set; }
        public int? TotalHours { get; set; }
        public string Note { get; set; } = null!;
        public bool IsActived { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Faculty? Faculty { get; set; }
    }
}
