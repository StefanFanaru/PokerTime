using System.Threading;
using System.Threading.Tasks;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameInsert;

public class GameInsertCommandHandler : IRequestHandler<GameInsertCommand, IOperationResult<GameInsertCommandResponse>>
{
    private readonly IRepository _repository;

    public GameInsertCommandHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<GameInsertCommandResponse>> Handle(GameInsertCommand request,
        CancellationToken cancellationToken)
    {
        var entity = new Game
        {
            GameTitle = request.GameTitle,
            IterationId = request.IterationId.ToString(),
            IterationName = request.IterationName,
            ProjectId = request.ProjectId.ToString(),
            ProjectName = request.ProjectName,
            TeamId = request.TeamId.ToString(),
            TeamName = request.TeamName,
            OwnerId = request.User.Id,
            OrganizationId = request.User.OrganizationId,
            Velocity = request.Velocity
        };

        await _repository.InsertAsync(entity);
        await _repository.SaveAsync(cancellationToken);

        return ResultBuilder.Ok(new GameInsertCommandResponse
        {
            GameId = entity.Id
        });
    }
}