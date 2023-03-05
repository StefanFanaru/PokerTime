using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Queries.Cards;

public class PlayingCardsQuery : UserBasedQuery<PlayingCardDto[]>
{
}

public class PlayingCardDto
{
    public string Id { get; set; }
    public string Content { get; set; }
    public string Color { get; set; }
}