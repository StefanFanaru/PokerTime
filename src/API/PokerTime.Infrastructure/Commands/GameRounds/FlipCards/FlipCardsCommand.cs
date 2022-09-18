using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameRounds.FlipCards;

public class FlipCardsCommand : UserBasedCommand<List<PlayedCardDto>>
{
    public FlipCardsCommand(string roundId)
    {
        RoundId = roundId;
    }

    [Required] public string GameId { get; set; }
    [Required] public string RoundId { get; set; }
}

public class PlayedCardDto
{
    public string PlayerId { get; set; }
    public string CardId { get; set; }
    public string Content { get; set; }
    public string Color { get; set; }
}