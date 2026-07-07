using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class TeacherFaculty
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid FacultyId { get; set; }
        public bool IsHeadOfFaculty { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Faculty Faculty { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
