using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class EvaluationCriteria
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Type { get; set; }
        public decimal Score { get; set; }
        public Guid? ParentId { get; set; }
        public Guid? QuestionId { get; set; }
        public virtual EvaluationCriteria? Parent { get; set; }
        public virtual Question? Question { get; set; }
    }
}
