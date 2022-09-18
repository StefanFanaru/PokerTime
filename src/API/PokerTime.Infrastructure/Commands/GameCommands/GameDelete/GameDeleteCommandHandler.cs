using System.Threading;
using System.Threading.Tasks;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameDelete;

public class GameDeleteCommandHandler : IRequestHandler<GameDeleteCommand, IOperationResult<Unit>>
{
    private readonly IRepository _repository;

    public GameDeleteCommandHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<Unit>> Handle(GameDeleteCommand request, CancellationToken cancellationToken)
    {
        var affected = await _repository.Query<Game>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .Where(x => x.OwnerId == request.User.Id)
            .Where(x => x.Id == request.GameId.ToString())
            .DeleteFromQueryAsync(cancellationToken);

        return affected == 0 ? ResultBuilder.NotFound() : ResultBuilder.Ok();
    }
}