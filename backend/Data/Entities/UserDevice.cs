using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class UserDevice
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int UserRole { get; set; }
        public int DeviceType { get; set; }
        public string Identifier { get; set; } = null!;
        public string PushId { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
