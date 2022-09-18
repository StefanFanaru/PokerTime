using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Queries.GameDetails;

public class GameDetailsQueryHandler : IRequestHandler<GameDetailsQuery, IOperationResult<GameDetailsQueryResult>>
{
    private readonly IRepository _repository;

    public GameDetailsQueryHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<GameDetailsQueryResult>> Handle(GameDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var firstRoundCreatedAt = await _repository.Query<GameRound>()
            .Where(x => x.GameId == request.GameId)
            .OrderBy(x => x.CreatedAt)
            .Select(x => x.CreatedAt as DateTime?)
            .FirstOrDefaultAsync(cancellationToken);

        var game = await _repository.Query<Game>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .Where(x => x.ProjectId == request.ProjectId)
            .Where(x => x.Id == request.GameId)
            .Select(x => new GameDetailsQueryResult
            {
                Id = x.Id,
                Status = x.Status,
                GameTitle = x.GameTitle,
                IsOwner = x.OwnerId == request.User.Id,
                IterationId = x.IterationId,
                IterationName = x.IterationName,
                TeamId = x.TeamId,
                TeamName = x.TeamName,
                ProjectId = x.ProjectId,
                ProjectName = x.ProjectName,
                Velocity = x.Velocity,
                EndedAt = x.EndedAt,
                StartedAt = firstRoundCreatedAt ?? DateTime.UtcNow,
                ActiveWorkItemId = x.ActiveWorkItemId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (game != null)
        {
            game.PlayedRoundsCount = await _repository.Query<GameRound>()
                .Where(x => x.GameId == request.GameId)
                .Where(x => x.CardsWereFlipped)
                .CountAsync(cancellationToken);
        }

        return game == null ? ResultBuilder.NotFound<GameDetailsQueryResult>() : ResultBuilder.Ok(game);
    }
}