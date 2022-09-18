using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameInsert;

public class GameInsertCommand : UserBasedCommand<GameInsertCommandResponse>
{
    [Required] public Guid IterationId { get; set; }

    [Required] [MaxLength(100)] public string IterationName { get; set; }

    [Required] public Guid TeamId { get; set; }

    [Required] [MaxLength(100)] public string TeamName { get; set; }

    [Required] public Guid ProjectId { get; set; }

    [Required] [MaxLength(100)] public string ProjectName { get; set; }

    [Required] [MaxLength(100)] public string GameTitle { get; set; }

    public float? Velocity { get; set; }
}

public class GameInsertCommandResponse
{
    public string GameId { get; set; }
}