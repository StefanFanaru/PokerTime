using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameDelete;

public class GameDeleteCommand : UserBasedCommand<Unit>
{
    [Required] public Guid GameId { get; set; }
}