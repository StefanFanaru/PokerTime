using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.Configurations
{
    public class PlayedCardConfiguration : IEntityTypeConfiguration<PlayedCard>
    {
        public void Configure(EntityTypeBuilder<PlayedCard> builder)
        {
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.RoundId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.PlayerId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.PlayingCardId).IsRequired().HasMaxLength(36);
            builder.Property(x => x.PlayedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");


            builder.HasOne(x => x.Round)
                .WithMany(x => x.PlayedCards)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Player)
                .WithMany(x => x.PlayedCards)
                .HasForeignKey(x => x.PlayerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.RoundId);
        }
    }
}