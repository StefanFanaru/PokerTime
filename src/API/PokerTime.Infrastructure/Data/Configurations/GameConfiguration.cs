using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.Configurations
{
    public class GameConfiguration : IEntityTypeConfiguration<Game>
    {
        public void Configure(EntityTypeBuilder<Game> builder)
        {
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.IterationId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.TeamId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.OrganizationId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.ProjectId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.OwnerId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.IterationName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.ProjectName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.TeamName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.GameTitle).IsRequired().HasMaxLength(100);

            builder.HasIndex(x => x.OrganizationId);
            builder.HasIndex(x => x.ProjectId);
        }
    }
}