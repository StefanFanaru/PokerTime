using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameRounds.GameRoundInsert;

public class GameRoundInsertCommandHandler : IRequestHandler<GameRoundInsertCommand, IOperationResult<
    GameRoundInsertCommandResponse>>
{
    private readonly IRepository _repository;
    private readonly ISignalRConnectionManager _signalRConnectionManager;

    public GameRoundInsertCommandHandler(IRepository repository, ISignalRConnectionManager signalRConnectionManager)
    {
        _repository = repository;
        _signalRConnectionManager = signalRConnectionManager;
    }

    public async Task<IOperationResult<GameRoundInsertCommandResponse>> Handle(GameRoundInsertCommand request,
        CancellationToken cancellationToken)
    {
        var query = _repository.Query<GameRound>()
            .Where(x => x.GameId == request.GameId.ToString())
            .Where(x => x.WorkItemId == request.WorkItemId);
        var roundId = await _repository.Query<GameRound>()
            .Where(x => x.GameId == request.GameId.ToString())
            .Where(x => x.WorkItemId == request.WorkItemId)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);
        var gamePlayersIds = await _repository.Query<GameRoundPlayer>()
            .Where(r => r.Round.GameId == request.GameId.ToString())
            .Where(x => x.Round.Game.Status != GameStatus.Ended)
            .Select(x => x.PlayerId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var activePlayersIds = gamePlayersIds
            .Where(x => _signalRConnectionManager.IsUserConnectedToGame(x, request.GameId.ToString())).ToList();

        if (!string.IsNullOrWhiteSpace(roundId))
        {
            if (!await query.AnyAsync(x => x.Players.Any(p => p.PlayerId == request.User.Id), cancellationToken))
            {
                await InsertRoundPlayer(roundId, request.User.Id);
            }

            if (!activePlayersIds.Contains(request.User.Id))
            {
                activePlayersIds.Add(request.User.Id);
            }

            var result = await query.Select(x => new GameRoundInsertCommandResponse
            {
                RoundId = x.Id,
                CardsWereFlipped = x.CardsWereFlipped,
                SubmittedStoryPoints = x.SubmittedStoryPoints,
                WorkItemId = x.WorkItemId,
                ActivePlayersIds = activePlayersIds
            }).SingleAsync(cancellationToken);
            return ResultBuilder.Ok(result);
        }

        var gameRound = new GameRound(request.GameId.ToString(), request.WorkItemId);
        _repository.Insert(gameRound);
        await _repository.SaveAsync(cancellationToken);
        await InsertRoundPlayer(gameRound.Id, request.User.Id);

        return ResultBuilder.Ok(new GameRoundInsertCommandResponse
        {
            RoundId = gameRound.Id,
            WorkItemId = gameRound.WorkItemId,
            ActivePlayersIds = activePlayersIds
        });
    }

    private async Task InsertRoundPlayer(string roundId, string playerId)
    {
        var player = new GameRoundPlayer(roundId, playerId);
        _repository.Insert(player);
        await _repository.SaveAsync();
    }
}