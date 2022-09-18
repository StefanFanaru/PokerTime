using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.Configurations
{
    public class GameRoundConfiguration : IEntityTypeConfiguration<GameRound>
    {
        public void Configure(EntityTypeBuilder<GameRound> builder)
        {
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.GameId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.WorkItemId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(x => x.GameId);
            builder.HasIndex(x => x.WorkItemId);
        }
    }
}