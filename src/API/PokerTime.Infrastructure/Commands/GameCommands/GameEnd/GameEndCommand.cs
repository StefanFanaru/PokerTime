using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameEnd;

public class GameEndCommand : UserBasedCommand<Unit>
{
    [Required] public Guid GameId { get; set; }
}