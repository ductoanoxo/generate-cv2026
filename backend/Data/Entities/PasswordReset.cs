using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class PasswordReset
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreationDate { get; set; }
        public bool IsDeactive { get; set; }
    }
}
