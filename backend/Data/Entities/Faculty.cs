using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class Faculty
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public bool IsDeleted { get; set; }
    }
}
