using System;
using System.Collections.Generic;

namespace backend.Data.Entities
{
    public class Room
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int NumberOfSeats { get; set; }
        public bool IsDeleted { get; set; }
    }
}
