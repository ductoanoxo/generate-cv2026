using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class FormRequest
    {
        public Guid Id { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime UpdateDate { get; set; }
        public Guid StudentId { get; set; }
        public Guid? FormTemplateId { get; set; }
        public Guid? ApprovalId { get; set; }
        public string ApprovalName { get; set; } = null!;
        public string Note { get; set; } = null!;
        public int Status { get; set; }
        public bool IsDeleted { get; set; }
        public virtual FormTemplate? FormTemplate { get; set; }
        public virtual Student Student { get; set; } = null!;
        public virtual User? Approval { get; set; }
    }
}
