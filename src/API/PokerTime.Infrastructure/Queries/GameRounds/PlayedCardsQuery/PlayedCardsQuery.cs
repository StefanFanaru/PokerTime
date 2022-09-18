using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Queries.GameRounds.PlayedCardsQuery;

public class PlayedCardsQuery : UserBasedQuery<List<PlayedCardsDto>>
{
    public PlayedCardsQuery(string roundId)
    {
        RoundId = roundId;
    }

    public string RoundId { get; set; }
}

public class PlayedCardsDto
{
    public string CardId { get; set; }
    public string PlayerId { get; set; }
    public string Content { get; set; }
    public string Color { get; set; }
}