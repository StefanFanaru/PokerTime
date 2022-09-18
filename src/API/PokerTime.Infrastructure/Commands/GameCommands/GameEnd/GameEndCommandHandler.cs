using System;
using System.Threading;
using System.Threading.Tasks;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameCommands.GameEnd;

public class GameEndCommandHandler : IRequestHandler<GameEndCommand, IOperationResult<Unit>>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public GameEndCommandHandler(IRepository repository, IClientEventSender clientEventSender)
    {
        _repository = repository;
        _clientEventSender = clientEventSender;
    }

    public async Task<IOperationResult<Unit>> Handle(GameEndCommand request, CancellationToken cancellationToken)
    {
        await _clientEventSender.SendToAllInGame(new GameEndedEvent(), request.GameId.ToString());

        var affected = await _repository.Query<Game>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .Where(x => x.OwnerId == request.User.Id)
            .Where(x => x.Id == request.GameId.ToString())
            .Where(x => !x.EndedAt.HasValue)
            .UpdateFromQueryAsync(x => new Game
            {
                EndedAt = DateTime.UtcNow,
                Status = GameStatus.Ended,
                ActiveWorkItemId = null
            }, cancellationToken);

        return affected == 0 ? ResultBuilder.NotFound() : ResultBuilder.Ok();
    }
}