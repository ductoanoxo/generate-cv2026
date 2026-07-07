using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class SemesterPlan
    {
        public Guid Id { get; set; }
        public Guid AcademicYearId { get; set; }
        public Guid MajorId { get; set; }
        public int Semester { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public virtual AcademicYear AcademicYear { get; set; } = null!;
        public virtual Major Major { get; set; } = null!;
    }
}
