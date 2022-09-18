using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameRounds.GameRoundSetStoryPoints;

public class GameRoundSetStoryPointsHandler : IRequestHandler<GameRoundSetStoryPointsCommand, IOperationResult<Unit>>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public GameRoundSetStoryPointsHandler(IRepository repository, IClientEventSender clientEventSender)
    {
        _repository = repository;
        _clientEventSender = clientEventSender;
    }

    public async Task<IOperationResult<Unit>> Handle(GameRoundSetStoryPointsCommand request,
        CancellationToken cancellationToken)
    {
        var gameRound = await _repository.Query<GameRound>()
            .Where(x => x.Id == request.RoundId && x.GameId == request.GameId)
            .FirstOrDefaultAsync(cancellationToken);

        if (gameRound == null)
        {
            return ResultBuilder.NotFound();
        }

        gameRound.SubmittedStoryPoints = request.SubmittedStoryPoints;

        await _clientEventSender.SendToAllInGame(new RoundStoryPointsSetEvent
        {
            SubmittedStoryPoints = request.SubmittedStoryPoints,
            WorkItemId = gameRound.WorkItemId
        }, request.GameId);

        return ResultBuilder.Ok();
    }
}