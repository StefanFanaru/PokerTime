using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameCommands.GamePauseToggle;

public class GamePauseToggleCommand : UserBasedCommand<Unit>
{
    [Required] public Guid GameId { get; set; }
    public bool IsPaused { get; set; }
}