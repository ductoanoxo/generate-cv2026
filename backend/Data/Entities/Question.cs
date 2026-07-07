using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class Question
    {
        public Guid Id { get; set; }
        public Guid QuestionSuiteId { get; set; }
        public string QuestionText { get; set; } = null!;
        public int Level { get; set; }
        public string? ImageUrl { get; set; }
        public virtual QuestionSuite QuestionSuite { get; set; } = null!;
    }
}
