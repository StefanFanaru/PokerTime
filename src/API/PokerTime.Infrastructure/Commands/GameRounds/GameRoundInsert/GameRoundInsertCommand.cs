using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameRounds.GameRoundInsert;

public class GameRoundInsertCommand : UserBasedCommand<GameRoundInsertCommandResponse>
{
    [Required] public Guid GameId { get; set; }
    [Required] public int WorkItemId { get; set; }
}

public class GameRoundInsertCommandResponse
{
    public string RoundId { get; set; }
    public float? SubmittedStoryPoints { get; set; }
    public bool CardsWereFlipped { get; set; }
    public int WorkItemId { get; set; }
    public IEnumerable<string> ActivePlayersIds { get; set; }
}