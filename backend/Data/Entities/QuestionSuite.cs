using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class QuestionSuite
    {
        public Guid Id { get; set; }
        public Guid SubjectId { get; set; }
        public string Name { get; set; } = null!;
        public Guid? UpdatedById { get; set; }
        public DateTime CreationTime { get; set; }
        public virtual Subject Subject { get; set; } = null!;
        public virtual User? UpdatedBy { get; set; }
    }
}
