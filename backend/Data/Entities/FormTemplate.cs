using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class FormTemplate
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? DocumentUrl { get; set; }
        public bool IsDeleted { get; set; }
    }
}
