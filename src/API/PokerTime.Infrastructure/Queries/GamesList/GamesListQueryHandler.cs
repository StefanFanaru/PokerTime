using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Queries.GamesList;

public class GamesListQueryHandler : IRequestHandler<GamesListQuery, IOperationResult<GamesListQueryResult>>
{
    private readonly IRepository _repository;

    public GamesListQueryHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<GamesListQueryResult>> Handle(GamesListQuery request, CancellationToken cancellationToken)
    {
        var games = await _repository.Query<Game>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .Where(x => x.ProjectId == request.ProjectId)
            .Select(x => new GameListDto
            {
                Id = x.Id,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                EndedAt = x.EndedAt,
                GameTitle = x.GameTitle,
                IsOwner = x.OwnerId == request.User.Id,
                IterationId = x.IterationId,
                IterationName = x.IterationName,
                TeamId = x.TeamId,
                TeamName = x.TeamName,
                Velocity = x.Velocity
            })
            .ToListAsync(cancellationToken);

        var response = new GamesListQueryResult
        {
            Active = games.Where(x => x.Status is GameStatus.Active or GameStatus.Paused).OrderByDescending(x => x.CreatedAt),
            Ended = games.Where(x => x.Status is GameStatus.Ended).OrderByDescending(x => x.EndedAt)
        };

        return ResultBuilder.Ok(response);
    }
}