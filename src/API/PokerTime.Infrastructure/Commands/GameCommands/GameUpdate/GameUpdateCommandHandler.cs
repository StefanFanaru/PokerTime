using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameUpdate;

public class GameUpdateCommandHandler : IRequestHandler<GameUpdateCommand, IOperationResult<Unit>>
{
    private readonly IRepository _repository;

    public GameUpdateCommandHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<Unit>> Handle(GameUpdateCommand request, CancellationToken cancellationToken)
    {
        var query = _repository.Query<Game>()
            .Where(x => x.Id == request.GameId)
            .Where(x => x.OwnerId == request.User.Id);

        await _repository.ExecuteTransactionalAsync(async () =>
        {
            var current = await query
                .Select(x => new { x.TeamId, x.IterationId })
                .FirstOrDefaultAsync(cancellationToken);

            if (current == null)
            {
                return;
            }

            await query
                .UpdateFromQueryAsync(x => new Game
                {
                    GameTitle = request.GameTitle,
                    IterationId = request.IterationId.ToString(),
                    IterationName = request.IterationName,
                    TeamId = request.TeamId.ToString(),
                    TeamName = request.TeamName,
                    Velocity = request.Velocity
                }, cancellationToken);

            if (current.TeamId != request.TeamId.ToString() || current.IterationId != request.IterationId.ToString())
            {
                await _repository.Query<GameRound>()
                    .Where(x => x.GameId == request.GameId)
                    .DeleteFromQueryAsync(cancellationToken);
            }
        });

        return ResultBuilder.Ok();
    }
}