using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameRounds.GameRoundSetStoryPoints;

public class GameRoundSetStoryPointsCommand : UserBasedCommand<Unit>
{
    [Required] public string RoundId { get; set; }
    [Required] public string GameId { get; set; }
    [Required] public int SubmittedStoryPoints { get; set; }
}