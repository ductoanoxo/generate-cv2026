using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class ExamAttempt
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public Guid SubjectTeachingExamId { get; set; }
        public DateTime? DraftDate { get; set; }
        public DateTime? SubmitDate { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Student Student { get; set; } = null!;
        public virtual SubjectTeachingExam SubjectTeachingExam { get; set; } = null!;
    }
}
