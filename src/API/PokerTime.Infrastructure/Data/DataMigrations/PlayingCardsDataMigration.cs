using PokerTime.Infrastructure.Common;
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
        var cards = DefaultPlayingCards.List();

        _repository.InsertRangeAsync(cards).Wait();
        _repository.Save();
    }
}