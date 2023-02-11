using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Common;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.ClientEvents.Handlers;

[ClientEventType(nameof(ClientEventType.ShouldRefreshGame))]
public class ShouldRefreshGameEventHandler : IClientEventHandler<ShouldRefreshGameEvent>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public ShouldRefreshGameEventHandler(IClientEventSender clientEventSender, IRepository repository)
    {
        _clientEventSender = clientEventSender;
        _repository = repository;
    }

    public async Task Handle(string playerId, ShouldRefreshGameEvent payload)
    {
        var game = await _repository.Query<Game>()
            .Where(x => x.Id == payload.GameId && x.Status != GameStatus.Ended)
            .Where(x => x.OwnerId == playerId || x.Rounds.Any(r => r.Players.Any(p => p.PlayerId == playerId)))
            .Select(x => new { x.OwnerId })
            .FirstOrDefaultAsync();

        if (game == null)
        {
            return;
        }

        if (game.OwnerId == playerId)
        {
            await _clientEventSender.SendToAllInGame(payload, payload.GameId);
            return;
        }

        await _clientEventSender.SendToUserAsync(payload, playerId, payload.GameId);
    }
}