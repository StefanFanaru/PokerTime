using System;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Queries.GameDetails;

public class GameDetailsQuery : UserBasedQuery<GameDetailsQueryResult>
{
    public string GameId { get; set; }
    public string ProjectId { get; set; }
}

public class GameDetailsQueryResult
{
    public string Id { get; set; }
    public string IterationId { get; set; }
    public string IterationName { get; set; }
    public string ProjectId { get; set; }
    public string ProjectName { get; set; }
    public string TeamId { get; set; }
    public string TeamName { get; set; }
    public string GameTitle { get; set; }
    public bool IsOwner { get; set; }
    public GameStatus Status { get; set; }
    public float? Velocity { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int? ActiveWorkItemId { get; set; }
    public int PlayedRoundsCount { get; set; }
}