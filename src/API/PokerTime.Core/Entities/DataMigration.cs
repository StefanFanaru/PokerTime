using System;
using System.Diagnostics.CodeAnalysis;

namespace PokerTime.Core.Entities
{
    [ExcludeFromCodeCoverage]
    public class DataMigration : Entity<string>
    {
        public DataMigration(string name, string type) : base(Guid.NewGuid().ToString())
        {
            Name = name;
            Type = type;
            InsertTime = DateTime.UtcNow;
        }

        public string Name { get; set; }
        public string Type { get; set; }
        public DateTime InsertTime { get; set; }
    }
}