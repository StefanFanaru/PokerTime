using System.Reflection;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data;

public class PokerTimeContext : DbContext
{
    public PokerTimeContext(DbContextOptions<PokerTimeContext> options)
        : base(options)
    {
    }

    public DbSet<DataMigration> DataMigrations { get; set; }
    public DbSet<Player> Players { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<GameRound> GameRounds { get; set; }
    public DbSet<GameRoundPlayer> GameRoundPlayers { get; set; }
    public DbSet<PlayedCard> PlayedCards { get; set; }
    public DbSet<PlayingCard> PlayingCards { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("poker-time");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}