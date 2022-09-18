using System;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Queries.GamesList;

public class GamesListQuery : UserBasedQuery<GamesListQueryResult>
{
    public string ProjectId { get; set; }
}

public class GamesListQueryResult
{
    public IEnumerable<GameListDto> Active { get; set; }
    public IEnumerable<GameListDto> Ended { get; set; }
}

public class GameListDto
{
    public string Id { get; set; }
    public string IterationId { get; set; }
    public string IterationName { get; set; }
    public string TeamId { get; set; }
    public string TeamName { get; set; }
    public string GameTitle { get; set; }
    public bool IsOwner { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public GameStatus Status { get; set; }
    public float? Velocity { get; set; }
}