using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.Configurations
{
    public class DataMigrationConfiguration : IEntityTypeConfiguration<DataMigration>
    {
        public void Configure(EntityTypeBuilder<DataMigration> builder)
        {
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        }
    }
}