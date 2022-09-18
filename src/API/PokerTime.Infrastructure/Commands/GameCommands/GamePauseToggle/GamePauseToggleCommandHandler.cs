using System.Threading;
using System.Threading.Tasks;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameCommands.GamePauseToggle;

public class GamePauseToggleCommandHandler : IRequestHandler<GamePauseToggleCommand, IOperationResult<Unit>>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public GamePauseToggleCommandHandler(IRepository repository, IClientEventSender clientEventSender)
    {
        _repository = repository;
        _clientEventSender = clientEventSender;
    }

    public async Task<IOperationResult<Unit>> Handle(GamePauseToggleCommand request, CancellationToken cancellationToken)
    {
        var affected = await _repository.Query<Game>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .Where(x => x.OwnerId == request.User.Id)
            .Where(x => x.Id == request.GameId.ToString())
            .Where(x => !x.EndedAt.HasValue)
            .UpdateFromQueryAsync(x => new Game
            {
                Status = request.IsPaused ? GameStatus.Paused : GameStatus.Active
            }, cancellationToken);

        if (affected == 1)
        {
            await _clientEventSender.SendToAllInGame(new PauseToggledEvent
            {
                IsPaused = request.IsPaused
            }, request.GameId.ToString());
        }

        return affected == 0 ? ResultBuilder.NotFound() : ResultBuilder.Ok();
    }
}