using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Data.DataMigrations;

public class PlayingCardsDataMigration : IDataMigration
{
    private readonly IRepository _repository;

    public PlayingCardsDataMigration(IRepository repository)
    {
        _repository = repository;
    }

    public void Migrate()
    {
        var cards = new[]
        {
            new PlayingCard("0", "#354e4f", 0),
            new PlayingCard("1", "#354e4f", 1),
            new PlayingCard("2", "#354e4f", 2),
            new PlayingCard("3", "#1c3d3d", 3),
            new PlayingCard("5", "#354e4f", 4),
            new PlayingCard("8", "#354e4f", 5),
            new PlayingCard("13", "#354e4f", 6),
            new PlayingCard("21", "#6a3624", 7),
            new PlayingCard("34", "#6a3624", 8),
            new PlayingCard("55", "#6a3624", 9),
            new PlayingCard("89", "#6a3624", 10),
            new PlayingCard("?", "#78604b", 11),
            new PlayingCard("☕", "#78604b", 12)
        };

        _repository.InsertRangeAsync(cards).Wait();
        _repository.Save();
    }
}