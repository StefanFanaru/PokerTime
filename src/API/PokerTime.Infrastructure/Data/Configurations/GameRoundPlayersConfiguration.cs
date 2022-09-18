using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.Configurations
{
    public class GameRoundPlayersConfiguration : IEntityTypeConfiguration<GameRoundPlayer>
    {
        public void Configure(EntityTypeBuilder<GameRoundPlayer> builder)
        {
            builder.Property(x => x.PlayerId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.RoundId).IsRequired().HasMaxLength(36);
            builder.HasKey(x => new { x.PlayerId, x.RoundId });

            builder.HasOne(x => x.Player)
                .WithMany(x => x.PlayedRounds)
                .HasForeignKey(x => x.PlayerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Round)
                .WithMany(x => x.Players)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.RoundId);
        }
    }
}