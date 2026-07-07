using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class AcademicYear
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
