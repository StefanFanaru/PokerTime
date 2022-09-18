using PokerTime.Infrastructure.CQRS.Operations;

namespace PokerTime.Infrastructure.Queries.Cards;

public class PlayingCardsQuery : IRequest<IOperationResult<PlayingCardDto[]>>
{
}

public class PlayingCardDto
{
    public string Id { get; set; }
    public string Content { get; set; }
    public string Color { get; set; }
}