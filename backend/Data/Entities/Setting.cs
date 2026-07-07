using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class Setting
    {
        public Guid Id { get; set; }
        public string Key { get; set; } = null!;
        public string Value { get; set; } = null!;
        public bool IsDeleted { get; set; }
    }
}
