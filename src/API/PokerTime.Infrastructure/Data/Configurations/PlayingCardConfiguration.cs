using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.Configurations
{
    public class PlayingCardConfiguration : IEntityTypeConfiguration<PlayingCard>
    {
        public void Configure(EntityTypeBuilder<PlayingCard> builder)
        {
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.Content).IsRequired().HasMaxLength(10);
        }
    }
}