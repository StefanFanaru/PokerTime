using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Queries.GameRounds.PlayedCardQuery;

public class PlayedCardQuery : UserBasedQuery<PlayedCardDto>
{
    public PlayedCardQuery(string roundId)
    {
        RoundId = roundId;
    }

    public string RoundId { get; set; }
}

public class PlayedCardDto
{
    public string CardId { get; set; }
}